# MISE À JOUR GOUVERNANCE SPOFE

## �️ NOUVEAU CONTRAT FONDATEUR

**Contrat :** `CHARTE_SPOFE_REFERENTIEL_COMPTABLE.md`  
**Niveau :** P0 - GOUVERNANCE FONDATRICE  
**Statut :** ACTIF  
**Date d'application :** 2026-02-03  

### Impact Majeur
- 🔹 **OHADA** défini comme référentiel par défaut
- 🔹 **PCG/IFRS** traités comme extensions via adapters
- 🔹 **Neutralité économique** du cœur SPOFE garantie
- 🔹 **Séparation stricte** faits économiques / interprétation comptable

## �🆕 NOUVEAU CONTRAT NORMATIF

**Contrat :** `TEMPLATE_TESTS_SYSTEME_SPOFE_P0.md`  
**Niveau :** P0 (bloquant)  
**Statut :** ACTIF  
**Date d'application :** 2026-02-03  

### Impact sur BUILD_PROOF
- ✅ Tests Guardian → Toujours validés
- ✅ Tests System → Doivent respecter ce template
- ❌ Tests Integration → EXCLUS du BUILD_PROOF global
- ❌ Tests Legacy → Isolés

### Règles Appliquées au Module `gestion-tiers`

Le module gestion-tiers a été mis en conformité avec ce contrat :

1. **✅ Builders Guardian-Compliant** → Implémentés
   - `TierTestBuilder.ts`
   - `SystemTestContext.ts`

2. **✅ Tests System** → Conformes P0
   - `guardian-compliant.test.ts`
   - Respect des invariants Guardian

3. **✅ Isolation Legacy** → Tests non conformes isolés
   - `test/legacy/non-guardian-compliant.test.ts`

4. **✅ Architecture Respectée**
   - Pas d'accès direct repository
   - Passage obligatoire par Guardian
   - Données Guardian-compliant

### Effet sur BUILD_PROOF Global

Ce contrat devient **référence opposable** pour tous les modules SPOFE.
Tout test système non conforme invalidera le BUILD_PROOF global.

---
**SPOFE Governance P0 — Contrat officiel activé**