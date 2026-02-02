# 📜 CONVENTION DE NOMMAGE SILC v2 — SPOFE

Projet : SPOFE  
Type : Convention architecturale normative  
Version : v2.0  
Statut : PROPOSITION (en cours de rédaction)  
Portée : Backend, Frontend, Base de données, Documentation  

---

⚠️ **AVERTISSEMENT ARCHITECTURAL**

Cette convention de nommage est une conséquence directe de la contractualisation SILC.

Elle remplace toute convention précédente  
Elle est normative  
Elle est opposable à toute implémentation  

Toute violation est considérée comme une non-conformité SILC

📌 On ne nomme plus selon la technique, mais selon le contrat.

---

🧭 **ARTICLE 0 — FONDEMENT CONTRACTUEL**

La présente convention de nommage SILC v2 est une conséquence directe
des contrats d'architecture SILC validés pour SPOFE.

Elle ne définit aucun concept nouveau.  
Elle formalise uniquement la traduction nominale et structurelle
des concepts contractuels suivants :

- User
- Role
- UserRole
- Context
- Group
- Company
- CompanyOnboardingProcess

Toute règle de nommage découle exclusivement de la nature,
des responsabilités et des interdictions définies dans ces contrats.

📌 En cas de contradiction entre un nom et un contrat SILC,
le contrat fait foi et le nom est considéré comme non conforme.

👉 Par conséquent :
- la convention est subordonnée aux contrats
- elle ne peut pas dériver
- elle devient opposable et vérifiable

---

🧭 **ARTICLE 1 — PRINCIPES FONDAMENTAUX**

**1.1 Principe de vérité contractuelle**

❝ Tout nom doit refléter exactement un concept contractuel validé. ❞

Un nom :
- ne doit jamais être ambigu
- ne doit jamais masquer la nature réelle d'un élément
- doit permettre de comprendre ce que c'est, sans lire le code

**1.2 Principe de séparation stricte**

Les noms doivent permettre de distinguer clairement :

| Catégorie | Nature |
|-----------|--------|
| Entity | Réalité du domaine |
| Relation | Lien contractuel |
| Process | Enchaînement gouverné |
| DTO | Projection / échange |
| Service | Exécution technique |
| Repository | Accès aux données |

👉 Un même fichier ne peut jamais mélanger plusieurs natures.

**1.3 Principe de non-implicite**

Il est strictement interdit :
- d'inférer un rôle depuis un nom
- d'inférer un pouvoir depuis un type
- d'inférer une autorité depuis une structure

📌 Le nom n'accorde jamais un droit.

---

🧱 **ARTICLE 2 — NOMMAGE DES ENTITÉS (Entities)**

**2.1 Règle générale**

Nom : PascalCase  
Suffixe obligatoire : .entity

**2.2 Exemples canoniques**

```
User.entity.ts
Company.entity.ts
Group.entity.ts
Context.entity.ts
Role.entity.ts
```

**2.3 Interdictions**

❌ UserModel  
❌ CompanyTable  
❌ ContextData

📌 Une entité est un concept contractuel, jamais une projection technique.

---

🔗 **ARTICLE 3 — NOMMAGE DES RELATIONS**

**3.1 Règle générale**

Nom = SourceCible  
Suffixe obligatoire : .relation

**3.2 Exemples**

```
UserRole.relation.ts
CompanyGroup.relation.ts
CompanyContext.relation.ts
GroupContext.relation.ts
```

📌 L'ordre a un sens : source → cible.

**3.3 Interdictions**

❌ UserHasRole  
❌ RoleAssignment  
❌ PivotUserRole

👉 On nomme la relation contractuelle, jamais l'opération.

---

🔁 **ARTICLE 4 — NOMMAGE DES PROCESSUS (CRITIQUE)**

**4.1 Principe**

❝ Un processus est un acte gouverné, pas une ressource. ❞

**4.2 Règle générale**

Nom = Sujet + Action + Qualificatif  
Suffixe obligatoire : .process

**4.3 Exemples SPOFE**

```
CompanyOnboarding.process.ts
RoleBootstrap.process.ts
UserRoleRevocation.process.ts
CompanySuspension.process.ts
```

📌 Les processus reflètent strictement les contrats de processus SILC.

**4.4 Interdictions**

❌ CreateCompany  
❌ OnboardService  
❌ CompanyWorkflow

👉 Ces noms masquent la gouvernance et sont non conformes.

---

📦 **ARTICLE 5 — NOMMAGE DES DTO**

**5.1 Principe**

❝ Un DTO est une projection contractuelle, jamais un modèle métier. ❞

**5.2 Règle générale**

Nom = Concept + Vue + Dto

**5.3 Exemples**

```
CompanyOnboardingRequestDto
CompanyValidationDecisionDto
UserRegistrationDto
UserRoleAssignmentDto
```

**5.4 Interdictions**

❌ CreateCompanyDto  
❌ CompanyInput  
❌ Payload

📌 Le nom doit expliciter le contexte d'échange.

---

🧰 **ARTICLE 6 — SERVICES & REPOSITORIES**

**6.1 Services (exécution technique)**

Nom = Concept + Service

Exemples :
```
CompanyService
UserService
ContextService
```

📌 Un service n'est jamais un processus.

**6.2 Repositories (accès aux données)**

Nom = Concept + Repository

Exemples :
```
CompanyRepository
UserRepository
UserRoleRepository
```

---

🗄️ **ARTICLE 7 — BASE DE DONNÉES (MySQL)**

**7.1 Tables**

Nom = snake_case pluriel

Exemples :
```
users
companies
groups
contexts
user_roles
```

**7.2 Colonnes**

Nom = snake_case

Exemples :
```
created_at
updated_at
deleted_at
company_id
```

📌 Alignement strict avec les entités contractuelles.

---

📁 **ARTICLE 8 — STRUCTURE DES DOSSIERS (CIBLE)**

```
src/
  domain/
    entities/
    relations/
    processes/
  application/
    services/
    dtos/
  infrastructure/
    repositories/
    persistence/
```

👉 La structure raconte l'architecture.

---

🗃️ **ARTICLE 9 — STATUT DE L'ANCIENNE CONVENTION**

L'ancienne convention est :

❌ obsolète  
❌ non normative  
✅ archivée

Chemin recommandé :
```
architecture/archives/conventions/
  NAMING_CONVENTIONS_PRE_SILC.md
```

---

🔐 **ARTICLE 10 — RÈGLE DE NON-RÉGRESSION**

❝ Toute nouvelle implémentation doit respecter la convention SILC v2. ❞

Toute violation :
- constitue un défaut architectural
- doit être corrigée avant merge

📌 La dette n'est plus autorisée.
