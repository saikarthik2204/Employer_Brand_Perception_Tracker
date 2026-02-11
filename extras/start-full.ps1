# Start-full.ps1
# PowerShell startup script: runs NLP pipeline then launches API and frontend in separate PowerShell windows

Set-StrictMode -Version Latest

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $ScriptDir

Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "Employee Brand Perception Analytics - Full Start" -ForegroundColor Cyan
Write-Host "===============================================`n" -ForegroundColor Cyan

Write-Host "Running NLP pipeline (filter -> preprocess -> sentiment -> drift detection)..."
& python -u "$PSScriptRoot\nlp\employee_filter.py"
if ($LASTEXITCODE -ne 0) { Write-Error "employee_filter.py failed"; exit 1 }
& python -u "$PSScriptRoot\nlp\preprocess.py"
if ($LASTEXITCODE -ne 0) { Write-Error "preprocess.py failed"; exit 1 }
& python -u "$PSScriptRoot\nlp\sentiment.py"
if ($LASTEXITCODE -ne 0) { Write-Error "sentiment.py failed"; exit 1 }
& python -u "$PSScriptRoot\nlp\drift_detection.py"
if ($LASTEXITCODE -ne 0) { Write-Error "drift_detection.py failed"; exit 1 }

Write-Host "NLP pipeline completed successfully.`n" -ForegroundColor Green

Write-Host "Starting Flask API in a new PowerShell window..."
Start-Process -FilePath powershell -ArgumentList "-NoExit","-Command","cd '$PSScriptRoot'; python api_server.py" -WindowStyle Normal
Start-Sleep -Seconds 2

Write-Host "Starting React frontend in a new PowerShell window (port 5173)..."
Start-Process -FilePath powershell -ArgumentList "-NoExit","-Command","cd '$PSScriptRoot\react-frontend'; npm run dev -- --port 5173" -WindowStyle Normal

Write-Host "All services are starting. Two new PowerShell windows were opened for API and frontend." -ForegroundColor Green
