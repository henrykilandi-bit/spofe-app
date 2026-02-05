/**
 * DTO — Cost Project
 * Version: v1.0.0
 * 
 * Mapping 1:1 vers rm_economic_projects_summary
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CostProjectDTO {
  @ApiProperty({
    description: 'Tenant ID',
    example: 'tenant-1',
  })
  tenantId!: string;

  @ApiProperty({
    description: 'Project unique identifier',
    example: 'project-123',
  })
  projectId!: string;

  @ApiProperty({
    description: 'Project name',
    example: 'Produit A',
  })
  name!: string;

  @ApiProperty({
    description: 'Project type',
    enum: ['PRODUCT', 'SERVICE', 'PROJECT'],
    example: 'PRODUCT',
  })
  type!: string;

  @ApiProperty({
    description: 'Project status',
    enum: ['DRAFT', 'SIMULATED', 'VALIDATED', 'REJECTED'],
    example: 'VALIDATED',
  })
  status!: string;

  @ApiProperty({
    description: 'Current version number',
    example: 2,
  })
  currentVersion!: number;

  @ApiProperty({
    description: 'Project created at',
    example: '2026-01-15T10:30:00Z',
  })
  createdAt!: string;

  @ApiPropertyOptional({
    description: 'Project validated at (null if not validated)',
    example: '2026-01-20T14:00:00Z',
    nullable: true,
  })
  validatedAt!: string | null;

  @ApiProperty({
    description: 'Created by user',
    example: 'user-123',
  })
  createdBy!: string;

  @ApiPropertyOptional({
    description: 'Current unit cost (from latest version)',
    example: 10.5,
    nullable: true,
  })
  currentUnitCost!: number | null;

  @ApiPropertyOptional({
    description: 'Current total cost (from latest version)',
    example: 10500,
    nullable: true,
  })
  currentTotalCost!: number | null;
}
