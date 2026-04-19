# SCOPE.md
## Module Trésorerie Caisse — SPOFE v1.0.0

### 1. Objectif du module

Le module **Trésorerie Caisse** est responsable de la gestion factuelle, traçable et sécurisée des flux de trésorerie en espèces au sein d'une entreprise.

Il capture les **faits physiques de liquidité immédiate**, sans interprétation comptable, afin de constituer une source de vérité fiable pour les modules consommateurs (banque, précomptabilité, comptabilité, reporting).

### 2. Référentiel & gouvernance

Ce module est conçu conformément à la **gouvernance SPOFE P0**.

- **Référentiel comptable par défaut :** OHADA
- **Référentiels alternatifs :** via adapters (PCG, IFRS, etc.)
- Le module est **référentiel-agnostique** dans son core
- Aucune logique comptable dépendante d'un référentiel n'est autorisée

**Référence obligatoire :**  
`cascade/governance/accounting/CHARTE_SPOFE_REFERENTIEL_COMPTABLE_P0.md`

## IN SCOPE

#### 3.1 Faits de trésorerie caisse

Le module gère exclusivement les **mouvements en espèces** :

- Encaissements en espèces
- Décaissements en espèces  
- Apports de fonds
- Sorties de caisse (dépenses, dépôts bancaires)
- Avances et remboursements en espèces

👉 Tous les faits sont **physiques, observables et traçables**.

#### 3.2 Documents de caisse (règle centrale)

Tous les faits de trésorerie caisse sont portés par des **documents numériques** au sein de la plateforme SPOFE.

**Règle fondamentale**  
Aucun mouvement de caisse n'existe sans **document électronique validé et signé**.

**Caractéristiques des documents**

- Créés et remplis **exclusivement de manière électronique**
- Validés par un **acteur SPOFE identifié**
- **Signés électroniquement** dans la plateforme
- **Immuables après signature** (append-only)
- Conservés à des fins d'audit et de traçabilité

**Types de documents obligatoires**

- Document d'ouverture de caisse
- Document de mouvement de caisse (entrée / sortie espèces)
- Document de clôture de caisse
- Document de constat d'écart de caisse

**Cycle de vie documentaire**  
`DRAFT` → `VALIDATED` (acteur identifié) → `SIGNED` (signature électronique SPOFE) → `LOCKED` (immutable / append-only)

#### 3.3 Gestion opérationnelle de la caisse

- Gestion d'une ou plusieurs **caisses physiques**
- Déclaration du **fonds de caisse**
- Calcul du **solde théorique** par agrégation des faits
- Saisie du **solde réel** en clôture
- Constat des **écarts de caisse** (trop-perçu / moins-perçu)

👉 L'écart de caisse est un **fait constaté**, jamais une interprétation.

#### 3.4 Gouvernance, contrôle et traçabilité

- **Identification obligatoire** de l'acteur (actorId)
- **Isolation stricte** par entreprise (tenant)
- **Historique complet** des opérations
- **Interdiction** de modification ou suppression des faits validés
- **Verrouillage** des périodes clôturées

#### 3.5 Read-models & exposition

Le module expose **en lecture seule** :

- Journal de caisse
- État de caisse à date
- Historique des mouvements
- Historique des clôtures
- Liste des écarts constatés

👉 Exposition **GET uniquement**, sans mutation.

## OUT OF SCOPE

Sont **explicitement exclus** du module :

- Moyens de paiement non espèces (chèques, cartes, virements, wallets)
- Rapprochements bancaires
- Génération d'écritures comptables
- Lettrage et contreparties comptables
- Prévision de trésorerie
- Statistiques et KPI avancés
- Multi-devises et gestion de taux
- Matériel et périphériques (TPE, imprimantes, lecteurs)
- Conformité fiscale spécifique (caisse certifiée, archivage légal qualifié)

👉 Ces fonctionnalités relèvent :
- d'**autres modules SPOFE**,
- ou de **versions ultérieures**.

### 5. Responsabilité du module

Le module Trésorerie Caisse est un **module de vérité factuelle**, pas financière.

**Il :**
- enregistre des faits,
- contrôle leur validité,
- trace leur origine,
- expose des états de lecture.

**Il ne :**
- calcule pas de comptabilité,
- n'interprète pas les faits,
- n'optimise pas la trésorerie.

### 6. Référentiel comptable

Ce module est **référentiel-agnostique**.

Les faits qu'il expose sont destinés à être rattachés aux comptes du **référentiel comptable OHADA** (par défaut), via des **modules comptables dédiés** (Précomptabilité, Comptabilité Générale), conformément à la :

**CHARTE_REFERENTIEL_COMPTABLE_SPOFE.md**

Ce module :
- ne contient aucun numéro de compte comptable,
- n'implémente aucune règle comptable,
- ne produit aucune écriture comptable.

Toute logique de rattachement aux comptes (ex. 52, 57) est **strictement hors périmètre**.

### 7. Statut du scope

```
SCOPE STATUS
────────────────────────────────
Module        : Trésorerie Caisse
Version       : v1.0.0
Niveau        : SPOFE P0
Référentiel   : OHADA-first
Documents     : Électroniques signés
Mutable       : NON
────────────────────────────────
```
