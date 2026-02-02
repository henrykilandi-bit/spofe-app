# 📜 CONTRAT SILC CANONIQUE — Group

Projet : SPOFE  
Type : Contrat d'architecture (SILC)  
Version : v1.0  
Statut : VALIDÉ  
Date de validation : 28/01/2026  

---

⚠️ **AVERTISSEMENT ARCHITECTURAL**

Ce document constitue une SOURCE DE VÉRITÉ ARCHITECTURALE.

Le Group n'accorde jamais de pouvoir.

Toute implémentation qui ferait dériver le Group vers l'autorisation est NON CONFORME SILC.

Toute évolution doit être explicitement validée avant implémentation.

---

🧭 **ARTICLE 0 — NATURE DU GROUP**

**Définition stricte**

Un Group est une structure organisationnelle logique destinée à :
- organiser,
- regrouper,
- structurer des éléments du système.

👉 Le Group :
❌ ne donne aucun pouvoir
❌ ne définit aucune autorisation
❌ ne représente aucune identité
❌ ne remplace ni Context ni Company

📌 Le Group structure, il n'autorise jamais.

---

❌ **ARTICLE 1 — CE QUE LE GROUP N'EST PAS**

Un Group :

❌ n'est pas un User
❌ n'est pas un Role
❌ n'est pas un UserRole
❌ n'est pas un Contexte
❌ n'est pas une Company
❌ n'est pas une permission
❌ n'est pas une action

Toute tentative d'attribuer un pouvoir à un Group est STRICTEMENT INTERDITE.

---

🧠 **ARTICLE 2 — RÔLE ARCHITECTURAL DU GROUP**

❝ Le Group fournit une structure organisationnelle stable
sans jamais intervenir dans le modèle d'autorisation. ❞

Il sert à :
- améliorer la lisibilité
- faciliter la gouvernance organisationnelle
- préparer la structuration métier
- organiser les Contextes

---

🧩 **ARTICLE 3 — TYPOLOGIE DU GROUP**

**Principe**

❝ Il existe plusieurs types de Group,
chacun correspondant à une logique organisationnelle distincte. ❞

**Types canoniques autorisés**

**3.1 Group Organisationnel**
- structure formelle et stable
- support de gouvernance
- ex. : directions, départements

**3.2 Group Fonctionnel**
- organisation par fonction ou métier
- transversal aux structures
- ex. : finance, audit, IT

**3.3 Group Transversal**
- regroupement temporaire ou logique
- lié à des projets ou initiatives
- ex. : task force, programme

**Règles strictes**
- un Group appartient à un seul type
- aucun type n'a d'impact sur l'autorisation
- aucun Group n'est interprété comme un Contexte

---

🔗 **ARTICLE 4 — RELATION GROUP ↔ CONTEXT**

**Principe fondamental**

❝ La relation Group ↔ Context est purement organisationnelle
et n'a aucun effet sur le pouvoir ou l'autorisation. ❞

**4.1 Rattachement**
- un Context est rattaché à un seul Group
- un Group peut contenir plusieurs Contextes

📌 Le rattachement :
- sert à structurer,
- sert à gouverner organisationnellement,
- ne modifie jamais les droits.

**4.2 Indépendance**
- un Context reste valide sans Group
- un Group peut exister sans Context

**4.3 Isolement du pouvoir**
- aucun pouvoir ne se propage via un Group
- deux Contextes dans un même Group restent totalement indépendants

📌 Autorisation = UserRole × Context (et rien d'autre)

---

⏱️ **ARTICLE 5 — CYCLE DE VIE DU GROUP**

**États canoniques**

Un Group existe uniquement dans l'un des états suivants :
- Créé
- Actif
- Désactivé
- Archivé

**Règles de cycle de vie**
- activation explicite uniquement
- désactivation réversible
- archivage définitif
- aucune suppression destructive

---

🏛️ **ARTICLE 6 — GOUVERNANCE & AUDIT**

Toute action sur un Group (création, activation, désactivation, archivage, rattachement) :
- est explicite
- est datée
- est attribuée
- est justifiée
- est historisée

📌 Le Group est soumis à une gouvernance organisationnelle stricte.

---

🚫 **ARTICLE 7 — INTERDICTIONS EXPLICITES**

Il est interdit :

❌ d'exercer un pouvoir via un Group
❌ de déduire une autorisation depuis un Group
❌ d'utiliser un Group comme Contexte
❌ de propager des droits via un rattachement
❌ de supprimer un Group pour masquer l'historique

---

🔐 **ARTICLE 8 — CONFORMITÉ SILC**

Un Group est CONFORME SILC s'il :
- n'accorde aucun pouvoir
- respecte sa typologie
- structure les Contextes sans les modifier
- possède un cycle de vie explicite
- est gouverné et audité

Toute violation ⇒ NON CONFORME SILC.
