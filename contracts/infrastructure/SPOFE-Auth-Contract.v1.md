# SPOFE Auth Contract

**Contrat d’authentification & d’identité (Infrastructure)**

**Version : 1.0.0**  
**Statut : OFFICIEL – NORMATIF**  
**Portée : Système SPOFE (Frontend + Backend)**  
**Nature : Infrastructure (non métier)**

---

## 0️⃣ Préambule (intention)
Ce document définit le contrat d’authentification SPOFE.

Il précise :
- ce que l’authentification fournit
- ce qu’elle ne fait jamais
- comment l’identité circule dans le système
- où s’arrête strictement sa responsabilité

👉 Ce contrat est volontairement minimal et strict.

---

## 1️⃣ Définition
### 1.1 Authentification SPOFE
Dans SPOFE, l’authentification est un mécanisme d’infrastructure permettant de :
- identifier l’origine d’une requête
- transporter une identité vérifiable
- sécuriser l’accès au système

👉 Elle ne définit aucune règle métier.

### 1.2 Non-définition explicite
L’authentification n’est pas :
- un module métier
- un module frontend SPOFE-clean
- un bounded context
- un mécanisme d’autorité
- un système de décision

---

## 2️⃣ Principe fondamental (non négociable)
**Identité ≠ Autorité**

L’authentification :
- fournit une identité
- ne fournit jamais une autorité

Toute décision est :
- métier
- explicite
- prise par le backend SPOFE (Guardian + Domain)

---

## 3️⃣ Responsabilités autorisées
### 3.1 Ce que l’authentification FAIT
- authentifier un utilisateur ou un système
- produire un token d’identité
- vérifier la validité cryptographique du token
- exposer une identité technique minimale

### 3.2 Ce que l’authentification NE FAIT JAMAIS
- autoriser une action métier
- bloquer une Command métier
- filtrer un read-model métier
- interpréter un rôle métier
- inférer une permission
- court-circuiter Guardian

👉 Toute tentative dans ce sens est non conforme.

---

## 4️⃣ Contrat côté frontend
### 4.1 Rôle du frontend
Le frontend SPOFE :
- obtient un token d’authentification
- stocke ce token (mécanisme technique)
- transmet le token tel quel au backend
- n’interprète pas son contenu métier

### 4.2 Interdictions frontend
Le frontend NE DOIT PAS :
- décider d’une autorisation
- masquer une action en fonction d’un rôle
- implémenter une logique “si admin alors…”
- corriger une décision backend

👉 Le frontend ne sait pas ce qui est autorisé.

### 4.3 Intégration technique (frontend)
- l’authentification vit dans `frontend/core/auth`
- elle est hors modules frontend SPOFE-clean
- elle n’a pas de `module.manifest.md`
- elle n’émet aucune Command métier
- elle ne consomme aucun read-model métier

---

## 5️⃣ Contrat côté backend
### 5.1 Rôle du backend
Le backend SPOFE :
- valide techniquement le token
- extrait une identité technique
- injecte cette identité dans le contexte d’exécution
- transmet l’identité à Guardian

### 5.2 Règle absolue
Guardian est l’unique autorité décisionnelle.

Le backend :
- ne fait aucune autorisation implicite via l’auth
- ne déduit aucun droit métier automatiquement
- ne court-circuite jamais les invariants

---

## 6️⃣ Format de l’identité (minimaliste)
L’identité transmise DOIT être minimale.

Exemple conceptuel :
```json
{
  "subject": "user-123",
  "issuer": "spofe-auth",
  "issuedAt": "2026-01-30T10:00:00Z"
}
```

🚫 Interdit :
- permissions métier
- règles métier
- états métier

---

## 7️⃣ Relation avec les autres contrats SPOFE
### 7.1 Frontend–Backend Contract
- l’identité est fournie
- aucune autorité implicite n’est reconnue

### 7.2 Frontend Module Contract
- les modules frontend ignorent l’auth
- toute logique d’autorité est interdite

### 7.3 Kernel SPOFE
- Guardian reçoit l’identité
- Guardian décide ou refuse

---

## 8️⃣ Tests & conformité
Le système DOIT permettre de vérifier que :
- une Command est refusée même si l’utilisateur est authentifié
- l’absence d’auth empêche l’accès technique
- l’auth seule n’autorise jamais une action métier

👉 L’auth est nécessaire, jamais suffisante.

---

## 9️⃣ Gouvernance
- ce contrat est opposable en revue
- toute implémentation contraire est refusée
- aucune exception humaine n’est acceptée

---

## 🔒 Clause finale
Dans SPOFE, l’authentification identifie.  
Elle ne décide jamais.

---

**Emplacement OFFICIEL recommandé**
```
/contracts
├─ frontend-backend/
│  ├─ contract.v1.yaml
│  ├─ rules.v1.md
│  ├─ allowed-commands.v1.json
│  └─ allowed-read-models.v1.json
│
├─ frontend-modules/
│  ├─ SPOFE-Frontend-Module-Contract.v1.md
│  └─ CHANGELOG.md
│
├─ infrastructure/
│  ├─ SPOFE-Auth-Contract.v1.md      👈 ICI
│  └─ CHANGELOG.md
│
└─ README.md
```

👉 Nom exact conseillé :
`contracts/infrastructure/SPOFE-Auth-Contract.v1.md`
