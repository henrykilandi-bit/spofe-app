/**
 * DTO - ValidateProject
 * Conformité: COST-STRUCTURE_CONTRACT v1.0.0
 */

import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ValidateProjectDTO {
  @ApiProperty({ description: 'Project ID', example: 'proj-123' })
  @IsString()
  @IsNotEmpty()
  projectId: string;
}
