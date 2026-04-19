# IMMOBILISATION — API READ-ONLY

## Endpoints

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/immobilisations` | Liste paginée des immobilisations |
| `GET` | `/immobilisations/{id}` | Détail d'une immobilisation |
| `GET` | `/immobilisations/en-service` | Immobilisations en service |
| `GET` | `/immobilisations/disposed` | Immobilisations sorties |

---

## Headers obligatoires

| Header | Obligatoire | Description |
|--------|-------------|-------------|
| `X-Tenant-Id` | ✅ | Identifiant du tenant |
| `Authorization` | ✅ | Token JWT |

---

## Règles API

- GET uniquement
- Multi-tenant obligatoire
- Aucun paramètre de calcul
- Aucune logique d'amortissement
- Données factuelles uniquement

---

## Codes de retour

| Code | Signification |
|------|---------------|
| `200` | OK |
| `400` | Paramètres invalides |
| `401` | Non authentifié |
| `403` | Accès refusé (tenant) |
| `404` | Ressource non trouvée |
| `500` | Erreur serveur |
