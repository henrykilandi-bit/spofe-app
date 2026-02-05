/**
 * Handler: AllocateAsset
 * Module Immobilisation v1.0.0
 */
import { AllocateAssetCommand } from '../../commands/allocate-asset.command.js';
import { ImmobilisationGuardian } from '../../../guardian/immobilisation.guardian.js';
import { AssetWriteRepository } from '../../repository/asset.repository.js';
export declare class AllocateAssetHandler {
    private readonly guardian;
    private readonly repository;
    constructor(guardian: ImmobilisationGuardian, repository: AssetWriteRepository);
    execute(command: AllocateAssetCommand): Promise<void>;
    private mapToAssetState;
    private generateId;
}
//# sourceMappingURL=allocate-asset.handler.d.ts.map