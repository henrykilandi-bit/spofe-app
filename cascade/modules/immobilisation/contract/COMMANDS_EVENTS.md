# IMMOBILISATION — COMMANDS & EVENTS

## Commands (Write)

| Command | Description |
|---------|-------------|
| `RegisterImmobilisation` | Enregistre une nouvelle immobilisation sur document validé |
| `PutImmobilisationInService` | Constate la mise en service d'une immobilisation |
| `DisposeImmobilisation` | Constate la sortie (cession, réforme, destruction) |

---

## Events (Factuels)

| Event | Description |
|-------|-------------|
| `ImmobilisationRegistered` | Immobilisation enregistrée |
| `ImmobilisationPutInService` | Immobilisation mise en service |
| `ImmobilisationDisposed` | Immobilisation sortie du patrimoine |

---

## Règles

- Un événement = un fait
- Aucun événement de calcul
- Aucun événement comptable
- Tout événement est porté par un document validé

---

## Flux Guardian

```
Command → Guardian.validate() → EventStore.append() → Event
              ↓
         Si violation → REJET (pas d'event)
```
