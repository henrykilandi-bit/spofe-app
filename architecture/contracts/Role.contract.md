# 📜 CONTRAT SILC CANONIQUE — Role

Projet : SPOFE  
Type : Contrat d'architecture (SILC)  
Version : v1.2  
Statut : VALIDÉ  
Date de validation : 28/01/2026  

---

⚠️ **AVERTISSEMENT ARCHITECTURAL**

Ce document est une SOURCE DE VÉRITÉ ARCHITECTURALE.

Toute implémentation technique liée aux rôles DOIT respecter ce contrat.

Toute divergence rend l'implémentation NON CONFORME SILC.

Toute évolution doit être explicitement validée avant implémentation.

---

🧭 **ARTICLE 0 — NATURE DU ROLE**

**Définition stricte**

Un Role est une autorisation abstraite, définie au niveau du système SPOFE,
qui autorise l'exécution d'actions,
sans porter d'identité,
sans porter de contexte,
sans exécuter d'action propre.

📌 Le Role n'agit pas.
📌 Le Role n'est pas une personne.
📌 Le Role autorise, il ne décide pas.

---

❌ **ARTICLE 1 — CE QUE LE ROLE N'EST PAS**

Un Role :

❌ n'est pas un User
❌ n'est pas un groupe
❌ n'est pas une entreprise
❌ n'est pas un contexte d'exécution
❌ n'est pas une permission technique détaillée
❌ ne contient aucune logique métier
❌ n'exécute aucune action

👉 Toute implémentation violant ces principes est non conforme.

---

🔗 **ARTICLE 2 — RELATION AVEC LE USER**

**Règle fondamentale**

❝ Un User peut exister sans Role.
Un Role n'a aucun effet tant qu'il n'est pas attribué à un User. ❞

**Conséquences :**

- l'existence du Role est indépendante des Users
- l'attribution est une relation externe
- le retrait du Role :
  - supprime le pouvoir
  - ne supprime jamais l'identité

---

🧬 **ARTICLE 3 — EXISTENCE SYSTÈME DU ROLE**

**3.1 Existence indépendante**

Un Role :
- existe dans le système avant toute attribution
- peut exister :
  - sans être utilisé
  - sans être attribué
- est déclaré, jamais généré dynamiquement

📌 Les Roles sont des décisions d'architecture, pas des données utilisateur.

**3.2 Gouvernance**

La création d'un Role :
- relève d'une décision plateforme
- est réalisée par :
  - configuration système
  - ou administrateur plateforme autorisé

❌ Un User métier ne peut jamais créer un Role.

---

🔄 **ARTICLE 4 — CYCLE DE VIE DU ROLE**

**4.1 Création**

- Création explicite
- Nom et identité fonctionnelle définis
- Le Role est inactif ou actif selon décision initiale

**4.2 Activation / Désactivation**

Un Role peut être :
- actif → attribuable
- inactif → non attribuable

La désactivation :
- ne supprime pas le Role
- empêche toute nouvelle attribution
- préserve l'audit historique

**4.3 Suppression**

❌ La suppression physique est interdite par défaut

Un Role utilisé doit :
- être désactivé
- éventuellement archivé

📌 L'historique des autorisations doit rester traçable.

---

🗄️ **ARTICLE 5 — PERSISTANCE DU ROLE**

**5.1 Table canonique**

Nom de table : roles
Type : table de référence (catalogue d'autorisations)

Le contenu de roles est :
- stable
- faiblement volumétrique
- gouverné
- non contextuel

**5.2 Champs contractuels**

| Champ | Type | Null | Description |
|-------|------|------|-------------|
| id | INT | ❌ | Identifiant technique |
| code | VARCHAR(100) | ❌ | Identité fonctionnelle |
| label | VARCHAR(255) | ❌ | Libellé humain |
| description | TEXT | ✅ | Description |
| is_active | BOOLEAN | ❌ | Activation |
| created_at | DATETIME | ❌ | SILC |
| updated_at | DATETIME | ❌ | SILC |

📌 Aucun champ de contexte ou d'usage n'est autorisé.

---

🧠 **ARTICLE 6 — IDENTITÉ FONCTIONNELLE & UNICITÉ**

**6.1 Rôle du code**

Le champ code est :
- l'identité fonctionnelle du Role
- utilisé par les règles d'autorisation
- lisible et explicite

**Exemples :**
- SUPER_ADMIN_PLATFORM
- GROUP_ADMIN
- COMPANY_ADMIN
- COMPANY_USER

**6.2 Unicité globale**

❝ Le code d'un Role est unique globalement dans SPOFE. ❞

- aucun doublon autorisé
- indépendamment des groupes ou entreprises
- valable pour toute la durée de vie du système

**6.3 Immutabilité**

Une fois créé :
- id → immuable
- code → immuable

Si la signification change :
❌ on ne modifie pas le Role
✅ on crée un nouveau Role

---

🚫 **ARTICLE 7 — INTERDICTIONS EXPLICITES**

Un Role :

❌ ne stocke aucun User
❌ ne stocke aucun contexte
❌ ne stocke aucune permission fine
❌ ne définit aucune hiérarchie
❌ ne contient aucune logique métier
❌ n'est jamais évalué seul

👉 Toute logique d'autorisation appartient à des services dédiés.

---

🔐 **ARTICLE 8 — RÈGLES DE CONFORMITÉ SILC**

Un Role est CONFORME SILC si :

- Il est défini dans la table roles
- Son code est unique et immuable
- Il n'est lié à aucun contexte
- Il n'exécute aucune logique
- Il n'est attribuable que s'il est actif

👉 Une seule violation ⇒ NON CONFORME

---

🔄 **ARTICLE 9 — ÉVOLUTION DU CONTRAT**

Toute évolution du Role DOIT :

- Modifier ce contrat
- Être validée explicitement
- Être implémentée après validation
- Ne jamais casser les invariants existants

---

