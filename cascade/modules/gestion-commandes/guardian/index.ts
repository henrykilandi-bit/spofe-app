/**
 * SPOFE Module: Gestion-Commandes v1.0.0
 * Guardian Layer - Order create/cancel slice
 */

import type {
  CancelGestionCommandeInput,
  CreateGestionCommandeInput,
  GestionCommande,
  GestionCommandeStatus
} from '../domain';

export class GuardianError extends Error {
  constructor(
    public readonly code: string,
    message: string
  ) {
    super(message);
    this.name = 'GuardianError';
  }
}

export interface GestionCommandesGuardian {
  readonly moduleId: string;
  readonly guardiansCount: number;
  readonly status: string;
  readonly executable: true;
}

const declaredInvariants = [
  'GC01_TENANT_ISOLATION',
  'GC02_TIERS_REQUIRED',
  'GC03_STOCK_REQUIRED',
  'GC04_VALIDATED_DOCUMENT_ONLY',
  'GC05_APPEND_ONLY',
  'GC06_POSITIVE_QUANTITY',
  'GC07_NO_POST_VALIDATION_MUTATION',
  'GC08_ACTOR_REQUIRED',
  'GC09_CANCEL_ALLOWED_STATUS'
] as const;

const assertCreateOrder = (
  input: CreateGestionCommandeInput
): void => {
  if (input.commandType !== 'CREATE_ORDER') {
    throw new GuardianError('GC05_APPEND_ONLY', 'Only CREATE_ORDER is allowed in the first slice');
  }
  if (!input.commandId.trim() || !input.orderId.trim()) {
    throw new GuardianError('GC05_APPEND_ONLY', 'commandId and orderId are required for append-only creation');
  }
  if (!input.tenantId.trim()) {
    throw new GuardianError('GC01_TENANT_ISOLATION', 'tenantId is required');
  }
  if (!input.tiersId.trim()) {
    throw new GuardianError('GC02_TIERS_REQUIRED', 'tiersId is required');
  }
  if (!input.stockId.trim()) {
    throw new GuardianError('GC03_STOCK_REQUIRED', 'stockId is required');
  }
  if (!input.documentId.trim() || input.documentStatus !== 'VALIDATED') {
    throw new GuardianError('GC04_VALIDATED_DOCUMENT_ONLY', 'document must exist and be VALIDATED');
  }
  if (!input.actorId.trim()) {
    throw new GuardianError('GC08_ACTOR_REQUIRED', 'actorId is required');
  }
  if (input.quantity <= 0) {
    throw new GuardianError('GC06_POSITIVE_QUANTITY', 'quantity must be strictly positive');
  }
};

const cancellableStatuses: readonly GestionCommandeStatus[] = ['CREATED'];

const assertCancelOrder = (
  input: CancelGestionCommandeInput,
  currentOrder: GestionCommande
): void => {
  if (input.commandType !== 'CANCEL_ORDER') {
    throw new GuardianError('GC05_APPEND_ONLY', 'Only CANCEL_ORDER is allowed for cancellation');
  }
  if (!input.commandId.trim() || !input.orderId.trim()) {
    throw new GuardianError('GC05_APPEND_ONLY', 'commandId and orderId are required for cancellation');
  }
  if (!input.actorId.trim()) {
    throw new GuardianError('GC08_ACTOR_REQUIRED', 'actorId is required');
  }
  if (!input.tenantId.trim() || input.tenantId !== currentOrder.tenantId) {
    throw new GuardianError('GC01_TENANT_ISOLATION', 'tenantId must match current order tenant');
  }
  if (input.orderId !== currentOrder.orderId) {
    throw new GuardianError('GC05_APPEND_ONLY', 'orderId mismatch with current order');
  }
  if (!cancellableStatuses.includes(currentOrder.status)) {
    throw new GuardianError(
      'GC09_CANCEL_ALLOWED_STATUS',
      `Order status ${currentOrder.status} cannot be cancelled`
    );
  }
};

export const GestionCommandesGuardian = {
  moduleId: 'gestion-commandes',
  guardiansCount: declaredInvariants.length,
  status: 'FIRST_SLICE_ACTIVE' as const,
  executable: true as const,
  declaredInvariants,
  assertCreateOrder,
  assertCancelOrder,
  cancellableStatuses,
  validateScaffold: () => true
} as const;
