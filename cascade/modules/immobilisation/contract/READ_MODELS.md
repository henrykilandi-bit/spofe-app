# IMMOBILISATION — READ MODELS

## Projections disponibles

| Read Model | Description |
|------------|-------------|
| `ImmobilisationsListRM` | Liste paginée de toutes les immobilisations |
| `ImmobilisationsByCategoryRM` | Immobilisations groupées par catégorie OHADA |
| `ImmobilisationsInServiceRM` | Immobilisations actuellement en service |
| `ImmobilisationsDisposedRM` | Immobilisations sorties du patrimoine |

---

## Règles

- Read-only strict
- Données factuelles uniquement
- Aucune agrégation comptable
- Aucun calcul d'amortissement
- Aucune valeur nette comptable

---

## Reconstruction

Les read-models sont reconstruisibles à tout moment depuis les événements :
- `ImmobilisationRegistered`
- `ImmobilisationPutInService`
- `ImmobilisationDisposed`
