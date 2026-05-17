@echo off
chcp 65001 >nul
echo ================================================
echo   HRIS Development Server (XAMPP)
echo ================================================
echo.

:: Detect LAN IP
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
    set "LAN_IP=%%a"
    goto :found_ip
)
:found_ip
set "LAN_IP=%LAN_IP: =%"

echo  IP LAN Anda: %LAN_IP%
echo.
echo  Pastikan sebelum mulai:
echo   - XAMPP MySQL sudah running
echo   - HP dan PC terhubung ke WiFi yang sama
echo.
pause
echo.

:: Check MySQL connection
echo [*] Mengecek koneksi MySQL...
mysql -u root -e "SELECT 1" >nul 2>nul
if %errorlevel% neq 0 (
    echo [!] MySQL tidak terdeteksi. Pastikan XAMPP MySQL sudah START.
    echo     Buka XAMPP Control Panel ^> Start MySQL
    pause
    exit /b 1
)
echo [OK] MySQL connected
echo.

:: Terminal 1: Backend API
echo [1/3] Starting Backend API (port 5000)...
start "HRIS Backend" cmd /k "cd /d "%~dp0hris-web" && echo === Backend API === && echo URL: http://localhost:5000 && echo LAN: http://%LAN_IP%:5000 && echo. && npm run dev:server"

timeout /t 3 /nobreak >nul

:: Terminal 2: Web Frontend
echo [2/3] Starting Web Frontend (port 5173)...
start "HRIS Web" cmd /k "cd /d "%~dp0hris-web" && echo === Web Frontend === && echo URL: http://localhost:5173 && echo LAN: http://%LAN_IP%:5173 && echo. && npm run dev"

timeout /t 2 /nobreak >nul

:: Terminal 3: Expo Mobile
echo [3/3] Starting Expo Mobile...
start "HRIS Mobile" cmd /k "cd /d "%~dp0hris-mobile\frontend" && echo === Expo Mobile === && echo Mobile akan auto-detect backend di: http://%LAN_IP%:5000 && echo. && npx expo start"

echo.
echo ================================================
echo   Semua server started!
echo ================================================
echo.
echo  Akses:
echo   Web:     http://localhost:5173
echo   API:     http://localhost:5000
echo   Mobile:  Scan QR di Expo window (HP satu WiFi)
echo.
echo  Login default:
echo   NIK: ADM001 / Password: admin123
echo.
echo  Mobile otomatis konek ke backend via LAN IP.
echo  Tidak perlu ngrok!
echo.
pause
