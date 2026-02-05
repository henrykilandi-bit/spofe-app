# GUARDIAN — MODULE STOCK

**Module:** gestion-stocks  
**Version:** v1.0.0  
**Statut:** OFFICIEL — Normatif  
**Rôle:** Guardian central SPOFE  

---

## 🛡️ Règle fondamentale

**Toute la logique métier du module Stock est centralisée dans ce Guardian.**

Aucune règle métier ne peut exister :
- dans l'API
- dans les handlers
- dans les repositories
- dans les read-models
- dans les vues SQL

Toute violation de cette règle rend le module **NON CONFORME SPOFE**.

---

## 🎯 Mission du Guardian Stock

Garantir que :
- chaque mouvement de stock est **légal**, **traçable** et **documenté**
- aucune incohérence physique n'est possible
- aucune violation de périmètre n'est tolérée
- l'historique est **append-only**
- les règles contractuelles sont **appliquées automatiquement**

---

## 🔐 INVARIANTS MÉTIER — NIVEAU P0 (NON NÉGOCIABLE)

### STOCK-INV-001 — Mouvement documenté
**Règle**  
Aucun mouvement de stock ne peut exister sans document validé.

**Validation**  
- documentId obligatoire
- document.status = `validated`

**Violation**  
Rejet immédiat.

---

### STOCK-INV-002 — Acteur identifié
**Règle**  
Aucun document ne peut être validé sans acteur SPOFE identifié.

**Validation**
- actorId obligatoire
- actorId non nul

---

### STOCK-INV-003 — Séquentialité documentaire
**Règle**  
Un document ne peut être validé que si le document précédent requis est lui-même validé.

**Exemples**
- ❌ Bon d'entrée sans bon de réception validé
- ❌ Bon de sortie sans bon de livraison validé
- ✅ Chaîne documentaire complète

---

### STOCK-INV-004 — Pas de mouvement cross-tenant
**Règle**  
Un mouvement de stock ne peut concerner qu'un seul tenant.

**Validation**
- tenantId du document = tenantId du stock
- tenantId source ≠ tenantId cible → interdit

---

### STOCK-INV-005 — Stock rattaché à un dépôt
**Règle**  
Tout stock est obligatoirement rattaché à un dépôt.

**Validation**
- depotId obligatoire
- aucun mouvement sans dépôt

---

### STOCK-INV-006 — Historique append-only
**Règle**  
Aucun mouvement de stock ne peut être modifié ou supprimé.

**Validation**
- création uniquement
- aucune mise à jour
- aucune suppression

---

### STOCK-INV-007 — Types de mouvements autorisés
**Règle**  
Seuls les types de mouvements suivants sont autorisés :

- Entrée
- Sortie
- Transfert
- Ajustement d'inventaire

Tout autre type est rejeté.

---

## 🏷️ RÈGLES PAR CATÉGORIE DE STOCK

Les catégories de stock conditionnent les règles de suivi.

### STOCK-CAT-001 — Catégorie obligatoire
**Règle**  
Chaque stock doit appartenir à une catégorie définie.

---

### STOCK-CAT-002 — Catégories reconnues
- Marchandises
- Produits finis
- Matières premières
- Emballages perdus
- Emballages récupérables
- Autres stocks

Toute autre valeur est rejetée.

---

### STOCK-CAT-003 — Emballages récupérables
**Règle**  
Les emballages récupérables sont suivis comme des actifs physiques traçables.

**Validation**
- suivi spécifique
- mouvements obligatoirement documentés

---

## 🔁 RÈGLES DE TRANSFERT INTERNE

### STOCK-TRF-001 — Dépôts distincts
**Règle**  
Un transfert interne doit obligatoirement concerner deux dépôts distincts.

---

### STOCK-TRF-002 — Double mouvement obligatoire
**Règle**  
Un transfert interne génère :
- une sortie du dépôt source
- une entrée dans le dépôt destination

Aucun transfert partiel n'est autorisé.

---

## 📦 INVENTAIRES

### STOCK-INVTRY-001 — Ajustement contrôlé
**Règle**  
Les ajustements de stock ne sont autorisés que via un bon d'inventaire validé.

---

### STOCK-INVTRY-002 — Traçabilité
**Règle**  
Tout écart d'inventaire est tracé avec :
- document d'origine
- acteur responsable
- horodatage

---

## 🚫 RÈGLES D'EXCLUSION ABSOLUES

Le Guardian Stock interdit formellement :

- tout calcul de coût
- toute valorisation financière
- toute écriture comptable
- toute logique budgétaire
- toute logique de production
- toute prévision intelligente

Toute tentative constitue une **violation contractuelle**.

---

## 🔍 MODES DE VALIDATION

### Création de document
- validateDocumentCreation()

### Validation de document
- validateDocumentValidation()

### Génération de mouvement
- validateMovementCreation()

### Transfert interne
- validateInternalTransfer()

### Inventaire
- validateInventoryAdjustment()

Chaque méthode :
- retourne succès ou violations
- n'applique aucune mutation

---

## 📊 EXIGENCES DE QUALITÉ

- Couverture tests Guardian : **100 %**
- Temps d'exécution cible : **< 10 ms p95**
- Zéro logique métier hors Guardian

---

## 🧨 SANCTION

Toute violation :
- est rejetée
- bloque la command
- empêche la génération d'événement
- rend le BUILD_PROOF invalide

---

**Fin du document — Guardian Stock v1.0.0**
