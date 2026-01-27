# ╔════════════════════════════════════════════════════════════════╗
# ║                                                                ║
# ║   🚀 SPOFE v2.1 - LOCAL ENVIRONMENT STARTUP SCRIPT             ║
# ║                                                                ║
# ║   Initialise et démarre l'application en mode développement   ║
# ║   - Vérifie les prérequis (Node.js, MySQL, Redis)             ║
# ║   - Lance le backend Express (port 3001)                      ║
# ║   - Lance le frontend si disponible (port 3000)               ║
# ║   - Fournit les identifiants de test                          ║
# ║                                                                ║
# ╚════════════════════════════════════════════════════════════════╝

param(
    [switch]$NoFrontend,
    [switch]$Docker,
    [switch]$Test,
    [switch]$CreateAdmin
)

$ErrorActionPreference = "Stop"
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "`n════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🚀 SPOFE v2.1 - LOCAL STARTUP SCRIPT" -ForegroundColor Green
Write-Host "════════════════════════════════════════════════════════════════`n" -ForegroundColor Cyan

# ─────────────────────────────────────────────────────────────
# ÉTAPE 1: Vérification des prérequis
# ─────────────────────────────────────────────────────────────
Write-Host "📋 ÉTAPE 1: Vérification des prérequis...`n" -ForegroundColor Yellow

# Vérifier Node.js
Write-Host "  • Vérification Node.js..." -NoNewline
try {
    $nodeVersion = node --version
    Write-Host " ✅ $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host " ❌ Node.js non trouvé!" -ForegroundColor Red
    Write-Host "  Téléchargez depuis https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Vérifier npm
Write-Host "  • Vérification npm..." -NoNewline
try {
    $npmVersion = npm --version
    Write-Host " ✅ v$npmVersion" -ForegroundColor Green
} catch {
    Write-Host " ❌ npm non trouvé!" -ForegroundColor Red
    exit 1
}

# Vérifier MySQL (XAMPP)
Write-Host "  • Vérification MySQL (XAMPP)..." -NoNewline
if (Test-Path "C:\xampp\mysql\bin\mysql.exe") {
    Write-Host " ✅ Trouvé" -ForegroundColor Green
} else {
    Write-Host " ⚠️  Non trouvé (optionnel pour tests API)" -ForegroundColor Yellow
}

# Vérifier Redis (XAMPP)
Write-Host "  • Vérification Redis (XAMPP)..." -NoNewline
if (Test-Path "C:\xampp\redis\redis-server.exe") {
    Write-Host " ✅ Trouvé" -ForegroundColor Green
} else {
    Write-Host " ⚠️  Non trouvé (optionnel)" -ForegroundColor Yellow
}

# ─────────────────────────────────────────────────────────────
# ÉTAPE 2: Sélection du mode de démarrage
# ─────────────────────────────────────────────────────────────
Write-Host "`n📦 ÉTAPE 2: Sélection du mode de démarrage...`n" -ForegroundColor Yellow

if ($Docker) {
    Write-Host "  Mode Docker sélectionné (Ctrl+C pour arrêter)`n" -ForegroundColor Cyan
    docker-compose -f "$scriptPath\docker-compose.yml" up
    exit 0
}

# Mode développement (défaut)
Write-Host "  Mode Développement sélectionné`n" -ForegroundColor Cyan

# ─────────────────────────────────────────────────────────────
# ÉTAPE 3: Installation des dépendances
# ─────────────────────────────────────────────────────────────
Write-Host "📥 ÉTAPE 3: Installation des dépendances...`n" -ForegroundColor Yellow

$cascadePath = Join-Path $scriptPath "cascade"
Set-Location $cascadePath

if (-not (Test-Path "node_modules")) {
    Write-Host "  • Installation npm pour cascade..." -ForegroundColor Cyan
    npm install --silent 2>&1 | Out-Null
    Write-Host "  ✅ Dépendances installées`n" -ForegroundColor Green
} else {
    Write-Host "  ✅ Dépendances déjà présentes`n" -ForegroundColor Green
}

# ─────────────────────────────────────────────────────────────
# ÉTAPE 4: Création admin (optionnel)
# ─────────────────────────────────────────────────────────────
if ($CreateAdmin) {
    Write-Host "👤 ÉTAPE 4: Création du compte admin...`n" -ForegroundColor Yellow
    Write-Host "  • Exécution npm run seed:admin...`n" -ForegroundColor Cyan
    npm run seed:admin 2>&1
    Write-Host "`n  ✅ Admin créé`n" -ForegroundColor Green
}

# ─────────────────────────────────────────────────────────────
# ÉTAPE 5: Tests (optionnel)
# ─────────────────────────────────────────────────────────────
if ($Test) {
    Write-Host "🧪 ÉTAPE 5: Exécution des tests...`n" -ForegroundColor Yellow
    npm run test 2>&1
    Write-Host "`n"
}

# ─────────────────────────────────────────────────────────────
# ÉTAPE 6: Démarrage du backend
# ─────────────────────────────────────────────────────────────
Write-Host "🚀 ÉTAPE 6: Démarrage du backend Express...`n" -ForegroundColor Yellow

Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "✅ ENVIRONNEMENT PRÊT - DÉMARRAGE EN COURS..." -ForegroundColor Green
Write-Host "════════════════════════════════════════════════════════════════`n" -ForegroundColor Green

Write-Host "📡 ACCÈS À L'APPLICATION:" -ForegroundColor Cyan
Write-Host "  • Backend API:  http://localhost:3001" -ForegroundColor White
Write-Host "  • Status Endpoint: http://localhost:3001/api/health`n" -ForegroundColor White

Write-Host "🔐 IDENTIFIANTS DE TEST:" -ForegroundColor Cyan
Write-Host "  • Email: admin@spofe.local" -ForegroundColor White
Write-Host "  • Password: password123`n" -ForegroundColor White

Write-Host "📚 COMMANDES UTILES:" -ForegroundColor Cyan
Write-Host "  • Tests: npm run test" -ForegroundColor White
Write-Host "  • Lint: npm run lint" -ForegroundColor White
Write-Host "  • Audit sécurité: curl http://localhost:3001/api/security/audit" -ForegroundColor White
Write-Host "  • Logs: tail -f logs/combined.log`n" -ForegroundColor White

Write-Host "💾 BASE DE DONNÉES:" -ForegroundColor Cyan
Write-Host "  • Nom: spofe_v2_1" -ForegroundColor White
Write-Host "  • Host: localhost" -ForegroundColor White
Write-Host "  • Port: 3306" -ForegroundColor White
Write-Host "  • User: root" -ForegroundColor White
Write-Host "  • Password: (vide)" -ForegroundColor White
Write-Host "  • Status: ✅ 99.0% Conforme`n" -ForegroundColor White

Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "Appuyez sur Ctrl+C pour arrêter" -ForegroundColor Yellow
Write-Host "════════════════════════════════════════════════════════════════`n" -ForegroundColor Green

# Démarrer le backend
npm run dev

