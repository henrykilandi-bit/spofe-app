# 🌐 SOLUTION #7: CORS Dynamique

## 🎯 Objectif

Configuration CORS dynamique avec whitelist par environnement et logging des tentatives bloquées.

## ✅ BÉNÉFICES

- ✅ Whitelist différente dev/production
- ✅ Logging CORS refusés
- ✅ maxAge 24h (cache)
- ✅ Support localhost + 127.0.0.1

## 📝 INSTRUCTIONS (RAPIDE)

```bash
# 1. Copier config CORS
cp cors.js ../../cascade/src/config/

# 2. Modifier cascade/src/app.js (ligne ~15)
# Remplacer:
#   import cors from 'cors';
#   app.use(cors({ origin: process.env.CORS_ORIGIN }));
# Par:
#   import corsConfig from './config/cors.js';
#   app.use(cors(corsConfig));

# 3. Tester
npm run dev
```

Voir [README.md](README.md) pour détails.
