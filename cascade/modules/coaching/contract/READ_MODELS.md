# READ MODELS — MODULE COACHING v1.0.0

## PRINCIPE GÉNÉRAL

Les read-models du module Coaching sont des projections en lecture seule,
destinées à exposer l'état de l'accompagnement humain.

Ils ne contiennent aucun calcul économique, aucune décision, aucune logique métier.

---

## READ MODELS EXPOSÉS

### CoachingDashboardRM

- tenantId
- indicators (références vers indicateurs exposés par d'autres modules)
- statusFlags (informationnels uniquement)
- lastUpdatedAt

### CoachingJournalRM

- tenantId
- entryId
- moduleSource
- subject
- coachComment
- createdAt
- actorId

### CoachingActionPlanRM

- tenantId
- actionId
- description
- responsibleActorId
- dueDate
- status

### CoachingSessionRM

- tenantId
- sessionId
- plannedDate
- relatedActions
- active (boolean)

### CoachingExchangeRM

- tenantId
- sessionId
- exchangeId
- type (TEXT | AUDIO)
- contentReference
- actorId
- createdAt

---

## RÈGLES D'EXPOSITION

- Lecture seule
- Append-only
- Isolation stricte par tenant
- Aucun read-model n'est une vérité métier
