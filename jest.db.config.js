import baseConfig from './jest.config.js';

export default {
  ...baseConfig,
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/coverage/'],
  testMatch: [
    '**/tests/integration/guardian-db.spec.ts',
    '**/tests/constitutionnel/ConstitutionalDefenseLevel2.spec.ts',
    '**/tests/constitutionnel/TransactionManagerP0.spec.ts',
    '**/tests/constitutionnel/ConstitutionalLedger.spec.ts'
  ]
};
