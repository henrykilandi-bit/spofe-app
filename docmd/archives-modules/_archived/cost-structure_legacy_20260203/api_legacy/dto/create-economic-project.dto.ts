/**
 * DTO - CreateEconomicProject
 * Conformité: COST-STRUCTURE_CONTRACT v1.0.0
 */

import { IsString, IsNotEmpty, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEconomicProjectDTO {
  @ApiProperty({ description: 'Tenant ID', example: 'tenant-123' })
  @IsString()
  @IsNotEmpty()
  tenantId: string;

  @ApiProperty({ description: 'Project name', example: 'Savon Premium' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Project type',
    enum: ['PRODUCT', 'SERVICE'],
    example: 'PRODUCT',
  })
  @IsIn(['PRODUCT', 'SERVICE'])
  type: 'PRODUCT' | 'SERVICE';
}
