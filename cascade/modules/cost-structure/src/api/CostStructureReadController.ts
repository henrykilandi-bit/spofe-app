/**
 * API Read Controller pour Cost-Structure
 * Interface de lecture des structures de coûts
 */

import { CostStructureData } from '../guardian/types';

export interface CostStructureReadModel {
  tenantId: string;
  projectId: string;
  level: string;
  period: string;
  totalAmount: number;
  allocationBreakdown: Array<{
    targetType: string;
    targetId: string;
    allocatedAmount: number;
    ratio: number;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export class CostStructureReadController {
  
  /**
   * GET /cost-structure/{projectId}/summary
   */
  async getCostStructureSummary(tenantId: string, projectId: string): Promise<CostStructureReadModel | null> {
    // Simulation d'une lecture de modèle de coûts
    const mockData: CostStructureReadModel = {
      tenantId,
      projectId,
      level: 'N2',
      period: '2026-02',
      totalAmount: 125000,
      allocationBreakdown: [
        {
          targetType: 'PRODUCT',
          targetId: 'P001',
          allocatedAmount: 75000,
          ratio: 0.6
        },
        {
          targetType: 'ACTIVITY',
          targetId: 'A001',
          allocatedAmount: 50000,
          ratio: 0.4
        }
      ],
      createdAt: new Date('2026-02-04T10:00:00Z'),
      updatedAt: new Date('2026-02-04T14:30:00Z')
    };

    return mockData;
  }

  /**
   * GET /cost-structure/{projectId}/breakdown
   */
  async getCostBreakdown(tenantId: string, projectId: string, level: string): Promise<CostStructureReadModel[]> {
    // Simulation d'un breakdown détaillé
    const mockBreakdown: CostStructureReadModel[] = [
      {
        tenantId,
        projectId,
        level,
        period: '2026-01',
        totalAmount: 110000,
        allocationBreakdown: [
          { targetType: 'PRODUCT', targetId: 'P001', allocatedAmount: 66000, ratio: 0.6 }
        ],
        createdAt: new Date('2026-01-01T00:00:00Z'),
        updatedAt: new Date('2026-01-31T23:59:59Z')
      },
      {
        tenantId,
        projectId,
        level,
        period: '2026-02',
        totalAmount: 125000,
        allocationBreakdown: [
          { targetType: 'PRODUCT', targetId: 'P001', allocatedAmount: 75000, ratio: 0.6 }
        ],
        createdAt: new Date('2026-02-01T00:00:00Z'),
        updatedAt: new Date('2026-02-04T14:30:00Z')
      }
    ];

    return mockBreakdown;
  }

  /**
   * GET /cost-structure/{projectId}/allocations
   */
  async getCostAllocations(tenantId: string, projectId: string, period: string): Promise<any[]> {
    // Simulation d'allocations détaillées
    return [
      {
        allocationId: 'ALLOC_001',
        sourceType: 'STOCK',
        sourceId: 'STK_001',
        targetType: 'PRODUCT',
        targetId: 'P001',
        amount: 75000,
        ratio: 0.6,
        method: 'DIRECT',
        period
      },
      {
        allocationId: 'ALLOC_002',
        sourceType: 'OVERHEAD',
        sourceId: 'OVH_001',
        targetType: 'ACTIVITY',
        targetId: 'A001',
        amount: 50000,
        ratio: 0.4,
        method: 'ABC',
        period
      }
    ];
  }

  /**
   * GET /cost-structure/health
   */
  async getHealthCheck(): Promise<{ status: string; timestamp: string }> {
    return {
      status: 'OK',
      timestamp: new Date().toISOString()
    };
  }
}