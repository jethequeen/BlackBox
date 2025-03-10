@echo off
cd C:\BlackBox
echo --- Update started on %DATE% at %TIME% --- > C:\BlackBox\update_log.txt

:: Run Git Pull and Log Output
git pull origin master >> C:\BlackBox\update_log.txt 2>&1
echo Git Pull Completed. >> C:\BlackBox\update_log.txt

:: Check if PM2 is accessible
where pm2 >> C:\BlackBox\update_log.txt 2>&1

:: Debug if PM2 is running
pm2 list >> C:\BlackBox\update_log.txt 2>&1

:: Check if BlackBox process exists before deleting
pm2 describe BlackBox >> C:\BlackBox\update_log.txt 2>&1
IF %ERRORLEVEL% EQU 0 (
    pm2 delete BlackBox >> C:\BlackBox\update_log.txt 2>&1
)

:: Add a short delay before restarting
timeout /t 3 /nobreak >> C:\BlackBox\update_log.txt 2>&1

:: Start the server and log the output
pm2 start server.js --name BlackBox >> C:\BlackBox\update_log.txt 2>&1
echo PM2 Start Completed. >> C:\BlackBox\update_log.txt

echo --- Update completed successfully on %DATE% at %TIME% --- >> C:\BlackBox\update_log.txt
