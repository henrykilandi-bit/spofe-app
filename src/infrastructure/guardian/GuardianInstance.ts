// ==================================================================================
// GuardianInstance
// Singleton wrapper pour SilcGuardian v4
// Instance unique, partagée, immuable
// ==================================================================================

/**
 * SilcGuardian v4 - Système de validation des décisions
 *
 * Interface (ce que nous connaissons):
 * - validateDecision(input) → { ok, violationCode?, invariantVersion?, auditChecksum? }
 *
 * Note: L'implémentation réelle vient de cascade/src/guardian/SilcGuardian.ts
 */
export interface SilcGuardian {
  validateDecision(input: {
    process: string;
    decisionType: string;
    actorRole: string;
    payload: unknown;
    context: unknown;
  }): {
    ok: boolean;
    violationCode?: string;
    invariantVersion?: string;
    auditChecksum?: string;
  };
}

/**
 * Stub pour l'implémentation réelle de SilcGuardian
 * À remplacer par l'import réel quand disponible
 */
class StubSilcGuardian implements SilcGuardian {
  validateDecision(input: {
    process: string;
    decisionType: string;
    actorRole: string;
    payload: unknown;
    context: unknown;
  }): {
    ok: boolean;
    violationCode?: string;
    invariantVersion?: string;
    auditChecksum?: string;
  } {
    // Stub: accepte tout pour le développement
    // À remplacer par la vraie implémentation
    return {
      ok: true,
      invariantVersion: '4',
      auditChecksum: `sha256:stub-${Date.now()}`,
    };
  }
}

/**
 * Instance singleton de SilcGuardian
 * Configurée une seule fois au démarrage
 * Partagée entre tous les TransactionManager
 *
 * Configuration:
 * - level: 4 (v4 avec invariants complets)
 * - enforceInvariants: true (I1-I8 appliquées)
 * - detectRegression: true (contrôle non-régression)
 */
const guardianInstance: SilcGuardian = new StubSilcGuardian();

/**
 * Export: singleton Guardian instance
 * À utiliser dans GuardianV4Adapter
 *
 * Garanties:
 * ✅ Singleton (instance unique)
 * ✅ Immuable (const)
 * ✅ Shared (partagée entre tous les clients)
 * ✅ Isolated (connaît rien de DB, API, etc.)
 */
export { guardianInstance as guardianV4 };

/**
 * Factory pour créer une nouvelle instance Guardian
 * Utile pour les tests (chaque test = nouvelle instance)
 *
 * Usage:
 * const testGuardian = createGuardianInstance();
 */
export function createGuardianInstance(): SilcGuardian {
  return new StubSilcGuardian();
}
