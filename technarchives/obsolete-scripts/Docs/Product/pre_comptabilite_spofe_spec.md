# SPOFE — Pré‑comptabilité & Validation Comptable

Ce document transforme la vision « saisie non‑comptable → validation comptable → écriture » en **spécification exploitable**.

---

## 🧩 EPIC — Pré‑comptabilité SPOFE (Différenciation Produit)

**Objectif** : Permettre aux non‑comptables de saisir des opérations métier sans risque, avec validation finale par un comptable.

Labels suggérés : `pre-compta`, `ux`, `backend`, `frontend`, `mvp`

---

## 🔹 ISSUE 1 — Modèle BusinessOperation

**Type** : Backend

### Description
Créer l’entité représentant une opération métier non comptable.

### Champs
- id
- type (CAISSE, BANQUE, IMMO, STOCK, CREANCE, DETTE)
- label
- amount
- date
- attachmentUrl (optionnel)
- status (DRAFT, PENDING_VALIDATION, VALIDATED, REJECTED)
- createdBy

### Critères d’acceptation
- Une BusinessOperation n’est jamais une écriture comptable
- Statut par défaut : DRAFT

---

## 🔹 ISSUE 2 — Templates de correspondance métier → comptes

**Type** : Backend

### Description
Créer les règles de correspondance entre libellés métier et comptes comptables.

### Champs
- operationType
- label
- debitAccountId
- creditAccountId
- editableByAccountant (boolean)

### Règles
- Non‑comptable ne choisit jamais les comptes
- Aucun template → blocage

---

## 🔹 ISSUE 3 — Wizard de saisie non‑comptable

**Type** : Frontend / UX

### Étapes
1. Choix du type d’opération
2. Choix du libellé métier
3. Saisie montant & date
4. Récapitulatif simple

### Critères UX
- Aucun débit / crédit affiché
- Aucun numéro de compte visible

---

## 🔹 ISSUE 4 — File de validation comptable

**Type** : Frontend

### Description
Vue listant les opérations en attente de validation.

Colonnes :
- Type
- Libellé
- Montant
- Date
- Alertes

---

## 🔹 ISSUE 5 — Écran de validation comptable

**Type** : Frontend

### Actions
- Valider (crée l’écriture)
- Corriger la proposition
- Rejeter (motif obligatoire)

---

## 🔹 ISSUE 6 — Règles de blocage & alertes

**Type** : Backend

### Blocages
- Montant ≤ 0
- Aucun template trouvé

### Alertes
- Montant > seuil
- Absence de pièce jointe

---

## 🔐 Règles OHADA spécifiques

- Une écriture ne peut être créée sans validation comptable
- Toute écriture validée est non modifiable (contre‑passation obligatoire)
- Traçabilité : qui a saisi / qui a validé

---

## 🔁 Flow UX — écran par écran

1. Utilisateur non‑comptable → Nouvelle opération
2. Saisie métier (wizard)
3. Envoi pour validation
4. Comptable consulte la file
5. Validation → écriture créée

---

## 📊 Cas réel simulé

### Utilisateur
- Type : non‑comptable
- Action : paiement facture d’eau

### Saisie
- Type : Caisse
- Libellé : Facture d’eau
- Montant : 25 000 FCFA

### Proposition
- Débit : Charges eau
- Crédit : Caisse

### Validation
- Comptable valide
- Écriture créée et figée

---

## 🎯 Résultat produit

- Adoption facilitée
- Erreurs réduites
- Rigueur comptable garantie

