#!/bin/bash
# Frontend Contract Enforcer - Validation Script
# Automatise les checks du contrat frontend
# Usage: ./validate-fce.sh

set -e

echo "═══════════════════════════════════════════════════════════"
echo "  SPOFE Frontend Contract Enforcer - Validation"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

EXIT_CODE=0

# ═══════════════════════════════════════════════════════════
# 1. CHECK: Pas de fetch() direct
# ═══════════════════════════════════════════════════════════
echo -e "${YELLOW}[1/5]${NC} Vérification: Pas de fetch() en dehors de FCE..."

if grep -r "fetch(" src/ --include="*.ts" --include="*.js" --include="*.tsx" --include="*.jsx" \
  | grep -v "spofe-contract" \
  | grep -v "__tests__" \
  | grep -v "node_modules"; then
  echo -e "${RED}✗ ÉCHEC${NC}: fetch() détecté en dehors de spofe-contract"
  EXIT_CODE=1
else
  echo -e "${GREEN}✓ PASSÉ${NC}: Aucun fetch() direct"
fi

echo ""

# ═══════════════════════════════════════════════════════════
# 2. CHECK: Pas de localStorage/sessionStorage métier
# ═══════════════════════════════════════════════════════════
echo -e "${YELLOW}[2/5]${NC} Vérification: Pas de localStorage métier..."

if grep -r "localStorage\|sessionStorage" src/ --include="*.ts" --include="*.js" --include="*.tsx" --include="*.jsx" \
  | grep -E "status|balance|aggregate|amount|permission" \
  | grep -v "spofe-contract" \
  | grep -v "__tests__" \
  | grep -v "node_modules"; then
  echo -e "${RED}✗ ÉCHEC${NC}: localStorage métier détecté"
  EXIT_CODE=1
else
  echo -e "${GREEN}✓ PASSÉ${NC}: Aucun localStorage métier"
fi

echo ""

# ═══════════════════════════════════════════════════════════
# 3. CHECK: Pas de logique métier dans les vues
# ═══════════════════════════════════════════════════════════
echo -e "${YELLOW}[3/5]${NC} Vérification: Pas de logique métier dans les vues..."

# Patterns suspects: if(status), if(balance), etc.
SUSPECT_PATTERNS=0

if grep -r "if.*\.status\|if.*\.balance\|if.*\.closed\|if.*\.approved" \
  src/components/ --include="*.tsx" --include="*.jsx" \
  2>/dev/null | grep -v "__tests__"; then
  echo -e "${YELLOW}⚠ AVERTISSEMENT${NC}: Logique métier potentielle dans les vues"
  SUSPECT_PATTERNS=1
fi

if [ $SUSPECT_PATTERNS -eq 0 ]; then
  echo -e "${GREEN}✓ PASSÉ${NC}: Aucune logique métier suspecte"
fi

echo ""

# ═══════════════════════════════════════════════════════════
# 4. CHECK: Tous les imports FCE utilisent le point d'entrée
# ═══════════════════════════════════════════════════════════
echo -e "${YELLOW}[4/5]${NC} Vérification: Imports FCE cohérents..."

if grep -r "from '@/core/spofe-contract/" src/ --include="*.ts" --include="*.js" --include="*.tsx" --include="*.jsx" \
  | grep -v "index.js" \
  | grep -v "spofe-contract/" \
  | grep -v "__tests__" \
  | grep -v "node_modules"; then
  echo -e "${RED}✗ ÉCHEC${NC}: Import direct depuis un sous-module FCE"
  echo "    → Utiliser: import { ... } from '@/core/spofe-contract'"
  EXIT_CODE=1
else
  echo -e "${GREEN}✓ PASSÉ${NC}: Tous les imports FCE correctement structurés"
fi

echo ""

# ═══════════════════════════════════════════════════════════
# 5. CHECK: Contract charger au startup
# ═══════════════════════════════════════════════════════════
echo -e "${YELLOW}[5/5]${NC} Vérification: Contrat chargé au startup..."

if grep -r "loadContract()" src/main.ts src/index.ts src/app.ts --include="*.ts" --include="*.js" 2>/dev/null; then
  echo -e "${GREEN}✓ PASSÉ${NC}: Contract chargé au startup"
else
  echo -e "${YELLOW}⚠ AVERTISSEMENT${NC}: loadContract() non détecté au startup"
  echo "    → Ajouter dans main.ts: await loadContract()"
fi

echo ""

# ═══════════════════════════════════════════════════════════
# RÉSUMÉ
# ═══════════════════════════════════════════════════════════
echo "═══════════════════════════════════════════════════════════"

if [ $EXIT_CODE -eq 0 ]; then
  echo -e "${GREEN}✓ TOUS LES CHECKS PASSÉS${NC}"
  echo "  Frontend respecte le contrat SPOFE"
else
  echo -e "${RED}✗ VALIDATION ÉCHOUÉE${NC}"
  echo "  Veuillez corriger les violations avant de merger"
fi

echo "═══════════════════════════════════════════════════════════"
echo ""

exit $EXIT_CODE
