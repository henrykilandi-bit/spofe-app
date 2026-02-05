/**
 * Response DTO - Lignes de coûts
 * Endpoint: GET /api/cost-structure/projects/{projectId}/structure/{version}/lines
 * Vue SQL: rm_cost_lines
 */

import { ApiProperty } from '@nestjs/swagger';

export class CostLineItemResponseDTO {
  @ApiProperty({ description: 'Cost category', enum: ['VARIABLE', 'FIXED', 'INDIRECT'], example: 'VARIABLE' })
  category: 'VARIABLE' | 'FIXED' | 'INDIRECT';

  @ApiProperty({ description: 'Cost label', example: 'Matière première' })
  label: string;

  @ApiProperty({ description: 'Amount', example: 5.2 })
  amount: number;

  @ApiProperty({ description: 'Currency', example: 'XAF' })
  currency: string;

  @ApiProperty({ description: 'Allocation rule', example: 'per_unit', required: false })
  allocationRule?: string;
}

export class CostLinesResponseDTO {
  @ApiProperty({ type: [CostLineItemResponseDTO] })
  lines: CostLineItemResponseDTO[];
}
