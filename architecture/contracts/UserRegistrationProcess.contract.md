# 📜 CONTRAT DE PROCESSUS SILC
UserRegistrationProcess

**Nom du document**

UserRegistrationProcess.contract.md

**Classement officiel**

architecture/contracts/UserRegistrationProcess.contract.md

**Type : Contrat de processus SILC**
**Statut : CANONIQUE**
**Version : 1.0**
**Projet : SPOFE**
**Portée : Admission des identités humaines**

---

## ⚠️ AVERTISSEMENT CONTRACTUEL

Le présent contrat définit l'unique autorité habilitée à admettre une identité humaine comme User reconnu dans le système SPOFE.

Il est :

- normatif
- opposable
- exécutable via le SILC Guardian
- supérieur à toute convention ou implémentation

**Toute création de User hors de ce processus constitue une violation contractuelle SILC bloquante.**

---

## 🧭 ARTICLE 0 — OBJET DU PROCESSUS

Le processus UserRegistration définit les conditions, règles et garanties selon lesquelles une personne peut être admise comme User dans SPOFE.

Il ne définit :

- ni des droits
- ni des rôles
- ni des appartenances
- ni des permissions

**📌 Il définit uniquement l'existence reconnue d'une identité.**

---

## 🧱 ARTICLE 1 — NATURE DU PROCESSUS

UserRegistration est un acte gouverné d'admission.

Il ne s'agit pas :

- d'une création technique
- d'un endpoint HTTP
- d'un service
- d'un cas d'usage CRUD

**📌 L'admission d'un User est une décision, pas une opération.**

---

## 🧑 ARTICLE 2 — ACTEURS CONCEPTUELS

### 2.1 Person
Identité humaine externe au système, non reconnue comme User.

### 2.2 User
Identité admise et reconnue par SPOFE.

### 2.3 Système SPOFE
Autorité décisionnaire appliquant ce contrat.

---

## 🧾 ARTICLE 3 — ÉTAT INITIAL GARANTI

Avant l'exécution du processus :

- la personne n'est pas User
- aucune identité User n'existe pour :
  - l'email
  - l'identifiant externe
- aucun pouvoir n'est associé

**📌 Toute tentative d'admission multiple est interdite.**

---

## 🧾 ARTICLE 4 — INTENTION D'INSCRIPTION

Le processus ne peut être déclenché que par une intention explicite :

- exprimée par la personne concernée
- transmise via un DTO contractuel dédié
- traçable et auditée

**📌 Aucune inscription implicite n'est autorisée.**

---

## 🧠 ARTICLE 5 — PRÉ-CONDITIONS CONTRACTUELLES

Le processus doit vérifier :

- l'unicité de l'identité (email, identifiant)
- la conformité aux règles légales applicables
- l'absence d'interdiction explicite
- la complétude des données requises

**📌 Toute pré-condition non satisfaite entraîne un refus explicite.**

---

## ⚖️ ARTICLE 6 — DÉCISION D'ADMISSION

Le processus produit une et une seule décision :

- ACCEPTÉ
- REFUSÉ
- EN ATTENTE (si validation ultérieure requise)

La décision :

- est explicite
- est justifiée
- est auditée

**📌 Aucune décision implicite n'est autorisée.**

---

## 🧱 ARTICLE 7 — ÉTAT INITIAL DU USER

En cas d'acceptation :

Le User admis :

- existe en tant qu'entité User
- ne possède aucun rôle
- n'est lié à aucune Company
- ne dispose d'aucun pouvoir
- n'est associé à aucun Context

**📌 Le User est neutre par défaut.**

---

## 🚫 ARTICLE 8 — INTERDICTIONS ABSOLUES

Le processus UserRegistration ne peut en aucun cas :

- attribuer un rôle
- créer un UserRole
- rattacher à une Company
- accorder un accès
- définir une permission

**📌 Toute tentative constitue une violation contractuelle.**

---

## 🔁 ARTICLE 9 — DÉLÉGATION D'EXÉCUTION

Le processus peut :

- ordonner la création technique du User
- ordonner l'envoi de notifications
- produire des événements techniques

Mais :

- n'exécute pas directement
- ne persiste pas lui-même
- ne communique pas avec l'infrastructure

**📌 Décision ≠ Exécution.**

---

## 📊 ARTICLE 10 — TRAÇABILITÉ

Toute exécution du processus doit produire :

- une trace d'intention
- une trace de décision
- une justification
- un horodatage

**📌 L'admission d'un User est un fait auditable.**

---

## 🧾 ARTICLE 11 — ÉTAT FINAL GARANTI

Après exécution :

- soit le User n'existe pas
- soit le User existe sans aucun pouvoir

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
