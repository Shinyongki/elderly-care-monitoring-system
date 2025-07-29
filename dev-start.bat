@echo off
echo Starting Elderly Care Monitoring System...
echo.
echo Killing existing Node processes...
taskkill /f /im node.exe >nul 2>&1
timeout /t 2 >nul

echo Starting development server on port 8080...
cd /d "%~dp0"
start "Dev Server" cmd /k "npm run dev"

echo.
echo Server starting... Please wait a moment and then open:
echo http://localhost:8080
echo.
pause