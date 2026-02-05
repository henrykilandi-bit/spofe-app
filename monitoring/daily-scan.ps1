# Scan quotidien anti-pollution
cd "C:\Users\henry\Desktop\SPOFE-APP VERS 1.0"
.\monitoring\anti-pollution-scanner.ps1 -Verbose
if($LASTEXITCODE -ne 0) {
    Write-Host "⚠️ Pollution détectée - Voir rapport" -ForegroundColor Yellow
}
