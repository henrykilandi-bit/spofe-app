// src/guardian/types.ts
// IMMOBILISATION — Types Guardian (SPOFE P0)

export type ImmobilisationCategory =
  | 'CORPORELLE'
  | 'INCORPORELLE'
  | 'FINANCIERE';

export interface GuardianContext {
  tenantId: string;
  actorId: string;
}

export interface ImmobilisationFact {
  immobilisationId: string;
  tenantId: string;
  category: ImmobilisationCategory;
  acquisitionDate: string; // ISO
  documentId: string;
  amount: number;
  inServiceDate?: string;
  disposedDate?: string;
}
