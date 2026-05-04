# HRIS - Human Resource Information System

Sistem HRIS (Human Resource Information System) terpadu berbasis cloud yang menyediakan dashboard web administratif untuk HR/Finance dan aplikasi mobile self-service untuk karyawan.

## Fitur Utama

### Web Dashboard (hris-web)

| Modul | Deskripsi |
|-------|-----------|
| **Auth** | Login/logout dengan JWT, role-based access (Admin/HR/Finance/Employee) |
| **Employee** | CRUD data karyawan, departemen, posisi, kontrak |
| **Attendance** | Clock in/out, monitoring kehadiran harian, riwayat absensi |
| **Leave** | Pengajuan cuti, approval/reject, tracking saldo cuti |
| **Payroll** | Perhitungan gaji, komponen payroll (earning/deduction), payroll run & slip |
| **Reporting** | Dashboard statistik, laporan kehadiran & payroll |

### Mobile App (hris-mobile / Workmate)

| Modul | Deskripsi |
|-------|-----------|
| **Onboarding** | Slide interaktif perkenalan fitur aplikasi |
| **Auth** | Sign In (Email/NIK/Phone), Sign Up, Verifikasi OTP, Lupa Password (3-step) |
| **Attendance** | Clock in/out dengan selfie verification & GPS location |
| **Leave** | Pengajuan cuti, riwayat & status (Pending/Approved/Rejected) |
| **Payroll** | Rekap gaji bulanan, slip gaji detail, kalkulasi pajak |
| **Expense** | Klaim pengeluaran dengan status Review/Approved/Rejected |
| **Task** | Manajemen tugas (To Do/In Progress/Done), burnout stats |
| **Profile** | Data pribadi, aset kantor, pengaturan akun |

## Tech Stack

### Web Dashboard

| Layer | Teknologi |
|-------|-----------|
| Frontend | React 19, Vite 8, Recharts |
| Backend | Node.js, Express 5, JWT, bcryptjs |
| Database | MySQL 8 |
| Security | Helmet, CORS, JWT Auth |

### Mobile App

| Layer | Teknologi |
|-------|-----------|
| Frontend | React Native (Expo SDK 54), React Navigation |
| Backend | Menggunakan backend hris-web (port 5000) |
| Camera | Expo Camera, Expo Linear Gradient |

## Struktur Proyek

```
WEB HRIS/
├── hris-web/                        # Web Dashboard
│   ├── src/                          # Frontend React (Vite)
│   │   ├── App.jsx                   # Shell UI dashboard utama
│   │   ├── App.css                   # Styling utama
│   │   └── main.jsx                  # Entry point frontend
│   ├── backend/
│   │   ├── src/
│   │   │   ├── server.js             # API routes
│   │   │   ├── db.js                 # Koneksi MySQL
│   │   │   ├── middleware.js         # Auth & role middleware
│   │   │   ├── setup-db.js           # Database setup script
│   │   │   └── utils/                # Helpers (formatters, validators, etc.)
│   │   ├── schema.sql                # Schema inti database
│   │   ├── payroll-schema.sql        # Schema payroll lanjutan
│   │   ├── seed.sql                  # Data awal (user default, dll)
│   │   └── .env.example              # Template environment variables
│   ├── package.json
│   ├── vite.config.js
│   ├── SETUP.md                      # Panduan setup detail
│   └── AGENTS.md                     # Panduan AI coding agent
│
├── hris-mobile/                      # Mobile App (Workmate)
│   ├── frontend/                     # React Native (Expo)
│   │   ├── screens/                  # Halaman-halaman aplikasi
│   │   ├── contexts/                  # Auth context
│   │   ├── services/                 # API service layer
│   │   ├── assets/                   # Gambar & icon
│   │   └── App.js                    # Entry point & navigasi
│   └── README.md
│
├── .gitignore
└── README.md                         # File ini
```

## Instalasi & Setup

### Prasyarat

- **Git** - [Download](https://git-scm.com/downloads)
- **Node.js** v20+ - [Download](https://nodejs.org/)
- **MySQL Server** 8.x - [Download](https://dev.mysql.com/downloads/)
- **Expo Go** (untuk mobile) - tersedia di App Store / Play Store

### 1. Clone Repository

```bash
git clone https://github.com/Rizalibrah08/hris-management-system.git
cd hris-management-system
```

### 2. Setup Web Dashboard

```bash
cd hris-web

# Install dependencies
npm install

# Setup environment
cp backend/.env.example backend/.env
# Edit backend/.env sesuai konfigurasi MySQL:
# DB_HOST=localhost
# DB_PORT=3306
# DB_USER=root
# DB_PASSWORD=<password_mysql_anda>
# DB_NAME=hris_db
# JWT_SECRET=<secret_key_anda>

# Setup database (buat DB, jalankan schema & seed)
npm run db:setup

# Jalankan frontend + backend bersamaan
npm run dev:all
```

**URL default:**
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`
- Health check: `http://localhost:5000/health`

**Login default:**
- NIK: `ADM001`
- Password: `admin123`

### 3. Setup Mobile App

> **Catatan**: Mobile app menggunakan backend dari `hris-web` (port 5000). Pastikan langkah 2 (Setup Web Dashboard) sudah dijalankan terlebih dahulu.

```bash
cd hris-mobile/frontend

# Install frontend dependencies
npm install

# Jalankan aplikasi
npx expo start
# Scan QR code dengan Expo Go di perangkat mobile
```

**Konfigurasi API**: Pastikan `hris-mobile/frontend/services/api.js` mengarah ke backend web:
```javascript
const API_BASE_URL = __DEV__
  ? 'http://10.0.2.2:5000'  // Android Emulator → localhost:5000
  : 'https://your-production-api.com';
```

### 4. Menjalankan Secara Terpisah

**Web dashboard saja:**
```bash
cd hris-web
npm run dev          # Frontend only (port 5173)
npm run dev:server   # Backend only (port 5000)
npm run dev:all      # Keduanya bersamaan
```

## API Endpoints

### Web Dashboard API (port 5000)

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/auth/login` | Login user |
| POST | `/auth/logout` | Logout user |
| GET | `/employees` | Daftar karyawan |
| POST | `/employees` | Tambah karyawan |
| PUT | `/employees/:id` | Update karyawan |
| DELETE | `/employees/:id` | Hapus karyawan |
| POST | `/attendance/clockin` | Clock in |
| POST | `/attendance/clockout` | Clock out |
| POST | `/leave` | Ajukan cuti |
| PUT | `/leave/approve` | Approve/reject cuti |
| POST | `/payroll/run` | Jalankan payroll run |
| GET | `/payslip/:id` | Lihat slip gaji |
| GET | `/reports/dashboard` | Data dashboard |

### Mobile Endpoints (Web Backend - port 5000)

Mobile app menggunakan endpoint yang sama dengan web dashboard. Berikut endpoint khusus mobile:

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/auth/register` | Registrasi akun baru |
| GET | `/auth/me` | Profil user login |
| GET | `/employees/me` | Data karyawan login |
| PUT | `/employees/me` | Update profil |
| GET | `/attendance/my` | Riwayat absensi |
| GET | `/attendance/my-status` | Status absensi hari ini |
| GET | `/attendance/today` | Absensi semua karyawan hari ini |
| GET | `/leave/my` | Daftar cuti saya |
| GET | `/payroll/my` | Profil gaji saya |
| GET | `/payroll/my-runs` | Riwayat payroll run |
| GET | `/payroll/my-runs/:runId` | Detail payroll run |
| GET | `/dashboard/mobile` | Dashboard mobile |
| POST | `/expenses` | Buat klaim expense |
| GET | `/expenses/my` | Daftar expense saya |

## Database Schema

Database menggunakan MySQL dengan tabel utama:

- **users** - Akun login (NIK, password, role)
- **roles** - Role (Admin, HR, Finance, Employee)
- **employees** - Data karyawan
- **departments** - Departemen
- **positions** - Posisi/jabatan
- **attendance** - Catatan kehadiran
- **leave_request** - Pengajuan cuti
- **payroll_components** - Komponen gaji (earning/deduction)
- **employee_salary_profiles** - Profil gaji karyawan
- **employee_salary_component_values** - Nilai komponen gaji per karyawan
- **payroll_runs** / **payroll_run_items** / **payroll_run_item_components** - Proses payroll
- **expenses** - Klaim pengeluaran karyawan

## Troubleshooting

| Masalah | Solusi |
|---------|--------|
| `Unknown database 'hris_db'` | Jalankan `npm run db:setup` di `hris-web/` |
| `ECONNREFUSED` MySQL | Pastikan MySQL berjalan, cek `DB_HOST`/`DB_PORT` di `.env` |
| Frontend tidak bisa dibuka | Pastikan `npm run dev:all` masih aktif, cek port Vite di terminal |
| Login gagal | Jalankan `npm run db:setup` untuk reset seed data |
| Expo tidak connect | Pastikan backend web berjalan di port 5000, cek IP di `services/api.js` |

## Pengembangan

### Workflow Git & CI/CD

```
🔵 DEVELOP (branch: develop)
   Push → Test & Build Check → ✅ Selesai
   AMAN: Tidak build image, tidak deploy.

🔴 PRODUCTION (branch: main)
   Push/Merge → Test → Build Image → Push GHCR → Auto Deploy VPS
   Merge ke main = otomatis live!
```

```bash
# Ngoding di develop (aman, tidak deploy)
git checkout develop
git add . && git commit -m "feat: deskripsi" && git push origin develop

# Deploy ke production (auto 🚀)
git checkout main && git merge develop && git push origin main
```

> 📖 Panduan deploy lengkap: [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

### Validasi Sebelum Commit

```bash
# Di hris-web/
npm run lint
npm run build
```

## Lisensi

Proyek ini bersifat privat dan hanya untuk penggunaan internal.