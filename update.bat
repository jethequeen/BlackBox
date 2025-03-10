@echo off
cd C:\BlackBox
git pull origin master

:: Check if the process exists before deleting
pm2 describe BlackBox >nul 2>&1
IF %ERRORLEVEL% EQU 0 (
    pm2 delete BlackBox
)

pm2 start server.js --name BlackBox
echo Update completed!
