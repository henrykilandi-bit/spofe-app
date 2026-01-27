# ╔════════════════════════════════════════════════════════════════╗
# ║                                                                ║
# ║   🔍 SPOFE v2.1 - DIAGNOSTIC DE CONNEXION                    ║
# ║                                                                ║
# ║   Vérifie pourquoi localhost:3001 ne répond pas              ║
# ║                                                                ║
# ╚════════════════════════════════════════════════════════════════╝

$ErrorActionPreference = "Continue"
$cascadePath = "c:\Users\henry\Desktop\SPOFE-APP VERS 1.0\cascade"

Write-Host "`n════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🔍 DIAGNOSTIC - LOCALHOST:3001 NE RÉPOND PAS" -ForegroundColor Yellow
Write-Host "════════════════════════════════════════════════════════════════`n" -ForegroundColor Cyan

# ─────────────────────────────────────────────────────────────
# 1. Vérifier le fichier .env
# ─────────────────────────────────────────────────────────────
Write-Host "1️⃣  VÉRIFICATION DU FICHIER .ENV`n" -ForegroundColor Yellow

$envPath = Join-Path $cascadePath ".env"
if (Test-Path $envPath) {
    Write-Host "   ✅ .env trouvé" -ForegroundColor Green
    Write-Host "   Contenu:`n" -ForegroundColor White
    Get-Content $envPath | ForEach-Object {
        if ($_ -match "PASSWORD|SECRET|TOKEN") {
            Write-Host "   • $($_.Split('=')[0])=***" -ForegroundColor Gray
        } else {
            Write-Host "   • $_" -ForegroundColor Gray
        }
    }
    Write-Host ""
} else {
    Write-Host "   ❌ .env NON TROUVÉ!" -ForegroundColor Red
    Write-Host "   Solution: Créer .env avec:" -ForegroundColor Yellow
    Write-Host "      cp .env.example .env`n" -ForegroundColor Cyan
}

# ─────────────────────────────────────────────────────────────
# 2. Vérifier node_modules
# ─────────────────────────────────────────────────────────────
Write-Host "2️⃣  VÉRIFICATION DES DÉPENDANCES`n" -ForegroundColor Yellow

$nodeModulesPath = Join-Path $cascadePath "node_modules"
if (Test-Path $nodeModulesPath) {
    $moduleCount = (Get-ChildItem $nodeModulesPath | Measure-Object).Count
    Write-Host "   ✅ node_modules présent ($moduleCount modules)`n" -ForegroundColor Green
} else {
    Write-Host "   ❌ node_modules MANQUANT!" -ForegroundColor Red
    Write-Host "   Solution: Exécuter:" -ForegroundColor Yellow
    Write-Host "      cd $cascadePath`n      npm install`n" -ForegroundColor Cyan
}

# ─────────────────────────────────────────────────────────────
# 3. Vérifier MySQL (XAMPP)
# ─────────────────────────────────────────────────────────────
Write-Host "3️⃣  VÉRIFICATION DE MYSQL (XAMPP)`n" -ForegroundColor Yellow

$mysqlPath = "C:\xampp\mysql\bin\mysql.exe"
if (Test-Path $mysqlPath) {
    Write-Host "   ✅ MySQL trouvé" -ForegroundColor Green
    
    # Vérifier la connexion
    Write-Host "   • Test de connexion..." -NoNewline
    try {
        $result = & $mysqlPath -h localhost -u root -e "SELECT 1;" 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host " ✅ Connecté" -ForegroundColor Green
            
            # Vérifier la base spofe_v2_1
            Write-Host "   • Vérification base spofe_v2_1..." -NoNewline
            $dbCheck = & $mysqlPath -h localhost -u root -e "SHOW DATABASES LIKE 'spofe_v2_1';" 2>&1
            if ($dbCheck -match "spofe_v2_1") {
                Write-Host " ✅ Présente" -ForegroundColor Green
            } else {
                Write-Host " ❌ Absente" -ForegroundColor Red
                Write-Host "   Action: Importer la base de données`n" -ForegroundColor Yellow
            }
        } else {
            Write-Host " ⚠️  Non disponible" -ForegroundColor Yellow
            Write-Host "   Action: Lancer XAMPP Control Panel`n" -ForegroundColor Yellow
        }
    } catch {
        Write-Host " ⚠️  Erreur de connexion" -ForegroundColor Yellow
        Write-Host "   Action: Vérifier que MySQL est lancé`n" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ❌ MySQL non trouvé (XAMPP non installé?)" -ForegroundColor Red
    Write-Host "   Action: Installer XAMPP depuis https://www.apachefriends.org`n" -ForegroundColor Yellow
}

# ─────────────────────────────────────────────────────────────
# 4. Vérifier port 3001
# ─────────────────────────────────────────────────────────────
Write-Host "4️⃣  VÉRIFICATION DU PORT 3001`n" -ForegroundColor Yellow

$port3001 = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue
if ($port3001) {
    Write-Host "   ✅ Port 3001 EN ÉCOUTE (serveur actif)" -ForegroundColor Green
    Write-Host "   • Processus: $($port3001.OwningProcess)" -ForegroundColor White
    Write-Host "   • État: $($port3001.State)`n" -ForegroundColor White
} else {
    Write-Host "   ❌ Port 3001 INACTIF (serveur ne s'est pas lancé)" -ForegroundColor Red
    Write-Host "   Solution: Voir point 5 ci-dessous`n" -ForegroundColor Yellow
}

# ─────────────────────────────────────────────────────────────
# 5. Vérifier les logs
# ─────────────────────────────────────────────────────────────
Write-Host "5️⃣  VÉRIFICATION DES LOGS`n" -ForegroundColor Yellow

$logsPath = Join-Path $cascadePath "logs"
if (Test-Path $logsPath) {
    $errorLog = Join-Path $logsPath "error.log"
    if (Test-Path $errorLog) {
        Write-Host "   📄 Dernières erreurs (10 dernières lignes):`n" -ForegroundColor White
        Get-Content $errorLog -Tail 10 | ForEach-Object {
            Write-Host "   $($_)" -ForegroundColor Red
        }
        Write-Host ""
    } else {
        Write-Host "   ℹ️  Pas de fichier error.log`n" -ForegroundColor Gray
    }
} else {
    Write-Host "   ℹ️  Dossier logs non créé (normal au premier démarrage)`n" -ForegroundColor Gray
}

# ─────────────────────────────────────────────────────────────
# 6. SOLUTIONS RAPIDES
# ─────────────────────────────────────────────────────────────
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "💡 SOLUTIONS RAPIDES (Essayer dans cet ordre):`n" -ForegroundColor Yellow

Write-Host "SOLUTION 1 - Installation complète (recommandée):" -ForegroundColor Cyan
Write-Host "  cd '$cascadePath'" -ForegroundColor White
Write-Host "  npm install" -ForegroundColor White
Write-Host "  npm run dev`n" -ForegroundColor White

Write-Host "SOLUTION 2 - Vérifier et réinstaller:" -ForegroundColor Cyan
Write-Host "  rm -r node_modules package-lock.json" -ForegroundColor White
Write-Host "  npm install" -ForegroundColor White
Write-Host "  npm run dev`n" -ForegroundColor White

Write-Host "SOLUTION 3 - Utiliser le script de démarrage:" -ForegroundColor Cyan
Write-Host "  .\START_LOCAL_ENV.ps1 -CreateAdmin`n" -ForegroundColor White

Write-Host "SOLUTION 4 - Docker (plus simple):" -ForegroundColor Cyan
Write-Host "  .\START_LOCAL_ENV.ps1 -Docker`n" -ForegroundColor White

# ─────────────────────────────────────────────────────────────
# 7. CHECKLIST FINALE
# ─────────────────────────────────────────────────────────────
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "📋 CHECKLIST PRÉ-DÉMARRAGE`n" -ForegroundColor Yellow

$checklist = @(
    @{ name = ".env configuré"; file = ".env" },
    @{ name = "node_modules installés"; file = "node_modules" },
    @{ name = "MySQL (XAMPP) actif"; file = "MySQL" },
    @{ name = "Base spofe_v2_1 importée"; file = "Database" },
    @{ name = "Port 3001 libre"; file = "Port" }
)

foreach ($item in $checklist) {
    Write-Host "  ☐ $($item.name)" -ForegroundColor Gray
}

Write-Host "`n════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "📞 BESOIN D'AIDE?" -ForegroundColor Yellow
Write-Host "════════════════════════════════════════════════════════════════`n" -ForegroundColor Cyan

Write-Host "Consulte ces fichiers:" -ForegroundColor White
Write-Host "  • cascade/00_START_HERE.md" -ForegroundColor Cyan
Write-Host "  • cascade/BACKEND_SETUP_COMPLETE.md" -ForegroundColor Cyan
Write-Host "  • IMPLEMENTATION_4_ETAPES_COMPLETE.md" -ForegroundColor Cyan
Write-Host "`n"
