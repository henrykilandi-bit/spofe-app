# DEPENDENCIES — Module Investisseurs

## Dépendance READ-ONLY — Objectif–Indicateur–Événement (OIE)

### Type de dépendance
- Sens : READ-ONLY
- Nature : Gouvernance & transparence
- Criticité : STRATÉGIQUE

---

### Données consommées depuis OIE

| Read-model OIE | Usage Investisseurs |
|---------------|-----------------|
| ObjectivesRM | Vision stratégique annoncée |
| ObjectiveHistoryRM | Évolution et discipline |
| EventsTimelineRM | Justification des écarts |
| IndicatorsRM | Références de pilotage |

---

### Règles strictes

- Le module Investisseurs **ne modifie jamais OIE**
- Aucun calcul financier n'est effectué à partir d'OIE
- OIE sert uniquement de **preuve de gouvernance**

---

### Justification architecturale

OIE permet de démontrer que :
- la stratégie est formalisée
- les décisions sont tracées
- les écarts sont expliqués

C'est un pilier de crédibilité long terme.

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
// investisseurs/application/StrategicDisclosureService.ts
export class StrategicDisclosureService {
  constructor(private readonly oieApi: OieReadApi) {}

  async buildStrategicNarrative(tenantId: string) {
    return {
      objectives: await this.oieApi.getObjectives(tenantId),
      events: await this.oieApi.getEvents(tenantId),
    };
  }
}
```

### Cas d'usage investisseurs

| Attente Investisseur | Lecture OIE |
|--------------------|-----------|
| Vision initiale | Objectifs |
| Changements | Historique |
| Justification | Événements |
| Gouvernance | Traçabilité |

---

### Garanties de transparence

- **📌 Aucune projection financière ici**
- **📌 Uniquement intention + faits + décisions**
- **📌 Preuve de discipline stratégique**