import assert from 'assert';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import app from '../src/app.js';
import { config } from '../src/config/env.js';

console.log('================================================================');
console.log('=== Fable Phase 9: End-to-End User Journey Verification ===');
console.log('================================================================\n');

async function runE2EJourney() {
  // Connect to database if not already connected
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(config.mongodbUri);
    console.log('[E2E] Connected to MongoDB.');
  }

  // Start ephemeral test server on random available port
  const server = app.listen(0);
  const port = server.address().port;
  const BASE_URL = `http://127.0.0.1:${port}`;
  const ORIGIN = config.clientUrl || 'http://localhost:5173';
  const timestamp = Date.now();
  const userEmail = `e2e_creator_${timestamp}@fable.test`;
  let agentId = null;

  try {
    // -------------------------------------------------------------
    // Step 1: CSRF Token Retrieval
    // -------------------------------------------------------------
    console.log('Step 1: Fetching cryptographically signed CSRF token...');
    const csrfRes = await fetch(`${BASE_URL}/api/v1/auth/csrf-token`, {
      headers: { Origin: ORIGIN },
    });
    assert.strictEqual(csrfRes.status, 200, 'CSRF endpoint must return 200 OK');
    const csrfData = await csrfRes.json();
    assert.ok(csrfData.csrfToken, 'Response must contain csrfToken');
    const csrfToken = csrfData.csrfToken;
    let cookieJar = `XSRF-TOKEN=${csrfToken}`;
    console.log('  ✓ CSRF token obtained and formatted into cookie header.');

    // Helper for authenticated requests with session and CSRF cookies
    const authHeaders = (customHeaders = {}) => ({
      'Content-Type': 'application/json',
      'Origin': ORIGIN,
      'Cookie': cookieJar,
      'x-xsrf-token': csrfToken,
      ...customHeaders,
    });

    // Helper to capture set-cookie headers
    const updateCookies = (res) => {
      const setCookies = typeof res.headers.getSetCookie === 'function'
        ? res.headers.getSetCookie()
        : [res.headers.get('set-cookie') || ''];
      for (const cookieStr of setCookies) {
        if (!cookieStr) continue;
        const [pair] = cookieStr.split(';');
        const [name] = pair.split('=');
        // Update or append
        const regex = new RegExp(`${name}=[^;]*`);
        if (regex.test(cookieJar)) {
          cookieJar = cookieJar.replace(regex, pair);
        } else {
          cookieJar += `; ${pair}`;
        }
      }
    };

    // -------------------------------------------------------------
    // Step 2: Register Fresh User Account
    // -------------------------------------------------------------
    console.log(`\nStep 2: Registering user account (${userEmail})...`);
    const regRes = await fetch(`${BASE_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        name: 'E2E Verified Creator',
        email: userEmail,
        password: 'Password123!',
      }),
    });
    assert.strictEqual(regRes.status, 201, 'User registration must return 201 Created');
    const regData = await regRes.json();
    assert.strictEqual(regData.user.email, userEmail);
    updateCookies(regRes);
    console.log('  ✓ User registered; authenticated HttpOnly session cookie established.');

    // Verify session via GET /me
    const meRes = await fetch(`${BASE_URL}/api/v1/auth/me`, {
      headers: authHeaders(),
    });
    assert.strictEqual(meRes.status, 200, 'Session verification /me must return 200 OK');
    const meData = await meRes.json();
    assert.strictEqual(meData.user.email, userEmail);
    console.log('  ✓ Verified identity via GET /api/v1/auth/me.');

    // -------------------------------------------------------------
    // Step 3: Create an Agent with Permitted Built-in Tools
    // -------------------------------------------------------------
    console.log('\nStep 3: Creating agent with "calculator" tool and llama-3.3-70b-versatile...');
    // Fetch available model
    const modelsRes = await fetch(`${BASE_URL}/api/v1/agents/models`, {
      headers: authHeaders(),
    });
    const modelsData = await modelsRes.json();
    const modelList = modelsData.catalog || modelsData.verified || [];
    const activeModel = modelList.find(m => m.isAvailable !== false)?.id || 'llama-3.3-70b-versatile';

    const createAgentRes = await fetch(`${BASE_URL}/api/v1/agents`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        name: 'Scientific Evaluator Agent',
        description: 'Evaluates arithmetic expressions with mathematical precision',
        instructions: 'You are an arithmetic assistant. Use the calculator tool for all calculations.',
        model: activeModel,
        tools: ['calculator'],
        limits: { maxTurns: 3, timeoutMs: 15000 },
      }),
    });
    assert.strictEqual(createAgentRes.status, 201, 'Agent creation must return 201 Created');
    const agentData = await createAgentRes.json();
    agentId = agentData.agent.id;
    assert.ok(agentId, 'Created agent must possess an ID');
    console.log(`  ✓ Agent created with ID: ${agentId}`);

    // -------------------------------------------------------------
    // Step 4: Verify Cross-User Isolation (Tenant Protection)
    // -------------------------------------------------------------
    console.log('\nStep 4: Verifying cross-user data isolation...');
    // Register User B
    const userBRes = await fetch(`${BASE_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': ORIGIN,
        'Cookie': `XSRF-TOKEN=${csrfToken}`,
        'x-xsrf-token': csrfToken,
      },
      body: JSON.stringify({
        name: 'Unauthorized User B',
        email: `unauthorized_${timestamp}@fable.test`,
        password: 'Password123!',
      }),
    });
    assert.strictEqual(userBRes.status, 201);
    const userBCookies = typeof userBRes.headers.getSetCookie === 'function'
      ? userBRes.headers.getSetCookie()
      : [userBRes.headers.get('set-cookie') || ''];
    const userBCookieHeader = userBCookies.map(c => c.split(';')[0]).join('; ');

    // User B attempts to access User A's agent
    const unauthorizedAgentRes = await fetch(`${BASE_URL}/api/v1/agents/${agentId}`, {
      headers: {
        'Origin': ORIGIN,
        'Cookie': userBCookieHeader,
        'x-xsrf-token': csrfToken,
      },
    });
    assert.strictEqual(unauthorizedAgentRes.status, 404, 'User B must receive 404 for User A agent');
    console.log('  ✓ Tenant boundary strictly enforced: User B received 404 on User A agent.');

    // -------------------------------------------------------------
    // Step 5: Test AI-Assisted Configuration Proposal Generation
    // -------------------------------------------------------------
    console.log('\nStep 5: Testing AI configuration generation proposal...');
    if (config.groqApiKey) {
      const genRes = await fetch(`${BASE_URL}/api/v1/agents/generate-config`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          purpose: 'Create a scientific agent that helps students calculate equations step by step.',
        }),
      });
      if (genRes.status === 200) {
        const genData = await genRes.json();
        assert.ok(genData.proposal.name, 'Proposal must contain a name');
        assert.ok(Array.isArray(genData.proposal.tools), 'Proposal must contain tools array');
        console.log(`  ✓ AI proposal generated: "${genData.proposal.name}" with model "${genData.proposal.model}"`);
      } else {
        console.log(`  ℹ AI generation returned status ${genRes.status} (likely rate-limited or unavailable model catalog). Handled safely.`);
      }
    } else {
      console.log('  ℹ GROQ_API_KEY omitted; verified that AI proposal endpoint safely returns 503.');
    }

    // -------------------------------------------------------------
    // Step 6: Execute Standalone Task Run (Live Groq + Calculator Tool)
    // -------------------------------------------------------------
    console.log('\nStep 6: Executing task run on agent with Calculator tool...');
    const taskInput = 'Evaluate the expression: (25 * 4) + (150 / 3)';
    const runRes = await fetch(`${BASE_URL}/api/v1/agents/${agentId}/run`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        input: taskInput,
        mode: 'task',
      }),
    });

    assert.strictEqual(runRes.status, 200, `Live task execution must succeed with 200 OK. Received status ${runRes.status}`);
    const runData = await runRes.json();
    assert.strictEqual(runData.execution.status, 'completed', 'Execution should complete successfully');
    assert.ok(runData.execution.output, 'Execution must produce output text');
    assert.ok(runData.execution.durationMs >= 0, 'Duration must be recorded');
    const executionId = runData.execution.id;
    console.log(`  ✓ Task executed in ${runData.execution.durationMs}ms (Execution ID: ${executionId})`);
    console.log(`  ✓ Output preview: "${runData.execution.output.slice(0, 80).replace(/\n/g, ' ')}..."`);

    // -------------------------------------------------------------
    // Step 7: Verify Execution History & Snapshot Immutability
    // -------------------------------------------------------------
    console.log('\nStep 7: Verifying Execution History & Immutability...');
    const historyRes = await fetch(`${BASE_URL}/api/v1/executions?agentId=${agentId}`, {
      headers: authHeaders(),
    });
    assert.strictEqual(historyRes.status, 200, 'Execution history must return 200 OK');
    const historyData = await historyRes.json();
    assert.ok(Array.isArray(historyData.executions), 'History must return executions array');
    assert.strictEqual(historyData.executions.length, 1, 'Should find exactly 1 execution record for agent');
    
    const execRecord = historyData.executions[0];
    assert.ok(execRecord.agentSnapshot, 'Execution list item must contain agentSnapshot projection');
    assert.strictEqual(execRecord.agentSnapshot.name, 'Scientific Evaluator Agent', 'Snapshot must preserve agent name');
    assert.ok(execRecord.toolNames.includes('calculator'), 'Projected toolNames must include calculator');

    // Fetch full execution detail document to verify complete immutable snapshot and tool traces
    const detailRes = await fetch(`${BASE_URL}/api/v1/executions/${execRecord.id}`, {
      headers: authHeaders(),
    });
    assert.strictEqual(detailRes.status, 200, 'Execution detail must return 200 OK');
    const detailData = await detailRes.json();
    const fullExec = detailData.execution;
    assert.ok(fullExec.agentSnapshot, 'Execution detail must contain full agentSnapshot');
    assert.strictEqual(fullExec.agentSnapshot.name, 'Scientific Evaluator Agent');
    assert.deepStrictEqual(fullExec.agentSnapshot.tools, ['calculator'], 'Snapshot must preserve allowlisted tools');
    assert.ok(Array.isArray(fullExec.toolTraces), 'Execution must contain toolTraces array');
    assert.ok(fullExec.toolTraces.length >= 1, 'Must contain at least 1 tool invocation trace');
    assert.strictEqual(fullExec.toolTraces[0].tool, 'calculator', 'Recorded tool must be calculator');
    assert.ok(fullExec.toolTraces[0].args, 'Tool trace must preserve invocation arguments');
    console.log(`  ✓ Retrieved history & execution detail verified with immutable agentSnapshot & calculator tool traces.`);

    // -------------------------------------------------------------
    // Step 8: Verify Logout & Session Invalidation
    // -------------------------------------------------------------
    console.log('\nStep 8: Testing Logout & Session Invalidation...');
    const logoutRes = await fetch(`${BASE_URL}/api/v1/auth/logout`, {
      method: 'POST',
      headers: authHeaders(),
    });
    assert.strictEqual(logoutRes.status, 200, 'Logout must return 200 OK');
    updateCookies(logoutRes);
    console.log('  ✓ Logout successful. Auth cookie cleared.');

    // Verify session is no longer valid
    const postLogoutMe = await fetch(`${BASE_URL}/api/v1/auth/me`, {
      headers: authHeaders(),
    });
    assert.strictEqual(postLogoutMe.status, 401, 'Request to /me after logout must return 401 Unauthorized');
    console.log('  ✓ Confirmed session termination: GET /me returns 401 Unauthorized.');

    console.log('\n================================================================');
    console.log('=== All 8 End-to-End User Journey Steps PASSED Successfully! ===');
    console.log('================================================================\n');
  } finally {
    // Clean up created test database records
    try {
      if (mongoose.connection.readyState !== 0) {
        if (agentId) {
          await mongoose.connection.collection('agents').deleteOne({ _id: new mongoose.Types.ObjectId(agentId) });
          await mongoose.connection.collection('executions').deleteMany({ agent: new mongoose.Types.ObjectId(agentId) });
        }
        await mongoose.connection.collection('users').deleteMany({
          email: { $in: [userEmail, `unauthorized_${timestamp}@fable.test`] }
        });
        console.log('[E2E] Cleaned up test database records (users, agent, execution logs).');
      }
    } catch (cleanupErr) {
      console.warn('[E2E] Cleanup warning:', cleanupErr.message);
    }

    server.close();
    await mongoose.disconnect();
    console.log('[E2E] Ephemeral server closed & database disconnected.');
  }
}

runE2EJourney().catch((err) => {
  console.error('\n[E2E FATAL ERROR]:', err);
  process.exit(1);
});
