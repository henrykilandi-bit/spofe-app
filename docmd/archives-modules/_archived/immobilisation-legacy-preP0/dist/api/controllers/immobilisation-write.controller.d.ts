/**
 * Write Controller - Module Immobilisation v1.0.0
 *
 * HTTP Controller pour le write-side (commands).
 * Mapping HTTP → Command → Handler.
 *
 * ❌ Aucune logique métier
 * ✅ Uniquement du routing et du mapping
 */
import { CreateAssetHandler } from '../../write/handlers/create-asset.handler.js';
import { UpdateRenewalHandler } from '../../write/handlers/update-renewal.handler.js';
import { AllocateAssetHandler } from '../../write/handlers/allocate-asset.handler.js';
import { RecordDepreciationHandler } from '../../write/handlers/record-depreciation.handler.js';
import { RecordMaintenanceHandler } from '../../write/handlers/record-maintenance.handler.js';
import { DisposeAssetHandler } from '../../write/handlers/dispose-asset.handler.js';
import { CreateAssetDTO, UpdateRenewalDTO, AllocateAssetDTO, RecordDepreciationDTO, RecordMaintenanceDTO, DisposeAssetDTO } from '../dto/write.dto.js';
export declare class ImmobilisationWriteController {
    private readonly createAssetHandler;
    private readonly updateRenewalHandler;
    private readonly allocateAssetHandler;
    private readonly recordDepreciationHandler;
    private readonly recordMaintenanceHandler;
    private readonly disposeAssetHandler;
    constructor(createAssetHandler: CreateAssetHandler, updateRenewalHandler: UpdateRenewalHandler, allocateAssetHandler: AllocateAssetHandler, recordDepreciationHandler: RecordDepreciationHandler, recordMaintenanceHandler: RecordMaintenanceHandler, disposeAssetHandler: DisposeAssetHandler);
    createAsset(tenantId: string, dto: CreateAssetDTO): Promise<{
        status: string;
        assetId: string;
    }>;
    updateRenewal(tenantId: string, assetId: string, dto: UpdateRenewalDTO): Promise<{
        status: string;
    }>;
    allocateAsset(tenantId: string, assetId: string, dto: AllocateAssetDTO): Promise<{
        status: string;
    }>;
    recordDepreciation(tenantId: string, assetId: string, dto: RecordDepreciationDTO): Promise<{
        status: string;
    }>;
    recordMaintenance(tenantId: string, assetId: string, dto: RecordMaintenanceDTO): Promise<{
        status: string;
    }>;
    disposeAsset(tenantId: string, assetId: string, dto: DisposeAssetDTO): Promise<{
        status: string;
        gainOrLoss: number;
    }>;
}
//# sourceMappingURL=immobilisation-write.controller.d.ts.map