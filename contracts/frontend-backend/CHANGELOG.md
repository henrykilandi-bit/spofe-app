# Changelog — Frontend ↔ Backend Contract

## [1.0.0] — 2026-01-30

### Initial Release

#### Added

- **contract.v1.yaml** — Contrat formel, machine-readable
  - 11 principes fondamentaux
  - Responsabilités Frontend/Backend clarifiées
  - Règles d'accès (lecture/écriture)
  - Gestion des erreurs
  - Authentification & identité
  - État Frontend autorisé/interdit
  - Modularité Frontend ↔ Backend
  - Communication technique
  - Intégration CI/CD

- **rules.v1.md** — Règles normatives (opposables en PR)
  - R1: Frontend n'est jamais une autorité
  - R2: Toute écriture est une Command
  - R3: Read-models ne sont pas des vérités
  - R4: Erreur backend est finale
  - R5: Un module = un module SPOFE
  - R6: Client API unique
  - R7: Pas de logique réseau dans les vues
  - R8: État UI uniquement
  - R9: Auth: transmettre l'identité, pas l'autorité
  - R10: Vocabulaire métier
  - R11: Guardian invisible mais souverain
  - R12: Règle d'or

- **allowed-commands.v1.json** — Liste blanche Commands
  - CreateAggregate
  - UpdateAggregate
  - CloseAggregate
  - Schémas validés
  - Codes d'erreur documentés

- **allowed-read-models.v1.json** — Liste blanche Read-models
  - GET /aggregates
  - GET /aggregates/active
  - GET /aggregates/closed
  - GET /aggregates/{id}
  - GET /read/aggregate-timeline
  - Stratégies de cache documentées

- **violations.md** — Types de violations & détection
  - 11 types de violations (critique → mineure)
  - Patterns d'anti-violation
  - Checks automatiques en CI
  - Matrice de gravité

- **README.md** — Vue d'ensemble & intégration

#### Status

✅ **ACTIVE** — Toutes les implémentations doivent respecter v1.0.0

---

## Roadmap

### v1.1.0 (Planned)

- [ ] Ajout de Commands métier additionnelles
- [ ] Read-models de reporting
- [ ] Intégration Stripe/paiements
- [ ] WebSocket pour real-time

### v2.0.0 (Future)

- [ ] Migration vers Event Sourcing côté Frontend (opt-in)
- [ ] Sync multi-utilisateurs
- [ ] Time-travel debugging

---

## Politique de versioning

### Versions stables

Chaque version est **immuable et stable**. Utilisable en production.

### Versioning sémantique

- **MAJOR** (v1 → v2): Breaking changes
  - Commandes renommées
  - Endpoints supprimés
  - Réduction des responsabilités Frontend
  
- **MINOR** (v1.0 → v1.1): Ajouts compatibles
  - Nouvelles commandes
  - Nouveaux read-models
  - Nouvelles règles (strict)
  
- **PATCH** (v1.0.0 → v1.0.1): Corrections
  - Clarifications
  - Exemples
  - Documentation

### Migration entre versions

```
Déploiement simultané Frontend + Backend
↓
Support des 2 versions pendant 1 sprint
↓
Dépréciation de l'ancienne version
↓
Arrêt du support
```

---

## Notes de déploiement

### v1.0.0 → Déploiement

- ✅ Charger contract.v1.yaml au startup frontend
- ✅ Valider commands en runtime
- ✅ Valider read-models en runtime
- ✅ Ajouter checks en CI
- ✅ Documenter dans la PR

### Checklist déploiement

- [ ] Frontend charge le contrat
- [ ] Backend valide le contrat
- [ ] CI enforces les règles
- [ ] Documentation mise à jour
- [ ] Équipe a approuvé
- [ ] Tests passent
- [ ] Monitoring en place

---

## Points de contact

| Aspect | Owner | Contact |
|--------|-------|---------|
| Contrat global | Tech Lead | tech@spofe.local |
| Commands backend | Backend Team | backend@spofe.local |
| Read-models | Backend Team | backend@spofe.local |
| Intégration Frontend | Frontend Team | frontend@spofe.local |
| CI/CD | DevOps | devops@spofe.local |

---

## Historique des discussions

### 2026-01-30 — Création v1.0.0

- ✅ Contrat formel validé
- ✅ Commands listées et documentées
- ✅ Read-models définies
- ✅ Violations cataloguées
- ✅ Intégration CI planifiée

---

## Feedback & Amélioration

### Reporter une violation détectée

```bash
git issue create --label contract-violation \
  --title "[Violation] Description brève" \
  --body "
  ## Violation
  
  Type: [Critique|Grave|Mineure]
  
  ## Description
  
  ## Impact
  
  ## Reproduction
  
  ## Suggestion de fix
  "
```

### Proposer une modification

```bash
# 1. Créer une branche
git checkout -b contract/feature-name

# 2. Modifier le contrat
# - Mettre à jour les fichiers concernés
# - Ajouter entrée CHANGELOG

# 3. Créer PR avec label 'contract'
# - La PR nécessite review Tech Lead
# - Bump version si applicable
```

---

**Dernière mise à jour:** 2026-01-30
**Statut:** ACTIVE
**Prochaine révision:** 2026-04-30
