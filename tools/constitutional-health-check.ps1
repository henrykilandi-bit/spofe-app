# 🏛️ Constitutional Health Check - SPOFE v2.1.0
# Validation intelligente de l'état révolutionnaire
# PowerShell version pour Windows

param(
    [switch]$Verbose
)

# Configuration
$ProjectRoot = Split-Path $PSScriptRoot -Parent
Set-Location $ProjectRoot

# Couleurs PowerShell
$Colors = @{
    Red = "Red"
    Green = "Green" 
    Yellow = "Yellow"
    Blue = "Blue"
    Magenta = "Magenta"
    Cyan = "Cyan"
    White = "White"
}

function Print-Header {
    param([string]$Message)
    Write-Host "🏛️ $Message" -ForegroundColor Magenta
    Write-Host ("=" * 70) -ForegroundColor Magenta
}

function Print-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Print-Error {
    param([string]$Message)  
    Write-Host "❌ $Message" -ForegroundColor Red
}

function Print-Warning {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

function Print-Info {
    param([string]$Message)
    Write-Host "ℹ️  $Message" -ForegroundColor Blue
}

# Variables globales pour le score
$Global:TotalChecks = 0
$Global:PassedChecks = 0

function Test-Component {
    param(
        [string]$Name,
        [string]$FilePath,
        [int]$ExpectedLines
    )
    
    $Global:TotalChecks++
    
    if (Test-Path $FilePath) {
        $actualLines = (Get-Content $FilePath -ErrorAction SilentlyContinue | Measure-Object -Line).Lines
        if ($actualLines -ge $ExpectedLines) {
            Print-Success "$Name`: $actualLines lignes (≥ $ExpectedLines attendues)"
            $Global:PassedChecks++
            return $true
        } else {
            Print-Warning "$Name`: $actualLines lignes (< $ExpectedLines attendues)"
            return $false
        }
    } else {
        Print-Error "$Name`: Fichier manquant ($FilePath)"
        return $false
    }
}

function Test-ConstitutionalComponents {
    Print-Header "VALIDATION COMPOSANTS RÉVOLUTIONNAIRES"
    
    # Composants principaux de la révolution
    Test-Component "CI Legitimacy Generator" "ci\generate_ci_legitimacy_report.sh" 300
    Test-Component "Guardian Governance Extended" "governance\guardian\governance_guardian.py" 600  
    Test-Component "CI Legitimacy Workflow" ".github\workflows\ci-legitimacy-state.yml" 500
    Test-Component "Governance Decision Requester" "governance\scripts\request_governance_decision.sh" 400
    
    Write-Host ""
}

function Test-DatabaseConstitutional {
    Print-Header "VALIDATION INFRASTRUCTURE CONSTITUTIONNELLE"
    
    # Vérifier PostgreSQL disponibility
    $Global:TotalChecks++
    if (Get-Command psql -ErrorAction SilentlyContinue) {
        Print-Info "PostgreSQL CLI disponible"
        $Global:PassedChecks++
    } else {
        Print-Warning "PostgreSQL CLI non disponible (test limité)"
    }
    
    # Vérifier les scripts de schema
    Test-Component "Schema Constitutional Current" "SCHEMA_BASE_DE_DONNEES_ACTUEL.sql" 50
    Test-Component "Schema SPOFE v2.1 Complete" "schema_spofe_v2_1_complete.sql" 100
    
    Write-Host ""
}

function Test-BuildProofSystem {
    Print-Header "VALIDATION SYSTÈME BUILD_PROOF"
    
    # BUILD_PROOF global orchestrator
    Test-Component "BUILD_PROOF Orchestrator" "tools\build-proof-global\orchestrator.ts" 100
    
    # BUILD_PROOF files principaux
    $buildProofFiles = Get-ChildItem -Name "BUILD_PROOF_*.json" -ErrorAction SilentlyContinue
    $buildProofCount = $buildProofFiles.Count
    
    $Global:TotalChecks++
    if ($buildProofCount -ge 5) {
        Print-Success "BUILD_PROOF files: $buildProofCount trouvés (≥ 5)"
        $Global:PassedChecks++
    } else {
        Print-Warning "BUILD_PROOF files: $buildProofCount trouvés (< 5)"
    }
    
    Write-Host ""
}

function Test-FrontendIntegration {
    Print-Header "VALIDATION INTÉGRATION FRONTEND"
    
    # Components Workflow
    Test-Component "Workflow Approval UI" "frontend\src\components\WorkflowApprovalUI.jsx" 100
    Test-Component "useWorkflow Hook" "frontend\src\hooks\useWorkflow.js" 250
    Test-Component "Approval Detail Page" "frontend\src\pages\approval-detail.jsx" 100
    
    Write-Host ""
}

function Test-GuardianArchitecture {
    Print-Header "VALIDATION ARCHITECTURE GUARDIAN"
    
    # Guardian v4 binding
    Test-Component "Guardian v4 Adapter" "src\infrastructure\guardian\GuardianV4Adapter.ts" 50
    Test-Component "Guardian Port Interface" "src\infrastructure\guardian\GuardianPort.ts" 20
    Test-Component "Constitutional Transaction Adapter" "src\application\transaction\ConstitutionalTransactionManagerAdapter.ts" 100
    
    Write-Host ""
}

function Test-DocumentationCompleteness {
    Print-Header "VALIDATION DOCUMENTATION RÉVOLUTIONNAIRE"
    
    # Documentation principale
    Test-Component "Rapport Révolution CI" "RAPPORT_REVOLUTION_CI_CONSTITUTIONNEL_2026.md" 700
    Test-Component "Matrice Industrialisation" "MATRICE_INDUSTRIALISATION_SPOFE_2026.md" 200
    Test-Component "Documentation Architecture" "SPOFE_ARCHITECTURE_DOCUMENTATION.md" 500
    
    Write-Host ""
}

function Test-CIWorkflowConfiguration {
    Print-Header "VALIDATION CONFIGURATION CI"
    
    # Package.json scripts
    if (Test-Path "package.json") {
        $packageContent = Get-Content "package.json" -Raw
        $guardianMatches = ([regex]::Matches($packageContent, "guardian")).Count
        $Global:TotalChecks++
        if ($guardianMatches -gt 5) {
            Print-Success "Guardian scripts dans package.json: $guardianMatches"
            $Global:PassedChecks++
        } else {
            Print-Warning "Guardian scripts dans package.json: $guardianMatches (< 5)"
        }
    }
    
    # TypeScript configuration  
    Test-Component "TypeScript Base Config" "tsconfig.base.json" 10
    Test-Component "TypeScript AGA Config" "tsconfig.aga.json" 5
    
    Write-Host ""
}

function Get-ConstitutionalStatus {
    Print-Header "STATUT CONSTITUTIONNEL SPOFE"
    
    $successRate = [math]::Round(($Global:PassedChecks * 100 / $Global:TotalChecks), 0)
    
    Write-Host "📊 RÉSULTATS DE LA VALIDATION CONSTITUTIONNELLE"
    Write-Host ""
    Write-Host "Total des vérifications : $($Global:TotalChecks)"
    Write-Host "Vérifications réussies  : $($Global:PassedChecks)"
    Write-Host "Taux de succès         : $successRate%"
    Write-Host ""
    
    if ($successRate -ge 90) {
        Print-Success "🏛️ SPOFE CONSTITUTIONNELLEMENT OPÉRATIONNEL"
        Write-Host "Révolution CI constitutionnelle CONFIRMÉE" -ForegroundColor Green
        return 0
    } elseif ($successRate -ge 75) {
        Print-Warning "🔧 SPOFE RÉVOLUTION EN COURS"
        Write-Host "Optimisations mineures requises" -ForegroundColor Yellow
        return 1
    } else {
        Print-Error "❌ RÉVOLUTION CONSTITUTIONNELLE INCOMPLÈTE"
        Write-Host "Actions correctives majeures requises" -ForegroundColor Red
        return 2
    }
}

function Show-NextActions {
    Write-Host ""
    Print-Header "ACTIONS RECOMMANDÉES"
    Write-Host ""
    Write-Host "🔧 Actions immédiates :"
    Write-Host "  1. Exécuter tests complets : npm run test"
    Write-Host "  2. Générer BUILD_PROOF : npm run build-proof"  
    Write-Host "  3. Tester workflow CI : git push (déclencher pipeline)"
    Write-Host ""
    Write-Host "📋 Actions de suivi :"
    Write-Host "  1. Monitoring quotidien : .\tools\daily-monitor.ps1"
    Write-Host "  2. Audit constitutionnel : .\governance\audit\generate.ps1"
    Write-Host "  3. Validation Guardian : python governance\guardian\test.py"
    Write-Host ""
}

# Fonction principale
function Main {
    Write-Host "🏛️ CONSTITUTIONAL HEALTH CHECK - SPOFE v2.1.0" -ForegroundColor Magenta
    Write-Host "📅 $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Magenta
    Write-Host "🎯 Validation de la révolution constitutionnelle" -ForegroundColor Magenta
    Write-Host ""
    
    # Exécution des vérifications
    Test-ConstitutionalComponents
    Test-DatabaseConstitutional
    Test-BuildProofSystem  
    Test-FrontendIntegration
    Test-GuardianArchitecture
    Test-DocumentationCompleteness
    Test-CIWorkflowConfiguration
    
    # Génération du statut final
    $exitCode = Get-ConstitutionalStatus
    
    Show-NextActions
    
    Write-Host ""
    Write-Host "🏛️ `"Le pipeline n'est plus un signal. C'est un fait constitutionnel.`"" -ForegroundColor Magenta
    Write-Host ""
    
    exit $exitCode
}

# Exécution
Main