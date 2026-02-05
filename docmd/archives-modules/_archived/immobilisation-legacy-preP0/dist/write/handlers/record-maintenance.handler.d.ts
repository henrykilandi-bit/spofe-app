/**
 * Handler: RecordMaintenance
 * Module Immobilisation v1.0.0
 */
import { RecordMaintenanceCommand } from '../../commands/record-maintenance.command';
import { ImmobilisationGuardian } from '../../../guardian/immobilisation.guardian';
import { AssetWriteRepository } from '../../repository/asset.repository';
export declare class RecordMaintenanceHandler {
    private readonly guardian;
    private readonly repository;
    constructor(guardian: ImmobilisationGuardian, repository: AssetWriteRepository);
    execute(command: RecordMaintenanceCommand): Promise<void>;
    private mapToAssetState;
    private generateId;
}
//# sourceMappingURL=record-maintenance.handler.d.ts.map