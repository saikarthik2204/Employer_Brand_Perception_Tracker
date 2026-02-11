# Start both backend and frontend in parallel

Write-Host "Starting Backend API..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; python api_server.py"

Start-Sleep -Seconds 3

Write-Host "Starting Frontend..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\react-frontend'; npm run dev"

Write-Host "`nBoth services starting..." -ForegroundColor Cyan
Write-Host "Backend: http://localhost:5000" -ForegroundColor Yellow
Write-Host "Frontend: http://localhost:3004" -ForegroundColor Yellow
Write-Host "Open browser to http://localhost:3004" -ForegroundColor Yellow
