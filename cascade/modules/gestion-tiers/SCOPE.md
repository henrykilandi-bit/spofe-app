# SCOPE MODULE GESTION-TIERS

## Définition du périmètre

Le module **Gestion-Tiers** couvre la gestion des tiers dans le système SPOFE, incluant :

- Création et modification des informations tiers
- Gestion des statuts et classifications
- Historisation des modifications
- Validation des données selon les invariants métier

## Périmètre fonctionnel

### Inclus dans ce module :
- Entités : `Tier` et ses propriétés
- Événements : `TierCreated`, `TierUpdated`, `TierStatusChanged`  
- Invariants : Validation des données tiers (G01-G10)
- Commands : `CreateTier`, `UpdateTier`, `ChangeTierStatus`
- Projections : Vues read-model pour consultation

### Exclus de ce module :
- Logique comptable spécifique à un référentiel
- Génération d'écritures comptables automatiques
- Workflows d'approbation complexes

## Référentiel comptable & gouvernance

Ce module est conçu conformément à la gouvernance SPOFE P0.

- Référentiel comptable par défaut : **OHADA**
- Référentiels alternatifs : via adapters (PCG, IFRS, etc.)
- Aucune logique comptable dépendante d'un référentiel n'est autorisée dans ce module.

Ce module est conforme à la charte :
`cascade/governance/accounting/CHARTE_SPOFE_REFERENTIEL_COMPTABLE_P0.md`

## Interfaces

### Entrées :
- Commandes applicatives via Application Layer
- Événements externes via Event Bus

### Sorties :
- Événements métier (Event Store)
- Projections read-model (Query Layer)

## Dépendances

- **Domain Layer** : Invariants Guardian (FROZEN)
- **Infrastructure Layer** : Repositories abstraits
- **Aucune dépendance** : vers des frameworks comptables spécifiques

---

**Version :** 1.0  
**Statut :** ACTIF  
**Gouvernance :** P0 - Conforme OHADA-first