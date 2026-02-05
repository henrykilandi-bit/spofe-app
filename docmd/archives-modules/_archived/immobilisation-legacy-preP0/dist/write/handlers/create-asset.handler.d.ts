/**
 * Handler: CreateAsset
 * Module Immobilisation v1.0.0
 *
 * Orchestration write-side:
 * 1. Load state
 * 2. Guardian validation (UNIQUE point de validation métier)
 * 3. Generate event
 * 4. Persist
 *
 * ❌ Aucune logique métier ici
 * ✅ Uniquement de l'orchestration
 */
import { CreateAssetCommand } from '../../commands/create-asset.command';
import { ImmobilisationGuardian } from '../../../guardian/immobilisation.guardian';
import { AssetWriteRepository } from '../../repository/asset.repository';
export declare class CreateAssetHandler {
    private readonly guardian;
    private readonly repository;
    constructor(guardian: ImmobilisationGuardian, repository: AssetWriteRepository);
    execute(command: CreateAssetCommand): Promise<void>;
    private generateId;
}
//# sourceMappingURL=create-asset.handler.d.ts.map