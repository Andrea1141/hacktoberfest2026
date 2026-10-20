@echo off
title Gluco - Avvio Sistema
echo ===================================================
echo           GLUCO - Digital Twin Metabolico
echo ===================================================
echo.
echo Avvio del backend FastAPI (porta 8000)...
start "Gluco Backend" cmd /c "cd /d ""%~dp0backend"" && call .venv\Scripts\activate.bat && python -m uvicorn main:app --port 8000"

echo Avvio del frontend React (porta 5173)...
start "Gluco Frontend" cmd /c "cd /d ""%~dp0frontend"" && npm run dev"

echo.
echo In attesa dell'avvio dei servizi...
timeout /t 3 /nobreak >nul

echo Apertura applicazione nel browser...
start http://localhost:5173

echo.
echo ===================================================
echo  Tutti i servizi sono avviati!
echo  - Frontend Web: http://localhost:5173
echo  - Backend API:  http://localhost:8000/docs
echo ===================================================
echo Premi un tasto per chiudere questo launcher.
pause >nul
