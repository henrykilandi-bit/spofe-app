# SPOFE_RULES.md

**Version:** 1.1.0  
**Statut:** OFFICIEL — Normatif (P0)  
**Autorité:** Gouvernance SPOFE  
**Date:** 2026-02-03

> **Ce document contient les règles officielles SPOFE P0. Toute violation est non-conforme.**

---

## 📜 RÈGLE SPOFE — ORGANISATION PHYSIQUE DES MODULES

### Principe fondamental

Tous les modules métiers du système SPOFE doivent être situés **exclusivement** dans le répertoire :

```
cascade/modules/<module-name>/
```

**Aucun autre emplacement n'est autorisé pour un module métier.**

---

### 📦 Modules concernés

Sont considérés comme modules métiers SPOFE :

| Module | Statut |
|--------|--------|
| Budget / Budgeting | ✅ Actif |
| Cost-Structure (COUTFLEX) | ✅ Actif |
| Immobilisation | ✅ Actif (Golden Module) |
| Stock | 🔄 En cours |
| Ventes | 📋 Planifié |
| Comptabilité | 📋 Planifié |
| RH | 📋 Planifié |
| Tout module futur | 📋 Selon roadmap |

---

### 📋 Règles associées

Chaque module dispose obligatoirement de :

- ✅ **Périmètre contractuel** (`SCOPE.md`)
- ✅ **Architecture** (`ARCHITECTURE.md`)
- ✅ **Contrat fonctionnel** (`CONTRACT.md`)
- ✅ **BUILD_PROOF signé** (`BUILD_PROOF.md` + `BUILD_PROOF.sig`)
- ✅ **Guardian** (`GUARDIAN.md`)
- ✅ **Tests** (`tests/`)

---

### 🚫 Interdictions absolues

Les modules ne doivent **JAMAIS** être :

- ❌ **Imbriqués** les uns dans les autres
- ❌ **Placés à la racine** du projet
- ❌ **Placés dans un dossier technique générique** (ex: `src/modules/`, `lib/`)

---

### ⚙️ Outil officiel

La création d'un module doit obligatoirement passer par :

```bash
node tools/spofe-new-module.js <module-name>
```

**Toute création manuelle d'un module est considérée comme non conforme SPOFE.**

---

### ⚖️ Autorité

En cas de divergence entre :
- La structure du dépôt
- Et cette règle

👉 **Cette règle fait foi.**

---

## 📊 Validation

| Critère | Méthode de validation |
|---------|----------------------|
| Emplacement correct | `spofe-validate-module.ts` |
| Structure conforme | `TEMPLATE_MODULE_SPOFE.md` |
| BUILD_PROOF présent | CI/CD Pipeline |
| BUILD_PROOF signé | CI/CD Pipeline |

---

## 🔗 Références

- Template module : `spofe/governance/TEMPLATE_MODULE_SPOFE.md`
- Validation : `spofe/tools/validate-module/spofe-validate-module.ts`
- Golden Module : `cascade/modules/immobilisation/`

---

**Document officiel SPOFE — Non modifiable sans processus gouvernance**  
_Dernière mise à jour : 2026-02-02_
