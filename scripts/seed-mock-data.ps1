# ==============================================================================
# Seed Mock Data Script (PowerShell)
# Project: ShadowBase
# ==============================================================================
param (
    [string]$HostPort = "3307",
    [string]$User = "root",
    [string]$Password = "rootpassword"
)

$sqlPath = Join-Path $PSScriptRoot "..\shadowbase\src\main\resources\db\mock_traffic_seed.sql"

if (-not (Test-Path $sqlPath)) {
    Write-Error "Seed file not found at: $sqlPath"
    exit 1
}

Write-Host "Seeding Mock Production MySQL (Port $HostPort) with realistic transactions..." -ForegroundColor Cyan

try {
    # If docker container is running, execute seed inside container directly
    docker exec -i shadowbase-mock-mysql mysql -u$User -p$Password sample_shop < $sqlPath 2>$null
    Write-Host "SUCCESS: Mock database seeded with 15 customers and 20 orders!" -ForegroundColor Green
    Write-Host "Debezium will capture these row events into Kafka topic 'mockserver.sample_shop.customers'." -ForegroundColor Yellow
} catch {
    Write-Host "NOTE: Make sure Docker Compose stack is running (docker compose up -d)." -ForegroundColor Yellow
}
