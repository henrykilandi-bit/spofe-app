#!/bin/bash

# AGA Integration Validation Script
# ==================================
# Vérifie que tous les fichiers AGA sont en place et opérationnels

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "═══════════════════════════════════════════════════════════════════════"
echo "AGA Integration Validation"
echo "═══════════════════════════════════════════════════════════════════════"
echo -e "${NC}"

# Counter
CHECKS_PASSED=0
CHECKS_FAILED=0
CHECKS_WARNING=0

# Helper functions
check_pass() {
  echo -e "${GREEN}✅ $1${NC}"
  ((CHECKS_PASSED++))
}

check_fail() {
  echo -e "${RED}❌ $1${NC}"
  ((CHECKS_FAILED++))
}

check_warn() {
  echo -e "${YELLOW}⚠️  $1${NC}"
  ((CHECKS_WARNING++))
}

# =============================================================================
# 1. Configuration Files
# =============================================================================
echo -e "\n${BLUE}1. Configuration Files${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -f "aga.config.json" ]; then
  check_pass "aga.config.json exists"
  
  # Validate JSON
  if jq empty aga.config.json 2>/dev/null; then
    check_pass "aga.config.json is valid JSON"
    
    # Check required keys
    if jq -e '.projectName' aga.config.json > /dev/null 2>&1; then
      check_pass "aga.config.json has projectName"
    else
      check_fail "aga.config.json missing projectName"
    fi
    
    if jq -e '.rules' aga.config.json > /dev/null 2>&1; then
      local rule_count=$(jq '.rules | length' aga.config.json)
      check_pass "aga.config.json has $rule_count rules"
    else
      check_fail "aga.config.json missing rules"
    fi
    
    if jq -e '.layers' aga.config.json > /dev/null 2>&1; then
      local layer_count=$(jq '.layers | length' aga.config.json)
      check_pass "aga.config.json has $layer_count layers"
    else
      check_fail "aga.config.json missing layers"
    fi
  else
    check_fail "aga.config.json is not valid JSON"
  fi
else
  check_fail "aga.config.json does not exist"
fi

# =============================================================================
# 2. CLI Implementation
# =============================================================================
echo -e "\n${BLUE}2. CLI Implementation${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -f "aga/index.ts" ]; then
  check_pass "aga/index.ts exists"
  
  # Check for main classes/functions
  if grep -q "class AGA" aga/index.ts; then
    check_pass "AGA class defined"
  else
    check_fail "AGA class not found"
  fi
  
  if grep -q "checkLayerSeparation" aga/index.ts; then
    check_pass "Layer separation check implemented"
  else
    check_fail "Layer separation check not found"
  fi
  
  if grep -q "checkCommandPurity" aga/index.ts; then
    check_pass "Command purity check implemented"
  else
    check_fail "Command purity check not found"
  fi
else
  check_fail "aga/index.ts does not exist"
fi

# Check for package.json scripts
if [ -f "package.json" ]; then
  if grep -q "ts-node" package.json 2>/dev/null || command -v ts-node &> /dev/null; then
    check_pass "ts-node available"
  else
    check_warn "ts-node not found - run: npm install --save-dev ts-node typescript"
  fi
fi

# =============================================================================
# 3. CI/CD Workflows
# =============================================================================
echo -e "\n${BLUE}3. CI/CD Workflows${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -f ".github/workflows/architecture.yml" ]; then
  check_pass ".github/workflows/architecture.yml exists"
  
  if grep -q "architecture-governance" .github/workflows/architecture.yml; then
    check_pass "GitHub Actions job defined"
  else
    check_fail "GitHub Actions job not found"
  fi
else
  check_warn ".github/workflows/architecture.yml does not exist (GitHub Actions)"
fi

if [ -f ".gitlab-ci.yml" ]; then
  check_pass ".gitlab-ci.yml exists"
  
  if grep -q "architecture-governance" .gitlab-ci.yml; then
    check_pass "GitLab CI job defined"
  else
    check_fail "GitLab CI job not found"
  fi
else
  check_warn ".gitlab-ci.yml does not exist (GitLab CI)"
fi

if [ -f "Jenkinsfile" ]; then
  check_pass "Jenkinsfile exists"
  
  if grep -q "Architecture Governance" Jenkinsfile; then
    check_pass "Jenkins stage defined"
  else
    check_fail "Jenkins stage not found"
  fi
else
  check_warn "Jenkinsfile does not exist (Jenkins)"
fi

# =============================================================================
# 4. Documentation
# =============================================================================
echo -e "\n${BLUE}4. Documentation${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -f "AGA_INTEGRATION_GUIDE.md" ]; then
  check_pass "AGA_INTEGRATION_GUIDE.md exists"
  
  if grep -q "ARCH_010" AGA_INTEGRATION_GUIDE.md; then
    check_pass "Guide documents ARCH_010"
  fi
  if grep -q "ARCH_036" AGA_INTEGRATION_GUIDE.md; then
    check_pass "Guide documents ARCH_036"
  fi
else
  check_fail "AGA_INTEGRATION_GUIDE.md does not exist"
fi

if [ -f "AGA_SETUP_LOCAL.md" ]; then
  check_pass "AGA_SETUP_LOCAL.md exists"
else
  check_fail "AGA_SETUP_LOCAL.md does not exist"
fi

if [ -f "AGA_INTEGRATION_SUMMARY.md" ]; then
  check_pass "AGA_INTEGRATION_SUMMARY.md exists"
else
  check_fail "AGA_INTEGRATION_SUMMARY.md does not exist"
fi

# =============================================================================
# 5. Git Integration
# =============================================================================
echo -e "\n${BLUE}5. Git Integration${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -d ".git" ]; then
  check_pass "Git repository detected"
  
  if [ -f ".git/hooks/pre-commit" ]; then
    check_pass "Git pre-commit hook exists"
    if grep -q "ts-node aga/index.ts" .git/hooks/pre-commit; then
      check_pass "Pre-commit hook calls AGA"
    else
      check_warn "Pre-commit hook exists but doesn't call AGA"
    fi
  else
    check_warn "Git pre-commit hook not configured (optional but recommended)"
  fi
else
  check_warn "Not a Git repository"
fi

# =============================================================================
# 6. Functional Test
# =============================================================================
echo -e "\n${BLUE}6. Functional Test${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if command -v npx &> /dev/null; then
  if command -v ts-node &> /dev/null; then
    echo "Running AGA validation..."
    if npx ts-node aga/index.ts . --validate 2>&1 | grep -q "Configuration valid"; then
      check_pass "AGA validation command works"
    else
      check_fail "AGA validation command failed"
    fi
  else
    check_warn "ts-node not installed (run: npm install --save-dev ts-node typescript)"
  fi
else
  check_warn "npx not available (ensure Node.js/npm installed)"
fi

# =============================================================================
# Summary
# =============================================================================
echo -e "\n${BLUE}═══════════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}Summary${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════════════${NC}"

TOTAL=$((CHECKS_PASSED + CHECKS_FAILED + CHECKS_WARNING))

echo -e "${GREEN}✅ Passed:   $CHECKS_PASSED${NC}"
echo -e "${RED}❌ Failed:   $CHECKS_FAILED${NC}"
echo -e "${YELLOW}⚠️  Warnings: $CHECKS_WARNING${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Total:    $TOTAL checks"

echo ""

if [ $CHECKS_FAILED -eq 0 ]; then
  echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${GREEN}✅ AGA INTEGRATION COMPLETE${NC}"
  echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
  echo "Next steps:"
  echo "  1. Test locally: npx ts-node aga/index.ts ."
  echo "  2. Commit: git add aga.config.json aga/ .github/"
  echo "  3. Push: git push"
  echo ""
  exit 0
else
  echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${RED}❌ AGA INTEGRATION INCOMPLETE${NC}"
  echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
  echo "Please fix the issues above and re-run this script."
  echo ""
  exit 1
fi
