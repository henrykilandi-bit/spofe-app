/**
 * DTO — Cost Structure
 * Version: v1.0.0
 * 
 * Mapping 1:1 vers rm_cost_structure_versions
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CostStructureDTO {
  @ApiProperty({
    description: 'Tenant ID',
    example: 'tenant-1',
  })
  tenantId!: string;

  @ApiProperty({
    description: 'Project ID',
    example: 'project-123',
  })
  projectId!: string;

  @ApiProperty({
    description: 'Version number',
    example: 2,
  })
  version!: number;

  @ApiProperty({
    description: 'Structure status',
    enum: ['DRAFT', 'SIMULATED', 'FROZEN'],
    example: 'FROZEN',
  })
  status!: string;

  @ApiProperty({
    description: 'Unit cost',
    example: 10.5,
  })
  unitCost!: number;

  @ApiProperty({
    description: 'Total cost',
    example: 10500,
  })
  totalCost!: number;

  @ApiProperty({
    description: 'Net margin rate',
    example: 0.25,
  })
  netMargin!: number;

  @ApiProperty({
    description: 'Margin at 70% sales',
    example: 0.08,
  })
  marginAt70!: number;

  @ApiProperty({
    description: 'Viability at 70% (true if marginAt70 > 0)',
    example: true,
  })
  viableAt70!: boolean;

  @ApiProperty({
    description: 'Created by user',
    example: 'user-123',
  })
  createdBy!: string;

  @ApiProperty({
    description: 'Created at timestamp',
    example: '2026-01-15T10:30:00Z',
  })
  createdAt!: string;

  @ApiPropertyOptional({
    description: 'Frozen at timestamp (null if not frozen)',
    example: '2026-01-20T14:00:00Z',
    nullable: true,
  })
  frozenAt!: string | null;
}
