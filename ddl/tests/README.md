# 🧪 SPOFE SQL Non-Regression Tests — Documentation Complète

## 📋 Vue d'ensemble

Suite de tests SQL purs destinés à valider que **PostgreSQL refuse physiquement les violations architecturales** de SPOFE/SILC, même en cas d':

- ✗ SQL direct malveillant
- ✗ Bug applicatif
- ✗ Mauvaise manipulation
- ✗ Tentative de contournement

### 🎯 Principe fondamental

> **Un test = une tentative de violation**  
> **Résultat attendu = ERREUR PostgreSQL**  
> **Succès = "FAILED"** (l'attaque a échoué, c'est bon!)

---

## 🏗️ Structure des tests

```
ddl/
├── spofe-silc-complete.sql       # DDL principal (source de vérité)
├── tests/
│   ├── 01_immutability.sql       # I-DB-01 : UPDATE/DELETE interdits
│   ├── 02_decision_chain.sql     # I-DB-02 : FK Decision→Event→Fact
│   ├── 03_process_registry.sql   # I-DB-03 : Process gouverné
│   ├── 04_audit.sql              # I-DB-04 : Audit obligatoire
│   └── 05_read_model.sql         # I-DB-07 : Vues read-only
├── run-tests.sh                  # Script CI (bash/sh)
├── run-tests.ps1                 # Script CI (PowerShell)
└── .test-logs/                   # Sortie des tests (auto-créé)
```

---

## 📝 Description des test suites

### 1️⃣ **01_immutability.sql** — Immutabilité absolue (I-DB-01)

**Objectif:** Vérifier que UPDATE et DELETE sont bloqués sur ALL tables write-model

**Tests inclus:**
- ❌ UPDATE sur process_registry, decision, event, fact, audit_log
- ❌ DELETE sur process_registry, decision, event, fact, audit_log
- ✅ INSERT autorisé (test positif)

**Exemple de test:**
```sql
UPDATE process_registry
SET invariant_set = ARRAY['MODIFIED']
WHERE process_name = 'P_TEST';
-- ❌ DOIT ÉCHOUER : IMMUTABLE TABLE: UPDATE/DELETE forbidden
```

**Résultat attendu:** 11/11 tests passent (10 violations détectées + 1 INSERT autorisé)

---

### 2️⃣ **02_decision_chain.sql** — Chaînage Decision→Event→Fact (I-DB-02)

**Objectif:** Vérifier qu'aucune orpheline ne peut exister

**Tests inclus:**
- ❌ Event avec decision_id inexistant (FK violation)
- ❌ Fact avec event_id inexistant (FK violation)
- ✅ Chaîne complète valide (test positif)
- ✅ Multiple events d'une même decision
- ✅ Pas de boucle circulaire possible (by design)

**Exemple de test:**
```sql
INSERT INTO event (event_id, decision_id, event_type, payload)
VALUES (gen_random_uuid(), gen_random_uuid(), 'CREATED', '{}');
-- ❌ DOIT ÉCHOUER : FK constraint violation (decision inexistante)
```

**Résultat attendu:** 6/6 tests passent (3 FK violations + 3 chaînes valides)

---

### 3️⃣ **03_process_registry.sql** — Process gouverné (I-DB-03)

**Objectif:** Vérifier que chaque decision référence un process valide

**Tests inclus:**
- ❌ Decision avec process_name inexistant (FK violation)
- ✅ Decision avec process valide
- ❌ Bulk insert avec 1 process invalide (transaction rollback)
- ✅ Processes d'init vérifiés (USER_CREATION, etc.)
- ✅ Chaîne de processus multiples
- ❌ process_registry immutable
- ❌ ENUMs (actor_role, decision_type) constraints

**Exemple de test:**
```sql
INSERT INTO decision (decision_id, process_name, actor_role, decision_type, payload)
VALUES (gen_random_uuid(), 'UNKNOWN_PROCESS', 'SYSTEM', 'CREATE', '{}');
-- ❌ DOIT ÉCHOUER : FK process_registry (process inexistant)
```

**Résultat attendu:** 9/9 tests passent (6 FK violations + 3 chaînes valides)

---

### 4️⃣ **04_audit.sql** — Audit obligatoire (I-DB-04)

**Objectif:** Vérifier que l'audit est traçable et immuable

**Tests inclus:**
- ⚠️ BOUNDARY: Decision sans audit (structurellement possible, metier impossible)
  - Montre la séparation DB ↔ Guardian (intentionnel)
- ✅ Decision avec audit valide
- ❌ Audit avec decision inexistante (FK violation)
- ✅ Multiple audits d'une même decision (trail complet)
- ❌ UPDATE sur audit_log (immutable)
- ❌ DELETE sur audit_log (immutable)
- ✅ Reconstruction de v_audit_trail view

**Exemple de test:**
```sql
UPDATE audit_log
SET checksum = 'COMPROMISED'
WHERE audit_id = 'xxx';
-- ❌ DOIT ÉCHOUER : IMMUTABLE TABLE
```

**Résultat attendu:** 7/7 tests passent (1 boundary + 3 violations + 3 traces)

**⚠️ Important:** 
> L'audit complet est enforced par **Guardian** (niveau applicatif), pas par la DB seule.  
> C'est intentionnel et correct: DB garantit structure, Guardian garantit sémantique.

---

### 5️⃣ **05_read_model.sql** — Vues read-only (I-DB-07)

**Objectif:** Vérifier que les vues sont supprimables et reconstruction possible

**Tests inclus:**
- ❌ INSERT dans v_current_fact (cannot_insert_into_view)
- ❌ UPDATE dans v_current_fact (cannot_update_view)
- ❌ DELETE dans v_current_fact (cannot_delete_from_view)
- ✅ SELECT sur v_current_fact (lecture OK)
- ✅ View reconstruction (données conservées dans fact)
- ✅ v_audit_trail lecture & write-protection
- ✅ v_stats calculations
- ❌ ALTER VIEW impossible

**Exemple de test:**
```sql
INSERT INTO v_current_fact (aggregate_id, fact_type, payload, valid_from)
VALUES (gen_random_uuid(), 'SNAPSHOT', '{}', now());
-- ❌ DOIT ÉCHOUER : cannot insert into view
```

**Résultat attendu:** 8/8 tests passent (5 write violations + 3 lectures OK)

---

## 🚀 Exécution des tests

### Option 1 : Docker Postgres déjà démarré

#### Bash/Shell (Linux/Mac/WSL)
```bash
cd ddl/
chmod +x run-tests.sh
./run-tests.sh

# Avec paramètres customisés
./run-tests.sh --host localhost --port 5432 --db spofe --user postgres --password spofe_secure_pwd_2026
```

#### PowerShell (Windows/PS Core)
```powershell
cd ddl/
.\run-tests.ps1

# Avec paramètres customisés
.\run-tests.ps1 -DbHost localhost -DbPort 5432 -DbName spofe -DbUser postgres -DbPassword spofe_secure_pwd_2026
```

### Option 2 : Avec PostgreSQL Docker

```bash
# Démarrer PostgreSQL d'abord
docker-compose -f docker-compose.postgres.yml up -d

# Attendre ~5s puis exécuter les tests
sleep 5
./ddl/run-tests.sh
```

### Option 3 : Via Makefile

```bash
# Si Make est disponible
make -f Makefile.postgres postgres-start
make -f Makefile.postgres postgres-test

# Ou directement les tests SQL
cd ddl/tests && psql -h localhost -U postgres -d spofe < 01_immutability.sql
```

---

## 📊 Résultats attendus

### ✅ Succès (tous les tests passent)

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ ALL TESTS PASSED — Architecture is SAFE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Test Results Summary:
  Total test suites: 5
  [✓ PASS] Passed: 41
  [✓ PASS] Failed: 0

Detailed logs: .test-logs/spofe_tests_20260129_143022.log
```

### ❌ Échec (au moins un test rate)

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
❌ TESTS FAILED — Architecture violations detected
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Test Results Summary:
  Total test suites: 5
  [✓ PASS] Passed: 40
  [✗ FAIL] Failed: 1

Details in: .test-logs/spofe_tests_20260129_143022.log
```

---

## 🔄 Tests dans CI/CD

### GitHub Actions
```yaml
- name: Run SPOFE SQL Non-Regression Tests
  run: |
    docker-compose -f docker-compose.postgres.yml up -d
    sleep 10
    ./ddl/run-tests.sh
  env:
    DB_HOST: localhost
    DB_NAME: spofe
    DB_USER: postgres
    DB_PASSWORD: spofe_secure_pwd_2026
```

### GitLab CI
```yaml
test:sql:noregressione:
  stage: test
  services:
    - postgres:15-alpine
  script:
    - cd ddl/
    - chmod +x run-tests.sh
    - ./run-tests.sh
  env:
    DB_HOST: postgres
    DB_NAME: spofe
    DB_USER: postgres
    DB_PASSWORD: spofe_secure_pwd_2026
```

### Azure Pipelines
```yaml
- script: |
    docker-compose -f docker-compose.postgres.yml up -d
    sleep 10
    ./ddl/run-tests.sh
  displayName: 'Run SQL Non-Regression Tests'
  env:
    DB_PASSWORD: $(DbPassword)
```

---

## 🧠 Concepts clés

### Transaction rollback automatique
Chaque test commence avec `BEGIN;` et finit avec `ROLLBACK;`:
- ✅ Test n'a pas d'effet persistant
- ✅ Toutes les données de test sont isolées
- ✅ Pas de pollution entre tests

### Tests négatifs = succès DB
```
Test negativo "❌ UPDATE doit échouer" = Test réussi
  → PostgreSQL a correctement rejeté la violation
  → Invariant SILC est respecté
```

### Séparation DB / Guardian

| Garantie | DB | Guardian |
|----------|----|----|
| Immutabilité (UPDATE/DELETE impossible) | ✅ | ✅ |
| FK correctes (Decision→Event→Fact) | ✅ | ✅ |
| Process gouverné | ✅ | ✅ |
| **Audit obligatoire COMPLET** | ⚠️ | ✅ |
| **Sémantique métier** | ✗ | ✅ |

> DB garantit la structure, Guardian garantit la sémantique complète.

---

## 📈 Métriques

### Nombre de tests par suite

| Suite | Neg | Pos | Total |
|-------|-----|-----|-------|
| 01_immutability | 10 | 1 | **11** |
| 02_decision_chain | 3 | 3 | **6** |
| 03_process_registry | 6 | 3 | **9** |
| 04_audit | 4 | 3 | **7** |
| 05_read_model | 5 | 3 | **8** |
| **TOTAL** | **28** | **13** | **41** |

### Couverture d'invariants

| Invariant | Suit | Status |
|-----------|------|--------|
| I-DB-01 (Immutabilité) | 01 | ✅ 11/11 tests |
| I-DB-02 (Chaînage) | 02 | ✅ 6/6 tests |
| I-DB-03 (Process) | 03 | ✅ 9/9 tests |
| I-DB-04 (Audit) | 04 | ⚠️ 7/7 tests (boundary doc) |
| I-DB-07 (Read-model) | 05 | ✅ 8/8 tests |
| **TOTAL** | 5 | ✅ **41/41 tests** |

---

## 🔍 Debugging

### Lire les logs détaillés
```bash
cat .test-logs/spofe_tests_*.log | grep "FAILED\|ERROR"
```

### Exécuter un seul test
```bash
psql -h localhost -U postgres -d spofe < ddl/tests/01_immutability.sql
```

### Voir l'output SQL brut
```bash
psql -h localhost -U postgres -d spofe -f ddl/tests/02_decision_chain.sql 2>&1 | head -50
```

### Vérifier l'état DB après test
```bash
psql -h localhost -U postgres -d spofe -c "\dt public.*"
psql -h localhost -U postgres -d spofe -c "SELECT COUNT(*) FROM decision;"
```

---

## ✅ Checklist avant déploiement

- [ ] Tous les 41 tests passent
- [ ] Logs dans `.test-logs/` sont lisibles
- [ ] Aucun test "FAILED" ou "ERROR"
- [ ] PostgreSQL version 15+ utilisé
- [ ] DDL `spofe-silc-complete.sql` exécuté avant les tests
- [ ] Rôles `spofe_writer` et `spofe_reader` existent
- [ ] Tables write-model ont leurs triggers d'immutabilité
- [ ] Vues `v_current_fact`, `v_audit_trail`, `v_stats` existent

---

## 📞 Support

**Erreur commune:** `psql: could not translate host name "localhost" to address`
→ Docker n'est pas en réseau bridge. Utiliser `docker.host.internal` ou vérifier Docker Desktop settings

**Erreur commune:** `PGPASSWORD deprecated`
→ Utiliser `PGPASSWORD` env var ou `.pgpass` file au lieu de `-W` flag

**Erreur commune:** `relation "decision" does not exist`
→ DDL n'a pas été exécuté. Lancer `psql < ddl/spofe-silc-complete.sql` d'abord

---

## 📚 Ressources

- [DDL complet](./spofe-silc-complete.sql)
- [Invariants SILC v2.1](../RAPPORT_SIGNATURE_OFFICIELLE_GUARDIAN_v4.md)
- [Test negativo philosophy](https://en.wikipedia.org/wiki/Negative_testing)
- [PostgreSQL Constraints](https://www.postgresql.org/docs/current/ddl-constraints.html)

---

**Version:** 1.0  
**Date:** 2026-01-29  
**Maintaineur:** Architecture SILC  
**Status:** ✅ Production-Ready
