# 🏛️ Test Révolution Constitutionnelle - SPOFE v2.1.0
# Validation bout-en-bout de la révolution CI constitutionnelle
# "Le pipeline cesse d'être un signal, il devient un fait constitutionnel"

param(
    [switch]$Verbose,
    [switch]$DryRun,
    [string]$Environment = "test"
)

# Configuration
$ProjectRoot = Split-Path $PSScriptRoot -Parent
Set-Location $ProjectRoot

function Print-Header {
    param([string]$Message)
    Write-Host "🏛️ $Message" -ForegroundColor Magenta
    Write-Host ("=" * 70) -ForegroundColor Magenta
}

function Print-Success { param([string]$Message); Write-Host "✅ $Message" -ForegroundColor Green }
function Print-Error { param([string]$Message); Write-Host "❌ $Message" -ForegroundColor Red }
function Print-Warning { param([string]$Message); Write-Host "⚠️  $Message" -ForegroundColor Yellow }
function Print-Info { param([string]$Message); Write-Host "ℹ️  $Message" -ForegroundColor Blue }
function Print-Constitutional { param([string]$Message); Write-Host "🏛️ $Message" -ForegroundColor Magenta }

# Variables de test
$Global:TestResults = @{
    TotalTests = 0
    PassedTests = 0
    FailedTests = 0
    Details = @()
}

function Add-TestResult {
    param(
        [string]$TestName,
        [bool]$Passed,
        [string]$Details = ""
    )
    
    $Global:TestResults.TotalTests++
    if ($Passed) {
        $Global:TestResults.PassedTests++
        Print-Success "$TestName"
    } else {
        $Global:TestResults.FailedTests++
        Print-Error "$TestName - $Details"
    }
    
    $Global:TestResults.Details += @{
        Name = $TestName
        Passed = $Passed
        Details = $Details
    }
}

function Test-ConstitutionalComponents {
    Print-Header "TEST 1: COMPOSANTS RÉVOLUTIONNAIRES"
    
    # Test CI Legitimacy Generator
    $ciScript = "ci\generate_ci_legitimacy_report.sh"
    Add-TestResult "CI Legitimacy Generator existe" (Test-Path $ciScript)
    
    # Test Guardian Extended
    $guardianScript = "governance\guardian\governance_guardian.py"
    Add-TestResult "Guardian Python existe" (Test-Path $guardianScript)
    
    # Test Workflow CI
    $workflowFile = ".github\workflows\ci-legitimacy-state.yml"
    Add-TestResult "Workflow CI constitutionnel existe" (Test-Path $workflowFile)
    
    # Test Decision Requester
    $decisionScript = "governance\scripts\request_governance_decision.sh"
    Add-TestResult "Decision Requester existe" (Test-Path $decisionScript)
    
    Write-Host ""
}

function Test-DatabaseSchema {
    Print-Header "TEST 2: INFRASTRUCTURE CONSTITUTIONNELLE"
    
    # Test schémas SQL
    $currentSchema = "SCHEMA_BASE_DE_DONNEES_ACTUEL.sql"
    Add-TestResult "Schéma constitutionnel actuel" (Test-Path $currentSchema)
    
    $completeSchema = "schema_spofe_v2_1_complete.sql"
    Add-TestResult "Schéma SPOFE v2.1 complet" (Test-Path $completeSchema)
    
    # Test présence domain_events dans schéma
    if (Test-Path $completeSchema) {
        $schemaContent = Get-Content $completeSchema -Raw
        $hasDomainEvents = $schemaContent -match "domain_events"
        Add-TestResult "Table domain_events dans schéma" $hasDomainEvents
    }
    
    Write-Host ""
}

function Test-BuildProofSystem {
    Print-Header "TEST 3: SYSTÈME BUILD_PROOF"
    
    # Test orchestrateur
    $orchestrator = "tools\build-proof-global\orchestrator.ts"
    Add-TestResult "BUILD_PROOF Orchestrator" (Test-Path $orchestrator)
    
    # Test fichiers BUILD_PROOF
    $buildProofFiles = Get-ChildItem -Name "BUILD_PROOF_*.json"
    $count = $buildProofFiles.Count
    Add-TestResult "BUILD_PROOF files (≥5)" ($count -ge 5) "$count trouvés"
    
    # Test contenu BUILD_PROOF (échantillon)
    if ($buildProofFiles.Count -gt 0) {
        $sampleFile = $buildProofFiles[0]
        try {
            $content = Get-Content $sampleFile -Raw | ConvertFrom-Json
            $hasSystemMetrics = $null -ne $content.systemMetrics
            Add-TestResult "BUILD_PROOF contenu valide" $hasSystemMetrics
        } catch {
            Add-TestResult "BUILD_PROOF contenu valide" $false "Erreur JSON"
        }
    }
    
    Write-Host ""
}

function Test-GuardianArchitecture {
    Print-Header "TEST 4: ARCHITECTURE GUARDIAN"
    
    # Test adapteur v4
    $guardianAdapter = "src\infrastructure\guardian\GuardianV4Adapter.ts"
    Add-TestResult "Guardian v4 Adapter" (Test-Path $guardianAdapter)
    
    # Test interface Port
    $guardianPort = "src\infrastructure\guardian\GuardianPort.ts"
    Add-TestResult "Guardian Port Interface" (Test-Path $guardianPort)
    
    # Test transaction manager constitutionnel
    $constitutionalTx = "src\application\transaction\ConstitutionalTransactionManagerAdapter.ts"
    Add-TestResult "Constitutional Transaction Adapter" (Test-Path $constitutionalTx)
    
    # Test contenu GuardianPort
    if (Test-Path $guardianPort) {
        $portContent = Get-Content $guardianPort -Raw
        $hasValidationInterface = $portContent -match "validateDecision"
        Add-TestResult "Interface validateDecision présente" $hasValidationInterface
    }
    
    Write-Host ""
}

function Test-FrontendIntegration {
    Print-Header "TEST 5: INTÉGRATION FRONTEND"
    
    # Test composants workflow
    $workflowUI = "frontend\src\components\WorkflowApprovalUI.jsx"
    Add-TestResult "Workflow Approval UI" (Test-Path $workflowUI)
    
    $workflowHook = "frontend\src\hooks\useWorkflow.js"
    Add-TestResult "useWorkflow Hook" (Test-Path $workflowHook)
    
    $approvalPage = "frontend\src\pages\approval-detail.jsx"
    Add-TestResult "Approval Detail Page" (Test-Path $approvalPage)
    
    # Test dépendances package.json frontend
    $frontendPackage = "frontend\package.json"
    if (Test-Path $frontendPackage) {
        try {
            $packageContent = Get-Content $frontendPackage -Raw | ConvertFrom-Json
            $hasReact = $null -ne $packageContent.dependencies.react
            Add-TestResult "Frontend React configuré" $hasReact
        } catch {
            Add-TestResult "Frontend package.json valide" $false "Erreur JSON"
        }
    }
    
    Write-Host ""
}

function Test-TypeScriptConfiguration {
    Print-Header "TEST 6: CONFIGURATION TYPESCRIPT"
    
    # Test configurations TS
    $baseConfig = "tsconfig.base.json"
    Add-TestResult "TypeScript base config" (Test-Path $baseConfig)
    
    $agaConfig = "tsconfig.aga.json"
    Add-TestResult "TypeScript AGA config" (Test-Path $agaConfig)
    
    $mainConfig = "tsconfig.json"
    Add-TestResult "TypeScript main config" (Test-Path $mainConfig)
    
    # Test compilation
    if (Get-Command npm -ErrorAction SilentlyContinue) {
        if (!$DryRun) {
            Print-Info "Test compilation TypeScript..."
            try {
                $compileResult = npm run tsc -- --noEmit 2>&1
                $compiled = $LASTEXITCODE -eq 0
                Add-TestResult "TypeScript compile sans erreur" $compiled
                if (!$compiled -and $Verbose) {
                    Write-Host $compileResult -ForegroundColor Red
                }
            } catch {
                Add-TestResult "TypeScript compile sans erreur" $false "Erreur exec"
            }
        } else {
            Print-Warning "DRY-RUN: Skip compilation TS"
        }
    } else {
        Add-TestResult "npm disponible pour tests" $false "npm non trouvé"
    }
    
    Write-Host ""
}

function Test-CIWorkflowIntegrity {
    Print-Header "TEST 7: INTÉGRITÉ WORKFLOW CI"
    
    $ciWorkflow = ".github\workflows\ci-legitimacy-state.yml"
    
    if (Test-Path $ciWorkflow) {
        $workflowContent = Get-Content $ciWorkflow -Raw
        
        # Test présence des jobs révolutionnaires
        $hasGuardianEvaluation = $workflowContent -match "guardian-evaluation"
        Add-TestResult "Job guardian-evaluation présent" $hasGuardianEvaluation
        
        $hasCiLegitimacy = $workflowContent -match "ci-legitimacy-report"
        Add-TestResult "Job ci-legitimacy-report présent" $hasCiLegitimacy
        
        $hasConditionalDeploy = $workflowContent -match "needs.*guardian-evaluation"
        Add-TestResult "Deploy conditionné par Guardian" $hasConditionalDeploy
        
        # Test variables d'environnement
        $hasGovUrl = $workflowContent -match "GOVERNANCE_URL"
        Add-TestResult "GOVERNANCE_URL configurée" $hasGovUrl
        
        $hasSpofeDbUrl = $workflowContent -match "SPOFE_DB_URL"
        Add-TestResult "SPOFE_DB_URL configurée" $hasSpofeDbUrl
    } else {
        Add-TestResult "Workflow CI constitutionnel" $false "Fichier manquant"
    }
    
    Write-Host ""
}

function Test-DocumentationCompleteness {
    Print-Header "TEST 8: DOCUMENTATION RÉVOLUTIONNAIRE"
    
    # Test documentation principale
    $revolutionReport = "RAPPORT_REVOLUTION_CI_CONSTITUTIONNEL_2026.md"
    Add-TestResult "Rapport révolution CI" (Test-Path $revolutionReport)
    
    $implementationPlan = "PLAN_MISE_EN_OEUVRE_INTELLIGENT_2026.md"
    Add-TestResult "Plan mise en œuvre intelligent" (Test-Path $implementationPlan)
    
    $architectureDoc = "SPOFE_ARCHITECTURE_DOCUMENTATION.md"
    Add-TestResult "Documentation architecture SPOFE" (Test-Path $architectureDoc)
    
    # Test contenu rapport révolution
    if (Test-Path $revolutionReport) {
        $reportContent = Get-Content $revolutionReport -Raw
        $hasRevolutionAnalysis = $reportContent -match "révolution"
        Add-TestResult "Contenu révolutionnaire analysé" $hasRevolutionAnalysis
    }
    
    Write-Host ""
}

function Test-ConstitutionalInvariants {
    Print-Header "TEST 9: INVARIANTS CONSTITUTIONNELS"
    
    # Test présence documentation invariants
    $invariantsDir = "governance\invariants"
    Add-TestResult "Répertoire invariants existe" (Test-Path $invariantsDir)
    
    # Test scripts constitution
    $constitutionMonitor = "governance\constitution_broken_monitor.sh"
    Add-TestResult "Constitution broken monitor" (Test-Path $constitutionMonitor)
    
    $buildProofVerify = "governance\verify_build_proof.sh"
    Add-TestResult "BUILD_PROOF verify script" (Test-Path $buildProofVerify)
    
    # Test audit constitutionnel
    $auditDir = "governance\audit"
    Add-TestResult "Répertoire audit constitutionnel" (Test-Path $auditDir)
    
    Write-Host ""
}

function Test-SystemReadiness {
    Print-Header "TEST 10: PRÉPARATION SYSTÈME"
    
    # Test environnement Node.js
    if (Get-Command node -ErrorAction SilentlyContinue) {
        $nodeVersion = node --version
        Add-TestResult "Node.js disponible" $true $nodeVersion
    } else {
        Add-TestResult "Node.js disponible" $false "Non installé"
    }
    
    # Test Git
    if (Get-Command git -ErrorAction SilentlyContinue) {
        $gitVersion = git --version
        Add-TestResult "Git disponible" $true
    } else {
        Add-TestResult "Git disponible" $false "Non installé"
    }
    
    # Test Python (pour Guardian)
    if (Get-Command python -ErrorAction SilentlyContinue) {
        $pythonVersion = python --version 2>&1
        Add-TestResult "Python disponible" $true
    } else {
        Add-TestResult "Python disponible" $false "Non installé"
    }
    
    # Test dépendances npm
    if (Test-Path "package.json" -and (Get-Command npm -ErrorAction SilentlyContinue)) {
        if (!$DryRun) {
            Print-Info "Vérification node_modules..."
            $hasNodeModules = Test-Path "node_modules"
            Add-TestResult "node_modules installé" $hasNodeModules
        } else {
            Print-Warning "DRY-RUN: Skip vérification node_modules"
        }
    }
    
    Write-Host ""
}

function Show-TestSummary {
    Print-Header "RÉSUMÉ DES TESTS CONSTITUTIONNELS"
    
    $successRate = [math]::Round(($Global:TestResults.PassedTests * 100 / $Global:TestResults.TotalTests), 0)
    
    Write-Host "📊 RÉSULTATS DES TESTS DE LA RÉVOLUTION"
    Write-Host ""
    Write-Host "Total des tests       : $($Global:TestResults.TotalTests)"
    Write-Host "Tests réussis         : $($Global:TestResults.PassedTests)"
    Write-Host "Tests échoués         : $($Global:TestResults.FailedTests)"
    Write-Host "Taux de succès        : $successRate%"
    Write-Host ""
    
    if ($successRate -ge 90) {
        Print-Success "🏛️ RÉVOLUTION CONSTITUTIONNELLE OPÉRATIONNELLE"
        Write-Host "✅ SPOFE prêt pour la révolution CI constitutionnelle" -ForegroundColor Green
        $exitCode = 0
    } elseif ($successRate -ge 75) {
        Print-Warning "🔧 RÉVOLUTION EN COURS - Optimisations requises"
        Write-Host "⚠️ Quelques ajustements nécessaires avant pleine opération" -ForegroundColor Yellow
        $exitCode = 1
    } elseif ($successRate -ge 50) {
        Print-Warning "🚧 RÉVOLUTION PARTIELLE - Actions correctives nécessaires"
        Write-Host "🔧 Révolution partiellement implémentée" -ForegroundColor Yellow
        $exitCode = 2
    } else {
        Print-Error "❌ RÉVOLUTION INCOMPLÈTE - Réparations majeures requises"
        Write-Host "🚨 Révolution constitutionnelle non fonctionnelle" -ForegroundColor Red
        $exitCode = 3
    }
    
    if ($Verbose -and $Global:TestResults.FailedTests -gt 0) {
        Write-Host ""
        Print-Header "DÉTAILS DES ÉCHECS"
        foreach ($test in $Global:TestResults.Details) {
            if (!$test.Passed) {
                Print-Error "$($test.Name): $($test.Details)"
            }
        }
    }
    
    return $exitCode
}

function Show-NextSteps {
    Write-Host ""
    Print-Header "PROCHAINES ÉTAPES INTELLIGENTES"
    Write-Host ""
    
    $failedTests = $Global:TestResults.FailedTests
    
    if ($failedTests -eq 0) {
        Write-Host "🚀 Actions de déploiement:"
        Write-Host "  1. Créer commit test: git add -A && git commit -m 'feat: Test révolution constitutionnelle'"
        Write-Host "  2. Déclencher pipeline: git push origin main"
        Write-Host "  3. Observer workflow 5 jobs sur GitHub Actions"
        Write-Host "  4. Valider Guardian evaluation fonctionne"
    } elseif ($failedTests -le 3) {
        Write-Host "🔧 Actions correctives mineures:"
        Write-Host "  1. Installer dépendances manquantes"
        Write-Host "  2. Re-exécuter ce test: .\tools\test-revolution-complete.ps1"
        Write-Host "  3. Procéder au test pipeline si >90%"
    } else {
        Write-Host "🚨 Actions correctives majeures:"
        Write-Host "  1. Exécuter diagnostic: .\tools\constitutional-health-check.ps1"
        Write-Host "  2. Corriger composants manquants"
        Write-Host "  3. Re-exécuter tests complets"
    }
    
    Write-Host ""
    Write-Host "📋 Monitoring continu:"
    Write-Host "  1. Audit quotidien: .\tools\daily-constitutional-monitor.ps1"
    Write-Host "  2. Vérification BUILD_PROOF: npm run build-proof"
    Write-Host "  3. Tests Guardian: python governance\guardian\test.py"
}

# Fonction principale
function Main {
    Write-Host "🏛️ TEST RÉVOLUTION CONSTITUTIONNELLE COMPLÈTE" -ForegroundColor Magenta
    Write-Host "📅 $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Magenta
    Write-Host "🎯 Validation bout-en-bout de la révolution CI" -ForegroundColor Magenta
    
    if ($DryRun) {
        Write-Host "🧪 MODE DRY-RUN: Tests sans modifications" -ForegroundColor Yellow
    }
    
    if ($Verbose) {
        Write-Host "🔍 MODE VERBOSE: Affichage détaillé" -ForegroundColor Blue
    }
    
    Write-Host ""
    
    # Exécution des tests
    Test-ConstitutionalComponents
    Test-DatabaseSchema
    Test-BuildProofSystem
    Test-GuardianArchitecture
    Test-FrontendIntegration
    Test-TypeScriptConfiguration
    Test-CIWorkflowIntegrity
    Test-DocumentationCompleteness
    Test-ConstitutionalInvariants
    Test-SystemReadiness
    
    # Résumé et recommandations
    $exitCode = Show-TestSummary
    Show-NextSteps
    
    Write-Host ""
    Print-Constitutional "🏛️ `"Le pipeline n'est plus un signal. C'est un fait constitutionnel.`""
    Write-Host ""
    
    exit $exitCode
}

# Exécution
Main