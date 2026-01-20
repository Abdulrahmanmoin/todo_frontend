@echo off
echo Installing dependencies for frontend... > install_log.txt
npm install --no-audit --no-fund --no-progress >> install_log.txt 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo npm install failed with error %ERRORLEVEL% >> install_log.txt
    exit /b %ERRORLEVEL%
)
echo Installation successful. >> install_log.txt
