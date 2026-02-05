/**
 * Response DTO - Historique des versions
 * Endpoint: GET /api/cost-structure/projects/{projectId}/history
 * Vue SQL: jointure rm_cost_structure_current + rm_cost_decisions
 */

import { ApiProperty } from '@nestjs/swagger';

export class ProjectHistoryItemResponseDTO {
  @ApiProperty({ description: 'Version number', example: 1 })
  version: number;

  @ApiProperty({ description: 'Version status', enum: ['DRAFT', 'FROZEN'], example: 'FROZEN' })
  status: 'DRAFT' | 'FROZEN';

  @ApiProperty({ description: 'Decision', enum: ['VALIDATED', 'REJECTED'], example: 'REJECTED', required: false })
  decision?: 'VALIDATED' | 'REJECTED';

  @ApiProperty({ description: 'Decision date', example: '2025-11-01T10:00:00Z', required: false })
  decidedAt?: string;

  @ApiProperty({ description: 'Decided by user', example: 'user-123', required: false })
  decidedBy?: string;

  @ApiProperty({ description: 'Frozen date', example: '2025-11-01T09:00:00Z', required: false })
  frozenAt?: string;
}

export class ProjectHistoryResponseDTO {
  @ApiProperty({ type: [ProjectHistoryItemResponseDTO] })
  history: ProjectHistoryItemResponseDTO[];
}
