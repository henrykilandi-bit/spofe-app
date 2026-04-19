export type TierStatus = 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED';
export type TierRole = 'CLIENT' | 'FOURNISSEUR' | 'SALARIE' | 'ORGANISME_SOCIAL' | 'AUTRE';
export type DocumentState = 'draft' | 'validated' | 'cancelled';
export interface TierDocument {
    id: string;
    type: string;
    state: DocumentState;
    payload: Record<string, unknown>;
}
export interface TierAggregate {
    tierId: string;
    tenantId: string;
    status: TierStatus;
    roles: TierRole[];
    legalIdentifiers?: string[];
}
export interface GuardianContext {
    tenantId: string;
    actorId?: string;
    commandType: string;
    document: TierDocument;
    currentTier?: TierAggregate;
}
//# sourceMappingURL=GuardianContext.d.ts.map