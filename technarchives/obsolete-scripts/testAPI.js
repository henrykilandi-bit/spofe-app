// Simple test for Chart of Accounts API - try without token first
const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/chart-of-accounts',
  method: 'GET'
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:');
    try {
      const json = JSON.parse(data);
      console.log(JSON.stringify(json, null, 2));
    } catch (e) {
      console.log(data.substring(0, 500));
    }
  });
});

req.on('error', (err) => {
  console.error('Error:', err.message);
});

req.end();
