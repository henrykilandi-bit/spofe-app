# API READ-ONLY — MODULE COACHING v1.0.0

## PRINCIPE

L'API du module Coaching est strictement en lecture seule.

- GET uniquement
- Aucun effet de bord
- Aucun calcul
- Aucune décision

---

## ENDPOINTS LOGIQUES

- GET /coaching/dashboard
- GET /coaching/journal
- GET /coaching/actions
- GET /coaching/sessions
- GET /coaching/exchanges

---

## RÈGLES D'EXPOSITION

- Données issues exclusivement des read-models
- Isolation stricte par tenant
- Aucun endpoint d'écriture
- Aucune transformation métier

---

## SÉCURITÉ FONCTIONNELLE

Toute tentative d'exposition de :
- calculs
- recommandations
- décisions
- écritures cross-modules

est interdite contractuellement.
