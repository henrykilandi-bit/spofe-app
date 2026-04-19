# Guardian Comptabilité Générale

Ce dossier contient l'unique autorité métier du module.
Toute écriture comptable doit passer par le Guardian.

## 🛡️ Rôle Constitutionnel

Le Guardian Comptabilité est :

- **l'unique autorité d'écriture**
- **le garant de la légalité comptable**
- **le gardien de la clôture**
- **le garant de l'auditabilité**

## 📁 Structure

```
guardian/
├── AccountingGuardian.ts      # Point d'entrée principal
├── types/                     # Types concrets
│   ├── AccountingPeriod.ts
│   ├── AccountingEntry.ts
│   ├── AccountingLine.ts
│   └── index.ts
├── invariants/                # Invariants P0 implémentés
│   ├── invariantPeriodStatus.ts
│   ├── invariantDoubleEntry.ts
│   ├── invariantTraceability.ts
│   └── index.ts
└── README.md                  # Documentation
```

## 🔒 Invariants P0 Implémentés

Le Guardian applique strictement les invariants P0 :

- **G-COMPTA-01** : Période doit être OPEN (invariantPeriodIsOpen)
- **G-COMPTA-05** : Minimum 2 lignes (invariantDoubleEntry)
- **G-COMPTA-06** : Équilibre débit/crédit (invariantDoubleEntry)
- **G-COMPTA-07** : Pas de ligne mixte, pas de négatifs (invariantDoubleEntry)
- **G-COMPTA-11** : Source identifiée (invariantTraceability)
- **G-COMPTA-12** : Pièce justificative (invariantTraceability)
- **G-COMPTA-13** : Horodatage et attribution (invariantTraceability)

## 🚫 Restrictions

**Le Guardian NE :**
- calcule pas la TVA
- calcule pas les amortissements
- calcule pas les valorisations de stock
- fait pas d'analyse analytique
- fait pas de suggestions
- fait pas de corrections automatiques

**Le Guardian valide, enregistre, fige.**

## 📋 Utilisation

```typescript
import { AccountingGuardian } from './AccountingGuardian.js';

// Valider une écriture
try {
  AccountingGuardian.validateNewEntry(period, entry);
  // Écriture valide
} catch (error) {
  if (error instanceof GuardianViolation) {
    console.error(`Violation ${error.code}: ${error.message}`);
  }
}

// Clôturer une période
const closedPeriod = AccountingGuardian.closePeriod(period, 'USER_001', '2024-01-31T23:59:59Z');
```

## 🎯 Principes de Conception

- **Un seul point d'entrée** : AccountingGuardian
- **Validation stricte** : Toute violation lève une exception
- **Append-only** : Le Guardian ne modifie pas, il valide et retourne
- **Aucune persistence** : Le Guardian ne persiste aucune donnée
- **Testable** : Pure functions, pas d'inférence requise
