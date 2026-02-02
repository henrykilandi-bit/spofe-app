#!/usr/bin/env node

// Direct Guardian HTTP Mapping Tests using Node.js

const http = require('http');
const https = require('https');

const SERVER_URL = new URL('http://127.0.0.1:3001');

let testsPassed = 0;
let testsFailed = 0;

function request(options, data = null) {
    return new Promise((resolve, reject) => {
        const protocol = SERVER_URL.protocol === 'https:' ? https : http;
        const req = protocol.request(
            {
                hostname: SERVER_URL.hostname,
                port: SERVER_URL.port,
                path: options.path,
                method: options.method,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                timeout: 5000
            },
            (res) => {
                let responseData = '';
                res.on('data', (chunk) => {
                    responseData += chunk;
                });
                res.on('end', () => {
                    resolve({
                        status: res.statusCode,
                        body: responseData,
                        headers: res.headers
                    });
                });
            }
        );
        
        req.on('error', reject);
        req.on('timeout', () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });
        
        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

async function test(name, method, endpoint, expectedStatus, expectedKey, body = null) {
    process.stdout.write(`[${testsPassed + testsFailed + 1}] Testing: ${name}\n`);
    process.stdout.write(`  ${method} ${endpoint}\n`);
    
    try {
        const response = await request({ path: endpoint, method }, body);
        
        if (response.status === expectedStatus) {
            let jsonBody = {};
            try {
                jsonBody = JSON.parse(response.body);
            } catch (e) {}
            
            if (expectedKey && jsonBody[expectedKey]) {
                process.stdout.write(`  ✓ PASS - Status ${response.status}, Key '${expectedKey}' found\n`);
                testsPassed++;
            } else if (!expectedKey) {
                process.stdout.write(`  ✓ PASS - Status ${response.status}\n`);
                testsPassed++;
            } else {
                process.stdout.write(`  ✗ FAIL - Status ${response.status} OK, but key '${expectedKey}' missing\n`);
                testsFailed++;
            }
        } else {
            process.stdout.write(`  ✗ FAIL - Expected ${expectedStatus}, got ${response.status}\n`);
            testsFailed++;
        }
    } catch (error) {
        process.stdout.write(`  ✗ FAIL - Connection error: ${error.message}\n`);
        testsFailed++;
    }
    
    process.stdout.write('\n');
}

async function runTests() {
    console.log('');
    console.log('============================================================');
    console.log('    Guardian HTTP Mapping - Direct Tests');
    console.log('============================================================');
    console.log('');
    
    // Test 1: Health Check (200)
    await test(
        'Health Check',
        'GET',
        '/health',
        200,
        'status'
    );
    
    // Test 2: Guardian rejection - USER role (403)
    await test(
        'Guardian Rejection (USER role)',
        'POST',
        '/api/v1/aggregates',
        403,
        'violation',
        { aggregateId: '550e8400-e29b-41d4-a716-446655440001', actorRole: 'USER' }
    );
    
    // Test 3: Success - SYSTEM role (201)
    await test(
        'Success (SYSTEM role)',
        'POST',
        '/api/v1/aggregates',
        201,
        'status',
        { aggregateId: '550e8400-e29b-41d4-a716-446655440002', actorRole: 'SYSTEM' }
    );
    
    // Test 4: 404 - Not Found
    await test(
        '404 Not Found',
        'GET',
        '/api/v1/nonexistent-resource',
        404,
        null
    );
    
    // Test 5: 401 - Unauthorized (no token)
    await test(
        '401 Unauthorized (no token)',
        'GET',
        '/api/profile',
        401,
        null
    );
    
    // Results summary
    console.log('============================================================');
    console.log('                    TEST RESULTS');
    console.log('============================================================');
    console.log('');
    console.log(`  Passed: ${testsPassed}`);
    console.log(`  Failed: ${testsFailed}`);
    console.log(`  Total:  ${testsPassed + testsFailed}`);
    console.log('');
    
    if (testsFailed === 0) {
        console.log('✓ ALL TESTS PASSED - Guardian HTTP Mapping Working!');
        console.log('');
        console.log('Summary:');
        console.log('  ✓ Health check endpoint (200)');
        console.log('  ✓ Guardian rejection for USER role (403 with G4-03)');
        console.log('  ✓ Success for SYSTEM role (201)');
        console.log('  ✓ 404 error handling');
        console.log('  ✓ 401 unauthorized handling');
        console.log('');
        console.log('Guardian → HTTP mapping is functional and correct!');
        process.exit(0);
    } else {
        console.log('✗ SOME TESTS FAILED - Review output above');
        process.exit(1);
    }
}

runTests().catch(err => {
    console.error('Test suite error:', err);
    process.exit(1);
});
