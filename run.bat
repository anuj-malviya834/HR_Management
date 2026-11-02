@echo off
setlocal
cd /d "%~dp0"

set LAUNCH_DELAY_SECONDS=3
set BACKEND_HOST_PORT=127.0.0.1:8000
set FRONTEND_URL=http://localhost:5173/

title HR Management System - Launcher

start "HR Backend Server (Django)" /min cmd /c "backend\venv\Scripts\python.exe backend\manage.py runserver %BACKEND_HOST_PORT%"
start "HR Frontend Server (Vite React)" /min cmd /c "npm --prefix frontend run dev"

timeout /t %LAUNCH_DELAY_SECONDS% /nobreak >nul
start %FRONTEND_URL%

echo ========================================================
echo HR Management System is running!
echo Backend:  http://%BACKEND_HOST_PORT%/
echo Frontend: %FRONTEND_URL%
echo ========================================================
echo Press any key to stop all servers and exit.
pause >nul

taskkill /fi "WINDOWTITLE eq HR Backend Server (Django)*" /f /t >nul 2>&1
taskkill /fi "WINDOWTITLE eq HR Frontend Server (Vite React)*" /f /t >nul 2>&1

endlocal
