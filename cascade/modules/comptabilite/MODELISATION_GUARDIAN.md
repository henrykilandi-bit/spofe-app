# 🛡️ MODELISATION GUARDIAN - Comptabilité Générale v1.0.0

## 📋 Vue d'ensemble

Cette modélisation constitue le **cœur constitutionnel** du Guardian Comptabilité. Elle définit de manière formelle et non ambiguë tous les types, agrégats et invariants qui garantiront la légalité comptable du système SPOFE.

---

## 🧱 1️⃣ Agrégat Racine : AccountingPeriod

### Rôle Constitutionnel
La période comptable est l'**unité de souveraineté** du module. Elle est la frontière de sécurité qui garantit l'immutabilité et la traçabilité.

### Structure
```typescript
interface AccountingPeriod {
  periodId: string;           // Identifiant unique
  status: PeriodStatus;       // OPEN | CLOSED | LOCKED
  startDate: Date;           // Date de début
  endDate: Date;             // Date de fin
  journalSet: Journal[];     // Ensemble des journaux
  balance: PeriodBalance;    // Projection read-only
  auditTrail: AuditTrail[];  // Trace d'audit complète
}
```

### Garanties
- ✅ **Aucune écriture n'existe hors d'une période**
- ✅ **La période est la frontière de sécurité**
- ✅ **Immutabilité garantie par le statut**

---

## 📊 2️⃣ Types Structurants

### 2.1 AccountingEntry (Écriture Comptable)
```typescript
interface AccountingEntry {
  entryId: string;           // Identifiant unique
  journalCode: string;       // Code du journal
  entryDate: Date;          // Date de l'écriture
  lines: AccountingLine[];   // Lignes (minimum 2)
  source: EntrySource;       // Source identifiée
  documentRef: string;       // Pièce justificative
  createdAt: Date;          // Horodatage création
  createdBy: string;        // Attribut à
}
```

**Contraintes strictes :**
- ❌ **Aucune ligne mixte débit/crédit**
- ❌ **Les analytiques sont référencés, jamais interprétés**

### 2.2 AccountingLine (Ligne d'Écriture)
```typescript
interface AccountingLine {
  accountCode: string;       // Code du compte
  debit: number;            // Montant au débit (>= 0)
  credit: number;           // Montant au crédit (>= 0)
  tierId?: string;          // Tiers (obligatoire si classe 4)
  documentRef?: string;     // Référence documentaire
}
```

### 2.3 Journal (Journal Comptable)
```typescript
interface Journal {
  journalCode: string;       // Code du journal
  periodId: string;         // Période d'appartenance
  entries: AccountingEntry[]; // Écritures du journal
}
```

**Garanties :**
- ✅ **Journaux déclarés dans Paramètres**
- ✅ **Aucune création dynamique**
- ✅ **Un journal appartient à une seule période**

---

## 🔒 3️⃣ Invariants P0 - Cœur Constitutionnel

### 3️⃣1️⃣ A. Invariants de Période (4 invariants)

| Code | Règle | Impact |
|------|-------|--------|
| G-COMPTA-01 | Période OPEN obligatoire | Bloque toute écriture sur période fermée |
| G-COMPTA-02 | Append-only strict | Garantit l'immutabilité |
| G-COMPTA-03 | Pas d'écriture sur CLOSED | Protège la clôture |
| G-COMPTA-04 | Période LOCKED figée | Protection juridique maximale |

### 3️⃣2️⃣ B. Invariants de Partie Double (3 invariants)

| Code | Règle | Impact |
|------|-------|--------|
| G-COMPTA-05 | Minimum 2 lignes | Structure valide |
| G-COMPTA-06 | Débits = Crédits | Équilibre mathématique |
| G-COMPTA-07 | Ligne non mixte | Logique comptable pure |

### 3️⃣3️⃣ C. Invariants de Conformité Comptable (3 invariants)

| Code | Règle | Impact |
|------|-------|--------|
| G-COMPTA-08 | Compte existe dans plan | Conformité Paramètres |
| G-COMPTA-09 | Nature compte respectée | Logique débit/crédit |
| G-COMPTA-10 | Tiers obligatoire classe 4 | Traçabilité tierce |

### 3️⃣4️⃣ D. Invariants de Traçabilité (3 invariants)

| Code | Règle | Impact |
|------|-------|--------|
| G-COMPTA-11 | Source identifiée | Origine certifiée |
| G-COMPTA-12 | Pièce justificative | Preuve documentaire |
| G-COMPTA-13 | Horodatage + attribution | Responsabilité claire |

### 3️⃣5️⃣ E. Invariants de Journaux (2 invariants)

| Code | Règle | Impact |
|------|-------|--------|
| G-COMPTA-14 | Journal autorisé | Conformité opérationnelle |
| G-COMPTA-15 | Journal période unique | Cohérence structurelle |

### 3️⃣6️⃣ F. Invariants de Clôture (3 invariants)

| Code | Règle | Impact |
|------|-------|--------|
| G-COMPTA-16 | Équilibre global clôture | Intégrité finale |
| G-COMPTA-17 | Clôture interdit écritures | Protection temporelle |
| G-COMPTA-18 | Trace audit clôture | Preuve légale |

---

## 🛡️ 4️⃣ Interface du Guardian

### Méthodes Publiques
```typescript
class ComptabiliteGuardian {
  // Validation d'une écriture
  static validerNouvelleEcriture(
    ecriture: AccountingEntry,
    contexte: ContexteValidation
  ): ResultatValidation;
  
  // Validation d'un lot
  static validerLotEcritures(
    ecritures: AccountingEntry[],
    contexte: ContexteValidation
  ): ResultatValidationLot;
  
  // Vérification de période
  static verifierConformitePeriode(
    periodeId: string
  ): ResultatPeriode;
  
  // Clôture de période
  static clôturerPeriode(
    commande: CommandeCloturePeriode
  ): ResultatCloturePeriode;
}
```

### Résultats Possibles
- **VALIDÉ** : Écriture acceptée et enregistrée
- **REFUSÉ** : Écriture non conforme (invariants P0 violés)
- **ATTENTE** : Information complémentaire requise

---

## 🚫 5️⃣ Ce que le Guardian NE FAIT PAS

### Calculs Métier Interdits
- ❌ Calcul de la TVA
- ❌ Calcul des amortissements
- ❌ Valorisation des stocks
- ❌ Analyse analytique

### Intégrations Interdites
- ❌ Suggestions intelligentes
- ❌ Corrections automatiques
- ❌ Optimisations fiscales
- ❌ Pilotage stratégique

### Principe Fondamental
**Le Guardian valide, enregistre, fige. Il ne calcule pas, n'enrichit pas, n'optimise pas.**

---

## 🔗 6️⃣ Frontières Claires avec les Autres Modules

| Module | Ce qu'il fournit | Ce que la Comptabilité fait |
|--------|------------------|---------------------------|
| Précomptabilité | Pièce qualifiée | Enregistre |
| Vente | Fait commercial | Enregistre |
| Banque / Caisse | Flux réels | Enregistre |
| Immobilisation | Dotation calculée | Enregistre |
| Stock | Valorisation | Enregistre |
| COUTFLEX | Coût | Référence |
| Budget | Cible | Compare (lecture seule) |

---

## 📋 7️⃣ Livrables de l'Étape 3

### ✅ Ce qui est maintenant disponible

1. **Agrégat racine défini** : `AccountingPeriod`
2. **Types structurants définis** : `AccountingEntry`, `AccountingLine`, `Journal`
3. **Invariants P0 listés** : 18 invariants constitutionnels
4. **Frontières claires** : Interfaces et responsabilités définies
5. **Guardian prêt à être codé** : Interface complète et types de retour

### 🎯 Garanties Constitutionnelles

- ✅ **Autorité unique** : Un seul Guardian Comptabilité
- ✅ **Légalité comptable** : 18 invariants P0 garantis
- ✅ **Immutabilité** : Append-only strict
- ✅ **Traçabilité** : Source, pièce, horodatage
- ✅ **Conformité** : Plans comptables et normes respectées

---

## 🚀 8️⃣ Prochaine Étape

Avec cette modélisation complète et non ambiguë :

1. **L'implémentation du Guardian devient mécanique**
2. **Les tests P0 sont directement dérivables**
3. **L'intégration avec les autres modules est claire**
4. **La certification BUILD_PROOF est préparée**

**🏛️ Le cœur constitutionnel est établi. La suite ne sera que mécanique.**
