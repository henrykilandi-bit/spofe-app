# Module OIE (Objectif–Indicateur–Événement)

## Architecture SPOFE Conforme

Ce module implémente les contrôleurs API READ-ONLY pour le système OIE selon les principes stricts SPOFE :

### ✅ Garanties SPOFE

- **CQRS strict** : API GET uniquement
- **Multi-tenant obligatoire** : Filtrage par `X-Tenant-Id` 
- **Aucune logique métier** : Contrôleurs purement transactionnels
- **Framework-agnostic** : Transport HTTP interchangeable
- **Testable E2E** : Pas de mocks nécessaires

### 📁 Structure

```
src/modules/oie/
├── api/
│   ├── types.ts                     # Types API communs
│   ├── ObjectivesReadController.ts  # Contrôleur objectifs
│   ├── IndicatorsReadController.ts  # Contrôleur indicateurs
│   ├── EventsReadController.ts      # Contrôleur événements
│   └── index.ts                     # Exports publics
└── read-models/
    └── ports/
        └── index.ts                 # Interfaces repositories
```

### 🌐 API Endpoints (indicatif)

#### Objectifs
- `GET /objectives` - Liste tous les objectifs
- `GET /objectives/{objectiveId}` - Objectif par ID
- `GET /objectives?periodId=FY_2026` - Objectifs par période

#### Indicateurs  
- `GET /indicators` - Liste tous les indicateurs
- `GET /indicators/{indicatorId}` - Indicateur par ID
- `GET /indicators?objectiveId=OBJ_1` - Indicateurs par objectif

#### Événements
- `GET /events` - Liste tous les événements
- `GET /events?objectiveId=OBJ_1` - Événements par objectif
- `GET /events?periodId=FY_2026` - Événements par période

### 🔧 Usage

```typescript
import { 
  ObjectivesReadController, 
  IndicatorsReadController, 
  EventsReadController 
} from './src/modules/oie/api';

// Injection des repositories (implémentations spécifiques)
const objectivesController = new ObjectivesReadController(objectivesRepo);
const indicatorsController = new IndicatorsReadController(indicatorsRepo);
const eventsController = new EventsReadController(eventsRepo);
```

### ⚠️ Responsabilités

**Les contrôleurs :**
- ✅ Valident les entrées (paramètres requis)
- ✅ Extraient le tenant ID obligatoire
- ✅ Délèguent aux repositories read-only
- ✅ Retournent les réponses HTTP

**Les contrôleurs NE font PAS :**
- ❌ Calculs ou transformations
- ❌ Validation métier
- ❌ Effets de bord
- ❌ Gestion des états

### 🔒 Sécurité Multi-tenant

Tous les endpoints requirent l'en-tête `X-Tenant-Id`. Absence = erreur 400.

### 📊 Tests & BUILD_PROOF

Structure prête pour :
- Tests unitaires des contrôleurs
- Tests E2E sans mocks  
- BUILD_PROOF automatisé
- Certification SPOFE