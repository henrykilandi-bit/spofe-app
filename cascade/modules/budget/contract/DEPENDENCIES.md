# DEPENDENCIES — Module Budget

## Dépendance READ-ONLY — Objectif–Indicateur–Événement (OIE)

### Type de dépendance
- Sens : READ-ONLY
- Nature : Explicative / contextuelle
- Criticité : FAIBLE

---

### Données consommées depuis OIE

| Read-model OIE | Usage Budget |
|---------------|-------------|
| ObjectivesRM | Alignement avec le Plan d'Affaires |
| EventsTimelineRM | Justification des révisions |
| ObjectiveHistoryRM | Traçabilité des hypothèses |

---

### Règles strictes

- Budget reste **souverain sur tous les calculs**
- OIE ne fournit **aucune valeur chiffrée**
- OIE ne pilote **aucune projection budgétaire**
- Les écarts sont **calculés par Budget, expliqués par OIE**

---

### Justification architecturale

Le Budget calcule.  
OIE explique.

Cette dissociation garantit :
- lisibilité
- auditabilité
- absence de circularité

---

### Interface technique contractuelle

```typescript
export interface OieReadApi {
  getObjectives(tenantId: string): Promise<ObjectiveRM[]>;
  getEvents(tenantId: string): Promise<StrategicEventRM[]>;
  getEventsByPeriod(tenantId: string, periodId: string): Promise<StrategicEventRM[]>;
  getObjectiveHistory(tenantId: string, objectiveId: string): Promise<ObjectiveHistoryRM[]>;
}
```

### Exemple d'usage autorisé

```typescript
// budget/application/BudgetNarrativeService.ts
export class BudgetNarrativeService {
  constructor(private readonly oieApi: OieReadApi) {}

  async explainRevision(tenantId: string, periodId: string) {
    const events = await this.oieApi.getEventsByPeriod(
      tenantId,
      periodId
    );

    return {
      budgetRevisionContext: events,
    };
  }
}
```

### Cas d'usage typiques

| Cas Budget | Lecture OIE |
|------------|-------------|
| Révision budgétaire | Événement stratégique |
| Écart important | Décision / incident |
| Projection modifiée | Objectif révisé |