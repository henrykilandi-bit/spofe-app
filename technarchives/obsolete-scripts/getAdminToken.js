// Login to get a valid token
const http = require('http');

const loginData = JSON.stringify({
  username: 'admin',
  password: 'admin123'
});

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': loginData.length
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      if (response.success && response.data.token) {
        console.log(response.data.token);
        process.exit(0);
      } else {
        console.error('Login failed:', response.message);
        process.exit(1);
      }
    } catch (e) {
      console.error('Error parsing response:', e.message);
      console.error('Response:', data);
      process.exit(1);
    }
  });
});

req.on('error', (err) => {
  console.error('Error:', err);
  process.exit(1);
});

req.write(loginData);
req.end();
