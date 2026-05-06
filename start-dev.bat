@echo off
chcp 65001 >nul
echo ================================================
echo   HRIS Development Server Launcher
echo ================================================
echo.
echo  This script will start:
echo   1. Backend API (Node.js + Express)
echo   2. ngrok tunnel (for mobile access)
echo   3. Expo Mobile App
echo.
echo  Make sure you have:
echo   - ngrok installed: npm install -g ngrok
echo   - ngrok authtoken configured
echo   - MySQL running
echo.
pause
echo.

:: Check if ngrok is installed
where ngrok >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] ngrok not found!
    echo Please install ngrok first:
    echo   npm install -g ngrok
    echo   ngrok config add-authtoken YOUR_TOKEN
    echo.
    echo Get your token from: https://dashboard.ngrok.com
    pause
    exit /b 1
)

echo [✓] ngrok found
echo.

:: Terminal 1: Backend API
echo [1/4] Starting Backend API...
echo     Location: D:\WEB HRIS\hris-web
echo     Command: npm run dev:server
echo.
start "HRIS Backend API" cmd /k "cd /d D:\WEB HRIS\hris-web && echo Starting Backend API... && npm run dev:server"

:: Wait for backend to start
timeout /t 5 /nobreak >nul

:: Terminal 2: ngrok
echo [2/4] Starting ngrok tunnel...
echo     Command: ngrok http 5000
echo.
echo     IMPORTANT: Copy the https:// URL from ngrok window
echo     and update NGROK_URL in mobile/services/api.js
echo.
start "ngrok Tunnel" cmd /k "cd /d D:\WEB HRIS\hris-web && echo Starting ngrok... && echo. && echo Copy the https:// URL below and update mobile/services/api.js && echo. && ngrok http 5000"

:: Wait for ngrok to start
timeout /t 3 /nobreak >nul

:: Terminal 3: Web Frontend (optional)
echo [3/4] Starting Web Frontend...
echo     Location: D:\WEB HRIS\hris-web
echo     Command: npm run dev
echo.
start "HRIS Web Frontend" cmd /k "cd /d D:\WEB HRIS\hris-web && echo Starting Web Frontend... && npm run dev"

:: Wait for web to start
timeout /t 3 /nobreak >nul

:: Terminal 4: Expo Mobile
echo [4/4] Starting Expo Mobile App...
echo     Location: D:\WEB HRIS\hris-mobile\frontend
echo     Command: npx expo start
echo.
start "Expo Mobile" cmd /k "cd /d D:\WEB HRIS\hris-mobile\frontend && echo Starting Expo... && npx expo start"

echo.
echo ================================================
echo   All servers started!
echo ================================================
echo.
echo  Next steps:
echo   1. Copy ngrok https:// URL from ngrok window
echo   2. Open mobile/services/api.js
echo   3. Replace YOUR_NGROK_URL_HERE with your URL
echo   4. Scan QR code in Expo window with Expo Go app
echo.
echo  Default login (if using seed data):
echo   NIK: ADM001
echo   Password: admin123
echo.
pause
