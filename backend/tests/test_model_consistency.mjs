const BASE_URL = 'http://localhost:5001';
const ORIGIN = 'http://localhost:5173';

async function runTest() {
  console.log('=== Starting Model-Availability Consistency Test ===\n');

  // 1. Fetch initial CSRF token
  console.log('1. Fetching initial CSRF token...');
  const initialCsrfRes = await fetch(`${BASE_URL}/api/v1/auth/csrf-token`, {
    headers: { Origin: ORIGIN },
  });
  const initialCsrfData = await initialCsrfRes.json();
  const csrfToken = initialCsrfData.csrfToken;
  let cookieHeader = `XSRF-TOKEN=${csrfToken}`;

  // 2. Register fresh test user
  const testEmail = `tester_${Date.now()}@example.com`;
  console.log(`2. Registering fresh test user (${testEmail})...`);
  const regRes = await fetch(`${BASE_URL}/api/v1/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Origin': ORIGIN,
      'Cookie': cookieHeader,
      'x-xsrf-token': csrfToken,
    },
    body: JSON.stringify({
      name: 'Model Consistency Tester',
      email: testEmail,
      password: 'SecurePassword123!',
    }),
  });

  if (!regRes.ok) {
    const errText = await regRes.text();
    throw new Error(`Register failed with status ${regRes.status}: ${errText}`);
  }

  // Extract session cookies and retain CSRF cookie
  const regSetCookies = typeof regRes.headers.getSetCookie === 'function'
    ? regRes.headers.getSetCookie()
    : [regRes.headers.get('set-cookie') || ''];
  cookieHeader = `XSRF-TOKEN=${csrfToken}; ` + regSetCookies.map((c) => c.split(';')[0]).join('; ');
  console.log('   Authenticated. Session established.\n');

  // 2. Test GET /api/v1/agents/models
  console.log('2. Testing GET /api/v1/agents/models...');
  const modelsRes = await fetch(`${BASE_URL}/api/v1/agents/models`, {
    headers: {
      Origin: ORIGIN,
      Cookie: cookieHeader,
    },
  });
  const modelsData = await modelsRes.json();
  console.log(`   Provider: ${modelsData.provider}, allAvailable: ${modelsData.allAvailable}`);
  console.log('   Catalog breakdown:');
  for (const m of modelsData.verified) {
    console.log(`     - [${m.availableOnProvider ? 'ACTIVE' : 'UNAVAILABLE'}] ${m.id} (${m.name})`);
  }

  // 3. Test POST /api/v1/agents with an unavailable model (llama-3.3-70b-versatile)
  console.log('\n3. Testing POST /api/v1/agents with UNAVAILABLE model "llama-3.3-70b-versatile"...');
  const createUnavailableRes = await fetch(`${BASE_URL}/api/v1/agents`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Origin': ORIGIN,
      'Cookie': cookieHeader,
      'x-xsrf-token': csrfToken,
    },
    body: JSON.stringify({
      name: 'Unavailable Model Agent',
      instructions: 'You are an agent with an unavailable model test.',
      model: 'llama-3.3-70b-versatile',
      tools: ['calculator'],
    }),
  });

  const unavailableJson = await createUnavailableRes.json();
  console.log(`   Response Status: ${createUnavailableRes.status}`);
  console.log(`   Response Error:`, JSON.stringify(unavailableJson.error, null, 2));

  if (createUnavailableRes.status !== 400 || unavailableJson.error?.code !== 'MODEL_UNAVAILABLE') {
    throw new Error('FAIL: Backend should have rejected unavailable model with 400 MODEL_UNAVAILABLE!');
  }
  console.log('   PASS: Backend strictly rejected saving an unavailable model.\n');

  // 4. Test POST /api/v1/agents with an AVAILABLE model (qwen/qwen3.8-27b)
  console.log('4. Testing POST /api/v1/agents with AVAILABLE model "qwen/qwen3.8-27b"...');
  const createAvailableRes = await fetch(`${BASE_URL}/api/v1/agents`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Origin': ORIGIN,
      'Cookie': cookieHeader,
      'x-xsrf-token': csrfToken,
    },
    body: JSON.stringify({
      name: 'Active Model Verified Agent',
      instructions: 'You are an agent created with verified model qwen/qwen3.8-27b.',
      model: 'qwen/qwen3.8-27b',
      tools: ['calculator'],
    }),
  });

  const availableJson = await createAvailableRes.json();
  console.log(`   Response Status: ${createAvailableRes.status}`);
  if (createAvailableRes.status !== 201) {
    throw new Error(`FAIL: Creation failed with status ${createAvailableRes.status}: ${JSON.stringify(availableJson)}`);
  }
  console.log(`   Created Agent ID: ${availableJson.agent._id}`);
  console.log(`   Saved Model ID: ${availableJson.agent.model}`);
  if (availableJson.agent.model !== 'qwen/qwen3.8-27b') {
    throw new Error(`FAIL: Agent model does not match qwen/qwen3.8-27b!`);
  }
  console.log('   PASS: Agent successfully saved with verified model.\n');

  // 5. Test AI generation consistency
  console.log('5. Testing AI configuration proposal consistency...');
  const genRes = await fetch(`${BASE_URL}/api/v1/agents/generate-config`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Origin': ORIGIN,
      'Cookie': cookieHeader,
      'x-xsrf-token': csrfToken,
    },
    body: JSON.stringify({
      purpose: 'An equity research agent that evaluates company growth ratios using the calculator.',
    }),
  });

  const genData = await genRes.json();
  console.log(`   AI Generation Status: ${genRes.status}`);
  console.log(`   Model Used by Engine: ${genData.modelUsed}`);
  console.log(`   Model in Proposal:    ${genData.proposal?.model}`);

  if (genData.modelUsed !== genData.proposal?.model) {
    throw new Error(`FAIL: Mismatch detected! Engine used ${genData.modelUsed} but proposal contained ${genData.proposal?.model}`);
  }
  if (genData.proposal?.model !== 'qwen/qwen3.8-27b') {
    throw new Error(`FAIL: Expected model to be qwen/qwen3.8-27b, got ${genData.proposal?.model}`);
  }
  console.log('   PASS: Model used by inference engine strictly matches proposal model ID.\n');

  // 6. Test AI generation with explicitly requested unavailable model
  console.log('6. Testing AI generation with requested unavailable model (llama-3.3-70b-versatile)...');
  const genUnavailableRes = await fetch(`${BASE_URL}/api/v1/agents/generate-config`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Origin': ORIGIN,
      'Cookie': cookieHeader,
      'x-xsrf-token': csrfToken,
    },
    body: JSON.stringify({
      purpose: 'An assistant to summarize research notes.',
      model: 'llama-3.3-70b-versatile',
    }),
  });

  const genUnavailableJson = await genUnavailableRes.json();
  console.log(`   Response Status: ${genUnavailableRes.status}`);
  console.log(`   Response Error:`, JSON.stringify(genUnavailableJson.error, null, 2));

  if (genUnavailableRes.status !== 400 || genUnavailableJson.error?.code !== 'MODEL_UNAVAILABLE') {
    throw new Error('FAIL: Backend should have rejected unavailable model request with 400 MODEL_UNAVAILABLE!');
  }
  console.log('   PASS: Generation rejected before inference when requested model is unavailable.\n');

  console.log('=== All Model-Availability Consistency Checks PASSED ===');
}

runTest().catch((err) => {
  console.error('\nTEST FAILED:', err);
  process.exit(1);
});
