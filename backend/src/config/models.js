/**
 * Centralized AI Model and Tool Registry
 * PRD: AI-03, CREATE-05
 */

export const SUPPORTED_MODELS = [
  {
    id: 'qwen/qwen3.8-27b',
    name: 'Qwen 3.8 27B',
    provider: 'groq',
    contextWindow: 32768,
    maxOutputTokens: 4096,
    supportsToolCalling: true,
    supportsJsonMode: true,
    recommended: true,
    description: 'High-reasoning instruction-following model with native JSON support on Groq.',
  },
  {
    id: 'llama-3.3-70b-versatile',
    name: 'Llama 3.3 70B Versatile',
    provider: 'groq',
    contextWindow: 131072, // 128k tokens
    maxOutputTokens: 4096,
    supportsToolCalling: true,
    supportsJsonMode: true,
    recommended: false,
    description: 'High-reasoning model optimized for complex instructions and tool orchestration.',
  },
  {
    id: 'llama-3.1-8b-instant',
    name: 'Llama 3.1 8B Instant',
    provider: 'groq',
    contextWindow: 131072, // 128k tokens
    maxOutputTokens: 4096,
    supportsToolCalling: true,
    supportsJsonMode: true,
    recommended: false,
    description: 'Ultra-fast inference model ideal for low-latency tasks and rapid prototyping.',
  },
  {
    id: 'openai/gpt-oss-120b',
    name: 'GPT OSS 120B',
    provider: 'groq',
    contextWindow: 131072,
    maxOutputTokens: 4096,
    supportsToolCalling: true,
    supportsJsonMode: false,
    recommended: false,
    description: 'Massive open-weights foundation model available on Groq.',
  },
  {
    id: 'openai/gpt-oss-20b',
    name: 'GPT OSS 20B',
    provider: 'groq',
    contextWindow: 131072,
    maxOutputTokens: 4096,
    supportsToolCalling: true,
    supportsJsonMode: false,
    recommended: false,
    description: 'Compact high-speed open-weights model on Groq.',
  },
  {
    id: 'mixtral-8x7b-32768',
    name: 'Mixtral 8x7B (MoE)',
    provider: 'groq',
    contextWindow: 32768, // 32k tokens
    maxOutputTokens: 4096,
    supportsToolCalling: true,
    supportsJsonMode: true,
    recommended: false,
    description: 'Mixture of Experts architecture balancing speed and nuanced prompt response.',
  },
];

export const DEFAULT_MODEL_ID = 'qwen/qwen3.8-27b';

export const APPROVED_TOOLS = ['calculator', 'text_processor', 'datetime'];

export const isValidModel = (modelId) => {
  return SUPPORTED_MODELS.some((m) => m.id === modelId);
};

export const getModelConfig = (modelId) => {
  return SUPPORTED_MODELS.find((m) => m.id === modelId) || null;
};

export const isApprovedTool = (toolId) => {
  return APPROVED_TOOLS.includes(toolId);
};
