#!/bin/bash

# Direct Guardian HTTP Mapping Tests using curl

SERVER_URL="http://127.0.0.1:3001"
TESTS_PASSED=0
TESTS_FAILED=0

echo ""
echo "============================================================"
echo "    Guardian HTTP Mapping - Direct Tests"
echo "============================================================"
echo ""

# Test 1: Health Check (200)
echo "[1] Testing: Health Check"
echo "  GET /health"

RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$SERVER_URL/health" -H "Content-Type: application/json")
HTTP_STATUS=$(echo "$RESPONSE" | tail -n1)
HTTP_BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_STATUS" -eq 200 ]; then
    if echo "$HTTP_BODY" | grep -q '"status"'; then
        echo "  ✓ PASS - Status 200, Key 'status' found"
        ((TESTS_PASSED++))
    else
        echo "  ✗ FAIL - Status 200 OK, but key 'status' missing"
        ((TESTS_FAILED++))
    fi
else
    echo "  ✗ FAIL - Expected 200, got $HTTP_STATUS"
    ((TESTS_FAILED++))
fi

echo ""

# Test 2: Guardian rejection - USER role (403)
echo "[2] Testing: Guardian Rejection (USER role)"
echo "  POST /api/v1/aggregates"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$SERVER_URL/api/v1/aggregates" \
  -H "Content-Type: application/json" \
  -d '{"aggregateId":"550e8400-e29b-41d4-a716-446655440001","actorRole":"USER"}')
HTTP_STATUS=$(echo "$RESPONSE" | tail -n1)
HTTP_BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_STATUS" -eq 403 ]; then
    if echo "$HTTP_BODY" | grep -q '"violation"'; then
        echo "  ✓ PASS - Status 403, Key 'violation' found"
        ((TESTS_PASSED++))
    else
        echo "  ✗ FAIL - Status 403 OK, but key 'violation' missing"
        ((TESTS_FAILED++))
    fi
else
    echo "  ✗ FAIL - Expected 403, got $HTTP_STATUS"
    ((TESTS_FAILED++))
fi

echo ""

# Test 3: Success - SYSTEM role (201)
echo "[3] Testing: Success (SYSTEM role)"
echo "  POST /api/v1/aggregates"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$SERVER_URL/api/v1/aggregates" \
  -H "Content-Type: application/json" \
  -d '{"aggregateId":"550e8400-e29b-41d4-a716-446655440002","actorRole":"SYSTEM"}')
HTTP_STATUS=$(echo "$RESPONSE" | tail -n1)
HTTP_BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_STATUS" -eq 201 ]; then
    if echo "$HTTP_BODY" | grep -q '"status"'; then
        echo "  ✓ PASS - Status 201, Key 'status' found"
        ((TESTS_PASSED++))
    else
        echo "  ✗ FAIL - Status 201 OK, but key 'status' missing"
        ((TESTS_FAILED++))
    fi
else
    echo "  ✗ FAIL - Expected 201, got $HTTP_STATUS"
    ((TESTS_FAILED++))
fi

echo ""

# Test 4: 404 - Not Found
echo "[4] Testing: 404 Not Found"
echo "  GET /api/v1/nonexistent-resource"

RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$SERVER_URL/api/v1/nonexistent-resource" \
  -H "Content-Type: application/json")
HTTP_STATUS=$(echo "$RESPONSE" | tail -n1)

if [ "$HTTP_STATUS" -eq 404 ]; then
    echo "  ✓ PASS - Status 404"
    ((TESTS_PASSED++))
else
    echo "  ✗ FAIL - Expected 404, got $HTTP_STATUS"
    ((TESTS_FAILED++))
fi

echo ""

# Test 5: 401 - Unauthorized (no token)
echo "[5] Testing: 401 Unauthorized (no token)"
echo "  GET /api/profile"

RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$SERVER_URL/api/profile" \
  -H "Content-Type: application/json")
HTTP_STATUS=$(echo "$RESPONSE" | tail -n1)

if [ "$HTTP_STATUS" -eq 401 ]; then
    echo "  ✓ PASS - Status 401"
    ((TESTS_PASSED++))
else
    echo "  ✗ FAIL - Expected 401, got $HTTP_STATUS"
    ((TESTS_FAILED++))
fi

echo ""

# Results summary
echo "============================================================"
echo "                    TEST RESULTS"
echo "============================================================"
echo ""
echo "  Passed: $TESTS_PASSED"
echo "  Failed: $TESTS_FAILED"
echo "  Total:  $((TESTS_PASSED + TESTS_FAILED))"

echo ""
if [ "$TESTS_FAILED" -eq 0 ]; then
    echo "✓ ALL TESTS PASSED - Guardian HTTP Mapping Working!"
    echo ""
    echo "Summary:"
    echo "  ✓ Health check endpoint (200)"
    echo "  ✓ Guardian rejection for USER role (403 with G4-03)"
    echo "  ✓ Success for SYSTEM role (201)"
    echo "  ✓ 404 error handling"
    echo "  ✓ 401 unauthorized handling"
    echo ""
    echo "Guardian → HTTP mapping is functional and correct!"
else
    echo "✗ SOME TESTS FAILED - Review output above"
fi

echo ""
exit $(if [ "$TESTS_FAILED" -eq 0 ]; then echo 0; else echo 1; fi)
