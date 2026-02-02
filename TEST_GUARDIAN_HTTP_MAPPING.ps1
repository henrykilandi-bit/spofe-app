# Guardian → HTTP Mapping Test Suite
# Tests the complete error mapping end-to-end

param(
    [string]$ServerUrl = "http://localhost:3001",
    [int]$ServerStartTimeout = 10,
    [switch]$SkipServerStart = $false
)

$script:TestResults = @()
$script:PassedTests = 0
$script:FailedTests = 0

# Colors
$Green = [System.ConsoleColor]::Green
$Red = [System.ConsoleColor]::Red
$Yellow = [System.ConsoleColor]::Yellow
$Cyan = [System.ConsoleColor]::Cyan
$White = [System.ConsoleColor]::White

function Write-TestHeader {
    param([string]$Title)
    Write-Host "`n" -ForegroundColor White
    Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "  $Title" -ForegroundColor Cyan
    Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
}

function Write-TestCase {
    param([string]$Number, [string]$Title)
    Write-Host "`n[TEST $Number] $Title" -ForegroundColor Yellow
}

function Write-Success {
    param([string]$Message)
    Write-Host "  ✅ $Message" -ForegroundColor Green
}

function Write-Failure {
    param([string]$Message)
    Write-Host "  ❌ $Message" -ForegroundColor Red
}

function Write-Info {
    param([string]$Message)
    Write-Host "  ℹ️  $Message" -ForegroundColor Cyan
}

function Write-Request {
    param([string]$Method, [string]$Url, [string]$Body)
    Write-Host "  📤 Request: $Method $Url" -ForegroundColor Gray
    if ($Body) {
        Write-Host "     Body: $Body" -ForegroundColor Gray
    }
}

function Write-Response {
    param([int]$Status, [string]$Body)
    Write-Host "  📥 Response: $Status" -ForegroundColor Gray
    if ($Body) {
        Write-Host "     Body: $Body" -ForegroundColor Gray
    }
}

function Test-ServerHealth {
    param([string]$Url)
    Write-Host "  ⏳ Checking server health..." -ForegroundColor Yellow
    
    $maxAttempts = 10
    for ($i = 1; $i -le $maxAttempts; $i++) {
        try {
            $response = Invoke-WebRequest -Uri "$Url/health" -Method GET -TimeoutSec 2 -ErrorAction Stop
            Write-Success "Server is running"
            return $true
        } catch {
            if ($i -eq $maxAttempts) {
                Write-Failure "Server failed to start (timeout after 20 seconds)"
                return $false
            }
            Start-Sleep -Seconds 2
        }
    }
}

function Invoke-TestRequest {
    param(
        [string]$Method,
        [string]$Url,
        [object]$Body,
        [int]$ExpectedStatus,
        [string]$ExpectedViolation = $null,
        [string]$TestName
    )
    
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            TimeoutSec = 5
            ErrorAction = "Stop"
        }
        
        if ($Body) {
            $params['Body'] = ($Body | ConvertTo-Json)
            $params['ContentType'] = "application/json"
        }
        
        Write-Request -Method $Method -Url $Url -Body ($Body | ConvertTo-Json -Depth 1)
        
        $response = Invoke-WebRequest @params
        $statusCode = $response.StatusCode
        $responseBody = $response.Content | ConvertFrom-Json
        
        Write-Response -Status $statusCode -Body ($responseBody | ConvertTo-Json -Compress)
        
        # Validate status code
        if ($statusCode -ne $ExpectedStatus) {
            Write-Failure "Expected status $ExpectedStatus, got $statusCode"
            $script:TestResults += @{
                Name = $TestName
                Status = "FAILED"
                Reason = "Status code mismatch"
                Expected = $ExpectedStatus
                Actual = $statusCode
            }
            $script:FailedTests++
            return $false
        }
        
        # Validate violation code if expected
        if ($ExpectedViolation -and $responseBody.violation -ne $ExpectedViolation) {
            Write-Failure "Expected violation $ExpectedViolation, got $($responseBody.violation)"
            $script:TestResults += @{
                Name = $TestName
                Status = "FAILED"
                Reason = "Violation code mismatch"
                Expected = $ExpectedViolation
                Actual = $responseBody.violation
            }
            $script:FailedTests++
            return $false
        }
        
        Write-Success "Status and violation codes match expected values"
        $script:TestResults += @{
            Name = $TestName
            Status = "PASSED"
            StatusCode = $statusCode
            Violation = $responseBody.violation
        }
        $script:PassedTests++
        return $true
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.Value
        $responseBody = $_.Exception.Response.Content.ReadAsStringAsync().Result | ConvertFrom-Json
        
        Write-Response -Status $statusCode -Body ($responseBody | ConvertTo-Json -Compress)
        
        # Validate expected error status
        if ($statusCode -ne $ExpectedStatus) {
            Write-Failure "Expected status $ExpectedStatus, got $statusCode"
            $script:TestResults += @{
                Name = $TestName
                Status = "FAILED"
                Reason = "Status code mismatch"
                Expected = $ExpectedStatus
                Actual = $statusCode
            }
            $script:FailedTests++
            return $false
        }
        
        # Validate violation code if expected
        if ($ExpectedViolation -and $responseBody.violation -ne $ExpectedViolation) {
            Write-Failure "Expected violation $ExpectedViolation, got $($responseBody.violation)"
            $script:TestResults += @{
                Name = $TestName
                Status = "FAILED"
                Reason = "Violation code mismatch"
                Expected = $ExpectedViolation
                Actual = $responseBody.violation
            }
            $script:FailedTests++
            return $false
        }
        
        Write-Success "Status and violation codes match expected values"
        $script:TestResults += @{
            Name = $TestName
            Status = "PASSED"
            StatusCode = $statusCode
            Violation = $responseBody.violation
        }
        $script:PassedTests++
        return $true
    }
}

# ============================================================================
# MAIN TEST EXECUTION
# ============================================================================

Write-TestHeader "Guardian → HTTP Mapping Test Suite"

Write-Host "`nServer URL: $ServerUrl" -ForegroundColor Cyan
Write-Host "Mode: $(if ($SkipServerStart) { 'Manual Server (Skip Start)' } else { 'Auto Start Server' })" -ForegroundColor Cyan

# Start server if not skipped
if (-not $SkipServerStart) {
    Write-Host "`n⏳ Starting Fastify server..." -ForegroundColor Yellow
    
    $ProcessParams = @{
        FilePath = "npm"
        ArgumentList = @("run", "dev")
        WorkingDirectory = "cascade"
        NoNewWindow = $true
        PassThru = $true
    }
    
    $serverProcess = Start-Process @ProcessParams
    
    # Wait for server to start
    if (-not (Test-ServerHealth -Url $ServerUrl)) {
        Write-Host "`n❌ Failed to start server" -ForegroundColor Red
        if ($serverProcess) {
            Stop-Process -InputObject $serverProcess -Force -ErrorAction SilentlyContinue
        }
        exit 1
    }
}
else {
    Write-Host "`nℹ️  Assuming server is already running..." -ForegroundColor Cyan
    if (-not (Test-ServerHealth -Url $ServerUrl)) {
        Write-Host "`n❌ Server is not running on $ServerUrl" -ForegroundColor Red
        exit 1
    }
}

# ============================================================================
# TEST SCENARIO 1: Guardian Rejects (G4-03 - Implicit Authority)
# ============================================================================

Write-TestCase "1" "Guardian Rejects Authorization (G4-03 - Implicit Authority)"
Write-Info "Attempting to create aggregate with USER role (should be forbidden)"
Write-Info "Expected: 403 Forbidden, violation=G4-03"

Invoke-TestRequest `
    -Method "POST" `
    -Url "$ServerUrl/api/v1/aggregates" `
    -Body @{ 
        aggregateId = [guid]::NewGuid().ToString()
        actorRole = "USER"
        data = @{ name = "Test Aggregate" }
    } `
    -ExpectedStatus 403 `
    -ExpectedViolation "G4-03" `
    -TestName "Guardian Authorization Rejection"

# ============================================================================
# TEST SCENARIO 2: Process Order Violation (G4-01)
# ============================================================================

Write-TestCase "2" "Process Order Violation (G4-01)"
Write-Info "Attempting to finalize non-existent aggregate (invalid state transition)"
Write-Info "Expected: 409 Conflict, violation=G4-01"

Invoke-TestRequest `
    -Method "POST" `
    -Url "$ServerUrl/api/v1/aggregates/00000000-0000-0000-0000-000000000000/finalize" `
    -Body @{ actorRole = "SYSTEM" } `
    -ExpectedStatus 409 `
    -ExpectedViolation "G4-01" `
    -TestName "Process Order Violation"

# ============================================================================
# TEST SCENARIO 3: Invalid DTO (400)
# ============================================================================

Write-TestCase "3" "Invalid DTO Format (400 Bad Request)"
Write-Info "Attempting to create aggregate with invalid UUID format"
Write-Info "Expected: 400 Bad Request (validation error)"

Invoke-TestRequest `
    -Method "POST" `
    -Url "$ServerUrl/api/v1/aggregates" `
    -Body @{ 
        aggregateId = "invalid-uuid"
        actorRole = "SYSTEM"
    } `
    -ExpectedStatus 400 `
    -TestName "Invalid DTO Validation"

# ============================================================================
# TEST SCENARIO 4: Success (201 Created)
# ============================================================================

Write-TestCase "4" "Successful Aggregate Creation (201 Created)"
Write-Info "Creating aggregate with SYSTEM role (should succeed)"
Write-Info "Expected: 201 Created"

$aggregateId = [guid]::NewGuid().ToString()
Invoke-TestRequest `
    -Method "POST" `
    -Url "$ServerUrl/api/v1/aggregates" `
    -Body @{ 
        aggregateId = $aggregateId
        actorRole = "SYSTEM"
        data = @{ name = "Test Aggregate" }
    } `
    -ExpectedStatus 201 `
    -TestName "Successful Aggregate Creation"

# ============================================================================
# TEST RESULTS SUMMARY
# ============================================================================

Write-TestHeader "Test Results Summary"

Write-Host "`nTotal Tests: $($script:PassedTests + $script:FailedTests)" -ForegroundColor White
Write-Host "Passed: " -ForegroundColor White -NoNewline
Write-Host "$($script:PassedTests)" -ForegroundColor Green

if ($script:FailedTests -gt 0) {
    Write-Host "Failed: " -ForegroundColor White -NoNewline
    Write-Host "$($script:FailedTests)" -ForegroundColor Red
}

Write-Host "`nDetailed Results:" -ForegroundColor Cyan
Write-Host "───────────────────────────────────────────────────────────────" -ForegroundColor Cyan

foreach ($result in $script:TestResults) {
    $statusColor = if ($result.Status -eq "PASSED") { $Green } else { $Red }
    Write-Host "  [$($result.Status)]" -ForegroundColor $statusColor -NoNewline
    Write-Host " $($result.Name)" -ForegroundColor White
    
    if ($result.Status -eq "FAILED") {
        Write-Host "    Reason: $($result.Reason)" -ForegroundColor Gray
        if ($result.Expected) {
            Write-Host "    Expected: $($result.Expected)" -ForegroundColor Gray
        }
        if ($result.Actual) {
            Write-Host "    Actual: $($result.Actual)" -ForegroundColor Gray
        }
    }
    else {
        if ($result.StatusCode) {
            Write-Host "    Status: $($result.StatusCode)" -ForegroundColor Gray
        }
        if ($result.Violation) {
            Write-Host "    Violation: $($result.Violation)" -ForegroundColor Gray
        }
    }
}

Write-Host "`n───────────────────────────────────────────────────────────────" -ForegroundColor Cyan

# Final status
if ($script:FailedTests -eq 0) {
    Write-Host "`n✅ ALL TESTS PASSED - Guardian → HTTP Mapping is working correctly!" -ForegroundColor Green
    $exitCode = 0
}
else {
    Write-Host "`n❌ $($script:FailedTests) TEST(S) FAILED - Please review the output above" -ForegroundColor Red
    $exitCode = 1
}

# Cleanup
if (-not $SkipServerStart -and $null -ne $serverProcess) {
    Write-Host "`nCleaning up: Stopping server..." -ForegroundColor Yellow
    Stop-Process -InputObject $serverProcess -Force -ErrorAction SilentlyContinue
    Write-Success "Server stopped"
}

Write-Host "`n" -ForegroundColor White
exit $exitCode
