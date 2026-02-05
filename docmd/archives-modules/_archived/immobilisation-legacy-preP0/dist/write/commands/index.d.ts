/**
 * Write Commands Index
 * Module Immobilisation v1.0.0
 *
 * Export toutes les commands du write-side
 */
export { CreateAssetCommand } from './create-asset.command';
export { UpdateRenewalCommand } from './update-renewal.command';
export { AllocateAssetCommand } from './allocate-asset.command';
export { RecordDepreciationCommand, CalculateDepreciationBatchCommand } from './record-depreciation.command';
export { RecordMaintenanceCommand } from './record-maintenance.command';
export { DisposeAssetCommand } from './dispose-asset.command';
export type ImmobilisationWriteCommand = CreateAssetCommand | UpdateRenewalCommand | AllocateAssetCommand | RecordDepreciationCommand | CalculateDepreciationBatchCommand | RecordMaintenanceCommand | DisposeAssetCommand;
//# sourceMappingURL=index.d.ts.map