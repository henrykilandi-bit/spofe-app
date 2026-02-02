# 📜 CONTRAT SILC CANONIQUE — UserRole

Projet : SPOFE  
Type : Contrat d'architecture (SILC)  
Version : v1.1  
Statut : VALIDÉ  
Date de validation : 28/01/2026  

---

⚠️ **AVERTISSEMENT ARCHITECTURAL**

Ce document est une SOURCE DE VÉRITÉ ARCHITECTURALE.

Toute implémentation relative à l'attribution des rôles DOIT respecter ce contrat.

Toute divergence rend l'implémentation NON CONFORME SILC.

Toute évolution de ce mécanisme doit modifier ce contrat, être explicitement validée, puis seulement implémentée.

---

🧭 **ARTICLE 0 — NATURE DE LA RELATION**

**Définition stricte**

La relation UserRole représente l'attribution explicite d'un Role à un User.

👉 Elle est :
- distincte de User (identité)
- distincte de Role (autorisation abstraite)
- porteuse du pouvoir effectif
- la seule manière légitime pour un User d'exercer un rôle dans SPOFE

📌 Sans relation UserRole active, un User n'a aucun pouvoir.

---

❌ **ARTICLE 1 — CE QUE LA RELATION N'EST PAS**

La relation UserRole :

❌ n'est pas implicite
❌ n'est pas automatique
❌ n'est pas héritée
❌ n'est pas une propriété du User
❌ n'est pas une propriété du Role
❌ n'introduit aucun contexte
❌ n'exécute aucune logique métier

---

🧠 **ARTICLE 2 — PROPRIÉTÉS FONDAMENTALES**

La relation UserRole est :

**Explicite**
Elle n'existe que si elle est créée intentionnellement.

**Révocable**
Elle peut être retirée sans supprimer ni le User ni le Role.

**Historisable**
Toute création et toute révocation doivent rester traçables.

**Neutre par défaut**
Elle n'implique ni contexte, ni permissions fines, ni comportement métier.

---

🗄️ **ARTICLE 3 — PERSISTANCE DE LA RELATION**

**3.1 Table canonique**

Nom de table : user_roles
Nature : table de relation (junction table)
Rôle : matérialiser le pouvoir effectif

📌 Sans ligne active dans user_roles, un User est fonctionnellement inactif.

**3.2 Champs contractuels minimaux**

| Champ | Type | Null | Description |
|-------|------|------|-------------|
| id | INT | ❌ | Identifiant technique |
| user_id | INT | ❌ | Référence vers users.id |
| role_id | INT | ❌ | Référence vers roles.id |
| created_at | DATETIME | ❌ | Date d'attribution |
| revoked_at | DATETIME | ✅ | Date de révocation |

📌 Aucun autre champ n'est autorisé à ce stade.

**3.3 Révocation**

Une relation n'est jamais supprimée
Elle est révoquée par remplissage de revoked_at
revoked_at IS NULL ⇒ relation active

---

🔁 **ARTICLE 4 — RÈGLES D'UNICITÉ**

**4.1 Unicité fondamentale**

❝ Un même Role ne peut être actif
qu'une seule fois pour un même User
à un instant donné. ❞

Formulation logique :
(user_id, role_id, revoked_at IS NULL) est unique

**4.2 Multiplicité autorisée**

✅ Un User peut avoir plusieurs Roles différents
✅ Un Role peut être attribué à plusieurs Users
❌ Un User ne peut pas avoir le même Role actif plusieurs fois

**4.3 Unicité temporelle**

Un Role peut être :
- attribué
- révoqué
- puis réattribué ultérieurement

L'historique est conservé intégralement

---

⏱️ **ARTICLE 5 — SÉMANTIQUE DE DURÉE**

**Attribution permanente par défaut**

❝ L'attribution d'un Role à un User est permanente par défaut,
sans date de fin implicite. ❞

**Conséquences :**

❌ aucune expiration automatique
❌ aucune durée implicite
✅ fin uniquement par révocation explicite

---

📝 **ARTICLE 6 — AUDIT & JUSTIFICATION**

**6.1 Principe d'audit**

❝ Toute attribution ou révocation de Role
doit être traçable, attribuable et justifiable. ❞

**6.2 Acteur de l'action**

Toute attribution ou révocation :
- est initiée par un acteur identifié
- peut être :
  - un User disposant de l'autorité requise
  - un processus système identifié

📌 Aucun acte n'est anonyme.

**6.3 Justification**

Chaque action doit pouvoir être justifiée :
- justification textuelle
- libre
- non interprétée par le système
- destinée à l'audit humain

**6.4 Support technique de l'audit**

Les données d'audit peuvent être :
- portées par la relation
- ou stockées dans un journal d'audit séparé

📌 Le contrat n'impose pas encore le support technique.

---

🏛️ **ARTICLE 7 — GOUVERNANCE HIÉRARCHIQUE**

**7.1 Principe hiérarchique**

❝ L'attribution ou la révocation d'un Role
ne peut être effectuée que par un acteur
disposant d'un Role hiérarchiquement supérieur
au Role concerné. ❞

**7.2 Règles strictes**

❌ un Role ne peut pas s'auto-attribuer
❌ un Role ne peut pas attribuer un Role égal
❌ un Role ne peut pas attribuer un Role supérieur
✅ seul un Role strictement supérieur est autorisé

📌 La hiérarchie est un mécanisme de gouvernance, pas une action métier.

---

🔄 **ARTICLE 8 — CHANGEMENT DE RÔLE**

**8.1 Principe fondamental**

❝ Un User ne peut pas "changer" de Role par modification directe.
Tout changement de Role s'effectue obligatoirement en deux étapes :

- révocation du Role actif
- attribution explicite d'un nouveau Role. ❞

**8.2 Règles strictes**

❌ interdiction de modifier une relation active
❌ interdiction de remplacer un role_id existant
✅ toute transition crée une nouvelle relation
✅ l'historique reste complet et inviolable

---

🚫 **ARTICLE 9 — INTERDICTIONS EXPLICITES**

Il est interdit :

❌ d'attribuer un Role sans acteur identifié
❌ de révoquer un Role sans trace
❌ de modifier ou supprimer l'historique
❌ de contourner l'unicité ou la hiérarchie
❌ de masquer une décision par suppression

---

🔐 **ARTICLE 10 — CONFORMITÉ SILC**

Une relation UserRole est CONFORME SILC si :

- Elle est persistée dans user_roles
- Elle respecte l'unicité temporelle
- Elle est permanente par défaut
- Elle est révoquée explicitement
- Elle est auditée
- Elle respecte la gouvernance hiérarchique
- Tout changement suit la séquence révocation → attribution

👉 Une seule violation ⇒ NON CONFORME SILC

---

🔄 **ARTICLE 11 — ÉVOLUTION**

Toute évolution :
- modifie ce contrat
- est validée explicitement
- est implémentée après validation
- ne casse aucun invariant existant

---
