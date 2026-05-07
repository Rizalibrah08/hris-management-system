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

## Menjalankan dengan Docker & Nginx (Wajib)

Docker adalah cara paling sederhana untuk menjalankan project ini karena semua dependensi (MySQL, Node.js, build tool, **Nginx**) sudah dikemas dalam kontainer. **Tidak perlu install Node.js atau MySQL secara manual.**

> **Nginx adalah komponen wajib** dalam stack ini. Nginx bertindak sebagai reverse proxy yang menangani routing API, security headers, rate limiting, gzip compression, dan serving static files. Web dashboard **harus** diakses melalui Nginx (port 80), bukan langsung ke port 5000.

### Prasyarat Docker

- **Git** - [Download](https://git-scm.com/downloads)
- **Docker Desktop** (Windows/Mac) atau **Docker Engine + Docker Compose** (Linux)

Verifikasi Docker sudah terpasang:

```bash
docker --version      # → Docker version 24.x atau lebih baru
docker compose version # → Docker Compose version v2.x atau lebih baru
```

---

### A. Menjalankan di Lokal (Local Development)

Gunakan `docker-compose.yml` yang sudah disediakan. Compose file ini akan membangun image dari kode sumber lokal—cocok untuk pengembangan dan testing.

#### 1. Clone Repository

```bash
git clone https://github.com/Rizalibrah08/hris-management-system.git
cd hris-management-system
```

#### 2. Buat File `.env`

Salin dari template dan isi dengan nilai aman:

```bash
cp .env.example .env
```

Buka `.env` dan pastikan nilainya:

```env
# Database
DB_PASSWORD=PASTE_HASIL_openssl_rand_-base64_24_DISINI
DB_NAME=hris_db
DB_HOST=mysql
DB_PORT=3306
DB_USER=root

# Security
JWT_SECRET=PASTE_HASIL_openssl_rand_-base64_48_DISINI
JWT_EXPIRY=1d

# Server
PORT=5000
NODE_ENV=production
```

> **Tips**: Generate password aman dengan perintah berikut dan tempelkan ke `.env`:
> ```powershell
> # Windows PowerShell
> openssl rand -base64 24   # untuk DB_PASSWORD
> openssl rand -base64 48   # untuk JWT_SECRET
> ```
> Kalau `openssl` tidak tersedia, gunakan sembarang string panjang dan acak.

#### 3. Jalankan dengan Docker Compose

```bash
# Build image dan jalankan semua container (MySQL + Web)
docker compose up -d
```

**Apa yang terjadi:**
1. Docker menarik image `mysql:8.0`, `nginx:alpine`, dan membangun image `hris-web` dari `Dockerfile`
2. Container `hris-mysql` dijalankan dengan health check
3. Container `hris-web` menunggu MySQL siap, lalu otomatis:
   - Membuat database `hris_db`
   - Menjalankan schema (25 tabel)
   - Mengisi data awal (seed): roles, admin default, departemen, posisi, jenis cuti
   - Menyalakan Express server di port 5000 (internal)
4. Container `hris-nginx` dijalankan setelah web siap, melayani request di port 80

> **Mengapa Nginx wajib?** Nginx melakukan rewrite path `/api/` → `/` sebelum request diteruskan ke Express. Tanpa Nginx, panggilan API dari React SPA tidak akan berfungsi karena Express tidak memiliki prefix `/api` pada route-nya.

#### 4. Akses Aplikasi

| Layanan | URL |
|----------|-----|
| **Web Dashboard** | `http://localhost` (port 80, via Nginx) |
| **Direct API** | `http://localhost:5000` (untuk mobile dev / debugging) |
| **Health Check** | `http://localhost/health` atau `http://localhost:5000/health` |

**Login default:**
- **NIK**: `ADM001`
- **Password**: `admin123`

> **Ganti password admin setelah login pertama!**

#### 5. Monitoring & Logs

```bash
# Lihat status container (harus 3 container: mysql, web, nginx)
docker compose ps

# Lihat log real-time (tekan Ctrl+C untuk berhenti)
docker compose logs -f nginx
docker compose logs -f web
docker compose logs -f mysql

# Lihat penggunaan CPU & RAM
docker stats

# Restart aplikasi (setelah ubah kode)
docker compose restart web

# Reload Nginx config (setelah ubah nginx/default.conf)
docker compose restart nginx

# Restart semua
docker compose restart

# Hentikan semua container (data database tetap aman di volume)
docker compose down

# ⚠️ Hentikan DAN hapus data database
docker compose down -v
```

#### 6. Menjalankan Kembali Setelah Down

```bash
# Container dan data masih ada — cukup start ulang
docker compose up -d

# Database akan otomatis di-seed ulang oleh docker-entrypoint.sh
# jadi tidak perlu menjalankan npm run db:setup secara manual
```

#### 7. Struktur Docker

```
hris-management-system/
├── docker-compose.yml          # Compose file (MySQL + Web + Nginx)
├── .env                        # Environment variables (credentials)
├── .env.example                # Template .env
├── nginx/
│   └── default.conf            # Konfigurasi Nginx (reverse proxy, security, rate limit)
├── hris-web/
│   ├── Dockerfile              # Multi-stage build (builder → runner)
│   ├── docker-entrypoint.sh    # Wait MySQL → seed DB → start server
│   └── ...
└── hris-mobile/                # Mobile app (jalan terpisah, tetap butuh backend)
```

---

### B. Deployment ke Production (Docker + GHCR)

Untuk deployment production, gunakan image yang sudah di-build dan di-push ke **GitHub Container Registry (GHCR)**. Proses ini diotomatiskan oleh GitHub Actions.

> **Panduan deployment production selengkapnya**: [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

#### Ringkasan Arsitektur Production

```
┌─────────────────────────────────────────────────────────┐
│                    GitHub Actions                        │
│  Push ke main → Test → Build Image → Push GHCR          │
└──────────────────────┬──────────────────────────────────┘
                       │ image
                       ▼
┌─────────────────────────────────────────────────────────┐
│            GitHub Container Registry (ghcr.io)           │
│  ghcr.io/rizalibrah08/hris-management-system:latest     │
└──────────────────────┬──────────────────────────────────┘
                       │ docker pull (~50MB)
                       ▼
┌─────────────────────────────────────────────────────────┐
│                    VPS (1 GB RAM)                        │
│  docker compose up -d                                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐       │
│  │ MySQL 8  │  │  Nginx   │  │  Web App         │       │
│  │          │  │  :80→web │  │  (Express+React) │       │
│  └──────────┘  └────┬─────┘  └──────────────────┘       │
│                     │                                    │
│               Port 80 (HTTP/HTTPS)                       │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│                     Cloudflare                           │
│  DNS + SSL (Free) + DDoS Protection                     │
└─────────────────────────────────────────────────────────┘
```

#### Quick Start Production (VPS)

Di **VPS Ubuntu** yang sudah terinstall Docker, jalankan satu perintah:

```bash
# Setup otomatis: install Docker, download compose, generate .env, start app
bash -c "$(curl -fsSL https://raw.githubusercontent.com/Rizalibrah08/hris-management-system/main/scripts/setup-vps.sh)"
```

Setup manual (alternatif):

```bash
mkdir -p ~/hris-prod && cd ~/hris-prod

# Download compose file untuk GHCR
curl -sLO https://raw.githubusercontent.com/Rizalibrah08/hris-management-system/main/docker-compose.ghcr.yml

# Buat .env (pakai openssl untuk generate password)
cat > .env << 'EOF'
DB_PASSWORD=HASIL_openssl_rand_-base64_24
DB_NAME=hris_db
DB_HOST=mysql
DB_PORT=3306
DB_USER=root
JWT_SECRET=HASIL_openssl_rand_-base64_48
JWT_EXPIRY=1d
PORT=5000
NODE_ENV=production
EOF
chmod 600 .env

# Pull image & jalankan
docker compose -f docker-compose.ghcr.yml up -d

# Verifikasi
curl http://localhost:5000/health
# → {"status":"ok"}
```

#### CI/CD Otomatis

| Branch | Aksi | Build Image | Deploy |
|--------|------|:--:|:--:|
| `develop` | Push → Test & Build Check | ❌ | ❌ |
| `main` | Push/Merge → Test → Build → Push GHCR → Deploy | ✅ | ✅ Auto |

```bash
# Ngoding aman di develop (tidak deploy)
git checkout develop
git add . && git commit -m "feat: deskripsi" && git push origin develop

# Deploy ke production (auto)
git checkout main && git merge develop && git push origin main
```

#### Monitoring & Backup Production

```bash
cd ~/hris-prod

# Status container
docker compose -f docker-compose.ghcr.yml ps

# Log real-time
docker compose -f docker-compose.ghcr.yml logs -f web

# Resource usage
docker stats

# Update aplikasi (pull image terbaru)
docker compose -f docker-compose.ghcr.yml pull web
docker compose -f docker-compose.ghcr.yml up -d

# Backup database
bash backup-db.sh

# Restore database
gunzip -c backups/db-20260506-020000.sql.gz | \
  docker compose -f docker-compose.ghcr.yml exec -T mysql \
  mysql -uroot -p"$(grep DB_PASSWORD .env | cut -d= -f2)" hris_db
```

---

## Instalasi & Setup Manual (Tanpa Docker)

Gunakan cara ini jika Anda ingin menjalankan aplikasi tanpa Docker (memerlukan Node.js dan MySQL terinstall secara lokal).

### Prasyarat Manual

- **Git** - [Download](https://git-scm.com/downloads)
- **Node.js** v20+ - [Download](https://nodejs.org/)
- **MySQL Server** 8.x - [Download](https://dev.mysql.com/downloads/)
- **Expo Go** (untuk mobile) - tersedia di App Store / Play Store

### 1. Clone Repository

```bash
git clone https://github.com/Rizalibrah08/hris-management-system.git
cd hris-management-system
```

### 2. Setup Web Dashboard (Manual)

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

**URL default (Manual):**
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`
- Health check: `http://localhost:5000/health`

**Login default:**
- NIK: `ADM001`
- Password: `admin123`

### 3. Setup Mobile App (Manual)

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

### 4. Menjalankan Secara Terpisah (Manual)

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

### Docker + Nginx

| Masalah | Solusi |
|---------|--------|
| Port 80 atau 3306 sudah dipakai | Hentikan service lain (IIS, Apache, XAMPP, MySQL lokal) atau ubah port di `docker-compose.yml` |
| Container `hris-mysql` tidak healthy | Tunggu 30 detik (MySQL butuh waktu inisialisasi), lalu cek log: `docker compose logs mysql` |
| Web container restart terus (crash loop) | Cek log: `docker compose logs web`. Pastikan `.env` ada di root project dan terisi semua variabel wajib. |
| `Error: connect ECONNREFUSED` pada web container | MySQL belum siap — restart web: `docker compose restart web` |
| Nginx error `502 Bad Gateway` | Web container belum siap. Cek: `docker compose ps` (web harus healthy), lalu `docker compose restart nginx` |
| Login gagal meskipun NIK/password benar | Reset data: `docker compose down -v && docker compose up -d` (⚠️ hapus semua data) |
| Halaman putih / JS tidak jalan | Build ulang image: `docker compose build --no-cache web && docker compose up -d` |
| API error 404 padahal route ada | Pastikan akses via **port 80** (Nginx), bukan port 5000. Nginx melakukan rewrite `/api/` → `/` |
| Nginx config tidak berlaku setelah edit | Reload: `docker compose restart nginx`. Cek syntax: `docker compose exec nginx nginx -t` |
| Container bentrok nama (`Conflict: container name already in use`) | Hapus paksa: `docker rm -f hris-mysql hris-web hris-nginx && docker compose up -d` |
| Upload foto Clock In gagal | File terlalu besar — batas maksimum 16MB (diatur di `nginx/default.conf`) |
| "Permission denied" saat `docker compose` | Linux: tambahkan user ke group docker (`sudo usermod -aG docker $USER`) lalu logout/login |

### Manual (Tanpa Docker)

| Masalah | Solusi |
|---------|--------|
| `Unknown database 'hris_db'` | Jalankan `npm run db:setup` di `hris-web/` |
| `ECONNREFUSED` MySQL | Pastikan MySQL berjalan, cek `DB_HOST`/`DB_PORT` di `backend/.env` |
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