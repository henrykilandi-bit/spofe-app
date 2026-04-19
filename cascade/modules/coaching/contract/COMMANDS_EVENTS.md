# COMMANDS & EVENTS — MODULE COACHING v1.0.0

## PRINCIPES

- Les commandes ne concernent que les objets internes au coaching
- Aucun événement ne modifie un autre module
- Aucun événement ne déclenche d'action automatique

---

## COMMANDS

### CreateCoachingAction

- tenantId
- actionId
- description
- responsibleActorId
- dueDate

### PlanCoachingSession

- tenantId
- sessionId
- plannedDate
- relatedActionIds

### AddCoachingJournalEntry

- tenantId
- entryId
- moduleSource
- subject
- comment

### AddCoachingExchange

- tenantId
- sessionId
- exchangeId
- type (TEXT | AUDIO)
- contentReference

---

## EVENTS

### CoachingActionCreated
### CoachingSessionPlanned
### CoachingJournalEntryAdded
### CoachingExchangeAdded

---

## CONTRAINTE FONDAMENTALE

Aucun événement Coaching ne peut :
- modifier un calcul
- déclencher une décision
- écrire dans un autre module
