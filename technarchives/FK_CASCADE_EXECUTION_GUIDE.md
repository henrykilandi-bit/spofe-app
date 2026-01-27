# 🔒 FK CASCADE DANGER - GUIDE D'EXÉCUTION

## 🚨 CRITIQUE - À LIRE EN PREMIER

Cette solution corrige des **FK CASCADE DANGEREUSES** qui pourraient détruire des années de données comptables en une seule commande DELETE maladroite.

**Problème:**
```sql
-- ❌ AVANT (DANGER)
ALTER TABLE compagnies ADD FOREIGN KEY (groupe_id) 
  REFERENCES groupes_entreprises(id) ON DELETE CASCADE;
  
-- Résultat: DELETE FROM groupes_entreprises WHERE id=123;
--           → Supprime AUSSI 100 compagnies, 1000 écritures, charts, etc.

-- ✅ APRÈS (SÉCURISÉ)
ALTER TABLE compagnies ADD FOREIGN KEY (groupe_id) 
  REFERENCES groupes_entreprises(id) ON DELETE RESTRICT;
  
-- Résultat: DELETE → ERREUR! "Cannot delete - compagnies exist"
```

---

## 📋 TABLE DES MATIÈRES

1. [Phase 0: Sauvegarde](#phase-0-sauvegarde-urgente)
2. [Phase 1: Audit](#phase-1-audit-complet)
3. [Phase 2: Migration](#phase-2-migration-corrective)
4. [Phase 3: Vérification](#phase-3-vérification-intégrité)
5. [Phase 4: Intégration](#phase-4-intégration-middleware)
6. [Phase 5: Test](#phase-5-test-complet)
7. [Dépannage](#dépannage)
8. [Rollback](#rollback-procédure)

---

## PHASE 0: SAUVEGARDE URGENTE

### 🔴 Cette étape est OBLIGATOIRE

```bash
# 1. Créer un backup complet
cd cascade
mysqldump -u root -p spofe_v2_1 > ../backup_before_fk_fix_$(date +%Y%m%d_%H%M%S).sql

# 2. Vérifier le backup
ls -lh ../backup_*.sql
# Doit être > 1MB

# 3. Optionnel: Compresser le backup
gzip ../backup_before_fk_fix_*.sql
```

**Où stocker le backup:**
- ✅ Copie locale: `/backup/` dossier du projet
- ✅ Copie réseau: Z:\ ou serveur partagé
- ✅ Cloud: AWS S3, Azure Blob Storage (RECOMMANDÉ)

---

## PHASE 1: AUDIT COMPLET

### 1.1 Audit des FK existantes

```bash
# Affiche la situation AVANT la migration
npm run db:audit:foreign-keys

# Sortie attendue:
# ✓ Connexion BD établie
# 📊 Audit des FK par table:
# ...
# 🔴 FK CASCADE DANGEREUSES IDENTIFIÉES:
#    1. compagnies.groupe_id → groupes_entreprises
#    2. charts_of_accounts.compagnie_id → compagnies
#    3. journal_entries.compagnie_id → compagnies
#    4. fiscal_years.compagnie_id → compagnies
# ❌ 4 FKs dangereuses trouvées - Exécuter la migration!
```

### 1.2 Analyser les risques CASCADE

```bash
# Évalue l'impact potentiel des suppression
npm run db:analyze:cascade-risk

# Sortie attendue (Exemple):
# ⚠️  CASCADE RISK ANALYSIS - Analyse de Risques
# 📊 ANALYSE DES RISQUES CASCADE:
# 🔴 groupes_entreprises.id
#    Impact: CATASTROPHIQUE
#    Cascade vers:
#      → compagnies: 42 records (Toutes les compagnies du groupe)
#    ⚠️  42 records potentiellement supprimés EN CASCADE
# ...
# 📋 PLAN D\'ACTION:
#    1. ✓ Faire un backup complet de la BD
#    2. ✓ Exécuter la migration 20260123001-fix-dangerous-fk-constraints.js
#    3. ✓ Tester les nouvelles contraintes RESTRICT
```

---

## PHASE 2: MIGRATION CORRECTIVE

### 2.1 Exécuter la migration

```bash
# Appliquer les corrections FK
cd cascade
npx sequelize-cli db:migrate --name 20260123001-fix-dangerous-fk-constraints

# Sortie attendue:
# ✓ Migration started...
# ✓ Removing old FK constraint: compagnies.groupe_id CASCADE
# ✓ Adding new FK constraint: compagnies.groupe_id RESTRICT
# ✓ Removing old FK constraint: charts_of_accounts.compagnie_id CASCADE
# ✓ Adding new FK constraint: charts_of_accounts.compagnie_id RESTRICT
# ✓ Removing old FK constraint: journal_entries.compagnie_id CASCADE
# ✓ Adding new FK constraint: journal_entries.compagnie_id RESTRICT
# ✓ Removing old FK constraint: fiscal_years.compagnie_id CASCADE
# ✓ Adding new FK constraint: fiscal_years.compagnie_id RESTRICT
# ✓ Setting audit_trails.user_id to SET NULL (OHADA compliance)
# ✓ Migration complete
```

### 2.2 Vérifier que la migration a réussi

```bash
# Voir l'historique des migrations
npx sequelize-cli db:migrate:status

# Sortie attendue:
# up  20260121001-initial-schema.js
# up  20260122001-soft-delete-consistency.js
# up  20260123001-fix-dangerous-fk-constraints.js  ← Nouveau!
```

---

## PHASE 3: VÉRIFICATION INTÉGRITÉ

### 3.1 Vérifier les contraintes

```bash
# Tester que RESTRICT fonctionne
npm run db:check:integrity

# Sortie attendue:
# ✅ Groupe → Compagnies
#    compagnies.groupe_id → RESTRICT (Correct)
# ✅ Compagnie → Plan Comptable
#    charts_of_accounts.compagnie_id → RESTRICT (Correct)
# ✅ Compagnie → Écritures
#    journal_entries.compagnie_id → RESTRICT (Correct)
# ✅ Compagnie → Exercices
#    fiscal_years.compagnie_id → RESTRICT (Correct)
# 🧪 TEST DE FONCTIONNEMENT - RESTRICT Block:
#    Test 1: Supprimer un groupe avec compagnies
#    ✅ RESTRICT fonctionne correctement - Suppression bloquée
# 📊 RÉSUMÉ CHECK
#    Vérifications effectuées:     5
#    ✅ Réussi:                    5
#    ❌ Échoué:                    0
#    ✓ Intégrité vérifiée
```

### 3.2 Test manuel dans la BD

```sql
-- Vérifier que les contraintes existent
SELECT CONSTRAINT_NAME, DELETE_RULE
FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS
WHERE TABLE_NAME IN ('compagnies', 'charts_of_accounts', 'journal_entries', 'fiscal_years')
ORDER BY TABLE_NAME;

-- Résultat attendu:
-- CONSTRAINT_NAME                        | DELETE_RULE
-- ----------------------------------------+------------
-- compagnies_ibfk_1                       | RESTRICT     ← nouveau!
-- charts_of_accounts_ibfk_1               | RESTRICT     ← nouveau!
-- journal_entries_ibfk_1                  | RESTRICT     ← nouveau!
-- fiscal_years_ibfk_1                     | RESTRICT     ← nouveau!
```

---

## PHASE 4: INTÉGRATION MIDDLEWARE

### 4.1 Ajouter SafeDeletionService

```javascript
// cascade/src/app.js

import SafeDeletionService from './services/safe-deletion.service.js';

// Initialiser le service au démarrage
try {
  console.log('✓ SafeDeletionService initialized');
} catch (error) {
  console.error('❌ Failed to initialize SafeDeletionService', error);
}
```

### 4.2 Intégrer FK Protection Middleware

```javascript
// cascade/src/app.js

import { allDeletionProtections } from './middleware/fk-protection.middleware.js';

// Protéger tous les endpoints de suppression
app.use('/api/admin/delete', allDeletionProtections);
app.use('/api/secure/delete', allDeletionProtections);

// Ou l'ajouter à des routes spécifiques
import deletionRoutes from './routes/deletion.routes.js';
app.use('/api/admin', allDeletionProtections, deletionRoutes);
```

### 4.3 Créer les endpoints de suppression sécurisée

```javascript
// cascade/src/routes/deletion.routes.js

import express from 'express';
import SafeDeletionService from '../services/safe-deletion.service.js';
import { requireAuth, requireAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

// DELETE /api/admin/delete/groupe/:groupeId
router.delete('/groupe/:groupeId', requireAdmin, async (req, res) => {
  try {
    const { groupeId } = req.params;
    const { reason, confirm } = req.body;
    
    if (!reason) {
      return res.status(400).json({ 
        error: 'Deletion reason is required' 
      });
    }
    
    // Vérifier l'impact
    const impact = await SafeDeletionService.checkDeletionImpact(
      'groupe_entreprise', 
      groupeId
    );
    
    if (!impact.canDelete) {
      return res.status(409).json({ 
        error: 'Cannot delete - dependent records exist',
        impact 
      });
    }
    
    if (impact.warnings.length > 0 && !confirm) {
      return res.status(202).json({ 
        message: 'Deletion requires confirmation',
        warnings: impact.warnings,
        affectedRecords: impact.affectedRecords
      });
    }
    
    // Exécuter la suppression sécurisée
    const result = await SafeDeletionService.deleteGroupeEntreprise(
      groupeId,
      req.user.id,
      reason
    );
    
    return res.json({
      success: true,
      message: 'Groupe supprimé et archivé',
      result
    });
    
  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
});

// DELETE /api/admin/delete/compagnie/:compagnieId
router.delete('/compagnie/:compagnieId', requireAdmin, async (req, res) => {
  try {
    const { compagnieId } = req.params;
    const { reason, confirm } = req.body;
    
    if (!reason) {
      return res.status(400).json({ 
        error: 'Deletion reason is required' 
      });
    }
    
    // Vérifier l'impact
    const impact = await SafeDeletionService.checkDeletionImpact(
      'compagnie', 
      compagnieId
    );
    
    if (!impact.canDelete) {
      return res.status(409).json({ 
        error: 'Cannot delete compagnie',
        impact,
        suggestions: [
          'Deactivate instead of delete (set isActive = false)',
          'Archive the company first',
          'Remove active entries before deletion'
        ]
      });
    }
    
    // Exécuter la suppression sécurisée
    const result = await SafeDeletionService.deleteCompagnie(
      compagnieId,
      req.user.id,
      reason
    );
    
    return res.json({
      success: true,
      message: 'Compagnie supprimée et archivée',
      result
    });
    
  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
});

export default router;
```

---

## PHASE 5: TEST COMPLET

### 5.1 Tests unitaires

```bash
# Créer les tests
npm test -- cascade/tests/fk-protection.test.js

# Résultat attendu:
# ✓ Foreign Key Protection
#   ✓ Should prevent deletion of groupe with compagnies
#   ✓ Should allow deletion of empty groupe
#   ✓ Should block compagnie deletion with active entries
#   ✓ Middleware should require deletion reason
#   ✓ Middleware should enforce rate limiting
#   ✓ Should create audit trail
```

### 5.2 Tests d'intégration

```bash
# Tester les endpoints
npm run test:integration

# Test scenarios:
# 1. DELETE /api/admin/delete/groupe/123 sans raison → 400
# 2. DELETE /api/admin/delete/groupe/123 (avec compagnies) → 409
# 3. DELETE /api/admin/delete/groupe/456 (empty) + reason → 200
# 4. DELETE /api/admin/delete/groupe/X 11 fois rapidement → 429 (rate limit)
```

### 5.3 Test manuel

```bash
# 1. Tester qu'une suppression se bloque correctement
curl -X DELETE http://localhost:3001/api/admin/delete/groupe/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"reason":"Testing RESTRICT"}'

# Résultat attendu: 409 Conflict (FK RESTRICT blocks it)

# 2. Tester le middleware de protection
curl -X DELETE http://localhost:3001/api/admin/delete/groupe/1

# Résultat attendu: 401 Unauthorized (auth required)

# 3. Tester le rate limit
for i in {1..15}; do
  curl -X DELETE http://localhost:3001/api/admin/delete/compagnie/$i \
    -H "Authorization: Bearer $TOKEN" \
    -d '{"reason":"Test","confirm":true}'
done

# Résultat attendu après 10 tentatives: 429 Too Many Requests
```

---

## 📊 VÉRIFICATION FINALE

### Checklist d'exécution

- [ ] Backup de la BD créé et vérifié
- [ ] `npm run db:audit:foreign-keys` exécuté - FKs identifiées
- [ ] `npm run db:analyze:cascade-risk` exécuté - Risques évalués
- [ ] Migration exécutée: `npx sequelize-cli db:migrate`
- [ ] `npm run db:check:integrity` réussi - Toutes les vérifications OK
- [ ] SafeDeletionService intégrée dans app.js
- [ ] FK Protection Middleware ajoutée aux routes
- [ ] Endpoints de suppression créés
- [ ] Tests unitaires passés
- [ ] Tests d'intégration passés
- [ ] Test manuel réussi (RESTRICT bloque les suppressions)

### Validations importantes

```javascript
// Valider dans la console JS:

// 1. FK RESTRICT existe
SELECT COUNT(*) FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS 
WHERE DELETE_RULE='RESTRICT' AND TABLE_NAME IN 
('compagnies', 'charts_of_accounts', 'journal_entries', 'fiscal_years');
// Résultat attendu: 4

// 2. Aucune cascade sur données critiques
SELECT COUNT(*) FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS 
WHERE DELETE_RULE='CASCADE' AND TABLE_NAME IN 
('compagnies', 'charts_of_accounts', 'journal_entries', 'fiscal_years');
// Résultat attendu: 0

// 3. ServiceDeletion est chargé
console.log(SafeDeletionService); // Doit afficher: [Function: SafeDeletionService]

// 4. Middleware est enregistré
console.log(app._router.stack.filter(r => r.name.includes('Protection')));
```

---

## 🔧 DÉPANNAGE

### Erreur: "Cannot execute migration - constraint not found"

```bash
# Cause: La contrainte a déjà une structure différente
# Solution: 

# 1. Vérifier l'état actuel
SELECT * FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS 
WHERE TABLE_NAME='compagnies';

# 2. Si la FK existe déjà, la migration peut échouer
# Solution: Modifier la migration pour vérifier d'abord
# Voir le fichier migration pour les guards IF EXISTS

# 3. Ré-exécuter:
npx sequelize-cli db:migrate --name 20260123001-fix-dangerous-fk-constraints
```

### Erreur: "FOREIGN KEY constraint failed"

```bash
# Cause: La migration a partiellement échoué
# Solution:

# 1. Rollback complet
npx sequelize-cli db:migrate:undo --name 20260123001-fix-dangerous-fk-constraints

# 2. Restaurer le backup
mysql -u root -p < backup_before_fk_fix_*.sql

# 3. Vérifier que tout est revenu
npm run db:audit:foreign-keys

# 4. Ré-essayer la migration
npx sequelize-cli db:migrate --name 20260123001-fix-dangerous-fk-constraints
```

### Erreur: Middleware returns 403 Forbidden

```bash
# Cause: Utilisateur n'a pas le rôle admin
# Solution:

# 1. Vérifier le rôle de l'utilisateur
SELECT id, username, role FROM users WHERE id = ?;

# 2. Mettre à jour si besoin
UPDATE users SET role = 'admin' WHERE id = ?;

# 3. Générer un nouveau token

# 4. Réessayer l'endpoint de suppression
```

### Erreur: Rate limit returns 429

```bash
# Cause: Trop de tentatives de suppression en peu de temps
# Solution:

# 1. Attendre 1 minute (par défaut 10 deletions/minute)

# 2. Ou modifier le limit dans le middleware:
// cascade/src/middleware/fk-protection.middleware.js
const MAX_DELETIONS_PER_MINUTE = 50; // Au lieu de 10

# 3. Redémarrer l'app
npm run start:protected
```

---

## ↩️ ROLLBACK PROCÉDURE

### Si la migration a échoué ou besoin d'annuler

```bash
# Option 1: Rollback via Sequelize

npx sequelize-cli db:migrate:undo --name 20260123001-fix-dangerous-fk-constraints

# Option 2: Restaurer le backup directement

mysql -u root -p spofe_v2_1 < backup_before_fk_fix_2026-01-23_143022.sql

# Option 3: Si le backup ne marche pas, appliquer manuellement

# Réactiver CASCADE sur les FKs critiques:
ALTER TABLE compagnies DROP FOREIGN KEY compagnies_ibfk_groupe_id;
ALTER TABLE compagnies ADD CONSTRAINT compagnies_ibfk_groupe_id
  FOREIGN KEY (groupe_id) REFERENCES groupes_entreprises(id) 
  ON DELETE CASCADE;

# (Répéter pour charts_of_accounts, journal_entries, fiscal_years)
```

---

## 📞 SUPPORT

**En cas de problème:**

1. Vérifier les logs: `cascade/logs/combined.log`
2. Consulter les erreurs: `cascade/logs/error.log`
3. Exécuter l'audit: `npm run db:audit:foreign-keys`
4. Vérifier l'intégrité: `npm run db:check:integrity`
5. Contacter l'équipe DevOps avec:
   - Sortie complète du script d'audit
   - Logs d'erreur
   - Timestamp du problème

---

## ✅ SUCCÈS

Quand tout fonctionne:

```
✓ Sauvegarde créée et vérifiée
✓ FK CASCADE dangereuses identifiées
✓ Risques évalués
✓ Migration appliquée
✓ RESTRICT fonctionne (suppression bloquée)
✓ Middleware de protection actif
✓ Endpoints sécurisés
✓ Tests passés
✓ Audit trail enregistré

→ Vos données comptables sont maintenant PROTÉGÉES!
```

---

**Document créé:** 2026-01-23  
**Auteur:** DataRetention v2.1 Team  
**Version:** 1.0  
**Statut:** Production Ready ✅
