@echo off
setlocal enabledelayedexpansion

echo ==============================================================================
echo               AI Investment Workstation - 1-Click Installer
echo ==============================================================================
echo.

:: 1. Check Python installation
echo [*] Checking Python installation...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo [X] Error: Python is not installed or not found in system PATH.
    echo     Please download and install Python 3.11+ from: https://www.python.org/downloads/
    echo     Make sure to check "Add Python to PATH" during installation.
    echo.
    pause
    exit /b 1
)
python --version

:: 2. Check Node.js installation
echo.
echo [*] Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo [X] Error: Node.js is not installed or not found in system PATH.
    echo     Please download and install Node.js 18+ from: https://nodejs.org/
    echo.
    pause
    exit /b 1
)
node --version

:: 3. Setup Python virtual environment
echo.
echo [*] Setting up Python virtual environment in backend/venv...
if not exist "backend\venv" (
    python -m venv backend\venv
)

echo [*] Installing backend Python packages (FastAPI, SQLModel, Uvicorn)...
call backend\venv\Scripts\pip install --upgrade pip >nul 2>&1
call backend\venv\Scripts\pip install -r backend\requirements.txt
if %errorlevel% neq 0 (
    echo [X] Failed to install backend dependencies. Please check network connection.
    pause
    exit /b 1
)

:: 4. Setup Frontend npm packages
echo.
echo [*] Installing frontend Node.js packages...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo [X] Failed to install frontend dependencies.
    cd ..
    pause
    exit /b 1
)
cd ..

echo.
echo ==============================================================================
echo                     Installation Completed Successfully!
echo ==============================================================================
echo.
echo To launch the application anytime, simply double-click: start.bat
echo.
pause
