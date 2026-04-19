/**
 * TresoconsolidationGuardian.types.ts
 * Types Guardian P0 — Module Tresoconsolidation
 *
 * @module tresoconsolidation
 * @layer guardian
 * @governance SPOFE P0
 */

export type TreasurySource = 'CAISSE' | 'BANQUE';

export interface CertifiedSource {
  moduleName: string;
  buildProofHash: string;
  certified: boolean;
}

export interface ConsolidationContext {
  tenantId: string;
  source: TreasurySource;
  sourceModule: string;
  isReadOnly: boolean;
  certifiedSource: CertifiedSource;
  accessedLayer: 'READ_MODEL' | 'COMMAND' | 'EVENT' | 'WRITE_REPOSITORY';
  timestamp?: string;
}
