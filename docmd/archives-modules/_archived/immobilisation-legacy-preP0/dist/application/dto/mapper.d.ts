/**
 * Immobilisation Module - DTO Mappers
 * Conformité: COMMANDS_EVENTS.md v1.0.0
 *
 * Convertit entre les DTOs (API layer) et les domain objects (Guardian layer).
 */
import { CreateAssetCommandDTO, UpdateRenewalInfoCommandDTO, AllocateAssetCommandDTO, RecordDepreciationCommandDTO, CalculateDepreciationsCommandDTO, RecordMaintenanceCommandDTO, DisposeAssetCommandDTO, DecommissionAssetCommandDTO } from './command.dto';
import { AssetCreatedEventDTO, RenewalInfoUpdatedEventDTO, AssetDisposedEventDTO, AssetDecommissionedEventDTO, DepreciationRecordedEventDTO, MaintenanceRecordedEventDTO } from './event.dto';
import { CreateAssetCommand, UpdateRenewalInfoCommand, ReallocateAssetCommand, RecordDepreciationCommand, CalculateDepreciationsCommand, RecordMaintenanceCommand, DisposeAssetCommand, DecommissionAssetCommand } from '../../domain/commands';
import { AssetCreatedEvent, AssetRenewalUpdatedEvent, AssetDisposedEvent, AssetDecommissionedEvent, DepreciationRecordedEvent, MaintenanceRecordedEvent } from '../../domain/events';
export declare function generateAssetId(): string;
export declare function generateAllocationId(): string;
export declare function generateScheduleId(): string;
export declare function generateMaintenanceId(): string;
export declare function generateDisposalId(): string;
export declare function toCreateAssetCommand(dto: CreateAssetCommandDTO): CreateAssetCommand;
export declare function toUpdateRenewalInfoCommand(dto: UpdateRenewalInfoCommandDTO): UpdateRenewalInfoCommand;
export declare function toAllocateAssetCommand(dto: AllocateAssetCommandDTO): ReallocateAssetCommand;
export declare function toRecordDepreciationCommand(dto: RecordDepreciationCommandDTO): RecordDepreciationCommand;
export declare function toCalculateDepreciationsCommand(dto: CalculateDepreciationsCommandDTO): CalculateDepreciationsCommand;
export declare function toRecordMaintenanceCommand(dto: RecordMaintenanceCommandDTO): RecordMaintenanceCommand;
export declare function toDisposeAssetCommand(dto: DisposeAssetCommandDTO): DisposeAssetCommand;
export declare function toDecommissionAssetCommand(dto: DecommissionAssetCommandDTO): DecommissionAssetCommand;
export declare function toAssetCreatedEventDTO(event: AssetCreatedEvent): AssetCreatedEventDTO;
export declare function toRenewalInfoUpdatedEventDTO(event: AssetRenewalUpdatedEvent): RenewalInfoUpdatedEventDTO;
export declare function toAssetDisposedEventDTO(event: AssetDisposedEvent): AssetDisposedEventDTO;
export declare function toAssetDecommissionedEventDTO(event: AssetDecommissionedEvent): AssetDecommissionedEventDTO;
export declare function toDepreciationRecordedEventDTO(event: DepreciationRecordedEvent): DepreciationRecordedEventDTO;
export declare function toMaintenanceRecordedEventDTO(event: MaintenanceRecordedEvent): MaintenanceRecordedEventDTO;
//# sourceMappingURL=mapper.d.ts.map