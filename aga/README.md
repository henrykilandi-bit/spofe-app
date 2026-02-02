# AGA v0.1 — Architecture Guardian Assistant

## Vision

**AGA est un outil autonome, sans effet de bord, qui valide l'architecture selon SPOFE/SILC.**

- ✅ Analyse statique TypeScript/JavaScript
- ✅ 11 règles critiques (ARCH_001 → ARCH_040)
- ✅ Rapport enrichi groupé (règle / sévérité / fichier)
- ✅ Prêt pour Guardian v4 (pré-validation)
- ✅ Zéro dépendance lourde (pas de compilateur)

## Structure

```
aga/
├─ core/
│  ├─ types/
│  │  ├─ architecture.types.ts      # Types fondateurs
│  │  └─ rule.interface.ts          # Interface des règles
│  │
│  ├─ registry/
│  │  └─ RuleRegistry.ts            # Registre centralisé
│  │
│  ├─ scanner/
│  │  ├─ FileScanner.ts             # Scan multi-fichiers
│  │  ├─ FileFilter.ts              # Filtres d'inclusion/exclusion
│  │  ├─ FileContextResolver.ts     # Détection layer/kind
│  │  └─ ScannerTypes.ts            # Types communs
│  │
│  ├─ rules/
│  │  ├─ ARCH_001_NoInvalidImports.rule.ts
│  │  ├─ ARCH_002_RequiredAnnotations.rule.ts
│  │  ├─ ARCH_010_StrictLayering.rule.ts
│  │  ├─ ARCH_CRITICAL_RULES.ts     # Règles ARCH_030 → ARCH_040
│  │  └─ RuleIndex.ts               # Index officiel
│  │
│  ├─ report/
│  │  ├─ ReportTypes.ts             # Types rapports
│  │  ├─ ReportAggregator.ts        # Agrégation (règle/sévérité)
│  │  └─ ReportFormatter.ts         # Formateur console
│  │
│  ├─ AnalysisEngine.ts             # Orchestrateur principal
│  └─ [watch/, autofix/, ast/ — prochaines étapes]
│
├─ guardian/                         # Bridge Guardian v4 (futur)
├─ cli.ts                           # Entrypoint CLI
├─ aga.config.json                  # Configuration
└─ README.md                        # Ce fichier
```

## Utilisation

### Analyse simple

```bash
node aga/cli.ts src
```

Produit :

```
📊 AGA — Rapport architectural enrichi
🕒 2026-01-29T22:41:00Z
📁 Fichiers analysés: 42
🚨 Violations: 3

🔴 Sévérité: ERROR (3)
  └─ ARCH_001 — No Invalid Import Paths
     • src/domain/User.entity.ts:5:3
     • src/domain/processes/Register.process.ts:8:1
  ...
```

### Intégration CI

```bash
AGA_EXIT_CODE=$(node aga/cli.ts src && echo 0 || echo 1)
if [ $AGA_EXIT_CODE -eq 1 ]; then
  echo "❌ Architecture non conforme"
  exit 1
fi
```

## Règles disponibles (v0.1)

| ID | Nom | Sévérité | Cible |
|---|---|---|---|
| ARCH_001 | No Invalid Import Paths | ERROR | imports |
| ARCH_002 | Required Annotations | ERROR | domain-process |
| ARCH_010 | Strict Layering | ERROR | layering |
| ARCH_030 | AuditTrail Mandatory | ERROR | decision-audit |
| ARCH_031 | Single Decision | ERROR | process-atomicity |
| ARCH_032 | Process Contract Required | ERROR | contracts |
| ARCH_034 | No Direct Entity Mutation | ERROR | encapsulation |
| ARCH_036 | No Process-to-Process | ERROR | coupling |
| ARCH_038 | No Technical Events in Domain | ERROR | purity |
| ARCH_039 | Domain Fact Immutable | ERROR | immutability |
| ARCH_040 | Domain Fact Past Tense | WARNING | naming |

## Prochaines étapes (v0.2+)

- [ ] Watch mode (fs.watch + debounce)
- [ ] Auto-fix niveau 1 (imports + annotations)
- [ ] Guardian v4 JSON bridge
- [ ] SILC batch signature
- [ ] Git hooks (pre-commit, pre-push)
- [ ] Dashboard metrics
- [ ] Plus de règles (ARCH_003 → ARCH_029, ARCH_041 → ARCH_042)

## Principes SILC encapsulés

✅ **Séparation stricte des couches**
- Domain ← Application ← Infrastructure (unidirectionnel)

✅ **Contrats explicites**
- @contract, @invariant obligatoires
- Aucun processus sans gouvernance

✅ **Auditabilité totale**
- Toute décision traçable
- AuditTrail immuable

✅ **Pureté du domaine**
- Zéro dépendance infra
- Zéro événements techniques
- Zéro mutation directe

## Configuration

Modifiez `aga.config.json` pour :
- Activer/désactiver les règles
- Changer les sévérités par défaut
- Configurer les chemins d'output
- Intégrer Guardian v4

## Support Guardian v4

AGA produit des rapports **Guardian-compatible** :
- Détection violations bloquantes
- Mapping ligne/colonne précis
- JSON structuré pour pré-validation
- Signature SILC prête

Guardian v4 peut :
- Ignorer les résultats AGA (audit manuel)
- Valider sur la base du JSON AGA (automatisé)
- Bloquer le commit si AGA détecte des CRITICAL

---

**Statut** : AGA v0.1 prêt pour analyse temps réel et pré-Guardian v4  
**Maintenance** : Zéro ; AGA est auto-défendant (les règles valident les règles)
