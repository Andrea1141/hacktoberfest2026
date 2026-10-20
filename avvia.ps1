# Script di avvio rapido per PowerShell
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "          GLUCO - Digital Twin Metabolico" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""

$root = $PSScriptRoot

Write-Host "Avvio backend FastAPI..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\backend'; .\.venv\Scripts\Activate.ps1; python -m uvicorn main:app --port 8000"

Write-Host "Avvio frontend React..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\frontend'; npm run dev"

Start-Sleep -Seconds 3

Write-Host "Apertura dell'applicazione nel browser..." -ForegroundColor Green
Start-Process "http://localhost:5173"

Write-Host ""
Write-Host "Gluco e pronto all'uso!" -ForegroundColor Green
Write-Host "Frontend: http://localhost:5173"
Write-Host "Backend Docs: http://localhost:8000/docs"
