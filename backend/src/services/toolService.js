/**
 * Fable Built-in Tool Registry & Sandbox Service
 * PRD: TOOL-01, TOOL-02, TOOL-03, TOOL-07, TOOL-08, TOOL-09, TOOL-10
 * 
 * Responsibilities:
 * - Centralized registry of all approved built-in tools.
 * - Generating Groq/OpenAI function-calling tool schemas for models.
 * - Enforcing agent-level tool permissions before any execution.
 * - Executing tools in a sandboxed runtime with strict timeouts.
 * - Formulating structured, transparent execution results and error representations.
 */

import { calculatorTool } from '../tools/calculator.js';
import { textProcessorTool } from '../tools/textProcessor.js';
import { dateTimeTool } from '../tools/dateTime.js';
import { APPROVED_TOOLS, isApprovedTool } from '../config/models.js';

export class ToolRegistryError extends Error {
  constructor(message, code = 'TOOL_REGISTRY_ERROR', details = null) {
    super(message);
    this.name = 'ToolRegistryError';
    this.code = code;
    this.details = details;
  }
}

/**
 * Registry mapping of all built-in tools
 */
const TOOL_REGISTRY = {
  calculator: calculatorTool,
  text_processor: textProcessorTool,
  datetime: dateTimeTool,
};

const DEFAULT_TOOL_TIMEOUT_MS = 5000; // 5 seconds max per tool call

/**
 * Retrieve a tool by name from registry
 */
export const getTool = (toolName) => {
  if (!toolName || typeof toolName !== 'string') return null;
  return TOOL_REGISTRY[toolName.trim().toLowerCase()] || null;
};

/**
 * Get all registered built-in tools
 */
export const getAllTools = () => {
  return Object.values(TOOL_REGISTRY);
};

/**
 * Get active tool definitions permitted for a specific agent
 */
export const getToolsForAgent = (agent) => {
  if (!agent || !Array.isArray(agent.tools)) return [];
  return agent.tools
    .map((toolName) => getTool(toolName))
    .filter(Boolean);
};

/**
 * Format tools into Groq / OpenAI function calling schemas
 */
export const getToolSchemasForAgent = (agent) => {
  const tools = getToolsForAgent(agent);
  return tools.map((tool) => ({
    type: 'function',
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters,
    },
  }));
};

/**
 * Validate that an agent is authorized to invoke the specified tool
 * PRD: TOOL-07, TOOL-08
 */
export const validateAgentToolAccess = (agent, toolName) => {
  if (!isApprovedTool(toolName)) {
    throw new ToolRegistryError(
      `Tool "${toolName}" is not in Fable's approved tool registry.`,
      'TOOL_NOT_APPROVED',
      { toolName, approvedTools: APPROVED_TOOLS }
    );
  }

  const agentTools = Array.isArray(agent?.tools) ? agent.tools : [];
  if (!agentTools.includes(toolName)) {
    throw new ToolRegistryError(
      `Agent "${agent?.name || 'Unnamed'}" does not have permission to use tool "${toolName}". Enabled tools: [${agentTools.join(', ')}].`,
      'TOOL_PERMISSION_DENIED',
      { toolName, enabledTools: agentTools }
    );
  }

  return true;
};

/**
 * Execute a built-in tool within a monitored sandbox
 * PRD: TOOL-08, TOOL-09, TOOL-10
 * 
 * @param {string} toolName - Identifier of tool to execute
 * @param {object} args - Parsed arguments provided to the tool
 * @param {object} options - Execution options (agent, timeoutMs)
 * @returns {Promise<{ tool: string, output: any, isError: boolean, error: object|null, durationMs: number }>}
 */
export const executeTool = async (toolName, args = {}, options = {}) => {
  const startTime = Date.now();
  const normalizedToolName = typeof toolName === 'string' ? toolName.trim().toLowerCase() : '';

  // 1. Verify tool exists in registry
  const tool = getTool(normalizedToolName);
  if (!tool) {
    return {
      tool: normalizedToolName,
      output: null,
      isError: true,
      error: {
        code: 'TOOL_NOT_FOUND',
        message: `Tool "${toolName}" does not exist in the built-in tool registry.`,
      },
      durationMs: Date.now() - startTime,
    };
  }

  // 2. If agent is provided, check permissions (TOOL-07, TOOL-08)
  if (options.agent) {
    try {
      validateAgentToolAccess(options.agent, normalizedToolName);
    } catch (permError) {
      return {
        tool: normalizedToolName,
        output: null,
        isError: true,
        error: {
          code: permError.code || 'TOOL_PERMISSION_DENIED',
          message: permError.message,
          details: permError.details || null,
        },
        durationMs: Date.now() - startTime,
      };
    }
  }

  // 3. Prepare timeout guard and abort controller (TOOL-10)
  const timeoutMs = typeof options.timeoutMs === 'number' && options.timeoutMs > 0
    ? options.timeoutMs
    : DEFAULT_TOOL_TIMEOUT_MS;

  const abortController = new AbortController();
  let timeoutId = null;

  try {
    // 4. Execute tool with timeout race and cooperative cancellation
    const executionPromise = tool.execute(args || {}, {
      ...options,
      signal: abortController.signal,
    });

    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => {
        abortController.abort();
        reject(new ToolRegistryError(`Tool execution timed out after ${timeoutMs}ms.`, 'TOOL_TIMEOUT'));
      }, timeoutMs);
    });

    const output = await Promise.race([executionPromise, timeoutPromise]);
    const durationMs = Date.now() - startTime;

    return {
      tool: normalizedToolName,
      output,
      isError: false,
      error: null,
      durationMs,
    };
  } catch (error) {
    // PRD: TOOL-09: Tool failures are represented as errors in the execution record;
    // they must not be disguised as successful outputs.
    const durationMs = Date.now() - startTime;
    return {
      tool: normalizedToolName,
      output: null,
      isError: true,
      error: {
        code: error.code || 'TOOL_EXECUTION_ERROR',
        message: error.message || 'An error occurred during tool execution.',
        details: error.details || null,
      },
      durationMs,
    };
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
};
