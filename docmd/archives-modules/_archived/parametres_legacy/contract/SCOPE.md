# SCOPE.md
Module Paramètres — v1.0.0

## 🎯 Rôle du module

Le module Paramètres est le socle déclaratif et normatif de SPOFE.

Il fournit les référentiels, cadres, vocabulaires et constantes structurelles nécessaires au fonctionnement cohérent des modules métiers, sans jamais produire de vérité métier, de calcul ou de décision.

👉 Le module Paramètres déclare le cadre.  
👉 Les modules métiers agissent dans ce cadre.

---

## IN SCOPE

### 1️⃣ Identité & Contexte de l'Entité

- Raison sociale
- Forme juridique
- Pays / juridiction principale
- Devise de référence
- Fuseau horaire
- Langue par défaut

📌 Données déclaratives de contexte, sans logique d'effet.

### 2️⃣ Exercices & Périodes de Référence

- Déclaration des exercices fiscaux
- Dates de début et de fin
- Statut de période :
  - OPEN
  - CLOSED
  - LOCKED
- Périodicités autorisées :
  - mensuelle
  - trimestrielle
  - annuelle

📌 Les périodes sont déclarées, leur utilisation est contrôlée par les Guardians métiers.

### 3️⃣ Référentiels Monétaires & Fiscaux (déclaratifs)

- Devises autorisées
- Taux de change déclarés (non dynamiques)
- Taux de TVA / taxes déclarés
- Régimes fiscaux (codes et identifiants)

📌 Aucun calcul fiscal ou monétaire n'est effectué dans ce module.

### 4️⃣ Cadres Comptables & Normatifs

- Sélection du plan comptable de référence (PCG, IFRS, OHADA, etc.)
- Liste déclarative des comptes autorisés
- Types de journaux comptables reconnus
- Formats normés de numérotation :
  - pièces
  - écritures
  - journaux

📌 La Comptabilité applique ces cadres, Paramètres les expose.

### 5️⃣ Méthodes Autorisées (listes blanches)

- Méthodes d'amortissement autorisées
- Méthodes de valorisation autorisées
- Typologies de coûts reconnues :
  - direct
  - indirect
  - amorti

📌 Paramètres définit ce qui est autorisé, pas comment c'est appliqué.

### 6️⃣ États & Statuts Normés Transverses

- États génériques reconnus :
  - DRAFT
  - VALIDATED
  - CLOSED
  - LOCKED
- États de documents reconnus
- États de périodes reconnus

📌 Objectif : garantir un vocabulaire d'état cohérent entre tous les modules.

### 7️⃣ Rôles & Capacités (sécurité déclarative)

- Rôles globaux reconnus (ex : DIRIGEANT, COMPTABLE, COACH, LECTEUR)
- Capacités associées :
  - READ
  - WRITE
  - CLOSE
  - EXPORT
- Matrice de séparation des responsabilités (SoD)

📌 Aucune authentification, aucun workflow, aucune décision dynamique.

### 8️⃣ Catalogue des Types de Documents Internes

Le module Paramètres fournit un catalogue normé des types de documents internes reconnus par SPOFE.

Pour chaque type de document :
- Identifiant canonique (ex : PURCHASE_ORDER, DELIVERY_NOTE)
- Libellé
- Catégorie :
  - commercial
  - logistique
  - financier
  - administratif
- Modules autorisés à consommer ce type
- État générique initial (DRAFT)
- Statut d'activation (ACTIF / INACTIF)

📌 Ce catalogue est strictement déclaratif et ne définit aucun comportement.

### 9️⃣ Gouvernance & Versioning Structurel

- Version du cadre Paramètres
- Date d'entrée en vigueur
- Historisation append-only des évolutions
- Statut du cadre :
  - ACTIVE
  - DEPRECATED

📌 Toute évolution structurelle implique une nouvelle version contractuelle.

---

## OUT OF SCOPE

Le module Paramètres ne fait pas et ne fera pas :

- Calculs (TVA, impôt, amortissement, coûts)
- Règles conditionnelles ou moteurs de règles
- Transitions d'état automatiques
- Workflows de validation
- Déclenchements inter-modules
- Notifications ou alertes
- IA ou recommandations
- Personnalisation dynamique runtime
- Orchestration de processus métier

👉 Toute logique active appartient aux modules métiers et à leurs Guardians.

---

## 🔒 Règle de gouvernance

- Le module Paramètres est **passif**
- Il est consommé en **lecture seule**
- Il ne déclenche **aucun effet**
- Il constitue une **référence normative commune**

Toute extension du périmètre :
- nécessite une nouvelle version majeure
- doit être validée par BUILD_PROOF

---

## 🧠 Synthèse finale

Paramètres v1.0.0 est la **Constitution structurelle** de SPOFE.  
Il ne décide pas, il ne calcule pas, il n'agit pas.  
Il garantit que tous les modules évoluent dans un cadre commun, lisible et auditable.