#Requires -Version 5.1

<#
.SYNOPSIS
    Script de gestion et surveillance du stack SPOFE v2.0 (Frontend + Backend)

.DESCRIPTION
    Gère le démarrage, l'arrêt, le redémarrage et la surveillance du stack SPOFE
    Inclut des tests automatiques des endpoints critiques au démarrage
    Architecture modulaire, robuste avec retry logic et logging avancé

.PARAMETER Action
    Action à effectuer : start, stop, restart, status, test, monitor

.PARAMETER Debug
    Active le mode debug avec affichage détaillé des réponses JSON

.PARAMETER SkipTests
    Ignore les tests d'endpoints au démarrage

.EXAMPLE
    .\run-spofe-stack-v2.ps1 -Action start
    .\run-spofe-stack-v2.ps1 -Action test -Debug
    .\run-spofe-stack-v2.ps1 -Action start -SkipTests
#>

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("start", "stop", "restart", "status", "test", "monitor")]
    [string]$Action,
    
    [switch]$DetailMode,
    [switch]$SkipTests
)

# ═══════════════════════════════════════════════════════════════
# 📦 CONFIGURATION GLOBALE
# ═══════════════════════════════════════════════════════════════

$Global:Config = @{
    # URLs de base
    BackendUrl = "http://127.0.0.1:3001"
    FrontendUrl = "http://127.0.0.1:5173"
    
    # Authentification
    AdminEmail = "admin@spofe.local"
    AdminPassword = "Admin123!"
    TestEmail = "test@spofe.com"
    TestPassword = "Test@123456"
    
    # Timeouts et retries
    HttpTimeout = 30
    MaxRetries = 3
    RetryDelay = 2
    StartupWaitTime = 5
    PortCheckTimeout = 60
    
    # Chemins (relatifs au répertoire courant)
    LogPath = ".\logs\api-tests.log"
    BackendPath = ".\cascade"
    FrontendPath = ".\frontend"
    
    # PM2
    BackendProcessName = "spofe-server"
    
    # Ports
    BackendPort = 3001
    FrontendPort = 5173
}

# ═══════════════════════════════════════════════════════════════
# 🎨 FONCTIONS UTILITAIRES D'AFFICHAGE
# ═══════════════════════════════════════════════════════════════

function Write-ColorOutput {
    param(
        [string]$Message,
        [ValidateSet("Success", "Error", "Warning", "Info", "Debug", "Highlight")]
        [string]$Type = "Info"
    )
    
    $colors = @{
        "Success" = "Green"
        "Error" = "Red"
        "Warning" = "Yellow"
        "Info" = "Cyan"
        "Debug" = "Magenta"
        "Highlight" = "White"
    }
    
    $icons = @{
        "Success" = "✅"
        "Error" = "❌"
        "Warning" = "⚠️"
        "Info" = "ℹ️"
        "Debug" = "🔍"
        "Highlight" = "🎯"
    }
    
    Write-Host "$($icons[$Type]) $Message" -ForegroundColor $colors[$Type]
}

function Write-LogFile {
    param(
        [string]$Message,
        [string]$Level = "INFO"
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss.fff"
    $logMessage = "[$timestamp] [$Level] $Message"
    
    $logDir = Split-Path $Global:Config.LogPath -Parent
    if (-not (Test-Path $logDir)) {
        New-Item -ItemType Directory -Path $logDir -Force | Out-Null
    }
    
    Add-Content -Path $Global:Config.LogPath -Value $logMessage
}

function Write-Separator {
    param(
        [string]$Char = "━",
        [int]$Length = 70
    )
    Write-Host ($Char * $Length) -ForegroundColor DarkGray
}

# ═══════════════════════════════════════════════════════════════
# 🔍 UTILITAIRES DE VÉRIFICATION
# ═══════════════════════════════════════════════════════════════

function Test-PortInUse {
    param([int]$Port)
    
    try {
        $connections = netstat -ano 2>$null | Select-String ":$Port\s"
        return $connections.Count -gt 0
    } catch {
        return $false
    }
}

function Get-ProcessByPort {
    param([int]$Port)
    
    try {
        $line = netstat -ano 2>$null | Select-String ":$Port\s" | Select-Object -First 1
        if ($line) {
            $pid = [regex]::Match($line.Line, '\d+$').Value
            return Get-Process -Id $pid -ErrorAction SilentlyContinue
        }
        return $null
    } catch {
        return $null
    }
}

function Wait-ForPort {
    param(
        [int]$Port,
        [string]$Name,
        [int]$MaxWait = 60
    )
    
    Write-ColorOutput "⏳ Attente du port $Port ($Name)..." "Info"
    Write-LogFile "Attente port $Port - $Name" "INFO"
    
    $elapsed = 0
    while ($elapsed -lt $MaxWait) {
        if (Test-PortInUse -Port $Port) {
            Write-ColorOutput "✅ Port $Port disponible ($Name)" "Success"
            Write-LogFile "Port $Port disponible" "SUCCESS"
            return $true
        }
        
        Start-Sleep -Seconds 1
        $elapsed++
        Write-Host "." -NoNewline -ForegroundColor DarkGray
    }
    
    Write-Host ""
    Write-ColorOutput "⏱️  Timeout : Port $Port n'est pas disponible après ${MaxWait}s" "Warning"
    Write-LogFile "Timeout port $Port" "WARNING"
    return $false
}

function Wait-ForService {
    param(
        [string]$Url,
        [string]$Name,
        [int]$MaxWait = 30
    )
    
    Write-ColorOutput "🔄 Vérification de $Name..." "Info"
    Write-LogFile "Vérification service $Name" "INFO"
    
    $elapsed = 0
    while ($elapsed -lt $MaxWait) {
        try {
            $response = Invoke-WebRequest -Uri $Url -TimeoutSec 2 -ErrorAction Stop
            Write-ColorOutput "✅ $Name opérationnel" "Success"
            Write-LogFile "$Name opérationnel" "SUCCESS"
            return $true
        } catch {
            Start-Sleep -Seconds 1
            $elapsed++
            Write-Host "." -NoNewline -ForegroundColor DarkGray
        }
    }
    
    Write-Host ""
    Write-ColorOutput "⏱️  Timeout : $Name n'a pas répondu après ${MaxWait}s" "Warning"
    Write-LogFile "$Name timeout après ${MaxWait}s" "WARNING"
    return $false
}

# ═══════════════════════════════════════════════════════════════
# 🔐 AUTHENTIFICATION
# ═══════════════════════════════════════════════════════════════

function Get-AuthToken {
    param(
        [string]$Email = $Global:Config.AdminEmail,
        [string]$Password = $Global:Config.AdminPassword,
        [int]$Retry = 0
    )
    
    try {
        $loginUrl = "$($Global:Config.BackendUrl)/api/auth/login"
        $body = @{
            email = $Email
            password = $Password
        } | ConvertTo-Json
        
        Write-ColorOutput "🔑 Authentification pour $Email..." "Info"
        Write-LogFile "Authentification : $Email" "INFO"
        
        $response = Invoke-RestMethod -Uri $loginUrl `
            -Method Post `
            -Body $body `
            -ContentType "application/json" `
            -TimeoutSec $Global:Config.HttpTimeout `
            -ErrorAction Stop
        
        if ($response.data.token) {
            Write-ColorOutput "🔐 Token obtenu" "Success"
            Write-LogFile "Token obtenu pour $Email" "SUCCESS"
            return $response.data.token
        } else {
            throw "Pas de token reçu"
        }
        
    } catch {
        if ($Retry -lt $Global:Config.MaxRetries) {
            Write-ColorOutput "🔄 Retry $($Retry + 1)/$($Global:Config.MaxRetries)..." "Warning"
            Start-Sleep -Seconds $Global:Config.RetryDelay
            return Get-AuthToken -Email $Email -Password $Password -Retry ($Retry + 1)
        }
        
        Write-ColorOutput "Authentification échouée : $($_.Exception.Message)" "Error"
        Write-LogFile "Authentification échouée : $($_.Exception.Message)" "ERROR"
        return $null
    }
}

# ═══════════════════════════════════════════════════════════════
# 🧪 TESTS D'ENDPOINTS
# ═══════════════════════════════════════════════════════════════

function Test-SingleEndpoint {
    param(
        [string]$Name,
        [string]$Url,
        [string]$Token,
        [string]$Method = "GET",
        [bool]$RequireAuth = $true,
        [int]$Retry = 0
    )
    
    $headers = if ($RequireAuth) {
        @{
            "Authorization" = "Bearer $Token"
            "Content-Type" = "application/json"
        }
    } else {
        @{ "Content-Type" = "application/json" }
    }
    
    try {
        $startTime = Get-Date
        
        $response = Invoke-WebRequest -Uri $Url `
            -Method $Method `
            -Headers $headers `
            -TimeoutSec $Global:Config.HttpTimeout `
            -ErrorAction Stop
        
        $duration = [math]::Round(((Get-Date) - $startTime).TotalMilliseconds, 2)
        $statusCode = $response.StatusCode
        
        Write-ColorOutput "  ✅ $Name : $statusCode (${duration}ms)" "Success"
        Write-LogFile "$Name : SUCCESS ($statusCode) - ${duration}ms" "SUCCESS"
        
        if ($DetailMode -and $response.Content) {
            try {
                $jsonContent = $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 3
                Write-ColorOutput "     Réponse : " "Debug"
                Write-Host ($jsonContent | Select-Object -First 10) -ForegroundColor DarkGray
            } catch { }
        }
        
        return @{ Success = $true; StatusCode = $statusCode; Duration = $duration }
        
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        $errorMessage = $_.Exception.Message
        
        if ($Retry -lt $Global:Config.MaxRetries) {
            Write-ColorOutput "  🔄 Retry $($Retry + 1)/$($Global:Config.MaxRetries) pour $Name..." "Warning"
            Start-Sleep -Seconds $Global:Config.RetryDelay
            return Test-SingleEndpoint -Name $Name -Url $Url -Token $Token -Method $Method -RequireAuth $RequireAuth -Retry ($Retry + 1)
        }
        
        Write-ColorOutput "  ❌ $Name : Erreur $statusCode" "Error"
        Write-LogFile "$Name : ERROR ($statusCode) - $errorMessage" "ERROR"
        
        if ($DetailMode) {
            Write-ColorOutput "     Détails : $errorMessage" "Debug"
        }
        
        return @{ Success = $false; StatusCode = $statusCode; Duration = 0 }
    }
}

function Test-ApiEndpoints {
    Write-Host ""
    Write-ColorOutput "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" "Info"
    Write-ColorOutput "🧪 TESTS DES ENDPOINTS API SPOFE" "Highlight"
    Write-ColorOutput "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" "Info"
    
    Write-LogFile "=== Début des tests d'endpoints ===" "INFO"
    
    $baseUrl = "$($Global:Config.BackendUrl)/api"
    
    # Authentification
    $token = Get-AuthToken
    if (-not $token) {
        Write-ColorOutput "Impossible de continuer sans token" "Error"
        Write-LogFile "Tests terminés : pas de token" "ERROR"
        return $false
    }
    
    Write-Host ""
    
    # Endpoints à tester
    $endpoints = @(
        @{ name = "Health Check"; url = "$baseUrl/health"; critical = $true; auth = $false },
        @{ name = "Dashboard Summary"; url = "$baseUrl/dashboard/summary"; critical = $true; auth = $true },
        @{ name = "Chart of Accounts"; url = "$baseUrl/chart-of-accounts?companyId=1"; critical = $true; auth = $true },
        @{ name = "Journal Entries"; url = "$baseUrl/journal-entries?companyId=1"; critical = $true; auth = $true },
        @{ name = "Business Operations"; url = "$baseUrl/business-operations"; critical = $false; auth = $true },
        @{ name = "Users"; url = "$baseUrl/users"; critical = $false; auth = $true },
        @{ name = "Suppliers"; url = "$baseUrl/suppliers"; critical = $false; auth = $true }
    )
    
    # Exécution
    $results = @()
    $criticalFails = 0
    
    foreach ($endpoint in $endpoints) {
        $result = Test-SingleEndpoint -Name $endpoint.name `
            -Url $endpoint.url `
            -Token $token `
            -RequireAuth $endpoint.auth
        
        $result.Critical = $endpoint.critical
        $results += $result
        
        if (-not $result.Success -and $endpoint.critical) {
            $criticalFails++
        }
        
        Start-Sleep -Milliseconds 300
    }
    
    # Résumé
    Write-Host ""
    Write-Separator
    Write-ColorOutput "📊 RÉSUMÉ DES TESTS" "Highlight"
    Write-Separator
    
    $total = $results.Count
    $success = ($results | Where-Object { $_.Success }).Count
    $failed = $total - $success
    $avgDuration = ($results | Where-Object { $_.Duration -gt 0 } | Measure-Object -Property Duration -Average).Average
    
    Write-Host "├─ Total              : $total" -ForegroundColor Cyan
    Write-Host "├─ Réussis            : $success" -ForegroundColor Green
    Write-Host "├─ Échoués            : $failed" -ForegroundColor $(if ($failed -gt 0) { "Red" } else { "Green" })
    Write-Host "├─ Critiques échoués  : $criticalFails" -ForegroundColor $(if ($criticalFails -gt 0) { "Red" } else { "Green" })
    Write-Host "└─ Temps moy réponse  : $([math]::Round($avgDuration, 2))ms" -ForegroundColor Cyan
    
    Write-Separator
    
    if ($criticalFails -gt 0) {
        Write-ColorOutput "⚠️  Des endpoints critiques ont échoué !" "Warning"
        Write-ColorOutput "💡 Vérifiez les logs : pm2 logs $($Global:Config.BackendProcessName) --lines 100" "Info"
        Write-LogFile "Tests terminés avec $criticalFails échecs critiques" "WARNING"
    } else {
        Write-ColorOutput "✅ Tous les endpoints critiques sont opérationnels !" "Success"
        Write-LogFile "Tous les tests réussis" "SUCCESS"
    }
    
    Write-Host ""
    Write-LogFile "=== Fin des tests d'endpoints ===" "INFO"
    
    return ($criticalFails -eq 0)
}

# ═══════════════════════════════════════════════════════════════
# 🚀 GESTION DU STACK
# ═══════════════════════════════════════════════════════════════

function Clear-Ports {
    Write-ColorOutput "🧹 Nettoyage des ports..." "Info"
    Write-LogFile "Nettoyage des ports" "INFO"
    
    # Vérifier port backend
    if (Test-PortInUse -Port $Global:Config.BackendPort) {
        Write-ColorOutput "  Port $($Global:Config.BackendPort) occupé, tentative de libération..." "Warning"
        
        $proc = Get-ProcessByPort -Port $Global:Config.BackendPort
        if ($proc) {
            try {
                Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
                Start-Sleep -Seconds 2
                Write-ColorOutput "  ✅ Port $($Global:Config.BackendPort) libéré" "Success"
            } catch {
                Write-ColorOutput "  ⚠️  Impossible de tuer le processus" "Warning"
            }
        }
    }
    
    # Vérifier port frontend
    if (Test-PortInUse -Port $Global:Config.FrontendPort) {
        Write-ColorOutput "  Port $($Global:Config.FrontendPort) occupé, tentative de libération..." "Warning"
        
        $proc = Get-ProcessByPort -Port $Global:Config.FrontendPort
        if ($proc) {
            try {
                Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
                Start-Sleep -Seconds 2
                Write-ColorOutput "  ✅ Port $($Global:Config.FrontendPort) libéré" "Success"
            } catch {
                Write-ColorOutput "  ⚠️  Impossible de tuer le processus" "Warning"
            }
        }
    }
}

function Start-Stack {
    Write-ColorOutput "═══════════════════════════════════════════════════════════════" "Info"
    Write-ColorOutput "🚀 DÉMARRAGE DU STACK SPOFE" "Highlight"
    Write-ColorOutput "═══════════════════════════════════════════════════════════════" "Info"
    
    Write-LogFile "=== Démarrage du stack ===" "INFO"
    
    # Étape 1 : Vérifier prérequis
    Write-Host ""
    Write-ColorOutput "▶️  Étape 1 : Vérification des prérequis" "Info"
    Write-Separator "─" 70
    
    try {
        pm2 --version | Out-Null
        Write-ColorOutput "  ✅ PM2 installé" "Success"
    } catch {
        Write-ColorOutput "  ⚠️  Installation de PM2..." "Warning"
        npm install -g pm2
    }
    
    # Étape 2 : Nettoyage des ports
    Write-Host ""
    Write-ColorOutput "▶️  Étape 2 : Préparation des ports" "Info"
    Write-Separator "─" 70
    Clear-Ports
    
    # Étape 3 : Démarrer backend
    Write-Host ""
    Write-ColorOutput "▶️  Étape 3 : Démarrage du backend" "Info"
    Write-Separator "─" 70
    
    try {
        Set-Location $Global:Config.BackendPath
        
        # Arrêter les instances existantes
        pm2 stop $Global:Config.BackendProcessName 2>$null
        pm2 delete $Global:Config.BackendProcessName 2>$null
        Start-Sleep -Seconds 1
        
        # Démarrer
        Write-ColorOutput "  Lancement du service Express..." "Info"
        pm2 start src/server.js --name $Global:Config.BackendProcessName | Out-Null
        
        Write-LogFile "Backend lancé via PM2" "INFO"
        
        # Attendre le port
        if (Wait-ForPort -Port $Global:Config.BackendPort -Name "Backend" -MaxWait $Global:Config.PortCheckTimeout) {
            Start-Sleep -Seconds 2
            
            # Vérifier health
            if (Wait-ForService -Url "$($Global:Config.BackendUrl)/api/health" -Name "Backend API" -MaxWait 10) {
                Write-ColorOutput "  ✅ Backend opérationnel sur $($Global:Config.BackendUrl)" "Success"
                Write-LogFile "Backend opérationnel" "SUCCESS"
            } else {
                Write-ColorOutput "  ❌ Backend non réactif" "Error"
                Write-LogFile "Backend non réactif après démarrage" "ERROR"
                return $false
            }
        } else {
            Write-ColorOutput "  ❌ Port backend indisponible" "Error"
            Write-LogFile "Port backend indisponible" "ERROR"
            return $false
        }
        
    } catch {
        Write-ColorOutput "  ❌ Erreur backend : $($_.Exception.Message)" "Error"
        Write-LogFile "Erreur backend : $($_.Exception.Message)" "ERROR"
        return $false
    }
    
    # Étape 4 : Démarrer frontend
    Write-Host ""
    Write-ColorOutput "▶️  Étape 4 : Démarrage du frontend" "Info"
    Write-Separator "─" 70
    
    try {
        Set-Location $Global:Config.FrontendPath
        
        Write-ColorOutput "  Lancement de Vite..." "Info"
        
        # Démarrer via Start-Job pour non-bloquant
        $frontendJob = Start-Job -ScriptBlock {
            Set-Location $using:Global:Config.FrontendPath
            npm run dev 2>&1 | Tee-Object -FilePath "$using:Global:Config.LogPath"
        }
        
        Write-LogFile "Frontend lancé via npm run dev (Job ID: $($frontendJob.Id))" "INFO"
        
        if (Wait-ForPort -Port $Global:Config.FrontendPort -Name "Frontend" -MaxWait $Global:Config.PortCheckTimeout) {
            Write-ColorOutput "  ✅ Frontend lancé sur $($Global:Config.FrontendUrl)" "Success"
            Write-LogFile "Frontend opérationnel" "SUCCESS"
        } else {
            Write-ColorOutput "  ❌ Port frontend indisponible" "Error"
            Write-LogFile "Port frontend indisponible" "ERROR"
            return $false
        }
        
    } catch {
        Write-ColorOutput "  ❌ Erreur frontend : $($_.Exception.Message)" "Error"
        Write-LogFile "Erreur frontend : $($_.Exception.Message)" "ERROR"
        return $false
    }
    
    Write-Host ""
    Write-Separator
    Write-ColorOutput "✅ STACK SPOFE DÉMARRÉ AVEC SUCCÈS" "Success"
    Write-Separator
    
    Write-LogFile "Stack démarré avec succès" "SUCCESS"
    return $true
}

function Stop-Stack {
    Write-ColorOutput "🛑 Arrêt du stack SPOFE..." "Warning"
    Write-LogFile "Arrêt du stack" "INFO"
    
    try {
        pm2 stop $Global:Config.BackendProcessName 2>$null
        pm2 delete $Global:Config.BackendProcessName 2>$null
        
        # Tuer les processus npm/Vite
        Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
        Get-Process npm -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
        
        Write-ColorOutput "✅ Stack arrêté" "Success"
        Write-LogFile "Stack arrêté" "SUCCESS"
        return $true
        
    } catch {
        Write-ColorOutput "❌ Erreur arrêt : $($_.Exception.Message)" "Error"
        Write-LogFile "Erreur arrêt : $($_.Exception.Message)" "ERROR"
        return $false
    }
}

function Show-Status {
    Write-ColorOutput "📊 Statut du stack SPOFE" "Highlight"
    Write-Separator
    
    Write-Host ""
    pm2 list
    Write-Host ""
}

function Monitor-Stack {
    Write-ColorOutput "👁️  Surveillance du stack (Ctrl+C pour quitter)..." "Info"
    Write-LogFile "Surveillance activée" "INFO"
    
    pm2 monit
}

# ═══════════════════════════════════════════════════════════════
# 🎯 POINT D'ENTRÉE PRINCIPAL
# ═══════════════════════════════════════════════════════════════

Write-Host ""
Write-Separator
Write-ColorOutput "   🏢 SPOFE STACK MANAGER v2.0" "Highlight"
Write-Separator
Write-Host ""

Write-LogFile "Action : $Action | DetailMode : $DetailMode | SkipTests : $SkipTests" "INFO"

switch ($Action) {
    "start" {
        $started = Start-Stack
        
        if ($started) {
            Write-Host ""
            
            if (-not $SkipTests) {
                $testsOk = Test-ApiEndpoints
                
                if (-not $testsOk) {
                    Write-ColorOutput "⚠️  Le stack est démarré mais certains tests ont échoué" "Warning"
                }
            } else {
                Write-ColorOutput "⏭️  Tests d'endpoints ignorés" "Info"
            }
            
            Write-Host ""
            Write-Separator
            Write-ColorOutput "🎉 STACK SPOFE PRÊT" "Success"
            Write-Separator
            Write-Host ""
            Write-ColorOutput "📱 Frontend : $($Global:Config.FrontendUrl)" "Info"
            Write-ColorOutput "🔌 Backend  : $($Global:Config.BackendUrl)" "Info"
            Write-ColorOutput "📊 Statut   : .\run-spofe-stack-v2.ps1 -Action status" "Info"
            Write-ColorOutput "👁️  Monitor : .\run-spofe-stack-v2.ps1 -Action monitor" "Info"
            Write-Host ""
            
        } else {
            Write-ColorOutput "❌ Échec du démarrage du stack" "Error"
            Write-ColorOutput "💡 Consultez les logs : more .\logs\api-tests.log" "Info"
            exit 1
        }
    }
    
    "stop" {
        Stop-Stack
    }
    
    "restart" {
        Write-ColorOutput "🔄 Redémarrage du stack..." "Warning"
        Stop-Stack
        Start-Sleep -Seconds 3
        $started = Start-Stack
        
        if ($started -and -not $SkipTests) {
            Test-ApiEndpoints
        }
    }
    
    "status" {
        Show-Status
    }
    
    "test" {
        Write-ColorOutput "🧪 Exécution des tests d'endpoints..." "Info"
        Test-ApiEndpoints
    }
    
    "monitor" {
        Monitor-Stack
    }
}

Write-Host ""
Write-ColorOutput "✨ Opération terminée" "Success"
Write-Host ""
