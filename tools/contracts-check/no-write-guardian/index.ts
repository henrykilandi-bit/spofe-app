import { scanForWrites } from './no-write.check';
import { enforceNoWrite, formatViolationsReport, groupViolationsByFile } from './no-write.rules';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function runNoWriteCheck(moduleRoot: string = 'cascade/modules'): void {
  console.log('🔐 SCANNING FOR WRITES OUTSIDE GUARDIAN...');
  console.log(`📁 Module root: ${path.resolve(moduleRoot)}`);
  
  const violations = scanForWrites(moduleRoot);
  
  console.log(`📊 Scanned files: ${violations.length} violations found`);
  
  if (violations.length === 0) {
    console.log('✅ NO WRITE OUTSIDE GUARDIAN — PASSED');
    console.log('🛡️  All business writes are properly contained within Guardian');
    return;
  }

  console.log('\n' + formatViolationsReport(violations));
  
  // Group violations by file for better analysis
  const grouped = groupViolationsByFile(violations);
  console.log('\n📊 VIOLATIONS BY FILE:');
  Object.entries(grouped).forEach(([file, fileViolations]) => {
    console.log(`\n📄 ${file} (${fileViolations.length} violation(s))`);
    fileViolations.forEach(v => {
      console.log(`   Line ${v.line}: ${v.reason}`);
    });
  });

  console.log('\n💡 REMEDIATION:');
  console.log('   Move all business write operations to src/guardian/');
  console.log('   Read-only operations are allowed elsewhere');
  console.log('   Consider using CQRS patterns for read/write separation');

  enforceNoWrite(violations);
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const moduleRoot = process.argv[2] || 'cascade/modules';
  runNoWriteCheck(moduleRoot);
}

export { scanForWrites, enforceNoWrite, formatViolationsReport, groupViolationsByFile };
