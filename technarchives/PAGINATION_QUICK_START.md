# 📄 PAGINATION SÉCURISÉE - GUIDE RAPIDE

## ⚡ 5 minutes pour comprendre

### Le Problème
```javascript
// ❌ DANGEREUX - Sans pagination
GET /api/entries  // Retourne 1 MILLION de lignes!
// Crash DB, crash mémoire, fuite de données

// ✅ SÉCURISÉ - Avec pagination
GET /api/entries?page=1&limit=50  // 50 lignes max
```

### La Solution: 3 Couches de Protection

```
1. VALIDATION
   ✓ page: 1-10,000
   ✓ limit: 1-100
   ✓ Contexte multi-tenant obligatoire

2. RATE LIMITING
   ✓ 100 requêtes / minute par utilisateur
   ✓ Blocage après dépassement

3. DÉTECTION PATTERNS SUSPECTS
   ✓ Scans rapides détectés
   ✓ Offsets impossibles limités
   ✓ Logging automatique
```

### Usage Immédiat

```bash
# 1. Voir les statistiques
npm run pagination:stats

# 2. Analyser les patterns N+1
npm run pagination:analyze

# 3. Audit de sécurité
npm run pagination:security:audit

# 4. Tests unitaires
npm run pagination:test
```

### Endpoints Disponibles

```javascript
// 📄 Liste paginée
GET /api/secure-journal/entries?page=1&limit=50

// 🔍 Recherche
GET /api/secure-journal/search?q=facture&page=1&limit=20

// 📤 Export (max 10,000 lignes)
GET /api/secure-journal/export?format=csv&startDate=2024-01-01&endDate=2024-12-31

// 📊 Stats (admin only)
GET /api/secure-journal/stats

// 🔄 Reset stats (admin only)
POST /api/secure-journal/stats/reset
```

### Réponse Standard

```json
{
  "success": true,
  "data": [
    { "id": 1, "reference": "F001", "entry_date": "2024-01-15", "status": "posted" },
    { "id": 2, "reference": "F002", "entry_date": "2024-01-16", "status": "draft" }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 523,
    "totalPages": 11,
    "hasMore": true,
    "nextOffset": 50
  },
  "metadata": {
    "optimized": true,
    "queryTime": 245,
    "cacheHit": true,
    "timestamp": "2024-01-20T14:30:00Z"
  }
}
```

### Patterns Détectés Automatiquement

✅ **Cache Hit Rate**: Voir le % de réutilisation
✅ **Slow Queries**: >2s = alerte automatique
✅ **Rate Limit**: 100 requêtes/min par utilisateur
✅ **Suspicious Patterns**: Scans rapides bloqués
✅ **Multi-tenant Isolation**: Compagnie obligatoire

### Commandes Essentielles

```bash
# Production: Bloquer requêtes sans pagination
npm run security:block-no-pagination

# Test: 100% couverture de sécurité
npm run pagination:test

# Monitor: Statistiques en temps réel
npm run pagination:stats:watch

# Audit: Sécurité complète
npm run pagination:security:audit
```

### Best Practices

1. **Toujours paginer** les listes (sauf detail par ID)
2. **Utiliser limit=50** par défaut
3. **Activer cursor pagination** pour très gros datasets
4. **Monitorer cache hit rate** (viser >60%)
5. **Logger les patterns suspects**

### Statuts Santé

```
✅ HEALTHY   - Tout fonctionne (hit rate >60%)
⚠️  DEGRADED - Performance dégradée (hit rate 20-60%)
🔴 WARNING   - Patterns suspects détectés
🚨 CRITICAL  - Attaque potentielle
```

## Voir Plus

- **Guide Complet**: [PAGINATION_SECURITY_GUIDE.md](./PAGINATION_SECURITY_GUIDE.md)
- **Index Navigation**: [PAGINATION_INDEX.md](./PAGINATION_INDEX.md)
- **Tests**: `npm run pagination:test`
- **API Docs**: `/api/secure-journal/documentation`
