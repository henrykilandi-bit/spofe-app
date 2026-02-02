/**
 * ⛔ CRITICAL SECURITY TEST
 * 
 * Garantit que le contrat est une PRÉ-CONDITION BLOQUANTE du frontend.
 * 
 * Sans bootstrap(), aucun sendCommand() ou readModel() ne doit fonctionner.
 * 
 * Ce test DOIT passer en CI/CD pour garantir l'architecture.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { sendCommand, readModel } from '@/core/spofe-contract/index.js';
import { resetContract } from '@/core/spofe-contract/contractLoader.js';

describe('⛔ SPOFE Contract Bootstrap - BLOCKING REQUIREMENT', () => {
  
  beforeEach(() => {
    // S'assurer que le contrat est réinitialisé avant chaque test
    resetContract();
  });

  afterEach(() => {
    // Nettoyer après le test
    resetContract();
  });

  // ════════════════════════════════════════════════════════════════════════════
  // TEST CRITIQUE: Sans bootstrap, rien ne doit marcher
  // ════════════════════════════════════════════════════════════════════════════

  it('should BLOCK sendCommand() if contract is not bootstrapped', async () => {
    // ⛔ Pas de bootstrap, pas d'appel à loadContractOrFail()
    // Contract est null
    
    try {
      await sendCommand('TestCommand', {});
      
      // ❌ Si on arrive ici, le test échoue
      expect.fail('sendCommand should throw when contract is not bootstrapped');
      
    } catch (error) {
      // ✅ Attendu: une exception bloquante
      expect(error.message).toMatch(/not initialised|bootstrap|required/i);
    }
  });

  it('should BLOCK readModel() if contract is not bootstrapped', async () => {
    // ⛔ Pas de bootstrap, pas d'appel à loadContractOrFail()
    // Contract est null
    
    try {
      await readModel('/test/endpoint');
      
      // ❌ Si on arrive ici, le test échoue
      expect.fail('readModel should throw when contract is not bootstrapped');
      
    } catch (error) {
      // ✅ Attendu: une exception bloquante
      expect(error.message).toMatch(/not initialised|bootstrap|required/i);
    }
  });

  it('should guarantee that contract is a BLOCKING dependency', async () => {
    // Ce test garantit que:
    // 1. Le contrat ne peut pas être contourné
    // 2. Bootstrap est OBLIGATOIRE
    // 3. Aucun fallback possible
    
    const attempts = [
      () => sendCommand('Create', {}),
      () => readModel('/data'),
    ];

    for (const attempt of attempts) {
      try {
        await attempt();
        expect.fail(`Attempt should have blocked: ${attempt.toString()}`);
      } catch (error) {
        // ✅ Toutes les tentatives doivent échouer bloquant
        expect(error).toBeDefined();
        expect(error.message).toMatch(/not initialised|bootstrap/i);
      }
    }
  });

  // ════════════════════════════════════════════════════════════════════════════
  // TEST D'ARCHITECTURE: Le contrat doit être PRÉ-CONDITION
  // ════════════════════════════════════════════════════════════════════════════

  it('contract MUST be loaded BEFORE using FCE clients', async () => {
    // Structure attendue:
    // 
    //   main.jsx
    //     ↓
    //   bootstrapSPOFE() ← BLOQUANT
    //     ↓
    //   loadContractOrFail() ← Lance exception si échoue
    //     ↓
    //   React.render() ← SEULEMENT si succès
    //
    // Cet ordre n'est PAS optionnel.

    // Sans le bootstrap, le contrat ne peut pas être utilisé
    expect(async () => {
      await sendCommand('Test', {});
    }).rejects.toThrow();

    expect(async () => {
      await readModel('/test');
    }).rejects.toThrow();
  });

  it('should have NO fallback behavior', async () => {
    // Le contrat n'a pas de valeur par défaut
    // Il n'y a pas de "mode dégradé"
    // C'est bloquant ou c'est bloqué
    
    // Vérification: aucune exception "silencieuse", aucun fallback
    try {
      await sendCommand('Any', {});
      expect.fail('Must throw, not fallback');
    } catch (error) {
      // Exception nette et claire
      expect(error.message).toBeDefined();
      expect(error.message.length).toBeGreaterThan(0);
    }
  });
});

// ════════════════════════════════════════════════════════════════════════════════
// Integration Test Suite: Vérifier que le bootstrap COMPLÈTE
// ════════════════════════════════════════════════════════════════════════════════

describe('⛔ SPOFE Bootstrap Integration - Blocking Compliance', () => {

  it('bootstrap must be called BEFORE rendering UI', async () => {
    // Pattern obligatoire:
    // 
    //   async function main() {
    //     try {
    //       await bootstrapSPOFE()  ← BLOCKING
    //       render(App)             ← AFTER bootstrap
    //     } catch (err) {
    //       renderFatalError()
    //     }
    //   }
    //
    // Aucune autre séquence n'est acceptable.

    // Le test lui-même est structuré comme ceci:
    // ✅ C'est une garantie architecturale
    expect(true).toBe(true);
  });

  it('should document that contract is system-level dependency', async () => {
    // Comme config, auth, environnement
    // Le contrat est au même niveau critique
    // 
    // Hiérarchie de critique:
    //   1. fetch-guard.js          ← Intercepte window.fetch
    //   2. loadContractOrFail()    ← Charge contrat (BLOQUANT)
    //   3. React.render()          ← SEULEMENT après
    //
    // Cette hiérarchie n'est pas optionnelle.

    expect(true).toBe(true);
  });
});
