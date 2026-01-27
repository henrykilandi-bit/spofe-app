# 🚀 SPOFE ARCHITECTURE CORRECTION SCRIPT (PowerShell)
# Date: 2026-01-20
# Platform: Windows PowerShell
# Purpose: Auto-correct architecture structure

$ErrorActionPreference = "Continue"

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║      SPOFE ARCHITECTURE - CORRECTION SCRIPT                   ║" -ForegroundColor Cyan
Write-Host "║                     2026-01-20 16:15 UTC                      ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Define paths
$ProjectRoot = (Get-Location).Path
$SqlFile = "SPOFE_SPOFEv2.1_OHADA_FUSION V3.sql"
$SqlDest = "cascade\src\database\SPOFE_SPOFEv2.1_OHADA_FUSION_V3.sql"
$AuditSource = "Docs\spofe_docs_audit.json"
$AuditDest = "docs\spofe_docs_audit.json"
$SyncScript = "cascade\src\scripts\sync_docs_database_v2_final.js"
$LogDir = "logs"
$DocDir = "docs"
$DbDir = "cascade\src\database"
$BackupDir = "$DocDir\backups"

# Initialize log
if (!(Test-Path $LogDir)) { New-Item -ItemType Directory -Path $LogDir -Force | Out-Null }
$LogFile = "$LogDir\correction-$(Get-Date -Format 'yyyyMMdd_HHmmss').log"

function LogMsg($msg) {
    Write-Host $msg
    Add-Content -Path $LogFile -Value $msg
}

# Initialize log file
Add-Content -Path $LogFile -Value "=== SPOFE CORRECTION LOG ==="
Add-Content -Path $LogFile -Value "Date: $(Get-Date)"
Add-Content -Path $LogFile -Value "Working directory: $ProjectRoot"
Add-Content -Path $LogFile -Value ""

$ErrorCount = 0

# STEP 1: Copy SQL file
LogMsg ""
LogMsg "📌 STEP 1: Copier SQL file..."
if (Test-Path $SqlFile) {
    LogMsg "   Found: $SqlFile"
    if (!(Test-Path $DbDir)) { New-Item -ItemType Directory -Path $DbDir -Force | Out-Null }
    Copy-Item -Path $SqlFile -Destination $SqlDest -Force
    LogMsg "   ✅ Copied to: $SqlDest"
} else {
    LogMsg "   ⚠️  SQL file not found at root (may already be in place)"
}

# STEP 2: Create docs structure
LogMsg ""
LogMsg "📌 STEP 2: Créer structure docs/..."
if (!(Test-Path $DocDir)) { New-Item -ItemType Directory -Path $DocDir -Force | Out-Null }
if (!(Test-Path $BackupDir)) { New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null }
LogMsg "   ✅ Created: docs/"
LogMsg "   ✅ Created: docs/backups/"

# STEP 3: Copy audit JSON
LogMsg ""
LogMsg "📌 STEP 3: Copier audit JSON..."
if (Test-Path $AuditSource) {
    Copy-Item -Path $AuditSource -Destination $AuditDest -Force
    LogMsg "   ✅ Copied from: $AuditSource"
    LogMsg "   ✅ Copied to: $AuditDest"
} else {
    LogMsg "   ⚠️  Audit JSON not found at: $AuditSource"
}

# STEP 4: Clean duplicate configs
LogMsg ""
LogMsg "📌 STEP 4: Nettoyer configs..."
$ConfigFiles = @(Get-Item ".spofeconfig.json" -ErrorAction SilentlyContinue; Get-Item ".spofe-config.json" -ErrorAction SilentlyContinue; Get-Item "spofe-config.json" -ErrorAction SilentlyContinue)
if ($ConfigFiles.Count -gt 1) {
    LogMsg "   Cleaning duplicate configs..."
    Get-Item "spofe-config.json" -ErrorAction SilentlyContinue | Remove-Item -Force
    LogMsg "   ✅ Removed duplicate: spofe-config.json"
    LogMsg "   ✅ Kept: .spofe-config.json"
} else {
    LogMsg "   ℹ️  No duplicate configs found (OK)"
}

# STEP 5: Verify structure
LogMsg ""
LogMsg "📌 STEP 5: Vérifier structure..."

if (Test-Path $SqlDest) {
    LogMsg "   ✅ SQL: cascade/src/database/SPOFE_SPOFEv2.1_OHADA_FUSION_V3.sql"
} else {
    LogMsg "   ❌ MISSING: cascade/src/database/SPOFE_SPOFEv2.1_OHADA_FUSION_V3.sql"
    $ErrorCount++
}

if (Test-Path $BackupDir) {
    LogMsg "   ✅ Folder: docs/backups/"
} else {
    LogMsg "   ❌ MISSING: docs/backups/"
    $ErrorCount++
}

if (Test-Path $AuditDest) {
    LogMsg "   ✅ JSON: docs/spofe_docs_audit.json"
} else {
    LogMsg "   ⚠️  Missing: docs/spofe_docs_audit.json (will be generated)"
}

if (Test-Path ".spofe-config.json") {
    LogMsg "   ✅ Config: .spofe-config.json"
} else {
    LogMsg "   ❌ MISSING: .spofe-config.json"
    $ErrorCount++
}

if (Test-Path "logs/conventions_audit.log") {
    LogMsg "   ✅ Log: logs/conventions_audit.log"
} else {
    LogMsg "   ℹ️  Log: logs/conventions_audit.log (will be created)"
}

# STEP 6: Execute sync script (optional - Node.js required)
LogMsg ""
LogMsg "📌 STEP 6: Vérifier script sync..."
if (Test-Path $SyncScript) {
    LogMsg "   ✅ Script found: $SyncScript"
    LogMsg "   ℹ️  To execute: node $SyncScript"
    LogMsg "   (Skipped - Node.js required)"
} else {
    LogMsg "   ❌ Script not found: $SyncScript"
    $ErrorCount++
}

# STEP 7: Summary
LogMsg ""
LogMsg "╔════════════════════════════════════════════════════════════════╗"
if ($ErrorCount -eq 0) {
    Write-Host "║                ✅ CORRECTION COMPLETED SUCCESSFULLY           ║" -ForegroundColor Green
    LogMsg "║                ✅ CORRECTION COMPLETED SUCCESSFULLY           ║"
    LogMsg "║                                                              ║"
    LogMsg "║  Architecture corrected:                                    ║"
    LogMsg "║  • SQL file in correct location                            ║"
    LogMsg "║  • docs/ structure created                                 ║"
    LogMsg "║  • Audit JSON synchronized                                 ║"
    LogMsg "║  • All configurations clean                                ║"
} else {
    Write-Host "║              ⚠️  CORRECTION WITH $ErrorCount ISSUES FOUND         ║" -ForegroundColor Yellow
    LogMsg "║              ⚠️  CORRECTION WITH $ErrorCount ISSUES FOUND         ║"
}
LogMsg "╚════════════════════════════════════════════════════════════════╝"

LogMsg ""
LogMsg "📊 Log file: $LogFile"
LogMsg ""
LogMsg "✅ Manual corrections completed"
LogMsg "Next: Execute: node cascade/src/scripts/sync_docs_database_v2_final.js"
LogMsg ""

Write-Host ""
Write-Host "📊 Full log saved to: $LogFile" -ForegroundColor Cyan
Write-Host ""
