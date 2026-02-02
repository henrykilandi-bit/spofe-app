# 📜 CONTRAT DE PROCESSUS SILC
UserRoleRevocationProcess

**Nom du document**

UserRoleRevocationProcess.contract.md

**Classement officiel**

architecture/contracts/UserRoleRevocationProcess.contract.md

**Type : Contrat de processus SILC**
**Statut : CANONIQUE**
**Version : 1.0**
**Projet : SPOFE**
**Portée : Retrait de pouvoir (révocation de rôle)**

---

## ⚠️ AVERTISSEMENT CONTRACTUEL

Le présent contrat définit l'unique autorité habilitée à révoquer un pouvoir précédemment attribué à un User dans un Context donné.

Il est :

- normatif
- opposable
- supérieur à toute convention ou implémentation
- exécutable via le SILC Guardian

**Toute suppression, désactivation ou modification d'une relation UserRole en dehors de ce processus constitue une violation contractuelle SILC bloquante.**

---

## 🧭 ARTICLE 0 — OBJET DU PROCESSUS

Le processus UserRoleRevocation définit les règles, conditions et garanties selon lesquelles un rôle actif peut être retiré explicitement à un User dans un contexte précis.

**📌 Ce processus gouverne la fin du pouvoir, jamais sa suppression technique.**

---

## 🧱 ARTICLE 1 — NATURE DU PROCESSUS

UserRoleRevocation est un acte gouverné de retrait de pouvoir.

Il ne s'agit pas :

- d'une suppression de données
- d'une désactivation technique
- d'une cascade automatique
- d'un effet de bord d'un autre processus

**📌 Révoquer un rôle est une décision explicite, pas une opération technique.**

---

## 🧑 ARTICLE 2 — ACTEURS CONCEPTUELS

### 2.1 User
Identité reconnue par SPOFE, détentrice d'un rôle actif.

### 2.2 Role
Pouvoir contractuel précédemment attribué.

### 2.3 Context
Cadre contractuel dans lequel le rôle s'exerce.

### 2.4 RevokingAuthority
User ou système disposant du droit contractuel de révoquer un pouvoir.

---

## 🧾 ARTICLE 3 — ÉTAT INITIAL GARANTI

Avant l'exécution du processus :

- une relation UserRole existe
- cette relation est :
  - valide
  - active
  - non révoquée
- le User, le Role et le Context existent

**📌 Toute tentative de révocation d'un pouvoir inexistant ou déjà révoqué est interdite.**

---

## 🧾 ARTICLE 4 — INTENTION DE RÉVOCATION

Le processus ne peut être déclenché que par :

- une intention explicite de révocation
- formulée par une RevokingAuthority légitime
- transmise via un DTO contractuel dédié
- accompagnée d'une justification obligatoire

**📌 Aucune révocation implicite ou automatique n'est autorisée.**

---

## 🧠 ARTICLE 5 — PRÉ-CONDITIONS CONTRACTUELLES

Le processus doit vérifier :

- la légitimité de la RevokingAuthority
- que le rôle ciblé est effectivement actif
- que la révocation ne viole pas une règle de gouvernance supérieure
- l'absence d'auto-révocation interdite (si applicable)

**📌 Toute pré-condition non satisfaite entraîne un refus explicite.**

---

## ⚖️ ARTICLE 6 — DÉCISION DE RÉVOCATION

Le processus produit une décision explicite :

- RÉVOCATION ACCORDÉE
- RÉVOCATION REFUSÉE

La décision :

- est justifiée
- est auditée
- est traçable

**📌 Aucune révocation implicite n'est autorisée.**

---

## 🧱 ARTICLE 7 — MARQUAGE DE LA RÉVOCATION

En cas de révocation accordée :

- la relation UserRole :
  - n'est jamais supprimée
  - est marquée comme révoquée
- comporte :
  - une date de révocation (revokedAt)
  - l'identité de la RevokingAuthority
  - la justification associée

**📌 La relation devient inactive mais historisée.**

---

## 🚫 ARTICLE 8 — INTERDICTIONS ABSOLUES

Le processus UserRoleRevocation ne peut en aucun cas :

- supprimer une relation UserRole
- modifier un rôle ou ses permissions
- attribuer un nouveau rôle
- créer ou supprimer un User
- créer ou supprimer un Context ou une Company

**📌 Toute violation est une non-conformité SILC.**

---

## 🔁 ARTICLE 9 — DÉLÉGATION D'EXÉCUTION

Le processus peut :

- ordonner la mise à jour technique de la relation UserRole
- produire des événements
- déclencher des notifications

Mais :

- n'exécute pas directement
- ne persiste pas lui-même
- ne communique pas directement avec l'infrastructure

**📌 Décision ≠ Exécution.**

---

## 📊 ARTICLE 10 — TRAÇABILITÉ ET AUDIT

Toute révocation doit produire :

- l'identité de la RevokingAuthority
- la justification de la révocation
- la date et l'heure effectives
- le contexte concerné

**📌 La fin d'un pouvoir doit être audit-able a posteriori.**

---

## 🧾 ARTICLE 11 — ÉTAT FINAL GARANTI

Après exécution :

- soit le pouvoir reste actif (révocation refusée)
- soit le pouvoir est :
  - explicitement révoqué
  - historiquement conservé
  - non réactivable implicitement

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
