# SPOFE Frontend ↔ Backend Contract (FBC)

## 📋 Vue d'ensemble

Ce répertoire contient le **contrat formel et versionné** entre le Frontend et le Backend SPOFE.

### ✅ Ce contrat garantit

- ✅ Frontend inchangé quand le métier évolue
- ✅ Aucune logique métier côté client
- ✅ Backend SPOFE reste l'autorité unique
- ✅ Modularité et testabilité
- ✅ Gouvernance métier stricte

---

## 📂 Structure

```
contracts/frontend-backend/
├─ README.md                       # Cette page
├─ contract.v1.yaml                # Contrat formel (machine-readable)
├─ rules.v1.md                     # Règles normatives (humaines)
├─ allowed-commands.v1.json        # Liste blanche Commands
├─ allowed-read-models.v1.json     # Liste blanche Read-models
├─ violations.md                   # Types de violations connues
└─ CHANGELOG.md                    # Évolution du contrat
```

---

## 🔍 Comment lire ce contrat

1. **Avant tout développement frontend**, lire [rules.v1.md](rules.v1.md)
2. **Avant chaque appel API**, vérifier [allowed-commands.v1.json](allowed-commands.v1.json) et [allowed-read-models.v1.json](allowed-read-models.v1.json)
3. **En cas de doute**, consulter [violations.md](violations.md)
4. **Machine-readable**, voir [contract.v1.yaml](contract.v1.yaml)

---

## ⚖️ Autorité & versioning

| Aspect | Règle |
|--------|-------|
| **Modification** | Impossible sans PR + review |
| **Versioning** | Sémantique (v1, v2, v3...) |
| **Breaking change** | Nouvelle majeure version |
| **Compatibilité** | Chaque version stable |

---

## 🚀 Intégration en CI

### Frontend
```typescript
// Chargement automatique du contrat
const commands = await loadAllowedCommands('v1');
const readModels = await loadAllowedReadModels('v1');

// Runtime validation
apiClient.post(endpoint, payload) 
  // → Vérifie que endpoint ∈ allowed-commands
  // → FAIL si non-listé
```

### Backend
```bash
# Vérification en build
./scripts/validate-contract.sh

# Fail si:
# - Endpoint non documenté
# - Command sans déclaration
# - Read-model invisible
```

---

## 📝 Types de violations

Voir [violations.md](violations.md) pour:
- Violations critiques
- Violations détectables en CI
- Patterns d'anti-violations

---

## 📅 Changelog

Voir [CHANGELOG.md](CHANGELOG.md) pour l'historique complet des versions.

**Dernière version:** `v1.0.0` (2026-01-30)

---

## 👥 Qui valide le contrat?

| Rôle | Responsabilité |
|------|-----------------|
| **Développeur Frontend** | Respecter les règles |
| **Développeur Backend** | Documenter les nouvelles commands |
| **Tech Lead** | Valider les évolutions du contrat |
| **CI/CD** | Refuser les violations automatiquement |

---

## 🔗 Liens utiles

- [Contrat formel YAML](contract.v1.yaml)
- [Règles détaillées](rules.v1.md)
- [Commands autorisées](allowed-commands.v1.json)
- [Read-models autorisés](allowed-read-models.v1.json)
