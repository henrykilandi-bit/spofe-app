# 📄 GUARDIAN.md

# Module Paramètres — Constitution Métier

Ce document définit les invariants absolus du module Paramètres.
Ils sont non négociables, vérifiables, et protégés par AST + tests P0.

## INVARIANTS

- PA01 : Passivité absolue - aucun effet, calcul ou action
- PA02 : Déclaratif uniquement - données non dérivées
- PA03 : Aucune logique métier ou workflow
- PA04 : Read-only inter-modules
- PA05 : Append-only - nouvelle version seulement
- PA06 : Version explicite avec date et statut
- PA07 : États normés transverses uniques
- PA08 : Catalogue documentaire passif
- PA09 : Neutralité métier absolue
- PA10 : Indépendance temporelle
- PA11 : Auditabilité totale
- PA12 : Prééminence constitutionnelle

📌 Statut : ✅ FINAL — INVARIANTS P0
