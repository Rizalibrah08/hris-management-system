# HRIS - Human Resource Information System

Sistem HRIS terpadu yang menyediakan dashboard web untuk HR/Finance dan aplikasi mobile self-service untuk karyawan.

## Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Web Frontend | React 19, Vite 8, Recharts |
| Backend API | Node.js, Express 5, JWT, bcryptjs |
| Database | MySQL 8 (XAMPP) |
| Mobile | React Native (Expo SDK 54), React Navigation |

## Struktur Proyek

```
WEB HRIS/
├── hris-web/                   # Web Dashboard (HR/Finance)
│   ├── src/                    # Frontend React (Vite)
│   ├── backend/src/            # API Express (port 5000)
│   │   ├── server.js           # API routes
│   │   ├── db.js               # Koneksi MySQL
│   │   └── setup-db.js         # Database setup
│   ├── backend/schema.sql      # Schema database
│   └── backend/seed.sql        # Data awal
│
├── hris-mobile/                # Mobile App (Karyawan)
│   └── frontend/               # React Native (Expo)
│       ├── screens/            # Halaman aplikasi
│       ├── services/api.js     # API service (auto-detect LAN)
│       └── App.js              # Entry point
│
├── .env                        # Environment variables
├── start-dev.bat               # Script start semua service
└── README.md
```

## Quick Start

### Prasyarat

- **XAMPP** (MySQL running) — [Download](https://www.apachefriends.org/)
- **Node.js** v20+ — [Download](https://nodejs.org/)
- **Expo Go** di HP — Play Store / App Store

### Setup (Pertama Kali)

```bash
# 1. Start MySQL di XAMPP Control Panel

# 2. Install dependencies
cd hris-web && npm install
cd ../hris-mobile/frontend && npm install

# 3. Setup database (buat DB + schema + seed)
cd ../../hris-web
npm run db:setup

# 4. Jalankan semua
cd ..
start-dev.bat
```

### Menjalankan (Sehari-hari)

1. Buka XAMPP → Start MySQL
2. Double-click `start-dev.bat`
3. Selesai!

### Akses

| Layanan | URL |
|---------|-----|
| Web Dashboard | http://localhost:5173 |
| Backend API | http://localhost:5000 |
| Mobile | Scan QR di Expo (HP satu WiFi) |

**Login default:** NIK `ADM001` / Password `admin123`

## Koneksi Mobile ↔ Backend

Mobile app **otomatis mendeteksi** IP LAN PC via Expo. Syarat:
- HP dan PC terhubung ke **WiFi yang sama**
- Backend running di port 5000 (listen `0.0.0.0`)

Tidak perlu ngrok atau konfigurasi IP manual.

## Fitur

### Web Dashboard (HR/Finance)
- Auth (JWT, role-based: Admin/HR/Finance/Employee)
- CRUD Karyawan, Departemen, Posisi
- Attendance monitoring & riwayat
- Leave management (pengajuan, approval)
- Payroll (komponen gaji, payroll run, slip)
- Dashboard & laporan

### Mobile App (Karyawan)
- Clock in/out dengan selfie
- Riwayat kehadiran
- Pengajuan cuti & status
- Slip gaji & rekap payroll
- Profil karyawan

## API Endpoints

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/auth/login` | Login |
| GET | `/employees` | Daftar karyawan |
| POST | `/attendance/clockin` | Clock in (+ selfie) |
| POST | `/attendance/clockout` | Clock out |
| GET | `/attendance/my` | Riwayat absensi saya |
| POST | `/leave` | Ajukan cuti |
| GET | `/payroll/my-runs` | Riwayat payroll |
| GET | `/health` | Health check |

## Troubleshooting

| Masalah | Solusi |
|---------|--------|
| `ECONNREFUSED` MySQL | Pastikan XAMPP MySQL sudah Start |
| Mobile tidak konek | HP & PC harus satu WiFi. Restart Expo. |
| `Unknown database` | Jalankan `npm run db:setup` di `hris-web/` |
| Login gagal | Jalankan `npm run db:setup` untuk reset seed |
| Port 5000 sudah dipakai | Matikan proses lain di port 5000 |
