@echo off
cd C:\BlackBox
git pull origin master
npm install
pm2 delete BlackBox
pm2 start server.js --name BlackBox
echo Update completed!
