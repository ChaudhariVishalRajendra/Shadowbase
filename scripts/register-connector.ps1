# ==============================================================================
# Debezium MySQL Connector Registration Script (PowerShell)
# Project: ShadowBase
# ==============================================================================
param (
    [string]$DebeziumUrl = "http://localhost:8083"
)

$jsonPath = Join-Path $PSScriptRoot "..\shadowbase\src\main\resources\debezium\mysql-connector.json"

if (-not (Test-Path $jsonPath)) {
    Write-Error "Connector configuration file not found at: $jsonPath"
    exit 1
}

$body = Get-Content -Raw -Path $jsonPath

Write-Host "Registering Debezium MySQL Connector with cluster at: $DebeziumUrl/connectors" -ForegroundColor Cyan

try {
    $response = Invoke-RestMethod -Uri "$DebeziumUrl/connectors" -Method Post -Body $body -ContentType "application/json"
    Write-Host "SUCCESS: Connector registered successfully!" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 5
} catch {
    Write-Host "NOTE: If connector already exists or cluster is initializing, response: $($_.Exception.Message)" -ForegroundColor Yellow
}
