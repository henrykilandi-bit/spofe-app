/**
 * Générateur de rapport de tests E2E
 * Combine tous les résultats et génère un rapport HTML
 */

import fs from 'fs';
import path from 'path';

const reportDir = 'test-report';
const resultsDir = 'all-results';

// Créer dossier rapport
if (!fs.existsSync(reportDir)) {
  fs.mkdirSync(reportDir, { recursive: true });
}

// Lire tous les résultats JUnit
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const browsers = ['chromium', 'firefox', 'webkit'];
const results = {};

browsers.forEach(browser => {
  const junitPath = path.join(resultsDir, `test-results-${browser}`, 'junit.xml');
  
  if (fs.existsSync(junitPath)) {
    const content = fs.readFileSync(junitPath, 'utf8');
    
    // Parse simplifié XML
    const testsMatch = content.match(/tests="(\d+)"/);
    const failuresMatch = content.match(/failures="(\d+)"/);
    
    const tests = parseInt(testsMatch?.[1] || 0);
    const failures = parseInt(failuresMatch?.[1] || 0);
    
    results[browser] = {
      tests,
      failures,
      passed: tests - failures,
    };
    
    totalTests += tests;
    failedTests += failures;
    passedTests += (tests - failures);
  }
});

// Générer HTML
const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SPOFE E2E Tests Report</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
        }
        
        .header p {
            font-size: 1.1em;
            opacity: 0.9;
        }
        
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            padding: 40px;
            background: #f8f9fa;
        }
        
        .stat-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid;
            text-align: center;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        .stat-card.passed {
            border-left-color: #28a745;
        }
        
        .stat-card.failed {
            border-left-color: #dc3545;
        }
        
        .stat-card.total {
            border-left-color: #667eea;
        }
        
        .stat-card h3 {
            color: #666;
            font-size: 0.9em;
            margin-bottom: 10px;
            text-transform: uppercase;
        }
        
        .stat-card .number {
            font-size: 2.5em;
            font-weight: bold;
        }
        
        .stat-card.passed .number {
            color: #28a745;
        }
        
        .stat-card.failed .number {
            color: #dc3545;
        }
        
        .stat-card.total .number {
            color: #667eea;
        }
        
        .browsers {
            padding: 40px;
        }
        
        .browsers h2 {
            margin-bottom: 20px;
            color: #333;
            font-size: 1.5em;
        }
        
        .browser-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
        }
        
        .browser-card {
            background: white;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            padding: 20px;
            transition: all 0.3s ease;
        }
        
        .browser-card:hover {
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
            transform: translateY(-2px);
        }
        
        .browser-card h3 {
            display: flex;
            align-items: center;
            margin-bottom: 15px;
            color: #333;
        }
        
        .browser-icon {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 10px;
            color: white;
            font-weight: bold;
        }
        
        .browser-card.chromium .browser-icon {
            background: linear-gradient(135deg, #34A853 0%, #1F9E46 100%);
        }
        
        .browser-card.firefox .browser-icon {
            background: linear-gradient(135deg, #FF6D00 0%, #E55100 100%);
        }
        
        .browser-card.webkit .browser-icon {
            background: linear-gradient(135deg, #FF2D55 0%, #D71D4D 100%);
        }
        
        .test-results {
            display: flex;
            justify-content: space-between;
            gap: 15px;
            font-size: 0.95em;
        }
        
        .test-result {
            flex: 1;
            padding: 10px;
            border-radius: 4px;
            text-align: center;
        }
        
        .test-result.passed {
            background: #d4edda;
            color: #155724;
        }
        
        .test-result.failed {
            background: #f8d7da;
            color: #721c24;
        }
        
        .footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #666;
            border-top: 1px solid #e0e0e0;
        }
        
        .pass-rate {
            font-size: 0.8em;
            margin-top: 10px;
            padding-top: 10px;
            border-top: 1px solid #e0e0e0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧪 SPOFE E2E Tests Report</h1>
            <p>Comprehensive Test Results & Metrics</p>
        </div>
        
        <div class="stats">
            <div class="stat-card total">
                <h3>Total Tests</h3>
                <div class="number">${totalTests}</div>
            </div>
            <div class="stat-card passed">
                <h3>Passed</h3>
                <div class="number">${passedTests}</div>
            </div>
            <div class="stat-card failed">
                <h3>Failed</h3>
                <div class="number">${failedTests}</div>
            </div>
            <div class="stat-card total">
                <h3>Pass Rate</h3>
                <div class="number">${totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : 0}%</div>
            </div>
        </div>
        
        <div class="browsers">
            <h2>🌐 Browser Results</h2>
            <div class="browser-grid">
                ${Object.entries(results).map(([browser, data]) => `
                    <div class="browser-card ${browser}">
                        <h3>
                            <div class="browser-icon">${browser[0].toUpperCase()}</div>
                            ${browser.charAt(0).toUpperCase() + browser.slice(1)}
                        </h3>
                        <div class="test-results">
                            <div class="test-result passed">
                                ✅ ${data.passed} Passed
                            </div>
                            <div class="test-result failed">
                                ${data.failures > 0 ? `❌ ${data.failures} Failed` : '✨ All Pass'}
                            </div>
                        </div>
                        <div class="pass-rate">
                            ${((data.passed / data.tests) * 100).toFixed(1)}% Pass Rate
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div class="footer">
            <p>Generated: ${new Date().toLocaleString()}</p>
            <p>SPOFE Accounting System - Automated E2E Testing</p>
        </div>
    </div>
</body>
</html>
`;

fs.writeFileSync(path.join(reportDir, 'index.html'), html);
console.log('✅ Test report generated:', path.join(reportDir, 'index.html'));
