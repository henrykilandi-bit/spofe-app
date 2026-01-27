#!/bin/bash
# ============================================================================
# SPOFE API Validation Test Suite
# Teste les endpoints critiques et génère un rapport
# ============================================================================

API_URL="http://localhost:3001/api"
RESULTS_FILE="API_TEST_RESULTS_$(date +%Y%m%d_%H%M%S).md"

# Couleurs pour output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Variables globales
TEST_COUNTER=0
PASS_COUNTER=0
FAIL_COUNTER=0
AUTH_TOKEN=""
TEST_USER_ID=""
TEST_COMPANY_ID=""

echo "🧪 SPOFE API Validation Test Suite" > "$RESULTS_FILE"
echo "=================================" >> "$RESULTS_FILE"
echo "Test Date: $(date)" >> "$RESULTS_FILE"
echo "" >> "$RESULTS_FILE"

# ============================================================================
# FONCTIONS UTILITAIRES
# ============================================================================

log_test() {
  TEST_COUNTER=$((TEST_COUNTER + 1))
  echo -e "${YELLOW}[TEST $TEST_COUNTER]${NC} $1"
  echo "### Test $TEST_COUNTER: $1" >> "$RESULTS_FILE"
}

log_pass() {
  PASS_COUNTER=$((PASS_COUNTER + 1))
  echo -e "${GREEN}✓ PASS${NC}: $1"
  echo "- ✅ **PASS**: $1" >> "$RESULTS_FILE"
}

log_fail() {
  FAIL_COUNTER=$((FAIL_COUNTER + 1))
  echo -e "${RED}✗ FAIL${NC}: $1"
  echo "- ❌ **FAIL**: $1" >> "$RESULTS_FILE"
}

test_endpoint() {
  local method=$1
  local endpoint=$2
  local data=$3
  local expected_status=$4
  local description=$5

  log_test "$description"
  
  local url="${API_URL}${endpoint}"
  local response
  
  if [ "$method" = "GET" ]; then
    response=$(curl -s -w "\n%{http_code}" -X GET "$url" \
      -H "Authorization: Bearer $AUTH_TOKEN" \
      -H "Content-Type: application/json")
  else
    response=$(curl -s -w "\n%{http_code}" -X "$method" "$url" \
      -H "Authorization: Bearer $AUTH_TOKEN" \
      -H "Content-Type: application/json" \
      -d "$data")
  fi

  local http_code=$(echo "$response" | tail -n1)
  local body=$(echo "$response" | sed '$d')

  if [ "$http_code" = "$expected_status" ]; then
    log_pass "$method $endpoint returned $http_code"
    echo "Response: $body" >> "$RESULTS_FILE"
    echo "" >> "$RESULTS_FILE"
    echo "$body"
  else
    log_fail "$method $endpoint returned $http_code (expected $expected_status)"
    echo "Response: $body" >> "$RESULTS_FILE"
    echo "" >> "$RESULTS_FILE"
  fi

  return 0
}

# ============================================================================
# TESTS: AUTHENTICATION
# ============================================================================

echo -e "\n${YELLOW}=== SECTION 1: AUTHENTICATION ===${NC}"
echo "## Section 1: Authentication" >> "$RESULTS_FILE"

# Test Register
register_payload='{"username":"testuser_'$(date +%s)'","email":"test_'$(date +%s)'@spofe.local","password":"Test@12345","role":"accountant"}'
response=$(curl -s -w "\n%{http_code}" -X POST "${API_URL}/auth/register" \
  -H "Content-Type: application/json" \
  -d "$register_payload")

http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" = "201" ] || [ "$http_code" = "200" ]; then
  log_pass "POST /auth/register"
  TEST_USER_ID=$(echo "$body" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
else
  log_fail "POST /auth/register returned $http_code"
fi

# Test Login
login_payload='{"email":"admin@spofe.local","password":"Admin@12345"}'
response=$(curl -s -w "\n%{http_code}" -X POST "${API_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d "$login_payload")

http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" = "200" ]; then
  AUTH_TOKEN=$(echo "$body" | grep -o '"token":"[^"]*' | cut -d'"' -f4 | head -1)
  log_pass "POST /auth/login - Token: ${AUTH_TOKEN:0:20}..."
else
  log_fail "POST /auth/login returned $http_code"
fi

# ============================================================================
# TESTS: DASHBOARD
# ============================================================================

echo -e "\n${YELLOW}=== SECTION 2: DASHBOARD ===${NC}"
echo "## Section 2: Dashboard" >> "$RESULTS_FILE"

test_endpoint "GET" "/dashboard/summary" "" "200" "GET /dashboard/summary"
test_endpoint "GET" "/dashboard/activity" "" "200" "GET /dashboard/activity"

# ============================================================================
# TESTS: CHART OF ACCOUNTS
# ============================================================================

echo -e "\n${YELLOW}=== SECTION 3: CHART OF ACCOUNTS ===${NC}"
echo "## Section 3: Chart of Accounts" >> "$RESULTS_FILE"

test_endpoint "GET" "/chartsofaccounts" "" "200" "GET /chartsofaccounts - List all"
test_endpoint "GET" "/chartsofaccounts/count" "" "200" "GET /chartsofaccounts/count"

# Test Create Account
account_payload='{"account_number":"999999","account_name":"Test Account","account_type":"ASSET","description":"Testing account"}'
test_endpoint "POST" "/chartsofaccounts" "$account_payload" "201" "POST /chartsofaccounts - Create"

# ============================================================================
# TESTS: JOURNAL ENTRIES
# ============================================================================

echo -e "\n${YELLOW}=== SECTION 4: JOURNAL ENTRIES ===${NC}"
echo "## Section 4: Journal Entries" >> "$RESULTS_FILE"

test_endpoint "GET" "/journal-entries" "" "200" "GET /journal-entries - List all"
test_endpoint "GET" "/journal-entries/count" "" "200" "GET /journal-entries/count"

# ============================================================================
# TESTS: THIRD PARTIES
# ============================================================================

echo -e "\n${YELLOW}=== SECTION 5: THIRD PARTIES ===${NC}"
echo "## Section 5: Third Parties" >> "$RESULTS_FILE"

test_endpoint "GET" "/third-parties" "" "200" "GET /third-parties - List all"

# ============================================================================
# TESTS: REPORTS
# ============================================================================

echo -e "\n${YELLOW}=== SECTION 6: REPORTS ===${NC}"
echo "## Section 6: Reports" >> "$RESULTS_FILE"

test_endpoint "GET" "/reports" "" "200" "GET /reports - List available"

# ============================================================================
# TESTS: HEALTH & METRICS
# ============================================================================

echo -e "\n${YELLOW}=== SECTION 7: HEALTH & METRICS ===${NC}"
echo "## Section 7: Health & Metrics" >> "$RESULTS_FILE"

test_endpoint "GET" "/health" "" "200" "GET /health"
test_endpoint "GET" "/metrics" "" "200" "GET /metrics"

# ============================================================================
# RAPPORT FINAL
# ============================================================================

echo -e "\n${YELLOW}=== RÉSUMÉ ===${NC}"
echo "## Summary" >> "$RESULTS_FILE"
echo "" >> "$RESULTS_FILE"
echo "| Métrique | Valeur |" >> "$RESULTS_FILE"
echo "|----------|--------|" >> "$RESULTS_FILE"
echo "| Total Tests | $TEST_COUNTER |" >> "$RESULTS_FILE"
echo "| Passed ✅ | $PASS_COUNTER |" >> "$RESULTS_FILE"
echo "| Failed ❌ | $FAIL_COUNTER |" >> "$RESULTS_FILE"

PASS_RATE=$((PASS_COUNTER * 100 / TEST_COUNTER))
echo "| Pass Rate | ${PASS_RATE}% |" >> "$RESULTS_FILE"
echo "" >> "$RESULTS_FILE"

if [ $FAIL_COUNTER -eq 0 ]; then
  echo -e "${GREEN}✓ ALL TESTS PASSED${NC} - $PASS_COUNTER/$TEST_COUNTER"
else
  echo -e "${RED}✗ TESTS FAILED${NC} - $FAIL_COUNTER failures"
fi

echo "" >> "$RESULTS_FILE"
echo "**Report saved to**: $RESULTS_FILE" >> "$RESULTS_FILE"

echo ""
echo "📄 Full report: $RESULTS_FILE"
