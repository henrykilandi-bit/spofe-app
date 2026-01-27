# 🧩 GitHub Issues – Dashboard SPOFE (Pilotage & Accompagnement)

Ce document contient **les issues prêtes à être copiées/collées dans GitHub** pour implémenter le Dashboard SPOFE selon la spécification produit.

---

## 🧱 EPIC — Dashboard SPOFE : Pilotage & Accompagnement

**Objectif** : Fournir un dashboard orienté décision, suivi et accompagnement (coach, admin, dirigeant).

**Labels suggérés** : `dashboard`, `mvp`, `backend`, `frontend`, `ux`

---

## 🔐 ISSUE 1 — Définir les rôles & permissions (Backend)

**Type** : Backend / Sécurité  
**Priorité** : 🔴 Haute

### Description
Implémenter les rôles SPOFE et leurs permissions associées côté backend.

### Rôles
- `COACH`
- `ADMIN`
- `MANAGER`
- `SUPER_ADMIN`

### Tâches
- [ ] Ajouter un enum `ROLE`
- [ ] Ajouter le rôle dans le JWT
- [ ] Middleware d’autorisation par rôle
- [ ] Restreindre les actions en écriture selon le rôle

### Critères d’acceptation

#### COACH
- Ne peut créer, modifier ou supprimer aucune écriture
- Accès en lecture seule au journal et aux rapports
- Accès au dashboard avec données agrégées uniquement

#### MANAGER (Dirigeant)
- Accès en lecture au dashboard et aux rapports
- Accès au journal en lecture simplifiée
- Aucune action d’écriture ou d’administration possible

#### ADMIN (Comptable / Admin financier)
- Peut créer et modifier des écritures
- Peut corriger les déséquilibres comptables
- Ne peut pas gérer les rôles utilisateurs

#### SUPER_ADMIN
- Accès total à toutes les fonctionnalités
- Peut gérer les utilisateurs et leurs rôles
- Peut accéder aux paramètres système
- Peut effectuer des opérations sensibles (maintenance, debug)
- Rôle réservé à l’administration interne SPOFE
- **Non assignable via l’interface utilisateur**

---

## 📊 ISSUE 2 — API Dashboard : Summary (MVP)

**Type** : Backend  
**Priorité** : 🔴 Haute

### Endpoint
`GET /api/dashboard/summary?period=`

### Description
Retourner un résumé agrégé pour le dashboard.

### Données retournées
- Résultat (gain / perte)
- État d’équilibre comptable
- Activité globale (dernière écriture)

### Critères d’acceptation
- Une seule requête pour toutes les données
- Calculs effectués côté backend
- Filtrage par période

---

## 📈 ISSUE 3 — API Dashboard : Tendances

**Type** : Backend  
**Priorité** : 🟠 Moyenne

### Endpoint
`GET /api/dashboard/trends?period=`

### Description
Retourner les tendances temporelles.

### Données
- Nombre d’écritures par période
- Résultat par période

---

## 🥧 ISSUE 4 — API Dashboard : Répartition financière

**Type** : Backend  
**Priorité** : 🟠 Moyenne

### Endpoint
`GET /api/dashboard/distribution?period=`

### Description
Retourner la répartition globale : charges, produits, actif, passif.

---

## 🧩 ISSUE 5 — Frontend : Structure Dashboard adaptative

**Type** : Frontend / UX  
**Priorité** : 🔴 Haute

### Description
Créer un dashboard unique avec priorisation dynamique selon le rôle.

### Tâches
- [ ] Créer `DashboardLayout`
- [ ] Adapter l’ordre d’affichage selon le rôle
- [ ] Ajouter un sélecteur de période global

---

## 🧾 ISSUE 6 — Frontend : KPI Résultat & Équilibre (MVP)

**Type** : Frontend  
**Priorité** : 🔴 Haute

### Description
Implémenter les cartes KPI principales.

### Critères d’acceptation
- Carte Résultat colorée (gain / perte)
- Carte Équilibre ultra lisible
- Skeleton au chargement
- Message clair en cas d’erreur API

---

## 📊 ISSUE 7 — Frontend : Graphiques de tendances

**Type** : Frontend / DataViz  
**Priorité** : 🟠 Moyenne

### Description
Afficher les graphiques de tendances.

### Tâches
- [ ] Courbe d’activité
- [ ] Courbe du résultat

---

## 🥧 ISSUE 8 — Frontend : Graphique de répartition

**Type** : Frontend  
**Priorité** : 🟡 Basse

### Description
Afficher la répartition financière sous forme de donut chart.

---

## 🎯 MVP Dashboard V1 — Périmètre validé

### Inclus
- Rôles & permissions
- API `/dashboard/summary`
- Carte Résultat (gain / perte)
- Carte Équilibre
- Carte **Situation des comptes tiers**
- Carte **Tension de trésorerie** (basée sur les tiers)
- Sélecteur de période
- Adaptation par rôle (ordre d’affichage)

### Hors MVP
- BFR comptable complet (stocks inclus)
- Analytics avancées
- Comparaisons multi-années

---

## 🆕 ISSUE 9 — API Dashboard : Tension de trésorerie (MVP)

**Type** : Backend  
**Priorité** : 🔴 Haute

### Endpoint
`GET /api/dashboard/summary`

### Description
Ajouter le calcul de la **Tension de trésorerie** basée sur les comptes tiers (clients / fournisseurs).

### Règle de calcul (MVP)
```
Tension = Créances clients – Dettes fournisseurs
```

### Seuils (OHADA)
- LOW : Tension ≤ 0
- MODERATE : 0 < Tension ≤ 1 mois de charges
- HIGH : Tension > 1 mois de charges

### Payload attendu
```json
{
  "workingCapitalTension": {
    "level": "MODERATE",
    "value": 1200000,
    "basis": "THIRD_PARTIES_ONLY"
  }
}
```

### Critères d’acceptation
- Calcul backend uniquement
- Mise à jour selon la période
- Terme "BFR" absent de toute réponse

---

## 🆕 ISSUE 10 — Frontend : Carte "Tension de trésorerie"

**Type** : Frontend / UX  
**Priorité** : 🔴 Haute

### Description
Afficher la carte **Tension de trésorerie** dans la section "Structure & Risques" du dashboard.

### Critères d’acceptation
- Affichage du niveau (Faible / Modérée / Élevée)
- Couleur cohérente (vert / orange / rouge)
- Sous-texte explicatif
- Clic redirige vers `/third-parties` filtré
- Aucun usage du terme "BFR"

---
