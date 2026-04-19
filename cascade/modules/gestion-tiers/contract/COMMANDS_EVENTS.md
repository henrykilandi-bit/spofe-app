# 🔁 COMMANDS & EVENTS — MODULE GESTION DES TIERS

**Version :** v1.0.0  
**Framework :** SPOFE v2.1.0

## 🎯 Objectif du document

Ce document définit les **seules** commandes, documents et événements autorisés dans le module Gestion des Tiers.

👉 Toute commande, document ou événement non listé ici est **interdit**.  
👉 Toute tentative de logique financière entraîne un rejet Guardian P0.

## 🧱 Principe fondamental SPOFE

Aucune mutation d'état n'existe sans :
1. **une commande explicite,**
2. **un document validé,**
3. **un événement immuable émis.**

## 📥 COMMANDES AUTORISÉES

### 🟢 C-01 — CreateTier

**Création d'un nouveau tiers.**

**Entrées :**
- `tenantId`
- `actorId`
- identité (nom / raison sociale)
- identifiants légaux (optionnels selon type)
- rôles initiaux
- coordonnées de base

**Contraintes Guardian :**  
G-01, G-02, G-03, G-04, G-08, G-09

### 🟢 C-02 — UpdateTier

**Mise à jour des informations administratives d'un tiers existant.**

**Entrées :**
- `tenantId`
- `actorId`
- `tierId`
- champs modifiés (administratif uniquement)

**Contraintes Guardian :**  
G-01, G-04, G-05, G-06, G-07, G-08, G-09

### 🟢 C-03 — SuspendTier

**Suspension d'un tiers.**

**Entrées :**
- `tenantId`
- `actorId`
- `tierId`
- motif de suspension

**Effet :**  
changement de statut → `SUSPENDED`

**Contraintes Guardian :**  
G-04, G-05, G-06, G-08, G-09

### 🟢 C-04 — ArchiveTier

**Archivage définitif d'un tiers.**

**Entrées :**
- `tenantId`
- `actorId`
- `tierId`
- motif d'archivage

**Effet :**  
changement de statut → `ARCHIVED`

**Contraintes Guardian :**  
G-04, G-05, G-06, G-07, G-08, G-09

## 🔴 COMMANDES INTERDITES (v1.0.0)

Les commandes suivantes sont **explicitement interdites** :

- `DeleteTier`
- `MergeTier`
- `ReactivateTier`
- `CloseTierAccount`
- toute commande contenant :
  - montants
  - soldes
  - échéances
  - indicateurs financiers

👉 **Toute tentative entraîne un rejet immédiat Guardian.**

## 📄 DOCUMENTS TIERS

Chaque commande génère ou consomme un document.

### 📄 D-01 — TierRecord
**Document de création du tiers.**

**États :**  
`draft` → `validated` → `cancelled`

### 📄 D-02 — TierUpdateRecord
**Document de mise à jour.**

**États :**  
`draft` → `validated` → `cancelled`

### 📄 D-03 — TierSuspensionRecord
**Document de suspension.**

**États :**  
`draft` → `validated` → `cancelled`

### 📄 D-04 — TierArchiveRecord
**Document d'archivage.**

**États :**  
`draft` → `validated` → `cancelled`

## 📤 ÉVÉNEMENTS ÉMIS (IMMUTABLES)

Chaque document validé doit produire **exactement un événement**.

### 📣 E-01 — TierCreated

**Émis après validation de TierRecord.**

**Payload minimal :**
- `tenantId`
- `tierId`
- `rôles`
- `statut` = ACTIVE
- `timestamp`
- `actorId`

### 📣 E-02 — TierUpdated

**Émis après validation de TierUpdateRecord.**

**Payload minimal :**
- `tenantId`
- `tierId`
- `champs modifiés`
- `timestamp`
- `actorId`

### 📣 E-03 — TierSuspended

**Émis après validation de TierSuspensionRecord.**

**Payload minimal :**
- `tenantId`
- `tierId`
- `statut` = SUSPENDED
- `motif`
- `timestamp`
- `actorId`

### 📣 E-04 — TierArchived

**Émis après validation de TierArchiveRecord.**

**Payload minimal :**
- `tenantId`
- `tierId`
- `statut` = ARCHIVED
- `motif`
- `timestamp`
- `actorId`

## 🔒 Règles d'émission des événements

1. **1 document validé = 1 événement**
2. **Aucun événement sans document validé**
3. Les événements sont :
   - immuables
   - horodatés
   - traçables
4. **Aucun événement financier autorisé**

## 🔗 Consommation inter-modules (lecture seule)

Les autres modules peuvent **écouter** :
- `TierCreated`
- `TierUpdated`
- `TierSuspended`
- `TierArchived`

👉 Ils ne peuvent **jamais** :
- produire des événements tiers
- déclencher des commandes tiers

## 🛑 Causes de rejet explicites (non exhaustif)

- commande sans document
- document non validé
- actor absent
- tier archivé
- tentative de logique financière
- violation d'invariant Guardian

## 🟢 Statut du document

```
COMMANDS_EVENTS STATUS
────────────────────────────────────
Module        : gestion-tiers
Version       : v1.0.0
State         : APPROVED
Governance    : SPOFE P0
Mutable       : NO
────────────────────────────────────
```

---

**✔️ FIN DU DOCUMENT COMMANDS_EVENTS.md**
