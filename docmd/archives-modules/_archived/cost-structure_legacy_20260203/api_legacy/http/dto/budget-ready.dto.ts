/**
 * DTO — Budget Ready Project (CONTRACTUAL)
 * Version: v1.0.0
 * 
 * ⚠️ CONTRACT COUTFLEX → Budget
 * Ce DTO est la vérité contractuelle entre COUTFLEX et Budget.
 * Aucun champ ne peut être ajouté/supprimé sans versionnement.
 */

import { ApiProperty } from '@nestjs/swagger';

/**
 * BudgetReadyProjectDTO
 * 
 * Shape strict exposé par la vue rm_cost_projects_budget_ready.
 * Budget consomme UNIQUEMENT ce DTO.
 */
export class BudgetReadyProjectDTO {
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
    description: 'Project display name',
    example: 'Produit Test',
  })
  projectName!: string;

  @ApiProperty({
    description: 'Cost structure version (>= 1)',
    example: 2,
    minimum: 1,
  })
  version!: number;

  @ApiProperty({
    description: 'Unit cost validated',
    example: 10,
    type: 'number',
  })
  unitCost!: number;

  @ApiProperty({
    description: 'Total cost validated',
    example: 10000,
    type: 'number',
  })
  totalCost!: number;

  @ApiProperty({
    description: 'Net margin rate (0-1)',
    example: 0.25,
    type: 'number',
  })
  netMargin!: number;

  @ApiProperty({
    description: 'Margin at 70% sales (must be > 0 per COUT-01)',
    example: 0.08,
    type: 'number',
    minimum: 0.01,
  })
  marginAt70!: number;
}
