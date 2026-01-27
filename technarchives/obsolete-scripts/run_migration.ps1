# run_migration.ps1 - Script pour exécuter la migration SQL
# Usage: .\run_migration.ps1

Write-Host "🚀 Exécution de la migration SQL pour les tables multi-groupes" -ForegroundColor Green

# Chemin vers MySQL
$mysqlPath = "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"

# Vérifier si MySQL existe
if (-not (Test-Path $mysqlPath)) {
    Write-Host "❌ MySQL non trouvé à: $mysqlPath" -ForegroundColor Red
    Write-Host "Veuillez installer MySQL ou ajuster le chemin dans le script" -ForegroundColor Yellow
    exit 1
}

# Fichier de migration
$migrationFile = "database_migrations\01_create_consultant_tables.sql"

# Vérifier si le fichier de migration existe
if (-not (Test-Path $migrationFile)) {
    Write-Host "❌ Fichier de migration non trouvé: $migrationFile" -ForegroundColor Red
    exit 1
}

Write-Host "📁 Fichier de migration: $migrationFile" -ForegroundColor Cyan

# Demander le mot de passe MySQL
$password = Read-Host "🔐 Entrez le mot de passe MySQL (root)" -AsSecureString
$passwordPlain = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto([System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($password))

try {
    Write-Host "🔄 Connexion à MySQL et exécution de la migration..." -ForegroundColor Yellow
    
    # Exécuter la migration
    $process = Start-Process -FilePath $mysqlPath -ArgumentList "-u", "root", "-p$passwordPlain", "spofe_v2_1", "-e", "source $migrationFile" -Wait -PassThru -NoNewWindow
    
    if ($process.ExitCode -eq 0) {
        Write-Host "✅ Migration SQL exécutée avec succès !" -ForegroundColor Green
        Write-Host "📊 Tables créées:" -ForegroundColor Cyan
        Write-Host "  - consultant_group_assignments" -ForegroundColor White
        Write-Host "  - consultant_company_access" -ForegroundColor White
        Write-Host "  - consulting_firms" -ForegroundColor White
        Write-Host "  - firm_consultants" -ForegroundColor White
        Write-Host "  - role_approval_workflow" -ForegroundColor White
        Write-Host "  - pending_role_approvals" -ForegroundColor White
        Write-Host "  - compagnie_permissions" -ForegroundColor White
        Write-Host "  - users (étendu)" -ForegroundColor White
    } else {
        Write-Host "❌ Erreur lors de l'exécution de la migration (code: $($process.ExitCode))" -ForegroundColor Red
        exit $process.ExitCode
    }
} catch {
    Write-Host "❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
} finally {
    # Nettoyer le mot de passe de la mémoire
    $passwordPlain = $null
    $password = $null
}

Write-Host "🎉 Migration terminée !" -ForegroundColor Green
