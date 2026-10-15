/**
 * Fable Built-in Tool: Text Processor
 * PRD: TOOL-02, TOOL-08, TOOL-10
 * 
 * Provides deterministic text processing capabilities:
 * - Summarization (sentence/length-bounded key excerpt extraction)
 * - Keyword extraction (frequency-ranked with common stop-word filtering)
 * - Text statistics (word, character, sentence count, estimated reading time)
 * - Text transformation (uppercase, lowercase, titlecase, slugify)
 * 
 * Safety & Input Limits:
 * - Max input text length: 10,000 characters.
 * - Strict argument validation with descriptive errors.
 */

export class TextProcessorError extends Error {
  constructor(message, code = 'TEXT_PROCESSOR_ERROR') {
    super(message);
    this.name = 'TextProcessorError';
    this.code = code;
  }
}

const MAX_TEXT_LENGTH = 10000;
const VALID_ACTIONS = ['summarize', 'extract_keywords', 'word_count', 'format'];

const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and',
  'any', 'are', 'aren\'t', 'as', 'at', 'be', 'because', 'been', 'before', 'being',
  'below', 'between', 'both', 'but', 'by', 'can', 'can\'t', 'cannot', 'could',
  'couldn\'t', 'did', 'didn\'t', 'do', 'does', 'doesn\'t', 'doing', 'don\'t',
  'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had', 'hadn\'t',
  'has', 'hasn\'t', 'have', 'haven\'t', 'having', 'he', 'he\'d', 'he\'ll', 'he\'s',
  'her', 'here', 'here\'s', 'hers', 'herself', 'him', 'himself', 'his', 'how',
  'how\'s', 'i', 'i\'d', 'i\'ll', 'i\'m', 'i\'ve', 'if', 'in', 'into', 'is',
  'isn\'t', 'it', 'it\'s', 'its', 'itself', 'let\'s', 'me', 'more', 'most',
  'mustn\'t', 'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once',
  'only', 'or', 'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over',
  'own', 'same', 'shan\'t', 'she', 'she\'d', 'she\'ll', 'she\'s', 'should',
  'shouldn\'t', 'so', 'some', 'such', 'than', 'that', 'that\'s', 'the', 'their',
  'theirs', 'them', 'themselves', 'then', 'there', 'there\'s', 'these', 'they',
  'they\'d', 'they\'ll', 'they\'re', 'they\'ve', 'this', 'those', 'through',
  'to', 'too', 'under', 'until', 'up', 'very', 'was', 'wasn\'t', 'we', 'we\'d',
  'we\'ll', 'we\'re', 'we\'ve', 'were', 'weren\'t', 'what', 'what\'s', 'when',
  'when\'s', 'where', 'where\'s', 'which', 'while', 'who', 'who\'s', 'whom',
  'why', 'why\'s', 'with', 'won\'t', 'would', 'wouldn\'t', 'you', 'you\'d',
  'you\'ll', 'you\'re', 'you\'ve', 'your', 'yours', 'yourself', 'yourselves'
]);

/**
 * Summarize text by condensing to the first N sentences or max character boundary
 */
function summarize(text, maxLength = 250) {
  const clean = text.trim();
  if (clean.length <= maxLength) {
    return {
      summary: clean,
      originalLength: clean.length,
      summaryLength: clean.length,
      truncated: false,
    };
  }

  // Sentence split
  const sentences = clean.match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g) || [clean];
  let accumulated = '';

  for (const s of sentences) {
    const candidate = (accumulated ? `${accumulated} ` : '') + s.trim();
    if (candidate.length <= maxLength) {
      accumulated = candidate;
    } else {
      break;
    }
  }

  // If even the first sentence exceeds maxLength, truncate at word boundary
  if (!accumulated) {
    const words = clean.slice(0, maxLength).split(/\s+/);
    if (words.length > 1) {
      words.pop(); // Remove partial word
    }
    accumulated = `${words.join(' ')}...`;
  }

  return {
    summary: accumulated,
    originalLength: clean.length,
    summaryLength: accumulated.length,
    truncated: true,
  };
}

/**
 * Extract frequent significant keywords
 */
function extractKeywords(text, topN = 5) {
  const limit = Math.max(1, Math.min(20, Number(topN) || 5));
  // Tokenize words, removing punctuation
  const words = text
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w) && !/^\d+$/.test(w));

  const frequencies = {};
  for (const w of words) {
    frequencies[w] = (frequencies[w] || 0) + 1;
  }

  const sorted = Object.entries(frequencies)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([keyword, count]) => ({ keyword, count }));

  return {
    keywords: sorted,
    totalUniqueTokens: Object.keys(frequencies).length,
  };
}

/**
 * Calculate structural statistics of a string
 */
function getWordCount(text) {
  const trimmed = text.trim();
  const words = trimmed ? trimmed.split(/\s+/).filter(Boolean) : [];
  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, '').length;
  const lines = text ? text.split(/\r\n|\r|\n/).length : 0;
  const sentences = trimmed ? (trimmed.match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g) || []).length : 0;
  
  // Average reading speed: 200 words per minute
  const readingTimeSeconds = Math.ceil((words.length / 200) * 60);

  return {
    wordCount: words.length,
    characterCount: characters,
    characterCountNoSpaces: charactersNoSpaces,
    sentenceCount: sentences,
    lineCount: lines,
    estimatedReadingTimeSeconds: readingTimeSeconds,
  };
}

/**
 * Apply casing / slugification transforms
 */
function formatText(text, formatType = 'lowercase') {
  switch (formatType.toLowerCase()) {
    case 'uppercase':
      return { formatted: text.toUpperCase(), format: 'uppercase' };
    case 'lowercase':
      return { formatted: text.toLowerCase(), format: 'lowercase' };
    case 'titlecase': {
      const formatted = text.replace(
        /\w\S*/g,
        (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
      );
      return { formatted, format: 'titlecase' };
    }
    case 'slugify': {
      const slug = text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
      return { formatted: slug, format: 'slugify' };
    }
    default:
      throw new TextProcessorError(
        `Unknown formatType "${formatType}". Allowed types: uppercase, lowercase, titlecase, slugify.`,
        'INVALID_FORMAT_TYPE'
      );
  }
}

/**
 * Text processor tool definition for Tool Registry
 */
export const textProcessorTool = {
  name: 'text_processor',
  description: 'Deterministic text processing: summarization, keyword extraction, word counts, and formatting.',
  parameters: {
    type: 'object',
    properties: {
      action: {
        type: 'string',
        enum: ['summarize', 'extract_keywords', 'word_count', 'format'],
        description: 'The text processing action to execute.',
      },
      text: {
        type: 'string',
        description: 'The input text string to process (max 10,000 characters).',
      },
      options: {
        type: 'object',
        description: 'Optional configuration per action (e.g., maxLength for summarize, topN for extract_keywords, formatType for format).',
        properties: {
          maxLength: { type: 'number', description: 'Target character length for summarize (default: 250).' },
          topN: { type: 'number', description: 'Number of top keywords to extract (default: 5, max: 20).' },
          formatType: { type: 'string', enum: ['uppercase', 'lowercase', 'titlecase', 'slugify'], description: 'Desired casing/slug format.' },
        },
      },
    },
    required: ['action', 'text'],
  },
  execute: async ({ action, text, options = {} }) => {
    if (!action || typeof action !== 'string') {
      throw new TextProcessorError('Parameter "action" is required and must be a string.', 'MISSING_ACTION');
    }
    const cleanAction = action.trim().toLowerCase();
    if (!VALID_ACTIONS.includes(cleanAction)) {
      throw new TextProcessorError(
        `Invalid action "${action}". Supported actions: ${VALID_ACTIONS.join(', ')}.`,
        'INVALID_ACTION'
      );
    }

    if (typeof text !== 'string') {
      throw new TextProcessorError('Parameter "text" must be a string.', 'INVALID_TEXT_TYPE');
    }

    if (text.length > MAX_TEXT_LENGTH) {
      throw new TextProcessorError(
        `Input text length (${text.length}) exceeds maximum limit of ${MAX_TEXT_LENGTH} characters.`,
        'TEXT_TOO_LONG'
      );
    }

    switch (cleanAction) {
      case 'summarize':
        return {
          action: 'summarize',
          ...summarize(text, options.maxLength),
        };
      case 'extract_keywords':
        return {
          action: 'extract_keywords',
          ...extractKeywords(text, options.topN),
        };
      case 'word_count':
        return {
          action: 'word_count',
          ...getWordCount(text),
        };
      case 'format':
        return {
          action: 'format',
          ...formatText(text, options.formatType),
        };
      default:
        throw new TextProcessorError(`Unhandled action "${cleanAction}".`, 'UNHANDLED_ACTION');
    }
  },
};
