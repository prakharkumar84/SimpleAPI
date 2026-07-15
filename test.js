const http = require('http');

function testPost(path, body, contentType, label) {
  return new Promise((resolve) => {
    const data = typeof body === 'string' ? body : JSON.stringify(body);
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: 'POST',
      headers: { 'Content-Type': contentType, 'Content-Length': Buffer.byteLength(data) }
    };
    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        console.log(`[${label}] Status: ${res.statusCode} | ${responseData}`);
        resolve();
      });
    });
    req.write(data);
    req.end();
  });
}

async function run() {
  console.log('--- /api/validate (text/plain) ---');
  await testPost('/api/validate', 'hello123', 'text/plain', 'Valid text');
  await testPost('/api/validate', '', 'text/plain', 'Empty text');

  console.log('\n--- /api/validate-json (application/json) ---');
  await testPost('/api/validate-json', { id: 'abc123' }, 'application/json', 'Valid JSON');
  await testPost('/api/validate-json', { id: 12345 }, 'application/json', 'Number ID');
  await testPost('/api/validate-json', { id: '' }, 'application/json', 'Empty string');
  await testPost('/api/validate-json', {}, 'application/json', 'Missing id');
}

run();
