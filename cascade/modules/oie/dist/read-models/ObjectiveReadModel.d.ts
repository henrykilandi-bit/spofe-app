import { Objective } from '../guardian/types.js';
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
export declare class ObjectiveReadModel {
    static project(objective: Objective): ObjectiveRM;
}
//# sourceMappingURL=ObjectiveReadModel.d.ts.map