# wait-for-redis.ps1
# Attendre que Redis soit disponible avant de continuer
# Usage: .\wait-for-redis.ps1 -Host 127.0.0.1 -Port 6379 -Timeout 60

param(
    [string]$Host = "127.0.0.1",
    [int]$Port = 6379,
    [int]$Timeout = 60
)

Write-Host "⏳ Attente Redis ($Host`:$Port, max ${Timeout}s)..." -ForegroundColor Yellow

$timeout_counter = $Timeout
$start_time = Get-Date

while ($true) {
    try {
        $socket = New-Object System.Net.Sockets.TcpClient
        $socket.Connect($Host, $Port)
        $socket.Close()
        
        Write-Host "✅ Redis prêt ! ($Host`:$Port)" -ForegroundColor Green
        exit 0
    }
    catch {
        if ($timeout_counter -le 0) {
            Write-Host "❌ Redis non disponible après ${Timeout}s" -ForegroundColor Red
            exit 1
        }
        
        Write-Host "⏳ Redis non encore prêt, attente 2s... (${timeout_counter}s restantes)" -ForegroundColor Yellow
        Start-Sleep -Seconds 2
        $timeout_counter -= 2
    }
}
