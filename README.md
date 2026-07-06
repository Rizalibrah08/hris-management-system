# HRIS - Human Resource Information System

Sistem HRIS terpadu yang menyediakan **dashboard web untuk HR/Finance** dan **aplikasi mobile self-service untuk karyawan**. Project ini terdiri dari dua sub-project utama:

- **`hris-web/`** — Web dashboard (React + Vite) + Backend API (Node.js + Express + MySQL).
- **`hris-mobile/`** — Aplikasi karyawan (React Native + Expo SDK 54) untuk absensi, cuti, slip gaji, dan notifikasi.

> Backend dijalankan dari `hris-web/backend` pada port `5000`. Web frontend berjalan pada port default Vite (`5173`). Mobile app otomatis mendeteksi IP LAN PC untuk terhubung ke backend (mode LAN).

---

## Daftar Isi

- [Tech Stack](#tech-stack)
- [Struktur Proyek](#struktur-proyek)
- [Prasyarat](#prasyarat)
- [Setup Pertama Kali](#setup-pertama-kali)
- [Menjalankan Sehari-hari](#menjalankan-sehari-hari)
- [Akses Aplikasi](#akses-aplikasi)
- [Koneksi Mobile ↔ Backend](#koneksi-mobile--backend)
- [Fitur](#fitur)
- [Environment Variables](#environment-variables)
- [Dokumentasi Lengkap](#dokumentasi-lengkap)
- [Troubleshooting](#troubleshooting)

---

## Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Web Frontend | React 19, Vite 8, React Router 6, Recharts |
| Backend API | Node.js, Express 5, JWT, bcryptjs, multer, Cloudinary |
| Database | MySQL 8 (XAMPP / Aiven / TiDB Cloud) |
| Mobile | React Native 0.81, Expo SDK 54, React Navigation, TanStack Query, Expo Camera/Location/Print |
| Monorepo Root | `package.json` untuk deploy Render (`npm run start:server`) |

---

## Struktur Proyek

```text
WEB HRIS/
├── .env                            # Environment variables (root, dibaca backend)
├── .env.example                    # Template environment variables
├── package.json                    # Root package untuk Render deploy
├── DEVELOPMENT-GUIDE.md            # Panduan development lokal
├── README.md                       # File ini
│
├── hris-web/                       # Web Dashboard + Backend API
│   ├── src/                        # Frontend React (Vite)
│   ├── backend/
│   │   ├── src/
│   │   │   ├── server.js           # API routes utama
│   │   │   ├── db.js               # Koneksi MySQL
│   │   │   ├── setup-db.js         # Setup database
│   │   │   └── middleware.js       # Auth & role middleware
│   │   ├── schema.sql              # Schema database
│   │   ├── seed.sql                # Data awal
│   │   ├── payroll-schema.sql      # Schema tambahan payroll
│   │   └── .env                    # Env lokal (jika ada)
│   ├── docs/                       # Dokumentasi teknis web
│   ├── SETUP.md                    # Panduan setup hris-web
│   └── package.json
│
├── hris-mobile/                    # Mobile App (Karyawan)
│   └── frontend/
│       ├── assets/                 # Gambar, icon, splash
│       ├── components/             # ErrorBoundary, Toast
│       ├── contexts/               # AuthContext
│       ├── services/
│       │   └── api.js              # API client + auto-detect LAN
│       ├── screens/                # Semua halaman aplikasi
│       ├── android/                # Native project (expo prebuild)
│       ├── App.js                  # Entry point & navigasi
│       ├── app.json                # Konfigurasi Expo
│       ├── eas.json                # EAS Build config
│       ├── BUILD-APK.md            # Panduan build APK lengkap
│       └── package.json
│
└── docs/                           # Dokumentasi project root
    ├── project_manual/             # Dokumentasi lengkap (arsitektur, fitur, deployment, API, testing)
    ├── *.puml                      # Diagram UML
    └── *.md                        # Requirement analysis
```

---

## Prasyarat

- **XAMPP** (MySQL running di port 3306) — [Download](https://www.apachefriends.org/)
- **Node.js** v20+ — [Download](https://nodejs.org/)
- **Expo Go** di HP — Play Store / App Store
- HP dan PC terhubung ke **WiFi yang sama** (untuk mode LAN mobile)

---

## Setup Pertama Kali

### 1. Start MySQL

Buka XAMPP Control Panel → klik **Start** pada MySQL.

### 2. Copy Environment Variables

File `.env` **di root project** dibaca oleh backend. Salin dari template:

```bash
cp .env.example .env
```

Isi minimal yang harus diatur:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=hris_db
JWT_SECRET=your-secret-key
PORT=5000
NODE_ENV=development
```

Opsional untuk upload foto selfie/profile ke Cloudinary:

```env
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### 3. Install Dependencies

```bash
# Web + Backend
cd hris-web
npm install

# Mobile
cd ../hris-mobile/frontend
npm install
```

### 4. Setup Database

```bash
cd ../../hris-web
npm run db:setup
```

Script akan membuat database `hris_db`, tabel-tabel, dan seed user default.

### 5. Jalankan Aplikasi

```bash
# Jalankan backend + web frontend bersamaan
cd hris-web
npm run dev:all

# Di terminal terpisah, jalankan mobile
cd hris-mobile/frontend
npx expo start
```

> **Catatan:** File `start-dev.bat` yang disebutkan di dokumentasi lama saat ini **tidak tersedia**. Gunakan perintah manual di atas.

---

## Menjalankan Sehari-hari

1. Buka XAMPP → Start MySQL.
2. Jalankan backend + web:
   ```bash
   cd hris-web
   npm run dev:all
   ```
3. Jalankan mobile (di terminal terpisah):
   ```bash
   cd hris-mobile/frontend
   npx expo start
   ```

---

## Akses Aplikasi

| Layanan | URL / Akses |
|---------|-------------|
| Web Dashboard | http://localhost:5173 |
| Backend API | http://localhost:5000 |
| Health Check | http://localhost:5000/health |
| Mobile | Scan QR code di terminal Expo |

**Login default:**
- NIK: `EMP-20220101-001` (Super Admin)
- Password: `admin123`

**Admin users lainnya:**
- `EMP-20220201-002` (HRD Manager)
- `EMP-20220301-003` (Finance Manager)  
- `EMP-20220401-004` (Engineering Manager)

**Format NIK**: `EMP-YYYYMMDD-XXX` (YYYYMMDD = tanggal bergabung)

---

## Koneksi Mobile ↔ Backend

Mobile app **otomatis mendeteksi** IP LAN PC melalui `expoConfig.hostUri`. Tidak perlu ngrok atau konfigurasi IP manual jika:

- HP dan PC terhubung ke **WiFi yang sama**.
- Backend berjalan di port `5000` dan listen `0.0.0.0`.

**Jika mobile tidak bisa konek:**
1. Pastikan HP & PC satu WiFi.
2. Cek IP LAN di console backend (ditampilkan saat start).
3. Coba akses `http://<IP-PC>:5000/health` dari browser HP.
4. Restart Expo: `npx expo start --clear`.
5. Atau ubah URL backend manual via modal **Pengaturan Server** di layar login mobile.

---

## Fitur

### Web Dashboard (HR/Finance)
- Auth JWT dengan role-based access (Admin/HR/Finance/Employee).
- CRUD Karyawan, Departemen, Posisi.
- Attendance monitoring & riwayat absensi.
- Leave management (pengajuan, approval, kuota).
- Payroll (komponen gaji, payroll run, slip gaji/PDF).
- Dashboard & laporan.
- Notifikasi ke karyawan.

### Mobile App (Karyawan)
- Login dengan NIK + password.
- Clock in/out dengan selfie + GPS.
- Riwayat kehadiran & kalender absensi.
- Pengajuan cuti & status.
- Slip gaji & rekap payroll (PDF/share).
- Profil karyawan + upload foto.
- Notifikasi in-app.

---

## Environment Variables

Template lengkap ada di `.env.example`. Berikut variabel penting:

| Variable | Keterangan |
|----------|------------|
| `DB_HOST` | Host MySQL (default `localhost`) |
| `DB_PORT` | Port MySQL (default `3306`) |
| `DB_USER` | User MySQL (default `root`) |
| `DB_PASSWORD` | Password MySQL (XAMPP default kosong) |
| `DB_NAME` | Nama database (default `hris_db`) |
| `JWT_SECRET` | Secret key untuk JWT |
| `JWT_EXPIRY` | Masa berlaku JWT (default `1d`) |
| `PORT` | Port backend (default `5000`) |
| `NODE_ENV` | `development` atau `production` |
| `CORS_ORIGIN` | Origin CORS untuk production |
| `CLOUDINARY_*` | Konfigurasi Cloudinary untuk upload foto |
| `EXPO_PUBLIC_API_URL` | URL backend untuk build APK production |

---

## Dokumentasi Lengkap

Dokumentasi teknis dan panduan terpisah tersedia di:

- **`DEVELOPMENT-GUIDE.md`** — Panduan development lokal (web + mobile).
- **`hris-web/SETUP.md`** — Setup lengkap hris-web dari nol.
- **`hris-web/ARCHITECTURE.md`** — Arsitektur web & backend.
- **`hris-mobile/frontend/BUILD-APK.md`** — Panduan build APK Android.
- **`docs/project_manual/`**:
  1. [01. System Architecture](docs/project_manual/01_System_Architecture.md)
  2. [02. Modules and Features](docs/project_manual/02_Modules_and_Features.md)
  3. [03. Directory Structure](docs/project_manual/03_Directory_Structure.md)
  4. [04. Deployment Guide](docs/project_manual/04_Deployment_Guide.md)
  5. [05. API Documentation](docs/project_manual/05_API_Documentation.md)
  6. [Functional Testing Report](docs/project_manual/Functional_Testing_Report.md)

---

## Troubleshooting

| Masalah | Solusi |
|---------|--------|
| `ECONNREFUSED` MySQL | Pastikan XAMPP MySQL sudah Start dan port 3306 tidak dipakai aplikasi lain. |
| `Unknown database 'hris_db'` | Jalankan `npm run db:setup` di `hris-web/`. |
| Login gagal | Jalankan ulang `npm run db:setup` untuk reset seed user. |
| Port 5000 sudah dipakai | Matikan proses lain di port 5000. |
| Mobile tidak konek | HP & PC harus satu WiFi; coba `npx expo start --clear`; cek manual URL via modal Pengaturan Server. |
| Frontend web tidak terbuka | Pastikan `npm run dev:all` aktif; cek port Vite di output terminal. |
