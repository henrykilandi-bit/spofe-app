#!/bin/bash

# 🧪 TEST RAPIDE - Surveillance des Fichiers Critiques SPOFE v2.1
# Objectif: Tester que tout fonctionne en 2 minutes

echo "════════════════════════════════════════════════════════════"
echo "🧪 TEST RAPIDE - SPOFE Monitoring"
echo "════════════════════════════════════════════════════════════"
echo ""

# Test 1: Vérifier répertoire cascade
echo "✓ Test 1: Vérifier répertoire cascade..."
if [ -d "cascade" ]; then
  echo "  ✅ Répertoire cascade trouvé"
else
  echo "  ❌ Répertoire cascade manquant"
  exit 1
fi

# Test 2: Vérifier fichier .env
echo ""
echo "✓ Test 2: Vérifier fichier .env..."
if [ -f "cascade/.env" ]; then
  echo "  ✅ Fichier .env existe"
  # Compter variables
  VARS=$(grep -c "^[A-Z_].*=" cascade/.env)
  echo "  📊 Variables trouvées: $VARS"
  if [ "$VARS" -ge 15 ]; then
    echo "  ✅ Nombre de variables suffisant"
  else
    echo "  ⚠️  Moins de 15 variables (trouvé: $VARS)"
  fi
else
  echo "  ❌ Fichier .env manquant"
fi

# Test 3: Vérifier package.json
echo ""
echo "✓ Test 3: Vérifier package.json..."
if [ -f "cascade/package.json" ]; then
  echo "  ✅ Fichier package.json existe"
  # Vérifier JSON valide
  if python3 -m json.tool cascade/package.json > /dev/null 2>&1; then
    echo "  ✅ JSON valide"
  else
    echo "  ❌ JSON invalide"
  fi
else
  echo "  ❌ Fichier package.json manquant"
fi

# Test 4: Vérifier fichiers critiques config
echo ""
echo "✓ Test 4: Vérifier fichiers config critiques..."
CRITICAL_CONFIG=(
  "cascade/.sequelizerc"
  "cascade/babel.config.json"
  "cascade/.eslintrc.cjs"
)
for file in "${CRITICAL_CONFIG[@]}"; do
  if [ -f "$file" ]; then
    echo "  ✅ $file"
  else
    echo "  ❌ $file"
  fi
done

# Test 5: Vérifier fichiers BD
echo ""
echo "✓ Test 5: Vérifier fichiers Base de Données..."
CRITICAL_DB=(
  "cascade/src/config/database.js"
  "cascade/src/models/user.model.js"
  "cascade/src/models/chartOfAccount.model.js"
  "cascade/src/models/associations.js"
)
for file in "${CRITICAL_DB[@]}"; do
  if [ -f "$file" ]; then
    echo "  ✅ $file"
  else
    echo "  ❌ $file"
  fi
done

# Test 6: Vérifier fichiers Sécurité
echo ""
echo "✓ Test 6: Vérifier fichiers Sécurité..."
CRITICAL_SECURITY=(
  "cascade/src/middleware/auth.middleware.js"
  "cascade/src/middleware/security.middleware.js"
  "cascade/src/middleware/tokenBlacklist.middleware.js"
  "cascade/src/middleware/rateLimit.middleware.js"
)
for file in "${CRITICAL_SECURITY[@]}"; do
  if [ -f "$file" ]; then
    echo "  ✅ $file"
  else
    echo "  ❌ $file"
  fi
done

# Test 7: Vérifier dossier logs
echo ""
echo "✓ Test 7: Vérifier dossier logs..."
if [ -d "cascade/logs" ]; then
  echo "  ✅ Dossier logs existe"
  # Taille totale
  SIZE=$(du -sh cascade/logs | cut -f1)
  echo "  📊 Taille: $SIZE"
else
  echo "  ⚠️  Dossier logs manquant (sera créé à l'exécution)"
fi

# Test 8: Vérifier dossier monitoring
echo ""
echo "✓ Test 8: Vérifier dossier monitoring..."
if [ -d "cascade/monitoring" ]; then
  echo "  ✅ Dossier monitoring existe"
else
  echo "  ⚠️  Dossier monitoring manquant (création recommandée)"
  mkdir -p cascade/monitoring
  echo "  ✅ Dossier créé"
fi

# Test 9: Vérifier script monitoring
echo ""
echo "✓ Test 9: Vérifier script monitoring..."
if [ -f "cascade/src/scripts/monitoring-surveillance.js" ]; then
  echo "  ✅ Script monitoring-surveillance.js existe"
  # Compter lignes
  LINES=$(wc -l < cascade/src/scripts/monitoring-surveillance.js)
  echo "  📊 Lignes: $LINES"
else
  echo "  ❌ Script monitoring-surveillance.js manquant"
fi

# Test 10: Vérifier scripts NPM
echo ""
echo "✓ Test 10: Vérifier scripts NPM..."
if grep -q "monitor:critical" cascade/package.json; then
  echo "  ✅ Script 'monitor:critical' trouvé"
else
  echo "  ⚠️  Script 'monitor:critical' manquant"
fi

if grep -q "sync:db" cascade/package.json; then
  echo "  ✅ Script 'sync:db' trouvé"
else
  echo "  ⚠️  Script 'sync:db' manquant"
fi

# Test 11: Vérifier Node.js
echo ""
echo "✓ Test 11: Vérifier Node.js..."
if command -v node &> /dev/null; then
  NODE_VERSION=$(node --version)
  echo "  ✅ Node.js $NODE_VERSION installé"
else
  echo "  ❌ Node.js non installé"
fi

# Test 12: Vérifier NPM
echo ""
echo "✓ Test 12: Vérifier NPM..."
if command -v npm &> /dev/null; then
  NPM_VERSION=$(npm --version)
  echo "  ✅ NPM $NPM_VERSION installé"
else
  echo "  ❌ NPM non installé"
fi

# Test 13: Vérifier dépendances critiques
echo ""
echo "✓ Test 13: Vérifier dépendances critiques..."
cd cascade
CRITICAL_DEPS=("express" "sequelize" "jsonwebtoken" "bcrypt" "redis" "winston")
for dep in "${CRITICAL_DEPS[@]}"; do
  if npm list "$dep" > /dev/null 2>&1; then
    echo "  ✅ $dep"
  else
    echo "  ⚠️  $dep manquant"
  fi
done
cd ..

# Résumé
echo ""
echo "════════════════════════════════════════════════════════════"
echo "✅ TESTS COMPLÉTÉS"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "📋 Prochaines étapes:"
echo ""
echo "1️⃣  Exécuter surveillance:"
echo "   cd cascade && npm run monitor:critical"
echo ""
echo "2️⃣  Vérifier rapport:"
echo "   tail -100 cascade/logs/surveillance.log"
echo ""
echo "3️⃣  Configurer cronjob:"
echo "   crontab -e"
echo "   # Ajouter: 0 * * * * cd /chemin/cascade && npm run monitor:critical"
echo ""
echo "4️⃣  Consulter documentation:"
echo "   cat FICHIERS_CRITIQUES_A_SURVEILLER.md"
echo "   cat GUIDE_IMPLEMENTATION_SURVEILLANCE.md"
echo ""
echo "════════════════════════════════════════════════════════════"
