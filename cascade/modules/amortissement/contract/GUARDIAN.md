# AMORTISSEMENT — GUARDIAN v1.0.0 (P0)

## PRINCIPE

Le Guardian Amortissement garantit la cohérence des plans
d’amortissement et interdit toute dérive hors contrat.

Toute violation entraîne un rejet immédiat.

## INVARIANTS

- AM01 : Isolation stricte par tenant
- AM02 : Référence immobilisation obligatoire
- AM03 : Méthode amortissement valide
- AM04 : Durée strictement positive
- AM05 : Valeur résiduelle inférieure à valeur acquisition
- AM06 : Append-only strict
- AM07 : Aucune rétroactivité
- AM08 : Période cohérente

- AM09 : Révision historisée (append-only)
- AM10 : Aucune logique fiscale
- AM11 : Aucune décision métier
- AM12 : Aucune comptabilisation

## SANCTION

- Commande rejetée
- Aucun événement émis
- Aucune persistance

## STATUT

- Module : amortissement
- Version : v1.0.0
- Niveau : SPOFE P0
- Mutable : NON
- Statut : ACTIF
