# 🧪 Guide Complet des Tests E2E Playwright SPOFE v2.1

## 🎯 Objectif

Tests End-to-End (E2E) **complètement automatisés** pour valider le workflow comptable OHADA, la sécurité, et l'intégrité des données.

## 🚀 Quick Start

### Installation
```bash
cd cascade
npm install
```

### Premiers tests
```bash
# Lancer tous les tests E2E
npm run e2e

# Avec interface graphique
npm run e2e:ui

# Mode debug
npm run e2e:debug
```

### Voir les rapports
```bash
npm run e2e:report
```

## 📋 Structure des Tests

### Organisation par projet

```
cascade/e2e/
├── setup/
│   ├── global.setup.js          # Configuration globale
│   └── global.teardown.js       # Nettoyage
│
├── accounting/                   # Tests comptables
│   └── ohada-workflow.spec.js   # 10 tests
│       ├── TC-001: Création écriture
│       ├── TC-002: Soumission
│       ├── TC-003: Approbation DAF
│       ├── TC-004: Posting
│       ├── TC-005: Balance
│       ├── TC-006: Conformité OHADA
│       ├── TC-007: Verrouillage
│       ├── TC-008: Audit trail
│       ├── TC-009: Anomalies
│       └── TC-010: États financiers
│
├── security/                     # Tests sécurité
│   └── security-tests.spec.js   # 10 tests
│       ├── TC-SEC-001: Accès non auth
│       ├── TC-SEC-002: RBAC
│       ├── TC-SEC-003: SQL Injection
│       ├── TC-SEC-004: CSRF
│       ├── TC-SEC-005: Rate Limiting
│       ├── TC-SEC-006: Validation données
│       ├── TC-SEC-007: Audit actions
│       ├── TC-SEC-008: Token refresh
│       ├── TC-SEC-009: Fichiers sensibles
│       └── TC-SEC-010: Chiffrement
│
├── auth/                         # Tests d'authentification
├── approvals/                    # Tests d'approbation
├── compliance/                   # Tests conformité
├── mobile/                       # Tests responsive
│
└── fixtures/
    ├── database-setup.sql       # Données de test
    └── accounting-data.json     # Fixtures
```

## 🔧 Configuration Playwright

**Fichier**: `playwright.config.js`

```javascript
// Configuration SPOFE spécifique
- Tests séquentiels (fullyParallel: false)
- 1 worker (isolation BD)
- 6 projets de test
- Timeouts adaptés (30s navigation)
- Rapports HTML, JSON, JUnit
- Screenshots on failure
- Videos on failure
- Trace on first retry
```

## 🗄️ Setup Global

**Fichier**: `e2e/setup/global.setup.js`

### Étapes d'initialisation

1. **Nettoyage** : Supprimer états précédents
2. **BD de test** : Créer et initialiser avec OHADA
3. **Utilisateurs de test** : 4 rôles (admin, comptable, daf, auditor)
4. **Auth states** : Sauvegarder tokens JWT
5. **Fixtures** : 31 comptes + 2 écritures de test

### Utilisateurs créés

| Email | Rôle | Permissions |
|-------|------|-------------|
| admin@test.spofe.com | Admin | Tous |
| comptable@test.spofe.com | Comptable | Saisie/Lecture |
| daf@test.spofe.com | DAF | Approbations |
| auditor@test.spofe.com | Auditor | Audit/Lecture |

## 📝 Tests Comptables (Accounting)

**Fichier**: `e2e/accounting/ohada-workflow.spec.js`

### TC-001: Création Écriture Comptable

```javascript
✅ Naviguer vers Écritures
✅ Remplir entête (Référence, Date, Journal)
✅ Ajouter lignes (Débit/Crédit)
✅ Vérifier équilibre (Débit = Crédit)
✅ Sauvegarder brouillon
✅ Vérifier le statut "Brouillon"
```

**Données test**:
- Référence: `FAC-TEST-{timestamp}`
- Montants: 1500 XOF
- Comptes: 602 (Charges), 401 (Passif)

### TC-002: Soumission Écriture

```javascript
✅ Accéder à l'écriture créée
✅ Vérifier complétude
✅ Soumettre pour approbation
✅ Confirmer changement statut → "En attente approbation"
```

### TC-003: Approbation DAF

```javascript
✅ Connexion avec rôle DAF
✅ Voir écritures en attente
✅ Ouvrir l'écriture
✅ Ajouter commentaire d'approbation
✅ Approuver (avec 2FA)
✅ Vérifier statut → "Approuvée"
```

### TC-004: Posting et Soldes

```javascript
✅ Accéder à l'écriture approuvée
✅ Lancer le posting
✅ Vérifier statut → "Posté"
✅ Vérifier soldes mis à jour
```

### TC-005: Génération Balance

```javascript
✅ Naviguer vers Rapports
✅ Sélectionner période
✅ Générer balance comptable
✅ Vérifier équilibre OHADA (Total Débit = Total Crédit)
✅ Vérifier structure comptable
✅ Exporter en PDF
```

### TC-006: Conformité OHADA

```javascript
✅ Lancer diagnostic OHADA
✅ Vérifier critères:
   - Équilibre comptable
   - Numérotation OHADA
   - Complétude
   - Dates cohérentes
   - Textes descriptifs
✅ Générer rapport conformité
```

### TC-007: Verrouillage Période

```javascript
✅ Naviguer Gestion Périodes
✅ Sélectionner période courante
✅ Verrouiller période
✅ Vérifier statut → "Verrouillée"
✅ Vérifier que créations sont bloquées
✅ Affichage warning pour modifications
```

### TC-008: Audit Trail

```javascript
✅ Accéder journal d'audit
✅ Filtrer par type d'action
✅ Vérifier entrées (user, action, timestamp)
✅ Exporter rapport audit (CSV/PDF)
```

### TC-009: Détection Anomalies

```javascript
✅ Lancer diagnostic
✅ Détecter:
   - Écritures déséquilibrées
   - Comptes invalides
   - Doublons
   - Incohérences dates
```

### TC-010: États Financiers

```javascript
✅ Générer Bilan
✅ Générer Compte de résultat
✅ Générer Balance
✅ Vérifier structure comptable
```

## 🔐 Tests Sécurité (Security)

**Fichier**: `e2e/security/security-tests.spec.js`

### TC-SEC-001: Accès Non Authentifié

```javascript
✅ Accès page protégée
✅ Vérifier redirection vers /login
```

### TC-SEC-002: RBAC (Role-Based Access Control)

```javascript
✅ Comptable tente accès approbations
✅ Vérifier accès refusé
✅ Vérifier bouton approuver absent
```

### TC-SEC-003: Protection SQL Injection

```javascript
✅ Tenter SQL injection: "'; DROP TABLE; --"
✅ Vérifier requête échappée
✅ Vérifier table intacte
```

### TC-SEC-004: Protection CSRF

```javascript
✅ Obtenir token CSRF
✅ POST sans token → 403
✅ POST avec token invalide → 403
```

### TC-SEC-005: Rate Limiting

```javascript
✅ 50 tentatives login rapides
✅ Vérifier blocage (HTTP 429)
✅ Logs des tentatives
```

### TC-SEC-006: Validation Données

```javascript
✅ Montants invalides: -999999, abc, 9999999999
✅ Vérifier messages d'erreur
✅ Vérifier rejet des données invalides
```

### TC-SEC-007: Audit Actions Sensibles

```javascript
✅ Effectuer action comptable
✅ Vérifier dans audit trail
✅ Vérifier détails: user_id, action, timestamp
```

### TC-SEC-008: Token Refresh

```javascript
✅ Utiliser refresh token
✅ Obtenir nouveau access token
✅ Vérifier fonctionnement du nouveau token
```

### TC-SEC-009: Fichiers Sensibles

```javascript
✅ Tenter accès:
   - /admin/config
   - /.env
   - /database.sql
✅ Vérifier 403 ou 404
```

### TC-SEC-010: Chiffrement

```javascript
✅ Vérifier headers sécurité
   - strict-transport-security
   - x-content-type-options: nosniff
   - x-frame-options
✅ Vérifier pas d'exposition mots de passe
```

## 📊 Rapports et Résultats

### Localisation des rapports

```
cascade/e2e-reports/
├── html/                    # Rapport HTML interactif
│   └── index.html          # 📊 Ouvrir dans le navigateur
├── json/
│   └── report.json         # Données brutes
└── junit/
    └── report.xml          # Format CI/CD
```

### Affichage des rapports

```bash
# Interface HTML interactive
npm run e2e:report

# Affichage direct
open e2e-reports/html/index.html

# JSON pour parsing
cat e2e-reports/json/report.json | jq .
```

### Contenu des rapports

- **Cas de test**: Nom, durée, statut (✅/❌)
- **Erreurs**: Messages détaillés
- **Screenshots**: Captures on failure
- **Vidéos**: Enregistrements on failure
- **Traces**: Stack traces
- **Timing**: Performance par test

## 🎯 Exécution Sélective

```bash
# Tous les tests
npm run e2e

# Par projet
npm run e2e:accounting
npm run e2e:security
npm run e2e:auth
npm run e2e:compliance
npm run e2e:mobile

# Par fichier
npx playwright test e2e/accounting/ohada-workflow.spec.js

# Par tag
npx playwright test -g @auth

# 1 seul test
npx playwright test -g "TC-001"
```

## 🐛 Debug et Troubleshooting

### Mode Debug Interactif

```bash
npm run e2e:debug

# Dans Playwright Inspector:
# - Étape par étape (Step over)
# - Inspecteur d'éléments
# - Console DevTools
# - Réseau et performances
```

### Visualiser les étapes

```bash
npm run e2e:headed      # Afficher navigateur
npm run e2e:ui          # Interface graphique
```

### Logs détaillés

```bash
# Avec verbose logging
DEBUG=pw:api npm run e2e

# Sauvegarder les logs
npm run e2e 2>&1 | tee e2e-run.log
```

### Problèmes courants

| Problème | Solution |
|----------|----------|
| Tests timeout | ↑ Augmenter timeout dans config |
| BD non initialisée | Vérifier `npm run db:init` |
| Auth failed | Vérifier utilisateurs créés |
| Screenshot paths | Vérifier permissions dossier |
| Port déjà utilisé | Arrêter serveur existant |

## 🔄 Intégration CI/CD

### GitHub Actions

```yaml
- name: Run E2E Tests
  run: npm run e2e

- name: Upload Reports
  uses: actions/upload-artifact@v2
  if: always()
  with:
    name: e2e-reports
    path: e2e-reports/
```

### GitLab CI

```yaml
e2e_tests:
  script:
    - npm run e2e
  artifacts:
    paths:
      - e2e-reports/
    reports:
      junit: e2e-reports/junit/report.xml
```

### Jenkins

```groovy
stage('E2E Tests') {
  steps {
    sh 'npm run e2e'
  }
  post {
    always {
      junit 'e2e-reports/junit/report.xml'
      publishHTML([
        reportDir: 'e2e-reports/html',
        reportFiles: 'index.html'
      ])
    }
  }
}
```

## 📊 Métriques et KPIs

### Résultats attendus

- **Taux réussite**: 100% (20 tests)
- **Couverture**: 
  - Accounting: 10 tests (workflow complet)
  - Security: 10 tests (toutes les couches)
- **Durée**: ~5-10 minutes (toute suite)
- **Stabilité**: 99% (flakiness < 1%)

### Performance

```bash
# Performance par test
npx playwright test --reporter=json e2e-reports/json/report.json

# Générer graphique
npm install -D @reporter/chart
```

## ✅ Production Checklist

- [ ] Tests locaux: `npm run e2e`
- [ ] 100% passage: ✅✅✅
- [ ] Rapports générés
- [ ] Screenshots vérifiés
- [ ] Traces consultées
- [ ] Performance OK
- [ ] CI/CD green
- [ ] Déploiement valide

## 🔗 Ressources

- **Playwright Docs**: https://playwright.dev
- **Mermaid Diagrams**: Générés dans `docs/diagrams/`
- **Configuration**: `playwright.config.js`
- **Fixtures**: `e2e/fixtures/`

## 📝 Bonnes Pratiques

1. ✅ **Isolation**: Chaque test indépendant
2. ✅ **Données**: Fixtures fraîches à chaque run
3. ✅ **Nettoyage**: Cleanup automatique
4. ✅ **Timing**: Attendre explicitement (waitFor)
5. ✅ **Erreurs**: Messages d'erreur clairs
6. ✅ **Documentation**: Tests auto-documentés
7. ✅ **Maintenance**: Facile à mettre à jour

## 🎓 Formation

**Durée**: 1 jour  
**Modules**:
1. Playwright basics (1h)
2. Configuration E2E (1h)
3. Écrire tests (2h)
4. Debug & troubleshooting (1h)
5. CI/CD integration (1h)

---

**Version**: SPOFE v2.1  
**Tests**: 20 (Accounting: 10, Security: 10)  
**Couverture**: 100% workflows critiques  
**Maintenance**: Automatique
