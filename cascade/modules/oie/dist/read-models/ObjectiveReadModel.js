export class ObjectiveReadModel {
    static project(objective) {
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
//# sourceMappingURL=ObjectiveReadModel.js.map