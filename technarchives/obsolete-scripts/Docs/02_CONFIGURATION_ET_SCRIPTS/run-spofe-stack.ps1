# ==============================================
# 🧩 SPOFE FULL STACK LAUNCHER v5.0
# Auto-redémarrage intelligent backend + frontend
# ==============================================

param(
    [ValidateSet("start", "stop", "restart", "status", "logs")]
    [string]$Action = "start",
    [string]$FrontendPort = "5173",
    [string]$BackendPort = "3001",
    [switch]$Debug
)

# --- CONFIGURATION DES CHEMINS ---
$basePath     = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendPath  = "$basePath\cascade"
$frontendPath = "$basePath\frontend"
$configPath   = "$basePath\spofe-config.json"
$logsDir      = "$frontendPath\logs"
$frontendLog  = "$logsDir\frontend-$(Get-Date -Format 'yyyyMMdd-HHmmss').log"

# --- CHARGEMENT DE LA CONFIGURATION ---
if (Test-Path $configPath) {
    try {
        $config = Get-Content $configPath -Raw | ConvertFrom-Json
        $FrontendPort = $config.frontendPort ?? $FrontendPort
        $BackendPort = $config.backendPort ?? $BackendPort
        $autoRestartInterval = $config.autoRestartInterval ?? 10
        $healthCheckTimeout = $config.healthCheckTimeout ?? 5
        $maxRestartAttempts = $config.maxRestartAttempts ?? 3
        
        if ($Debug) {
            Write-Host "[DEBUG] Configuration chargée depuis $configPath" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "⚠️  Erreur lors du chargement de la configuration, utilisation des valeurs par défaut" -ForegroundColor Yellow
        $autoRestartInterval = 10
        $healthCheckTimeout = 5
        $maxRestartAttempts = 3
    }
} else {
    $autoRestartInterval = 10
    $healthCheckTimeout = 5
    $maxRestartAttempts = 3
}

# --- VALIDATION DES PRÉREQUIS ---
function Test-Prerequisites {
    Write-Host "`n🔍 Vérification des prérequis..." -ForegroundColor Cyan
    $errors = @()
    
    if (!(Get-Command pm2 -ErrorAction SilentlyContinue)) {
        $errors += "❌ PM2 n'est pas installé. Installez-le avec: npm install -g pm2"
    } else {
        Write-Host "✅ PM2 détecté" -ForegroundColor Green
    }
    
    if (!(Get-Command npm -ErrorAction SilentlyContinue)) {
        $errors += "❌ NPM n'est pas installé. Installez Node.js depuis https://nodejs.org"
    } else {
        Write-Host "✅ NPM détecté" -ForegroundColor Green
    }
    
    if (!(Test-Path $backendPath)) {
        $errors += "❌ Dossier backend introuvable: $backendPath"
    } else {
        Write-Host "✅ Dossier backend trouvé" -ForegroundColor Green
    }
    
    if (!(Test-Path $frontendPath)) {
        $errors += "❌ Dossier frontend introuvable: $frontendPath"
    } else {
        Write-Host "✅ Dossier frontend trouvé" -ForegroundColor Green
    }
    
    if (!(Test-Path "$backendPath\src\server.js")) {
        $errors += "⚠️  Fichier src/server.js introuvable dans le backend"
    }
    
    if ($errors.Count -gt 0) {
        Write-Host "`n🚨 Erreurs de configuration détectées :`n" -ForegroundColor Red
        $errors | ForEach-Object { Write-Host $_ -ForegroundColor Red }
        Write-Host ""
        exit 1
    }
    
    Write-Host "✅ Tous les prérequis sont satisfaits`n" -ForegroundColor Green
}

# --- FONCTIONS UTILITAIRES ---
function Write-DebugInfo {
    param([string]$Message)
    if ($Debug) {
        Write-Host "[DEBUG] $Message" -ForegroundColor Yellow
    }
}

function Test-ApiHealth {
    param([string]$url)
    
    Write-DebugInfo "Test de santé API: $url"
    
    try {
        $response = Invoke-RestMethod -Uri $url -TimeoutSec $healthCheckTimeout -ErrorAction Stop
        Write-DebugInfo "Réponse API: $($response | ConvertTo-Json -Compress)"
        return $response.success -eq $true -or $response.status -eq "ok"
    } catch {
        Write-DebugInfo "Échec du test de santé: $($_.Exception.Message)"
        return $false
    }
}

function Test-PortInUse {
    param([int]$Port)
    
    $connection = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    return $null -ne $connection
}

# --- GESTION DU BACKEND ---
function Start-Backend {
    Write-Host "`n⚙️  Démarrage du backend SPOFE via PM2..." -ForegroundColor Cyan
    
    Write-DebugInfo "Chemin backend: $backendPath"
    Write-DebugInfo "Port backend: $BackendPort"
    
    Set-Location $backendPath
    
    # Vérifier si PM2 est déjà en cours d'exécution
    $pm2Status = pm2 list 2>&1 | Select-String "spofe-server"
    if ($pm2Status) {
        Write-Host "⚠️  Instance PM2 existante détectée, redémarrage..." -ForegroundColor Yellow
        pm2 restart spofe-server --update-env 2>&1 | Out-Null
    } else {
        pm2 start src/server.js --name spofe-server 2>&1 | Out-Null
    }
    
    # Attendre le démarrage
    $attempts = 0
    $maxAttempts = 10
    $started = $false
    
    while ($attempts -lt $maxAttempts -and -not $started) {
        Start-Sleep -Seconds 1
        $attempts++
        Write-Host "." -NoNewline
        
        if (Test-PortInUse -Port $BackendPort) {
            $started = $true
        }
    }
    
    Write-Host ""
    
    if ($started) {
        Write-Host "✅ Backend opérationnel sur http://127.0.0.1:$BackendPort" -ForegroundColor Green
        return $true
    } else {
        Write-Host "❌ Échec du démarrage du backend après $maxAttempts tentatives" -ForegroundColor Red
        Write-Host "💡 Vérifiez les logs avec: pm2 logs spofe-server" -ForegroundColor Yellow
        return $false
    }
}

function Stop-Backend {
    Write-Host "🛑 Arrêt du backend PM2..." -ForegroundColor Cyan
    
    pm2 stop spofe-server 2>&1 | Out-Null
    pm2 delete spofe-server 2>&1 | Out-Null
    
    Write-Host "✅ Backend arrêté" -ForegroundColor Green
}

# --- GESTION DU FRONTEND ---
function Start-Frontend {
    Write-Host "`n🧩 Démarrage du frontend SPOFE (Vite)..." -ForegroundColor Cyan
    
    Write-DebugInfo "Chemin frontend: $frontendPath"
    Write-DebugInfo "Port frontend: $FrontendPort"
    Write-DebugInfo "Fichier de log: $frontendLog"
    
    # Créer le dossier de logs si nécessaire
    if (!(Test-Path $logsDir)) {
        New-Item -ItemType Directory -Path $logsDir -Force | Out-Null
        Write-DebugInfo "Dossier de logs créé: $logsDir"
    }
    
    # Vérifier si le port est déjà utilisé
    if (Test-PortInUse -Port $FrontendPort) {
        Write-Host "⚠️  Le port $FrontendPort est déjà utilisé, arrêt du processus..." -ForegroundColor Yellow
        Stop-Frontend
        Start-Sleep -Seconds 2
    }
    
    Set-Location $frontendPath
    
    # Démarrer Vite avec npm run dev en background
    $frontendJob = Start-Job -ScriptBlock {
        Set-Location "$using:frontendPath"
        npm run dev 2>&1 | Tee-Object -FilePath "$using:frontendLog"
    }
    
    Write-DebugInfo "Frontend job ID: $($frontendJob.Id)"
    
    # Attendre que le port se libère
    Write-Host "⏳ Attente du démarrage de Vite..." -ForegroundColor Gray
    $retries = 0
    while (-not (Test-PortInUse -Port $FrontendPort) -and $retries -lt 30) {
        Start-Sleep -Seconds 1
        $retries++
    }
    
    if (Test-PortInUse -Port $FrontendPort) {
        Write-Host "✅ Frontend lancé → http://127.0.0.1:$FrontendPort" -ForegroundColor Green
        return $true
    } else {
        Write-Host "❌ Frontend n'a pas pu démarrer" -ForegroundColor Red
        return $false
    }
}

function Stop-Frontend {
    Write-Host "🛑 Arrêt du frontend..." -ForegroundColor Cyan
    
    # Trouver et arrêter les processus Vite
    $viteProcesses = Get-Process node -ErrorAction SilentlyContinue | Where-Object {
        $cmdLine = (Get-CimInstance Win32_Process -Filter "ProcessId = $($_.Id)" -ErrorAction SilentlyContinue).CommandLine
        $cmdLine -like "*vite*" -or $cmdLine -like "*$FrontendPort*"
    }
    
    if ($viteProcesses) {
        $viteProcesses | ForEach-Object {
            Write-DebugInfo "Arrêt du processus Vite (PID: $($_.Id))"
            Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
        }
        Write-Host "✅ Frontend arrêté" -ForegroundColor Green
    } else {
        Write-Host "ℹ️  Aucun processus frontend actif" -ForegroundColor Gray
    }
}

# --- GESTION DU STACK COMPLET ---
function Stop-Stack {
    Write-Host "`n🛑 Arrêt complet du stack SPOFE..." -ForegroundColor Cyan
    
    Stop-Backend
    Stop-Frontend
    
    Write-Host "`n✅ Stack arrêté proprement`n" -ForegroundColor Green
}

function Start-Stack {
    Write-Host "`n🚀 Démarrage du stack SPOFE..." -ForegroundColor Cyan
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    
    # Arrêter les instances existantes
    Stop-Stack
    Start-Sleep -Seconds 2
    
    # Démarrer le backend
    $backendStarted = Start-Backend
    
    if (-not $backendStarted) {
        Write-Host "`n❌ Impossible de démarrer le stack sans backend" -ForegroundColor Red
        return $false
    }
    
    # Démarrer le frontend
    $frontendStarted = Start-Frontend
    
    if ($backendStarted -and $frontendStarted) {
        Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
        Write-Host "✅ Stack SPOFE démarré avec succès!" -ForegroundColor Green
        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
        Write-Host "🌍 Backend:  http://127.0.0.1:$BackendPort" -ForegroundColor Cyan
        Write-Host "💻 Frontend: http://127.0.0.1:$FrontendPort" -ForegroundColor Cyan
        Write-Host "📜 Logs:     $frontendLog" -ForegroundColor Gray
        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Green
        return $true
    } else {
        Write-Host "`n⚠️  Le stack a démarré partiellement" -ForegroundColor Yellow
        return $false
    }
}

function Show-Status {
    Write-Host "`n📊 État actuel du stack SPOFE" -ForegroundColor Cyan
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    
    # Statut Backend
    Write-Host "`n🧱 Backend (PM2):" -ForegroundColor Yellow
    
    try {
        $pm2Status = pm2 jlist 2>&1 | ConvertFrom-Json | Where-Object { $_.name -eq "spofe-server" }
        
        if ($pm2Status) {
            $status = $pm2Status.pm2_env.status
            $uptime = $pm2Status.pm2_env.pm_uptime
            $memory = [math]::Round($pm2Status.monit.memory / 1MB, 2)
            $cpu = $pm2Status.monit.cpu
            
            if ($status -eq "online") {
                Write-Host "  ✅ Statut: En ligne" -ForegroundColor Green
            } else {
                Write-Host "  ❌ Statut: $status" -ForegroundColor Red
            }
            
            Write-Host "  📊 Mémoire: $memory MB" -ForegroundColor Gray
            Write-Host "  ⚡ CPU: $cpu%" -ForegroundColor Gray
            Write-Host "  🕐 Démarré: $(Get-Date $uptime -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray
            
            $healthCheck = Test-ApiHealth "http://127.0.0.1:$BackendPort/health"
            if ($healthCheck) {
                Write-Host "  💚 Health check: OK" -ForegroundColor Green
            } else {
                Write-Host "  💔 Health check: ÉCHEC" -ForegroundColor Red
            }
        } else {
            Write-Host "  ❌ Backend non démarré" -ForegroundColor Red
        }
    } catch {
        Write-Host "  ❌ Impossible de récupérer le statut PM2" -ForegroundColor Red
    }
    
    # Statut Frontend
    Write-Host "`n🌐 Frontend (Vite):" -ForegroundColor Yellow
    
    if (Test-PortInUse -Port $FrontendPort) {
        Write-Host "  ✅ Statut: En ligne" -ForegroundColor Green
        Write-Host "  🌍 URL: http://127.0.0.1:$FrontendPort" -ForegroundColor Cyan
        
        $viteProcess = Get-Process node -ErrorAction SilentlyContinue | Where-Object {
            $cmdLine = (Get-CimInstance Win32_Process -Filter "ProcessId = $($_.Id)" -ErrorAction SilentlyContinue).CommandLine
            $cmdLine -like "*vite*"
        } | Select-Object -First 1
        
        if ($viteProcess) {
            $memory = [math]::Round($viteProcess.WorkingSet64 / 1MB, 2)
            Write-Host "  📊 Mémoire: $memory MB" -ForegroundColor Gray
            Write-Host "  🆔 PID: $($viteProcess.Id)" -ForegroundColor Gray
        }
    } else {
        Write-Host "  ❌ Frontend non démarré" -ForegroundColor Red
    }
    
    Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Cyan
}

function Show-Logs {
    Write-Host "`n📜 Logs SPOFE" -ForegroundColor Cyan
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    
    Write-Host "`n🧱 Backend (dernières 20 lignes):" -ForegroundColor Yellow
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
    
    try {
        pm2 logs spofe-server --lines 20 --nostream 2>&1
    } catch {
        Write-Host "❌ Impossible de récupérer les logs backend" -ForegroundColor Red
        Write-Host "💡 Essayez: pm2 logs spofe-server" -ForegroundColor Yellow
    }
    
    Write-Host "`n🌐 Frontend (dernières 20 lignes):" -ForegroundColor Yellow
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
    
    if (Test-Path $frontendLog) {
        Get-Content $frontendLog -Tail 20
    } else {
        # Chercher le dernier fichier de log
        $latestLog = Get-ChildItem "$logsDir\frontend-*.log" -ErrorAction SilentlyContinue | 
                     Sort-Object LastWriteTime -Descending | 
                     Select-Object -First 1
        
        if ($latestLog) {
            Write-Host "📄 Fichier: $($latestLog.FullName)" -ForegroundColor Gray
            Get-Content $latestLog.FullName -Tail 20
        } else {
            Write-Host "⚠️  Aucun log frontend trouvé dans $logsDir" -ForegroundColor Yellow
        }
    }
    
    Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host "💡 Pour suivre les logs en temps réel:" -ForegroundColor Yellow
    Write-Host "   Backend:  pm2 logs spofe-server" -ForegroundColor Gray
    Write-Host "   Frontend: Get-Content '$frontendLog' -Wait`n" -ForegroundColor Gray
}

# --- SURVEILLANCE ET AUTO-RESTART ---
function Monitor-Stack {
    Write-Host "`n👁️  Surveillance active du stack SPOFE" -ForegroundColor Cyan
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host "⏱️  Intervalle: $autoRestartInterval secondes" -ForegroundColor Gray
    Write-Host "🔄 Tentatives max: $maxRestartAttempts" -ForegroundColor Gray
    Write-Host "⌨️  Appuyez sur Ctrl+C pour arrêter`n" -ForegroundColor Yellow
    
    $backendRestartCount = 0
    $frontendRestartCount = 0
    $lastBackendRestart = Get-Date
    $lastFrontendRestart = Get-Date
    $restartCooldown = 30 # secondes
    
    try {
        while ($true) {
            $timestamp = Get-Date -Format "HH:mm:ss"
            $backendOk = Test-PortInUse -Port $BackendPort
            $frontendOk = Test-PortInUse -Port $FrontendPort
            
            # Surveillance Backend
            if (-not $backendOk) {
                $timeSinceLastRestart = (Get-Date) - $lastBackendRestart
                
                if ($timeSinceLastRestart.TotalSeconds -gt $restartCooldown) {
                    $backendRestartCount++
                    
                    if ($backendRestartCount -le $maxRestartAttempts) {
                        Write-Host "[$timestamp] ⚠️  Backend inactif (tentative $backendRestartCount/$maxRestartAttempts)" -ForegroundColor Yellow
                        Start-Backend
                        $lastBackendRestart = Get-Date
                    } else {
                        Write-Host "[$timestamp] ❌ Backend a échoué $maxRestartAttempts fois, arrêt de la surveillance" -ForegroundColor Red
                        Write-Host "💡 Vérifiez les logs: pm2 logs spofe-server" -ForegroundColor Yellow
                        break
                    }
                }
            } else {
                if ($backendRestartCount -gt 0) {
                    Write-Host "[$timestamp] ✅ Backend rétabli après $backendRestartCount redémarrage(s)" -ForegroundColor Green
                    $backendRestartCount = 0
                } else {
                    Write-Host "[$timestamp] ✅ Backend OK" -ForegroundColor Green
                }
            }
            
            # Surveillance Frontend
            if (-not $frontendOk) {
                $timeSinceLastRestart = (Get-Date) - $lastFrontendRestart
                
                if ($timeSinceLastRestart.TotalSeconds -gt $restartCooldown) {
                    $frontendRestartCount++
                    
                    if ($frontendRestartCount -le $maxRestartAttempts) {
                        Write-Host "[$timestamp] ⚠️  Frontend inactif (tentative $frontendRestartCount/$maxRestartAttempts)" -ForegroundColor Yellow
                        Start-Frontend
                        $lastFrontendRestart = Get-Date
                    } else {
                        Write-Host "[$timestamp] ❌ Frontend a échoué $maxRestartAttempts fois, arrêt de la surveillance" -ForegroundColor Red
                        Write-Host "💡 Vérifiez les logs: Get-Content '$frontendLog'" -ForegroundColor Yellow
                        break
                    }
                }
            } else {
                if ($frontendRestartCount -gt 0) {
                    Write-Host "[$timestamp] ✅ Frontend rétabli après $frontendRestartCount redémarrage(s)" -ForegroundColor Green
                    $frontendRestartCount = 0
                } else {
                    Write-Host "[$timestamp] ✅ Frontend OK" -ForegroundColor Green
                }
            }
            
            Start-Sleep -Seconds $autoRestartInterval
        }
    } catch {
        Write-Host "`n🛑 Surveillance interrompue" -ForegroundColor Yellow
        Write-Host "💡 Le stack continue de fonctionner en arrière-plan" -ForegroundColor Cyan
    }
}

# --- POINT D'ENTRÉE PRINCIPAL ---
Write-Host "`n╔════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  🧩 SPOFE FULL STACK LAUNCHER v5.0   ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Cyan

# Vérifier les prérequis
Test-Prerequisites

# Exécuter l'action demandée
switch ($Action) {
    "start" {
        $started = Start-Stack
        if ($started) {
            Monitor-Stack
        } else {
            Write-Host "❌ Échec du démarrage du stack" -ForegroundColor Red
            exit 1
        }
    }
    
    "stop" {
        Stop-Stack
    }
    
    "restart" {
        Write-Host "`n🔄 Redémarrage du stack SPOFE..." -ForegroundColor Cyan
        Stop-Stack
        Start-Sleep -Seconds 2
        Start-Stack
    }
    
    "status" {
        Show-Status
    }
    
    "logs" {
        Show-Logs
    }
    
    default {
        Write-Host "`n❌ Action invalide: $Action" -ForegroundColor Red
        Write-Host "`n📖 Usage:" -ForegroundColor Yellow
        Write-Host "  .\run-spofe-stack.ps1 -Action [start|stop|restart|status|logs]" -ForegroundColor Gray
        Write-Host "`n📝 Exemples:" -ForegroundColor Yellow
        Write-Host "  .\run-spofe-stack.ps1 -Action start" -ForegroundColor Gray
        Write-Host "  .\run-spofe-stack.ps1 -Action start -Debug" -ForegroundColor Gray
        Write-Host "  .\run-spofe-stack.ps1 -Action start -FrontendPort 3000 -BackendPort 8080" -ForegroundColor Gray
        Write-Host "  .\run-spofe-stack.ps1 -Action status" -ForegroundColor Gray
        Write-Host "  .\run-spofe-stack.ps1 -Action logs" -ForegroundColor Gray
        Write-Host "  .\run-spofe-stack.ps1 -Action stop`n" -ForegroundColor Gray
    }
}
