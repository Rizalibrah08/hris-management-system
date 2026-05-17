# HRIS Development Guide

Panduan development untuk menjalankan HRIS Web + Mobile secara lokal menggunakan XAMPP.

## Prasyarat

- [x] **XAMPP** — MySQL running di port 3306
- [x] **Node.js** v20+
- [x] **Expo Go** di HP (Play Store / App Store)
- [x] HP dan PC terhubung ke **WiFi yang sama**

## Setup Pertama Kali

### 1. Start MySQL

Buka XAMPP Control Panel → klik **Start** pada MySQL.

### 2. Install Dependencies

```bash
cd hris-web
npm install

cd ../hris-mobile/frontend
npm install
```

### 3. Setup Database

```bash
cd hris-web
npm run db:setup
```

Ini akan membuat database `hris_db`, tabel-tabel, dan data seed (user admin).

### 4. Jalankan

```bash
# Dari root project
start-dev.bat
```

Atau manual di 3 terminal terpisah:

```bash
# Terminal 1: Backend
cd hris-web && npm run dev:server

# Terminal 2: Web Frontend
cd hris-web && npm run dev

# Terminal 3: Mobile
cd hris-mobile/frontend && npx expo start
```

## Cara Akses

| Layanan | URL |
|---------|-----|
| Web Dashboard | http://localhost:5173 |
| Backend API | http://localhost:5000 |
| Mobile | Scan QR code di terminal Expo |

**Login:** NIK `ADM001` / Password `admin123`

## Koneksi Mobile ke Backend

Mobile app otomatis mendeteksi IP LAN PC melalui Expo `hostUri`. Tidak perlu konfigurasi manual.

**Syarat:**
- HP dan PC di WiFi yang sama
- Backend listen di `0.0.0.0:5000` (sudah default)

**Jika mobile tidak bisa konek:**
1. Pastikan HP & PC satu WiFi
2. Cek IP LAN di console backend (ditampilkan saat start)
3. Coba akses `http://<IP-PC>:5000/health` dari browser HP
4. Restart Expo (`npx expo start --clear`)

## Environment Variables

File `.env` di root project:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=hris_db
JWT_SECRET=your-secret-key
PORT=5000
```

## Scripts

| Script | Lokasi | Fungsi |
|--------|--------|--------|
| `npm run dev:server` | hris-web/ | Start backend (nodemon) |
| `npm run dev` | hris-web/ | Start Vite frontend |
| `npm run db:setup` | hris-web/ | Setup database |
| `npx expo start` | hris-mobile/frontend/ | Start Expo |
| `start-dev.bat` | root | Start semua sekaligus |

## Troubleshooting

### MySQL tidak konek
- Pastikan XAMPP MySQL sudah Start
- Cek port 3306 tidak dipakai aplikasi lain
- Password default XAMPP MySQL = kosong

### Mobile tidak konek ke backend
- HP & PC harus satu WiFi
- Cek firewall Windows tidak block port 5000
- Restart Expo: `npx expo start --clear`

### Port sudah dipakai
```bash
# Cek proses di port 5000
netstat -ano | findstr :5000
# Kill proses
taskkill /PID <PID> /F
```
