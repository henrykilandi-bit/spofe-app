# 📜 CONTRAT SILC CANONIQUE — Context

Projet : SPOFE  
Type : Contrat d'architecture (SILC)  
Version : v1.0  
Statut : VALIDÉ  
Date de validation : 28/01/2026  

---

⚠️ **AVERTISSEMENT ARCHITECTURAL**

Ce document est une SOURCE DE VÉRITÉ ARCHITECTURALE.

Toute implémentation liée à la contextualisation des pouvoirs DOIT respecter ce contrat.

Toute divergence rend l'implémentation NON CONFORME SILC.

Toute évolution doit être explicitement validée avant implémentation.

---

🧭 **ARTICLE 0 — NATURE DU CONTEXTE**

**Définition stricte**

Un Contexte représente le périmètre dans lequel un pouvoir est exercé.

👉 Le Contexte :
- ne donne aucun pouvoir
- ne définit aucune autorisation
- ne représente aucune identité
- borne l'effet d'un Role attribué

📌 Pouvoir effectif = UserRole × Contexte
Sans Contexte explicite → aucune autorisation valide.

---

❌ **ARTICLE 1 — CE QUE LE CONTEXTE N'EST PAS**

Un Contexte :

❌ n'est pas un User
❌ n'est pas un Role
❌ n'est pas une permission
❌ n'est pas une action
❌ n'est pas une donnée métier
❌ ne décide rien

👉 Il délimite, il ne gouverne pas le pouvoir.

---

🧠 **ARTICLE 2 — INDÉPENDANCE CONCEPTUELLE**

❝ Le Contexte est indépendant du User, du Role et de la relation UserRole. ❞

**Conséquences :**

- il est référencé, jamais absorbé
- il peut exister sans qu'aucun pouvoir ne s'y exerce
- il préexiste à l'exercice du pouvoir

---

🧩 **ARTICLE 3 — TYPOLOGIE DU CONTEXTE**

**3.1 Principe de typologie**

❝ Il existe plusieurs types de Contexte,
chacun représentant un périmètre distinct d'exercice du pouvoir. ❞

Le type :
- structure la portée
- n'accorde aucun droit

**3.2 Types canoniques autorisés**

**a) Contexte Global**
- périmètre système
- usage exceptionnel
- jamais implicite

**b) Contexte Organisationnel**
- périmètre structurant
- borne l'exercice du pouvoir à une entité

**c) Contexte Opérationnel**
- périmètre métier
- toujours inclus dans un Contexte supérieur

**3.3 Règles strictes**

❌ un Contexte n'a qu'un seul type
❌ aucun mélange ou hybridation
❌ aucun pouvoir hors typologie explicite

---

🔗 **ARTICLE 4 — RELATION CONTEXTE ↔ USERROLE**

**4.1 Principe fondamental**

❝ Un UserRole n'a aucune valeur opérationnelle
tant qu'il n'est pas lié explicitement à un Contexte. ❞

**4.2 Dépendance fonctionnelle**

- le UserRole dépend du Contexte pour être effectif
- le Contexte ne dépend d'aucun UserRole

**4.3 Isolation stricte**

- aucun pouvoir ne se propage implicitement
- chaque Contexte est hermétiquement isolé
- même User + même Role ≠ même pouvoir si le Contexte diffère

---

🧬 **ARTICLE 5 — UNICITÉ DU CONTEXTE**

**5.1 Principe d'unicité**

❝ Un Contexte concret est unique pour un périmètre réel donné. ❞

**5.2 Interdictions**

Il est interdit :

❌ de dupliquer un Contexte équivalent
❌ de recréer un Contexte pour contourner une règle
❌ de multiplier les Contextes pour élargir un pouvoir

📌 Un périmètre réel = un Contexte unique.

---

📐 **ARTICLE 6 — PORTÉE DU CONTEXTE**

**6.1 Portée stricte**

- la portée est délimitée
- elle est finie
- elle n'est jamais extensible implicitement

**6.2 Absence d'héritage**

❝ Il n'existe aucun héritage automatique de portée entre Contextes. ❞

❌ organisationnel → opérationnel (implicite)
❌ global → organisationnel (implicite)

👉 Toute extension est explicite et gouvernée.

---

🔄 **ARTICLE 7 — MULTIPLICITÉ DE LIAISON**

**7.1 Côté UserRole**

✅ un UserRole peut être lié à plusieurs Contextes
❌ aucun lien global implicite

**7.2 Côté Contexte**

✅ un Contexte peut accueillir plusieurs UserRoles
❌ aucun Contexte réservé implicitement à un seul User

---

⏱️ **ARTICLE 8 — CYCLE DE VIE DU CONTEXTE**

**8.1 Principe général**

❝ Un Contexte possède un cycle de vie explicite, gouverné et traçable. ❞

**8.2 États canoniques**

Un Contexte existe uniquement dans l'un des états suivants :

- Créé
- Actif
- Désactivé
- Clôturé / Archivé

**8.3 Règles d'état**

- seul un Contexte Actif permet l'exercice du pouvoir
- la désactivation est réversible
- la clôture est définitive
- un Contexte clôturé est lecture seule

---

🏛️ **ARTICLE 9 — GOUVERNANCE & AUDIT**

**9.1 Gouvernance**

Toute création, activation, désactivation ou clôture :
- est effectuée par un acteur identifié
- disposant d'un pouvoir hiérarchiquement approprié
- dans un Contexte valide

**9.2 Audit**

Toute transition d'état :
- est datée
- est attribuée
- est justifiée
- est historisée

---

🚫 **ARTICLE 10 — INTERDICTIONS EXPLICITES**

Il est interdit :

❌ d'exercer un pouvoir dans un Contexte non actif
❌ d'activer un Contexte implicitement
❌ de supprimer un Contexte pour masquer l'historique
❌ de réactiver un Contexte clôturé
❌ de modifier rétroactivement les états

---

🔐 **ARTICLE 11 — CONFORMITÉ SILC**

Un Contexte est CONFORME SILC s'il :

- borne strictement le pouvoir
- respecte sa typologie
- est unique pour son périmètre
- possède un cycle de vie explicite
- est gouverné et audité
- n'introduit aucun pouvoir implicite

👉 Toute violation ⇒ NON CONFORME

---

🔄 **ARTICLE 12 — ÉVOLUTION**

Toute évolution :
- modifie ce contrat
- est validée explicitement
- est implémentée après validation
- ne casse aucun invariant existant

---
