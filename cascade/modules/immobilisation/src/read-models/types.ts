export interface ImmobilisationRM {
  immobilisationId: string;
  tenantId: string;
  category: 'CORPORELLE' | 'INCORPORELLE' | 'FINANCIERE';
  acquisitionDate: string;
  inServiceDate?: string;
  disposedDate?: string;
  amount: number;
  documentId: string;
  status: 'REGISTERED' | 'IN_SERVICE' | 'DISPOSED';
}
