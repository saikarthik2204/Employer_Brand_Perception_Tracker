@echo off
REM Start full pipeline: run NLP scripts, then open API and frontend in new windows

cd /d "%~dp0"

echo ==================================================
echo Employee Brand Perception Analytics - Full Start
echo ==================================================

echo Running NLP pipeline (filter -> preprocess -> sentiment -> drift detection)...
python -u nlp\employee_filter.py
if errorlevel 1 goto :err
python -u nlp\preprocess.py
if errorlevel 1 goto :err
python -u nlp\sentiment.py
if errorlevel 1 goto :err
python -u nlp\drift_detection.py
if errorlevel 1 goto :err

echo NLP pipeline completed successfully.

echo Starting Flask API in a new window...
start "API Server" cmd /k "python api_server.py"

timeout /t 2 /nobreak >nul

echo Starting React frontend in a new window (port 5173)...
start "React Frontend" cmd /k "cd react-frontend && npm run dev -- --port 5173"

echo All services are starting. Separate windows were opened for API and frontend.
echo Press any key to close this launcher window (services keep running in separate windows).
pause >nul
exit /b 0

:err
echo Error: One of the NLP scripts failed. See the output above.
pause >nul
exit /b 1
