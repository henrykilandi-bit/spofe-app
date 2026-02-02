# Direct Guardian HTTP Mapping Tests
# Tests without requiring server health check

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "    Guardian HTTP Mapping - Direct Tests" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

$ServerUrl = "http://127.0.0.1:3001"
$TestsPassed = 0
$TestsFailed = 0

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Method,
        [string]$Endpoint,
        [object]$Body,
        [int]$ExpectedStatus,
        [string]$ExpectedKey
    )
    
    Write-Host "[$($TestsPassed + $TestsFailed + 1)] Testing: $Name" -ForegroundColor Yellow
    Write-Host "  $Method $Endpoint" -ForegroundColor Gray
    
    try {
        $uri = "$ServerUrl$Endpoint"
        
        $params = @{
            Uri = $uri
            Method = $Method
            ContentType = "application/json"
            TimeoutSec = 5
            ErrorAction = "Stop"
        }
        
        if ($Body) {
            $params['Body'] = ($Body | ConvertTo-Json)
        }
        
        $response = Invoke-WebRequest @params
        $status = $response.StatusCode
        $content = $response.Content | ConvertFrom-Json
        
        if ($status -eq $ExpectedStatus) {
            if ($ExpectedKey) {
                if ($content.$ExpectedKey) {
                    Write-Host "  ✓ PASS - Status $status, Key '$ExpectedKey' found" -ForegroundColor Green
                    $script:TestsPassed++
                } else {
                    Write-Host "  ✗ FAIL - Status $status OK, but key '$ExpectedKey' missing" -ForegroundColor Red
                    $script:TestsFailed++
                }
            } else {
                Write-Host "  ✓ PASS - Status $status" -ForegroundColor Green
                $script:TestsPassed++
            }
        } else {
            Write-Host "  ✗ FAIL - Expected $ExpectedStatus, got $status" -ForegroundColor Red
            $script:TestsFailed++
        }
    }
    catch {
        if ($_.Exception.Response) {
            $status = $_.Exception.Response.StatusCode.Value
            $errorContent = @{}
            try {
                $errorStream = $_.Exception.Response.GetResponseStream()
                $reader = New-Object System.IO.StreamReader($errorStream)
                $errorContent = $reader.ReadToEnd() | ConvertFrom-Json
                $reader.Close()
            }
            catch {
                $errorContent = @{ error = $_.Exception.Message }
            }
            
            if ($status -eq $ExpectedStatus) {
                if ($ExpectedKey) {
                    if ($errorContent.$ExpectedKey) {
                        Write-Host "  ✓ PASS - Status $status, Key '$ExpectedKey' found" -ForegroundColor Green
                        $script:TestsPassed++
                    } else {
                        Write-Host "  ✗ FAIL - Status $status OK, but key '$ExpectedKey' missing" -ForegroundColor Red
                        Write-Host "    Response: $($errorContent | ConvertTo-Json -Compress)" -ForegroundColor Gray
                        $script:TestsFailed++
                    }
                } else {
                    Write-Host "  ✓ PASS - Status $status" -ForegroundColor Green
                    $script:TestsPassed++
                }
            } else {
                Write-Host "  ✗ FAIL - Expected $ExpectedStatus, got $status" -ForegroundColor Red
                Write-Host "    Response: $($errorContent | ConvertTo-Json -Compress)" -ForegroundColor Gray
                $script:TestsFailed++
            }
        } else {
            Write-Host "  ✗ FAIL - Connection error: $($_.Exception.Message)" -ForegroundColor Red
            $script:TestsFailed++
        }
    }
}

# Run tests

# Test 1: Health Check (200)
Test-Endpoint -Name "Health Check" `
    -Method "GET" `
    -Endpoint "/health" `
    -ExpectedStatus 200 `
    -ExpectedKey "status"

# Test 2: Guardian rejection - USER role (403)
Test-Endpoint -Name "Guardian Rejection (USER role)" `
    -Method "POST" `
    -Endpoint "/api/v1/aggregates" `
    -Body @{
        aggregateId = "550e8400-e29b-41d4-a716-446655440001"
        actorRole = "USER"
    } `
    -ExpectedStatus 403 `
    -ExpectedKey "violation"

# Test 3: Success - SYSTEM role (201)
Test-Endpoint -Name "Success (SYSTEM role)" `
    -Method "POST" `
    -Endpoint "/api/v1/aggregates" `
    -Body @{
        aggregateId = "550e8400-e29b-41d4-a716-446655440002"
        actorRole = "SYSTEM"
    } `
    -ExpectedStatus 201 `
    -ExpectedKey "status"

# Test 4: 404 - Not Found
Test-Endpoint -Name "404 Not Found" `
    -Method "GET" `
    -Endpoint "/api/v1/nonexistent-resource" `
    -ExpectedStatus 404 `
    -ExpectedKey "error"

# Test 5: 401 - Unauthorized (no token)
Test-Endpoint -Name "401 Unauthorized (no token)" `
    -Method "GET" `
    -Endpoint "/api/profile" `
    -ExpectedStatus 401 `
    -ExpectedKey "error"

# Results summary
Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "                    TEST RESULTS" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Passed: $TestsPassed" -ForegroundColor Green
Write-Host "  Failed: $TestsFailed" -ForegroundColor $(if ($TestsFailed -eq 0) { "Green" } else { "Red" })
Write-Host "  Total:  $($TestsPassed + $TestsFailed)" -ForegroundColor White

Write-Host ""
if ($TestsFailed -eq 0) {
    Write-Host "✓ ALL TESTS PASSED - Guardian HTTP Mapping Working!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Summary:" -ForegroundColor Cyan
    Write-Host "  ✓ Health check endpoint (200)" -ForegroundColor Green
    Write-Host "  ✓ Guardian rejection for USER role (403)" -ForegroundColor Green
    Write-Host "  ✓ Success for SYSTEM role (201)" -ForegroundColor Green
    Write-Host "  ✓ 404 error handling" -ForegroundColor Green
    Write-Host "  ✓ 401 unauthorized handling" -ForegroundColor Green
    Write-Host ""
    Write-Host "Guardian → HTTP mapping is functional and correct!" -ForegroundColor Green
} else {
    Write-Host "✗ SOME TESTS FAILED - Review output above" -ForegroundColor Red
}

Write-Host ""
exit $(if ($TestsFailed -eq 0) { 0 } else { 1 })
