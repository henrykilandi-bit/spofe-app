# 📜 CONTRAT SILC — CompanyOnboardingProcess

Projet : SPOFE  
Type : Contrat de processus (SILC)  
Version : v1.1 (consolidée)  
Statut : PROPOSITION FINALE  
Portée : Entrée dans l'écosystème SPOFE & gouvernance initiale  

---

⚠️ **AVERTISSEMENT ARCHITECTURAL**

Ce document définit le seul processus valide permettant à une entité d'entrer dans SPOFE.

Il ne confère aucun droit implicite
Il ne crée aucun pouvoir par défaut
Il respecte strictement les contrats :
User, Role, UserRole, Context, Group, Company

📌 Toute implémentation qui s'en écarte est NON CONFORME SILC.

---

🧭 **ARTICLE 0 — OBJET DU PROCESSUS**

**Définition**

❝ Le processus CompanyOnboardingProcess décrit comment un User,
sans aucun pouvoir initial, peut demander l'entrée dans SPOFE,
aboutissant à la création gouvernée d'une Company
et à l'initialisation contrôlée de sa gouvernance. ❞

---

🧠 **ARTICLE 1 — PRINCIPES FONDAMENTAUX (NON NÉGOCIABLES)**

❌ Un User ne crée jamais une Company
❌ Un User ne s'attribue jamais un Role
❌ Aucun rôle n'est attribué par défaut

✅ Un User peut déclarer une intention
✅ Toute décision est prise par UserRole × Context
✅ Le système exécute, il ne décide jamais
✅ Toute autorité est auditée

---

🧩 **ARTICLE 2 — ACTEURS DU PROCESSUS**

**2.1 User (Demandeur)**
- identité pure
- sans Role
- sans UserRole
- sans Context
- sans pouvoir

**2.2 User Valideur (Accompagnateur / Autorité)**
- porteur d'un Role hiérarchiquement légitime
- agit dans un Context de validation
- décide de l'acceptation ou du rejet

**2.3 Système SPOFE**
- exécutant technique
- applique strictement les décisions validées
- ne possède aucun pouvoir autonome

**2.4 Company (Résultat)**
- entité légale créée par le système
- initialement sans pouvoir interne

---

🧭 **ARTICLE 3 — ÉTAT INITIAL GARANTI**

Avant le processus :

```
User        = EXISTE
Company     = ∅
Group       = ∅
Context     = ∅
UserRole    = ∅
Pouvoir     = 0
```

---

🔁 **ARTICLE 4 — DÉCLARATION D'INTENTION (ÉTAPE 2)**

**4.1 Nature de l'intention**

Le User peut uniquement déclarer l'une des intentions suivantes :
- Créer une Company Opérationnelle indépendante
- Créer une Company Opérationnelle rattachée à une Company Holding existante
- Créer une Company Holding (structure d'accompagnement)

📌 Cette déclaration :
- n'est ni un droit
- ni une décision
- ni une autorisation

**4.2 Enregistrement**

La demande est :
- enregistrée
- horodatée
- mise en attente de validation

📌 Aucun effet juridique immédiat.

---

🧱 **ARTICLE 5 — VALIDATION GOUVERNÉE (ÉTAPE 3)**

**5.1 Vérification humaine obligatoire**

Un User autorisé :
- examine la demande
- vérifie la conformité légale
- apprécie l'éligibilité SPOFE

📌 C'est un acte de pouvoir explicite.

**5.2 Décision**

La demande est :
- acceptée ou
- rejetée

📌 La décision est :
- attribuée
- justifiée
- auditée

---

🧱 **ARTICLE 6 — CRÉATION LÉGALE DE LA COMPANY (ÉTAPE 4)**

**6.1 Exécution par le système**

Suite à une validation positive :
- le système crée la Company
- le type est fixé (opérationnelle / holding)
- l'état initial est Créée

📌 Aucun rôle n'est attribué au User à ce stade.

**6.2 Activation**

Après complétude légale :
- la Company passe à l'état Active

📌 Le User reste sans rôle.

---

🧱 **ARTICLE 7 — INITIALISATION STRUCTURELLE (ÉTAPE 5)**

**7.1 Group racine (automatique)**

Le système crée :
- un Group racine
- unique
- organisationnel
- neutre
- rattaché à la Company

📌 Le Group racine ne donne aucun pouvoir.

**7.2 Context fondateur (automatique)**

Le système crée :
- un Context fondateur
- actif
- rattaché :
  - à la Company
  - au Group racine

📌 Aucun choix métier n'est effectué à ce stade.

---

🔐 **ARTICLE 8 — BOOTSTRAP CONTRÔLÉ DU PREMIER ROLE**

**8.1 Principe**

❝ Le premier pouvoir est attribué une seule fois,
dans le Context fondateur,
après création complète de la structure. ❞

**Conditions :**
- Company active
- Context fondateur actif
- aucun UserRole existant

**8.2 Acte exceptionnel**

Après décision légitime :
- le système crée UN UserRole
- liant :
  - le User
  - un Role fondateur
  - le Context fondateur

📌 Cet acte est :
- unique
- audité
- irrépétable

---

🧾 **ARTICLE 9 — AUDIT & TRAÇABILITÉ**

Toutes les étapes sont :
- datées
- attribuées
- justifiées
- historisées

📌 Le bootstrap constitue l'acte fondateur de souveraineté de la Company.

---

🚫 **ARTICLE 10 — INTERDICTIONS ABSOLUES**

Il est interdit :

❌ d'attribuer un rôle par défaut
❌ de dériver un rôle depuis le type de Company
❌ de permettre une action structurante sans UserRole
❌ d'exécuter le bootstrap plusieurs fois
❌ de modifier rétroactivement l'historique

---

🧠 **ARTICLE 11 — ÉTAT FINAL GARANTI**

À l'issue du processus :

```
User        = EXISTE
Company     = ACTIVE
Group       = RACINE
Context     = FONDEUR ACTIF
UserRole    = EXISTE (1 seul)
Pouvoir     = CONTRÔLÉ ET AUDITÉ
```

---

🔐 **ARTICLE 12 — CONFORMITÉ SILC**

Le processus est conforme SILC si :

- aucun pouvoir implicite n'existe
- toute décision est humaine et légitime
- le système est exécutant uniquement
- la structure précède le pouvoir
- toute autorité est traçable
