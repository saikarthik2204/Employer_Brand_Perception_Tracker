@echo off
REM Start the Flask API Backend

echo.
echo ========================================
echo Starting Flask API Backend...
echo ========================================
echo.

cd /d "%~dp0"

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python is not installed or not in PATH
    echo Please install Python from https://www.python.org/
    exit /b 1
)

REM Check if requirements are installed
python -c "import flask" >nul 2>&1
if errorlevel 1 (
    echo Installing requirements...
    pip install -r requirements-api.txt
)

REM Start the API server
echo.
echo Starting API server on http://localhost:5000
echo Press Ctrl+C to stop the server
echo.

python api_server.py

pause
