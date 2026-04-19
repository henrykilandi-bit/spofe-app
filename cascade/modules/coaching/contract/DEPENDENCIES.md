# DEPENDENCIES — Module Coaching

## Dépendance READ-ONLY — Objectif–Indicateur–Événement (OIE)

### Type de dépendance
- Sens : READ-ONLY
- Nature : Contextuelle / stratégique
- Criticité : NON BLOQUANTE

---

### Données consommées depuis OIE

| Read-model OIE | Usage Coaching |
|---------------|----------------|
| ObjectivesRM | Compréhension de l'intention stratégique |
| IndicatorsRM | Identification des leviers observés |
| EventsTimelineRM | Analyse des écarts et décisions |
| ObjectiveHistoryRM | Narration stratégique |

---

### Règles strictes

- Coaching **n'écrit jamais** dans OIE
- Coaching **ne déclenche aucun événement OIE**
- Coaching **n'interprète pas les indicateurs dans OIE**
- Toute recommandation reste **hors OIE**

---

### Justification architecturale

OIE fournit la **mémoire stratégique factuelle**.  
Coaching fournit **l'interprétation humaine et l'accompagnement**.

La séparation est **fondamentale**.

---

### Interface technique contractuelle

```typescript
export interface OieReadApi {
  getObjectives(tenantId: string): Promise<ObjectiveRM[]>;
  getIndicators(tenantId: string): Promise<IndicatorRM[]>;
  getEvents(tenantId: string): Promise<StrategicEventRM[]>;
  getObjectiveHistory(tenantId: string, objectiveId: string): Promise<ObjectiveHistoryRM[]>;
}
```

### Exemple d'usage autorisé

```typescript
// coaching/application/OieContextService.ts
export class OieContextService {
  constructor(private readonly oieApi: OieReadApi) {}

  async buildStrategicContext(tenantId: string) {
    const objectives = await this.oieApi.getObjectives(tenantId);
    const events = await this.oieApi.getEvents(tenantId);

    return {
      strategicIntent: objectives,
      strategicHistory: events,
    };
  }
}
```