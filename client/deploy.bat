@echo off
call npm run build
scp -r ./build/* root@143.198.236.191:/var/www/ecsales.work/html
ssh root@143.198.236.191 "chown -R www-data:www-data /var/www/ecsales.work/html"
pause