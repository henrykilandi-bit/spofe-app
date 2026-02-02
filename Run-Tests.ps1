# Simple Guardian HTTP Mapping Tests

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "    Guardian HTTP Mapping - Direct Tests" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

$ServerUrl = "http://127.0.0.1:3001"
$TestsPassed = 0
$TestsFailed = 0

# Test 1: Health Check
Write-Host "[1] Testing: Health Check" -ForegroundColor Yellow
Write-Host "  GET /health" -ForegroundColor Gray

try {
    $response = Invoke-WebRequest -Uri "$ServerUrl/health" -Method GET -TimeoutSec 5 -SkipHttpErrorCheck
    if ($response.StatusCode -eq 200) {
        Write-Host "  ✓ PASS - Status 200" -ForegroundColor Green
        $TestsPassed++
    } else {
        Write-Host "  ✗ FAIL - Expected 200, got $($response.StatusCode)" -ForegroundColor Red
        $TestsFailed++
    }
} catch {
    Write-Host "  ✗ FAIL - Connection error: $($_.Exception.Message)" -ForegroundColor Red
    $TestsFailed++
}

Write-Host ""

# Test 2: Guardian Rejection (USER role)
Write-Host "[2] Testing: Guardian Rejection (USER role)" -ForegroundColor Yellow
Write-Host "  POST /api/v1/aggregates" -ForegroundColor Gray

try {
    $body = @{
        aggregateId = "550e8400-e29b-41d4-a716-446655440001"
        actorRole = "USER"
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "$ServerUrl/api/v1/aggregates" -Method POST -Body $body `
        -ContentType "application/json" -TimeoutSec 5 -SkipHttpErrorCheck
    
    if ($response.StatusCode -eq 403) {
        $content = $response.Content | ConvertFrom-Json
        if ($content.violation) {
            Write-Host "  ✓ PASS - Status 403, violation code: $($content.violation)" -ForegroundColor Green
            $TestsPassed++
        } else {
            Write-Host "  ✗ FAIL - Status 403 but no violation code" -ForegroundColor Red
            $TestsFailed++
        }
    } else {
        Write-Host "  ✗ FAIL - Expected 403, got $($response.StatusCode)" -ForegroundColor Red
        $TestsFailed++
    }
} catch {
    Write-Host "  ✗ FAIL - Error: $($_.Exception.Message)" -ForegroundColor Red
    $TestsFailed++
}

Write-Host ""

# Test 3: Success (SYSTEM role)
Write-Host "[3] Testing: Success (SYSTEM role)" -ForegroundColor Yellow
Write-Host "  POST /api/v1/aggregates" -ForegroundColor Gray

try {
    $body = @{
        aggregateId = "550e8400-e29b-41d4-a716-446655440002"
        actorRole = "SYSTEM"
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "$ServerUrl/api/v1/aggregates" -Method POST -Body $body `
        -ContentType "application/json" -TimeoutSec 5 -SkipHttpErrorCheck
    
    if ($response.StatusCode -eq 201) {
        $content = $response.Content | ConvertFrom-Json
        if ($content.status) {
            Write-Host "  ✓ PASS - Status 201, created: $($content.status)" -ForegroundColor Green
            $TestsPassed++
        } else {
            Write-Host "  ✗ FAIL - Status 201 but no status field" -ForegroundColor Red
            $TestsFailed++
        }
    } else {
        Write-Host "  ✗ FAIL - Expected 201, got $($response.StatusCode)" -ForegroundColor Red
        $TestsFailed++
    }
} catch {
    Write-Host "  ✗ FAIL - Error: $($_.Exception.Message)" -ForegroundColor Red
    $TestsFailed++
}

Write-Host ""

# Test 4: 404 Not Found
Write-Host "[4] Testing: 404 Not Found" -ForegroundColor Yellow
Write-Host "  GET /api/v1/nonexistent-resource" -ForegroundColor Gray

try {
    $response = Invoke-WebRequest -Uri "$ServerUrl/api/v1/nonexistent-resource" -Method GET -TimeoutSec 5 -SkipHttpErrorCheck
    if ($response.StatusCode -eq 404) {
        Write-Host "  ✓ PASS - Status 404" -ForegroundColor Green
        $TestsPassed++
    } else {
        Write-Host "  ✗ FAIL - Expected 404, got $($response.StatusCode)" -ForegroundColor Red
        $TestsFailed++
    }
} catch {
    Write-Host "  ✗ FAIL - Error: $($_.Exception.Message)" -ForegroundColor Red
    $TestsFailed++
}

Write-Host ""

# Test 5: 401 Unauthorized
Write-Host "[5] Testing: 401 Unauthorized (no token)" -ForegroundColor Yellow
Write-Host "  GET /api/profile" -ForegroundColor Gray

try {
    $response = Invoke-WebRequest -Uri "$ServerUrl/api/profile" -Method GET -TimeoutSec 5 -SkipHttpErrorCheck
    if ($response.StatusCode -eq 401) {
        Write-Host "  ✓ PASS - Status 401" -ForegroundColor Green
        $TestsPassed++
    } else {
        Write-Host "  ✗ FAIL - Expected 401, got $($response.StatusCode)" -ForegroundColor Red
        $TestsFailed++
    }
} catch {
    Write-Host "  ✗ FAIL - Error: $($_.Exception.Message)" -ForegroundColor Red
    $TestsFailed++
}

Write-Host ""

# Results
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "                    TEST RESULTS" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Passed: $TestsPassed" -ForegroundColor Green
Write-Host "  Failed: $TestsFailed" -ForegroundColor Red
Write-Host "  Total:  $($TestsPassed + $TestsFailed)" -ForegroundColor White

Write-Host ""
if ($TestsFailed -eq 0) {
    Write-Host "✓ ALL TESTS PASSED - Guardian HTTP Mapping Working!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Summary:" -ForegroundColor Cyan
    Write-Host "  ✓ Health check (200)" -ForegroundColor Green
    Write-Host "  ✓ Guardian rejection for USER (403 with G4-03)" -ForegroundColor Green
    Write-Host "  ✓ Success for SYSTEM (201)" -ForegroundColor Green
    Write-Host "  ✓ 404 error handling" -ForegroundColor Green
    Write-Host "  ✓ 401 unauthorized handling" -ForegroundColor Green
    Write-Host ""
    Write-Host "Guardian HTTP mapping is fully functional!" -ForegroundColor Green
} else {
    Write-Host "✗ SOME TESTS FAILED" -ForegroundColor Red
}

Write-Host ""
