/**
 * Fable Agent Execution Engine (Runner)
 * PRD: RUN-01 through RUN-07, TOOL-07 through TOOL-10, EXEC-01, EXEC-02, EXEC-07
 * 
 * Responsibilities:
 * - Orchestrates the multi-turn model <-> tool execution loop.
 * - Enforces server-side turn limits (max 3 turns), timeouts, and safe error boundaries.
 * - Validates tool permissions before every tool call (TOOL-08).
 * - Persists execution history with immutable agent snapshots (EXEC-01, EXEC-02, AGENT-05).
 * - Never executes arbitrary code; never disguises tool failures as success.
 */

import { Execution } from '../models/Execution.js';
import { executeModelCompletion, AiServiceError } from './aiService.js';
import { getToolSchemasForAgent, executeTool, validateAgentToolAccess } from './toolService.js';

export class AgentRunnerError extends Error {
  constructor(message, code = 'RUNNER_ERROR', details = null) {
    super(message);
    this.name = 'AgentRunnerError';
    this.code = code;
    this.details = details;
  }
}

/**
 * Executes an agent with user input (standalone task or interactive chat turn)
 * 
 * @param {object} params
 * @param {object} params.agent - The Mongoose Agent document
 * @param {object} params.user - The authenticated User document
 * @param {string} params.input - User input text / task description
 * @param {string} [params.mode='task'] - 'task' | 'chat'
 * @param {Array} [params.history=[]] - Optional previous conversation turns for chat mode
 * @returns {Promise<object>} The completed Execution document and summary
 */
export const runAgent = async ({
  agent,
  user,
  input,
  mode = 'task',
  history = [],
}) => {
  if (!agent) {
    throw new AgentRunnerError('Agent document is required for execution.', 'MISSING_AGENT');
  }
  if (!user || !user._id) {
    throw new AgentRunnerError('Authenticated user is required for execution.', 'UNAUTHENTICATED');
  }
  if (!input || typeof input !== 'string' || !input.trim()) {
    throw new AgentRunnerError('Input prompt cannot be empty.', 'INVALID_INPUT');
  }
  if (input.trim().length > 10000) {
    throw new AgentRunnerError('Input prompt exceeds maximum length of 10,000 characters.', 'INPUT_TOO_LONG');
  }

  const startTime = Date.now();

  // 1. Capture immutable snapshot of agent configuration at execution time (PRD: AGENT-05, EXEC-01)
  const agentSnapshot = {
    name: agent.name,
    description: agent.description || '',
    model: agent.model,
    instructions: agent.instructions,
    tools: Array.isArray(agent.tools) ? [...agent.tools] : [],
    parameters: {
      temperature: agent.parameters?.temperature ?? 0.7,
      maxTokens: agent.parameters?.maxTokens ?? 1024,
    },
    limits: {
      maxTurns: Math.min(3, agent.limits?.maxTurns ?? 3), // Capped strictly at 3 turns per plan
      timeoutSeconds: Math.min(120, Math.max(5, agent.limits?.timeoutSeconds ?? 30)),
    },
  };

  // 2. Initialize persistent Execution document in 'running' state
  const execution = new Execution({
    owner: user._id,
    agent: agent._id,
    agentSnapshot,
    mode: mode === 'chat' ? 'chat' : 'task',
    input: input.trim(),
    status: 'running',
    toolTraces: [],
    messages: [],
    turnsCount: 0,
    durationMs: 0,
    tokenUsage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
  });

  await execution.save();

  // 3. Prepare execution timeout guard and abort controller
  const timeoutMs = agentSnapshot.limits.timeoutSeconds * 1000;
  const abortController = new AbortController();
  let timeoutId = setTimeout(() => {
    abortController.abort();
  }, timeoutMs);

  // 4. Assemble system prompt and message history
  const messages = [
    {
      role: 'system',
      content: agentSnapshot.instructions,
    },
  ];

  // If in chat mode and valid prior messages are provided, sanitize and append them
  if (mode === 'chat' && Array.isArray(history) && history.length > 0) {
    for (const msg of history) {
      if (msg && (msg.role === 'user' || msg.role === 'assistant') && typeof msg.content === 'string') {
        messages.push({
          role: msg.role,
          content: msg.content.trim(),
        });
      }
    }
  }

  // Append current user message
  messages.push({
    role: 'user',
    content: input.trim(),
  });

  // Prepare approved tool schemas for this agent
  const toolSchemas = getToolSchemasForAgent(agent);
  const maxTurns = agentSnapshot.limits.maxTurns;
  let currentTurn = 0;
  let finalAssistantContent = null;
  const accumulatedToolTraces = [];
  const accumulatedTokenUsage = {
    promptTokens: 0,
    completionTokens: 0,
    totalTokens: 0,
  };

  try {
    // 5. Multi-turn Model <-> Tool Calling Loop (Max 3 turns)
    while (currentTurn < maxTurns) {
      currentTurn++;

      // Check timeout abort signal before inference
      if (abortController.signal.aborted) {
        throw new AgentRunnerError(`Execution timed out after ${agentSnapshot.limits.timeoutSeconds}s.`, 'EXECUTION_TIMEOUT');
      }

      // Execute model inference
      const completion = await executeModelCompletion({
        model: agentSnapshot.model,
        messages,
        tools: toolSchemas,
        temperature: agentSnapshot.parameters.temperature,
        maxTokens: agentSnapshot.parameters.maxTokens,
        signal: abortController.signal,
      });

      // Accumulate token usage if reported
      if (completion.usage) {
        accumulatedTokenUsage.promptTokens += completion.usage.prompt_tokens || 0;
        accumulatedTokenUsage.completionTokens += completion.usage.completion_tokens || 0;
        accumulatedTokenUsage.totalTokens += completion.usage.total_tokens || 0;
      }

      const assistantMessage = completion.message;
      const toolCalls = assistantMessage.tool_calls;

      // Case A: Model responded with final text answer (no tool calls requested)
      if (!toolCalls || !Array.isArray(toolCalls) || toolCalls.length === 0) {
        finalAssistantContent = assistantMessage.content || '';
        messages.push({
          role: 'assistant',
          content: finalAssistantContent,
        });
        break;
      }

      // Case B: Model requested one or more tool calls
      messages.push({
        role: 'assistant',
        content: assistantMessage.content || '',
        tool_calls: toolCalls,
      });

      // Process each requested tool call sequentially
      for (const tc of toolCalls) {
        const functionName = tc.function?.name || '';
        let parsedArgs = {};

        try {
          parsedArgs = tc.function?.arguments ? JSON.parse(tc.function.arguments) : {};
        } catch (jsonErr) {
          parsedArgs = { rawArguments: tc.function?.arguments };
        }

        // Validate agent permission for requested tool (PRD: TOOL-08)
        let toolResult;
        let permissionDenied = false;

        try {
          validateAgentToolAccess(agent, functionName);
        } catch (permErr) {
          permissionDenied = true;
          toolResult = {
            tool: functionName,
            output: null,
            isError: true,
            error: {
              code: permErr.code || 'TOOL_PERMISSION_DENIED',
              message: permErr.message,
            },
            durationMs: 0,
          };
        }

        // If permission passed, execute tool within sandbox
        if (!permissionDenied) {
          toolResult = await executeTool(functionName, parsedArgs, {
            agent,
            timeoutMs: 5000,
          });
        }

        // Record trace entry
        const traceEntry = {
          tool: functionName,
          args: parsedArgs,
          output: toolResult.output,
          isError: toolResult.isError,
          error: toolResult.error || null,
          durationMs: toolResult.durationMs,
          turn: currentTurn,
          timestamp: new Date(),
        };

        accumulatedToolTraces.push(traceEntry);

        // Feed tool result back to model in standard OpenAI/Groq tool format
        messages.push({
          role: 'tool',
          tool_call_id: tc.id,
          name: functionName,
          content: JSON.stringify(
            toolResult.isError
              ? { isError: true, error: toolResult.error }
              : { isError: false, result: toolResult.output }
          ),
        });
      }

      // If we reached turn limit after executing tools, make a final synthesis call without tools
      if (currentTurn >= maxTurns && !finalAssistantContent) {
        const synthesisCompletion = await executeModelCompletion({
          model: agentSnapshot.model,
          messages,
          tools: [], // No tools allowed on final turn to force conclusion
          temperature: agentSnapshot.parameters.temperature,
          maxTokens: agentSnapshot.parameters.maxTokens,
          signal: abortController.signal,
        });

        if (synthesisCompletion.usage) {
          accumulatedTokenUsage.promptTokens += synthesisCompletion.usage.prompt_tokens || 0;
          accumulatedTokenUsage.completionTokens += synthesisCompletion.usage.completion_tokens || 0;
          accumulatedTokenUsage.totalTokens += synthesisCompletion.usage.total_tokens || 0;
        }

        finalAssistantContent = synthesisCompletion.message?.content || 'Completed tool actions.';
        messages.push({
          role: 'assistant',
          content: finalAssistantContent,
        });
      }
    }

    // 6. Success Persistence (PRD: EXEC-01, EXEC-02)
    const durationMs = Date.now() - startTime;
    execution.status = 'completed';
    execution.output = finalAssistantContent;
    execution.toolTraces = accumulatedToolTraces;
    execution.messages = messages;
    execution.turnsCount = currentTurn;
    execution.durationMs = durationMs;
    execution.tokenUsage = accumulatedTokenUsage;
    execution.error = null;

    await execution.save();

    return {
      execution,
      output: finalAssistantContent,
      toolTraces: accumulatedToolTraces,
      turnsCount: currentTurn,
      durationMs,
      tokenUsage: accumulatedTokenUsage,
    };
  } catch (error) {
    // 7. Failure Persistence (PRD: EXEC-02)
    const durationMs = Date.now() - startTime;
    const isTimeout = abortController.signal.aborted || error.code === 'EXECUTION_TIMEOUT';
    const errorCode = isTimeout ? 'EXECUTION_TIMEOUT' : error.code || 'EXECUTION_FAILED';
    const errorMessage = isTimeout
      ? `Execution timed out after ${agentSnapshot.limits.timeoutSeconds}s.`
      : error.message || 'An error occurred during agent execution.';

    execution.status = 'failed';
    execution.output = null;
    execution.toolTraces = accumulatedToolTraces;
    execution.messages = messages;
    execution.turnsCount = currentTurn;
    execution.durationMs = durationMs;
    execution.tokenUsage = accumulatedTokenUsage;
    execution.error = {
      code: errorCode,
      message: errorMessage,
      details: error.details || null,
    };

    await execution.save().catch((saveErr) => {
      console.error('Failed to save failed execution state:', saveErr);
    });

    throw new AgentRunnerError(errorMessage, errorCode, {
      executionId: execution._id,
      durationMs,
      toolTraces: accumulatedToolTraces,
    });
  } finally {
    clearTimeout(timeoutId);
  }
};
