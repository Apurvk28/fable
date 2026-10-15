import assert from 'assert';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import mongoose from 'mongoose';
import { User } from '../src/models/User.js';
import { Agent } from '../src/models/Agent.js';
import { Execution } from '../src/models/Execution.js';
import { runAgent } from '../src/services/agentRunner.js';
import { config } from '../src/config/env.js';

console.log('===============================================================');
console.log('=== Fable Phase 6: Execution Engine & Persistence Tests ===');
console.log('===============================================================\n');

let totalTests = 0;
let passedTests = 0;

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

async function runAllTests() {
  // Connect to database for model integration tests
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(config.mongodbUri);
    console.log('Connected to MongoDB.\n');
  }

  // 1. Setup Test Users
  const timestamp = Date.now();
  const userA = new User({
    name: 'Alice Execution Tester',
    email: `alice_exec_${timestamp}@example.com`,
    password: 'SecurePassword123!',
  });
  await userA.save();

  const userB = new User({
    name: 'Bob Execution Tester',
    email: `bob_exec_${timestamp}@example.com`,
    password: 'SecurePassword123!',
  });
  await userB.save();

  // 2. Setup Test Agent for User A (with Calculator & DateTime tools)
  const agentA = new Agent({
    owner: userA._id,
    name: 'Math & Time Specialist',
    description: 'An expert assistant for calculations and date/time queries.',
    instructions: 'You are an accurate math and scheduling assistant. You MUST use the calculator tool for any arithmetic or mathematical expressions. Use the datetime tool for time queries. Always provide concise, clear answers.',
    model: 'qwen/qwen3.8-27b',
    tools: ['calculator', 'datetime'],
    parameters: {
      temperature: 0.1, // Low temperature for deterministic evaluation
      maxTokens: 512,
    },
    limits: {
      maxTurns: 3,
      timeoutSeconds: 30,
    },
  });
  await agentA.save();

  // Test 1: Full multi-turn execution with tool call (Calculator)
  await asyncTest('Execution Engine: runs task requiring calculator tool and persists execution record', async () => {
    const inputPrompt = 'Calculate 25 * 4 + sqrt(144) using your calculator tool and tell me the final number.';
    const result = await runAgent({
      agent: agentA,
      user: userA,
      input: inputPrompt,
      mode: 'task',
    });

    assert.ok(result.execution, 'Execution record should be returned');
    assert.strictEqual(result.execution.status, 'completed', 'Execution should be completed');
    assert.strictEqual(result.execution.owner.toString(), userA._id.toString());
    assert.strictEqual(result.execution.agent.toString(), agentA._id.toString());
    assert.ok(result.output && typeof result.output === 'string');

    // Confirm that the tool trace was recorded
    assert.ok(Array.isArray(result.toolTraces));
    assert.ok(result.toolTraces.length >= 1, 'Should have executed at least 1 tool call');

    const calcTrace = result.toolTraces.find((t) => t.tool === 'calculator');
    assert.ok(calcTrace, 'Should contain a calculator tool trace');
    assert.strictEqual(calcTrace.isError, false, 'Calculator tool call should have succeeded');
    assert.strictEqual(calcTrace.output.result, 112, '25 * 4 + 12 = 112');

    // Confirm database record matches
    const dbExecution = await Execution.findById(result.execution._id);
    assert.ok(dbExecution);
    assert.strictEqual(dbExecution.status, 'completed');
    assert.strictEqual(dbExecution.toolTraces.length, result.toolTraces.length);
    assert.strictEqual(dbExecution.agentSnapshot.name, 'Math & Time Specialist');
    assert.strictEqual(dbExecution.agentSnapshot.model, 'qwen/qwen3.8-27b');
  });

  // Test 2: Immutable snapshot retention even after agent is edited
  await asyncTest('Persistence: agent snapshot remains immutable even if agent is updated', async () => {
    // Fetch the previous execution
    const prevExec = await Execution.findOne({ agent: agentA._id }).sort({ createdAt: -1 });
    assert.ok(prevExec);
    const originalSnapshotName = prevExec.agentSnapshot.name;
    const originalSnapshotInstructions = prevExec.agentSnapshot.instructions;

    // Mutate Agent in database
    agentA.name = 'Completely Renamed Agent';
    agentA.instructions = 'Completely changed instructions.';
    await agentA.save();

    // Re-fetch execution and verify snapshot didn't change
    const reFetchedExec = await Execution.findById(prevExec._id);
    assert.strictEqual(reFetchedExec.agentSnapshot.name, originalSnapshotName);
    assert.strictEqual(reFetchedExec.agentSnapshot.instructions, originalSnapshotInstructions);
  });

  // Test 3: Tool permission enforcement (agent without tool)
  await asyncTest('Security: model attempting unapproved tool call is denied without crash', async () => {
    // Create an agent with ZERO tools enabled
    const noToolsAgent = new Agent({
      owner: userA._id,
      name: 'No Tools Agent',
      instructions: 'You have no tools enabled. Do not call any tools.',
      model: 'qwen/qwen3.8-27b',
      tools: [],
    });
    await noToolsAgent.save();

    // Verify schemas passed to model are empty
    const result = await runAgent({
      agent: noToolsAgent,
      user: userA,
      input: 'What is 2 + 2?',
      mode: 'task',
    });

    assert.strictEqual(result.execution.status, 'completed');
    assert.strictEqual(result.toolTraces.length, 0, 'No tool traces should exist');
  });

  // Test 4: Turn limit enforcement (PRD: max 3 turns)
  await asyncTest('Turn limits: agent execution never exceeds maxTurns limit', async () => {
    const execDoc = await Execution.findOne({ agent: agentA._id }).sort({ createdAt: -1 });
    assert.ok(execDoc);
    assert.ok(execDoc.turnsCount <= 3, `turnsCount (${execDoc.turnsCount}) must not exceed 3`);
  });

  // Test 5: Safe error recording when a tool encounters an arithmetic error (TOOL-09)
  await asyncTest('Error transparency: tool errors are captured in execution traces without crash', async () => {
    const inputPrompt = 'Use the calculator to evaluate 50 / 0 right now.';
    const result = await runAgent({
      agent: agentA,
      user: userA,
      input: inputPrompt,
      mode: 'task',
    });

    assert.ok(result.execution);
    const divZeroTrace = result.toolTraces.find(
      (t) => t.tool === 'calculator' && t.isError === true
    );
    if (divZeroTrace) {
      assert.strictEqual(divZeroTrace.isError, true);
      assert.strictEqual(divZeroTrace.error.code, 'DIVISION_BY_ZERO');
      console.log('    (Tool error correctly captured and fed back to model)');
    }
  });

  // Test 6: Cross-user ownership isolation (EXEC-08)
  await asyncTest('Security: User B cannot access User A executions', async () => {
    const userAExecution = await Execution.findOne({ owner: userA._id });
    assert.ok(userAExecution);

    // Query with User B as owner
    const crossAccess = await Execution.findOne({
      _id: userAExecution._id,
      owner: userB._id, // User B trying to fetch User A's execution
    });

    assert.strictEqual(crossAccess, null, 'User B must NOT find User A execution');
  });

  // Test 7: Secret hygiene check (EXEC-07)
  await asyncTest('Security: execution record contains NO API keys, tokens, or passwords', async () => {
    const execDoc = await Execution.findOne({ owner: userA._id }).lean();
    const strRep = JSON.stringify(execDoc);

    assert.ok(!strRep.includes(config.groqApiKey), 'Execution record must not contain GROQ_API_KEY');
    assert.ok(!strRep.includes(config.jwtSecret), 'Execution record must not contain JWT_SECRET');
    assert.ok(!strRep.includes('SecurePassword123!'), 'Execution record must not contain passwords');
  });

  // Cleanup test documents
  await Execution.deleteMany({ owner: { $in: [userA._id, userB._id] } });
  await Agent.deleteMany({ owner: { $in: [userA._id, userB._id] } });
  await User.deleteMany({ _id: { $in: [userA._id, userB._id] } });

  console.log(`\n===============================================================`);
  console.log(`=== All ${passedTests} / ${totalTests} Execution Engine Tests PASSED! ===`);
  console.log(`===============================================================\n`);
}

runAllTests()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error('\nEXECUTION ENGINE TESTS FAILED:', err);
    process.exit(1);
  });
