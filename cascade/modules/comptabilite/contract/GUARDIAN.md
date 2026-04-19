# 📄 GUARDIAN.md

# Module Comptabilité Générale — Constitution Métier

Ce document définit l'autorité et les responsabilités du Guardian Comptabilité.

## 🛡️ Rôle du Guardian

Le Guardian Comptabilité est l'autorité **unique et exclusive** de validation des écritures comptables dans SPOFE.

Il est le **seul point d'écriture** autorisé dans le registre comptable.

## 🎯 Responsabilités Exclusives

### 1️⃣ Validation des Écritures en Partie Double
- **Équilibre obligatoire** : Débit = Crédit pour chaque écriture
- **Comptes valides** : Conformité au plan comptable référencé
- **Montants cohérents** : Signes et valeurs contrôlés
- **Structure formelle** : Format d'écriture respecté

### 2️⃣ Contrôle des Périodes Comptables
- **Périodes ouvertes uniquement** : Interdiction d'écrire sur périodes clôturées
- **Conformité fiscale** : Respect des exercices déclarés dans Paramètres
- **Continuité** : Non-chevauchement des périodes
- **Traçabilité temporelle** : Horodatage précis de chaque écriture

### 3️⃣ Référenciation Obligatoire
- **Pièces justificatives** : Liaison avec Précomptabilité obligatoire
- **Tiers validés** : Référence aux tiers enregistrés dans leur module
- **Journaux comptables** : Utilisation des journaux référencés dans Paramètres
- **Source module** : Identification claire du module d'origine

### 4️⃣ Conformité Normative
- **Plan comptable** : Respect du plan sélectionné dans Paramètres
- **États normés** : Production conforme aux états légaux
- **Présentation légale** : Formats requis par les normes applicables
- **Archivage** : Conservation selon les durées légales

### 5️⃣ Immutabilité et Traçabilité
- **Non-modification** : Écritures validées immuables
- **Historique complet** : Conservation de toutes les versions
- **Signature numérique** : Preuve d'intégrité
- **Audit trail** : Traçabilité des validations

## 🚫 Interdictions Absolues

### Aucun Calcul Métier Amont
- Pas d'amortissements calculés
- Pas de provisions générées
- Pas de valorisations automatiques
- Pas de répartitions de coûts

### Aucune Suggestion Intelligente
- Pas de recommandations d'écritures
- Pas d'optimisations fiscales
- Pas d'analyses prédictives
- Pas d'alertes intelligentes

### Aucun Pilotage Stratégique
- Pas de tableaux de bord de gestion
- Pas d'indicateurs de performance
- Pas d'analyses financières
- Pas de conseils décisionnels

### Aucun Workflow Organisationnel
- Pas de circuits d'approbation
- Pas de validations hiérarchiques
- Pas de gestion des droits utilisateurs
- Pas de notifications automatiques

## 🏛️ Principe Constitutionnel

**Tout ce qui n'est pas explicitement autorisé est interdit.**

Le Guardian Comptabilité :
- **Valide** ce qui est conforme
- **Refuse** ce qui n'est pas explicitement prévu
- **N'initie** aucune action
- **N'optimise** aucun processus

## INVARIANTS

- CO01 : Isolation stricte par tenant
- CO02 : Équilibre obligatoire débit égal crédit
- CO03 : Comptes valides conformité au plan comptable
- CO04 : Périodes ouvertes uniquement
- CO05 : Référenciation pièces justificatives obligatoire
- CO06 : Tiers validés référence obligatoire
- CO07 : Journaux comptables autorisés uniquement
- CO08 : Source module identification claire
- CO09 : Conformité normative plan comptable
- CO10 : Écritures validées immuables
- CO11 : Historique complet conservation
- CO12 : Signature numérique preuve intégrité
- CO13 : Audit trail traçabilité validations
- CO14 : Aucun calcul métier amont
- CO15 : Aucune suggestion intelligente

##  Processus de Validation

### 1️⃣ Réception de l'écriture
- Source module identifiée
- Format d'écriture respecté
- Données complètes présentes

### 2️⃣ Contrôle formel
- Équilibre partie double vérifié
- Comptes validés dans le plan
- Périodes ouvertes confirmées

### 3️⃣ Validation référentielle
- Tiers existants et valides
- Pièces justificatives présentes
- Journaux autorisés

### 4️⃣ Enregistrement immuable
- Horodatage précis
- Signature numérique
- Historique conservé

### 5️⃣ Confirmation
- Retour de validation
- Référence d'écriture générée
- Traçabilité assurée

## 🛠️ Interface du Guardian

### Méthodes publiques

```typescript
class ComptabiliteGuardian {
  static validerNouvelleEcriture(
    ecriture: EcritureComptable,
    contexte: ContexteValidation
  ): ResultatValidation;
  
  static validerLotEcritures(
    ecritures: EcritureComptable[],
    contexte: ContexteValidation
  ): ResultatValidationLot;
  
  static verifierConformitePeriode(
    periode: PeriodeComptable
  ): ResultatPeriode;
}
```

### Résultats possibles
- **VALIDÉ** : Écriture acceptée et enregistrée
- **REFUSÉ** : Écriture non conforme (avec motif)
- **ATTENTE** : Information complémentaire requise

## INVARIANTS

- CP01 : Isolation stricte par tenant
- CP02 : Équilibre partie double obligatoire
- CP03 : Période ouverte uniquement
- CP04 : Comptes valides selon plan
- CP05 : Pièces justificatives obligatoires
- CP06 : Montants strictement positifs
- CP07 : Immutabilité post-validation
- CP08 : Référenciation tiers obligatoire
- CP09 : Journal comptable valide
- CP10 : Source module identifiée

### Sanctions Guardian

Toute violation ⇒ Commande rejetée immédiatement par le Guardian.

## 📊 Garanties SPOFE

### Garantie d'Unicité
- Un seul Guardian Comptabilité dans tout le système
- Point d'écriture unique et exclusif
- Autorité incontestable sur le registre

### Garantie de Conformité
- Respect strict des normes comptables
- Conformité aux cadres réglementaires
- États légaux produits correctement

### Garantie de Traçabilité
- Chaque écriture traçable à sa source
- Historique complet des validations
- Preuve numérique disponible

## 📌 Statut

**✅ FINAL — CADRE CONSTITUTIONNEL**

Le Guardian Comptabilité est défini comme l'autorité unique et exclusive de validation des écritures comptables SPOFE.
