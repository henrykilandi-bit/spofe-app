/**
 * DTO — Cost Structure Summary (for Budget Integration)
 * Version: v1.0.0
 * 
 * ⚠️ CONTRACT COUTFLEX → Budget
 * Résumé des coûts pour intégration Budget.
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Cost Breakdown DTO
 */
export class CostBreakdownDTO {
  @ApiProperty({
    description: 'Total variable costs',
    example: 6000,
    type: 'number',
  })
  variable!: number;

  @ApiProperty({
    description: 'Total fixed costs',
    example: 3000,
    type: 'number',
  })
  fixed!: number;

  @ApiProperty({
    description: 'Total indirect costs',
    example: 1000,
    type: 'number',
  })
  indirect!: number;

  @ApiProperty({
    description: 'Total sum of all costs',
    example: 10000,
    type: 'number',
  })
  total!: number;
}

/**
 * Cost Structure Summary DTO
 */
export class CostStructureSummaryDTO {
  @ApiProperty({
    description: 'Tenant ID (isolation multi-tenant)',
    example: 'tenant-1',
  })
  tenantId!: string;

  @ApiProperty({
    description: 'Project unique identifier',
    example: 'project-123',
  })
  projectId!: string;

  @ApiProperty({
    description: 'Cost structure version',
    example: 2,
    minimum: 1,
  })
  version!: number;

  @ApiProperty({
    description: 'Cost breakdown by category',
    type: CostBreakdownDTO,
  })
  costBreakdown!: CostBreakdownDTO;

  @ApiProperty({
    description: 'Number of cost lines',
    example: 15,
    minimum: 0,
  })
  costLinesCount!: number;

  @ApiProperty({
    description: 'Structure status',
    enum: ['DRAFT', 'FROZEN'],
    example: 'FROZEN',
  })
  status!: string;

  @ApiPropertyOptional({
    description: 'Frozen at timestamp (null if not frozen)',
    example: '2026-01-20T14:00:00Z',
    nullable: true,
  })
  frozenAt!: string | null;
}
