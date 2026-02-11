@echo off
REM Start both the Flask API Backend and React Frontend

echo.
echo ========================================
echo Employee Brand Perception Analytics
echo Starting Backend and Frontend...
echo ========================================
echo.

setlocal enabledelayedexpansion

cd /d "%~dp0"

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python is not installed or not in PATH
    echo Please install Python from https://www.python.org/
    exit /b 1
)

REM Check if Node is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo Error: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    exit /b 1
)

REM Install backend requirements if needed
python -c "import flask" >nul 2>&1
if errorlevel 1 (
    echo Installing Python requirements...
    pip install -r requirements-api.txt
)

REM Install frontend dependencies if needed
if not exist "react-frontend\node_modules" (
    echo Installing Node dependencies...
    cd react-frontend
    call npm install
    cd ..
)

REM Start the Flask API in a new window
echo.
echo Starting Flask API on port 5000...
start "API Server" cmd /k "python api_server.py"

REM Wait a moment for API to start
timeout /t 2 /nobreak

REM Start the React frontend in a new window
echo Starting React frontend on port 5173...
start "React Frontend" cmd /k "cd react-frontend && npm run dev"

echo.
echo ========================================
echo Both servers are starting!
echo ========================================
echo.
echo API:      http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo Press any key to close this window...
echo (The servers will continue running in separate windows)
pause >nul
