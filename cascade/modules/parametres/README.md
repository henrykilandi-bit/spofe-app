# Module Paramètres v1.0.0

🎯 **Constitution structurelle de SPOFE**

Le module Paramètres est le socle déclaratif et normatif de SPOFE.
Il fournit les référentiels, cadres, vocabulaires et constantes structurelles.

## 🚀 Principe fondamental

👉 **Le module Paramètres déclare le cadre**
👉 **Les modules métiers agissent dans ce cadre**

## 🛡️ Invariants P0

- **Passivité absolue** : Aucun effet, calcul ou action
- **Déclaratif uniquement** : Données non dérivées
- **Read-only** : Consommation en lecture seule uniquement
- **Append-only** : Historisation totale des évolutions
- **Neutralité métier** : Aucun privilège sectoriel

## 📊 Statut

- **Version** : 1.0.0
- **Gouvernance** : SPOFE P0 - Constitutional
- **Type** : Socle normatif transverse
- **Statut** : READY_FOR_CERTIFICATION

## 📜 Contrats

- [🎯 SCOPE.md](contract/SCOPE.md) - Périmètre fonctionnel
- [🛡️ GUARDIAN.md](contract/GUARDIAN.md) - Invariants métier
- [🔗 DEPENDENCIES.md](contract/DEPENDENCIES.md) - Flux inter-modules

## 📁 Structure

```
parametres/
├── contract/           # Contrats SPOFE P0
├── src/
│   ├── guardian/       # Constitution métier
│   ├── read-models/    # Modèles de lecture
│   └── api/            # APIs READ-ONLY
└── tests/              # Tests P0
```

## 🔐 Sécurité

Module **constitutional** - Modification strictement encadrée par BUILD_PROOF.