# MODULE IMMOBILISATION — SCOPE (v1.0.0)

## 1. RÔLE DU MODULE

Le module Immobilisation est responsable de la **gestion factuelle des biens immobilisés**
d'une entreprise, conformément au référentiel **OHADA (classe 2)**.

Il constitue une **source de vérité non financière**, décrivant l'existence et le cycle de vie
des immobilisations, sans aucun calcul comptable.

---

## 2. PRINCIPES SPOFE P0

- OHADA-first
- Fact-only (aucun calcul)
- Append-only (historique immuable)
- Guardian-first
- Multi-tenant strict
- Séparation stricte fait / lecture / calcul

---

## IN SCOPE

- Enregistrement d'une immobilisation sur document validé
- Classification OHADA :
  - Corporelles
  - Incorporelles
  - Financières
- Valeur brute factuelle (montant d'origine)
- Mise en service
- Sortie (cession, réforme, destruction)
- Traçabilité complète

---

## OUT OF SCOPE

- ❌ Amortissements
- ❌ Dépréciations
- ❌ Réévaluations
- ❌ Calculs fiscaux
- ❌ Écritures comptables
- ❌ Numéros de comptes

---

## 5. DOCUMENTS OBLIGATOIRES

- Facture d'acquisition
- Procès-verbal de mise en service
- Acte de cession / réforme

Aucun événement sans document validé.

---

## 6. INTERACTIONS

- Exposition read-only vers :
  - Précomptabilité
  - Comptabilité
  - Budget
- Aucune dépendance métier directe

---

## 7. GOUVERNANCE COMPTABLE

- Référentiel principal : OHADA
- Autres référentiels : extensions possibles (PCG)
- Aucun numéro de compte embarqué

---

## 8. VERSIONING

- Version : v1.0.0
- SCOPE gelé
