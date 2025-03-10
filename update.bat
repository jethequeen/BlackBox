@echo off
cd C:\BlackBox
git pull origin master


:: Check if BlackBox is running
pm2 describe BlackBox >nul 2>&1
IF %ERRORLEVEL% EQU 0 (
    pm2 delete BlackBox
)

:: Add a short delay before restarting
timeout /t 3 /nobreak >nul

:: Start the server
pm2 start server.js --name BlackBox
echo Update completed!
