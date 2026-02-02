# 📜 CONTRAT DE PROCESSUS SILC
UserRoleAssignmentProcess

**Nom du document**

UserRoleAssignmentProcess.contract.md

**Classement officiel**

architecture/contracts/UserRoleAssignmentProcess.contract.md

**Type : Contrat de processus SILC**
**Statut : CANONIQUE**
**Version : 1.0**
**Projet : SPOFE**
**Portée : Attribution de pouvoir (rôles)**

---

## ⚠️ AVERTISSEMENT CONTRACTUEL

Le présent contrat définit l'unique autorité habilitée à attribuer un rôle à un User dans un Context donné.

Il est :

- normatif
- opposable
- supérieur à toute convention ou implémentation
- exécutable via le SILC Guardian

**Toute création, modification ou suppression de relation UserRole en dehors de ce processus constitue une violation contractuelle SILC bloquante.**

---

## 🧭 ARTICLE 0 — OBJET DU PROCESSUS

Le processus UserRoleAssignment définit les règles, conditions et garanties selon lesquelles un User peut recevoir un rôle explicite dans un contexte précis.

**📌 Ce processus est le seul point de création légitime du pouvoir dans SPOFE.**

---

## 🧱 ARTICLE 1 — NATURE DU PROCESSUS

UserRoleAssignment est un acte gouverné de distribution de pouvoir.

Il ne s'agit pas :

- d'une opération CRUD
- d'un service d'administration
- d'un simple lien technique
- d'un formulaire back-office

**📌 L'attribution d'un rôle est une décision politique, pas une opération technique.**

---

## 🧑 ARTICLE 2 — ACTEURS CONCEPTUELS

### 2.1 User
Identité reconnue par SPOFE, initialement neutre.

### 2.2 Role
Définition contractuelle d'un pouvoir.

### 2.3 Context
Cadre contractuel dans lequel un rôle s'exerce.

### 2.4 AssigningAuthority
User ou système disposant du droit contractuel d'attribuer un rôle.

---

## 🧾 ARTICLE 3 — ÉTAT INITIAL GARANTI

Avant l'exécution du processus :

Le User ciblé :

- existe
- ne possède aucun rôle implicite

Le Role :

- existe contractuellement

Le Context :

- existe
- est valide

Aucune relation UserRole identique n'existe déjà

**📌 Toute duplication ou ambiguïté est interdite.**

---

## 🧾 ARTICLE 4 — INTENTION D'ATTRIBUTION

Le processus ne peut être déclenché que par :

- une intention explicite
- formulée par une autorité légitime
- transmise via un DTO contractuel dédié
- accompagnée d'une justification obligatoire

**📌 Aucune attribution implicite ou automatique n'est autorisée.**

---

## 🧠 ARTICLE 5 — PRÉ-CONDITIONS CONTRACTUELLES

Le processus doit vérifier :

- la légitimité de l'AssigningAuthority
- la compatibilité User / Role / Context
- l'absence de conflit de pouvoir
- le respect des règles de séparation (ex. auto-attribution interdite)

**📌 Toute pré-condition non satisfaite entraîne un refus explicite.**

---

## ⚖️ ARTICLE 6 — DÉCISION D'ATTRIBUTION

Le processus produit une décision explicite :

- ATTRIBUTION ACCORDÉE
- ATTRIBUTION REFUSÉE

La décision :

- est justifiée
- est auditée
- est traçable

**📌 Aucune attribution implicite n'est autorisée.**

---

## 🧱 ARTICLE 7 — CRÉATION DE LA RELATION USERROLE

En cas d'attribution accordée :

- une relation UserRole est créée
- elle lie :
  - un User
  - un Role
  - un Context
- elle est :
  - explicite
  - traçable
  - révocable

**📌 Toute relation UserRole est un fait gouverné.**

---

## 🚫 ARTICLE 8 — INTERDICTIONS ABSOLUES

Le processus UserRoleAssignment ne peut en aucun cas :

- attribuer un rôle hors contexte
- attribuer plusieurs rôles implicites
- modifier les permissions d'un rôle
- créer un rôle
- créer un User
- créer une Company

**📌 Toute violation est une non-conformité SILC.**

---

## 🔁 ARTICLE 9 — DÉLÉGATION D'EXÉCUTION

Le processus peut :

- ordonner la création technique de UserRole
- produire des événements
- déclencher des notifications

Mais :

- n'exécute pas directement
- ne persiste pas lui-même
- ne communique pas directement avec l'infrastructure

**📌 Décision ≠ Exécution.**

---

## 📊 ARTICLE 10 — TRAÇABILITÉ ET AUDIT

Toute attribution doit produire :

- l'identité de l'AssigningAuthority
- la justification de l'attribution
- la date et l'heure
- le contexte concerné

**📌 Le pouvoir attribué doit être audit-able a posteriori.**

---

## 🧾 ARTICLE 11 — ÉTAT FINAL GARANTI

Après exécution :

- soit aucun pouvoir n'est attribué
- soit le User dispose :
  - d'un rôle explicite
  - dans un contexte explicite
  - traçable
  - révocable

Aucun état intermédiaire ambigu n'est autorisé.

---

## 🔐 ARTICLE 12 — OPPOSABILITÉ

Le présent contrat est :

- exécutable par le SILC Guardian
- opposable à toute implémentation
- référencé dans la conformité SILC

**Toute implémentation qui viole ce contrat est non conforme SILC.**

---

**FIN DU CONTRAT**
