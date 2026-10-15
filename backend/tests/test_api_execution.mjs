import assert from 'assert';

const BASE_URL = 'http://localhost:5001';
const ORIGIN = 'http://localhost:5173';

console.log('================================================================');
console.log('=== Fable Phase 6: HTTP API Execution & Security Tests ===');
console.log('================================================================\n');

async function runApiTests() {
  // 1. Fetch CSRF token
  console.log('1. Fetching CSRF token...');
  const csrfRes = await fetch(`${BASE_URL}/api/v1/auth/csrf-token`, {
    headers: { Origin: ORIGIN },
  });
  const csrfData = await csrfRes.json();
  const csrfToken = csrfData.csrfToken;

  const initSetCookies = typeof csrfRes.headers.getSetCookie === 'function'
    ? csrfRes.headers.getSetCookie()
    : [csrfRes.headers.get('set-cookie') || ''];
  let cookieHeader = `XSRF-TOKEN=${csrfToken}`;

  // 2. Register fresh test user
  const testEmail = `runner_${Date.now()}@example.com`;
  console.log(`2. Registering test user (${testEmail})...`);
  const regRes = await fetch(`${BASE_URL}/api/v1/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Origin': ORIGIN,
      'Cookie': cookieHeader,
      'x-xsrf-token': csrfToken,
    },
    body: JSON.stringify({
      name: 'API Runner Tester',
      email: testEmail,
      password: 'SecurePassword123!',
    }),
  });

  if (!regRes.ok) {
    throw new Error(`Register failed: ${await regRes.text()}`);
  }

  const regSetCookies = typeof regRes.headers.getSetCookie === 'function'
    ? regRes.headers.getSetCookie()
    : [regRes.headers.get('set-cookie') || ''];
  cookieHeader = `XSRF-TOKEN=${csrfToken}; ` + regSetCookies.map((c) => c.split(';')[0]).join('; ');
  console.log('   Authenticated. Session established.\n');

  // 3. Create an Agent with calculator and text_processor tools
  console.log('3. Creating test agent with calculator tool...');
  const createAgentRes = await fetch(`${BASE_URL}/api/v1/agents`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Origin': ORIGIN,
      'Cookie': cookieHeader,
      'x-xsrf-token': csrfToken,
    },
    body: JSON.stringify({
      name: 'Financial Math Agent',
      instructions: 'You are an accurate financial assistant. Use the calculator tool for mathematical computations.',
      model: 'qwen/qwen3.8-27b',
      tools: ['calculator'],
    }),
  });

  const agentData = await createAgentRes.json();
  assert.strictEqual(createAgentRes.status, 201);
  const agentId = agentData.agent.id || agentData.agent._id;
  console.log(`   Agent created successfully (ID: ${agentId}).\n`);

  // 4. Test POST /api/v1/agents/:id/run (Task Execution)
  console.log('4. Testing POST /api/v1/agents/:id/run...');
  const runTaskRes = await fetch(`${BASE_URL}/api/v1/agents/${agentId}/run`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Origin': ORIGIN,
      'Cookie': cookieHeader,
      'x-xsrf-token': csrfToken,
    },
    body: JSON.stringify({
      input: 'Evaluate 50 * 6 + 100 using the calculator tool.',
    }),
  });

  const runTaskData = await runTaskRes.json();
  console.log(`   Status: ${runTaskRes.status}`);
  console.log(`   Output: ${runTaskData.output}`);
  console.log(`   Duration: ${runTaskData.durationMs}ms`);
  console.log(`   Tool calls executed: ${runTaskData.toolTraces?.length || 0}`);

  assert.strictEqual(runTaskRes.status, 200);
  assert.strictEqual(runTaskData.execution?.status, 'completed');
  assert.ok(runTaskData.output);
  assert.ok(runTaskData.toolTraces && runTaskData.toolTraces.length >= 1);
  assert.strictEqual(runTaskData.toolTraces[0].tool, 'calculator');
  assert.strictEqual(runTaskData.toolTraces[0].output.result, 400); // 50*6 + 100 = 400
  const executionId = runTaskData.execution.id || runTaskData.execution._id;
  console.log('   ✓ PASS: Task execution invoked tool and returned calculated result.\n');

  // 5. Test POST /api/v1/agents/:id/chat (Chat Stream Execution)
  console.log('5. Testing POST /api/v1/agents/:id/chat...');
  const chatRes = await fetch(`${BASE_URL}/api/v1/agents/${agentId}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Origin': ORIGIN,
      'Cookie': cookieHeader,
      'x-xsrf-token': csrfToken,
    },
    body: JSON.stringify({
      message: 'Hello, what tools do you have available?',
      history: [],
    }),
  });

  const chatData = await chatRes.json();
  assert.strictEqual(chatRes.status, 200);
  assert.strictEqual(chatData.execution?.mode, 'chat');
  assert.ok(chatData.output);
  console.log(`   Chat response: "${chatData.output.slice(0, 100)}..."`);
  console.log('   ✓ PASS: Interactive chat endpoint executed successfully.\n');

  // 6. Test GET /api/v1/executions/:id (Inspection with Ownership)
  console.log('6. Testing GET /api/v1/executions/:id...');
  const getExecRes = await fetch(`${BASE_URL}/api/v1/executions/${executionId}`, {
    headers: {
      Origin: ORIGIN,
      Cookie: cookieHeader,
    },
  });

  const execDetail = await getExecRes.json();
  assert.strictEqual(getExecRes.status, 200);
  assert.ok(execDetail.execution);
  assert.strictEqual(execDetail.execution.status, 'completed');
  assert.ok(execDetail.execution.agentSnapshot);
  assert.strictEqual(execDetail.execution.agentSnapshot.name, 'Financial Math Agent');
  console.log('   ✓ PASS: Execution retrieved with full snapshot and traces.\n');

  // 7. Test Cross-User Isolation on HTTP endpoint
  console.log('7. Testing Cross-User Access Denial on Execution Endpoint...');
  // Register second user
  const userBEmail = `runner_b_${Date.now()}@example.com`;
  const regBRes = await fetch(`${BASE_URL}/api/v1/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Origin': ORIGIN,
      'Cookie': cookieHeader,
      'x-xsrf-token': csrfToken,
    },
    body: JSON.stringify({
      name: 'User B',
      email: userBEmail,
      password: 'SecurePassword123!',
    }),
  });
  const regBSetCookies = typeof regBRes.headers.getSetCookie === 'function'
    ? regBRes.headers.getSetCookie()
    : [regBRes.headers.get('set-cookie') || ''];
  const userBCookieHeader = `XSRF-TOKEN=${csrfToken}; ` + regBSetCookies.map((c) => c.split(';')[0]).join('; ');

  // User B attempts to access User A's execution
  const crossUserGet = await fetch(`${BASE_URL}/api/v1/executions/${executionId}`, {
    headers: {
      Origin: ORIGIN,
      Cookie: userBCookieHeader,
    },
  });
  assert.strictEqual(crossUserGet.status, 404);
  console.log(`   User B received status: ${crossUserGet.status} (Forbidden/Not Found)`);
  console.log('   ✓ PASS: Strict ownership isolation enforced on HTTP level.\n');

  // 8. Test CSRF Protection on Mutating Execution Endpoints
  console.log('8. Testing CSRF Protection on Execution Endpoint...');
  const missingCsrfRes = await fetch(`${BASE_URL}/api/v1/agents/${agentId}/run`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Origin': ORIGIN,
      'Cookie': cookieHeader,
      // Missing x-xsrf-token
    },
    body: JSON.stringify({ input: 'Run without CSRF' }),
  });
  assert.strictEqual(missingCsrfRes.status, 403);
  console.log(`   Missing CSRF rejected with status: ${missingCsrfRes.status}`);
  console.log('   ✓ PASS: CSRF strictly enforced on execution endpoints.\n');

  console.log('================================================================');
  console.log('=== All HTTP API Execution & Security Tests PASSED! ===');
  console.log('================================================================\n');
}

runApiTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('API TEST FAILED:', err);
    process.exit(1);
  });
