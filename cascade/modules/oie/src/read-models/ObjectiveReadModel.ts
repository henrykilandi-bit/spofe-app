import { Objective } from '../guardian/types';

export interface ObjectiveRM {
  objectiveId: string;
  title: string;
  description?: string | undefined;
  parentId?: string | undefined;
  status: string;
  indicatorCount: number;
  createdAt: string;
  performance?: {
    overall: number;
    trend: 'UP' | 'DOWN' | 'STABLE';
  };
}

export class ObjectiveReadModel {
  static project(objective: Objective): ObjectiveRM {
    return {
      objectiveId: objective.objectiveId,
      title: objective.title,
      description: objective.description || undefined,
      parentId: objective.parentId || undefined,
      status: objective.status,
      indicatorCount: objective.indicators.length,
      createdAt: objective.createdAt.toISOString().split('T')[0] || ''
    };
  }
}
