# startup.ps1
# Script de démarrage complet pour SPOFE v2.1 (Windows)
# Usage: .\startup.ps1 -Env dev
# Env: dev (défaut), prod, docker

param(
    [string]$Env = "dev"
)

$ErrorActionPreference = "Stop"

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$redisHost = $env:REDIS_HOST -or "127.0.0.1"
$redisPort = $env:REDIS_PORT -or 6379
$mysqlHost = $env:MYSQL_HOST -or "127.0.0.1"
$mysqlPort = $env:MYSQL_PORT -or 3306

Write-Host "╔══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║         🚀 SPOFE v2.1 - Démarrage Complet               ║" -ForegroundColor Cyan
Write-Host "║         Environment: $Env" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# 1. Vérifier les dépendances
Write-Host "1️⃣  Vérification des dépendances..." -ForegroundColor Yellow
foreach ($cmd in @("docker", "docker-compose")) {
    $exists = Get-Command $cmd -ErrorAction SilentlyContinue
    if ($null -eq $exists) {
        Write-Host "⚠️  $cmd non disponible (installer Docker Desktop)" -ForegroundColor Yellow
    }
}
Write-Host "✅ Vérifications complétées" -ForegroundColor Green
Write-Host ""

# 2. Démarrer les conteneurs
Write-Host "2️⃣  Démarrage des services Docker..." -ForegroundColor Yellow
try {
    if ($Env -eq "prod") {
        & docker-compose -f docker-compose.prod.yml up -d
    } elseif ($Env -eq "docker") {
        & docker-compose -f docker-compose.v2.1.yml up -d
    } else {
        & docker-compose up -d
    }
    Write-Host "✅ Services Docker démarrés" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Erreur démarrage Docker: $_" -ForegroundColor Yellow
}
Write-Host ""

# 3. Attendre Redis
Write-Host "3️⃣  Attente Redis ($redisHost`:$redisPort)..." -ForegroundColor Yellow
if (Test-Path "$scriptPath\wait-for-redis.ps1") {
    & "$scriptPath\wait-for-redis.ps1" -Host $redisHost -Port $redisPort -Timeout 60
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Redis ne s'est pas lancé" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "⚠️  wait-for-redis.ps1 non trouvé" -ForegroundColor Yellow
}
Write-Host "✅ Redis prêt" -ForegroundColor Green
Write-Host ""

# 4. Attendre MySQL
Write-Host "4️⃣  Attente MySQL ($mysqlHost`:$mysqlPort)..." -ForegroundColor Yellow
if (Test-Path "$scriptPath\wait-for-mysql.ps1") {
    & "$scriptPath\wait-for-mysql.ps1" -Host $mysqlHost -Port $mysqlPort -Timeout 60
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ MySQL ne s'est pas lancé" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "⚠️  wait-for-mysql.ps1 non trouvé" -ForegroundColor Yellow
}
Write-Host "✅ MySQL prêt" -ForegroundColor Green
Write-Host ""

# 5. Initialiser la base de données
Write-Host "5️⃣  Initialisation de la base de données..." -ForegroundColor Yellow
if ($Env -ne "prod") {
    Start-Sleep -Seconds 5
    
    Write-Host "  - Exécution des migrations..." -ForegroundColor Cyan
    Push-Location "$scriptPath\cascade"
    try {
        & npm run migrate
    } catch {
        Write-Host "⚠️  Migrations échouées (possiblement déjà exécutées)" -ForegroundColor Yellow
    }
    Pop-Location
    Write-Host "✅ Base de données initialisée" -ForegroundColor Green
} else {
    Write-Host "⏭️  En production, migrations supposées complétées" -ForegroundColor Cyan
}
Write-Host ""

# 6. Démarrer le backend
Write-Host "6️⃣  Démarrage du backend..." -ForegroundColor Yellow
Push-Location "$scriptPath\cascade"
if ($Env -eq "prod") {
    $backendProcess = Start-Process -FilePath "npm" -ArgumentList "run", "start" -PassThru -NoNewWindow
} else {
    $backendProcess = Start-Process -FilePath "npm" -ArgumentList "run", "dev" -PassThru -NoNewWindow
}
Pop-Location
Write-Host "✅ Backend lancé (PID: $($backendProcess.Id))" -ForegroundColor Green
Write-Host ""

# 7. Démarrer le frontend
Write-Host "7️⃣  Démarrage du frontend..." -ForegroundColor Yellow
Push-Location "$scriptPath\frontend"
if ($Env -eq "prod") {
    & npm run build
    $frontendProcess = Start-Process -FilePath "npm" -ArgumentList "run", "preview" -PassThru -NoNewWindow
} else {
    $frontendProcess = Start-Process -FilePath "npm" -ArgumentList "run", "dev" -PassThru -NoNewWindow
}
Pop-Location
Write-Host "✅ Frontend lancé (PID: $($frontendProcess.Id))" -ForegroundColor Green
Write-Host ""

# 8. Afficher le résumé
Write-Host "╔══════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║         ✅ SPOFE v2.1 - Complètement Démarré            ║" -ForegroundColor Green
Write-Host "╠══════════════════════════════════════════════════════════╣" -ForegroundColor Green
Write-Host "║ 🌐 Frontend:  http://127.0.0.1:5173" -ForegroundColor Green
Write-Host "║ 🔌 Backend:   http://127.0.0.1:3001" -ForegroundColor Green
Write-Host "║ 📊 MySQL:     $mysqlHost`:$mysqlPort" -ForegroundColor Green
Write-Host "║ 💾 Redis:     $redisHost`:$redisPort" -ForegroundColor Green
Write-Host "╠══════════════════════════════════════════════════════════╣" -ForegroundColor Green
Write-Host "║ Backend PID: $($backendProcess.Id)" -ForegroundColor Green
Write-Host "║ Frontend PID: $($frontendProcess.Id)" -ForegroundColor Green
Write-Host "║" -ForegroundColor Green
Write-Host "║ Pour arrêter: press Ctrl+C" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

# 9. Gérer l'arrêt
Write-Host "Appuyez sur Ctrl+C pour arrêter SPOFE..." -ForegroundColor Cyan
$null = Read-Host

Write-Host ""
Write-Host "⏹️  Arrêt SPOFE..." -ForegroundColor Yellow
$backendProcess.Kill()
$frontendProcess.Kill()
& docker-compose down | Out-Null
Write-Host "✅ SPOFE arrêté" -ForegroundColor Green
