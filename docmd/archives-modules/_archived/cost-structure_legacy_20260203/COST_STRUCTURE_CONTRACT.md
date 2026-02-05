# 📘 MODULE COST-STRUCTURE (COUTFLEX)
Documentation Contractuelle — v1.0.0

**Statut** : Contractuelle  
**Rôle** : Module de décision économique et de validation de rentabilité  
**Position SPOFE** : Amont du module Budget  
**Golden Reference** : Budget v1.0.1  
**Audience** : Architecture · Direction · Finance · Produit · Audit

---

## 1️⃣ Objectif du module

Le module Cost-Structure (COUTFLEX) permet de :
- calculer et structurer les coûts complets d’un produit ou service
- tester la viabilité économique d’un projet
- valider ou invalider un prix de vente
- autoriser ou interdire l’engagement budgétaire

**📌 Principe fondamental :**
> ❗ Aucun budget ne doit être engagé sans une structure de coûts validée.

---

## 2️⃣ Nature contractuelle du module

### Ce que le module EST
- un module de décision
- un module de simulation
- un module de validation économique
- un garde-fou de rentabilité

### Ce que le module N’EST PAS
- ❌ un module comptable
- ❌ un module de facturation
- ❌ un module de stock
- ❌ un module transactionnel

👉 COUTFLEX ne crée pas d’écritures métier irréversibles.

---

## 3️⃣ Périmètre contractuel v1.0.0

### ✔ Inclus
- Définition de structures de coûts par produit / service
- Classification des coûts (variables, fixes, indirects)
- Calcul du coût de revient
- Simulation de scénarios (volumes, prix)
- Test de robustesse (seuil 70 %)
- Validation / rejet de projet
- Historisation et versioning des décisions
- Traçabilité des validations humaines
- Fourniture des hypothèses au module Budget

### ❌ Hors périmètre explicite
- Exécution budgétaire
- Suivi de trésorerie
- Gestion des stocks
- Écritures comptables
- Automatisation d’achats ou de ventes

---

## 4️⃣ Concepts métier fondamentaux

### 4.1 Projet économique (`EconomicProject`)
Représente un produit ou service à évaluer.
```typescript
EconomicProject {
  id: string
  tenantId: string
  name: string
  type: "PRODUCT" | "SERVICE"
  status: "DRAFT" | "SIMULATED" | "VALIDATED" | "REJECTED"
}
```

### 4.2 Structure de coûts (`CostStructure`)
```typescript
CostStructure {
  projectId: string
  version: number
  costs: CostLine[]
  assumptions: AssumptionSet
}
```

### 4.3 Ligne de coût (`CostLine`)
```typescript
CostLine {
  category: "VARIABLE" | "FIXED" | "INDIRECT"
  label: string
  amount: number
  allocationRule?: string
}
```

### 4.4 Hypothèses économiques
- volumes attendus
- prix de vente cible
- capacités réalistes
- scénarios pessimistes / réalistes / optimistes

---

## 5️⃣ Niveaux de calcul (hérités de COUTFLEX)

**Niveau 1 — Coûts directs**
- coûts variables unitaires
- matières premières
- main-d’œuvre directe

**Niveau 2 — Contraintes de capacité**
- volumes réalistes
- seuil de saturation
- limites opérationnelles

**Niveau 3 — Coût de revient**
- coût complet
- marge brute
- marge nette

---

## 6️⃣ Test de viabilité (Invariant central)

**Règle contractuelle clé**
> ❗ Le projet doit rester viable à 70 % des hypothèses.

**Invariant COUT-01**
- Si la marge devient négative à 70 % → REJECTED
- 📌 Cet invariant est bloquant.

---

## 7️⃣ Guardian Cost-Structure

Le `CostStructureGuardian` garantit :
- cohérence des hypothèses
- absence de coûts négatifs
- validité des allocations
- respect du test 70 %
- immutabilité après validation

👉 Aucune validation ne peut bypasser le Guardian.

---

## 8️⃣ Décision & gouvernance

Chaque décision est :
- validée par un utilisateur SPOFE identifié
- horodatée
- historisée
- non modifiable après validation

`DRAFT → SIMULATED → VALIDATED | REJECTED`

---

## 9️⃣ Relation contractuelle avec le module Budget

### Ce que COUTFLEX fournit à Budget
- prix validé
- volumes réalistes
- structure de coûts validée
- statut GO / NO GO
- hypothèses chiffrées

**📌 Budget ne peut être engagé que si :**
> CostStructure.status === VALIDATED

---

## 🔟 Données techniques & read-models
- Historique des simulations
- Comparaison de versions
- Sensibilité des marges
- Écarts hypothèses / réalité (post-budget)

**📌 Tous les calculs sont reproductibles et auditables.**

---

## 1️⃣1️⃣ Multi-tenant & sécurité
- Isolation stricte par tenant_id
- Guardian logique
- PostgreSQL RLS
- Traçabilité complète des décisions

---

## 1️⃣2️⃣ Monitoring & alertes
**Indicateurs clés**
- taux de rejet de projets
- marge moyenne validée
- écarts prévision / réel (via Budget)
- projets validés mais non budgétés

---

## 1️⃣3️⃣ Build Strategy & CI
- Module isolé (`cascade/modules/cost-structure`)
- tsconfig.json dédié
- CI TypeScript par module
- Tests invariants obligatoires
- Aucun impact du legacy

---

## 1️⃣4️⃣ Definition of Done — Cost-Structure v1.0.0

Le module est déclaré **DONE** si :
- Tous les invariants sont implémentés et testés
- Le test 70 % est bloquant
- Le lien contractuel avec Budget est respecté
- Les décisions sont historisées
- La CI est verte
- La documentation est conforme

---

## 🏁 Déclaration contractuelle

Le module Cost-Structure (COUTFLEX) v1.0.0 est conforme lorsqu’il respecte intégralement ce document.
