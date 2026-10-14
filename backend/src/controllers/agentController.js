import mongoose from 'mongoose';
import { Agent } from '../models/Agent.js';
import {
  generateAgentConfigProposal,
  verifyProviderModels,
  assertModelAvailable,
} from '../services/aiService.js';
import { SUPPORTED_MODELS, DEFAULT_MODEL_ID } from '../config/models.js';

/**
 * Helper to escape special characters for safe regular expression querying
 */
const escapeRegex = (str) => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * GET /api/v1/agents
 * Retrieve all agents owned by the authenticated user with search, filtering, and sorting
 */
export const getAgents = async (req, res, next) => {
  try {
    const { q, tool, sort } = req.query;

    // Strict ownership enforcement: only return agents owned by the authenticated user
    const filter = { owner: req.user._id };

    // Search query on name and description
    if (q && typeof q === 'string' && q.trim()) {
      const sanitizedQuery = escapeRegex(q.trim());
      filter.$or = [
        { name: { $regex: sanitizedQuery, $options: 'i' } },
        { description: { $regex: sanitizedQuery, $options: 'i' } },
      ];
    }

    // Filter by enabled tool
    if (tool && typeof tool === 'string' && tool.trim()) {
      filter.tools = tool.trim();
    }

    // Sorting options
    let sortOptions = { createdAt: -1 }; // Default: newest first
    if (sort === 'oldest') {
      sortOptions = { createdAt: 1 };
    } else if (sort === 'name_asc') {
      sortOptions = { name: 1 };
    } else if (sort === 'name_desc') {
      sortOptions = { name: -1 };
    }

    const agents = await Agent.find(filter).sort(sortOptions);
    const totalCount = await Agent.countDocuments({ owner: req.user._id });

    res.status(200).json({
      agents,
      totalCount,
      filteredCount: agents.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/agents/:id
 * Retrieve a single agent by ID with server-side ownership verification
 */
export const getAgentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: {
          code: 'INVALID_ID',
          message: 'The provided agent identifier is invalid.',
        },
      });
    }

    // Server-side ownership check: must match both _id and owner
    const agent = await Agent.findOne({ _id: id, owner: req.user._id });

    if (!agent) {
      return res.status(404).json({
        error: {
          code: 'AGENT_NOT_FOUND',
          message: 'Agent not found or you do not have permission to access it.',
        },
      });
    }

    res.status(200).json({ agent });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/agents
 * Create a new agent configuration belonging to the authenticated user
 */
export const createAgent = async (req, res, next) => {
  try {
    const {
      name,
      description,
      instructions,
      model,
      tools,
      parameters,
      limits,
    } = req.body;

    // Reject missing required fields early with clear messages
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Agent name is required.',
        },
      });
    }

    if (!instructions || typeof instructions !== 'string' || instructions.trim().length < 10) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Instructions / system prompt must be at least 10 characters long.',
        },
      });
    }

    // Validate model availability on the AI provider
    const modelToUse = model || DEFAULT_MODEL_ID;
    await assertModelAvailable(modelToUse);

    // Always enforce owner from authenticated session
    const agent = new Agent({
      owner: req.user._id,
      name: name.trim(),
      description: description ? description.trim() : '',
      instructions: instructions.trim(),
      model: modelToUse,
      tools: Array.isArray(tools) ? tools : [],
      parameters: {
        temperature: parameters?.temperature !== undefined ? Number(parameters.temperature) : 0.7,
        maxTokens: parameters?.maxTokens !== undefined ? Number(parameters.maxTokens) : 1024,
      },
      limits: {
        maxTurns: limits?.maxTurns !== undefined ? Number(limits.maxTurns) : 3,
        timeoutSeconds: limits?.timeoutSeconds !== undefined ? Number(limits.timeoutSeconds) : 30,
      },
    });

    await agent.save();

    res.status(201).json({
      message: 'Agent created successfully.',
      agent,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/agents/:id
 * Update an existing agent configuration with strict ownership enforcement
 */
export const updateAgent = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: {
          code: 'INVALID_ID',
          message: 'The provided agent identifier is invalid.',
        },
      });
    }

    // Find agent ensuring user ownership
    const agent = await Agent.findOne({ _id: id, owner: req.user._id });

    if (!agent) {
      return res.status(404).json({
        error: {
          code: 'AGENT_NOT_FOUND',
          message: 'Agent not found or you do not have permission to modify it.',
        },
      });
    }

    const {
      name,
      description,
      instructions,
      model,
      tools,
      parameters,
      limits,
    } = req.body;

    if (name !== undefined) {
      if (typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Agent name cannot be blank.',
          },
        });
      }
      agent.name = name.trim();
    }

    if (description !== undefined) {
      agent.description = typeof description === 'string' ? description.trim() : '';
    }

    if (instructions !== undefined) {
      if (typeof instructions !== 'string' || instructions.trim().length < 10) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Instructions must be at least 10 characters long.',
          },
        });
      }
      agent.instructions = instructions.trim();
    }

    if (model !== undefined) {
      await assertModelAvailable(model);
      agent.model = model;
    }

    if (tools !== undefined) {
      if (!Array.isArray(tools)) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Tools must be an array of tool identifiers.',
          },
        });
      }
      agent.tools = tools;
    }

    if (parameters !== undefined) {
      if (parameters.temperature !== undefined) {
        agent.parameters.temperature = Number(parameters.temperature);
      }
      if (parameters.maxTokens !== undefined) {
        agent.parameters.maxTokens = Number(parameters.maxTokens);
      }
    }

    if (limits !== undefined) {
      if (limits.maxTurns !== undefined) {
        agent.limits.maxTurns = Number(limits.maxTurns);
      }
      if (limits.timeoutSeconds !== undefined) {
        agent.limits.timeoutSeconds = Number(limits.timeoutSeconds);
      }
    }

    await agent.save();

    res.status(200).json({
      message: 'Agent updated successfully.',
      agent,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/agents/:id
 * Delete an agent owned by the authenticated user
 */
export const deleteAgent = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: {
          code: 'INVALID_ID',
          message: 'The provided agent identifier is invalid.',
        },
      });
    }

    // Ownership check: only remove if owned by req.user._id
    const agent = await Agent.findOneAndDelete({ _id: id, owner: req.user._id });

    if (!agent) {
      return res.status(404).json({
        error: {
          code: 'AGENT_NOT_FOUND',
          message: 'Agent not found or you do not have permission to delete it.',
        },
      });
    }

    res.status(200).json({
      message: 'Agent deleted successfully.',
      id,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/agents/:id/duplicate
 * Duplicate an agent configuration without copying execution history (PRD AGENT-07)
 */
export const duplicateAgent = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: {
          code: 'INVALID_ID',
          message: 'The provided agent identifier is invalid.',
        },
      });
    }

    // Retrieve original agent with ownership check
    const originalAgent = await Agent.findOne({ _id: id, owner: req.user._id });

    if (!originalAgent) {
      return res.status(404).json({
        error: {
          code: 'AGENT_NOT_FOUND',
          message: 'Agent not found or you do not have permission to duplicate it.',
        },
      });
    }

    // Format new name adhering to 60-character maximum
    const suffix = ' (Copy)';
    let newName = `${originalAgent.name}${suffix}`;
    if (newName.length > 60) {
      newName = `${originalAgent.name.slice(0, 60 - suffix.length)}${suffix}`;
    }

    // Create a fresh clone
    const duplicate = new Agent({
      owner: req.user._id,
      name: newName,
      description: originalAgent.description,
      instructions: originalAgent.instructions,
      model: originalAgent.model,
      tools: [...originalAgent.tools],
      parameters: {
        temperature: originalAgent.parameters.temperature,
        maxTokens: originalAgent.parameters.maxTokens,
      },
      limits: {
        maxTurns: originalAgent.limits.maxTurns,
        timeoutSeconds: originalAgent.limits.timeoutSeconds,
      },
    });

    await duplicate.save();

    res.status(201).json({
      message: 'Agent duplicated successfully.',
      agent: duplicate,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/agents/generate-config
 * Generate an AI agent configuration proposal from natural language prompt
 * PRD: CREATE-02, CREATE-03, CREATE-05
 */
export const generateAgentConfig = async (req, res, next) => {
  try {
    const { purpose, model } = req.body;

    if (!purpose || typeof purpose !== 'string' || purpose.trim().length < 5) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Please provide a clear agent purpose (at least 5 characters).',
        },
      });
    }

    const result = await generateAgentConfigProposal(purpose, { model });

    res.status(200).json({
      status: 'success',
      proposal: result.proposal,
      provider: result.provider,
      modelUsed: result.modelUsed,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/agents/models
 * List supported AI models with live provider verification
 * PRD: AI-03, AI-04
 */
export const getSupportedModels = async (req, res, next) => {
  try {
    const verified = await verifyProviderModels();
    res.status(200).json(verified);
  } catch (error) {
    // If provider is not configured or offline, return fallback list from models config
    res.status(200).json({
      provider: 'groq',
      verified: SUPPORTED_MODELS.map((m) => ({ ...m, availableOnProvider: true })),
      fallback: true,
      warning: error.message,
    });
  }
};

