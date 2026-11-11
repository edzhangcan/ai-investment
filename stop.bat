@echo off
setlocal
title Stop Prism Loop Servers
cd /d "%~dp0"

echo ==============================================================================
echo                 Prism Loop Workstation - Stopping Servers...
echo ==============================================================================
echo.

taskkill /fi "WINDOWTITLE eq Prism Loop Backend*" /f /t >nul 2>&1
taskkill /fi "WINDOWTITLE eq Prism Loop Frontend*" /f /t >nul 2>&1
taskkill /fi "WINDOWTITLE eq AI Investment Backend*" /f /t >nul 2>&1
taskkill /fi "WINDOWTITLE eq AI Investment Frontend*" /f /t >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000 ^| findstr LISTENING') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') do taskkill /f /pid %%a >nul 2>&1

echo [OK] All localhost servers (ports 8000 and 3000) have been stopped.
timeout /t 2 /nobreak >nul
