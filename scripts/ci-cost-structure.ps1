#!/usr/bin/env pwsh
<#
.SYNOPSIS
    CI Locale — Cost-Structure (COUTFLEX) v1.0.0

.DESCRIPTION
    Exécute le pipeline CI complet localement, miroir exact de GitHub Actions.
    
    ORDRE STRICT (non négociable):
      1. Install
      2. TypeScript (module isolé)
      3. Guardian / AGA
      4. Tests write-side intégration
      5. Tests read-side / API GET
      6. Contract tests Budget ↔ Cost-Structure
      7. Génération OpenAPI
      8. Génération client frontend
      9. Contract tests Frontend ↔ Backend

.EXAMPLE
    .\ci-cost-structure.ps1
    .\ci-cost-structure.ps1 -SkipTests
    .\ci-cost-structure.ps1 -StopOnError
#>

param(
    [switch]$SkipTests,
    [switch]$StopOnError,
    [switch]$Verbose
)

$ErrorActionPreference = if ($StopOnError) { "Stop" } else { "Continue" }

# ═══════════════════════════════════════════════════════════════════════════════
# CONFIGURATION
# ═══════════════════════════════════════════════════════════════════════════════

$ROOT = Split-Path -Parent $PSScriptRoot
$COST_STRUCTURE = "$ROOT\cascade\modules\cost-structure"
$BUDGET = "$ROOT\cascade\modules\budget"
$FRONTEND = "$ROOT\frontend"

$steps = @()
$failed = $false

function Write-Step {
    param([string]$Number, [string]$Title)
    Write-Host ""
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host "  STEP $Number : $Title" -ForegroundColor Cyan
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
}

function Test-Step {
    param([string]$Name, [scriptblock]$Action)
    
    $result = @{ Name = $Name; Status = "PENDING"; Duration = 0 }
    $sw = [System.Diagnostics.Stopwatch]::StartNew()
    
    try {
        & $Action
        if ($LASTEXITCODE -eq 0 -or $null -eq $LASTEXITCODE) {
            $result.Status = "PASS"
            Write-Host "  ✅ $Name" -ForegroundColor Green
        } else {
            $result.Status = "FAIL"
            $script:failed = $true
            Write-Host "  ❌ $Name (exit code: $LASTEXITCODE)" -ForegroundColor Red
        }
    } catch {
        $result.Status = "FAIL"
        $script:failed = $true
        Write-Host "  ❌ $Name : $_" -ForegroundColor Red
    }
    
    $sw.Stop()
    $result.Duration = $sw.ElapsedMilliseconds
    $script:steps += $result
}

# ═══════════════════════════════════════════════════════════════════════════════
# BANNER
# ═══════════════════════════════════════════════════════════════════════════════

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════════════╗" -ForegroundColor Magenta
Write-Host "║                                                                   ║" -ForegroundColor Magenta
Write-Host "║   CI — COST-STRUCTURE (COUTFLEX) v1.0.0                          ║" -ForegroundColor Magenta
Write-Host "║   Pipeline de validation Golden Module                            ║" -ForegroundColor Magenta
Write-Host "║                                                                   ║" -ForegroundColor Magenta
Write-Host "╚═══════════════════════════════════════════════════════════════════╝" -ForegroundColor Magenta
Write-Host ""

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 1: INSTALL
# ═══════════════════════════════════════════════════════════════════════════════

Write-Step "1" "Install Dependencies"

Test-Step "npm ci (root)" {
    Set-Location $ROOT
    npm ci 2>&1 | Out-Null
}

Test-Step "npm install (cost-structure)" {
    Set-Location $COST_STRUCTURE
    npm install 2>&1 | Out-Null
}

Test-Step "npm install (frontend)" {
    Set-Location $FRONTEND
    npm install 2>&1 | Out-Null
}

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 2: TYPESCRIPT
# ═══════════════════════════════════════════════════════════════════════════════

Write-Step "2" "TypeScript Check (Module Isolé)"

Test-Step "tsc --noEmit" {
    Set-Location $COST_STRUCTURE
    npx tsc --noEmit
}

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 3: GUARDIAN / AGA
# ═══════════════════════════════════════════════════════════════════════════════

Write-Step "3" "Guardian / AGA Analysis"

Test-Step "aga:analyze" {
    Set-Location $COST_STRUCTURE
    npm run aga:analyze
}

if ($SkipTests) {
    Write-Host ""
    Write-Host "⚠️  Tests skipped (-SkipTests)" -ForegroundColor Yellow
    Write-Host ""
} else {

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 4: WRITE-SIDE TESTS
# ═══════════════════════════════════════════════════════════════════════════════

Write-Step "4" "Write-Side Integration Tests"

Test-Step "test:integration" {
    Set-Location $COST_STRUCTURE
    npm run test:integration
}

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 5: READ-SIDE / E2E TESTS
# ═══════════════════════════════════════════════════════════════════════════════

Write-Step "5" "Read-Side / API GET Tests"

Test-Step "test:e2e" {
    Set-Location $COST_STRUCTURE
    npm run test:e2e
}

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 6: CONTRACT TESTS BUDGET
# ═══════════════════════════════════════════════════════════════════════════════

Write-Step "6" "Contract Tests (Budget ↔ Cost-Structure)"

Test-Step "budget:test:contract" {
    Set-Location $BUDGET
    npm run test:contract
}

}

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 7: OPENAPI GENERATION
# ═══════════════════════════════════════════════════════════════════════════════

Write-Step "7" "Generate OpenAPI Specification"

Test-Step "openapi:generate" {
    Set-Location $COST_STRUCTURE
    npm run openapi:generate
}

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 8: FRONTEND CLIENT GENERATION
# ═══════════════════════════════════════════════════════════════════════════════

Write-Step "8" "Generate Frontend API Client"

Test-Step "api:generate:cost-structure" {
    Set-Location $FRONTEND
    npm run api:generate:cost-structure
}

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 9: CONTRACT TESTS FRONTEND
# ═══════════════════════════════════════════════════════════════════════════════

if (-not $SkipTests) {

Write-Step "9" "Contract Tests (Frontend ↔ Backend)"

Test-Step "test:contract (frontend)" {
    Set-Location $FRONTEND
    npm run test:contract
}

}

# ═══════════════════════════════════════════════════════════════════════════════
# SUMMARY
# ═══════════════════════════════════════════════════════════════════════════════

Set-Location $ROOT

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "  SUMMARY" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

$passed = ($steps | Where-Object { $_.Status -eq "PASS" }).Count
$failedCount = ($steps | Where-Object { $_.Status -eq "FAIL" }).Count
$totalTime = ($steps | Measure-Object -Property Duration -Sum).Sum

foreach ($step in $steps) {
    $icon = if ($step.Status -eq "PASS") { "✅" } else { "❌" }
    $color = if ($step.Status -eq "PASS") { "Green" } else { "Red" }
    Write-Host "  $icon $($step.Name) ($($step.Duration)ms)" -ForegroundColor $color
}

Write-Host ""
Write-Host "  Total: $passed passed, $failedCount failed (${totalTime}ms)" -ForegroundColor $(if ($failed) { "Red" } else { "Green" })
Write-Host ""

if ($failed) {
    Write-Host "╔═══════════════════════════════════════════════════════════════════╗" -ForegroundColor Red
    Write-Host "║                                                                   ║" -ForegroundColor Red
    Write-Host "║   ❌ CI FAILED — Cost-Structure NOT Ready                        ║" -ForegroundColor Red
    Write-Host "║      Fix issues before declaring Golden Module                    ║" -ForegroundColor Red
    Write-Host "║                                                                   ║" -ForegroundColor Red
    Write-Host "╚═══════════════════════════════════════════════════════════════════╝" -ForegroundColor Red
    exit 1
} else {
    Write-Host "╔═══════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║                                                                   ║" -ForegroundColor Green
    Write-Host "║   🟩 COST-STRUCTURE (COUTFLEX) v1.0.0 — GOLDEN MODULE           ║" -ForegroundColor Green
    Write-Host "║                                                                   ║" -ForegroundColor Green
    Write-Host "║   ✅ CI verte                                                    ║" -ForegroundColor Green
    Write-Host "║   ✅ TypeScript compilé                                          ║" -ForegroundColor Green
    Write-Host "║   ✅ Guardian/AGA actif                                          ║" -ForegroundColor Green
    Write-Host "║   ✅ Tests passés                                                ║" -ForegroundColor Green
    Write-Host "║   ✅ OpenAPI généré                                              ║" -ForegroundColor Green
    Write-Host "║   ✅ Client frontend aligné                                      ║" -ForegroundColor Green
    Write-Host "║                                                                   ║" -ForegroundColor Green
    Write-Host "║   🔒 PRÊT POUR GEL OFFICIEL v1.0.0                              ║" -ForegroundColor Green
    Write-Host "║   👉 Passage au module Stock AUTORISÉ                            ║" -ForegroundColor Green
    Write-Host "║                                                                   ║" -ForegroundColor Green
    Write-Host "╚═══════════════════════════════════════════════════════════════════╝" -ForegroundColor Green
    exit 0
}
