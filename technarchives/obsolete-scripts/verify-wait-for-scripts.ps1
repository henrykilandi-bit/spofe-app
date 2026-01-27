# verify-wait-for-scripts.ps1
# Script de vérification des fichiers wait-for (Windows)

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$filesOk = 0
$filesTotal = 10
$allFiles = @()

Write-Host "╔══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   Vérification des Scripts Wait-For v2.1                 ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Fonction pour vérifier les fichiers
function Check-File {
    param(
        [string]$File,
        [string]$Description
    )
    
    if (Test-Path "$scriptPath\$File") {
        $item = Get-Item "$scriptPath\$File"
        $size = "{0:N0} B" -f $item.Length
        if ($item.Length -gt 1024) {
            $size = "{0:N2} KB" -f ($item.Length / 1024)
        }
        Write-Host "✅ $File ..................... $size" -ForegroundColor Green
        return $true
    } else {
        Write-Host "❌ $File ..................... MANQUANT" -ForegroundColor Red
        return $false
    }
}

Write-Host "📦 Vérification des fichiers scripts:" -ForegroundColor Yellow
Write-Host ""

if (Check-File "wait-for-redis.sh" "Script bash Redis") { $filesOk++ }
if (Check-File "wait-for-mysql.sh" "Script bash MySQL") { $filesOk++ }
if (Check-File "wait-for-redis.ps1" "Script PowerShell Redis") { $filesOk++ }
if (Check-File "wait-for-mysql.ps1" "Script PowerShell MySQL") { $filesOk++ }
if (Check-File "startup.sh" "Script démarrage bash") { $filesOk++ }
if (Check-File "startup.ps1" "Script démarrage PowerShell") { $filesOk++ }

Write-Host ""
Write-Host "📚 Vérification de la documentation:" -ForegroundColor Yellow
Write-Host ""

if (Check-File "WAIT_FOR_SCRIPTS_README.md" "Guide détaillé") { $filesOk++ }
if (Check-File "WAIT_FOR_SCRIPTS_SUMMARY.md" "Résumé livraison") { $filesOk++ }
if (Check-File "DOCKER_COMPOSE_WAIT_FOR_INTEGRATION.md" "Integration Docker") { $filesOk++ }
if (Check-File "SPOFE_WAITFOR_COMPLETE.md" "Vue d'ensemble complète") { $filesOk++ }

Write-Host ""

# Résumé
Write-Host "╔══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
if ($filesOk -eq $filesTotal) {
    Write-Host "║   ✅ TOUS LES FICHIERS SONT PRÉSENTS ($filesOk/$filesTotal)     ║" -ForegroundColor Green
    Write-Host "║                                                              ║" -ForegroundColor Green
    Write-Host "║   Status: ✅ LIVRAISON COMPLÈTE                             ║" -ForegroundColor Green
} else {
    Write-Host "║   ⚠️  $filesOk/$filesTotal fichiers trouvés" -ForegroundColor Yellow
    Write-Host "║   Il manque $($filesTotal - $filesOk) fichier(s)" -ForegroundColor Yellow
}
Write-Host "╚══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Vérifier les permissions PowerShell
Write-Host "🔐 Vérification des permissions PowerShell:" -ForegroundColor Yellow
foreach ($file in @("wait-for-redis.ps1", "wait-for-mysql.ps1", "startup.ps1")) {
    if (Test-Path "$scriptPath\$file") {
        try {
            $content = Get-Content "$scriptPath\$file" -ErrorAction Stop
            Write-Host "  ✅ $file`: lisible" -ForegroundColor Green
        } catch {
            Write-Host "  ❌ $file`: erreur de lecture" -ForegroundColor Red
        }
    }
}
Write-Host ""

# Vérifier les variables d'environnement
Write-Host "🌍 Vérification des variables d'environnement:" -ForegroundColor Yellow
Write-Host "  REDIS_HOST: $($env:REDIS_HOST -or '127.0.0.1')" -ForegroundColor Cyan
Write-Host "  REDIS_PORT: $($env:REDIS_PORT -or '6379')" -ForegroundColor Cyan
Write-Host "  MYSQL_HOST: $($env:MYSQL_HOST -or '127.0.0.1')" -ForegroundColor Cyan
Write-Host "  MYSQL_PORT: $($env:MYSQL_PORT -or '3306')" -ForegroundColor Cyan
Write-Host ""

# Test rapide
Write-Host "🧪 Test rapide (optionnel):" -ForegroundColor Yellow
Write-Host "  Pour tester Redis:" -ForegroundColor Cyan
Write-Host "    .\wait-for-redis.ps1" -ForegroundColor Gray
Write-Host "  Pour tester MySQL:" -ForegroundColor Cyan
Write-Host "    .\wait-for-mysql.ps1" -ForegroundColor Gray
Write-Host "  Pour démarrage complet:" -ForegroundColor Cyan
Write-Host "    .\startup.ps1 -Env dev" -ForegroundColor Gray
Write-Host ""

Write-Host "╔══════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║   ✅ Vérification Terminée                               ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════════════════════╝" -ForegroundColor Green

# Exit code
if ($filesOk -eq $filesTotal) {
    exit 0
} else {
    exit 1
}
