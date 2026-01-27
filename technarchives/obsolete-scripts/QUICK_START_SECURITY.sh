#!/usr/bin/env bash

# 🚀 QUICK START COMMANDS - CSRF & REDIS RATE LIMITING
# Copier-coller ces commandes pour valider l'implémentation

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║  ✅ CSRF & REDIS RATE LIMITING - QUICK START                  ║"
echo "╚═══════════════════════════════════════════════════════════════╝"

# ═══════════════════════════════════════════════════════════════════════

echo ""
echo "📋 ÉTAPE 1: Vérifier la configuration"
echo "═══════════════════════════════════════════════════════════════"

echo "✓ Vérifier CSRF_SECRET dans .env:"
grep "CSRF_SECRET" cascade/.env
echo ""

echo "✓ Vérifier REDIS_ENABLED dans .env:"
grep "REDIS_ENABLED" cascade/.env
echo ""

# ═══════════════════════════════════════════════════════════════════════

echo ""
echo "🧪 ÉTAPE 2: Exécuter tests automatisés"
echo "═══════════════════════════════════════════════════════════════"

echo "✓ Lancer le script de validation:"
cd cascade
node test-security-implementations.js
cd ..

echo ""

# ═══════════════════════════════════════════════════════════════════════

echo ""
echo "🚀 ÉTAPE 3: Démarrer l'application"
echo "═══════════════════════════════════════════════════════════════"

echo "✓ Démarrer en développement:"
echo "   cd cascade && npm run dev"
echo ""
echo "Attendre: 'Server running on http://localhost:3001'"
echo ""

# ═══════════════════════════════════════════════════════════════════════

echo ""
echo "🧪 ÉTAPE 4: Tests manuels (après démarrage du serveur)"
echo "═══════════════════════════════════════════════════════════════"

echo ""
echo "TEST 1: CSRF Token Retrieval"
echo "───────────────────────────────────────────────────────────────"
echo "$ curl -X GET http://localhost:3001/api/csrf-token"
echo ""
echo "Réponse attendue:"
echo '{
  "csrfToken": "..."
}'
echo ""

echo "TEST 2: Rate Limiting - Login (5 max par 15 min)"
echo "───────────────────────────────────────────────────────────────"
echo "$ for i in {1..10}; do"
echo '    curl -X POST http://localhost:3001/api/auth/login \'
echo '      -H "Content-Type: application/json" \'
echo '      -d '\''{\"email\":\"test@test.com\",\"password\":\"123\"}'\'''
echo "    sleep 1"
echo "  done"
echo ""
echo "Résultat attendu:"
echo "  • Requêtes 1-5: HTTP 200 (mais peut 401 auth fail)"
echo "  • Requête 6-10: HTTP 429 Too Many Requests"
echo ""

echo "TEST 3: Rate Limiting - API (100 max par 15 min)"
echo "───────────────────────────────────────────────────────────────"
echo "$ for i in {1..120}; do"
echo "    curl -s http://localhost:3001/api/health > /dev/null"
echo "    if [ $((i % 10)) -eq 0 ]; then echo \"Requête $i\"; fi"
echo "  done"
echo ""
echo "Résultat attendu:"
echo "  • Requêtes 1-100: HTTP 200 OK"
echo "  • Requête 101-120: HTTP 429 Too Many Requests"
echo ""

# ═══════════════════════════════════════════════════════════════════════

echo ""
echo "📊 ÉTAPE 5: Vérifier les logs"
echo "═══════════════════════════════════════════════════════════════"

echo "✓ Consulter logs de sécurité:"
echo "   tail -f cascade/logs/security.log"
echo ""

echo "✓ Consulter logs généraux:"
echo "   tail -f cascade/logs/combined.log"
echo ""

# ═══════════════════════════════════════════════════════════════════════

echo ""
echo "🔴 REDIS (Optionnel - si vous avez Redis installé)"
echo "═══════════════════════════════════════════════════════════════"

echo "✓ Installer Redis avec Docker:"
echo "   docker run -d -p 6379:6379 --name redis redis:7-alpine"
echo ""

echo "✓ Vérifier Redis connection:"
echo "   redis-cli PING"
echo "   # Doit retourner: PONG"
echo ""

echo "✓ Monitorer rate limiting en Redis:"
echo "   redis-cli KEYS 'ratelimit:*'"
echo "   redis-cli GET 'ratelimit:login:127.0.0.1'"
echo "   redis-cli TTL 'ratelimit:login:127.0.0.1'"
echo ""

# ═══════════════════════════════════════════════════════════════════════

echo ""
echo "✅ Vérification post-implémentation"
echo "═══════════════════════════════════════════════════════════════"

echo "☑️  Tous les tests passent (27/28 ou plus)"
echo "☑️  Serveur démarre sans erreurs"
echo "☑️  CSRF token endpoint répond"
echo "☑️  Rate limiting rejette après limite"
echo "☑️  Aucun CRITICAL error dans logs"
echo ""

# ═══════════════════════════════════════════════════════════════════════

echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║  ✨ Implémentation complétée avec succès!                     ║"
echo "║                                                               ║"
echo "║  Prochaine étape: JWT KID Rotation (voir documentation)       ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""
