#!/usr/bin/env pwsh
# ==================================================================================
# SPOFE PostgreSQL Setup Script
# Initialise PostgreSQL avec le DDL SILC v2.1
# ==================================================================================

param(
    [switch]$Clean,
    [switch]$Interactive
)

$ErrorActionPreference = "Stop"
$script:ProjectRoot = Split-Path -Parent $PSCommandPath

Write-Host "🐘 SPOFE PostgreSQL Setup" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# ==================================================================================
# 1. Vérifier Docker
# ==================================================================================
Write-Host "✓ Vérification de Docker..." -ForegroundColor Yellow
$docker = docker --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Docker n'est pas installé ou pas en cours d'exécution" -ForegroundColor Red
    exit 1
}
Write-Host "  $docker" -ForegroundColor Green

# ==================================================================================
# 2. Nettoyer les conteneurs existants (optionnel)
# ==================================================================================
if ($Clean) {
    Write-Host ""
    Write-Host "🧹 Nettoyage des conteneurs existants..." -ForegroundColor Yellow
    
    $existing = docker ps -a -q -f "name=spofe-postgres" 2>&1
    if ($existing) {
        Write-Host "  Arrêt du conteneur spofe-postgres..."
        docker stop spofe-postgres 2>&1 | Out-Null
        
        Write-Host "  Suppression du conteneur spofe-postgres..."
        docker rm spofe-postgres 2>&1 | Out-Null
        
        Write-Host "✓ Conteneur supprimé" -ForegroundColor Green
    }
}

# ==================================================================================
# 3. Démarrer PostgreSQL
# ==================================================================================
Write-Host ""
Write-Host "🚀 Démarrage de PostgreSQL..." -ForegroundColor Yellow

$container = docker ps -a -q -f "name=spofe-postgres" 2>&1
if ($container) {
    Write-Host "  Redémarrage du conteneur existant..." -ForegroundColor Cyan
    docker start spofe-postgres
} else {
    Write-Host "  Création et démarrage du conteneur..." -ForegroundColor Cyan
    docker-compose -f docker-compose.postgres.yml up -d
}

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Erreur au démarrage de PostgreSQL" -ForegroundColor Red
    exit 1
}

Write-Host "✓ PostgreSQL démarré" -ForegroundColor Green

# ==================================================================================
# 4. Attendre que PostgreSQL soit prêt
# ==================================================================================
Write-Host ""
Write-Host "⏳ Attente du démarrage de PostgreSQL..." -ForegroundColor Yellow

$maxRetries = 30
$retries = 0

while ($retries -lt $maxRetries) {
    $ready = docker exec spofe-postgres pg_isready -U postgres -d spofe 2>&1
    if ($ready -match "accepting") {
        Write-Host "✓ PostgreSQL prêt" -ForegroundColor Green
        break
    }
    
    $retries++
    Write-Host "  Tentative $retries/$maxRetries..."
    Start-Sleep -Seconds 2
}

if ($retries -eq $maxRetries) {
    Write-Host "✗ PostgreSQL n'a pas démarré à temps" -ForegroundColor Red
    exit 1
}

# ==================================================================================
# 5. Vérifier le DDL
# ==================================================================================
Write-Host ""
Write-Host "🔍 Vérification du DDL..." -ForegroundColor Yellow

$ddlFile = Join-Path $script:ProjectRoot "ddl" "spofe-silc-complete.sql"
if (-not (Test-Path $ddlFile)) {
    Write-Host "✗ Fichier DDL non trouvé: $ddlFile" -ForegroundColor Red
    exit 1
}

Write-Host "✓ DDL trouvé" -ForegroundColor Green

# ==================================================================================
# 6. Exécuter le DDL
# ==================================================================================
Write-Host ""
Write-Host "📝 Exécution du DDL..." -ForegroundColor Yellow

$ddlContent = Get-Content $ddlFile -Raw
docker exec -i spofe-postgres psql -U postgres -d spofe <<EOF
$ddlContent
EOF

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Erreur lors de l'exécution du DDL" -ForegroundColor Red
    exit 1
}

Write-Host "✓ DDL exécuté" -ForegroundColor Green

# ==================================================================================
# 7. Vérifier les rôles créés
# ==================================================================================
Write-Host ""
Write-Host "🔐 Vérification des rôles..." -ForegroundColor Yellow

$roles = docker exec spofe-postgres psql -U postgres -d spofe -t -c "SELECT rolname FROM pg_roles WHERE rolname LIKE 'spofe_%';" 2>&1

if ($roles -match "spofe_writer" -and $roles -match "spofe_reader") {
    Write-Host "✓ Rôles SILC créés:" -ForegroundColor Green
    Write-Host "  - spofe_writer (INSERT)" -ForegroundColor Cyan
    Write-Host "  - spofe_reader (SELECT)" -ForegroundColor Cyan
} else {
    Write-Host "⚠ Rôles SILC non trouvés" -ForegroundColor Yellow
}

# ==================================================================================
# 8. Vérifier les tables
# ==================================================================================
Write-Host ""
Write-Host "📊 Vérification des tables..." -ForegroundColor Yellow

$tables = docker exec spofe-postgres psql -U postgres -d spofe -t -c "\dt public.*" 2>&1 | grep -E "process_registry|decision|event|fact|audit_log"

if ($tables) {
    Write-Host "✓ Tables créées:" -ForegroundColor Green
    $tables | ForEach-Object {
        Write-Host "  $_" -ForegroundColor Cyan
    }
} else {
    Write-Host "⚠ Tables non trouvées" -ForegroundColor Yellow
}

# ==================================================================================
# 9. Information de connexion
# ==================================================================================
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host "✅ Configuration SPOFE PostgreSQL complète" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host ""
Write-Host "📍 Connexion:" -ForegroundColor Cyan
Write-Host "   Host:     localhost" -ForegroundColor White
Write-Host "   Port:     5432" -ForegroundColor White
Write-Host "   Database: spofe" -ForegroundColor White
Write-Host "   User:     postgres" -ForegroundColor White
Write-Host "   Password: spofe_secure_pwd_2026" -ForegroundColor White
Write-Host ""
Write-Host "🔐 Rôles SILC:" -ForegroundColor Cyan
Write-Host "   spofe_writer: INSERT uniquement" -ForegroundColor White
Write-Host "   spofe_reader: SELECT uniquement" -ForegroundColor White
Write-Host ""
Write-Host "📝 Commandes utiles:" -ForegroundColor Cyan
Write-Host "   docker exec -it spofe-postgres psql -U postgres -d spofe" -ForegroundColor Yellow
Write-Host "   docker-compose -f docker-compose.postgres.yml down" -ForegroundColor Yellow
Write-Host ""

if ($Interactive) {
    Write-Host "🔌 Lancement du shell PostgreSQL interactif..." -ForegroundColor Cyan
    Write-Host ""
    docker exec -it spofe-postgres psql -U postgres -d spofe
}

exit 0
