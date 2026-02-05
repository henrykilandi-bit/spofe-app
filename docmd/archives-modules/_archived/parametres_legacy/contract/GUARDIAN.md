# GUARDIAN.md
Module Paramètres — Constitution Métier

Ce document définit les invariants absolus du module Paramètres.  
Ils sont non négociables, vérifiables, et protégés par AST + tests P0.

---

## INVARIANTS

- G51: **Passivité absolue** - Le module Paramètres ne déclenche aucun effet, aucun calcul, aucune action

- G52: **Déclaratif uniquement** - Toutes les données gérées par Paramètres sont déclaratives, non dérivées, non calculées, non conditionnelles

- G53: **Aucune logique métier** - Aucune règle métier, workflow, transition d'état ou automatisation ne peut exister dans Paramètres

- G54: **Read-only inter-modules** - Les autres modules ne peuvent consommer Paramètres qu'en lecture seule, aucune écriture externe n'est autorisée

- G55: **Append-only** - Toute évolution des paramètres crée une nouvelle version, ne modifie jamais une version existante, et est historisée

- G56: **Version explicite** - Chaque cadre Paramètres possède un identifiant de version, une date d'entrée en vigueur, et un statut (ACTIVE / DEPRECATED)

- G57: **États normés transverses** - Les états et statuts définis dans Paramètres sont uniques, normés, et partagés par tous les modules. Aucun module ne peut inventer un état sans équivalent normé

- G58: **Catalogue documentaire passif** - Le catalogue des types de documents déclare l'existence des documents, n'induit aucun comportement, n'impose aucune obligation

- G59: **Neutralité métier** - Paramètres ne privilégie aucun module métier, aucun secteur, aucune logique opérationnelle

- G60: **Indépendance temporelle** - Paramètres ne dépend pas du temps réel, d'événements, ou d'ordonnancement

- G61: **Auditabilité totale** - Toute information exposée par Paramètres est traçable, explicable, et audit-ready

- G62: **Prééminence constitutionnelle** - En cas de conflit, Paramètres définit le cadre, les modules métiers s'y conforment, le Guardian métier tranche

---

## 📌 Statut : ✅ FINAL — INVARIANTS P0

Ces invariants sont vérifiés automatiquement par :
- Tests unitaires du module Paramètres
- Tests d'intégration avec repository
- Validation contractuelle SPOFE
- Tests de neutralité et passivité