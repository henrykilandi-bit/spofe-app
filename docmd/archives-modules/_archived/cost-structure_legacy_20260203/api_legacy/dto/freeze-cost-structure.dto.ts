/**
 * DTO - FreezeCostStructure
 * Conformité: COST-STRUCTURE_CONTRACT v1.0.0
 */

import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FreezeCostStructureDTO {
  @ApiProperty({ description: 'Project ID', example: 'proj-123' })
  @IsString()
  @IsNotEmpty()
  projectId: string;

  @ApiProperty({ description: 'Version number', example: 1 })
  @IsNumber()
  @Min(1)
  version: number;
}
