# MODULE STOCK — ARCHITECTURE

**Module:** gestion-stocks  
**Version:** v1.0.0  
**Statut:** OFFICIEL — Normatif  
**Référence:** Golden Module SPOFE (Immobilisation)  

---

## 🎯 Objectif du document

Ce document décrit **l'architecture technique normative** du module Stock, conformément aux règles SPOFE.

Il définit :
- les couches autorisées
- leurs responsabilités strictes
- les flux d'exécution
- les interdictions structurelles

Ce document est **opposable** lors de la validation BUILD_PROOF.

---

## 🧱 PRINCIPES ARCHITECTURAUX FONDAMENTAUX

Le module Stock respecte strictement les principes suivants :

- **DDD (Domain-Driven Design)**
- **CQRS strict**
- **Guardian-centric**
- **Read-only API**
- **Append-only events**
- **Isolation par tenant**

Aucune dérogation n'est autorisée.

---

## 🏗️ STRUCTURE CANONIQUE DU MODULE

```txt
cascade/modules/gestion-stocks/
├── contract/                     # Documents normatifs
├── src/
│   ├── api/                      # Couche exposition (GET uniquement)
│   ├── application/              # Commands, Handlers, Events
│   ├── domain/                   # Agrégats, Guardian, Invariants
│   ├── infrastructure/           # Repositories, persistance
│   └── sql/                      # Migrations, vues SQL (read-models)
├── tests/                        # Tests unitaires, intégration, e2e
├── experimental/                 # Hors périmètre contractuel
└── BUILD_PROOF.md
```

Toute autre structure rend le module **NON CONFORME**.

---

## 🧩 RESPONSABILITÉS PAR COUCHE

### 🌐 API Layer (src/api)

**Responsabilités**
- Exposition REST GET uniquement
- Mapping DTO → Read Models
- Sécurité (auth, tenant scoping)

**Interdictions**
- Logique métier
- Validation métier
- Écriture en base
- Accès direct au domaine

---

### 🔁 Application Layer (src/application)

**Responsabilités**
- Orchestration des Commands
- Publication des Events
- Coordination transactionnelle
- Appel du Guardian

**Interdictions**
- Implémentation de règles métier
- Accès direct à la base read
- Calculs métier

---

### 🧠 Domain Layer (src/domain)

**Responsabilités**
- Agrégats DDD
- Guardian Stock
- Invariants métier
- Génération des Domain Events

**Règle absolue**
100 % de la logique métier réside ici, via le Guardian.

---

### 🗄️ Infrastructure Layer (src/infrastructure)

**Responsabilités**
- Persistance des événements
- Repositories write/read
- Accès base de données
- Configuration technique

**Interdictions**
- Règles métier
- Décisions fonctionnelles

---

### 🧮 SQL Layer (src/sql)

**Responsabilités**
- Migrations DDL
- Vues SQL Read Models
- Indexation

**Interdictions**
- Triggers métier
- Logique conditionnelle
- Calculs complexes

---

## 🔐 GUARDIAN PATTERN — CENTRALITÉ

Le Guardian Stock :

- est le point d'entrée **unique** de validation métier
- est appelé **avant toute mutation**
- bloque toute violation contractuelle
- est testé à **100 %**

Aucune règle métier hors Guardian n'est tolérée.

---

## 🔄 FLUX D'EXÉCUTION STANDARD

### Validation documentaire
```
Command
  → Application Handler
      → Guardian Validation
          → Event(s)
              → Projection Read Models
```

### Lecture API
```
API GET
  → Read Model
      → Réponse
```

Aucun flux alternatif n'est autorisé.

---

## 🔗 COMMUNICATION INTER-MODULES

**Lecture uniquement**
- Via API GET ou accès Read Models exposés

**Aucun write cross-module**
- Aucun événement consommé pour mutation

---

## 🚫 INTERDICTIONS ARCHITECTURALES ABSOLUES

- Accès direct DB depuis API
- Logique métier dans SQL
- Mutation via API
- Événement sans Command
- Command sans Guardian
- Cross-tenant access
- Suppression d'événements

Toute violation invalide le BUILD_PROOF.

---

## 📊 EXIGENCES DE QUALITÉ

- Couverture tests globale **≥ 80 %**
- Guardian : **100 %**
- Temps Guardian p95 **< 10 ms**
- Read queries p95 **< 100 ms**

---

## 🧨 SANCTION

Tout écart :

- bloque la validation SPOFE
- invalide le BUILD_PROOF
- empêche toute release

---

**Fin du document — ARCHITECTURE Stock v1.0.0**
