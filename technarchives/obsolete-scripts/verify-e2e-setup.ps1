#!/usr/bin/env pwsh

<#
.SYNOPSIS
    E2E Tests Setup Verification Script
    Vérifie que tous les fichiers sont en place et configurés

.DESCRIPTION
    Checklist complète pour la setup des tests E2E SPOFE
    
.EXAMPLE
    .\verify-e2e-setup.ps1
    .\verify-e2e-setup.ps1 -Verbose
#>

param(
    [switch]$Verbose
)

$errors = @()
$warnings = @()
$success = @()

Write-Host "🔍 Vérification de la setup des tests E2E SPOFE" -ForegroundColor Cyan
Write-Host "═" * 60 -ForegroundColor Cyan
Write-Host ""

# 1. Vérifier fichiers critiques
Write-Host "📁 Vérification des fichiers..." -ForegroundColor Yellow

$files = @(
    @{ path = "playwright.config.js"; type = "config" },
    @{ path = "e2e/helpers/auth-helper.js"; type = "helper" },
    @{ path = "e2e/helpers/business-helpers.js"; type = "helper" },
    @{ path = "e2e/business-flows.spec.js"; type = "test" },
    @{ path = "e2e/performance.spec.js"; type = "test" },
    @{ path = ".github/workflows/e2e-tests.yml"; type = "ci" },
    @{ path = "scripts/parse-performance.js"; type = "script" },
    @{ path = "scripts/generate-test-summary.js"; type = "script" },
    @{ path = "E2E_TESTS_GUIDE.md"; type = "docs" },
    @{ path = "E2E_QUICK_START.md"; type = "docs" }
)

foreach ($file in $files) {
    $fullPath = Join-Path (Get-Location) $file.path
    if (Test-Path $fullPath) {
        $success += "✅ $($file.type): $($file.path)"
        if ($Verbose) { Write-Host "  ✅ $($file.path)" -ForegroundColor Green }
    } else {
        $errors += "❌ MISSING ($($file.type)): $($file.path)"
        Write-Host "  ❌ MISSING: $($file.path)" -ForegroundColor Red
    }
}

# 2. Vérifier npm scripts
Write-Host ""
Write-Host "📜 Vérification des npm scripts..." -ForegroundColor Yellow

$scriptContent = Get-Content "package.json" -Raw
$requiredScripts = @(
    "test:e2e",
    "test:e2e:ui",
    "test:e2e:headed",
    "test:e2e:chromium",
    "test:e2e:performance",
    "test:perf:report"
)

foreach ($script in $requiredScripts) {
    if ($scriptContent -match "\"$script\"") {
        if ($Verbose) { Write-Host "  ✅ npm run $script" -ForegroundColor Green }
        $success += "✅ Script: $script"
    } else {
        $warnings += "⚠️  Script not found: $script"
        Write-Host "  ⚠️  Script not found: $script" -ForegroundColor Yellow
    }
}

# 3. Vérifier Playwright installation
Write-Host ""
Write-Host "🎭 Vérification Playwright..." -ForegroundColor Yellow

if (Test-Path "node_modules/@playwright/test") {
    Write-Host "  ✅ @playwright/test installé" -ForegroundColor Green
    $success += "✅ Playwright: installed"
} else {
    $warnings += "⚠️  @playwright/test non trouvé - exécutez 'npm install @playwright/test'"
    Write-Host "  ⚠️  @playwright/test non trouvé" -ForegroundColor Yellow
    Write-Host "     Exécutez: npm install @playwright/test" -ForegroundColor Yellow
}

# 4. Vérifier navigateurs Playwright
Write-Host ""
Write-Host "🌐 Vérification des navigateurs Playwright..." -ForegroundColor Yellow

$browserDir = Join-Path $env:USERPROFILE ".cache/ms-playwright"
if (Test-Path $browserDir) {
    Write-Host "  ✅ Répertoire des navigateurs trouvé" -ForegroundColor Green
    $success += "✅ Browsers: cached"
} else {
    $warnings += "⚠️  Navigateurs non installés - exécutez 'npx playwright install --with-deps'"
    Write-Host "  ⚠️  Navigateurs non installés" -ForegroundColor Yellow
    Write-Host "     Exécutez: npx playwright install --with-deps" -ForegroundColor Yellow
}

# 5. Vérifier services
Write-Host ""
Write-Host "🚀 Vérification des services..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/health" -TimeoutSec 2 -ErrorAction SilentlyContinue
    if ($response.StatusCode -eq 200) {
        Write-Host "  ✅ Backend (port 3001) responding" -ForegroundColor Green
        $success += "✅ Backend: running"
    }
} catch {
    $warnings += "⚠️  Backend non accessible sur http://localhost:3001"
    Write-Host "  ⚠️  Backend non accessible sur http://localhost:3001" -ForegroundColor Yellow
    Write-Host "     Exécutez: npm run dev:backend" -ForegroundColor Yellow
}

try {
    $response = Invoke-WebRequest -Uri "http://localhost:5173" -TimeoutSec 2 -ErrorAction SilentlyContinue
    if ($response.StatusCode -eq 200 -or $response.StatusCode -eq 404) {
        Write-Host "  ✅ Frontend (port 5173) responding" -ForegroundColor Green
        $success += "✅ Frontend: running"
    }
} catch {
    $warnings += "⚠️  Frontend non accessible sur http://localhost:5173"
    Write-Host "  ⚠️  Frontend non accessible sur http://localhost:5173" -ForegroundColor Yellow
    Write-Host "     Exécutez: npm run dev:frontend" -ForegroundColor Yellow
}

# 6. Vérifier .env
Write-Host ""
Write-Host "⚙️  Vérification de la configuration..." -ForegroundColor Yellow

if (Test-Path ".env") {
    $envContent = Get-Content ".env" -Raw
    if ($envContent -match "BASE_URL") {
        Write-Host "  ✅ BASE_URL configuré" -ForegroundColor Green
        $success += "✅ Env: BASE_URL"
    }
    if ($envContent -match "API_URL") {
        Write-Host "  ✅ API_URL configuré" -ForegroundColor Green
        $success += "✅ Env: API_URL"
    }
} else {
    if (Test-Path ".env.example") {
        Write-Host "  ℹ️  .env.example existe, mais .env manque" -ForegroundColor Cyan
        Write-Host "     Copiez: cp .env.example .env" -ForegroundColor Yellow
    }
}

# 7. Résumé
Write-Host ""
Write-Host "═" * 60 -ForegroundColor Cyan
Write-Host "📊 RÉSUMÉ" -ForegroundColor Cyan
Write-Host "═" * 60 -ForegroundColor Cyan

Write-Host "✅ Vérifications réussies: $($success.Count)" -ForegroundColor Green
Write-Host "⚠️  Avertissements: $($warnings.Count)" -ForegroundColor Yellow
Write-Host "❌ Erreurs: $($errors.Count)" -ForegroundColor Red

if ($errors.Count -eq 0 -and $warnings.Count -le 2) {
    Write-Host ""
    Write-Host "🎉 Setup E2E complétée avec succès!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Prochaines étapes:" -ForegroundColor Cyan
    Write-Host "1. npm install @playwright/test" -ForegroundColor White
    Write-Host "2. npx playwright install --with-deps" -ForegroundColor White
    Write-Host "3. npm run dev" -ForegroundColor White
    Write-Host "4. npm run test:e2e" -ForegroundColor White
    Write-Host ""
} else {
    if ($errors.Count -gt 0) {
        Write-Host ""
        Write-Host "Erreurs à corriger:" -ForegroundColor Red
        foreach ($error in $errors) {
            Write-Host "  $error" -ForegroundColor Red
        }
    }
    
    if ($warnings.Count -gt 0) {
        Write-Host ""
        Write-Host "Avertissements:" -ForegroundColor Yellow
        foreach ($warning in $warnings) {
            Write-Host "  $warning" -ForegroundColor Yellow
        }
    }
}

Write-Host ""
Write-Host "✨ Pour plus d'info: consulter E2E_TESTS_GUIDE.md" -ForegroundColor Cyan

# Exit code based on errors
exit $errors.Count
