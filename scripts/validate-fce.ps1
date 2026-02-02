# PowerShell version du validateur FCE
# Frontend Contract Enforcer - Validation Script
# Usage: .\validate-fce.ps1

param(
    [switch]$Strict = $false,
    [string]$SourcePath = "src"
)

$ErrorCount = 0
$WarningCount = 0

function Write-Section {
    param([string]$Title, [string]$Number)
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "  [$Number/5] $Title" -ForegroundColor Cyan
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
}

function Write-Pass {
    param([string]$Message)
    Write-Host "✓ PASSÉ: $Message" -ForegroundColor Green
}

function Write-Fail {
    param([string]$Message)
    Write-Host "✗ ÉCHEC: $Message" -ForegroundColor Red
    global:$ErrorCount++
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠ AVERTISSEMENT: $Message" -ForegroundColor Yellow
    global:$WarningCount++
}

# Header
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  SPOFE Frontend Contract Enforcer - Validation" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan

# 1. CHECK: Pas de fetch() direct
Write-Section "Pas de fetch() en dehors de FCE" "1"

$fetchMatches = Get-ChildItem -Path $SourcePath -Recurse -Include "*.ts", "*.js", "*.tsx", "*.jsx" |
    Select-String -Pattern "fetch\(" |
    Where-Object { $_.Path -notmatch "spofe-contract" -and $_.Path -notmatch "__tests__" -and $_.Path -notmatch "node_modules" }

if ($fetchMatches) {
    Write-Fail "fetch() détecté en dehors de spofe-contract"
    $fetchMatches | ForEach-Object { Write-Host "  → $_" -ForegroundColor Gray }
} else {
    Write-Pass "Aucun fetch() direct"
}

# 2. CHECK: Pas de localStorage métier
Write-Section "Pas de localStorage/sessionStorage métier" "2"

$storageMatches = Get-ChildItem -Path $SourcePath -Recurse -Include "*.ts", "*.js", "*.tsx", "*.jsx" |
    Select-String -Pattern "(localStorage|sessionStorage)" |
    Select-String -Pattern "(status|balance|aggregate|amount|permission)" |
    Where-Object { $_.Path -notmatch "spofe-contract" -and $_.Path -notmatch "__tests__" }

if ($storageMatches) {
    Write-Fail "localStorage métier détecté"
    $storageMatches | ForEach-Object { Write-Host "  → $_" -ForegroundColor Gray }
} else {
    Write-Pass "Aucun localStorage métier"
}

# 3. CHECK: Pas de logique métier dans les vues
Write-Section "Pas de logique métier dans les vues" "3"

$componentPath = Join-Path $SourcePath "components"
if (Test-Path $componentPath) {
    $logicMatches = Get-ChildItem -Path $componentPath -Recurse -Include "*.tsx", "*.jsx" |
        Select-String -Pattern "if\s*\(.*\.(status|balance|closed|approved)" |
        Where-Object { $_.Path -notmatch "__tests__" }

    if ($logicMatches) {
        Write-Warning "Logique métier potentielle dans les vues"
        $logicMatches | ForEach-Object { Write-Host "  → $_" -ForegroundColor Gray }
    } else {
        Write-Pass "Aucune logique métier suspecte"
    }
} else {
    Write-Pass "Dossier components non trouvé (OK)"
}

# 4. CHECK: Imports FCE cohérents
Write-Section "Imports FCE utilisent le point d'entrée" "4"

$badImports = Get-ChildItem -Path $SourcePath -Recurse -Include "*.ts", "*.js", "*.tsx", "*.jsx" |
    Select-String -Pattern "from '@/core/spofe-contract/" |
    Where-Object { 
        $_.Line -notmatch "from '@/core/spofe-contract'" -and
        $_.Path -notmatch "spofe-contract/" -and
        $_.Path -notmatch "__tests__"
    }

if ($badImports) {
    Write-Fail "Import direct depuis un sous-module FCE"
    $badImports | ForEach-Object { Write-Host "  → $_" -ForegroundColor Gray }
    Write-Host "    → Utiliser: import { ... } from '@/core/spofe-contract'" -ForegroundColor Yellow
} else {
    Write-Pass "Tous les imports FCE correctement structurés"
}

# 5. CHECK: Contract chargé au startup
Write-Section "Contract chargé au startup" "5"

$startupFiles = @("main.ts", "index.ts", "app.ts")
$contractLoaded = $false

foreach ($file in $startupFiles) {
    $mainFile = Get-ChildItem -Path $SourcePath -Recurse -Filter $file -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($mainFile -and (Select-String -Path $mainFile.FullName -Pattern "loadContract\(\)" -ErrorAction SilentlyContinue)) {
        $contractLoaded = $true
        break
    }
}

if ($contractLoaded) {
    Write-Pass "Contract chargé au startup"
} else {
    Write-Warning "loadContract() non détecté au startup"
    Write-Host "    → Ajouter dans main.ts: await loadContract()" -ForegroundColor Yellow
}

# RÉSUMÉ
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan

if ($ErrorCount -eq 0) {
    Write-Host "✓ TOUS LES CHECKS PASSÉS" -ForegroundColor Green
    Write-Host "  Frontend respecte le contrat SPOFE"
} else {
    Write-Host "✗ VALIDATION ÉCHOUÉE" -ForegroundColor Red
    Write-Host "  Erreurs: $ErrorCount | Avertissements: $WarningCount"
    Write-Host "  Veuillez corriger les violations avant de merger"
}

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Exit avec code d'erreur si strict mode
if ($Strict -and $ErrorCount -gt 0) {
    exit 1
} else {
    exit 0
}
