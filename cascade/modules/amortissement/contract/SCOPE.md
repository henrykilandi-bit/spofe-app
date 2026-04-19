# MODULE AMORTISSEMENT — SCOPE v1.0.0

## 1. RÔLE DU MODULE

Le module Amortissement est responsable du calcul, de l’historisation
et de l’exposition des dotations d’amortissement et des valeurs nettes
des immobilisations, à partir des immobilisations certifiées.

Il constitue la source de vérité des amortissements dans SPOFE.

## IN SCOPE

- Calcul des dotations d’amortissement
- Méthodes d’amortissement :
  - Linéaire
  - Dégressif
  - Exceptionnel / dérogatoire
  - Unités d’œuvre
- Plans d’amortissement complets
- Prorata temporis
- Révisions :
  - durée d’amortissement
  - valeur résiduelle
- Calculs :
  - dotation par période
  - amortissements cumulés
  - valeur nette comptable (VNC)
- Sorties d’actifs :
  - arrêt du plan
  - VNC à date de sortie
- Read-models descriptifs
- API GET uniquement
- Guardian central
- Append-only
- Multi-tenant strict

## 3. SOURCES AUTORISÉES

- Module Immobilisation (source unique)
  - valeur d’origine
  - date de mise en service
  - durée
  - valeur résiduelle
  - affectations

## OUT OF SCOPE

- Gestion des immobilisations
- Comptabilisation
- Calcul de plus-value / moins-value
- Fiscalité et optimisation fiscale
- Décisions de renouvellement
- Simulation stratégique
- Maintenance
- TCO
- Alertes exécutoires

## 5. GOUVERNANCE

- Version : v1.0.0
- Niveau : SPOFE P0
- Mutable : NON
- Statut : CONTRACTUEL — GELÉ
