Set-Location -Path $PSScriptRoot

$launchDelaySeconds = 3
$backendHostPort = "127.0.0.1:8000"
$frontendUrl = "http://localhost:5173/"

$backendProcess = Start-Process -FilePath "backend\venv\Scripts\python.exe" -ArgumentList "backend\manage.py runserver $backendHostPort" -WindowStyle Hidden -PassThru
$frontendProcess = Start-Process -FilePath "cmd.exe" -ArgumentList "/c npm --prefix frontend run dev" -WindowStyle Hidden -PassThru

Start-Sleep -Seconds $launchDelaySeconds
Start-Process $frontendUrl

Write-Host "========================================================"
Write-Host "HR Management System is running!"
Write-Host "Backend:  http://$backendHostPort/"
Write-Host "Frontend: $frontendUrl"
Write-Host "========================================================"
Write-Host "Press Enter to stop all servers and exit..."
$userInput = Read-Host

Stop-Process -Id $backendProcess.Id -Force -ErrorAction SilentlyContinue
Stop-Process -Id $frontendProcess.Id -Force -ErrorAction SilentlyContinue
