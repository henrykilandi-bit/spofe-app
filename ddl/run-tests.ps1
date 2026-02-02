#!/usr/bin/env pwsh
# ==================================================================================
# SPOFE SQL Non-Regression Tests — CI Execution Script (PowerShell)
# Exécute tous les tests de non-régression en séquence
# Sortie: exit 0 si tous les tests passent, exit 1 sinon
# ==================================================================================

param(
    [string]$DbHost = "localhost",
    [int]$DbPort = 5432,
    [string]$DbName = "spofe",
    [string]$DbUser = "postgres",
    [string]$DbPassword = "spofe_secure_pwd_2026",
    [switch]$Verbose
)

$ErrorActionPreference = "Stop"

# Configuration
$ScriptDir = Split-Path -Parent $PSCommandPath
$TestsDir = Join-Path $ScriptDir "tests"
$LogDir = Join-Path $ScriptDir ".test-logs"
$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$LogFile = Join-Path $LogDir "spofe_tests_${Timestamp}.log"

# Couleurs
$Colors = @{
    Info    = "Cyan"
    Success = "Green"
    Error   = "Red"
    Warning = "Yellow"
}

# ==================================================================================
# Fonctions utilitaires
# ==================================================================================

function Write-Log {
    param($Message, $Type = "Info")
    
    $prefix = switch ($Type) {
        "Info"    { "[INFO]" }
        "Success" { "[✓ PASS]" }
        "Error"   { "[✗ FAIL]" }
        "Warning" { "[⚠ WARN]" }
    }
    
    $output = "$prefix $Message"
    Write-Host $output -ForegroundColor $Colors[$Type]
    Add-Content -Path $LogFile -Value $output
}

# ==================================================================================
# Vérifications préalables
# ==================================================================================

Write-Host "🧪 SPOFE SQL Non-Regression Test Suite" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# Créer répertoire de logs
$null = New-Item -ItemType Directory -Path $LogDir -Force

# Vérifier que le répertoire de tests existe
if (-not (Test-Path $TestsDir)) {
    Write-Log "Tests directory not found: $TestsDir" "Error"
    exit 1
}

Write-Log "Tests directory: $TestsDir" "Info"
Write-Log "Log file: $LogFile" "Info"

# Vérifier que docker est disponible
try {
    $dockerPs = docker ps 2>&1
    Write-Log "Docker available" "Success"
} catch {
    Write-Log "Docker not available. Is Docker Desktop running?" "Error"
    exit 1
}

Write-Log "PostgreSQL Host: ${DbHost}:${DbPort}" "Info"
Write-Log "Database: $DbName" "Info"
Write-Log "User: $DbUser" "Info"

# ==================================================================================
# Test de connexion
# ==================================================================================

Write-Host ""
Write-Log "Testing connection to PostgreSQL..." "Info"

try {
    $env:PGPASSWORD = $DbPassword
    $testConn = docker exec spofe-postgres psql -h $DbHost -U $DbUser -d $DbName -c "SELECT version();" 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Log "PostgreSQL connection successful" "Success"
    } else {
        Write-Log "Cannot connect to PostgreSQL: $testConn" "Error"
        exit 1
    }
} catch {
    Write-Log "PostgreSQL connection failed: $_" "Error"
    exit 1
} finally {
    Remove-Item env:PGPASSWORD -ErrorAction SilentlyContinue
}

# ==================================================================================
# Exécution des tests
# ==================================================================================

Write-Host ""
Write-Host "Running test suites..." -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

$totalTests = 0
$passedTests = 0
$failedTests = 0

# Array des fichiers de test
$testFiles = @(
    "01_immutability.sql",
    "02_decision_chain.sql",
    "03_process_registry.sql",
    "04_audit.sql",
    "05_read_model.sql"
)

foreach ($testFile in $testFiles) {
    $testPath = Join-Path $TestsDir $testFile
    
    if (-not (Test-Path $testPath)) {
        Write-Log "Test file not found: $testPath" "Warning"
        continue
    }
    
    Write-Host ""
    Write-Log "Executing: $testFile" "Info"
    
    # Créer un fichier de sortie pour chaque test
    $testOutput = Join-Path $LogDir "$($testFile.Replace('.sql', ''))_${Timestamp}.out"
    
    try {
        # Lire le contenu du fichier
        $sqlContent = Get-Content -Path $testPath -Raw
        
        # Exécuter le test via Docker
        $env:PGPASSWORD = $DbPassword
        $result = $sqlContent | docker exec -i spofe-postgres psql -h $DbHost -U $DbUser -d $DbName -v ON_ERROR_STOP=1 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Log "$testFile completed" "Success"
            $passedTests++
            
            # Afficher les résultats importants
            $result | Select-String "✓ PASS|✅" -ErrorAction SilentlyContinue | Select-Object -First 5 | ForEach-Object {
                Write-Host "    $_" -ForegroundColor Green
            }
        } else {
            Write-Log "$testFile failed" "Error"
            $failedTests++
            
            # Afficher les erreurs (dernières 20 lignes)
            $result | Select-Object -Last 20 | ForEach-Object {
                Write-Host "    $_" -ForegroundColor Red
            }
        }
        
        $result | Out-File -FilePath $testOutput -Force
    } catch {
        Write-Log "$testFile failed with exception: $_" "Error"
        $failedTests++
    } finally {
        Remove-Item env:PGPASSWORD -ErrorAction SilentlyContinue
    }
    
    $totalTests++
}

# ==================================================================================
# Résumé des résultats
# ==================================================================================

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "Test Results Summary" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

Write-Host "Total test suites: $totalTests"
Write-Log "Passed: $passedTests" "Success"

if ($failedTests -gt 0) {
    Write-Log "Failed: $failedTests" "Error"
} else {
    Write-Log "Failed: $failedTests" "Success"
}

Write-Host ""
Write-Log "Detailed logs: $LogFile" "Info"
Write-Host ""

# ==================================================================================
# Exit code
# ==================================================================================

if ($failedTests -eq 0 -and $totalTests -gt 0) {
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
    Write-Host "✅ ALL TESTS PASSED — Architecture is SAFE" -ForegroundColor Green
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
    exit 0
} else {
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Red
    Write-Host "❌ TESTS FAILED — Architecture violations detected" -ForegroundColor Red
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Red
    exit 1
}
