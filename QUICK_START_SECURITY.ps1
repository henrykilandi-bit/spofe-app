# 🚀 QUICK START - CSRF & REDIS RATE LIMITING (PowerShell pour Windows)
# Exécuter dans PowerShell

function Show-Header($title) {
    Write-Host ""
    Write-Host "╔" + ("═" * 65) + "╗" -ForegroundColor Cyan
    Write-Host "║  $title" -ForegroundColor Cyan
    Write-Host "╚" + ("═" * 65) + "╝" -ForegroundColor Cyan
    Write-Host ""
}

function Show-Section($title) {
    Write-Host ""
    Write-Host $title -ForegroundColor Yellow
    Write-Host ("─" * 70) -ForegroundColor Yellow
}

function Show-Command($cmd, $description) {
    Write-Host ""
    Write-Host $description -ForegroundColor Green
    Write-Host $cmd -ForegroundColor Cyan
}

# ═══════════════════════════════════════════════════════════════════════

Show-Header "✅ CSRF & REDIS RATE LIMITING - QUICK START"

# ═══════════════════════════════════════════════════════════════════════

Show-Section "📋 ÉTAPE 1: Vérifier la configuration"

Write-Host "✓ Vérifier CSRF_SECRET dans .env:" -ForegroundColor Green
$csrfSecret = Select-String -Path "cascade\.env" -Pattern "CSRF_SECRET"
Write-Host $csrfSecret -ForegroundColor Blue

Write-Host ""
Write-Host "✓ Vérifier REDIS_ENABLED dans .env:" -ForegroundColor Green
$redisEnabled = Select-String -Path "cascade\.env" -Pattern "REDIS_ENABLED"
Write-Host $redisEnabled -ForegroundColor Blue

# ═══════════════════════════════════════════════════════════════════════

Show-Section "🧪 ÉTAPE 2: Exécuter tests automatisés"

Write-Host "✓ Lancer le script de validation:" -ForegroundColor Green
Write-Host "   cd cascade" -ForegroundColor Cyan
Write-Host "   node test-security-implementations.js" -ForegroundColor Cyan

Write-Host ""
Write-Host "Appuyez sur ENTER pour exécuter les tests..." -ForegroundColor Yellow
Read-Host

try {
    Push-Location "cascade"
    node test-security-implementations.js
    Pop-Location
} catch {
    Write-Host "Erreur lors de l'exécution des tests: $_" -ForegroundColor Red
    Pop-Location
}

# ═══════════════════════════════════════════════════════════════════════

Show-Section "🚀 ÉTAPE 3: Démarrer l'application"

Write-Host "✓ Démarrer en mode développement:" -ForegroundColor Green
Write-Host "   cd cascade && npm run dev" -ForegroundColor Cyan

Write-Host ""
Write-Host "Attendre le message:" -ForegroundColor Yellow
Write-Host "   ✅ Server running on http://localhost:3001" -ForegroundColor Green

Write-Host ""
Write-Host "Appuyez sur ENTER quand l'application est prête..." -ForegroundColor Yellow
$appReady = Read-Host

# ═══════════════════════════════════════════════════════════════════════

Show-Section "🧪 ÉTAPE 4: Tests manuels"

Write-Host ""
Write-Host "TEST 1: CSRF Token Retrieval" -ForegroundColor Green
Show-Command 'curl -X GET http://localhost:3001/api/csrf-token' "Exécuter:"

Write-Host ""
Write-Host "Réponse attendue:" -ForegroundColor Cyan
Write-Host '{
  "csrfToken": "..."
}' -ForegroundColor Blue

# ═══════════════════════════════════════════════════════════════════════

Write-Host ""
Write-Host "TEST 2: Rate Limiting - Login (5 max par 15 min)" -ForegroundColor Green
Show-Command '$TOKEN=$(curl -s http://localhost:3001/api/csrf-token | jq -r .csrfToken); 
for ($i=1; $i -le 10; $i++) {
  curl -X POST http://localhost:3001/api/auth/login `
    -H "Content-Type: application/json" `
    -d "{\"email\":\"test@test.com\",\"password\":\"123\"}"
  Write-Host "Requête $i" -ForegroundColor Yellow
  Start-Sleep -Seconds 1
}' "Script PowerShell:"

Write-Host ""
Write-Host "Résultat attendu:" -ForegroundColor Cyan
Write-Host "  • Requêtes 1-5: HTTP 200 ou 401 (auth fail OK)" -ForegroundColor Blue
Write-Host "  • Requête 6-10: HTTP 429 Too Many Requests" -ForegroundColor Blue

# ═══════════════════════════════════════════════════════════════════════

Write-Host ""
Write-Host "TEST 3: Rate Limiting - API (100 max par 15 min)" -ForegroundColor Green
Show-Command 'for ($i=1; $i -le 120; $i++) {
  curl -s http://localhost:3001/api/health | Out-Null
  if ($i % 20 -eq 0) { Write-Host "Requête $i" }
}' "Script PowerShell:"

Write-Host ""
Write-Host "Résultat attendu:" -ForegroundColor Cyan
Write-Host "  • Requêtes 1-100: HTTP 200 OK" -ForegroundColor Blue
Write-Host "  • Requête 101-120: HTTP 429 Too Many Requests" -ForegroundColor Blue

# ═══════════════════════════════════════════════════════════════════════

Show-Section "📊 ÉTAPE 5: Vérifier les logs"

Write-Host "✓ Logs de sécurité:" -ForegroundColor Green
Write-Host "   tail -f cascade/logs/security.log" -ForegroundColor Cyan

Write-Host ""
Write-Host "✓ Logs généraux:" -ForegroundColor Green
Write-Host "   tail -f cascade/logs/combined.log" -ForegroundColor Cyan

# ═══════════════════════════════════════════════════════════════════════

Show-Section "🔴 REDIS (Optionnel)"

Write-Host "✓ Installer Redis avec Docker:" -ForegroundColor Green
Write-Host "   docker run -d -p 6379:6379 --name redis redis:7-alpine" -ForegroundColor Cyan

Write-Host ""
Write-Host "✓ Vérifier Redis:" -ForegroundColor Green
Write-Host "   redis-cli PING" -ForegroundColor Cyan
Write-Host "   # Doit retourner: PONG" -ForegroundColor Yellow

Write-Host ""
Write-Host "✓ Monitorer rate limiting:" -ForegroundColor Green
Write-Host "   redis-cli KEYS 'ratelimit:*'" -ForegroundColor Cyan
Write-Host "   redis-cli GET 'ratelimit:login:127.0.0.1'" -ForegroundColor Cyan
Write-Host "   redis-cli TTL 'ratelimit:login:127.0.0.1'" -ForegroundColor Cyan

# ═══════════════════════════════════════════════════════════════════════

Show-Section "✅ Checklist post-implémentation"

$checklist = @(
    "Tous les tests passent (27/28 ou plus)",
    "Serveur démarre sans erreurs CRITICAL",
    "GET /api/csrf-token répond avec un token",
    "Rate limiting rejette après 5 logins / 100 API calls",
    "Aucun error CRITICAL dans logs/security.log",
    "Headers X-RateLimit-* présents dans réponses"
)

foreach ($item in $checklist) {
    Write-Host "  ☐ $item" -ForegroundColor Cyan
}

# ═══════════════════════════════════════════════════════════════════════

Write-Host ""
Write-Host "╔" + ("═" * 65) + "╗" -ForegroundColor Green
Write-Host "║  ✨ Implémentation complétée avec succès!                ║" -ForegroundColor Green
Write-Host "║                                                          ║" -ForegroundColor Green
Write-Host "║  Prochaine étape: JWT KID Rotation (voir docs)           ║" -ForegroundColor Green
Write-Host "╚" + ("═" * 65) + "╝" -ForegroundColor Green

Write-Host ""
Write-Host "Documentation complète:" -ForegroundColor Yellow
Write-Host "  • SECURITY_ANALYSIS_REPORT_FR.md" -ForegroundColor Cyan
Write-Host "  • SECURITY_DEPLOYMENT_REPORT.md" -ForegroundColor Cyan
Write-Host "  • SECURITY_IMPLEMENTATION_SUMMARY.txt" -ForegroundColor Cyan
Write-Host ""
