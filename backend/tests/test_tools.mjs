import assert from 'assert';
import {
  evaluate,
  calculatorTool,
  CalculatorError,
  InvalidTokenError,
  InputTooLongError,
  MaxDepthExceededError,
  DivisionByZeroError,
  ArithmeticOverflowError,
  DomainError,
  SyntaxError,
} from '../src/tools/calculator.js';

import {
  textProcessorTool,
  TextProcessorError,
} from '../src/tools/textProcessor.js';

import {
  dateTimeTool,
  DateTimeError,
} from '../src/tools/dateTime.js';

import {
  getTool,
  getAllTools,
  getToolsForAgent,
  getToolSchemasForAgent,
  validateAgentToolAccess,
  executeTool,
} from '../src/services/toolService.js';

console.log('====================================================');
console.log('=== Fable Phase 5: Built-in Tool Registry Sandbox ===');
console.log('====================================================\n');

let totalTests = 0;
let passedTests = 0;

function test(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    Error: ${err.message}`);
    throw err;
  }
}

async function asyncTest(name, fn) {
  totalTests++;
  try {
    await fn();
    console.log(`  ✓ ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    Error: ${err.message}`);
    throw err;
  }
}

// ---------------------------------------------------------
// 1. Safe Calculator Unit Tests (Implementation Plan §1.2)
// ---------------------------------------------------------
console.log('1. Safe Calculator Evaluator Tests:');

test('Basic operations: 10 + 2.5 * 4 -> 20', () => {
  assert.strictEqual(evaluate('10 + 2.5 * 4'), 20);
});

test('Operator precedence: 2 + 3 * 4 -> 14 (not 20)', () => {
  assert.strictEqual(evaluate('2 + 3 * 4'), 14);
});

test('Exponentiation right-associativity: 2 ^ 3 ^ 2 -> 512 (2 ^ 9, not 8 ^ 2 = 64)', () => {
  assert.strictEqual(evaluate('2 ^ 3 ^ 2'), 512);
});

test('Parentheses & nested functions: sqrt(100) + abs(-15) -> 25', () => {
  assert.strictEqual(evaluate('sqrt(100) + abs(-15)'), 25);
});

test('Mathematical functions: round(3.6), floor(3.9), ceil(3.1)', () => {
  assert.strictEqual(evaluate('round(3.6)'), 4);
  assert.strictEqual(evaluate('floor(3.9)'), 3);
  assert.strictEqual(evaluate('ceil(3.1)'), 4);
});

test('Mathematical constants: pi and e', () => {
  assert.strictEqual(Math.round(evaluate('pi * 2') * 100) / 100, 6.28);
  assert.strictEqual(Math.round(evaluate('e + 1') * 100) / 100, 3.72);
});

test('Unary operators and negative numbers', () => {
  assert.strictEqual(evaluate('-5 + 10'), 5);
  assert.strictEqual(evaluate('-(3 + 2) * 4'), -20);
  assert.strictEqual(evaluate('+15 - -5'), 20);
});

test('Floating point precision handling', () => {
  assert.strictEqual(evaluate('0.1 + 0.2'), 0.3);
});

test('Modulo operator: 17 % 5 -> 2', () => {
  assert.strictEqual(evaluate('17 % 5'), 2);
});

// Rejection & Boundary Tests
test('Division by zero throws DivisionByZeroError', () => {
  assert.throws(() => evaluate('10 / 0'), DivisionByZeroError);
});

test('Modulo by zero throws DivisionByZeroError', () => {
  assert.throws(() => evaluate('10 % 0'), DivisionByZeroError);
});

test('Negative square root throws DomainError', () => {
  assert.throws(() => evaluate('sqrt(-4)'), DomainError);
});

test('Maximum nesting depth exceeded (> 10) throws MaxDepthExceededError', () => {
  assert.throws(() => evaluate('(((((((((((1)))))))))))'), MaxDepthExceededError);
});

test('Expression exceeding 120 characters throws InputTooLongError', () => {
  const longExpr = '1 + '.repeat(35) + '1'; // 141 chars
  assert.throws(() => evaluate(longExpr), InputTooLongError);
});

test('Exponent overflow (> 1000) throws ArithmeticOverflowError', () => {
  assert.throws(() => evaluate('2 ^ 1001'), ArithmeticOverflowError);
});

test('Rejects arbitrary code injection: require("fs")', () => {
  assert.throws(() => evaluate("require('fs')"), InvalidTokenError);
});

test('Rejects arbitrary code injection: eval("2+2")', () => {
  assert.throws(() => evaluate('eval("2+2")'), InvalidTokenError);
});

test('Rejects process access: process.exit()', () => {
  assert.throws(() => evaluate('process.exit()'), InvalidTokenError);
});

test('Rejects prototype pollution / JS keywords: constructor, prototype, global', () => {
  assert.throws(() => evaluate('constructor.constructor("return 1")()'), InvalidTokenError);
  assert.throws(() => evaluate('prototype'), InvalidTokenError);
  assert.throws(() => evaluate('global.process'), InvalidTokenError);
  assert.throws(() => evaluate('__proto__'), InvalidTokenError);
});

test('Rejects malformed syntax: 2 + * 3', () => {
  assert.throws(() => evaluate('2 + * 3'), SyntaxError);
});

test('Rejects unclosed parenthesis: (2 + 3', () => {
  assert.throws(() => evaluate('(2 + 3'), SyntaxError);
});

test('Rejects non-string input', () => {
  assert.throws(() => evaluate(123), CalculatorError);
  assert.throws(() => evaluate(null), CalculatorError);
});

test('Rejects empty or whitespace-only expression', () => {
  assert.throws(() => evaluate('   '), CalculatorError);
});

// ---------------------------------------------------------
// 2. Text Processor Unit Tests (PRD TOOL-02)
// ---------------------------------------------------------
console.log('\n2. Text Processor Tests:');

await asyncTest('Text Processor: summarize long text', async () => {
  const sample = 'Fable is an AI developer platform. It empowers engineers to build autonomous agents easily. The platform provides built-in tools like calculators and text analyzers. Every execution is audited and persisted.';
  const res = await textProcessorTool.execute({
    action: 'summarize',
    text: sample,
    options: { maxLength: 80 },
  });
  assert.strictEqual(res.action, 'summarize');
  assert.ok(res.summary.length <= 80);
  assert.strictEqual(res.truncated, true);
  assert.strictEqual(res.originalLength, sample.length);
});

await asyncTest('Text Processor: summarize short text returns intact', async () => {
  const sample = 'Short note.';
  const res = await textProcessorTool.execute({
    action: 'summarize',
    text: sample,
    options: { maxLength: 100 },
  });
  assert.strictEqual(res.summary, 'Short note.');
  assert.strictEqual(res.truncated, false);
});

await asyncTest('Text Processor: extract_keywords with stop words filtering', async () => {
  const sample = 'The quick brown fox jumps over the lazy dog. The fox was very quick and smart.';
  const res = await textProcessorTool.execute({
    action: 'extract_keywords',
    text: sample,
    options: { topN: 3 },
  });
  assert.strictEqual(res.action, 'extract_keywords');
  assert.ok(Array.isArray(res.keywords));
  assert.strictEqual(res.keywords.length, 3);
  // 'fox' or 'quick' should be the most frequent
  assert.ok(res.keywords.some((k) => k.keyword === 'fox' && k.count === 2));
  assert.ok(res.keywords.some((k) => k.keyword === 'quick' && k.count === 2));
});

await asyncTest('Text Processor: word_count statistics', async () => {
  const sample = 'One two three four. Five six seven!';
  const res = await textProcessorTool.execute({
    action: 'word_count',
    text: sample,
  });
  assert.strictEqual(res.action, 'word_count');
  assert.strictEqual(res.wordCount, 7);
  assert.strictEqual(res.characterCount, sample.length);
  assert.strictEqual(res.sentenceCount, 2);
  assert.ok(res.estimatedReadingTimeSeconds > 0);
});

await asyncTest('Text Processor: format uppercase, lowercase, titlecase, slugify', async () => {
  const resUpper = await textProcessorTool.execute({ action: 'format', text: 'fable platform', options: { formatType: 'uppercase' } });
  assert.strictEqual(resUpper.formatted, 'FABLE PLATFORM');

  const resTitle = await textProcessorTool.execute({ action: 'format', text: 'fable platform guide', options: { formatType: 'titlecase' } });
  assert.strictEqual(resTitle.formatted, 'Fable Platform Guide');

  const resSlug = await textProcessorTool.execute({ action: 'format', text: 'Fable: Agent Workshop 2026!', options: { formatType: 'slugify' } });
  assert.strictEqual(resSlug.formatted, 'fable-agent-workshop-2026');
});

await asyncTest('Text Processor: rejection of invalid action', async () => {
  await assert.rejects(
    () => textProcessorTool.execute({ action: 'unsupported_op', text: 'hello' }),
    TextProcessorError
  );
});

await asyncTest('Text Processor: rejection of text exceeding 10,000 characters', async () => {
  const hugeText = 'a'.repeat(10001);
  await assert.rejects(
    () => textProcessorTool.execute({ action: 'word_count', text: hugeText }),
    TextProcessorError
  );
});

await asyncTest('Text Processor: rejection of non-string text', async () => {
  await assert.rejects(
    () => textProcessorTool.execute({ action: 'word_count', text: 12345 }),
    TextProcessorError
  );
});

// ---------------------------------------------------------
// 3. Date / Time Utility Unit Tests (PRD TOOL-03)
// ---------------------------------------------------------
console.log('\n3. Date / Time Utility Tests:');

await asyncTest('DateTime: now with UTC and specific timezone', async () => {
  const resUtc = await dateTimeTool.execute({ operation: 'now', timezone: 'UTC' });
  assert.strictEqual(resUtc.operation, 'now');
  assert.strictEqual(resUtc.timezone, 'UTC');
  assert.ok(typeof resUtc.iso === 'string');
  assert.ok(typeof resUtc.epochMs === 'number');
  assert.ok(typeof resUtc.dayOfWeek === 'string');

  const resNyc = await dateTimeTool.execute({ operation: 'now', timezone: 'America/New_York' });
  assert.strictEqual(resNyc.timezone, 'America/New_York');
});

await asyncTest('DateTime: diff calculates accurate intervals between two timestamps', async () => {
  const start = '2026-10-15T00:00:00Z';
  const end = '2026-10-17T12:00:00Z'; // 2.5 days = 60 hours = 3600 minutes
  const res = await dateTimeTool.execute({
    operation: 'diff',
    startDate: start,
    endDate: end,
  });
  assert.strictEqual(res.operation, 'diff');
  assert.strictEqual(res.days, 2.5);
  assert.strictEqual(res.hours, 60);
  assert.strictEqual(res.minutes, 3600);
  assert.strictEqual(res.isPast, false);
});

await asyncTest('DateTime: add duration to ISO timestamp', async () => {
  const base = '2026-01-01T00:00:00Z';
  const res = await dateTimeTool.execute({
    operation: 'add',
    date: base,
    duration: { days: 10, hours: 5 },
  });
  assert.strictEqual(res.operation, 'add');
  assert.strictEqual(res.originalDate, '2026-01-01T00:00:00.000Z');
  assert.strictEqual(res.newDate, '2026-01-11T05:00:00.000Z');
});

await asyncTest('DateTime: format ISO date with locale styling', async () => {
  const dateStr = '2026-12-25T15:30:00Z';
  const res = await dateTimeTool.execute({
    operation: 'format',
    date: dateStr,
    timezone: 'UTC',
  });
  assert.strictEqual(res.operation, 'format');
  assert.ok(res.formatted.includes('2026'));
  assert.strictEqual(res.dayOfWeek, 'Friday');
});

await asyncTest('DateTime: rejection of invalid timezone', async () => {
  await assert.rejects(
    () => dateTimeTool.execute({ operation: 'now', timezone: 'Mars/Curiosity' }),
    DateTimeError
  );
});

await asyncTest('DateTime: rejection of malformed ISO date', async () => {
  await assert.rejects(
    () => dateTimeTool.execute({ operation: 'format', date: 'not-a-valid-date' }),
    DateTimeError
  );
});

// ---------------------------------------------------------
// 4. Built-in Tool Registry Sandbox & Permissions (PRD TOOL-07..10)
// ---------------------------------------------------------
console.log('\n4. Tool Registry Sandbox & Permission Tests:');

test('Registry contains all 3 built-in tools', () => {
  const tools = getAllTools();
  assert.strictEqual(tools.length, 3);
  const toolNames = tools.map((t) => t.name);
  assert.ok(toolNames.includes('calculator'));
  assert.ok(toolNames.includes('text_processor'));
  assert.ok(toolNames.includes('datetime'));
});

test('Schema generation outputs valid Groq/OpenAI tool format', () => {
  const mockAgent = {
    name: 'Finance Agent',
    tools: ['calculator', 'datetime'],
  };
  const schemas = getToolSchemasForAgent(mockAgent);
  assert.strictEqual(schemas.length, 2);
  assert.strictEqual(schemas[0].type, 'function');
  assert.strictEqual(schemas[0].function.name, 'calculator');
  assert.ok(schemas[0].function.parameters.properties.expression);
  assert.strictEqual(schemas[1].function.name, 'datetime');
});

test('Permission check: authorized agent succeeds', () => {
  const mockAgent = { name: 'Math Agent', tools: ['calculator'] };
  assert.strictEqual(validateAgentToolAccess(mockAgent, 'calculator'), true);
});

test('Permission check: unauthorized tool fails with TOOL_PERMISSION_DENIED', () => {
  const mockAgent = { name: 'Simple Agent', tools: ['calculator'] };
  assert.throws(
    () => validateAgentToolAccess(mockAgent, 'datetime'),
    (err) => err.code === 'TOOL_PERMISSION_DENIED'
  );
});

test('Permission check: unapproved tool fails with TOOL_NOT_APPROVED', () => {
  const mockAgent = { name: 'Hacker Agent', tools: ['calculator'] };
  assert.throws(
    () => validateAgentToolAccess(mockAgent, 'arbitrary_bash'),
    (err) => err.code === 'TOOL_NOT_APPROVED'
  );
});

await asyncTest('executeTool: successful sandboxed calculator execution', async () => {
  const mockAgent = { name: 'Calc Agent', tools: ['calculator'] };
  const result = await executeTool(
    'calculator',
    { expression: '25 * 4 + sqrt(81)' },
    { agent: mockAgent }
  );

  assert.strictEqual(result.tool, 'calculator');
  assert.strictEqual(result.isError, false);
  assert.strictEqual(result.error, null);
  assert.strictEqual(result.output.result, 109);
  assert.ok(typeof result.durationMs === 'number');
});

await asyncTest('executeTool: unauthorized tool call captured as error (TOOL-09)', async () => {
  const mockAgent = { name: 'Calc Agent', tools: ['calculator'] };
  const result = await executeTool(
    'text_processor',
    { action: 'word_count', text: 'Hello' },
    { agent: mockAgent }
  );

  assert.strictEqual(result.tool, 'text_processor');
  assert.strictEqual(result.isError, true);
  assert.strictEqual(result.output, null);
  assert.strictEqual(result.error.code, 'TOOL_PERMISSION_DENIED');
});

await asyncTest('executeTool: runtime error in tool captured without crash (TOOL-09)', async () => {
  const mockAgent = { name: 'Calc Agent', tools: ['calculator'] };
  const result = await executeTool(
    'calculator',
    { expression: '100 / 0' },
    { agent: mockAgent }
  );

  assert.strictEqual(result.tool, 'calculator');
  assert.strictEqual(result.isError, true);
  assert.strictEqual(result.error.code, 'DIVISION_BY_ZERO');
  assert.strictEqual(result.output, null);
});

await asyncTest('executeTool: nonexistent tool captured gracefully', async () => {
  const result = await executeTool('nonexistent_tool', {});
  assert.strictEqual(result.isError, true);
  assert.strictEqual(result.error.code, 'TOOL_NOT_FOUND');
});

console.log(`\n====================================================`);
console.log(`=== All ${passedTests} / ${totalTests} Phase 5 Tool Tests PASSED Successfully! ===`);
console.log(`====================================================\n`);
