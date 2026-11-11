@echo off
setlocal
title Prism Loop Workstation Launcher
cd /d "%~dp0"

echo ==============================================================================
echo                 Prism Loop Workstation - Launching Localhost...
echo ==============================================================================
echo.

:: Check if installation has been performed
if not exist "backend\venv\Scripts\python.exe" (
    echo [X] Python virtual environment not found at backend\venv\Scripts\python.exe.
    echo     Please run "install.bat" first to complete initial setup.
    echo.
    pause
    exit /b 1
)

if not exist "frontend\node_modules" (
    echo [X] Frontend dependencies not found at frontend\node_modules.
    echo     Please run "install.bat" first to complete initial setup.
    echo.
    pause
    exit /b 1
)

echo [*] Clearing any stale processes on ports 8000 and 3000...
taskkill /fi "WINDOWTITLE eq Prism Loop Backend*" /f /t >nul 2>&1
taskkill /fi "WINDOWTITLE eq Prism Loop Frontend*" /f /t >nul 2>&1
taskkill /fi "WINDOWTITLE eq AI Investment Backend*" /f /t >nul 2>&1
taskkill /fi "WINDOWTITLE eq AI Investment Frontend*" /f /t >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000 ^| findstr LISTENING') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') do taskkill /f /pid %%a >nul 2>&1

echo [*] Starting Backend API Server on http://localhost:8000 ...
set PYTHONPATH=.
start "Prism Loop Backend" /min cmd /c "backend\venv\Scripts\python.exe -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload"

echo [*] Starting Frontend Web Dashboard on http://localhost:3000 ...
cd frontend
start "Prism Loop Frontend" /min cmd /c "npm run dev"
cd ..

echo [*] Waiting for services to initialize...
timeout /t 3 /nobreak >nul

echo [*] Opening Prism Loop in your default web browser...
start http://localhost:3000

echo.
echo ==============================================================================
echo   Prism Loop is now running!
echo   - Web Dashboard: http://localhost:3000
echo   - Backend API:   http://localhost:8000
echo   - API Docs:      http://localhost:8000/docs
echo ==============================================================================
echo.
echo Leave this window open while using the application.
echo Press any key to stop all servers and exit...
pause >nul

echo.
echo [*] Stopping all Prism Loop servers...
taskkill /fi "WINDOWTITLE eq Prism Loop Backend*" /f /t >nul 2>&1
taskkill /fi "WINDOWTITLE eq Prism Loop Frontend*" /f /t >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000 ^| findstr LISTENING') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') do taskkill /f /pid %%a >nul 2>&1
echo [OK] Servers stopped successfully.
timeout /t 2 /nobreak >nul
