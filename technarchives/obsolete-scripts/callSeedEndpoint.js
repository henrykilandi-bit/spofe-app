// Simple script to call the seed endpoint
const http = require('http');

const adminToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjgsInVzZXJuYW1lIjoiYWRtaW4iLCJlbWFpbCI6ImFkbWluQGV4YW1w bGUuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzY4ODMxODYwLCJleHAiOjE3Njg5MTgyNjB9.EO1YMTdWfxumH2IcBerAc-N8ApZIQET3BBQ49jrmr40';

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/chart-of-accounts/seed',
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${adminToken}`,
    'Content-Type': 'application/json',
    'Content-Length': 0
  }
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('RESPONSE BODY:');
    try {
      console.log(JSON.stringify(JSON.parse(data), null, 2));
    } catch (e) {
      console.log(data);
    }
    process.exit(0);
  });
});

req.on('error', (err) => {
  console.error('Error:', err);
  process.exit(1);
});

req.end();
