/**
 * Parser pour résultats de performance
 * Génère des rapports formatés à partir des résultats JSON
 */

import fs from 'fs';
import path from 'path';

const resultsFile = 'test-results/performance-results.json';

if (!fs.existsSync(resultsFile)) {
  console.log('❌ No performance results file found');
  process.exit(1);
}

const results = JSON.parse(fs.readFileSync(resultsFile, 'utf8'));

// Thresholds
const THRESHOLDS = {
  LOGIN: 3000,
  CREATE_ENTRY: 5000,
  VALIDATE_ENTRY: 4000,
  BALANCE_GENERATION: 8000,
  BALANCE_EXPORT: 10000,
  ENTRY_LIST_LOAD: 2000,
  ENTRY_DETAIL: 1500,
  SEARCH: 1000,
};

console.log('\n📊 PERFORMANCE TEST RESULTS');
console.log('═'.repeat(60));

let passCount = 0;
let failCount = 0;

results.forEach((result, index) => {
  if (Array.isArray(result)) {
    result.forEach(r => processResult(r));
  } else {
    processResult(result);
  }
});

function processResult(r) {
  if (!r.title) return;
  
  const threshold = THRESHOLDS[r.title.toUpperCase().replace(/[^A-Z_]/g, '')] || 5000;
  const passed = r.duration < threshold;
  const status = passed ? '✅' : '❌';
  
  if (passed) passCount++;
  else failCount++;
  
  const bar = generateBar(r.duration, threshold);
  console.log(`${status} ${r.title}`);
  console.log(`   ${r.duration}ms / ${threshold}ms ${bar}`);
}

function generateBar(duration, threshold) {
  const width = 30;
  const filled = Math.round((duration / threshold) * width);
  const empty = width - filled;
  const percentage = ((duration / threshold) * 100).toFixed(0);
  
  return `[${filled > 0 ? '█'.repeat(Math.min(filled, width)) : ''}${empty > 0 ? '░'.repeat(Math.min(empty, width)) : ''}] ${percentage}%`;
}

console.log('\n' + '═'.repeat(60));
console.log(`✅ Passed: ${passCount}`);
console.log(`❌ Failed: ${failCount}`);
console.log(`Total: ${passCount + failCount}`);

if (failCount > 0) {
  console.log('\n⚠️  Some performance thresholds were exceeded!');
  process.exit(1);
} else {
  console.log('\n✨ All performance tests passed!');
  process.exit(0);
}
