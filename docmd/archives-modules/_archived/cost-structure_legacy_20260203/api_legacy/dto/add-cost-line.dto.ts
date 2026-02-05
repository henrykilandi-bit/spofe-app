/**
 * DTO - AddCostLine
 * Conformité: COST-STRUCTURE_CONTRACT v1.0.0
 */

import { IsString, IsNotEmpty, IsNumber, IsIn, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddCostLineDTO {
  @ApiProperty({ description: 'Project ID', example: 'proj-123' })
  @IsString()
  @IsNotEmpty()
  projectId: string;

  @ApiProperty({ description: 'Version number', example: 1 })
  @IsNumber()
  @Min(1)
  version: number;

  @ApiProperty({
    description: 'Cost category',
    enum: ['VARIABLE', 'FIXED', 'INDIRECT'],
    example: 'VARIABLE',
  })
  @IsIn(['VARIABLE', 'FIXED', 'INDIRECT'])
  category: 'VARIABLE' | 'FIXED' | 'INDIRECT';

  @ApiProperty({ description: 'Cost label', example: 'Matière première' })
  @IsString()
  @IsNotEmpty()
  label: string;

  @ApiProperty({ description: 'Cost amount', example: 5000 })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiPropertyOptional({ description: 'Allocation rule', example: 'Per unit' })
  @IsString()
  @IsOptional()
  allocationRule?: string;
}
