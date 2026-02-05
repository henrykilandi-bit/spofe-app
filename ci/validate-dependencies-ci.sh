#!/bin/bash

# SPOFE Dependencies Compliance - CI/CD Integration
# Ce script s'intègre dans le pipeline CI/CD pour bloquer le déploiement
# en cas de violation des contraintes inter-modules

set -e

echo "🔒 SPOFE Dependencies Compliance Check - CI/CD"
echo "================================================"

# Vérification des pré-requis
if [ ! -d "cascade/modules" ]; then
    echo "❌ Modules directory not found: cascade/modules"
    echo "   This script must be run from the SPOFE root directory"
    exit 1
fi

if [ ! -f "package.json" ]; then
    echo "❌ package.json not found"
    echo "   This script must be run from the SPOFE root directory"
    exit 1
fi

# Installation des dépendances si nécessaire
echo "📦 Installing dependencies..."
npm install --silent

# Test de conformité des dépendances
echo "🔍 Running dependencies compliance check..."
if npm run validate:dependencies --silent; then
    echo "✅ Dependencies compliance: PASSED"
else
    echo "❌ Dependencies compliance: FAILED"
    echo ""
    echo "🚫 DEPLOYMENT BLOCKED - Fix dependency violations"
    echo "   Run 'npm run validate:dependencies' locally for details"
    exit 1
fi

# Test unitaire du système de vérification
echo "🧪 Running dependencies system tests..."
if npm run test:dependencies --silent; then
    echo "✅ Dependencies system tests: PASSED"
else
    echo "❌ Dependencies system tests: FAILED"
    echo "   The dependency checker itself has issues"
    exit 1
fi

# Vérification de l'ordre de déploiement
echo "📋 Generating deployment order..."
npm run validate:dependencies --silent > deployment_order.log 2>&1

if grep -q "SUGGESTED DEPLOYMENT ORDER" deployment_order.log; then
    echo "✅ Deployment order generated successfully"
    echo ""
    echo "📦 Ready for BUILD_PROOF certification"
else
    echo "❌ Could not generate deployment order"
    exit 1
fi

# Nettoyage
rm -f deployment_order.log

echo ""
echo "🎉 SPOFE Dependencies Compliance: ALL CHECKS PASSED"
echo "🚀 Ready for production deployment"

exit 0