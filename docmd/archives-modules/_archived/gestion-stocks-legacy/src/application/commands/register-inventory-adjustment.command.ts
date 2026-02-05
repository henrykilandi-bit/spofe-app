export interface RegisterInventoryAdjustmentCommand {
  readonly commandId: string;
  readonly tenantId: string;
  readonly depotId: string;
  readonly productId: string;
  readonly category: string;
  readonly quantityDelta: number;
  readonly documentId: string;
  readonly actorId: string;
}