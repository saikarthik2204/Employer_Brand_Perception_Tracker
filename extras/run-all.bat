@echo off
setlocal enabledelayedexpansion

echo ========================================
echo Starting Employee Brand Perception Dashboard
echo ========================================
echo.

echo [1/2] Starting Backend API on port 5000...
start "Backend API" cmd /k python api_server.py

echo [2/2] Waiting 3 seconds then starting Frontend...
timeout /t 3 /nobreak

cd react-frontend
echo Starting Frontend on port 3000...
start "Frontend" cmd /k npm run dev

echo.
echo ========================================
echo Both services are starting!
echo ========================================
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3000
echo ========================================
echo Dashboard will open automatically in a moment...
timeout /t 5 /nobreak

start http://localhost:3000

echo.
echo To stop services, close the opened windows
pause
