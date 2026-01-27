// Test API with login and chart-of-accounts call
const http = require('http');

// Step 1: Login
const loginBody = JSON.stringify({
  email: 'admin@spofe.com',
  password: 'admin123'
});

const loginOptions = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': loginBody.length
  }
};

const loginReq = http.request(loginOptions, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  
  res.on('end', () => {
    try {
      const loginResult = JSON.parse(data);
      console.log('Login status:', res.statusCode);
      
      if (loginResult.data && loginResult.data.token) {
        const token = loginResult.data.token;
        console.log('Token obtained:', token.substring(0, 50) + '...');
        
        // Step 2: Call chart-of-accounts with token
        const chartOptions = {
          hostname: 'localhost',
          port: 3001,
          path: '/api/chart-of-accounts',
          method: 'GET',
          headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
          }
        };
        
        const chartReq = http.request(chartOptions, (res2) => {
          let chartData = '';
          res2.on('data', (chunk) => { chartData += chunk; });
          
          res2.on('end', () => {
            try {
              const chartResult = JSON.parse(chartData);
              console.log('');
              console.log('Chart of accounts status:', res2.statusCode);
              console.log('Accounts found:', chartResult.data.length);
              if (chartResult.data.length > 0) {
                console.log('First 3:');
                chartResult.data.slice(0, 3).forEach(acc => {
                  console.log('  -', acc.accountNumber, acc.accountName);
                });
              }
            } catch (e) {
              console.error('Error parsing chart response:', e.message);
              console.log('Raw:', chartData.substring(0, 300));
            }
            process.exit(0);
          });
        });
        
        chartReq.on('error', (err) => {
          console.error('Chart request error:', err.message);
          process.exit(1);
        });
        
        chartReq.end();
      } else {
        console.error('Login failed:', loginResult.message);
        process.exit(1);
      }
    } catch (e) {
      console.error('Error parsing login response:', e.message);
      console.log('Raw response:', data.substring(0, 300));
      process.exit(1);
    }
  });
});

loginReq.on('error', (err) => {
  console.error('Login request error:', err.message);
  process.exit(1);
});

loginReq.write(loginBody);
loginReq.end();
