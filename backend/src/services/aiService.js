import Groq from 'groq-sdk';
import { config } from '../config/env.js';
import {
  SUPPORTED_MODELS,
  DEFAULT_MODEL_ID,
  APPROVED_TOOLS,
  isValidModel,
  isApprovedTool,
} from '../config/models.js';

/**
 * Standardized AI Service Error Class
 */
export class AiServiceError extends Error {
  constructor(message, statusCode = 500, code = 'AI_SERVICE_ERROR', details = null) {
    super(message);
    this.name = 'AiServiceError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

/**
 * Helper to get an initialized Groq client instance
 */
let groqClientInstance = null;

const getGroqClient = () => {
  if (!config.groqApiKey) {
    throw new AiServiceError(
      'GROQ_API_KEY is not configured on the server. Please add it to backend/.env to use AI features.',
      503,
      'PROVIDER_NOT_CONFIGURED'
    );
  }

  // Refresh instance if key changed or first initialization
  if (!groqClientInstance || groqClientInstance.apiKey !== config.groqApiKey) {
    groqClientInstance = new Groq({
      apiKey: config.groqApiKey,
      timeout: 15000, // 15-second strict timeout for API calls
    });
  }

  return groqClientInstance;
};

/**
 * Cached provider models list (TTL: 60 seconds)
 */
let cachedAvailableModels = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 60 * 1000;

export const getAvailableProviderModelIds = async () => {
  const now = Date.now();
  if (cachedAvailableModels && now - cacheTimestamp < CACHE_TTL_MS) {
    return cachedAvailableModels;
  }

  const groq = getGroqClient();
  const modelList = await groq.models.list();
  cachedAvailableModels = (modelList.data || []).map((m) => m.id);
  cacheTimestamp = now;
  return cachedAvailableModels;
};

/**
 * Assert that a requested model is supported by Fable AND currently available on the active Groq provider
 */
export const assertModelAvailable = async (modelId) => {
  if (!isValidModel(modelId)) {
    throw new AiServiceError(
      `Model "${modelId}" is not a supported model identifier in Fable.`,
      400,
      'MODEL_UNSUPPORTED'
    );
  }

  const availableIds = await getAvailableProviderModelIds();
  if (!availableIds.includes(modelId)) {
    const activeAlternatives = SUPPORTED_MODELS
      .filter((m) => availableIds.includes(m.id))
      .map((m) => m.id);

    throw new AiServiceError(
      `Model "${modelId}" is currently unavailable on the Groq provider. Active alternatives: ${activeAlternatives.join(', ')}.`,
      400,
      'MODEL_UNAVAILABLE',
      { requestedModel: modelId, activeAlternatives }
    );
  }

  return true;
};

/**
 * Maps raw provider errors to safe, user-friendly domain errors
 */
const mapProviderError = (error) => {
  if (error instanceof AiServiceError) {
    return error;
  }

  const message = error.message || '';
  const status = error.status || error.statusCode || 500;

  // Groq Invalid API Key
  if (status === 401 || message.includes('Invalid API Key') || message.includes('Unauthorized')) {
    return new AiServiceError(
      'Groq authentication failed. Please verify that GROQ_API_KEY in backend/.env is valid.',
      401,
      'PROVIDER_AUTH_ERROR'
    );
  }

  // Groq Rate Limit Exceeded
  if (status === 429 || message.includes('Rate limit') || message.includes('rate_limit_exceeded')) {
    return new AiServiceError(
      'Groq rate limit exceeded. Please wait a moment before requesting another configuration.',
      429,
      'PROVIDER_RATE_LIMIT'
    );
  }

  // Timeout or Network Failure
  if (error.name === 'AbortError' || message.includes('timeout') || message.includes('ETIMEDOUT')) {
    return new AiServiceError(
      'Groq request timed out. The AI inference service took too long to respond.',
      504,
      'PROVIDER_TIMEOUT'
    );
  }

  // Generic provider failure
  return new AiServiceError(
    message || 'Failed to communicate with the AI provider.',
    status >= 400 && status < 600 ? status : 502,
    'PROVIDER_UNAVAILABLE',
    error.stack
  );
};

/**
 * Verify supported model IDs against the provider's active model catalog
 * PRD: AI-03, AI-04
 */
export const verifyProviderModels = async () => {
  try {
    const availableModelIds = await getAvailableProviderModelIds();

    const verified = SUPPORTED_MODELS.map((model) => ({
      ...model,
      availableOnProvider: availableModelIds.includes(model.id),
    }));

    return {
      provider: 'groq',
      verified,
      allAvailable: verified.every((m) => m.availableOnProvider),
    };
  } catch (error) {
    throw mapProviderError(error);
  }
};

/**
 * Clean and extract JSON object from raw LLM text
 */
const extractJsonObject = (text) => {
  if (!text || typeof text !== 'string') {
    throw new Error('Empty or non-string response received from AI model.');
  }

  let cleaned = text.trim();
  const codeBlockMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (codeBlockMatch) {
    cleaned = codeBlockMatch[1].trim();
  }

  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');

  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error('Response did not contain a valid JSON object structure.');
  }

  const jsonSubstring = cleaned.substring(firstBrace, lastBrace + 1);
  return JSON.parse(jsonSubstring);
};

/**
 * Strictly validate and sanitize AI-generated agent proposals against server-side schemas
 * PRD: CREATE-03, CREATE-05
 * Ensures the proposal model strictly matches the verified available model used for generation.
 */
const sanitizeAndValidateProposal = (rawProposal, modelActuallyUsed) => {
  if (!rawProposal || typeof rawProposal !== 'object') {
    throw new AiServiceError(
      'AI model did not produce a valid configuration object.',
      422,
      'INVALID_PROPOSAL_STRUCTURE'
    );
  }

  // 1. Validate & clamp Name (2–60 chars)
  let name = typeof rawProposal.name === 'string' ? rawProposal.name.trim() : 'AI Assistant';
  if (name.length > 60) name = name.slice(0, 60);
  if (name.length < 2) name = 'AI Agent';

  // 2. Validate & clamp Description (max 200 chars)
  let description = typeof rawProposal.description === 'string' ? rawProposal.description.trim() : '';
  if (description.length > 200) description = description.slice(0, 200);

  // 3. Validate Instructions / Prompt (min 10 chars, max 10000 chars)
  let instructions =
    typeof rawProposal.instructions === 'string'
      ? rawProposal.instructions.trim()
      : 'You are a specialized AI assistant built on the Fable platform.';
  if (instructions.length < 10) {
    instructions = `${instructions} Be concise, precise, and adhere to enabled tools.`;
  }
  if (instructions.length > 10000) instructions = instructions.slice(0, 10000);

  // 4. Validate Model selection: enforce that the proposed model strictly matches the verified model actually used for generation
  const model = modelActuallyUsed;

  // 5. Restrict Tools strictly to the Approved Tool Registry (CREATE-05)
  let tools = [];
  if (Array.isArray(rawProposal.tools)) {
    tools = rawProposal.tools
      .map((t) => (typeof t === 'string' ? t.trim().toLowerCase() : ''))
      .filter((t) => isApprovedTool(t));
  }
  // Deduplicate
  tools = [...new Set(tools)];

  // 6. Validate & clamp Parameters
  const temperature =
    typeof rawProposal.parameters?.temperature === 'number'
      ? Math.min(2.0, Math.max(0.0, Number(rawProposal.parameters.temperature.toFixed(2))))
      : 0.7;

  const maxTokens =
    typeof rawProposal.parameters?.maxTokens === 'number'
      ? Math.min(4096, Math.max(128, Math.round(rawProposal.parameters.maxTokens)))
      : 1024;

  // 7. Validate & clamp Limits
  const maxTurns =
    typeof rawProposal.limits?.maxTurns === 'number'
      ? Math.min(10, Math.max(1, Math.round(rawProposal.limits.maxTurns)))
      : 3;

  const timeoutSeconds =
    typeof rawProposal.limits?.timeoutSeconds === 'number'
      ? Math.min(120, Math.max(5, Math.round(rawProposal.limits.timeoutSeconds)))
      : 30;

  return {
    name,
    description,
    instructions,
    model,
    tools,
    parameters: {
      temperature,
      maxTokens,
    },
    limits: {
      maxTurns,
      timeoutSeconds,
    },
  };
};

/**
 * Generate a structured AI agent configuration proposal from natural language purpose
 * PRD: CREATE-02, CREATE-03, CREATE-04, CREATE-05, AI-04
 */
export const generateAgentConfigProposal = async (purpose, options = {}) => {
  if (!purpose || typeof purpose !== 'string' || purpose.trim().length < 5) {
    throw new AiServiceError(
      'Please provide a descriptive purpose for the agent (at least 5 characters).',
      400,
      'VALIDATION_ERROR'
    );
  }

  // 1. Resolve requested model or select active default, verifying availability on provider
  const modelToUse = options.model || DEFAULT_MODEL_ID;
  await assertModelAvailable(modelToUse);

  const groq = getGroqClient();

  const systemPrompt = `You are Fable's Agent Architect.
Your task is to convert a user's natural language agent description into a concrete, executable configuration for an AI agent.

Target Model for this Agent: "${modelToUse}"

Approved Built-in Tools (STRICT ALLOWLIST - ONLY use tools from this list, DO NOT invent tools):
- "calculator": For mathematical evaluations and arithmetic calculations.
- "text_processor": For text summarization, keyword extraction, and string manipulation.
- "datetime": For date/time calculations, timestamps, and day-of-week queries.

CRITICAL RULES:
1. ONLY enable tools that are strictly relevant to the agent's stated purpose. If no tools are needed, return an empty array [].
2. Provide high-quality, comprehensive "instructions" (system prompt) that specify the agent's persona, reasoning rules, boundaries, and expected output format.
3. You MUST respond with ONLY a single valid JSON object. Do NOT include markdown code blocks, introductory text, or explanations outside the JSON object.

JSON Schema format:
{
  "name": "Short Name (2-60 chars)",
  "description": "One sentence summary (max 200 chars)",
  "instructions": "Detailed system instructions explaining behavior and tool usage...",
  "model": "${modelToUse}",
  "tools": ["calculator", "text_processor"],
  "parameters": {
    "temperature": 0.7,
    "maxTokens": 1024
  },
  "limits": {
    "maxTurns": 3,
    "timeoutSeconds": 30
  }
}`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      model: modelToUse,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Create an agent for the following purpose: "${purpose.trim()}"` },
      ],
      temperature: 0.3,
      max_tokens: 1500,
      response_format: { type: 'json_object' },
    });

    const rawContent = chatCompletion.choices?.[0]?.message?.content;
    if (!rawContent) {
      throw new AiServiceError(
        'Empty response received from Groq AI provider.',
        502,
        'EMPTY_PROVIDER_RESPONSE'
      );
    }

    let parsedJson;
    try {
      parsedJson = extractJsonObject(rawContent);
    } catch (parseError) {
      throw new AiServiceError(
        'AI provider returned malformed JSON configuration.',
        502,
        'MALFORMED_AI_RESPONSE',
        rawContent
      );
    }

    // Strictly enforce that the validated proposal's model matches the verified model actually used
    const validatedProposal = sanitizeAndValidateProposal(parsedJson, modelToUse);

    return {
      proposal: validatedProposal,
      provider: 'groq',
      modelUsed: modelToUse,
      usage: chatCompletion.usage || null,
    };
  } catch (error) {
    throw mapProviderError(error);
  }
};
