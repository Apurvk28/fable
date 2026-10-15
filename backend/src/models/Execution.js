import mongoose from 'mongoose';

/**
 * Execution Mongoose Model
 * PRD: EXEC-01, EXEC-02, EXEC-07, EXEC-08, AGENT-05
 * 
 * Responsibilities:
 * - Persist execution history for user tasks and chat runs.
 * - Store an immutable snapshot of the agent configuration at run time
 *   (preserving audit integrity even if the agent is modified or deleted).
 * - Store full turn-by-turn conversation messages and tool execution traces.
 * - Never store provider secrets, JWTs, or raw CSRF tokens.
 */
const executionSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Execution must belong to an authenticated user.'],
      index: true,
    },
    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Agent',
      required: [true, 'Execution must reference the executing agent.'],
      index: true,
    },
    // Immutable snapshot of agent configuration at the exact moment of execution
    agentSnapshot: {
      name: { type: String, required: true },
      description: { type: String, default: '' },
      model: { type: String, required: true },
      instructions: { type: String, required: true },
      tools: { type: [String], default: [] },
      parameters: {
        temperature: { type: Number, default: 0.7 },
        maxTokens: { type: Number, default: 1024 },
      },
      limits: {
        maxTurns: { type: Number, default: 3 },
        timeoutSeconds: { type: Number, default: 30 },
      },
    },
    mode: {
      type: String,
      enum: ['task', 'chat'],
      default: 'task',
    },
    input: {
      type: String,
      required: [true, 'Execution input / prompt is required.'],
      trim: true,
      maxlength: [10000, 'Input prompt cannot exceed 10,000 characters.'],
    },
    output: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['running', 'completed', 'failed'],
      default: 'running',
      index: true,
    },
    // Traces of individual tool calls executed during this run
    toolTraces: [
      {
        tool: { type: String, required: true },
        args: { type: mongoose.Schema.Types.Mixed, default: {} },
        output: { type: mongoose.Schema.Types.Mixed, default: null },
        isError: { type: Boolean, default: false },
        error: {
          code: { type: String, default: null },
          message: { type: String, default: null },
        },
        durationMs: { type: Number, default: 0 },
        turn: { type: Number, default: 1 },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    // Turn-by-turn messages (system, user, assistant, tool)
    messages: [
      {
        role: {
          type: String,
          enum: ['system', 'user', 'assistant', 'tool'],
          required: true,
        },
        content: { type: String, default: '' },
        tool_calls: { type: mongoose.Schema.Types.Mixed, default: null },
        tool_call_id: { type: String, default: null },
        name: { type: String, default: null },
      },
    ],
    turnsCount: {
      type: Number,
      default: 0,
    },
    durationMs: {
      type: Number,
      default: 0,
    },
    tokenUsage: {
      promptTokens: { type: Number, default: 0 },
      completionTokens: { type: Number, default: 0 },
      totalTokens: { type: Number, default: 0 },
    },
    error: {
      code: { type: String, default: null },
      message: { type: String, default: null },
      details: { type: mongoose.Schema.Types.Mixed, default: null },
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound indexes for user history queries and agent-scoped run inspections
executionSchema.index({ owner: 1, createdAt: -1 });
executionSchema.index({ owner: 1, agent: 1, createdAt: -1 });
executionSchema.index({ owner: 1, status: 1, createdAt: -1 });

export const Execution = mongoose.model('Execution', executionSchema);
