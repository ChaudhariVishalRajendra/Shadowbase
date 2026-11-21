# ==============================================================================
# Kafka Topics Verification Script (PowerShell)
# Project: ShadowBase
# ==============================================================================
Write-Host "Verifying Kafka Topics inside 'shadowbase-kafka' container..." -ForegroundColor Cyan

try {
    $topics = docker exec shadowbase-kafka kafka-topics --bootstrap-server localhost:9092 --list 2>$null

    if ($topics) {
        Write-Host "SUCCESS: Active Kafka Topics found:" -ForegroundColor Green
        $topics | ForEach-Object { Write-Host "  - $_" -ForegroundColor Yellow }
    } else {
        Write-Host "No custom topics created yet. Expected once Debezium connector streams events:" -ForegroundColor DarkGray
        Write-Host "  - mockserver.sample_shop.customers" -ForegroundColor Gray
        Write-Host "  - mockserver.sample_shop.orders" -ForegroundColor Gray
        Write-Host "  - schema-changes.sample_shop" -ForegroundColor Gray
    }
} catch {
    Write-Host "Docker daemon or Kafka container not currently running." -ForegroundColor Yellow
}
