/**
 * Response DTO - Liste des projets économiques
 * Endpoint: GET /api/cost-structure/projects
 * Vue SQL: rm_cost_projects
 */

import { ApiProperty } from '@nestjs/swagger';

export class ProjectListItemResponseDTO {
  @ApiProperty({ description: 'Project ID', example: 'uuid-123' })
  projectId: string;

  @ApiProperty({ description: 'Project name', example: 'Produit A' })
  name: string;

  @ApiProperty({ description: 'Project type', enum: ['PRODUCT', 'SERVICE'], example: 'PRODUCT' })
  type: 'PRODUCT' | 'SERVICE';

  @ApiProperty({ description: 'Project status', enum: ['DRAFT', 'SIMULATED', 'VALIDATED', 'REJECTED'], example: 'VALIDATED' })
  status: 'DRAFT' | 'SIMULATED' | 'VALIDATED' | 'REJECTED';

  @ApiProperty({ description: 'Current version number', example: 3 })
  currentVersion: number;

  @ApiProperty({ description: 'Creation date', example: '2026-01-01T10:00:00Z' })
  createdAt: string;

  @ApiProperty({ description: 'Validation date', example: '2026-01-10T12:00:00Z', required: false })
  validatedAt?: string;

  @ApiProperty({ description: 'Rejection date', example: '2026-01-10T12:00:00Z', required: false })
  rejectedAt?: string;

  @ApiProperty({ description: 'Rejection reason', example: 'Marge insuffisante', required: false })
  rejectionReason?: string;
}

export class ProjectListResponseDTO {
  @ApiProperty({ type: [ProjectListItemResponseDTO] })
  projects: ProjectListItemResponseDTO[];
}
