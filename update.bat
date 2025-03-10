@echo off
cd C:\BlackBox
git pull origin master
pm2 kill
pm2 start server.js --name BlackBox
echo Update completed!
