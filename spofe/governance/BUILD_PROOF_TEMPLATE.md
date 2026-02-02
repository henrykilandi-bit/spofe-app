# 📄 BUILD_PROOF.md

**Preuve de Build & Tests — Standard SPOFE v1.0.0**

---

## 1. Identification du module

| Champ | Valeur |
|-------|--------|
| **Nom du module** | `<MODULE_NAME>` |
| **Version** | `<vX.Y.Z>` |
| **Statut du module** | Phase 0.5 — Stabilisation Technique |
| **Référentiel** | `<repo / monorepo>` |
| **Chemin du module** | `<path/to/module>` |

---

## 2. Référence de validation

| Champ | Valeur |
|-------|--------|
| **Commit Git (SHA)** | `<commit-hash>` |
| **Branche** | `<branch-name>` |
| **Date de génération** | `<YYYY-MM-DDTHH:MM:SSZ>` |
| **Généré par** | `[ ] CI` `[ ] Développeur` |
| **Responsable de la validation** | `<nom \| système>` |

📌 Ce BUILD_PROOF est valide uniquement pour le commit référencé ci-dessus.

---

## 3. Environnement d'exécution

| Champ | Valeur |
|-------|--------|
| **OS** | `<ubuntu-latest \| macOS \| windows>` |
| **Node.js** | `<version>` |
| **TypeScript** | `<version>` |
| **Package manager** | `<npm \| yarn \| pnpm>` |
| **Base de données** | `<PostgreSQL X \| N/A>` |

### Variables d'environnement critiques

| Variable | Statut |
|----------|--------|
| `DATABASE_URL` | `<set \| not required>` |
| Autres | `<liste>` |

---

## 4. Build

### 4.1 Commande exécutée

```bash
npm run build
```

(ou commande équivalente spécifique au module)

### 4.2 Résultat du build

| Champ | Valeur |
|-------|--------|
| **Statut** | `✅ SUCCESS` / `❌ FAIL` |
| **Durée** | `<xx>s` |

### Sortie TypeScript

- `[ ]` Aucun warning
- `[ ]` Warnings (voir ci-dessous)
- `[ ]` Erreurs (BUILD_PROOF invalide)

#### Détails (si applicable)

```
<coller ici les warnings ou erreurs>
```

📌 Tout échec de build invalide automatiquement ce BUILD_PROOF.

---

## 5. Tests

### 5.1 Tests exécutés

| Type de tests | Commande | Résultat |
|---------------|----------|----------|
| Unitaires | `npm run test:unit` | `✅` / `❌` |
| Intégration | `npm run test:integration` | `✅` / `❌` |
| E2E | `npm run test:e2e` | `✅` / `❌` |

*(Adapter les commandes selon le module)*

### 5.2 Résumé des résultats

| Test Type | Statut |
|-----------|--------|
| Unit tests | `PASS` / `FAIL` / `N/A` |
| Integration tests | `PASS` / `FAIL` / `N/A` |
| E2E tests | `PASS` / `FAIL` / `N/A` |
| Couverture minimale requise atteinte | `✅` / `❌` / `N/A` |

📌 Tout test obligatoire en échec invalide automatiquement ce BUILD_PROOF.

---

## 6. CI / Automatisation

| Champ | Valeur |
|-------|--------|
| **CI utilisée** | `<GitHub Actions \| GitLab CI \| autre>` |
| **Nom du workflow** | `<workflow-name>` |
| **ID du run CI** | `<run-id>` |
| **Lien vers le run** | `<URL>` |
| **Statut CI** | `✅ SUCCESS` / `❌ FAIL` |

📌 Si CI présente, elle fait foi sur toute exécution locale.

---

## 7. Checklist SPOFE — Validation automatique

| Contrôle | Statut |
|----------|--------|
| CONTRACT.md présent | `✅` / `❌` |
| CHECKLIST_GO_PROD.md présent | `✅` / `❌` |
| Règles Guardian respectées | `✅` / `❌` |
| Phase 0.5 complétée | `✅` / `❌` |
| BUILD_PROOF cohérent avec HEAD | `✅` / `❌` |

---

## 8. Conclusion

- `[ ]` Module techniquement exécutable
- `[ ]` Module non exécutable (validation refusée)

### Décision

> Ce module **respecte** / **ne respecte pas** les règles SPOFE Build & Test
> et **peut** / **ne peut pas** être proposé à la validation GO PROD.

---

## 9. Signatures

| Champ | Valeur |
|-------|--------|
| **Validation technique** | `<nom \| CI>` |
| **Date** | `<YYYY-MM-DD>` |
| **Signature (optionnelle)** | `<hash \| identifiant>` |

---

## 10. Notes complémentaires (optionnel)

Observations, décisions, écarts acceptés (si autorisés explicitement).

---

## 📌 Règles d'utilisation (rappel)

- Ce document est **obligatoire**
- Il est **opposable contractuellement**
- Il est attaché à **un commit unique**
- Il ne peut pas être **modifié manuellement après génération**
- Toute **falsification invalide la validation SPOFE**

---

## 🧱 Emplacement recommandé dans chaque module

```
cascade/modules/<module-name>/
└── BUILD_PROOF.md
```

---

**Document officiel SPOFE — Version 1.0.0 — À ne pas modifier manuellement**
