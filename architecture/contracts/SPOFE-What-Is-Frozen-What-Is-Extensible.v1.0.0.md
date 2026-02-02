# 📘 SPOFE v1.0 — What Is Frozen / What Is Extensible

**Version**: 1.0.0  
**Statut**: OFFICIEL – NORMATIF  
**Date**: 2026-01-30  
**Portée**: Architecture SPOFE v1.0

---

## 0️⃣ Objectif du document

Ce document définit sans ambiguïté :

- **ce qui est figé (Frozen)** dans SPOFE v1.0
- **ce qui est évolutif (Extensible)** sans remise en cause du socle

👉 Il évite toute confusion entre :

- **stabilité architecturale**
- et **évolution fonctionnelle**

---

## 1️⃣ Principe fondamental SPOFE

```
SPOFE est figé par son socle,
extensible par ses modules.

Le gel protège l'architecture.
L'extension porte le métier.
```

---

## 2️⃣ Ce qui est FROZEN en SPOFE v1.0 🧊

Les éléments suivants sont **contractuellement figés**.  
Toute modification nécessite une **nouvelle version majeure**.

### 🧱 2.1 Kernel SPOFE (NON MODIFIABLE)

- **Guardian** (autorité unique)
- **AGA**
- **Modèle Domain / Command / Event**
- **Règle : Identité ≠ Autorité**

👉 Aucun module métier ne modifie le Kernel.

### 🔐 2.2 Security Model v1.0.0 (NON MODIFIABLE)

- Auth = infrastructure uniquement
- Aucun RBAC implicite
- Guardian décide toujours
- Frontend jamais décisionnel

📜 **Référence**:  
`contracts/security/SPOFE-Security-Model.v1.0.0.md`

### 🔌 2.3 Frontend Contract Enforcer v1.0.0 (NON MODIFIABLE)

- API publique (`sendCommand`, `readModel`)
- Mapping erreurs strict :
  - 401 → AUTH_ERROR
  - 403/404/409 → GUARDIAN_ERROR
  - 500+ → SYSTEM_ERROR
- Injection token opaque uniquement

📜 **Référence**:  
`frontend/core/spofe-contract/README.md`

### 🌐 2.4 API Backend SPOFE v1.0.0 (NON MODIFIABLE)

- Endpoints `/commands/*` et `/read/*`
- Sémantique HTTP contractuelle
- Schémas d'erreurs
- Interdiction des breaking changes silencieux

📜 **Référence**:  
`contracts/backend/SPOFE-API.v1.0.0.md`

### 📜 2.5 Contrats SPOFE (NON MODIFIABLES)

- Frontend Module Contract
- Frontend–Backend Contract
- Auth Contract
- Security Model

👉 **Les contrats font foi, pas les implémentations.**

---

## 3️⃣ Ce qui est EXTENSIBLE en SPOFE v1.0 🚀

Les éléments suivants sont **librement extensibles**, sans toucher au socle.

### 🧩 3.1 Modules Métier Backend (EXTENSIBLES)

Chaque module métier peut ajouter :

- nouveaux **aggregates**
- nouvelles **Commands**
- nouveaux **invariants Guardian**
- nouveaux **read-models** (vues SQL)
- nouveaux **endpoints** `/commands/*` et `/read/*`

👉 Tant que :

- les contrats sont respectés
- Guardian reste souverain
- aucune règle du socle n'est modifiée

### 🖥️ 3.2 Modules Frontend SPOFE-clean (EXTENSIBLES)

Chaque module frontend peut :

- consommer de nouveaux read-models
- émettre de nouvelles Commands
- exposer de nouvelles vues UI

👉 Sous conditions strictes :

- dérivé du template officiel
- aucune logique métier
- aucune autorité
- tests contractuels obligatoires

### 📈 3.3 Évolution Fonctionnelle (AUTORISÉE)

- nouveaux workflows métier
- nouveaux cycles de vie
- nouvelles règles Guardian
- nouvelles projections

👉 **Le métier évolue, le socle ne bouge pas.**

---

## 4️⃣ Ce qui est INTERDIT (rappel critique)

Il est **formellement interdit** de :

❌ modifier Guardian pour un besoin métier  
❌ introduire une décision côté frontend  
❌ utiliser l'auth comme autorité  
❌ contourner les contrats  
❌ modifier un comportement gelé sans bump de version  

👉 Toute tentative est :

- refusée en CI
- non intégrable
- non conforme SPOFE

---

## 5️⃣ Lecture rapide (table de synthèse)

| Élément | Statut |
|---------|--------|
| Kernel SPOFE | 🧊 Frozen |
| Security Model | 🧊 Frozen |
| API Backend v1.0.0 | 🧊 Frozen |
| Frontend Contract Enforcer | 🧊 Frozen |
| Contrats | 🧊 Frozen |
| Modules métier backend | 🚀 Extensible |
| Modules frontend SPOFE-clean | 🚀 Extensible |
| Read-models | 🚀 Extensible |
| Commands | 🚀 Extensible |

---

## 6️⃣ Règle finale SPOFE

```
Le socle ne s'adapte pas au métier.
Le métier s'exprime dans des modules.
La stabilité du système prime sur la facilité locale.
```

---

## 🏁 Conclusion

SPOFE v1.0 est :

✅ **architecturalement figé**  
✅ **fonctionnellement extensible**  
✅ **sécurisé par construction**  
✅ **évolutif sans dette**  

👉 **Vous êtes en phase d'implémentation métier, pas de redesign.**

---

**© 2026 SPOFE Team**  
**Document Officiel - Normatif - Opposable**
