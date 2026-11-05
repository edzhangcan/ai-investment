@echo off
setlocal
title Restart Prism Loop Servers
cd /d "%~dp0"

call stop.bat
call start.bat
