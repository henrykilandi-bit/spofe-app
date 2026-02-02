# 📜 CONTRAT SILC CANONIQUE — Company

Projet : SPOFE  
Type : Contrat d'architecture (SILC)  
Version : v1.0  
Statut : VALIDÉ  
Date de validation : 28/01/2026  

---

⚠️ **AVERTISSEMENT ARCHITECTURAL**

Ce document constitue une SOURCE DE VÉRITÉ ARCHITECTURALE.

La Company est un cadre légal, jamais un mécanisme de pouvoir.

Toute implémentation qui accorde des droits via la Company est NON CONFORME SILC.

Toute évolution doit être explicitement validée avant implémentation.

---

🧭 **ARTICLE 0 — NATURE DE LA COMPANY**

**Définition stricte**

Une Company représente une entité légale reconnue juridiquement, porteuse :
- de responsabilités légales,
- d'obligations fiscales et réglementaires,
- d'un cadre juridique formel.

📌 Company = cadre légal, pas cadre d'autorisation.

---

❌ **ARTICLE 1 — CE QUE LA COMPANY N'EST PAS**

Une Company :

❌ n'est pas un User
❌ n'est pas un Role
❌ n'est pas un UserRole
❌ n'est pas un Context
❌ n'est pas un Group
❌ n'est pas une permission
❌ n'est pas une action

👉 Toute tentative de faire porter un pouvoir par la Company est STRICTEMENT INTERDITE.

---

🧠 **ARTICLE 2 — RÔLE ARCHITECTURAL**

❝ La Company fournit le cadre légal maximal
dans lequel l'organisation et les Contextes peuvent exister. ❞

Elle sert à :
- ancrer juridiquement le système,
- porter la responsabilité légale,
- assurer la conformité réglementaire,
- structurer les obligations légales.

📌 Elle ne décide jamais des droits.

---

🧩 **ARTICLE 3 — TYPOLOGIE DE LA COMPANY**

**Principe**

❝ La typologie de la Company est strictement juridique
et n'a aucun impact sur l'autorisation. ❞

**Types canoniques**

**3.1 Company Légale Opérationnelle**
- entité juridiquement active
- exerce des activités réelles
- socle légal principal

**3.2 Company Holding**
- détient des participations
- peut être non opérationnelle
- aucun pouvoir fonctionnel implicite

**3.3 Company Légale Non Opérationnelle**
- juridiquement existante
- inactive ou en transition
- conservée pour audit et conformité

**Règles**
- une Company appartient à un seul type
- aucun type ne confère de droits
- aucune hiérarchie de pouvoir n'est déduite du type

---

🔗 **ARTICLE 4 — RELATION COMPANY ↔ GROUP**

**Principe**

❝ La Company est le cadre légal dans lequel les Groups s'organisent. ❞

**1 Company → n Groups**
- un Group appartient à une seule Company
- rattachement juridique explicite

📌 Aucun pouvoir ne découle de cette relation.

---

🔗 **ARTICLE 5 — RELATION COMPANY ↔ CONTEXT**

**Principe**

❝ La Company borne l'existence légale des Contextes. ❞

**1 Company → n Contextes**
- un Contexte appartient à une seule Company
- aucun Contexte hors cadre légal

📌 La Company borne l'existence, pas le pouvoir.

---

⏱️ **ARTICLE 6 — CYCLE DE VIE DE LA COMPANY**

**États canoniques**

Une Company existe uniquement dans l'un des états suivants :
- Créée (légalement constituée)
- Active
- Suspendue (réversible)
- Clôturée / Dissoute (définitive)

**Règles de cycle de vie**
- activation explicite uniquement
- suspension réversible
- clôture définitive
- aucune suppression destructive
- conservation intégrale de l'historique

📌 Seule une Company Active est utilisable applicativement.

---

🏛️ **ARTICLE 7 — GOUVERNANCE & AUDIT**

Toute action sur une Company (création, activation, suspension, clôture) :
- est datée
- est attribuée
- est justifiée
- est historisée
- repose sur un fondement légal

📌 Le cycle de vie est opposable juridiquement.

---

🚫 **ARTICLE 8 — INTERDICTIONS EXPLICITES**

Il est interdit :

❌ d'exercer un pouvoir via une Company
❌ de créer un Contexte hors Company
❌ de rattacher un Group ou un Contexte à plusieurs Company
❌ de réactiver une Company clôturée
❌ de masquer l'historique par suppression

---

🔐 **ARTICLE 9 — CONFORMITÉ SILC**

Une Company est CONFORME SILC si :
- elle est strictement légale,
- elle n'accorde aucun pouvoir,
- elle borne Groups et Contextes juridiquement,
- elle possède un cycle de vie explicite,
- elle est gouvernée et auditée.

Toute violation ⇒ NON CONFORME SILC.
