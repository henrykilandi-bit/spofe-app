# 📜 CONTRAT D'ARCHITECTURE SILC
Structure et responsabilités du code — SPOFE

**Nom du document**

SILC_Architecture_Structure.contract.md

**Classement officiel**

architecture/contracts/SILC_Architecture_Structure.contract.md

**Statut : CANONIQUE**
**Portée : Backend (structure src/)**
**Version : 1.0**
**Projet : SPOFE**

---

## ⚠️ AVERTISSEMENT CONTRACTUEL

Le présent contrat :

- est canonique SILC
- est opposable à toute implémentation
- est supérieur à toute convention
- est exécutable via le SILC Guardian

**Toute implémentation qui viole ce contrat est considérée comme une non-conformité architecturale SILC bloquante.**

---

## 🧭 ARTICLE 0 — OBJET DU CONTRAT

Le présent contrat définit :

- les zones architecturales SILC
- leurs responsabilités
- leurs droits
- leurs interdictions absolues
- les frontières de dépendance autorisées

**Il ne décrit pas une arborescence technique, mais une répartition contractuelle des responsabilités du code.**

---

## 🧱 ARTICLE 1 — ZONE DOMAIN

### Nature contractuelle

La zone `domain/` représente le cœur contractuel SILC.

Elle est la seule zone autorisée à :

- définir des entités
- définir des relations
- définir des processus gouvernés
- porter des décisions contractuelles

### Droits

- Définir la vérité métier
- Refuser une action non conforme
- Lever des erreurs contractuelles

### Interdictions absolues

❌ Dépendre de l'infrastructure  
❌ Accéder à une base de données  
❌ Effectuer une I/O  
❌ Appeler un service technique  

**📌 Toute violation est bloquante SILC.**

---

## ⚙️ ARTICLE 2 — ZONE APPLICATION

### Nature contractuelle

La zone `application/` est une zone d'exécution et d'orchestration.

Elle :

- exécute des décisions prises ailleurs
- traduit des DTO
- orchestre des appels

### Droits

- Appeler des processus
- Appeler des ports applicatifs
- Transformer des données

### Interdictions

❌ Prendre une décision métier  
❌ Définir une règle contractuelle  
❌ Modifier un invariant  

---

## 🔌 ARTICLE 3 — ZONE INFRASTRUCTURE

### Nature contractuelle

Zone technique interchangeable.

### Droits

- Implémenter des repositories
- Persister des données
- Communiquer avec des systèmes externes

### Interdictions

❌ Connaître une entité métier  
❌ Appeler un processus  
❌ Décider quoi que ce soit  

---

## 🚪 ARTICLE 4 — ZONE INTERFACES

### Nature contractuelle

Point d'entrée du système (HTTP, CLI, Jobs).

### Règle critique

Une interface :

- peut appeler un processus
- ou un service applicatif autorisé
- **ne décide jamais**

---

## 🧓 ARTICLE 5 — ZONE LEGACY

### Nature contractuelle

Zone temporaire, tolérée uniquement dans le cadre de la migration SILC.

### Interdictions absolues

❌ Ajouter du nouveau code  
❌ Introduire un concept contractuel  
❌ Implémenter un processus  

**📌 Cette zone est soumise à un régime dérogatoire contrôlé.**

---

## 🧩 ARTICLE 6 — ZONE SHARED

### Nature contractuelle

Zone utilitaire neutre.

### Règle

Aucun élément de `shared/` ne peut :

- exprimer un pouvoir
- exprimer une règle métier
- dépendre d'un contexte

---

## 🔐 ARTICLE 7 — OPPOSABILITÉ

Le présent contrat est :

- exécutable par le SILC Guardian
- référencé dans la signature de conformité SILC
- obligatoire pour toute nouvelle implémentation

---

## 📂 ARTICLE 8 — ARBORESCENCE CIBLE COMPLÈTE

```
src/
├── domain/                         # Cœur contractuel SILC
│   ├── entities/                   # Réalités du domaine
│   │   ├── User.entity.ts
│   │   ├── Role.entity.ts
│   │   ├── Company.entity.ts
│   │   ├── Group.entity.ts
│   │   └── Context.entity.ts
│   │
│   ├── relations/                  # Liens contractuels explicites
│   │   ├── UserRole.relation.ts
│   │   ├── CompanyContext.relation.ts
│   │   └── GroupContext.relation.ts
│   │
│   ├── processes/                  # Actes gouvernés (CRITIQUE)
│   │   ├── CompanyOnboarding.process.ts
│   │   ├── UserRoleRevocation.process.ts
│   │   └── CompanySuspension.process.ts
│   │
│   ├── policies/                   # Règles invariantes (optionnel)
│   │   └── RoleAssignment.policy.ts
│   │
│   └── errors/                     # Erreurs contractuelles
│       ├── UnauthorizedAction.error.ts
│       └── ContractViolation.error.ts
│
├── application/                    # Cas d'usage techniques
│   ├── services/                   # Exécutants (jamais décisionnaires)
│   │   ├── UserService.ts
│   │   ├── CompanyService.ts
│   │   └── ContextService.ts
│   │
│   ├── dtos/                       # Projections contractuelles
│   │   ├── CompanyOnboardingRequestDto.ts
│   │   ├── CompanyValidationDecisionDto.ts
│   │   └── UserRoleAssignmentDto.ts
│   │
│   ├── mappers/                    # Mapping Domain ↔ DTO
│   │   └── CompanyMapper.ts
│   │
│   └── ports/                      # Interfaces vers l'infra
│       ├── repositories/
│       │   ├── CompanyRepository.port.ts
│       │   └── UserRepository.port.ts
│       └── messaging/
│           └── EventBus.port.ts
│
├── infrastructure/                 # Implémentations techniques
│   ├── repositories/               # Accès DB
│   │   ├── CompanyRepository.mysql.ts
│   │   └── UserRepository.mysql.ts
│   │
│   ├── persistence/                # ORM / SQL / migrations
│   │   ├── models/
│   │   └── migrations/
│   │
│   ├── messaging/                  # Bus / queues
│   │   └── RabbitMQEventBus.ts
│   │
│   └── adapters/                   # API externes
│       └── Mailer.adapter.ts
│
├── interfaces/                     # Entrées système
│   ├── http/
│   │   ├── controllers/
│   │   │   └── CompanyController.ts
│   │   └── routes.ts
│   │
│   ├── cli/
│   │   └── admin.cli.ts
│   │
│   └── jobs/
│       └── nightly.job.ts
│
├── bootstrap/                      # Composition root
│   ├── container.ts
│   └── app.ts
│
├── legacy/                         # Code non conforme (TEMPORAIRE)
│   ├── controllers/
│   ├── services/
│   ├── models/
│   └── README.md
│
└── shared/                         # Utilitaires neutres
    ├── logger/
    ├── config/
    └── types/
```

---

**FIN DU CONTRAT**
