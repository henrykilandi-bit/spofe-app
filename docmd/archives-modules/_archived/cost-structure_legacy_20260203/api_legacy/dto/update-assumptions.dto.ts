/**
 * DTO - UpdateAssumptions
 * Conformité: COST-STRUCTURE_CONTRACT v1.0.0
 */

import { IsString, IsNotEmpty, IsNumber, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class ScenariosDTO {
  @ApiProperty({ description: 'Pessimistic volume', example: 800 })
  @IsNumber()
  @Min(0)
  pessimistic: number;

  @ApiProperty({ description: 'Realistic volume', example: 1000 })
  @IsNumber()
  @Min(0)
  realistic: number;

  @ApiProperty({ description: 'Optimistic volume', example: 1200 })
  @IsNumber()
  @Min(0)
  optimistic: number;
}

export class UpdateAssumptionsDTO {
  @ApiProperty({ description: 'Project ID', example: 'proj-123' })
  @IsString()
  @IsNotEmpty()
  projectId: string;

  @ApiProperty({ description: 'Version number', example: 1 })
  @IsNumber()
  @Min(1)
  version: number;

  @ApiProperty({ description: 'Target price', example: 1500 })
  @IsNumber()
  @Min(0.01)
  priceTarget: number;

  @ApiProperty({ description: 'Expected volume', example: 1000 })
  @IsNumber()
  @Min(0)
  expectedVolume: number;

  @ApiProperty({ description: 'Maximum capacity', example: 1500 })
  @IsNumber()
  @Min(0)
  capacityMax: number;

  @ApiProperty({ description: 'Economic scenarios', type: ScenariosDTO })
  @ValidateNested()
  @Type(() => ScenariosDTO)
  scenarios: ScenariosDTO;
}
