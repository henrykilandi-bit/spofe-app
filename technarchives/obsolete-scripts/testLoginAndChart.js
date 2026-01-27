// Create admin user if not exists and get token
const http = require('http');

// Try to login first  
const loginOptions = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
};

// Try different credentials
const credentials = [
  { email: 'admin@spofe.com', password: 'admin' },
  { email: 'admin@example.com', password: 'admin' },
  { email: 'admin@spofe.com', password: '123' },
  { email: 'admin', password: 'admin' },
];

let tokenFound = false;

async function tryLogin(cred) {
  return new Promise((resolve) => {
    const body = JSON.stringify(cred);
    
    const req = http.request(loginOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.data && result.data.token) {
            console.log('✓ Logged in with', cred.email, cred.password);
            console.log('Token:', result.data.token.substring(0, 50) + '...');
            
            // Now call chart API with this token
            callChartAPI(result.data.token);
            tokenFound = true;
          }
          resolve(!!result.data?.token);
        } catch (e) {
          resolve(false);
        }
      });
    });
    
    req.on('error', () => resolve(false));
    req.write(body);
    req.end();
  });
}

function callChartAPI(token) {
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
  
  const req = http.request(chartOptions, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      try {
        const result = JSON.parse(data);
        console.log('');
        console.log('Chart API response status:', res.statusCode);
        if (result.success) {
          console.log('Accounts in data.accounts:', result.data.accounts?.length || 'undefined');
          console.log('Accounts in data.data:', result.data.data?.length || 'undefined');
          console.log('Is data array:', Array.isArray(result.data) ? 'yes' : 'no');
          
          if (result.data.accounts && result.data.accounts.length > 0) {
            console.log('First account:');
            console.log('  ', JSON.stringify(result.data.accounts[0], null, 2).split('\n').slice(0, 10).join('\n'));
          }
        } else {
          console.log('Error:', result.message);
        }
      } catch (e) {
        console.error('Parse error:', e.message);
        console.log('Raw:', data.substring(0, 300));
      }
      process.exit(0);
    });
  });
  
  req.on('error', (err) => {
    console.error('Request error:', err.message);
    process.exit(1);
  });
  
  req.end();
}

// Try credentials in sequence
async function main() {
  for (const cred of credentials) {
    const success = await tryLogin(cred);
    if (success) return;
  }
  console.log('No credentials worked');
  process.exit(1);
}

main();
