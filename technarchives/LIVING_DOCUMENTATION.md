# 📚 Documentation vivante & Diagrammes SPOFE v2.1

## 🎯 Objectif

Implémenter un système de documentation **vivante** auto-généré avec diagrammes ASCII (Mermaid), maintenu automatiquement en sync avec le code.

## 📊 Diagrammes Générés

### 1. **Architecture Globale** (`architecture.mmd`)
```
Client Layer (Web/Mobile/Desktop)
↓
API Gateway (NGINX + WAF + Rate Limiting)
↓
Application Layer (Express.js + WebSocket + Jobs)
↓
Services (Auth + Accounting + Reporting + Audit)
↓
Data Layer (MySQL + Redis + MinIO + Search)
```

**Couvre**: Stack complète, scalabilité, composants externes

### 2. **Modèle de Données OHADA** (`database-ohada.mmd`)
```
GROUPES_ENTREPRISES (1:N)
    ↓ COMPAGNIES
    ├─ USERS (avec ROLES)
    ├─ CHARTS_OF_ACCOUNTS (8 classes OHADA)
    ├─ JOURNAL_ENTRIES (journaux comptables)
    ├─ FINANCIAL_PERIODS
    └─ FINANCIAL_STATEMENTS
```

**Couvre**: Schéma complet, relations, conformité OHADA

### 3. **Flux Comptable OHADA** (`ohada-workflow.mmd`)
```
Saisie Écriture
  ↓ Validation
    ├─ Brouillon → Documents → Soumission
    └─ Approbation DAF
  ↓ Posting
    ├─ Mise à jour soldes
    ├─ Balance générale
    └─ Vérification équilibre
  ↓ Archivage
    └─ Verrouillage période
```

**Couvre**: Processus comptable complet, conformité OHADA

### 4. **Architecture Sécurité** (`security-architecture.mmd`)
```
Transport (TLS 1.3 + HSTS)
  ↓
Authentication (JWT + 2FA + Session)
  ↓
Authorization (RBAC + Permission Matrix)
  ↓
Data Protection (Chiffrement + Clés)
  ↓
Audit & Compliance (Trail + Events)
  ↓
Threat Detection (Injection + Rate Limit)
  ↓
Incident Response (Alerts + Auto-lockdown)
```

**Couvre**: 7 couches de sécurité, conformité

### 5. **Pipeline CI/CD** (`deployment-pipeline.mmd`)
```
Code Push
  ↓ Lint & Format
  ↓ Unit Tests
  ↓ Build Docker
  ↓ E2E Tests
  ↓ Deploy Staging
  ↓ Smoke Tests
  ↓ Manual Approval
  ↓ Deploy Production (Blue/Green)
  ↓ Health Checks
  ↓ Release Complete
```

**Couvre**: Pipeline complet, gestion erreurs, rollback

## 🚀 Commandes Disponibles

### Génération
```bash
# Générer tous les diagrammes
npm run docs:generate-diagrams

# Mode watch (auto-régénération)
npm run docs:watch

# Servir localement
npm run docs:serve
```

### Pré-commit
```bash
# Auto-générer avant commit
npm run docs:precommit
```

## 📁 Structure

```
cascade/
├── scripts/
│   └── generate-living-documentation.js     # Générateur
├── docs/
│   └── diagrams/
│       ├── architecture.mmd                 # Sources
│       ├── architecture.svg                 # Rendus
│       ├── database-ohada.mmd
│       ├── database-ohada.svg
│       ├── ohada-workflow.mmd
│       ├── ohada-workflow.svg
│       ├── security-architecture.mmd
│       ├── security-architecture.svg
│       ├── deployment-pipeline.mmd
│       ├── deployment-pipeline.svg
│       └── README.md                        # Index
├── e2e/
│   └── (tests)
└── package.json
```

## 🎨 Technologies

- **Format**: Mermaid (ASCII → SVG)
- **Génération**: Node.js + fs
- **Visualisation**: 
  - Direct: https://mermaid.live
  - VS Code: Extension "Markdown Preview Mermaid Support"
  - SVG: Browsers
- **Versionning**: Git (fichiers .mmd)

## 🔄 Workflow

### Développeur

1. **Modifier l'architecture**
   ```bash
   # Éditer docs/diagrams/architecture.mmd
   vim docs/diagrams/architecture.mmd
   ```

2. **Générer les diagrammes**
   ```bash
   npm run docs:generate-diagrams
   ```

3. **Vérifier localement**
   ```bash
   npm run docs:serve
   # Ouvrir http://localhost:8080
   ```

4. **Commit**
   ```bash
   git add docs/diagrams/
   git commit -m "docs: update architecture diagram"
   ```

### CI/CD

- Auto-génération sur chaque push
- Validation que les diagrammes sont à jour
- Génération SVG pour documentation

## 📊 Diagrammes Détails

### Architecture Globale
- **Clients**: Web, Mobile, Desktop
- **Gateway**: NGINX, WAF, Load Balancer
- **App**: Express, WebSocket, Jobs
- **Services**: 4 services métier
- **Data**: MySQL, Redis, MinIO, ES
- **Monitoring**: Prometheus, Grafana, ELK
- **External**: Email, SMS, Payment, Backup

### Modèle OHADA
- **31 tables** mappées
- **8 classes comptables** OHADA
- **Multi-tenant** avec isolation compagnie_id
- **Audit trail** complète
- **Soft deletes** pour conformité

### Workflow Comptable
- **7 étapes**: Saisie → Approbation → Posting → Archivage
- **Validations**: Équilibre, Dates, Comptes OHADA
- **Gestion erreurs**: Rejet avec commentaires
- **Conformité**: Verrouillage périodes, Archivage

### Sécurité
- **7 couches**: Transport → Data → Audit → Detection
- **Chiffrement**: TLS 1.3, Au repos, En transit
- **Authentification**: JWT, 2FA, Session Mgmt
- **Autorisation**: RBAC, Permission Matrix, Scopes
- **Audit**: Trail complète, Events, Logs
- **Protection**: Injection, XSS, CSRF, Rate Limit

### CI/CD
- **Stages**: 8 étapes de validation
- **Qualité**: Lint, Unit, E2E, Integration
- **Déploiement**: Blue/Green avec rollback
- **Monitoring**: Health checks en temps réel

## ✅ Production Checklist

- [ ] Diagrammes générés: `npm run docs:generate-diagrams`
- [ ] Validés manuellement
- [ ] Formats SVG créés
- [ ] Documentations à jour
- [ ] Tests E2E passent
- [ ] CI/CD green

## 🔗 Ressources

- **Mermaid Docs**: https://mermaid.js.org
- **Editor Online**: https://mermaid.live
- **Versionning**: Git SHA traceable

## 📝 Notes

- Les diagrammes sont la **source de vérité** d'architecture
- Mises à jour **avant** implémentation
- Reviews obligatoires pour changements majeurs
- Archivage historique via Git

---

**Version**: SPOFE v2.1  
**Génération**: Automatique  
**Maintenance**: CI/CD + Developers
