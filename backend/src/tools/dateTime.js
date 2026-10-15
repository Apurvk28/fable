/**
 * Fable Built-in Tool: Date / Time Utility
 * PRD: TOOL-03, TOOL-08, TOOL-10
 * 
 * Provides deterministic date and time calculations:
 * - Current timestamp resolution (now) with timezone awareness
 * - Date difference calculation (diff) in days, hours, minutes, seconds
 * - Date arithmetic (add / subtract duration)
 * - Safe formatting and day-of-week resolution
 * 
 * Safety & Input Limits:
 * - Strict ISO-8601 validation.
 * - Timezone validation using native Intl API.
 * - Rejects malformed dates and invalid arguments safely.
 */

export class DateTimeError extends Error {
  constructor(message, code = 'DATETIME_ERROR') {
    super(message);
    this.name = 'DateTimeError';
    this.code = code;
  }
}

const VALID_OPERATIONS = ['now', 'diff', 'add', 'format'];

/**
 * Validates whether a timezone identifier is supported by Intl
 */
function assertValidTimezone(timeZone) {
  if (!timeZone || typeof timeZone !== 'string') return 'UTC';
  const tz = timeZone.trim();
  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz });
    return tz;
  } catch (err) {
    throw new DateTimeError(`Invalid or unsupported timezone identifier: "${timeZone}".`, 'INVALID_TIMEZONE');
  }
}

/**
 * Safely parse an ISO date string into a Date instance
 */
function parseDate(dateStr, paramName = 'date') {
  if (!dateStr || typeof dateStr !== 'string') {
    throw new DateTimeError(`Parameter "${paramName}" must be a valid ISO-8601 date string.`, 'INVALID_DATE_INPUT');
  }

  const d = new Date(dateStr.trim());
  if (isNaN(d.getTime())) {
    throw new DateTimeError(`Unable to parse "${dateStr}" into a valid date. Provide a standard ISO-8601 format (e.g. "2026-10-15T12:00:00Z").`, 'INVALID_DATE_FORMAT');
  }
  return d;
}

/**
 * Get current time with timezone details
 */
function getCurrentTime(timeZone = 'UTC') {
  const tz = assertValidTimezone(timeZone);
  const now = new Date();

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    weekday: 'long',
    hour12: false,
  });

  return {
    iso: now.toISOString(),
    epochMs: now.getTime(),
    timezone: tz,
    localized: formatter.format(now),
    dayOfWeek: new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'long' }).format(now),
  };
}

/**
 * Calculate the difference between two dates
 */
function calculateDiff(startDateStr, endDateStr, unit = 'all') {
  const start = parseDate(startDateStr, 'startDate');
  const end = parseDate(endDateStr, 'endDate');

  const diffMs = end.getTime() - start.getTime();
  const diffSeconds = Math.round(diffMs / 1000);
  const diffMinutes = Math.round(diffMs / (1000 * 60));
  const diffHours = Number((diffMs / (1000 * 60 * 60)).toFixed(2));
  const diffDays = Number((diffMs / (1000 * 60 * 60 * 24)).toFixed(2));

  return {
    startDate: start.toISOString(),
    endDate: end.toISOString(),
    milliseconds: diffMs,
    seconds: diffSeconds,
    minutes: diffMinutes,
    hours: diffHours,
    days: diffDays,
    isPast: diffMs < 0,
  };
}

/**
 * Add or subtract duration from an ISO date
 */
function addDuration(dateStr, { years = 0, months = 0, days = 0, hours = 0, minutes = 0, seconds = 0 }) {
  const date = parseDate(dateStr, 'date');

  // Clone date
  const result = new Date(date.getTime());

  if (years) result.setUTCFullYear(result.getUTCFullYear() + Number(years));
  if (months) result.setUTCMonth(result.getUTCMonth() + Number(months));
  if (days) result.setUTCDate(result.getUTCDate() + Number(days));
  if (hours) result.setUTCHours(result.getUTCHours() + Number(hours));
  if (minutes) result.setUTCMinutes(result.getUTCMinutes() + Number(minutes));
  if (seconds) result.setUTCSeconds(result.getUTCSeconds() + Number(seconds));

  if (isNaN(result.getTime())) {
    throw new DateTimeError('Resulting date is out of range or invalid.', 'DATE_OUT_OF_RANGE');
  }

  return {
    originalDate: date.toISOString(),
    newDate: result.toISOString(),
    added: { years, months, days, hours, minutes, seconds },
  };
}

/**
 * Format a date with timezone and styling
 */
function formatDate(dateStr, timeZone = 'UTC') {
  const date = parseDate(dateStr, 'date');
  const tz = assertValidTimezone(timeZone);

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    dateStyle: 'full',
    timeStyle: 'long',
  });

  return {
    iso: date.toISOString(),
    timezone: tz,
    formatted: formatter.format(date),
    dayOfWeek: new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'long' }).format(date),
  };
}

/**
 * DateTime tool definition for Tool Registry
 */
export const dateTimeTool = {
  name: 'datetime',
  description: 'Deterministic date and time calculations: current timestamps, timezone conversions, date differences, and arithmetic.',
  parameters: {
    type: 'object',
    properties: {
      operation: {
        type: 'string',
        enum: ['now', 'diff', 'add', 'format'],
        description: 'The date/time operation to perform.',
      },
      date: {
        type: 'string',
        description: 'ISO-8601 date string for "format" or "add" operations (e.g. "2026-10-15T00:00:00Z").',
      },
      startDate: {
        type: 'string',
        description: 'Start date ISO string for "diff" operation.',
      },
      endDate: {
        type: 'string',
        description: 'End date ISO string for "diff" operation.',
      },
      timezone: {
        type: 'string',
        description: 'Valid IANA timezone identifier (e.g. "UTC", "America/New_York", "Asia/Kolkata"). Default: "UTC".',
      },
      duration: {
        type: 'object',
        description: 'Duration to add or subtract for "add" operation.',
        properties: {
          years: { type: 'number' },
          months: { type: 'number' },
          days: { type: 'number' },
          hours: { type: 'number' },
          minutes: { type: 'number' },
          seconds: { type: 'number' },
        },
      },
    },
    required: ['operation'],
  },
  execute: async ({ operation, date, startDate, endDate, timezone = 'UTC', duration = {} }) => {
    if (!operation || typeof operation !== 'string') {
      throw new DateTimeError('Parameter "operation" is required and must be a string.', 'MISSING_OPERATION');
    }
    const cleanOp = operation.trim().toLowerCase();
    if (!VALID_OPERATIONS.includes(cleanOp)) {
      throw new DateTimeError(
        `Invalid operation "${operation}". Supported operations: ${VALID_OPERATIONS.join(', ')}.`,
        'INVALID_OPERATION'
      );
    }

    switch (cleanOp) {
      case 'now':
        return {
          operation: 'now',
          ...getCurrentTime(timezone),
        };
      case 'diff':
        if (!startDate || !endDate) {
          throw new DateTimeError('Operation "diff" requires both "startDate" and "endDate" parameters.', 'MISSING_DIFF_DATES');
        }
        return {
          operation: 'diff',
          ...calculateDiff(startDate, endDate),
        };
      case 'add':
        if (!date) {
          throw new DateTimeError('Operation "add" requires a base "date" parameter.', 'MISSING_DATE');
        }
        return {
          operation: 'add',
          ...addDuration(date, duration),
        };
      case 'format':
        if (!date) {
          throw new DateTimeError('Operation "format" requires a "date" parameter.', 'MISSING_DATE');
        }
        return {
          operation: 'format',
          ...formatDate(date, timezone),
        };
      default:
        throw new DateTimeError(`Unhandled operation "${cleanOp}".`, 'UNHANDLED_OPERATION');
    }
  },
};
