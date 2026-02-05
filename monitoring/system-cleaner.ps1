#!/usr/bin/env pwsh
# 🧹 SPOFE System Cleaner - Maintenance Automatique
# Version: 1.0.0 
# Gouvernance: P0 Constitutional

param(
    [switch]$DryRun = $false,
    [switch]$Interactive = $false,
    [string]$Mode = "safe"  # safe, aggressive, custom
)

Write-Host "🧹 SPOFE SYSTEM CLEANER - MAINTENANCE AUTOMATIQUE" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan

function Clean-BackupFiles {
    Write-Host "`n📁 NETTOYAGE FICHIERS BACKUP/TEMPORAIRES" -ForegroundColor Yellow
    Write-Host "─────────────────────────────────────────────────────"
    
    $backupPatterns = @("*.backup", "*.bak", "*.original", "*.tmp", "*.temp")
    $cleaned = 0
    
    foreach($pattern in $backupPatterns) {
        $files = Get-ChildItem -Path . -Filter $pattern -Recurse | Where-Object { 
            $_.FullName -notlike "*docmd*" -and 
            $_.FullName -notlike "*node_modules*" 
        }
        
        foreach($file in $files) {
            Write-Host "  🗑️ $($file.FullName.Substring($PWD.Path.Length + 1))" -ForegroundColor Gray
            if(-not $DryRun) {
                if(-not (Test-Path "docmd\fichiers-temporaires")) {
                    New-Item -ItemType Directory -Path "docmd\fichiers-temporaires" -Force | Out-Null
                }
                Move-Item -Path $file.FullName -Destination "docmd\fichiers-temporaires\"
            }
            $cleaned++
        }
    }
    
    Write-Host "  ✅ $cleaned fichiers backup archivés" -ForegroundColor Green
    return $cleaned
}

function Clean-BuildProofDirectories {
    Write-Host "`n📁 NETTOYAGE RÉPERTOIRES BUILD_PROOF TEMPORAIRES" -ForegroundColor Yellow
    Write-Host "─────────────────────────────────────────────────────"
    
    $buildProofDirs = Get-ChildItem -Path "cascade\modules" -Directory -Recurse | Where-Object { 
        $_.Name -eq "BUILD_PROOF" 
    }
    
    $cleaned = 0
    foreach($dir in $buildProofDirs) {
        $relativePath = $dir.FullName.Substring($PWD.Path.Length + 1)
        Write-Host "  📦 $relativePath" -ForegroundColor Gray
        
        if(-not $DryRun) {
            if(-not (Test-Path "docmd\build-proof-temporaires")) {
                New-Item -ItemType Directory -Path "docmd\build-proof-temporaires" -Force | Out-Null
            }
            $destName = $dir.Parent.Name + "_BUILD_PROOF"
            Move-Item -Path $dir.FullName -Destination "docmd\build-proof-temporaires\$destName"
        }
        $cleaned++
    }
    
    Write-Host "  ✅ $cleaned répertoires BUILD_PROOF archivés" -ForegroundColor Green
    return $cleaned
}

function Clean-LogFiles {
    Write-Host "`n📁 NETTOYAGE LOGS ANCIENS" -ForegroundColor Yellow
    Write-Host "─────────────────────────────────────────────────────"
    
    $logs = Get-ChildItem -Path . -Filter "*.log" -Recurse | Where-Object { 
        $_.FullName -notlike "*docmd*" -and 
        $_.FullName -notlike "*node_modules*" -and
        $_.LastWriteTime -lt (Get-Date).AddDays(-7)  # Plus de 7 jours
    }
    
    $cleaned = 0
    foreach($log in $logs) {
        $relativePath = $log.FullName.Substring($PWD.Path.Length + 1)
        Write-Host "  📄 $relativePath ($(($log.LastWriteTime).ToString('yyyy-MM-dd')))" -ForegroundColor Gray
        
        if(-not $DryRun) {
            if(-not (Test-Path "docmd\logs-archives")) {
                New-Item -ItemType Directory -Path "docmd\logs-archives" -Force | Out-Null
            }
            Move-Item -Path $log.FullName -Destination "docmd\logs-archives\"
        }
        $cleaned++
    }
    
    Write-Host "  ✅ $cleaned logs anciens archivés" -ForegroundColor Green
    return $cleaned
}

function Clean-SummaryFiles {
    Write-Host "`n📁 NETTOYAGE FICHIERS SUMMARY/NOTIFICATION" -ForegroundColor Yellow
    Write-Host "─────────────────────────────────────────────────────"
    
    $summaries = Get-ChildItem -Path . -Recurse -File | Where-Object { 
        ($_.Name -like "*_SUMMARY.*" -or $_.Name -like "*_NOTIFICATION.*") -and
        $_.FullName -notlike "*docmd*" -and
        $_.FullName -notlike "*BUILD_PROOF_SYSTÈME_FINAL_INDUSTRIALISATION.md*"
    }
    
    $cleaned = 0
    foreach($summary in $summaries) {
        $relativePath = $summary.FullName.Substring($PWD.Path.Length + 1)
        Write-Host "  📋 $relativePath" -ForegroundColor Gray
        
        if(-not $DryRun) {
            if(-not (Test-Path "docmd\notifications-obsoletes")) {
                New-Item -ItemType Directory -Path "docmd\notifications-obsoletes" -Force | Out-Null
            }
            Move-Item -Path $summary.FullName -Destination "docmd\notifications-obsoletes\"
        }
        $cleaned++
    }
    
    Write-Host "  ✅ $cleaned fichiers summary/notification archivés" -ForegroundColor Green
    return $cleaned
}

# Execution principale
$totalCleaned = 0

if($DryRun) {
    Write-Host "`n🔍 MODE DRY-RUN - Aucune action ne sera effectuée" -ForegroundColor Yellow
}

Write-Host "`n🎯 MODE: $Mode" -ForegroundColor Cyan

switch($Mode) {
    "safe" {
        $totalCleaned += Clean-BackupFiles
        $totalCleaned += Clean-SummaryFiles
    }
    "aggressive" {
        $totalCleaned += Clean-BackupFiles
        $totalCleaned += Clean-BuildProofDirectories
        $totalCleaned += Clean-LogFiles
        $totalCleaned += Clean-SummaryFiles
    }
    "custom" {
        if($Interactive) {
            # Mode interactif
            Write-Host "`nSélectionnez les nettoyages à effectuer:"
            # Implementation interactive
        }
    }
}

Write-Host "`n🏁 NETTOYAGE TERMINÉ" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "📊 Total éléments traités: $totalCleaned" -ForegroundColor White

if($totalCleaned -gt 0) {
    Write-Host "📂 Archives organisées dans docmd/" -ForegroundColor White
    Write-Host "🔄 Relancer le scanner anti-pollution pour vérification" -ForegroundColor White
} else {
    Write-Host "✨ Système déjà propre - Aucun nettoyage nécessaire" -ForegroundColor White
}