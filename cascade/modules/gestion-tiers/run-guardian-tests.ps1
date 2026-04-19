#!/usr/bin/env pwsh

# Script pour exécuter les tests Guardian
# Usage: ./run-guardian-tests.ps1

Write-Host "🛡️ SPOFE Guardian Tests - Module gestion-tiers" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

$ModuleDir = "cascade\modules\gestion-tiers"

if (!(Test-Path $ModuleDir)) {
    Write-Error "Module directory not found: $ModuleDir"
    exit 1
}

Set-Location $ModuleDir

Write-Host "📁 Working directory: $(Get-Location)" -ForegroundColor Yellow

# Vérifier les dépendances
if (!(Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
}

Write-Host "🧪 Running Guardian tests..." -ForegroundColor Green

# Exécuter les tests avec configuration Guardian
npx jest --config jest.guardian.config.json --verbose

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ All Guardian tests passed!" -ForegroundColor Green
} else {
    Write-Host "❌ Some tests failed" -ForegroundColor Red
    exit 1
}

Write-Host "🎯 To run with coverage: npx jest --config jest.guardian.config.json --coverage" -ForegroundColor Cyan