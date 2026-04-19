/**
 * Custom test sequencer for E2E tests
 * Ensures tests run in the correct order for multi-tenant scenarios
 */
const Sequencer = require('@jest/test-sequencer').default;

class CustomSequencer extends Sequencer {
  sort(tests) {
    // Sort tests to run setup/teardown in correct order
    const testOrder = [
      'setup.e2e.spec.ts',
      'multi-tenant-rls.e2e.spec.ts',
      'performance.e2e.spec.ts',
      'teardown.e2e.spec.ts'
    ];
    
    return tests.sort((testA, testB) => {
      const indexA = testOrder.findIndex(name => testA.path.includes(name));
      const indexB = testOrder.findIndex(name => testB.path.includes(name));
      
      if (indexA === -1 && indexB === -1) return 0;
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      
      return indexA - indexB;
    });
  }
}

module.exports = CustomSequencer;