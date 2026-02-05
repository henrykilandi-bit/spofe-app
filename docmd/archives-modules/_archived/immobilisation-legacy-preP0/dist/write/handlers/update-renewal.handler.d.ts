/**
 * Handler: UpdateRenewal
 * Module Immobilisation v1.0.0
 */
import { UpdateRenewalCommand } from '../../commands/update-renewal.command';
import { ImmobilisationGuardian } from '../../../guardian/immobilisation.guardian';
import { AssetWriteRepository } from '../../repository/asset.repository';
export declare class UpdateRenewalHandler {
    private readonly guardian;
    private readonly repository;
    constructor(guardian: ImmobilisationGuardian, repository: AssetWriteRepository);
    execute(command: UpdateRenewalCommand): Promise<void>;
    private mapToAssetState;
    private generateId;
}
//# sourceMappingURL=update-renewal.handler.d.ts.map