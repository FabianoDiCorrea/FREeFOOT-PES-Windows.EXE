@echo off
setlocal

REM FreeFoot Web launcher
set "PROJECT_DIR=%~dp0"

start "FreeFoot Vite Dev Server" cmd /k "cd /d "%PROJECT_DIR%" && npm run dev -- --host --port 5173"

REM Pequena espera para o servidor iniciar
timeout /t 3 /nobreak >nul

start "" "http://localhost:5173/"

endlocal
