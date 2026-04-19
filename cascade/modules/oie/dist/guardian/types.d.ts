export interface GuardianContext {
    tenantId: string;
    actorId: string;
    timestamp: Date;
}
export interface OIECommand {
    type: 'CREATE_OBJECTIVE' | 'CREATE_INDICATOR' | 'CREATE_EVENT' | 'UPDATE_INDICATOR' | 'UPDATE_EVENT';
    tenantId: string;
    data: any;
    timestamp: Date;
}
export interface Objective {
    objectiveId: string;
    tenantId: string;
    title: string;
    description?: string;
    parentId?: string;
    indicators: string[];
    status: 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED';
    createdAt: Date;
    createdBy: string;
}
export interface Indicator {
    indicatorId: string;
    tenantId: string;
    objectiveId: string;
    name: string;
    description?: string;
    unit: string;
    targetType: 'NUMBER' | 'PERCENTAGE' | 'CURRENCY';
    currentValue?: number | null;
    targetValue?: number;
    status: 'ACTIVE' | 'INACTIVE';
    createdAt: Date;
    createdBy: string;
}
export interface Event {
    eventId: string;
    tenantId: string;
    objectiveId?: string;
    indicatorId?: string;
    eventType: 'CREATED' | 'UPDATED' | 'MILESTONE' | 'ALERT';
    title: string;
    description?: string;
    metadata?: Record<string, any>;
    timestamp: Date;
    createdBy: string;
}
export declare class GuardianError extends Error {
    constructor(message: string);
}
//# sourceMappingURL=types.d.ts.map