/**
 * Response DTO - Résultats de simulation
 * Endpoint: GET /api/cost-structure/projects/{projectId}/structure/{version}/simulation
 * Vue SQL: rm_cost_simulation_results
 */

import { ApiProperty } from '@nestjs/swagger';

export class SimulationResponseDTO {
  @ApiProperty({ description: 'Unit cost', example: 7.8 })
  unitCost: number;

  @ApiProperty({ description: 'Total cost', example: 7800 })
  totalCost: number;

  @ApiProperty({ description: 'Gross margin (ratio)', example: 0.35 })
  grossMargin: number;

  @ApiProperty({ description: 'Net margin (ratio)', example: 0.18 })
  netMargin: number;

  @ApiProperty({ description: 'Margin at 70% capacity (ratio)', example: 0.06 })
  marginAt70: number;

  @ApiProperty({ description: 'Viable at 70%', example: true })
  viableAt70: boolean;

  @ApiProperty({ description: 'Simulation date', example: '2026-01-08T14:00:00Z' })
  simulatedAt: string;
}
