# 📄 DEPENDENCIES.md

# Module Comptabilité Générale — Dépendances

Ce document formalise toutes les dépendances du module Comptabilité Générale.

## 🔗 Nature du module

- **Type** : Terminal d'agrégation
- **Sens des flux** : ENTRANT uniquement
- **Rôle** : Registre légal des écritures comptables

## 📥 Modules consommés (READ-ONLY)

| Module | Rôle | Données consommées |
|--------|------|-------------------|
| Paramètres | Cadre normatif | Plans comptables, états, périodes, cadres fiscaux |
| Gestion des Tiers | Référentiel classe 4 | Clients, fournisseurs, autres tiers |
| Précomptabilité | Pièces justificatives | Pièces qualifiées, références documentaires |
| Vente | Faits commerciaux | Chiffre d'affaires, produits, encaissements |
| Banque | Flux financiers | Relevés bancaires, virements, rapprochements |
| Caisse | Trésorerie espèces | Mouvements, fonds de caisse, opérations |
| Immobilisation | Actifs durables | Amortissements, cessions, valeurs nettes |
| Stock | Biens en stock | Valorisations, variations, mouvements |
| COUTFLEX | Coûts et charges | Structure de coûts, répartitions |
| Budget | Prévisionnel | Références budgétaires, écarts |

## 📤 Modules consommateurs (READ-ONLY)

**AUCUN**

La Comptabilité Générale ne produit aucune donnée pour d'autres modules.

Elle est **terminale** dans l'architecture SPOFE.

## 🚫 Dépendances sortantes

**AUCUNE**

La Comptabilité Générale n'écrit jamais dans un autre module.

## 🔒 Règles d'interaction

### Règle 1 — READ-ONLY Absolu
- Tous les modules consomment la Comptabilité en lecture seule
- Aucun module ne peut modifier une écriture comptable
- Les états financiers sont en consultation uniquement

### Règle 2 — Guardian Unique
- Seul le Guardian Comptabilité peut créer des écritures
- Aucun module ne peut écrire directement dans la Comptabilité
- Toute écriture doit passer par la validation du Guardian

### Règle 3 — Référenciation Obligatoire
- Chaque écriture doit référencer sa source module
- Les pièces justificatives doivent être liées
- Les tiers doivent être validés dans leur module dédié

### Règle 4 — Immutabilité
- Les écritures validées sont immuables
- Les corrections se font par contre-passation
- L'historique ne peut être altéré

## 🔄 Flux d'information

```text
Modules Métiers ──► Précomptabilité ──► Guardian Comptabilité ──► Écritures Comptables
      │                    │                      │
      ▼                    ▼                      ▼
  Tiers, Vente,         Pièces             Validation P0
  Banque, Caisse,       Qualifiées          Conformité
  Stock, etc.           Justificatives      Traçabilité
```

## 🛡️ Garanties SPOFE

### Garantie 1 — Non-rétroaction
- La Comptabilité n'influence jamais les modules amont
- Les écritures comptables ne modifient pas les opérations
- Les états financiers sont consultatifs

### Garantie 2 — Intégrité
- Les données sources sont conservées intactes
- Les références externes sont maintenues
- La chaîne de traçabilité est préservée

### Garantie 3 — Performance
- La lecture des données comptables n'impacte pas les modules sources
- Les états financiers sont générés à partir de copies
- Les consultations sont asynchrones

## 📋 Validation des dépendances

### Check obligatoire avant toute évolution

- [ ] La nouvelle dépendance est READ-ONLY
- [ ] Elle ne crée pas de cycle de dépendances
- [ ] Elle respecte le positionnement terminal
- [ ] Elle maintient l'immutabilité des écritures
- [ ] Elle préserve la traçabilité complète

## 🔧 Implémentation technique

### Interfaces de lecture
- **Query API** : GET uniquement sur les états financiers
- **Export API** : Extraction formatée des écritures
- **Reference API** : Consultation des références croisées

### Contraintes d'accès
- **Timeout** : 30s maximum par requête
- **Pagination** : 1000 écritures maximum par page
- **Cache** : 5 minutes pour les états financiers

## 📌 Statut

**✅ FINAL — AUDITABLE**

Toute modification de dépendance nécessite :
- Une nouvelle version du module
- Validation constitutionnelle complète
- BUILD_PROOF systématique
