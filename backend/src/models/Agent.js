import mongoose from 'mongoose';

const agentSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Agent must belong to an authenticated user.'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Agent name is required.'],
      trim: true,
      minlength: [2, 'Agent name must be at least 2 characters.'],
      maxlength: [60, 'Agent name cannot exceed 60 characters.'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, 'Description cannot exceed 200 characters.'],
      default: '',
    },
    instructions: {
      type: String,
      required: [true, 'Instructions / system prompt is required.'],
      trim: true,
      minlength: [10, 'Instructions must be at least 10 characters.'],
      maxlength: [10000, 'Instructions cannot exceed 10,000 characters.'],
    },
    model: {
      type: String,
      required: [true, 'Model selection is required.'],
      enum: {
        values: [
          'qwen/qwen3.8-27b',
          'llama-3.3-70b-versatile',
          'llama-3.1-8b-instant',
          'openai/gpt-oss-120b',
          'openai/gpt-oss-20b',
          'mixtral-8x7b-32768',
        ],
        message: '{VALUE} is not a supported model identifier.',
      },
      default: 'qwen/qwen3.8-27b',
    },
    tools: {
      type: [String],
      enum: {
        values: ['calculator', 'text_processor', 'datetime'],
        message: '{VALUE} is not a valid built-in tool.',
      },
      default: [],
    },
    parameters: {
      temperature: {
        type: Number,
        default: 0.7,
        min: [0.0, 'Temperature must be between 0.0 and 2.0.'],
        max: [2.0, 'Temperature must be between 0.0 and 2.0.'],
      },
      maxTokens: {
        type: Number,
        default: 1024,
        min: [128, 'Max tokens must be at least 128.'],
        max: [4096, 'Max tokens cannot exceed 4096.'],
      },
    },
    limits: {
      maxTurns: {
        type: Number,
        default: 3,
        min: [1, 'Max turns must be between 1 and 10.'],
        max: [10, 'Max turns cannot exceed 10.'],
      },
      timeoutSeconds: {
        type: Number,
        default: 30,
        min: [5, 'Timeout must be between 5 and 120 seconds.'],
        max: [120, 'Timeout cannot exceed 120 seconds.'],
      },
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

// Compound index for efficient owner-scoped listings and sorting
agentSchema.index({ owner: 1, createdAt: -1 });
agentSchema.index({ owner: 1, name: 1 });

export const Agent = mongoose.model('Agent', agentSchema);
