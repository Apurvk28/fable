/**
 * Fable Built-in Tool: Safe Calculator
 * 
 * Formal Specification (Implementation Plan Section 1.2):
 * Expression   ::= Term ( ('+' | '-') Term )*
 * Term         ::= Power ( ('*' | '/' | '%') Power )*
 * Power        ::= Factor ( '^' Power )*      (* Right-associative exponentiation *)
 * Factor       ::= ('+' | '-')? Primary
 * Primary      ::= NUMBER | FunctionCall | '(' Expression ')'
 * FunctionCall ::= ('sqrt' | 'abs' | 'round' | 'floor' | 'ceil') '(' Expression ')'
 * NUMBER       ::= [0-9]+ ('.' [0-9]+)?
 * 
 * Safety & Security Guarantees:
 * - Zero external dependencies.
 * - Zero usage of eval(), Function(), or VM execution.
 * - Zero prototype pollution or global scope access.
 * - Strict length limit: max 120 characters.
 * - Strict lexical character allowlist: ^[0-9+\\-*\\/%^().\\s,a-zA-Z]+$
 * - Strict identifier allowlist: sqrt, abs, round, floor, ceil, pi, e.
 * - Strict parenthesis nesting depth limit: max 10.
 * - Explicit DivisionByZeroError and ArithmeticOverflowError.
 */

export class CalculatorError extends Error {
  constructor(message, code = 'CALCULATOR_ERROR') {
    super(message);
    this.name = 'CalculatorError';
    this.code = code;
  }
}

export class InvalidTokenError extends CalculatorError {
  constructor(token) {
    super(`Invalid or disallowed token in mathematical expression: "${token}".`, 'INVALID_TOKEN');
  }
}

export class InputTooLongError extends CalculatorError {
  constructor(length, max = 120) {
    super(`Expression length (${length}) exceeds maximum allowed limit of ${max} characters.`, 'INPUT_TOO_LONG');
  }
}

export class MaxDepthExceededError extends CalculatorError {
  constructor(depth, max = 10) {
    super(`Expression nesting depth (${depth}) exceeds maximum limit of ${max}.`, 'MAX_DEPTH_EXCEEDED');
  }
}

export class DivisionByZeroError extends CalculatorError {
  constructor() {
    super('Division or modulo by zero is undefined.', 'DIVISION_BY_ZERO');
  }
}

export class ArithmeticOverflowError extends CalculatorError {
  constructor(details = '') {
    super(`Arithmetic operation resulted in non-finite value or overflow.${details ? ` (${details})` : ''}`, 'ARITHMETIC_OVERFLOW');
  }
}

export class DomainError extends CalculatorError {
  constructor(func, arg) {
    super(`Domain error: ${func}(${arg}) is undefined for real numbers.`, 'DOMAIN_ERROR');
  }
}

export class SyntaxError extends CalculatorError {
  constructor(message) {
    super(`Syntax error: ${message}`, 'SYNTAX_ERROR');
  }
}

const ALLOWED_CHARS_REGEX = /^[0-9+\-*/%^().\s,a-zA-Z]+$/;
const ALLOWED_FUNCTIONS = new Set(['sqrt', 'abs', 'round', 'floor', 'ceil']);
const ALLOWED_CONSTANTS = {
  pi: Math.PI,
  e: Math.E,
};

const MAX_EXPRESSION_LENGTH = 120;
const MAX_NESTING_DEPTH = 10;
const MAX_EXPONENT = 1000;

/**
 * Tokenizer / Lexer for arithmetic expressions
 */
function tokenize(expression) {
  const tokens = [];
  let i = 0;
  const len = expression.length;

  while (i < len) {
    const ch = expression[i];

    // Skip whitespace
    if (/\s/.test(ch)) {
      i++;
      continue;
    }

    // Number literal (integer or floating point)
    if (/[0-9]/.test(ch) || (ch === '.' && i + 1 < len && /[0-9]/.test(expression[i + 1]))) {
      let numStr = '';
      let hasDot = false;
      while (i < len && (/[0-9]/.test(expression[i]) || expression[i] === '.')) {
        if (expression[i] === '.') {
          if (hasDot) {
            throw new SyntaxError(`Multiple decimal points in number literal at index ${i}.`);
          }
          hasDot = true;
        }
        numStr += expression[i];
        i++;
      }
      tokens.push({ type: 'NUMBER', value: parseFloat(numStr) });
      continue;
    }

    // Identifiers: functions or constants
    if (/[a-zA-Z]/.test(ch)) {
      let ident = '';
      while (i < len && /[a-zA-Z0-9_]/.test(expression[i])) {
        ident += expression[i];
        i++;
      }
      const lower = ident.toLowerCase();
      if (ALLOWED_FUNCTIONS.has(lower)) {
        tokens.push({ type: 'FUNCTION', value: lower });
      } else if (lower in ALLOWED_CONSTANTS) {
        tokens.push({ type: 'NUMBER', value: ALLOWED_CONSTANTS[lower] });
      } else {
        throw new InvalidTokenError(ident);
      }
      continue;
    }

    // Operators and delimiters
    if ('+-*/%^()'.includes(ch)) {
      tokens.push({ type: 'OPERATOR', value: ch });
      i++;
      continue;
    }

    // Comma (optional parameter delimiter, if needed)
    if (ch === ',') {
      tokens.push({ type: 'COMMA', value: ',' });
      i++;
      continue;
    }

    // Disallowed character
    throw new InvalidTokenError(ch);
  }

  tokens.push({ type: 'EOF', value: null });
  return tokens;
}

/**
 * Parser and Evaluator using Recursive Descent
 */
class Parser {
  constructor(tokens) {
    this.tokens = tokens;
    this.pos = 0;
    this.depth = 0;
  }

  peek() {
    return this.tokens[this.pos];
  }

  consume(expectedValue = null) {
    const token = this.peek();
    if (expectedValue !== null && token.value !== expectedValue) {
      throw new SyntaxError(`Expected "${expectedValue}", found "${token.value || token.type}" at token ${this.pos}.`);
    }
    this.pos++;
    return token;
  }

  // Expression ::= Term ( ('+' | '-') Term )*
  parseExpression() {
    let result = this.parseTerm();

    while (this.peek().type === 'OPERATOR' && (this.peek().value === '+' || this.peek().value === '-')) {
      const op = this.consume().value;
      const nextTerm = this.parseTerm();
      if (op === '+') {
        result += nextTerm;
      } else {
        result -= nextTerm;
      }
      this.assertFinite(result);
    }

    return result;
  }

  // Term ::= Power ( ('*' | '/' | '%') Power )*
  parseTerm() {
    let result = this.parsePower();

    while (
      this.peek().type === 'OPERATOR' &&
      (this.peek().value === '*' || this.peek().value === '/' || this.peek().value === '%')
    ) {
      const op = this.consume().value;
      const nextPower = this.parsePower();

      if (op === '*') {
        result *= nextPower;
      } else if (op === '/') {
        if (nextPower === 0) {
          throw new DivisionByZeroError();
        }
        result /= nextPower;
      } else if (op === '%') {
        if (nextPower === 0) {
          throw new DivisionByZeroError();
        }
        result %= nextPower;
      }
      this.assertFinite(result);
    }

    return result;
  }

  // Power ::= Factor ( '^' Power )* (Right-associative)
  parsePower() {
    const base = this.parseFactor();

    if (this.peek().type === 'OPERATOR' && this.peek().value === '^') {
      this.consume('^');
      const exponent = this.parsePower(); // Recursive call handles right-associativity

      if (Math.abs(exponent) > MAX_EXPONENT) {
        throw new ArithmeticOverflowError(`Exponent magnitude ${exponent} exceeds maximum allowed of ${MAX_EXPONENT}`);
      }

      const result = Math.pow(base, exponent);
      this.assertFinite(result);
      return result;
    }

    return base;
  }

  // Factor ::= ('+' | '-')? Primary
  parseFactor() {
    if (this.peek().type === 'OPERATOR' && (this.peek().value === '+' || this.peek().value === '-')) {
      const sign = this.consume().value;
      const primary = this.parsePrimary();
      return sign === '-' ? -primary : primary;
    }
    return this.parsePrimary();
  }

  // Primary ::= NUMBER | FunctionCall | '(' Expression ')'
  parsePrimary() {
    const token = this.peek();

    // Number literal
    if (token.type === 'NUMBER') {
      this.consume();
      return token.value;
    }

    // Function call: func '(' Expression ')'
    if (token.type === 'FUNCTION') {
      const funcName = this.consume().value;
      this.consume('(');
      this.enterDepth();
      const arg = this.parseExpression();
      this.leaveDepth();
      this.consume(')');

      let val;
      switch (funcName) {
        case 'sqrt':
          if (arg < 0) {
            throw new DomainError('sqrt', arg);
          }
          val = Math.sqrt(arg);
          break;
        case 'abs':
          val = Math.abs(arg);
          break;
        case 'round':
          val = Math.round(arg);
          break;
        case 'floor':
          val = Math.floor(arg);
          break;
        case 'ceil':
          val = Math.ceil(arg);
          break;
        default:
          throw new InvalidTokenError(funcName);
      }
      this.assertFinite(val);
      return val;
    }

    // Parenthesized sub-expression
    if (token.type === 'OPERATOR' && token.value === '(') {
      this.consume('(');
      this.enterDepth();
      const exprVal = this.parseExpression();
      this.leaveDepth();
      this.consume(')');
      return exprVal;
    }

    throw new SyntaxError(`Unexpected token "${token.value || token.type}" at position ${this.pos}.`);
  }

  enterDepth() {
    this.depth++;
    if (this.depth > MAX_NESTING_DEPTH) {
      throw new MaxDepthExceededError(this.depth, MAX_NESTING_DEPTH);
    }
  }

  leaveDepth() {
    this.depth--;
  }

  assertFinite(value) {
    if (!Number.isFinite(value) || Number.isNaN(value)) {
      throw new ArithmeticOverflowError();
    }
  }
}

/**
 * Main evaluation entrypoint
 * @param {string} rawExpression - The arithmetic expression string
 * @returns {number} The computed numeric result
 */
export function evaluate(rawExpression) {
  if (typeof rawExpression !== 'string') {
    throw new CalculatorError('Calculator expression must be a string.', 'INVALID_INPUT_TYPE');
  }

  const trimmed = rawExpression.trim();
  if (trimmed.length === 0) {
    throw new CalculatorError('Expression cannot be empty.', 'EMPTY_EXPRESSION');
  }

  if (trimmed.length > MAX_EXPRESSION_LENGTH) {
    throw new InputTooLongError(trimmed.length, MAX_EXPRESSION_LENGTH);
  }

  if (!ALLOWED_CHARS_REGEX.test(trimmed)) {
    throw new InvalidTokenError('Expression contains forbidden characters outside allowed lexical grammar.');
  }

  const tokens = tokenize(trimmed);
  const parser = new Parser(tokens);
  const result = parser.parseExpression();

  // Ensure all tokens were consumed
  if (parser.peek().type !== 'EOF') {
    throw new SyntaxError(`Unexpected trailing token "${parser.peek().value || parser.peek().type}".`);
  }

  // Round floating point inaccuracies (e.g. 0.1 + 0.2 -> 0.3)
  return Number(result.toFixed(10)) / 1;
}

/**
 * Tool handler interface for ToolService
 */
export const calculatorTool = {
  name: 'calculator',
  description: 'Deterministic arithmetic evaluator supporting addition, subtraction, multiplication, division, modulo, exponentiation, and functions (sqrt, abs, round, floor, ceil).',
  parameters: {
    type: 'object',
    properties: {
      expression: {
        type: 'string',
        description: 'The mathematical expression to evaluate (e.g., "15 * (4 + 6)", "sqrt(144) + 2^5"). Max 120 chars.',
      },
    },
    required: ['expression'],
  },
  execute: async ({ expression }) => {
    if (!expression || typeof expression !== 'string') {
      throw new CalculatorError('Missing required parameter: "expression" must be a non-empty string.', 'MISSING_ARGUMENT');
    }
    const result = evaluate(expression);
    return {
      expression: expression.trim(),
      result,
    };
  },
};
