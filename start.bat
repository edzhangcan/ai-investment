@echo off
setlocal

echo ==============================================================================
echo                 AI Investment Workstation - Launching...
echo ==============================================================================
echo.

:: Check if installation has been performed
if not exist "backend\venv\Scripts\python.exe" (
    echo [X] Python virtual environment not found.
    echo     Please double-click "install.bat" first to complete initial setup.
    echo.
    pause
    exit /b 1
)

if not exist "frontend\node_modules" (
    echo [X] Frontend dependencies not found.
    echo     Please double-click "install.bat" first to complete initial setup.
    echo.
    pause
    exit /b 1
)

echo [*] Starting Backend API Server on http://localhost:8000 ...
set PYTHONPATH=.
start "AI Investment Backend" /min cmd /c "backend\venv\Scripts\python backend/main.py"

echo [*] Starting Frontend Web Dashboard on http://localhost:3000 ...
cd frontend
start "AI Investment Frontend" /min cmd /c "npm run dev"
cd ..

echo [*] Opening application in your web browser...
timeout /t 3 /nobreak >nul
start http://localhost:3000

echo.
echo ==============================================================================
echo   Application is now running!
echo   - Web Dashboard: http://localhost:3000
echo   - Backend API:   http://localhost:8000
echo ==============================================================================
echo.
echo Press any key to stop all servers and exit...
pause >nul

echo [*] Stopping servers...
taskkill /fi "WINDOWTITLE eq AI Investment Backend*" /f /t >nul 2>&1
taskkill /fi "WINDOWTITLE eq AI Investment Frontend*" /f /t >nul 2>&1
echo [OK] Servers stopped.
