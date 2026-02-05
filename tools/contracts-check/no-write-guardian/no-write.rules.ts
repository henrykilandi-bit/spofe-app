import { WriteViolation } from './no-write.check';

export function enforceNoWrite(
  violations: WriteViolation[]
): void {
  if (violations.length === 0) return;

  const report = violations
    .map(
      (v) =>
        `${v.file}:${v.line} → ${v.reason}` 
    )
    .join('\n');

  throw new Error(
    `❌ NO WRITE OUTSIDE GUARDIAN VIOLATION\n\n${report}\n\n💡 SPOFE Constitutional Rule: All business writes MUST go through src/guardian/` 
  );
}

export function formatViolationsReport(violations: WriteViolation[]): string {
  if (violations.length === 0) {
    return '✅ NO WRITE OUTSIDE GUARDIAN - PASSED';
  }

  const header = `❌ NO WRITE OUTSIDE GUARDIAN - ${violations.length} violation(s) found:\n`;
  const details = violations
    .map((v) => `  📍 ${v.file}:${v.line} → ${v.reason}`)
    .join('\n');
  
  return `${header}${details}`;
}

export function groupViolationsByFile(violations: WriteViolation[]): Record<string, WriteViolation[]> {
  return violations.reduce((groups, violation) => {
    const file = violation.file;
    if (!groups[file]) {
      groups[file] = [];
    }
    groups[file].push(violation);
    return groups;
  }, {} as Record<string, WriteViolation[]>);
}
