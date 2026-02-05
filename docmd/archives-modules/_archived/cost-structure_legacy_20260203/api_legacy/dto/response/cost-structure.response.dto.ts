/**
 * Response DTO - Structure de coûts active
 * Endpoint: GET /api/cost-structure/projects/{projectId}/structure
 * Vue SQL: rm_cost_structure_current
 */

import { ApiProperty } from '@nestjs/swagger';

export class CostStructureResponseDTO {
  @ApiProperty({ description: 'Project ID', example: 'uuid-123' })
  projectId: string;

  @ApiProperty({ description: 'Version number', example: 3 })
  version: number;

  @ApiProperty({ description: 'Structure status', enum: ['FROZEN'], example: 'FROZEN' })
  status: 'FROZEN';

  @ApiProperty({ description: 'Creation date', example: '2026-01-08T09:00:00Z' })
  createdAt: string;

  @ApiProperty({ description: 'Frozen date', example: '2026-01-09T15:30:00Z' })
  frozenAt: string;

  @ApiProperty({ description: 'Frozen by user', example: 'user-123' })
  frozenBy: string;
}
