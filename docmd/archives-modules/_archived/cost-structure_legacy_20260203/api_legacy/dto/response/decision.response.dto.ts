/**
 * Response DTO - Décision finale
 * Endpoint: GET /api/cost-structure/projects/{projectId}/decision
 * Vue SQL: rm_cost_decisions
 */

import { ApiProperty } from '@nestjs/swagger';

export class DecisionResponseDTO {
  @ApiProperty({ description: 'Decision type', enum: ['VALIDATED', 'REJECTED'], example: 'VALIDATED' })
  decision: 'VALIDATED' | 'REJECTED';

  @ApiProperty({ description: 'Version number', example: 3 })
  version: number;

  @ApiProperty({ description: 'Decided by user', example: 'user-123' })
  decidedBy: string;

  @ApiProperty({ description: 'Decision date', example: '2026-01-10T12:00:00Z' })
  decidedAt: string;

  @ApiProperty({ description: 'Justification', example: 'Rentabilité validée à 70 %' })
  justification: string;
}
