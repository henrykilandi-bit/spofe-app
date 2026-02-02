# CONTRAT SILC CANONIQUE — User

Projet : SPOFE  
Version : v1.1  
Statut : VALIDÉ  Source de vérité unique
Date de validation : 28/01/2026  

---

⚠️ Ce document est une SOURCE DE VÉRITÉ ARCHITECTURALE.  
Toute implémentation qui ne respecte pas ce contrat est NON CONFORME SILC.


🧭 ARTICLE 0 — NATURE DU User (CLARIFIÉE)

**Définition stricte**

Un User est une identité enregistrée dans le système SPOFE.

👉 Rien de plus.

**Ce que le User EST**
- une identité technique et humaine
- un point d’entrée pour l’authentification
- un sujet d’audit (traçabilité)

**Ce que le User N’EST PAS**
❌ un acteur métier par défaut
❌ un créateur de structure (groupe, entreprise)
❌ un porteur de permissions
❌ un décideur fonctionnel

📌 Un User existe même s'il ne peut rien faire.

---

🔄 ARTICLE 1 — CYCLE DE VIE DU User

**1.1 Création (Inscription)**

Un User est créé lorsque :
- il s'enregistre volontairement
- ou qu'il est créé par un administrateur

**À la création :**
- il n'a aucun rôle
- il n'a aucun périmètre
- il n'a aucun droit métier

👉 Il est présent mais neutre.

**1.2 État par défaut**

Un User sans rôle :
- peut s'authentifier
- peut accéder à son profil minimal
- ne peut effectuer AUCUNE action métier

📌 Cet état est normal, voulu et sécurisé.

**1.3 Activation (hors périmètre de ce contrat)**

L'attribution de rôles :
❌ ne fait PAS partie du contrat User
- relève d'autres contrats (Role, Authorization, Context)

👉 Le User n'est jamais modifié pour devenir "acteur".

---

🗄️ ARTICLE 2 — SOURCE DE VÉRITÉ BASE DE DONNÉES

**2.1 Table canonique**

Nom : users
Rôle : table d'identités

**2.2 Champs contractuels**

| Champ | Type | Null | Description |
|-------|------|------|-------------|
| id | INT | ❌ | Identifiant technique |
| email | VARCHAR(255) | ❌ | Identité unique |
| password_hash | VARCHAR(255) | ❌ | Secret (jamais exposé) |
| first_name | VARCHAR(100) | ✅ | Métadonnée |
| last_name | VARCHAR(100) | ✅ | Métadonnée |
| is_active | BOOLEAN | ❌ | Activation technique |
| last_login_at | DATETIME | ✅ | Observation |
| created_at | DATETIME | ❌ | SILC |
| updated_at | DATETIME | ❌ | SILC |
| deleted_at | DATETIME | ✅ | SILC (soft delete) |

📌 Aucun champ métier n'est autorisé ici.

---

🧠 ARTICLE 3 — MODEL (STRUCTURE UNIQUEMENT)

**3.1 Rôle du model**

Le model User :
- décrit la structure de la table users
- expose des relations techniques
- ne porte aucune règle métier

**3.2 Contraintes obligatoires**

Le model DOIT :
- mapper exactement la table
- utiliser :
  - tableName: 'users'
  - underscored: true
  - timestamps: true
  - paranoid: true

**3.3 Interdictions**

Le model User :
❌ ne vérifie pas les rôles
❌ ne décide pas des droits
❌ ne déclenche aucune action métier

---

📦 ARTICLE 4 — DTO (EXPOSITION MINIMALE)

**4.1 Objectif**

Le DTO UserDto expose uniquement l'existence de l'identité.

**4.2 Champs exposés**

| Champ DTO | Source |
|-----------|--------|
| id | users.id |
| email | users.email |
| firstName | users.first_name |
| lastName | users.last_name |
| isActive | users.is_active |
| lastLoginAt | users.last_login_at |
| createdAt | users.created_at |

**4.3 Interdictions absolues**

- password_hash
- toute notion de rôle
- toute notion de contexte
- toute capacité métier

📌 Le DTO confirme l'existence, pas le pouvoir.

---

⚙️ ARTICLE 5 — SERVICES AUTORISÉS (MINIMAUX)

**Services légitimes**

| Service | Rôle |
|---------|------|
| AuthService | Authentification |
| UserService | Gestion de l'identité |
| AuditService | Traçabilité |

👉 Aucun service ne confère de pouvoir au User.

---

🔐 ARTICLE 6 — RÈGLES SILC DE CONFORMITÉ

Un User est CONFORME SILC si :
- La table users existe
- Le model mappe strictement la table
- Le DTO existe et est minimal
- Aucun rôle n'est stocké dans users
- Aucun service ne lui confère de pouvoir métier

👉 Une seule violation = NON CONFORME

---

🚨 ARTICLE 7 — ÉVOLUTION

Toute évolution du User :
- modifie ce contrat
- est validée explicitement
- ne doit jamais introduire de logique métier.
