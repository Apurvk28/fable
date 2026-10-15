import mongoose from 'mongoose';
import { Agent } from '../models/Agent.js';
import { Execution } from '../models/Execution.js';
import { runAgent } from '../services/agentRunner.js';

/**
 * Helper to validate MongoDB ObjectId
 */
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/**
 * POST /api/v1/agents/:id/run
 * Execute a standalone task using the specified agent
 * PRD: RUN-03, RUN-07, EXEC-01, EXEC-02
 */
export const runTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { input } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        error: { code: 'INVALID_ID', message: 'The provided agent identifier is invalid.' },
      });
    }

    if (!input || typeof input !== 'string' || !input.trim()) {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'Task input prompt cannot be empty.' },
      });
    }

    // Verify agent ownership strictly (AGENT-06, EXEC-08)
    const agent = await Agent.findOne({ _id: id, owner: req.user._id });
    if (!agent) {
      return res.status(404).json({
        error: { code: 'AGENT_NOT_FOUND', message: 'Agent not found or you do not have permission to execute it.' },
      });
    }

    const result = await runAgent({
      agent,
      user: req.user,
      input: input.trim(),
      mode: 'task',
    });

    res.status(200).json({
      message: 'Task executed successfully.',
      execution: result.execution,
      output: result.output,
      toolTraces: result.toolTraces,
      durationMs: result.durationMs,
      turnsCount: result.turnsCount,
      tokenUsage: result.tokenUsage,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/agents/:id/chat
 * Execute an interactive conversation message turn with the agent
 * PRD: RUN-02, RUN-07, EXEC-01, EXEC-02
 */
export const chatWithAgent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { message, history } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        error: { code: 'INVALID_ID', message: 'The provided agent identifier is invalid.' },
      });
    }

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'Chat message cannot be empty.' },
      });
    }

    // Verify agent ownership strictly
    const agent = await Agent.findOne({ _id: id, owner: req.user._id });
    if (!agent) {
      return res.status(404).json({
        error: { code: 'AGENT_NOT_FOUND', message: 'Agent not found or you do not have permission to chat with it.' },
      });
    }

    const result = await runAgent({
      agent,
      user: req.user,
      input: message.trim(),
      mode: 'chat',
      history: Array.isArray(history) ? history : [],
    });

    res.status(200).json({
      message: 'Chat turn executed successfully.',
      execution: result.execution,
      output: result.output,
      toolTraces: result.toolTraces,
      durationMs: result.durationMs,
      turnsCount: result.turnsCount,
      tokenUsage: result.tokenUsage,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/executions/:id
 * Retrieve single execution record with strict user ownership check
 * PRD: EXEC-01, EXEC-02, EXEC-08
 */
export const getExecutionById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        error: { code: 'INVALID_ID', message: 'The provided execution identifier is invalid.' },
      });
    }

    // Strict ownership enforcement (EXEC-08)
    const execution = await Execution.findOne({ _id: id, owner: req.user._id });
    if (!execution) {
      return res.status(404).json({
        error: { code: 'EXECUTION_NOT_FOUND', message: 'Execution not found or you do not have permission to view it.' },
      });
    }

    res.status(200).json({ execution });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/agents/:id/executions
 * Retrieve recent executions for an agent owned by the user
 */
export const getAgentExecutions = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        error: { code: 'INVALID_ID', message: 'The provided agent identifier is invalid.' },
      });
    }

    // Verify agent ownership
    const agent = await Agent.findOne({ _id: id, owner: req.user._id });
    if (!agent) {
      return res.status(404).json({
        error: { code: 'AGENT_NOT_FOUND', message: 'Agent not found or you do not have permission to view its executions.' },
      });
    }

    const executions = await Execution.find({ agent: id, owner: req.user._id })
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({ executions });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/executions
 * Retrieve paginated execution history across all agents for the authenticated user
 * PRD: EXEC-01, EXEC-02, EXEC-03, EXEC-07, EXEC-08
 */
export const getExecutions = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 15,
      agentId,
      status,
      mode,
      sort = '-createdAt',
      q,
    } = req.query;

    // 1. Sanitize & bound pagination
    const parsedPage = Math.max(1, parseInt(page, 10) || 1);
    const parsedLimit = Math.min(50, Math.max(1, parseInt(limit, 10) || 15));
    const skip = (parsedPage - 1) * parsedLimit;

    // 2. Base query strictly scoped to authenticated user (EXEC-08)
    const query = { owner: req.user._id };

    // 3. Filter by agentId
    if (agentId && agentId !== 'all') {
      if (!isValidObjectId(agentId)) {
        return res.status(400).json({
          error: { code: 'INVALID_AGENT_ID', message: 'The provided agent identifier filter is invalid.' },
        });
      }
      query.agent = agentId;
    }

    // 4. Filter by status
    if (status && status !== 'all') {
      const allowedStatuses = ['running', 'completed', 'failed'];
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          error: { code: 'INVALID_STATUS', message: `Status filter must be one of: ${allowedStatuses.join(', ')}.` },
        });
      }
      query.status = status;
    }

    // 5. Filter by mode
    if (mode && mode !== 'all') {
      const allowedModes = ['task', 'chat'];
      if (!allowedModes.includes(mode)) {
        return res.status(400).json({
          error: { code: 'INVALID_MODE', message: `Mode filter must be one of: ${allowedModes.join(', ')}.` },
        });
      }
      query.mode = mode;
    }

    // 6. Search query against input text
    if (q && typeof q === 'string' && q.trim()) {
      const sanitized = q.trim().slice(0, 100);
      const escaped = sanitized.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.input = { $regex: escaped, $options: 'i' };
    }

    // 7. Validate sort parameter
    const allowedSorts = {
      '-createdAt': { createdAt: -1 },
      'createdAt': { createdAt: 1 },
      '-durationMs': { durationMs: -1 },
      'durationMs': { durationMs: 1 },
    };
    const sortOption = allowedSorts[sort] || { createdAt: -1 };

    // 8. Execute count & paginated query in parallel
    const [totalCount, rawExecutions] = await Promise.all([
      Execution.countDocuments(query),
      Execution.find(query)
        .select('agent agentSnapshot.name agentSnapshot.model mode status input output turnsCount durationMs tokenUsage error createdAt updatedAt toolTraces.tool toolTraces.durationMs toolTraces.isError')
        .sort(sortOption)
        .skip(skip)
        .limit(parsedLimit)
        .lean(),
    ]);

    // 9. Format lightweight summaries
    const executions = rawExecutions.map((doc) => ({
      id: doc._id.toString(),
      agent: doc.agent ? doc.agent.toString() : null,
      agentSnapshot: {
        name: doc.agentSnapshot?.name || 'Unnamed Agent',
        model: doc.agentSnapshot?.model || 'unknown',
      },
      mode: doc.mode || 'task',
      status: doc.status || 'completed',
      input: doc.input || '',
      output: doc.output ? (doc.output.length > 250 ? doc.output.slice(0, 250) + '...' : doc.output) : null,
      turnsCount: doc.turnsCount || 1,
      toolTracesCount: Array.isArray(doc.toolTraces) ? doc.toolTraces.length : 0,
      toolNames: Array.isArray(doc.toolTraces) ? [...new Set(doc.toolTraces.map((t) => t.tool))] : [],
      durationMs: doc.durationMs || 0,
      tokenUsage: doc.tokenUsage || { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      error: doc.error ? { code: doc.error.code, message: doc.error.message } : null,
      createdAt: doc.createdAt,
    }));

    const totalPages = Math.ceil(totalCount / parsedLimit) || 1;

    res.status(200).json({
      executions,
      pagination: {
        page: parsedPage,
        limit: parsedLimit,
        totalCount,
        totalPages,
        hasNextPage: parsedPage < totalPages,
        hasPrevPage: parsedPage > 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

