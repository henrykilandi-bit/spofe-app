# Script pour créer un utilisateur de test
$uri = "http://localhost:3001/api/auth/register"
$body = @{
    username = "admin"
    email = "admin@spofe.local"
    password = "Password123!@"
} | ConvertTo-Json

Write-Host "Création de l'utilisateur admin..." -ForegroundColor Cyan
$response = Invoke-WebRequest -Uri $uri -Method POST -ContentType "application/json" -Body $body -UseBasicParsing
$result = $response.Content | ConvertFrom-Json

if ($result.success) {
    Write-Host "✅ Utilisateur créé avec succès !" -ForegroundColor Green
    Write-Host "Token: $($result.token.substring(0, 20))..." -ForegroundColor Gray
} else {
    Write-Host "⚠️ Réponse: $($result.message)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Accès à l'app :" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Green
Write-Host "Backend: http://localhost:3001" -ForegroundColor Green
Write-Host ""
Write-Host "Identifiants :" -ForegroundColor Cyan
Write-Host "Email: admin@spofe.local" -ForegroundColor Green
Write-Host "Password: Password123!@" -ForegroundColor Green
