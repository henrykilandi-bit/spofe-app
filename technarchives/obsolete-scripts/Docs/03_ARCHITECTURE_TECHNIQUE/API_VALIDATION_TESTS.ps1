# ============================================================================
# SPOFE API Validation Test Suite (PowerShell)
# Teste les endpoints critiques et génère un rapport
# ============================================================================

param(
    [string]$ApiUrl = "http://localhost:3001/api",
    [string]$AdminEmail = "admin@spofe.local",
    [string]$AdminPassword = "Admin@12345"
)

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$resultsFile = "API_TEST_RESULTS_$timestamp.md"

$testCounter = 0
$passCounter = 0
$failCounter = 0
$authToken = ""

function Write-TestHeader {
    param([string]$Title)
    Write-Host "`n=== $Title ===" -ForegroundColor Yellow
    Add-Content -Path $resultsFile -Value "`n## $Title"
}

function Test-Endpoint {
    param(
        [string]$Method,
        [string]$Endpoint,
        [hashtable]$Data,
        [int]$ExpectedStatus,
        [string]$Description
    )
    
    $script:testCounter++
    Write-Host "[TEST $testCounter] $Description" -ForegroundColor Cyan
    Add-Content -Path $resultsFile -Value "`n### Test $testCounter: $Description"
    
    $url = "$ApiUrl$Endpoint"
    $headers = @{
        "Content-Type" = "application/json"
    }
    
    if ($authToken) {
        $headers["Authorization"] = "Bearer $authToken"
    }
    
    try {
        $body = $null
        if ($Data) {
            $body = $Data | ConvertTo-Json
        }
        
        $response = Invoke-WebRequest -Uri $url -Method $Method -Headers $headers -Body $body -ErrorAction Stop
        $statusCode = $response.StatusCode
        $content = $response.Content
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.Value
        $content = $_.Exception.Response.Content.ReadAsStream() | ForEach-Object { [System.IO.StreamReader]::new($_).ReadToEnd() }
    }
    
    if ($statusCode -eq $ExpectedStatus) {
        $script:passCounter++
        Write-Host "✓ PASS: $Method $Endpoint returned $statusCode" -ForegroundColor Green
        Add-Content -Path $resultsFile -Value "- ✅ **PASS**: $Method $Endpoint returned $statusCode"
    } else {
        $script:failCounter++
        Write-Host "✗ FAIL: $Method $Endpoint returned $statusCode (expected $ExpectedStatus)" -ForegroundColor Red
        Add-Content -Path $resultsFile -Value "- ❌ **FAIL**: $Method $Endpoint returned $statusCode (expected $ExpectedStatus)"
    }
    
    Add-Content -Path $resultsFile -Value "Response (first 200 chars): $($content.Substring(0, [Math]::Min(200, $content.Length)))"
    Add-Content -Path $resultsFile -Value ""
    
    return $content
}

# ============================================================================
# HEADER DU RAPPORT
# ============================================================================

@"
# SPOFE API Validation Report
Generated: $(Get-Date)

"@ | Set-Content -Path $resultsFile

Write-Host "🧪 SPOFE API Validation Test Suite" -ForegroundColor Cyan
Write-Host "API URL: $ApiUrl" -ForegroundColor Gray

# ============================================================================
# SECTION 1: AUTHENTICATION
# ============================================================================

Write-TestHeader "AUTHENTICATION"

$loginData = @{
    email = $AdminEmail
    password = $AdminPassword
}

$loginResponse = Test-Endpoint -Method "POST" -Endpoint "/auth/login" -Data $loginData -ExpectedStatus 200 -Description "POST /auth/login"

try {
    $loginJson = $loginResponse | ConvertFrom-Json
    $authToken = $loginJson.token ?? $loginJson.data.token
    if ($authToken) {
        Write-Host "✓ Token acquired: $($authToken.Substring(0, 20))..." -ForegroundColor Green
    }
} catch {
    Write-Host "⚠ Could not parse token from login response" -ForegroundColor Yellow
}

# ============================================================================
# SECTION 2: DASHBOARD
# ============================================================================

Write-TestHeader "DASHBOARD"

Test-Endpoint -Method "GET" -Endpoint "/dashboard/summary" -ExpectedStatus 200 -Description "GET /dashboard/summary"
Test-Endpoint -Method "GET" -Endpoint "/dashboard/activity" -ExpectedStatus 200 -Description "GET /dashboard/activity"

# ============================================================================
# SECTION 3: CHART OF ACCOUNTS
# ============================================================================

Write-TestHeader "CHART OF ACCOUNTS"

Test-Endpoint -Method "GET" -Endpoint "/chartsofaccounts" -ExpectedStatus 200 -Description "GET /chartsofaccounts"
Test-Endpoint -Method "GET" -Endpoint "/chartsofaccounts/count" -ExpectedStatus 200 -Description "GET /chartsofaccounts/count"

# ============================================================================
# SECTION 4: JOURNAL ENTRIES
# ============================================================================

Write-TestHeader "JOURNAL ENTRIES"

Test-Endpoint -Method "GET" -Endpoint "/journal-entries" -ExpectedStatus 200 -Description "GET /journal-entries"
Test-Endpoint -Method "GET" -Endpoint "/journal-entries/count" -ExpectedStatus 200 -Description "GET /journal-entries/count"

# ============================================================================
# SECTION 5: THIRD PARTIES
# ============================================================================

Write-TestHeader "THIRD PARTIES"

Test-Endpoint -Method "GET" -Endpoint "/third-parties" -ExpectedStatus 200 -Description "GET /third-parties"

# ============================================================================
# SECTION 6: REPORTS
# ============================================================================

Write-TestHeader "REPORTS"

Test-Endpoint -Method "GET" -Endpoint "/reports" -ExpectedStatus 200 -Description "GET /reports"

# ============================================================================
# SECTION 7: HEALTH & METRICS
# ============================================================================

Write-TestHeader "HEALTH & METRICS"

Test-Endpoint -Method "GET" -Endpoint "/health" -ExpectedStatus 200 -Description "GET /health"
Test-Endpoint -Method "GET" -Endpoint "/metrics" -ExpectedStatus 200 -Description "GET /metrics"

# ============================================================================
# RAPPORT FINAL
# ============================================================================

Write-Host "`n=== SUMMARY ===" -ForegroundColor Yellow

$passRate = if ($testCounter -gt 0) { [math]::Round(($passCounter / $testCounter) * 100) } else { 0 }

Add-Content -Path $resultsFile -Value @"

## Summary

| Metric | Value |
|--------|-------|
| Total Tests | $testCounter |
| Passed ✅ | $passCounter |
| Failed ❌ | $failCounter |
| Pass Rate | ${passRate}% |

"@

Write-Host "Total Tests: $testCounter" -ForegroundColor Cyan
Write-Host "Passed ✅: $passCounter" -ForegroundColor Green
Write-Host "Failed ❌: $failCounter" -ForegroundColor Red
Write-Host "Pass Rate: ${passRate}%" -ForegroundColor Cyan

if ($failCounter -eq 0) {
    Write-Host "`n✓ ALL TESTS PASSED" -ForegroundColor Green
} else {
    Write-Host "`n✗ $failCounter TEST(S) FAILED" -ForegroundColor Red
}

Write-Host "`n📄 Full report saved to: $resultsFile" -ForegroundColor Gray
