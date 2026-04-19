/**
 * 🧪 Setup des Tests - Module Paramètres
 * 
 * Configuration globale pour les tests P0 du Guardian
 */

import { expect } from '@jest/globals';

// Configuration des timeouts pour les tests P0
jest.setTimeout(10000);

// Mock console methods pour éviter le bruit dans les tests
global.console = {
  ...console,
  // Garder error et warn pour le débogage
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
};

// Custom matchers pour les tests P0
expect.extend({
  toBeValidParametersFrame(received: any) {
    const pass = received && 
      received.frameId && 
      received.version && 
      received.status && 
      received.effectiveFrom;
    
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid ParametersFrame`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid ParametersFrame`,
        pass: false,
      };
    }
  },
  
  toViolateInvariant(received: any, invariant: string) {
    const pass = received.message && received.message.includes(invariant);
    
    if (pass) {
      return {
        message: () => `expected error not to violate invariant ${invariant}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected error to violate invariant ${invariant}`,
        pass: false,
      };
    }
  }
});

// Nettoyage après chaque test
afterEach(() => {
  jest.clearAllMocks();
});
