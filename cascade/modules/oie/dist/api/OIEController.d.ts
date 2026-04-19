import { Objective, Indicator, Event } from '../guardian/types.js';
export declare class OIEController {
    getObjectives(tenantId: string): Promise<Objective[]>;
    getObjective(tenantId: string, objectiveId: string): Promise<Objective | null>;
    getIndicators(tenantId: string, objectiveId?: string): Promise<Indicator[]>;
    getIndicator(tenantId: string, indicatorId: string): Promise<Indicator | null>;
    getEvents(tenantId: string, filters?: {
        objectiveId?: string;
        indicatorId?: string;
        eventType?: string;
        startDate?: Date;
        endDate?: Date;
    }): Promise<Event[]>;
    getEvent(tenantId: string, eventId: string): Promise<Event | null>;
    calculateIndicatorPerformance(tenantId: string, indicatorId: string): Promise<{
        currentValue: number | null;
        targetValue: number | null;
        performance: number;
        trend: 'UP' | 'DOWN' | 'STABLE';
    }>;
}
//# sourceMappingURL=OIEController.d.ts.map