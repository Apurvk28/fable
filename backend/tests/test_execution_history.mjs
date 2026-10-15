import assert from 'assert';

const BASE_URL = 'http://localhost:5001';
const ORIGIN = 'http://localhost:5173';

console.log('================================================================');
console.log('=== Fable Phase 7: Execution History & Observability Tests ===');
console.log('================================================================\n');

async function runHistoryTests() {
  // 1. Fetch CSRF token
  const csrfRes = await fetch(`${BASE_URL}/api/v1/auth/csrf-token`, {
    headers: { Origin: ORIGIN },
  });
  const csrfData = await csrfRes.json();
  const csrfToken = csrfData.csrfToken;
  let cookieHeader = `XSRF-TOKEN=${csrfToken}`;

  // 2. Register fresh test user A
  const userAEmail = `history_a_${Date.now()}@example.com`;
  console.log(`1. Registering test user A (${userAEmail})...`);
  const regARes = await fetch(`${BASE_URL}/api/v1/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Origin': ORIGIN,
      'Cookie': cookieHeader,
      'x-xsrf-token': csrfToken,
    },
    body: JSON.stringify({
      name: 'History Tester A',
      email: userAEmail,
      password: 'SecurePassword123!',
    }),
  });

  assert.strictEqual(regARes.status, 201);
  const regASetCookies = typeof regARes.headers.getSetCookie === 'function'
    ? regARes.headers.getSetCookie()
    : [regARes.headers.get('set-cookie') || ''];
  const userACookie = `XSRF-TOKEN=${csrfToken}; ` + regASetCookies.map((c) => c.split(';')[0]).join('; ');
  console.log('   User A authenticated.\n');

  // 3. Create test agent for User A
  console.log('2. Creating test agent for User A...');
  const agentRes = await fetch(`${BASE_URL}/api/v1/agents`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Origin': ORIGIN,
      'Cookie': userACookie,
      'x-xsrf-token': csrfToken,
    },
    body: JSON.stringify({
      name: 'History Inspector Agent',
      instructions: 'You are an accurate assistant equipped with a calculator. Always use the calculator for math.',
      model: 'qwen/qwen3.8-27b',
      tools: ['calculator'],
    }),
  });

  const agentData = await agentRes.json();
  assert.strictEqual(agentRes.status, 201);
  const agentId = agentData.agent.id || agentData.agent._id;
  console.log(`   Agent created (ID: ${agentId}).\n`);

  // 4. Run multiple executions
  console.log('3. Running sample tasks and chat sessions...');
  
  // Task 1: Addition
  const run1 = await fetch(`${BASE_URL}/api/v1/agents/${agentId}/run`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Origin': ORIGIN,
      'Cookie': userACookie,
      'x-xsrf-token': csrfToken,
    },
    body: JSON.stringify({ input: 'Calculate 10 + 25 using calculator' }),
  });
  const data1 = await run1.json();
  assert.strictEqual(run1.status, 200);
  const execId1 = data1.execution?.id || data1.execution?._id;

  // Task 2: Multiplication
  const run2 = await fetch(`${BASE_URL}/api/v1/agents/${agentId}/run`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Origin': ORIGIN,
      'Cookie': userACookie,
      'x-xsrf-token': csrfToken,
    },
    body: JSON.stringify({ input: 'Multiply 15 * 8 using calculator' }),
  });
  const data2 = await run2.json();
  assert.strictEqual(run2.status, 200);

  // Chat Turn 1
  const chat1 = await fetch(`${BASE_URL}/api/v1/agents/${agentId}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Origin': ORIGIN,
      'Cookie': userACookie,
      'x-xsrf-token': csrfToken,
    },
    body: JSON.stringify({ message: 'Hello agent, who are you?', history: [] }),
  });
  const chatData1 = await chat1.json();
  assert.strictEqual(chat1.status, 200);

  console.log('   3 executions completed successfully.\n');

  // 5. Test GET /api/v1/executions (Global History)
  console.log('4. Testing GET /api/v1/executions (default listing)...');
  const listRes = await fetch(`${BASE_URL}/api/v1/executions`, {
    headers: { Origin: ORIGIN, Cookie: userACookie },
  });
  assert.strictEqual(listRes.status, 200);
  const listData = await listRes.json();

  assert.ok(Array.isArray(listData.executions));
  assert.strictEqual(listData.executions.length, 3);
  assert.strictEqual(listData.pagination.totalCount, 3);
  assert.strictEqual(listData.pagination.page, 1);
  assert.strictEqual(listData.pagination.limit, 15);
  assert.strictEqual(listData.pagination.totalPages, 1);
  assert.strictEqual(listData.pagination.hasNextPage, false);
  assert.strictEqual(listData.pagination.hasPrevPage, false);

  // Verify lightweight summary projection
  const firstSummary = listData.executions[0];
  assert.ok(firstSummary.id);
  assert.ok(firstSummary.agentSnapshot?.name);
  assert.ok(firstSummary.mode);
  assert.ok(firstSummary.status);
  assert.ok(firstSummary.createdAt);
  assert.strictEqual(typeof firstSummary.toolTracesCount, 'number');
  assert.strictEqual(firstSummary.messages, undefined, 'Detailed conversation messages must not leak into list responses');
  console.log('   ✓ PASS: Global history returns lightweight summaries and correct pagination.\n');

  // 6. Test Pagination Parameters
  console.log('5. Testing pagination limits and page boundaries...');
  const page1Res = await fetch(`${BASE_URL}/api/v1/executions?page=1&limit=2`, {
    headers: { Origin: ORIGIN, Cookie: userACookie },
  });
  const page1Data = await page1Res.json();
  assert.strictEqual(page1Data.executions.length, 2);
  assert.strictEqual(page1Data.pagination.hasNextPage, true);
  assert.strictEqual(page1Data.pagination.hasPrevPage, false);

  const page2Res = await fetch(`${BASE_URL}/api/v1/executions?page=2&limit=2`, {
    headers: { Origin: ORIGIN, Cookie: userACookie },
  });
  const page2Data = await page2Res.json();
  assert.strictEqual(page2Data.executions.length, 1);
  assert.strictEqual(page2Data.pagination.hasNextPage, false);
  assert.strictEqual(page2Data.pagination.hasPrevPage, true);

  // Verify no overlap between page 1 and page 2
  const idsPage1 = page1Data.executions.map(e => e.id);
  const idsPage2 = page2Data.executions.map(e => e.id);
  assert.ok(!idsPage1.includes(idsPage2[0]));
  console.log('   ✓ PASS: Pagination slices data cleanly without overlap.\n');

  // 7. Test Filtering by Mode
  console.log('6. Testing mode filtering (mode=chat vs mode=task)...');
  const chatModeRes = await fetch(`${BASE_URL}/api/v1/executions?mode=chat`, {
    headers: { Origin: ORIGIN, Cookie: userACookie },
  });
  const chatModeData = await chatModeRes.json();
  assert.strictEqual(chatModeData.executions.length, 1);
  assert.strictEqual(chatModeData.executions[0].mode, 'chat');

  const taskModeRes = await fetch(`${BASE_URL}/api/v1/executions?mode=task`, {
    headers: { Origin: ORIGIN, Cookie: userACookie },
  });
  const taskModeData = await taskModeRes.json();
  assert.strictEqual(taskModeData.executions.length, 2);
  assert.ok(taskModeData.executions.every(e => e.mode === 'task'));
  console.log('   ✓ PASS: Mode filter accurately separates chat and task runs.\n');

  // 8. Test Filtering by Status
  console.log('7. Testing status filtering...');
  const completedRes = await fetch(`${BASE_URL}/api/v1/executions?status=completed`, {
    headers: { Origin: ORIGIN, Cookie: userACookie },
  });
  const completedData = await completedRes.json();
  assert.strictEqual(completedData.executions.length, 3);

  const failedRes = await fetch(`${BASE_URL}/api/v1/executions?status=failed`, {
    headers: { Origin: ORIGIN, Cookie: userACookie },
  });
  const failedData = await failedRes.json();
  assert.strictEqual(failedData.executions.length, 0);
  console.log('   ✓ PASS: Status filtering operates accurately.\n');

  // 9. Test Search Query Filter
  console.log('8. Testing input search query (q parameter)...');
  const searchRes = await fetch(`${BASE_URL}/api/v1/executions?q=Multiply`, {
    headers: { Origin: ORIGIN, Cookie: userACookie },
  });
  const searchData = await searchRes.json();
  assert.strictEqual(searchData.executions.length, 1);
  assert.ok(searchData.executions[0].input.includes('Multiply'));
  console.log('   ✓ PASS: Input search query finds matching execution.\n');

  // 10. Test Invalid Parameter Handling
  console.log('9. Testing rejection/sanitization of invalid parameters...');
  const invalidAgentRes = await fetch(`${BASE_URL}/api/v1/executions?agentId=invalid-id-format`, {
    headers: { Origin: ORIGIN, Cookie: userACookie },
  });
  assert.strictEqual(invalidAgentRes.status, 400);

  const invalidStatusRes = await fetch(`${BASE_URL}/api/v1/executions?status=unknown-status`, {
    headers: { Origin: ORIGIN, Cookie: userACookie },
  });
  assert.strictEqual(invalidStatusRes.status, 400);

  const boundedPageRes = await fetch(`${BASE_URL}/api/v1/executions?page=-5&limit=999`, {
    headers: { Origin: ORIGIN, Cookie: userACookie },
  });
  assert.strictEqual(boundedPageRes.status, 200);
  const boundedData = await boundedPageRes.json();
  assert.strictEqual(boundedData.pagination.page, 1);
  assert.strictEqual(boundedData.pagination.limit, 50); // Hard-capped at 50
  console.log('   ✓ PASS: Invalid filters safely rejected; pagination bounds enforced.\n');

  // 11. Test Cross-User Isolation
  console.log('10. Testing Cross-User History and Detail Isolation...');
  const userBEmail = `history_b_${Date.now()}@example.com`;
  const regBRes = await fetch(`${BASE_URL}/api/v1/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Origin': ORIGIN,
      'Cookie': cookieHeader,
      'x-xsrf-token': csrfToken,
    },
    body: JSON.stringify({
      name: 'History Tester B',
      email: userBEmail,
      password: 'SecurePassword123!',
    }),
  });
  assert.strictEqual(regBRes.status, 201);
  const regBSetCookies = typeof regBRes.headers.getSetCookie === 'function'
    ? regBRes.headers.getSetCookie()
    : [regBRes.headers.get('set-cookie') || ''];
  const userBCookie = `XSRF-TOKEN=${csrfToken}; ` + regBSetCookies.map((c) => c.split(';')[0]).join('; ');

  // User B queries global history: should see 0 executions
  const userBListRes = await fetch(`${BASE_URL}/api/v1/executions`, {
    headers: { Origin: ORIGIN, Cookie: userBCookie },
  });
  assert.strictEqual(userBListRes.status, 200);
  const userBListData = await userBListRes.json();
  assert.strictEqual(userBListData.executions.length, 0);
  assert.strictEqual(userBListData.pagination.totalCount, 0);

  // User B tries to view User A's execution detail: must return 404
  const crossDetailRes = await fetch(`${BASE_URL}/api/v1/executions/${execId1}`, {
    headers: { Origin: ORIGIN, Cookie: userBCookie },
  });
  assert.strictEqual(crossDetailRes.status, 404);
  console.log('   ✓ PASS: Strict cross-user data isolation enforced on history and detail endpoints.\n');

  console.log('================================================================');
  console.log('=== All 10 / 10 Execution History Backend Tests PASSED! ===');
  console.log('================================================================\n');
}

runHistoryTests().catch((err) => {
  console.error('\n❌ History test failed:', err);
  process.exit(1);
});
