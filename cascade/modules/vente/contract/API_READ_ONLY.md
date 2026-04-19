# API READ-ONLY — MODULE VENTE v1.0.0

## PRINCIPE

L'API du module Vente est strictement en lecture seule.

- GET uniquement
- Basée exclusivement sur les read-models
- Aucune écriture
- Aucun calcul

---

## ENDPOINTS LOGIQUES

- GET /vente/devis
- GET /vente/commandes
- GET /vente/livraisons
- GET /vente/factures

---

## RÈGLES D'EXPOSITION

- Isolation stricte par tenant
- Aucun endpoint de création ou modification
- Aucune transformation métier
- Aucune agrégation financière
