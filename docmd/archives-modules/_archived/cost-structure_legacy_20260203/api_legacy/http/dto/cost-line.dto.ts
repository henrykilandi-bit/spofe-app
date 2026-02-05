/**
 * DTO — Cost Line
 * Version: v1.0.0
 * 
 * Mapping 1:1 vers rm_cost_lines
 */

import { ApiProperty } from '@nestjs/swagger';

export class CostLineDTO {
  @ApiProperty({
    description: 'Line unique identifier',
    example: 'line-123',
  })
  lineId!: string;

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
    description: 'Cost category',
    enum: ['RAW_MATERIAL', 'LABOR', 'SUBCONTRACTING', 'OVERHEAD'],
    example: 'RAW_MATERIAL',
  })
  category!: string;

  @ApiProperty({
    description: 'Line description',
    example: 'Raw material A',
  })
  description!: string;

  @ApiProperty({
    description: 'Unit of measure',
    example: 'kg',
  })
  unit!: string;

  @ApiProperty({
    description: 'Quantity',
    example: 100,
  })
  quantity!: number;

  @ApiProperty({
    description: 'Unit price',
    example: 5.5,
  })
  unitPrice!: number;

  @ApiProperty({
    description: 'Total line amount',
    example: 550,
  })
  totalAmount!: number;

  @ApiProperty({
    description: 'Created at timestamp',
    example: '2026-01-15T10:30:00Z',
  })
  createdAt!: string;
}
