/**
 * Handler: DisposeAsset
 * Module Immobilisation v1.0.0
 */
import { DisposeAssetCommand } from '../../commands/dispose-asset.command';
import { ImmobilisationGuardian } from '../../../guardian/immobilisation.guardian';
import { AssetWriteRepository } from '../../repository/asset.repository';
export declare class DisposeAssetHandler {
    private readonly guardian;
    private readonly repository;
    constructor(guardian: ImmobilisationGuardian, repository: AssetWriteRepository);
    execute(command: DisposeAssetCommand): Promise<void>;
    private mapToAssetState;
    private mapToDepreciationState;
    private generateId;
}
//# sourceMappingURL=dispose-asset.handler.d.ts.map