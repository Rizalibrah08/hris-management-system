# 🚀 HRIS Deployment Guide — Step by Step

Panduan lengkap deploy HRIS ke production VPS dari nol sampai live.

---

## 📋 Daftar Isi

1. [Persiapan: Yang Harus Disiapkan](#1-persiapan-yang-harus-disiapkan)
2. [Langkah 1: Setup VPS](#2-langkah-1-setup-vps)
3. [Langkah 2: Clone & Konfigurasi](#3-langkah-2-clone--konfigurasi)
4. [Langkah 3: Generate Secrets](#4-langkah-3-generate-secrets)
5. [Langkah 4: Build & Jalankan](#5-langkah-4-build--jalankan)
6. [Langkah 5: Setup Nginx + SSL](#6-langkah-5-setup-nginx--ssl-opsional-tapi-recommended)
7. [Langkah 6: Setup Backup Otomatis](#7-langkah-6-setup-backup-otomatis)
8. [Langkah 7: Setup CI/CD GitHub Actions](#8-langkah-7-setup-cicd-github-actions)
9. [Langkah 8: Verifikasi Akhir](#9-langkah-8-verifikasi-akhir)
10. [Cheatsheet: Perintah Sehari-hari](#10-cheatsheet-perintah-sehari-hari)

---

## 1. Persiapan: Yang Harus Disiapkan

### 💻 Spesifikasi VPS Minimum

| Komponen | Minimum | Rekomendasi |
|----------|---------|-------------|
| CPU | 1 core | 2 core |
| RAM | 1 GB | 2-4 GB |
| Storage | 10 GB | 20 GB SSD |
| OS | Ubuntu 20.04/22.04 | Ubuntu 22.04 LTS |
| Port | 22, 80, 443 terbuka | — |

### 📝 Info yang perlu dicatat

Sebelum mulai, siapkan ini:

| Item | Contoh | Keterangan |
|------|--------|------------|
| IP VPS | `203.0.113.10` | Public IP dari provider VPS |
| Domain (opsional) | `hris.perusahaan.com` | Untuk SSL/HTTPS |
| Email admin | `admin@perusahaan.com` | Untuk notifikasi SSL |

### 🔑 VPS Provider (pilih salah satu)

- **DigitalOcean** — droplet $6/bln (1GB RAM) — paling mudah
- **Vultr** — $6/bln
- **Hetzner** — €4/bln — termurah
- **Linode** — $5/bln
- **AWS Lightsail** — $3.5/bln

> 🔥 **Rekomendasi pemula**: DigitalOcean. Setup 5 menit.

---

## 2. Langkah 1: Setup VPS

### 2.1 Buat VPS

Buka provider VPS pilihan, buat instance baru:
- OS: **Ubuntu 22.04 LTS**
- Plan: min 1GB RAM
- Region: pilih yang terdekat (Singapore untuk Indonesia)
- **Tambahkan SSH key** (jangan pakai password)

### 2.2 Login ke VPS

```bash
# Dari laptop/PC kamu:
ssh root@IP_VPS_KAMU
```

> Ganti `IP_VPS_KAMU` dengan IP dari provider.

### 2.3 Update sistem

```bash
apt update && apt upgrade -y
```

> **Penjelasan**: Update semua package ke versi terbaru untuk keamanan.

### 2.4 Set timezone ke WIB (Jakarta)

```bash
timedatectl set-timezone Asia/Jakarta
```

> **Penjelasan**: Biar log mencatat waktu Indonesia. Penting untuk payroll & attendance.

---

## 3. Langkah 2: Clone & Konfigurasi

### 3.1 Install Git dan Docker

```bash
# Install Git
apt install git -y

# Install Docker (otomatis via script resmi)
curl -fsSL https://get.docker.com | sh

# Tambah user ke grup docker (biar gak perlu sudo terus)
usermod -aG docker $USER

# Logout lalu login lagi, atau:
newgrp docker
```

> **Penjelasan**:
> - `curl ... | sh` — script resmi Docker, install Docker + Docker Compose v2
> - `usermod -aG docker $USER` — izinkan user menjalankan docker tanpa `sudo`

### 3.2 Clone repository

```bash
# Buat folder app
mkdir -p ~/hris-prod
cd ~/hris-prod

# Clone (ganti dengan repo kamu)
git clone https://github.com/Rizalibrah08/hris-management-system.git .

# Kalau repo private, pakai SSH:
# git clone git@github.com:Rizalibrah08/hris-management-system.git .
```

> **Penjelasan**: Clone seluruh kode ke VPS. Titik di akhir artinya clone ke folder saat ini (bukan subfolder).

### 3.3 Lihat struktur project

```bash
ls -la
```

Seharusnya muncul:
```
.env.example          ← Template konfigurasi
docker-compose.yml     ← Config Docker (development/local)
docker-compose.prod.yml ← Config Docker (production hardened)
hris-web/             ← Aplikasi web (frontend + backend)
nginx/                ← Config reverse proxy
scripts/              ← Script bantu (setup, backup)
```

---

## 4. Langkah 3: Generate Secrets

### 4.1 Generate password aman

```bash
# Generate database password (24 karakter random)
openssl rand -base64 24

# Generate JWT secret (48 karakter random)
openssl rand -base64 48
```

> **Penjelasan**: 
> - `DB_PASSWORD` — password root MySQL. JANGAN pakai "admin123".
> - `JWT_SECRET` — kunci untuk sign token login. Kalau bocor, orang bisa bikin token palsu.
> - **CATAT kedua output ini di tempat aman** (password manager).

### 4.2 Buat file .env

```bash
cd ~/hris-prod

# Copy template
cp .env.example .env

# Edit dengan secret yang sudah di-generate
nano .env
```

Isi `.env` dengan ini:

```bash
# --- Database ---
DB_PASSWORD=ISI_DENGAN_OUTPUT_OPENSSL_24
DB_NAME=hris_db
DB_HOST=mysql
DB_PORT=3306
DB_USER=root

# --- Security ---
JWT_SECRET=ISI_DENGAN_OUTPUT_OPENSSL_48
JWT_EXPIRY=1d

# --- Server ---
PORT=5000
NODE_ENV=production
```

Simpan: `Ctrl+O`, Enter, `Ctrl+X`.

### 4.3 Amankan file .env

```bash
chmod 600 .env
```

> **Penjelasan**: Hanya user yang bisa baca file ini. Mencegah orang lain di server membaca password.

### 4.4 Verifikasi

```bash
cat .env | grep -v "^#" | grep -v "^$"
```

Output harusnya 8 baris environment variables (bukan "CHANGE_ME").

---

## 5. Langkah 4: Build & Jalankan

### 5.1 Build Docker image

```bash
cd ~/hris-prod
docker compose build web
```

> **Penjelasan**: Build container aplikasi. Ini akan:
> 1. Install npm dependencies
> 2. Build React frontend dengan Vite (hasil di folder `dist/`)
> 3. Setup Node.js backend (Express API)
> 4. Install netcat + wget untuk healthcheck
> 
> ⏱️ **Estimasi**: 2-5 menit (tergantung speed VPS)

### 5.2 Jalankan semua service

```bash
docker compose up -d
```

> **Penjelasan**: 
> - `-d` = detached mode (jalan di background)
> - Membuat 2 container: `hris-mysql` (database) + `hris-web` (aplikasi)
> - MySQL start dulu, web nunggu MySQL healthy
> - Lalu auto-seed database (buat tabel + data dummy)

### 5.3 Pantau proses startup

```bash
# Lihat log realtime
docker compose logs -f web

# Atau cek status
docker compose ps
```

Output yang diharapkan:
```
NAME         STATUS
hris-mysql   Up (healthy)
hris-web     Up
```

Tunggu sampai log muncul:
```
Database hris_db siap digunakan di mysql:3306
Starting HRIS server...
HRIS API running on http://localhost:5000
```

> ⏱️ **Estimasi**: 30-60 detik setelah `up -d`

### 5.4 Verifikasi aplikasi berjalan

```bash
# Cek health endpoint
curl http://localhost:5000/health
# Output: {"status":"ok"}

# Cek login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"nik":"ADM001","password":"admin123"}'
# Output: {"token":"eyJ...","role":"Super Admin","employeeId":null}
```

### 5.5 Akses dari browser

Buka browser, kunjungi:
```
http://IP_VPS_KAMU:5000
```

Login dengan:
- **NIK**: `ADM001`
- **Password**: `admin123`

> ⚠️ **PENTING**: Langsung ganti password admin setelah login pertama.
> Buka halaman Role Management → ganti password.

### 5.6 Buka port firewall (kalau tertutup)

Kalau browser tidak bisa akses, cek firewall:

```bash
# Cek status firewall
ufw status

# Buka port 5000
ufw allow 5000/tcp

# Atau kalau pakai iptables langsung
iptables -A INPUT -p tcp --dport 5000 -j ACCEPT
```

> **CATATAN**: Di VPS cloud (DigitalOcean, Vultr, dll), ada **2 firewall**: firewall VPS + firewall cloud provider. Pastikan port 5000 dibuka di kedua tempat.

---

## 6. Langkah 5: Setup Nginx + SSL (Opsional tapi RECOMMENDED)

### 6.1 Kenapa perlu?

| Tanpa SSL | Dengan SSL |
|-----------|------------|
| `http://IP:5000` | `https://hris.domain.com` |
| Tidak aman (data bisa disadap) | Terenkripsi |
| Browser warning "Not Secure" | Ada gembok hijau 🔒 |
| Port aneh (5000) | Port standar (443) |

### 6.2 Syarat

- **Domain** yang sudah di-pointing ke IP VPS (setting DNS A record)
- Contoh: `hris.perusahaan.com` → `203.0.113.10`

### 6.3 Install Nginx + Certbot

```bash
apt install nginx certbot python3-certbot-nginx -y
```

### 6.4 Setup Nginx config

```bash
# Copy config dari project
cp ~/hris-prod/nginx/nginx.conf /etc/nginx/nginx.conf

# Test config (harus OK)
nginx -t

# Reload nginx
systemctl reload nginx
```

### 6.5 Dapatkan SSL Certificate

```bash
# Ganti dengan domain & email kamu
certbot --nginx \
  -d hris.perusahaan.com \
  --non-interactive \
  --agree-tos \
  --email admin@perusahaan.com
```

> **Penjelasan**: Certbot akan:
> 1. Verifikasi domain kamu benar pointing ke VPS ini
> 2. Download SSL certificate gratis dari Let's Encrypt
> 3. Otomatis edit `/etc/nginx/nginx.conf` tambah HTTPS
> 4. SSL valid 90 hari, auto-renew

### 6.6 Test SSL

```bash
# Harus redirect HTTP → HTTPS
curl -I http://hris.perusahaan.com
# Output: HTTP/1.1 301 Moved Permanently → Location: https://...

# HTTPS harus jalan
curl https://hris.perusahaan.com/health
# Output: {"status":"ok"}
```

### 6.7 Akses dari browser

Buka `https://hris.perusahaan.com` — muncul gembok hijau 🔒

---

## 7. Langkah 6: Setup Backup Otomatis

### 7.1 Test backup manual

```bash
cd ~/hris-prod
bash scripts/backup-db.sh
```

Output:
```
📦 Creating database backup...
✅ Backup saved: backups/db-20260504-020000.sql.gz (156K)
📊 Backup directory: 156K
```

### 7.2 Setup cron (auto backup tiap jam 2 pagi)

```bash
# Buka crontab
crontab -e

# Tambahkan baris ini:
0 2 * * * cd ~/hris-prod && bash scripts/backup-db.sh >> backups/cron.log 2>&1
```

> **Penjelasan**: 
> - `0 2 * * *` = jam 2 pagi setiap hari
> - Hasil backup masuk ke `~/hris-prod/backups/`
> - Backup otomatis dihapus setelah 7 hari (setting di script)

### 7.3 Verifikasi cron berjalan

```bash
# Besok paginya, cek:
ls -la ~/hris-prod/backups/
cat ~/hris-prod/backups/cron.log
```

---

## 8. Langkah 7: Setup CI/CD GitHub Actions

CI/CD artinya: setiap kamu **push code ke GitHub**, otomatis **test → build → deploy** tanpa manual.

### 8.1 Workflow yang ada

| Branch | Trigger | Action |
|--------|---------|--------|
| `develop` | Push | Test → Build → Deploy ke **Staging** |
| `main` | Push/Merge | Test → Build → Backup DB → Deploy ke **Production** |
| Any | Pull Request | Test only (tidak deploy) |

### 8.2 Setup di GitHub

Buka repository GitHub → **Settings** → **Secrets and variables** → **Actions**.

Tambahkan **Repository secrets** berikut:

| Secret Name | Value | Keterangan |
|-------------|-------|------------|
| `SSH_KEY` | `isi private SSH key` | Untuk SSH ke VPS |
| `SSH_USER` | `root` | Username VPS |
| `PROD_IP` | `203.0.113.10` | IP production VPS |
| `PROD_DOMAIN` | `hris.perusahaan.com` | Domain production |
| `STAGING_IP` | `203.0.113.20` | IP staging VPS (kalau ada) |
| `DB_PASSWORD_PROD` | `isi dari .env production` | Password MySQL production |
| `JWT_SECRET_PROD` | `isi dari .env production` | JWT secret production |
| `DB_PASSWORD_STAGING` | `isi dari .env staging` | Password MySQL staging |
| `JWT_SECRET_STAGING` | `isi dari .env staging` | JWT secret staging |

### 8.3 Setup SSH Key untuk GitHub Actions

```bash
# Di LAPTOP kamu (bukan VPS), generate SSH key khusus CI/CD:
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/hris_github_actions

# Copy public key
cat ~/.ssh/hris_github_actions.pub
```

**Di VPS**, tambahkan public key:
```bash
# Di VPS:
mkdir -p ~/.ssh
echo "PASTE_PUBLIC_KEY_DISINI" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

**Di GitHub Secrets**, `SSH_KEY` diisi dengan **private key**:
```bash
# Di laptop:
cat ~/.ssh/hris_github_actions
# Copy seluruh output (termasuk ----BEGIN... dan ----END...)
```

### 8.4 Coba push ke develop

```bash
# Di laptop (project HRIS):
git checkout -b develop
git push origin develop
```

Buka GitHub → Actions tab → lihat workflow berjalan.  
Kalau semua hijau ✅ → CI/CD berhasil.

---

## 9. Langkah 8: Verifikasi Akhir

### 9.1 Checklist Production

- [ ] Aplikasi bisa diakses via `https://domain.com`
- [ ] Login dengan ADM001/admin123 berhasil
- [ ] Dashboard menampilkan data (karyawan, attendance, payroll)
- [ ] Semua halaman bisa dibuka (Karyawan, Absensi, Cuti, Payroll, Laporan)
- [ ] SSL valid (gembok hijau di browser)
- [ ] Backup berjalan (cek folder `~/hris-prod/backups/`)
- [ ] CI/CD berjalan (push ke develop deploy ke staging)
- [ ] Ganti password admin (jangan "admin123"!)

### 9.2 Monitoring dasar

```bash
# Cek resource usage
docker stats

# Cek disk space (jangan sampai penuh)
df -h

# Cek log aplikasi (terakhir 50 baris)
docker compose logs web --tail 50

# Cek log nginx
tail -f /var/log/nginx/access.log
```

### 9.3 Update aplikasi

Kalau ada perubahan kode, cukup:

```bash
cd ~/hris-prod
git pull origin main
docker compose up --build -d
```

Atau kalau CI/CD sudah jalan, cukup **push ke main**, otomatis ke-deploy.

---

## 10. Cheatsheet: Perintah Sehari-hari

### 🟢 Start / Stop

```bash
docker compose up -d          # Start semua service
docker compose down           # Stop semua service
docker compose restart web    # Restart aplikasi saja (MySQL tetap jalan)
docker compose down -v        # ⚠️ Stop + HAPUS SEMUA DATA
```

### 📊 Monitoring

```bash
docker compose ps                       # Status container
docker compose logs -f web              # Log realtime
docker compose logs web --tail 100      # Log 100 baris terakhir
docker compose stats                    # CPU/RAM usage
curl http://localhost:5000/health       # Health check
```

### 🗄️ Database

```bash
# Masuk ke MySQL
docker compose exec mysql mysql -uroot -p hris_db

# Backup manual
bash scripts/backup-db.sh

# Restore backup
gunzip -c backups/db-20260504.sql.gz | docker compose exec -T mysql mysql -uroot -p hris_db
```

### 🐛 Troubleshooting

```bash
# "Port already in use"
lsof -i :5000                # Cek siapa yang pakai port 5000
kill -9 PID                  # Bunuh proses yang pakai port

# "Container not starting"
docker compose logs web      # Lihat error log

# "Database connection refused"
docker compose ps            # Pastikan mysql "healthy"
docker compose restart web   # Restart setelah mysql siap

# "Disk full"
docker system prune -af      # Hapus image lama (hati-hati)
docker volume prune -f       # Hapus volume tidak terpakai
```

---

## 🎯 Arsitektur Final

```
                        INTERNET
                           │
                    ┌──────▼──────┐
                    │   Nginx     │  Port 80/443
                    │   + SSL     │  Reverse Proxy
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │   Web App   │  Port 5000 (internal)
                    │ Express     │  Serve API + Static
                    │   + React   │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │   MySQL 8   │  Port 3306 (internal)
                    │   Volume    │  Data persistent
                    └─────────────┘

        GitHub Actions CI/CD:
        Push → Test → Build → Deploy → Health Check
```

---

## ❓ FAQ

**Q: Berapa biaya per bulan?**
> A: VPS mulai dari Rp 50rb/bln (Hetzner) sampai Rp 150rb/bln (DigitalOcean). Domain Rp 100rb/tahun. SSL gratis. Total ~Rp 100-200rb/bln.

**Q: Bagaimana kalau VPS mati?**
> A: Data aman di volume Docker + backup harian. Setup VPS baru, restore backup, jalan lagi dalam 15 menit.

**Q: Apakah bisa untuk 100+ karyawan?**
> A: Dengan 2GB RAM VPS bisa handle 100-500 user. MySQL resource bisa ditambah di `docker-compose.prod.yml`.

**Q: Bagaimana update code tanpa downtime?**
> A: Docker compose rolling update. Container baru start dulu, baru yang lama dimatikan. Downtime < 3 detik.

---

*Setup selesai! 🎉 Aplikasi HRIS siap digunakan.*
