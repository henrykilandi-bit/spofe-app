#!/usr/bin/env pwsh
# 🛡️ SPOFE Anti-Pollution Monitor - Scanner Automatique
# Version: 1.0.0
# Gouvernance: P0 Constitutional

param(
    [switch]$DryRun = $false,
    [switch]$Verbose = $false,
    [string]$ConfigPath = "monitoring\anti-pollution.config.json"
)

# Configuration
$WorkspacePath = Get-Location
$LogPath = "monitoring\pollution-monitor.log"
$ReportPath = "monitoring\pollution-report-$(Get-Date -Format 'yyyy-MM-dd-HHmm').md"

function Write-Log {
    param($Message, $Level = "INFO")
    $Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $LogEntry = "[$Timestamp] [$Level] $Message"
    
    if($Verbose -or $Level -eq "WARNING" -or $Level -eq "ERROR") {
        Write-Host $LogEntry -ForegroundColor $(
            switch($Level) {
                "ERROR" { "Red" }
                "WARNING" { "Yellow" }
                "INFO" { "Cyan" }
                default { "White" }
            }
        )
    }
    
    Add-Content -Path $LogPath -Value $LogEntry
}

function Load-Config {
    if(!(Test-Path $ConfigPath)) {
        Write-Log "Configuration file not found: $ConfigPath" "ERROR"
        return $null
    }
    
    try {
        $config = Get-Content $ConfigPath -Raw | ConvertFrom-Json
        Write-Log "Configuration loaded successfully" "INFO"
        return $config
    }
    catch {
        Write-Log "Failed to load configuration: $($_.Exception.Message)" "ERROR"
        return $null
    }
}

function Scan-Pollution {
    param($Config)
    
    Write-Log "🔍 Starting SPOFE Anti-Pollution Scan" "INFO"
    
    $results = @{
        SuspiciousFiles = @()
        ObsoleteDocuments = @()
        PollutedDirectories = @()
        TotalFiles = 0
        CleanFiles = 0
        SuspiciousCount = 0
    }
    
    # Scan all files
    $allFiles = Get-ChildItem -Path $WorkspacePath -Recurse -File | Where-Object {
        $skip = $false
        foreach($exclusion in $Config.exclusions.directories) {
            if($_.FullName -like "*\$exclusion\*" -or $_.FullName -like "*/$exclusion/*") {
                $skip = $true
                break
            }
        }
        -not $skip
    }
    
    $results.TotalFiles = $allFiles.Count
    Write-Log "📊 Scanning $($results.TotalFiles) files" "INFO"
    
    foreach($file in $allFiles) {
        $relativePath = $file.FullName.Substring($WorkspacePath.Path.Length + 1)
        $isSuspicious = $false
        $reason = @()
        
        # Check suspicious extensions
        foreach($ext in $Config.blacklist.suspicious_extensions) {
            if($file.Extension -eq $ext -or $file.Name -like "*$ext") {
                $isSuspicious = $true
                $reason += "Suspicious extension: $ext"
            }
        }
        
        # Check obsolete document patterns
        foreach($pattern in $Config.blacklist.obsolete_documents) {
            if($file.Name -like $pattern) {
                $isSuspicious = $true
                $reason += "Obsolete document pattern: $pattern"
            }
        }
        
        # Check pollution patterns
        foreach($pattern in $Config.blacklist.pollution_patterns) {
            $pattern = $pattern.Replace("**", "*").Replace("/", "\")
            if($relativePath -like $pattern) {
                $isSuspicious = $true
                $reason += "Pollution pattern: $pattern"
            }
        }
        
        if($isSuspicious) {
            $results.SuspiciousFiles += @{
                Path = $relativePath
                FullPath = $file.FullName
                Size = $file.Length
                LastWrite = $file.LastWriteTime
                Reasons = $reason
            }
            $results.SuspiciousCount++
            Write-Log "🚨 Suspicious file: $relativePath - $($reason -join ', ')" "WARNING"
        } else {
            $results.CleanFiles++
        }
    }
    
    Write-Log "✅ Scan completed: $($results.CleanFiles) clean, $($results.SuspiciousCount) suspicious" "INFO"
    return $results
}

function Generate-Report {
    param($Results, $Config)
    
    $reportContent = @"
# 🛡️ SPOFE Anti-Pollution Report

**Scan Date:** $(Get-Date -Format "dd MMMM yyyy HH:mm")  
**Scanner Version:** 1.0.0  
**Workspace:** $($WorkspacePath.Path)

---

## 📊 Scan Summary

- **Total Files Scanned:** $($Results.TotalFiles)
- **Clean Files:** $($Results.CleanFiles) ✅
- **Suspicious Files:** $($Results.SuspiciousCount) ⚠️
- **Pollution Level:** $(if($Results.SuspiciousCount -eq 0) { "CLEAN 🟢" } elseif($Results.SuspiciousCount -lt 10) { "LOW 🟡" } else { "HIGH 🔴" })

---

"@

    if($Results.SuspiciousCount -gt 0) {
        $reportContent += @"
## 🚨 Suspicious Files Detected

| File | Type | Last Modified | Reasons |
|------|------|---------------|---------|

"@
        foreach($file in $Results.SuspiciousFiles) {
            $type = if($file.Path -like "*.md") { "Document" } 
                   elseif($file.Path -like "*.*") { "File" } 
                   else { "Directory" }
            $reportContent += "| ``$($file.Path)`` | $type | $($file.LastWrite.ToString('yyyy-MM-dd')) | $($file.Reasons -join '; ') |`n"
        }
        
        $reportContent += @"

---

## 🎯 Recommended Actions

"@
        if($Results.SuspiciousCount -ge $Config.archive_rules.auto_archive_threshold) {
            $reportContent += "- 📦 **Auto-archive** suspicious files to ``docmd/auto-archives/``"
        }
        $reportContent += @"
- 🔍 **Review** each suspicious file manually
- 🗂️ **Archive** obsolete files to appropriate docmd/ subdirectories  
- 🔒 **Validate** system integrity after cleanup

"@
    } else {
        $reportContent += @"
## ✅ System Status: CLEAN

No suspicious files detected. System maintains excellent hygiene post-certification.

**Recommendations:**
- Continue regular monitoring
- Maintain current file management practices
- System ready for production deployment

"@
    }
    
    $reportContent += @"

---

**🛡️ SPOFE Anti-Pollution Monitor - Automated Scan**  
*System Protection Level: P0 Constitutional*
"@

    Set-Content -Path $ReportPath -Value $reportContent -Encoding UTF8
    Write-Log "📄 Report generated: $ReportPath" "INFO"
}

# Main Execution
Write-Log "🚀 SPOFE Anti-Pollution Monitor Starting" "INFO"

$config = Load-Config
if(-not $config) {
    Write-Log "Cannot proceed without valid configuration" "ERROR"
    exit 1
}

if($config.monitoring.enabled -ne $true) {
    Write-Log "Monitoring disabled in configuration" "WARNING"
    exit 0
}

Write-Log "🛡️ Monitor: $($config.monitoring.name) v$($config.monitoring.version)" "INFO"
Write-Log "🔒 Level: $($config.monitoring.level)" "INFO"

if($DryRun) {
    Write-Log "🔍 DRY RUN MODE - No actions will be taken" "WARNING"
}

$scanResults = Scan-Pollution $config
Generate-Report $scanResults $config

Write-Log "🏁 Anti-Pollution Monitor Completed" "INFO"

if($scanResults.SuspiciousCount -gt 0) {
    Write-Host "`n⚠️  ATTENTION: $($scanResults.SuspiciousCount) suspicious files detected!" -ForegroundColor Yellow
    Write-Host "📄 See report: $ReportPath" -ForegroundColor Cyan
    exit 1
} else {
    Write-Host "`n✅ System CLEAN - No pollution detected!" -ForegroundColor Green
    exit 0
}