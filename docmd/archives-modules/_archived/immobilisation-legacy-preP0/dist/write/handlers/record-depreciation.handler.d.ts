/**
 * Handler: RecordDepreciation
 * Module Immobilisation v1.0.0
 */
import { RecordDepreciationCommand } from '../../commands/record-depreciation.command';
import { ImmobilisationGuardian } from '../../../guardian/immobilisation.guardian';
import { AssetWriteRepository } from '../../repository/asset.repository';
export declare class RecordDepreciationHandler {
    private readonly guardian;
    private readonly repository;
    constructor(guardian: ImmobilisationGuardian, repository: AssetWriteRepository);
    execute(command: RecordDepreciationCommand): Promise<void>;
    private mapToAssetState;
    private mapToDepreciationState;
    private generateId;
}
//# sourceMappingURL=record-depreciation.handler.d.ts.map