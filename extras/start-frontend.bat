@echo off
REM Start the React Frontend Development Server

echo.
echo ========================================
echo Starting React Frontend...
echo ========================================
echo.

cd /d "%~dp0react-frontend"

REM Check if Node is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo Error: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    exit /b 1
)

REM Install dependencies if needed
if not exist "node_modules" (
    echo Installing Node dependencies...
    call npm install
)

REM Start the development server
echo.
echo Starting development server on http://localhost:5173
echo Press Ctrl+C to stop the server
echo.

call npm run dev

pause
