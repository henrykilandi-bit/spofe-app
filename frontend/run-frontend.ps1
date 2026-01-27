# SPOFE Frontend Launcher v1.0
# Démarrage stable du serveur frontend Vite

$projectPath = "C:\Users\henry\Desktop\SPOFE-APP VERS 1.0\frontend"

Write-Host "🧹 Nettoyage des processus Node précédents..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

Write-Host "🚀 Démarrage du frontend SPOFE (Vite)..." -ForegroundColor Green
Write-Host "📍 Port: 5173" -ForegroundColor Cyan
Write-Host "🌐 URL: http://localhost:5173/" -ForegroundColor Cyan

cd $projectPath
npm run dev

