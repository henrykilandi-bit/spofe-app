/**
 * TresoconsolidationGuardian.ts
 * Guardian d'intégrité transverse P0 — Module Tresoconsolidation
 *
 * @module tresoconsolidation
 * @layer guardian
 * @governance SPOFE P0
 * @status IMMUTABLE
 *
 * Responsabilités :
 * - Garantir le caractère read-only strict
 * - Valider les sources autorisées
 * - Bloquer tout accès aux couches write
 * - Assurer l'isolation multi-tenant
 * - Rejeter toute logique métier ou comptable
 */

import {
  ConsolidationContext,
  TreasurySource,
} from './TresoconsolidationGuardian.types';

import {
  ReadOnlyViolation,
  UnauthorizedSourceViolation,
  WriteLayerAccessViolation,
  TenantIsolationViolation,
  BusinessLogicViolation,
  AccountingLogicViolation,
  UncertifiedSourceViolation,
  InvalidSourceViolation,
  MethodNotAllowedViolation,
} from './TresoconsolidationGuardianErrors';

export class TresoconsolidationGuardian {
  private static readonly ALLOWED_SOURCES: TreasurySource[] = [
    'CAISSE',
    'BANQUE',
  ];

  private static readonly ALLOWED_MODULES = [
    'tresorerie-caisse',
    'tresorerie-banque',
  ];

  /**
   * G-TRESO-01 — Read-only strict
   * G-TRESO-10 — API GET uniquement
   *
   * Vérifie que le contexte est read-only et que la méthode HTTP est GET.
   */
  static assertReadOnly(isReadOnly: boolean, httpMethod?: string): void {
    if (!isReadOnly) {
      throw new ReadOnlyViolation('Tresoconsolidation is strictly read-only');
    }

    if (httpMethod && httpMethod !== 'GET') {
      throw new MethodNotAllowedViolation(
        `HTTP method ${httpMethod} is not allowed`
      );
    }
  }

  /**
   * G-TRESO-02 — Sources autorisées uniquement
   * G-TRESO-08 — Traçabilité de la source
   *
   * Vérifie que la source est CAISSE ou BANQUE.
   */
  static assertSource(source: TreasurySource): void {
    if (!this.ALLOWED_SOURCES.includes(source)) {
      throw new InvalidSourceViolation(`Invalid source: ${source}`);
    }
  }

  /**
   * G-TRESO-02 — Sources autorisées uniquement
   * G-TRESO-09 — Données certifiées uniquement
   *
   * Vérifie que le module source est autorisé et certifié BUILD_PROOF.
   */
  static assertAuthorizedModule(context: ConsolidationContext): void {
    if (!this.ALLOWED_MODULES.includes(context.sourceModule)) {
      throw new UnauthorizedSourceViolation(
        `Module ${context.sourceModule} is not authorized`
      );
    }

    if (!context.certifiedSource.certified) {
      throw new UncertifiedSourceViolation(
        `Source module ${context.sourceModule} is not BUILD_PROOF certified`
      );
    }
  }

  /**
   * G-TRESO-03 — Interdiction d'accès aux couches write
   *
   * Vérifie que seule la couche READ_MODEL est accédée.
   */
  static assertReadLayerOnly(context: ConsolidationContext): void {
    if (context.accessedLayer !== 'READ_MODEL') {
      throw new WriteLayerAccessViolation(
        `Access to ${context.accessedLayer} is forbidden`
      );
    }
  }

  /**
   * G-TRESO-04 — Isolation multi-tenant
   *
   * Vérifie qu'aucune agrégation cross-tenant n'est tentée.
   */
  static assertTenantIsolation(
    requestedTenantId: string,
    dataTenantId: string
  ): void {
    if (requestedTenantId !== dataTenantId) {
      throw new TenantIsolationViolation(
        'Cross-tenant consolidation is forbidden'
      );
    }
  }

  /**
   * G-TRESO-05 — Pas de logique métier
   *
   * Rejette si une logique métier est détectée.
   */
  static assertNoBusinessLogic(detected: boolean): void {
    if (detected) {
      throw new BusinessLogicViolation(
        'Business logic detected in consolidation'
      );
    }
  }

  /**
   * G-TRESO-06 — Pas de logique comptable
   *
   * Rejette si une logique comptable est détectée.
   */
  static assertNoAccountingLogic(detected: boolean): void {
    if (detected) {
      throw new AccountingLogicViolation(
        'Accounting logic is forbidden in Tresoconsolidation'
      );
    }
  }

  /**
   * 🎯 Entry point unique — Validation complète du contexte
   *
   * Valide tous les invariants P0 en une seule passe.
   * Doit être appelé avant toute exposition read-model / API.
   */
  static validate(context: ConsolidationContext, httpMethod?: string): void {
    this.assertReadOnly(context.isReadOnly, httpMethod);
    this.assertSource(context.source);
    this.assertAuthorizedModule(context);
    this.assertReadLayerOnly(context);
  }
}
