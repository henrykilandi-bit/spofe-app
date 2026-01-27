# Script PowerShell pour démarrer SPOFE avec PM2
# Usage: .\start-spofe-pm2.ps1

Write-Host "🚀 Démarrage de SPOFE avec PM2..." -ForegroundColor Green

# Arrêter les processus existants
Write-Host "`n🛑 Arrêt des processus existants..." -ForegroundColor Yellow
pm2 delete all 2>$null

# Démarrer le backend
Write-Host "`n📦 Démarrage du backend..." -ForegroundColor Cyan
Set-Location "cascade"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "pm2 start npm --name spofe-backend -- run dev" -WindowStyle Minimized
Set-Location ".."

Start-Sleep -Seconds 3

# Démarrer le frontend
Write-Host "`n🎨 Démarrage du frontend..." -ForegroundColor Cyan
Set-Location "frontend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "pm2 start npm --name spofe-frontend -- run dev -- --host" -WindowStyle Minimized
Set-Location ".."

Start-Sleep -Seconds 3

# Afficher le statut
Write-Host "`n📊 Statut PM2:" -ForegroundColor Green
pm2 status

Write-Host "`n✅ SPOFE démarré!" -ForegroundColor Green
Write-Host "   Backend:  http://localhost:3001" -ForegroundColor White
Write-Host "   Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "`nPour voir les logs: pm2 logs" -ForegroundColor Yellow
Write-Host "Pour arrêter:       pm2 stop all" -ForegroundColor Yellow
