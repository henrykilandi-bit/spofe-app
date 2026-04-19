// ❌ LEGACY TESTS - NON GUARDIAN COMPLIANT
// These tests violate Guardian rules and are isolated from BUILD_PROOF

/*
⚠️ WARNING: These tests should NOT be run in BUILD_PROOF validation

They contain anti-patterns:
- Direct repository manipulation
- Invalid data injection  
- Guardian rule violations
- Impossible state creation

For reference only - will be refactored or removed in future versions
*/

describe.skip('Legacy Tests - Guardian Violations', () => {
  // Tests moved here are skipped from BUILD_PROOF
  console.log('❌ Legacy tests isolated from Guardian validation');
});