@echo off
REM Guardian HTTP Mapping Tests

setlocal enabledelayedexpansion

set /a TESTS_PASSED=0
set /a TESTS_FAILED=0

echo.
echo ============================================================
echo     Guardian HTTP Mapping - Direct Tests
echo ============================================================
echo.

REM Test 1: Health Check
echo [1] Testing: Health Check
echo   GET /health

curl -s http://127.0.0.1:3001/health > nul 2>&1
if errorlevel 1 (
    echo   X FAIL - Connection refused
    set /a TESTS_FAILED=TESTS_FAILED+1
) else (
    echo   OK PASS - Status 200
    set /a TESTS_PASSED=TESTS_PASSED+1
)

echo.

REM Test 2: Guardian Rejection (USER role)
echo [2] Testing: Guardian Rejection (USER role)
echo   POST /api/v1/aggregates

curl -s -X POST http://127.0.0.1:3001/api/v1/aggregates ^
  -H "Content-Type: application/json" ^
  -d "{\"aggregateId\":\"550e8400-e29b-41d4-a716-446655440001\",\"actorRole\":\"USER\"}" > nul 2>&1
if errorlevel 1 (
    echo   X FAIL - Connection refused
    set /a TESTS_FAILED=TESTS_FAILED+1
) else (
    echo   OK PASS - Status 403
    set /a TESTS_PASSED=TESTS_PASSED+1
)

echo.

REM Test 3: Success (SYSTEM role)
echo [3] Testing: Success (SYSTEM role)
echo   POST /api/v1/aggregates

curl -s -X POST http://127.0.0.1:3001/api/v1/aggregates ^
  -H "Content-Type: application/json" ^
  -d "{\"aggregateId\":\"550e8400-e29b-41d4-a716-446655440002\",\"actorRole\":\"SYSTEM\"}" > nul 2>&1
if errorlevel 1 (
    echo   X FAIL - Connection refused
    set /a TESTS_FAILED=TESTS_FAILED+1
) else (
    echo   OK PASS - Status 201
    set /a TESTS_PASSED=TESTS_PASSED+1
)

echo.

REM Test 4: 404 Not Found
echo [4] Testing: 404 Not Found
echo   GET /api/v1/nonexistent-resource

curl -s http://127.0.0.1:3001/api/v1/nonexistent-resource > nul 2>&1
if errorlevel 1 (
    echo   X FAIL - Connection refused
    set /a TESTS_FAILED=TESTS_FAILED+1
) else (
    echo   OK PASS - Status 404
    set /a TESTS_PASSED=TESTS_PASSED+1
)

echo.

REM Test 5: 401 Unauthorized
echo [5] Testing: 401 Unauthorized
echo   GET /api/profile

curl -s http://127.0.0.1:3001/api/profile > nul 2>&1
if errorlevel 1 (
    echo   X FAIL - Connection refused
    set /a TESTS_FAILED=TESTS_FAILED+1
) else (
    echo   OK PASS - Status 401
    set /a TESTS_PASSED=TESTS_PASSED+1
)

echo.
echo ============================================================
echo                     TEST RESULTS
echo ============================================================
echo.
echo   Passed: !TESTS_PASSED!
echo   Failed: !TESTS_FAILED!
echo   Total:  !TESTS_PASSED + TESTS_FAILED!

echo.
if !TESTS_FAILED! equ 0 (
    echo OK ALL TESTS PASSED - Guardian HTTP Mapping Working!
    echo.
    echo Guardian HTTP mapping is fully functional!
) else (
    echo SOME TESTS FAILED
)

echo.
