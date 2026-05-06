# HRIS Deployment Guide — Full Lengkap (Zero to Production)

Panduan deploy lengkap dari nol: beli VPS → setup domain → Cloudflare → GitHub CI/CD → auto deploy.

> **Arsitektur**: Build di GitHub Actions → push ke GHCR → VPS pull ringan → Cloudflare DNS & SSL.
> - VPS tidak perlu build (cukup 1GB RAM)
> - Image di-build gratis oleh GitHub Actions
> - Cloudflare gratis: DNS, SSL, DDoS protection



---

## Daftar Isi

1. [Arsitektur](#1-arsitektur)
2. [Yang Harus Disiapkan](#2-yang-harus-disiapkan)
3. [Setup Cloudflare + Domain](#3-setup-cloudflare--domain)
4. [Setup VPS](#4-setup-vps)
5. [Setup GitHub](#5-setup-github)
6. [CI/CD Flow — Develop vs Production](#6-cicd-flow--develop-vs-production)
7. [Nginx + SSL (Cloudflare Full Mode)](#7-nginx--ssl-cloudflare-full-mode)
8. [Verifikasi](#8-verifikasi)
9. [Backup Database](#9-backup-database)
10. [Update Aplikasi](#10-update-aplikasi)
11. [Environment Variables Reference](#11-environment-variables-reference)
12. [Monitoring & Logs](#12-monitoring--logs)
13. [Manual Deploy Workflow](#13-manual-deploy-workflow)
14. [Troubleshooting](#14-troubleshooting)
15. [Cheatsheet](#15-cheatsheet)



---

## 1. Arsitektur

```
┌─────────────────────────────────────────────────────────┐
│                    GitHub Actions                        │
│  npm ci → vite build → docker build → push ke GHCR      │
│  (HANYA trigger saat push/merge ke main)                │
└──────────────────────┬──────────────────────────────────┘
                       │ image push
                       ▼
┌─────────────────────────────────────────────────────────┐
│            GitHub Container Registry (ghcr.io)           │
│  ghcr.io/rizalibrah08/hris-management-system:latest     │
└──────────────────────┬──────────────────────────────────┘
                       │ docker pull (ringan, ~50MB)
                       ▼
┌─────────────────────────────────────────────────────────┐
│                    VPS (1GB RAM)                         │
│  docker compose -f docker-compose.ghcr.yml up -d        │
│  ┌─────────────┐  ┌──────────────┐                      │
│  │  MySQL 8    │  │  Web App     │ ← Express + React    │
│  └─────────────┘  └──────────────┘                      │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│                     Cloudflare                           │
│  DNS: hris.domain.com → VPS IP                       │
│  SSL: Full (strict) — gratis, auto-renew             │
│  DDoS protection, CDN cache, WAF                    │
└─────────────────────────────────────────────────────────┘
```

### Database Schema (20 Tabel)

Aplikasi menggunakan 20 tabel MySQL yang terbagi dalam 2 schema:

| Schema | Tabel | Jumlah |
|--------|-------|--------|
| Core (`schema.sql`) | roles, departments, positions, employees, users, attendance, leave_request, payroll, payslip, expenses, office_assets, tasks | 12 |
| Payroll Extension (`payroll-schema.sql`) | payroll_components, employee_salary_profiles, employee_salary_component_values, payroll_variable_inputs, payroll_runs, payroll_run_items, payroll_run_item_components, payroll_approvals, payroll_audit_logs | 8+1 |

Semua tabel dibuat otomatis oleh `setup-db.js` saat container pertama kali start.

---

## 2. Yang Harus Disiapkan

### 2.1 Daftar Belanja

| Item | Spesifikasi | Estimasi Biaya |
|------|------------|----------------|
| **VPS** | Ubuntu 22.04, **1GB RAM**, 10GB disk | Rp 60-90rb/bulan |
| **Domain** | .com / .id / .co.id | Rp 100-150rb/tahun |
| **Cloudflare** | Akun gratis | Rp 0 |
| **GitHub** | Akun + repo | Rp 0 |
| **Total** | | ~Rp 70-100rb/bulan |

### 2.2 Akun yang Harus Dibuat

| Akun | Link | Keterangan |
|------|------|------------|
| GitHub | [github.com](https://github.com) | Tempat kode & CI/CD |
| Cloudflare | [cloudflare.com](https://cloudflare.com) | DNS & SSL gratis |
| VPS | Hetzner / DigitalOcean / AWS Lightsail | Server aplikasi |

---

## 3. Setup Cloudflare + Domain

### 3.1 Tambahkan Domain ke Cloudflare

1. Buka [cloudflare.com](https://cloudflare.com) → **Sign Up** / **Log In**
2. Klik **+ Add a Site** → masukkan domain kamu (contoh: `perusahaan.com`)
3. Pilih plan **Free** (gratis, cukup untuk production)
4. Cloudflare akan memberikan **2 nameserver**:
   ```
   nolan.ns.cloudflare.com
   uma.ns.cloudflare.com
   ```

### 3.2 Ganti Nameserver di Registrar

Buka tempat kamu beli domain (Niagahoster, Namecheap, dll), cari menu **Nameserver** / **DNS**, ganti ke nameserver Cloudflare di atas.

> **Propagasi DNS**: 5 menit sampai 24 jam. Biasanya < 30 menit.
> Cek status: Cloudflare dashboard akan menunjukkan "Active" kalau sudah berhasil.

### 3.3 Tambahkan DNS Record

Di dashboard Cloudflare → **DNS** → **Records** → **Add record**:

| Type | Name | Content | Proxy Status |
|------|------|---------|:---:|
| `A` | `hris` | `ISI_IP_VPS_KAMU` | Proxied |
| `A` | `@` | `ISI_IP_VPS_KAMU` | Proxied |

Contoh:
- `hris.perusahaan.com` → `54.123.45.67`
- `perusahaan.com` → `54.123.45.67`

> **Proxy ON** (orange cloud) = traffic lewat Cloudflare → dapat DDoS protection, CDN, SSL.

### 3.4 Setup SSL/TLS

**Cloudflare Dashboard** → **SSL/TLS** → **Overview** → Pilih: **Full (strict)**

| Mode | Keamanan | Perlu Setup Nginx? |
|------|:--:|:--:|
| **Flexible** | Rendah | Tidak |
| **Full** | Sedang | Ya (self-signed OK) |
| **Full (strict)** | Tinggi | Ya (valid cert) |

> Rekomendasi **Full (strict)** — nanti kita setup Nginx + Origin Certificate di [Section 7](#7-nginx--ssl-cloudflare-full-mode).

---

## 4. Setup VPS

### 4.1 SSH ke VPS

```bash
ssh root@IP_VPS
```

### 4.2 Update Sistem

```bash
apt update && apt upgrade -y
timedatectl set-timezone Asia/Jakarta
```

### 4.3 Jalankan Setup Otomatis (Rekomendasi)

> **Sekali saja!** Jangan jalankan ulang script setup setelah aplikasi berjalan.
> Script akan menimpa `docker-compose.ghcr.yml` dari GitHub (versi terbaru).
> Kalau aplikasi sudah jalan, cukup update lewat CI/CD atau `docker compose pull`.

Satu command, semua otomatis:

```bash
bash -c "$(curl -fsSL https://raw.githubusercontent.com/Rizalibrah08/hris-management-system/main/scripts/setup-vps.sh)"
```

Script ini akan:
1. Install Docker (kalau belum)
2. Download `docker-compose.ghcr.yml`
3. Generate `.env` dengan password random aman
4. Pull image dari GHCR
5. Start MySQL + Web app
6. Setup firewall (UFW)
7. Download script backup

**PENTING**: Simpan password yang ditampilkan! Tidak bisa direcover.

### 4.4 Setup Manual (Alternatif)

Kalau tidak pakai script otomatis:

```bash
# 1. Install Docker
curl -fsSL https://get.docker.com | sh

# 2. Buat folder
mkdir -p ~/hris-prod && cd ~/hris-prod

# 3. Download compose file
curl -sLO https://raw.githubusercontent.com/Rizalibrah08/hris-management-system/main/docker-compose.ghcr.yml

# 4. Generate secrets
openssl rand -base64 24  # ← copy output → DB_PASSWORD
openssl rand -base64 48  # ← copy output → JWT_SECRET

# 5. Buat .env
cat > .env << 'EOF'
DB_PASSWORD=PASTE_DB_PASSWORD_DISINI
DB_NAME=hris_db
DB_HOST=mysql
DB_PORT=3306
DB_USER=root
JWT_SECRET=PASTE_JWT_SECRET_DISINI
JWT_EXPIRY=1d
PORT=5000
NODE_ENV=production
GHCR_REPO=rizalibrah08/hris-management-system
EOF
chmod 600 .env

# 6. Pull & start
docker compose -f docker-compose.ghcr.yml up -d

# 7. Cek health
curl http://localhost:5000/health
# → {"status":"ok"}
```

### 4.5 Verifikasi di VPS

```bash
# Cek container status
docker compose -f docker-compose.ghcr.yml ps
# Harus ada 2 container: hris-mysql (healthy) dan hris-web (healthy)

# Cek logs
docker compose -f docker-compose.ghcr.yml logs web

# Test API
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"nik":"ADM001","password":"admin123"}'
# → {"token":"eyJ...","role":"Super Admin"}
```

### 4.6 Akses dari Browser

Buka `http://IP_VPS:5000` → harus muncul halaman login HRIS.

> Login default: **NIK**: `ADM001` | **Password**: `admin123`
> **GANTI password admin setelah login pertama!**

---

## 5. Setup GitHub

### 5.1 Set Package GHCR ke Public

1. Buka https://github.com/Rizalibrah08/hris-management-system/pkgs/container/hris-management-system
2. Klik **Package settings** (kanan bawah)
3. Scroll ke **Danger Zone** → **Change visibility** → **Public**

> Kalau belum ada package, jalankan dulu workflow CI/CD (push ke `main`) atau deploy manual.

### 5.2 Generate SSH Key untuk GitHub Actions

```bash
# Di LAPTOP (bukan VPS!)
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/hris_deploy
# Enter passphrase: (kosongkan)
```

### 5.3 Upload Public Key ke VPS

```bash
# Cara 1: ssh-copy-id
ssh-copy-id -i ~/.ssh/hris_deploy.pub root@IP_VPS

# Cara 2: Manual
cat ~/.ssh/hris_deploy.pub
# Copy outputnya, lalu di VPS jalankan:
# echo "PASTE_PUBLIC_KEY" >> ~/.ssh/authorized_keys
```

### 5.4 Tambahkan Secrets di GitHub

Buka repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

| Secret | Nilai | Cara Dapat |
|--------|-------|------------|
| `PROD_IP` | `54.123.45.67` | IP VPS kamu |
| `SSH_USER` | `root` | Username SSH VPS |
| `SSH_KEY` | *(isi private key)* | `cat ~/.ssh/hris_deploy` |
| `DB_PASSWORD_PROD` | *(password dari .env)* | `grep DB_PASSWORD .env` di VPS |
| `JWT_SECRET_PROD` | *(secret dari .env)* | `grep JWT_SECRET .env` di VPS |
| `DOMAIN` | `hris.perusahaan.com` | Domain yang sudah di-setup |

> **CI/CD pipeline** (`ci-cd.yml`) menggunakan secrets: `PROD_IP`, `SSH_USER`, `SSH_KEY`, `DB_PASSWORD_PROD`, `JWT_SECRET_PROD`, `DOMAIN`, dan `GITHUB_TOKEN` (otomatis).
>
> **Manual Deploy workflow** (`manual-deploy.yml`) juga menggunakan secrets yang sama, plus opsional `VPS_DEV_IP`, `VPS_USER`, `VPS_SSH_KEY` untuk deployment ke environment development.

Contoh isi `SSH_KEY`:
```
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW
... (jangan dipotong) ...
-----END OPENSSH PRIVATE KEY-----
```

---

## 6. CI/CD Flow — Develop vs Production

### 6.1 Cara Kerja

```
DEVELOP (branch: develop)
   Push → Test & Build Check → Selesai
   AMAN: Tidak build image, tidak deploy, VPS tidak tersentuh.

PRODUCTION (branch: main)
   Push/Merge → Test → Build Image → Push GHCR → Auto Deploy VPS
   Begitu merge ke main → otomatis live di VPS!
```

### 6.2 Development — Ngoding Aman

```bash
# Bikin branch fitur
git checkout -b feat/nama-fitur

# Ngoding...
git add .
git commit -m "feat: deskripsi fitur"

# Push ke develop (test aja, tidak deploy)
git push origin feat/nama-fitur
# Buka PR ke develop, merge setelah review

# Atau langsung ke develop:
git checkout develop
git merge feat/nama-fitur
git push origin develop
# → GitHub Actions: test & build check (tidak deploy)
```

### 6.3 Production — Deploy

```bash
# Sudah yakin fitur OK? Merge ke main:
git checkout main
git merge develop
git push origin main

# → GitHub Actions otomatis:
#   1. Test & Build Check
#   2. Build Docker image
#   3. Push ke GHCR
#   4. SSH ke VPS → pull image → restart → health check
```

### 6.4 Cek Status Deploy

1. Buka https://github.com/Rizalibrah08/hris-management-system/actions
2. Klik workflow run terbaru
3. Harus lihat 3 job sukses: **Test & Build Check** → **Build & Push to GHCR** → **Deploy to VPS**

### 6.5 Verifikasi CI/CD Pipeline

Sebelum pertama kali deploy, pastikan:

- [ ] Repository punya `main` branch
- [ ] `.github/workflows/ci-cd.yml` dan `manual-deploy.yml` ada di `main`
- [ ] 6 secrets terisi (lihat [Section 5.4](#54-tambahkan-secrets-di-github))
- [ ] GHCR package visibility diset ke **Public**
- [ ] VPS sudah jalan (`curl http://localhost:5000/health` → `{"status":"ok"}`)
- [ ] SSH key bisa akses VPS: `ssh -i ~/.ssh/hris_deploy root@IP_VPS "echo OK"`

---

## 7. Nginx + SSL (Cloudflare Full Mode)

> **Lewati section ini kalau pakai Cloudflare Flexible mode.**
> Section ini hanya untuk mode **Full (strict)** — lebih aman.

### 7.1 Buat Origin Certificate di Cloudflare

1. Cloudflare Dashboard → **SSL/TLS** → **Origin Server** → **Create Certificate**
2. Pilih "Let Cloudflare generate a private key and a CSR"
3. Klik **Create**
4. Simpan 2 file:

**`cert.pem`** (Origin Certificate):
```
-----BEGIN CERTIFICATE-----
... (isi certificate) ...
-----END CERTIFICATE-----
```

**`key.pem`** (Private Key):
```
-----BEGIN PRIVATE KEY-----
... (isi private key) ...
-----END PRIVATE KEY-----
```

### 7.2 Upload Certificate ke VPS

```bash
# Di VPS:
mkdir -p /etc/nginx/ssl

# Buka editor, paste isi file:
nano /etc/nginx/ssl/cert.pem   # ← paste cert.pem
nano /etc/nginx/ssl/key.pem    # ← paste key.pem

chmod 600 /etc/nginx/ssl/key.pem
```

### 7.3 Install & Konfigurasi Nginx

```bash
apt install nginx -y

# Buat rate limit zone
echo 'limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;' > /etc/nginx/conf.d/rate-limit.conf

# Buat config
nano /etc/nginx/sites-available/hris
```

Isi config:

```nginx
server {
    listen 80;
    server_name hris.perusahaan.com perusahaan.com;

    # Redirect HTTP → HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name hris.perusahaan.com perusahaan.com;

    # SSL — Origin Certificate dari Cloudflare
    ssl_certificate     /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    ssl_protocols       TLSv1.2 TLSv1.3;
    ssl_ciphers         HIGH:!aNULL:!MD5;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Increase body size for file uploads (selfie/expense receipts)
    client_max_body_size 16m;

    # Rate limit endpoint login
    location /api/auth/login {
        limit_req zone=login burst=3 nodelay;
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Proxy ke aplikasi Express
    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Block sensitive files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }

    location ~ \.env$ {
        deny all;
        access_log off;
        log_not_found off;
    }
}
```

### 7.4 Aktifkan Nginx

```bash
# Aktifkan site
ln -sf /etc/nginx/sites-available/hris /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test config
nginx -t

# Reload
systemctl reload nginx
systemctl enable nginx
```

> Setelah ini, akses via `https://hris.perusahaan.com` — harusnya gembok hijau.

---

## 8. Verifikasi

### 8.1 Checklist Go-Live

- [ ] VPS running, aplikasi bisa diakses via `http://IP:5000`
- [ ] Cloudflare DNS pointing ke VPS IP (Proxied)
- [ ] SSL mode **Full (strict)** (atau Flexible)
- [ ] Nginx running (kalau pakai Full mode)
- [ ] `https://domain.com` bisa dibuka, gembok hijau
- [ ] Login ADM001 / admin123 berhasil
- [ ] Semua halaman berfungsi (Dashboard, Karyawan, Absensi, Cuti, Payroll, Laporan)
- [ ] **GANTI password admin!**
- [ ] GitHub secrets terisi semua (6 secrets)
- [ ] GHCR package disetel ke **Public**
- [ ] Push ke `main` → auto deploy sukses
- [ ] Backup cron aktif

### 8.2 Tes API

```bash
# Health check
curl https://hris.perusahaan.com/health
# → {"status":"ok"}

# Login test
curl -X POST https://hris.perusahaan.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"nik":"ADM001","password":"admin123"}'
# → {"token":"eyJ...","role":"Super Admin"}

# List employees (butuh token)
curl https://hris.perusahaan.com/api/employees \
  -H "Authorization: Bearer TOKEN_DARI_LOGIN"
```

---

## 9. Backup Database

### 9.1 Setup Backup Otomatis

Script backup ada di `scripts/backup-db.sh`. Setelah `setup-vps.sh` dijalankan, script akan terdownload ke `~/hris-prod/backup-db.sh`.

```bash
# Test manual dulu
cd ~/hris-prod
bash backup-db.sh
# → Backup saved: backups/db-20260506-020000.sql.gz

# Setup cron (tiap jam 2 pagi)
crontab -e
# Tambahkan baris ini:
0 2 * * * cd ~/hris-prod && bash backup-db.sh
```

Backup disimpan di `~/hris-prod/backups/`, otomatis hapus yang > 7 hari.

### 9.2 Restore Database

```bash
cd ~/hris-prod

# Stop web dulu (supaya tidak ada writes)
docker compose -f docker-compose.ghcr.yml stop web

# Restore dari backup
gunzip -c backups/db-20260506-020000.sql.gz | \
  docker compose -f docker-compose.ghcr.yml exec -T mysql \
  mysql -uroot -p"$(grep DB_PASSWORD .env | cut -d= -f2)" \
  --database=hris_db

# Start web lagi
docker compose -f docker-compose.ghcr.yml start web
```

---

## 10. Update Aplikasi

### 10.1 Otomatis via CI/CD (Rekomendasi)

```bash
git checkout main
git merge develop
git push origin main
# → Auto: Test → Build → Push GHCR → Deploy VPS
```

Tidak perlu sentuh VPS sama sekali!

### 10.2 Manual (Jika CI/CD Bermasalah)

```bash
# Di VPS:
cd ~/hris-prod
docker compose -f docker-compose.ghcr.yml pull web
docker compose -f docker-compose.ghcr.yml up -d

# Cek health
curl http://localhost:5000/health
```

### 10.3 Rollback ke Versi Sebelumnya

GHCR menyimpan tag `production-N` (dari Manual Deploy) dan `latest-sha-XXXXX` (dari CI/CD).

```bash
# Di VPS — lihat image yang tersedia
docker images | grep hris-management-system

# Cara 1: Pull versi spesifik berdasarkan SHA tag dari CI/CD
docker pull ghcr.io/rizalibrah08/hris-management-system:latest-sha-XXXXX
docker tag ghcr.io/rizalibrah08/hris-management-system:latest-sha-XXXXX \
  ghcr.io/rizalibrah08/hris-management-system:latest

# Cara 2: Pull versi berdasarkan nomor deploy (dari Manual Deploy)
docker pull ghcr.io/rizalibrah08/hris-management-system:production-42
# Edit image tag di docker-compose.ghcr.yml atau gunakan environment variable

# Restart
docker compose -f docker-compose.ghcr.yml up -d
```

---

## 11. Environment Variables Reference

### 11.1 Variabel Wajib

| Variable | Deskripsi | Default | Contoh |
|----------|-----------|---------|--------|
| `DB_PASSWORD` | Password root MySQL | *(wajib)* | hasil `openssl rand -base64 24` |
| `JWT_SECRET` | Secret untuk JWT token | *(wajib)* | hasil `openssl rand -base64 48` |
| `DB_NAME` | Nama database | `hris_db` | `hris_db` |
| `DB_HOST` | Host MySQL | `mysql` | `mysql` (Docker) / `localhost` (dev) |
| `DB_PORT` | Port MySQL | `3306` | `3306` |
| `DB_USER` | User MySQL | `root` | `root` |
| `PORT` | Port aplikasi | `5000` | `5000` |
| `NODE_ENV` | Environment | `production` | `production` / `development` |
| `JWT_EXPIRY` | Token expiry | `1d` | `1d` / `7d` / `8h` |

### 11.2 Variabel Opsional (Resource Limits)

| Variable | Deskripsi | Default | File |
|----------|-----------|---------|------|
| `MYSQL_MEM_LIMIT` | Memory limit MySQL | `384m` (ghcr) / `512m` (prod) | docker-compose |
| `MYSQL_CPU_LIMIT` | CPU limit MySQL | `0.5` (ghcr) / `1.0` (prod) | docker-compose |
| `WEB_MEM_LIMIT` | Memory limit Web | `256m` | docker-compose |
| `WEB_CPU_LIMIT` | CPU limit Web | `0.5` | docker-compose |
| `GHCR_REPO` | GitHub repo path (lowercase) | `rizalibrah08/hris-management-system` | ghcr compose |

### 11.3 File `.env`

Lokasi file `.env` di VPS: `~/hris-prod/.env`

```env
# Generated by setup-vps.sh
DB_PASSWORD=2I8KjHB/kpO6BRRpu7NUwy+MlUTlWkEh
DB_NAME=hris_db
DB_HOST=mysql
DB_PORT=3306
DB_USER=root
JWT_SECRET=B8JfMtl+d4viqFyFQtyQovbFp2gySdUTSIQX86X8HNNtPePZK0JdaRpMfR8tV1my
JWT_EXPIRY=1d
PORT=5000
NODE_ENV=production
GHCR_REPO=rizalibrah08/hris-management-system
```

> **JANGAN** commit file `.env` ke repository. File ini sudah ada di `.gitignore`.

---

## 12. Monitoring & Logs

### 12.1 Container Status

```bash
cd ~/hris-prod

# Cek semua container
docker compose -f docker-compose.ghcr.yml ps
# Harus: hris-mysql (healthy), hris-web (healthy)

# Cek health detail
docker inspect hris-web --format='{{.State.Health.Status}}'
docker inspect hris-mysql --format='{{.State.Health.Status}}'
```

### 12.2 Logs

```bash
# Logs real-time (Ctrl+C untuk stop)
docker compose -f docker-compose.ghcr.yml logs -f web
docker compose -f docker-compose.ghcr.yml logs -f mysql

# Logs 50 baris terakhir
docker compose -f docker-compose.ghcr.yml logs --tail=50 web
```

### 12.3 Resource Usage

```bash
# CPU/RAM usage semua container
docker stats

# Disk usage
df -h
du -sh ~/hris-prod/*
du -sh ~/hris-prod/backups/

# Docker disk usage
docker system df
```

### 12.4 Restart Services

```bash
# Restart web saja (tanpa restart MySQL)
docker compose -f docker-compose.ghcr.yml restart web

# Restart semua
docker compose -f docker-compose.ghcr.yml restart

# Stop semua (keep data)
docker compose -f docker-compose.ghcr.yml stop

# Start semua
docker compose -f docker-compose.ghcr.yml start
```

---

## 13. Manual Deploy Workflow

Selain CI/CD otomatis (push ke `main`), ada workflow **Manual Deploy** untuk situasi khusus.

### 13.1 Cara Menggunakan

1. Buka https://github.com/Rizalibrah08/hris-management-system/actions
2. Pilih workflow **"Manual Deploy"**
3. Klik **"Run workflow"**
4. Isi parameter:
   - **Environment**: `production` atau `development`
   - **Branch**: `main` (default)
   - **Skip tests**: centang hanya untuk emergency
5. Klik **"Run workflow"**

### 13.2 Perbedaan Deploy per Environment

| | Production | Development |
|---|---|---|
| **Compose file** | `docker-compose.ghcr.yml` | `docker-compose.yml` |
| **Image source** | Pull dari GHCR | Build lokal di VPS |
| **Resource limits** | Ya (256MB web, 384MB MySQL) | Tidak ada |
| **Health check** | Ya | Tidak ada |
| **Security hardening** | Ya (read-only, no-new-privileges) | Tidak ada |
| **Secrets** | `DB_PASSWORD_PROD`, `JWT_SECRET_PROD` | `DB_PASSWORD_DEV`, `JWT_SECRET_DEV` |

### 13.3 Secrets yang Dibutuhkan

Untuk production deploy (sama seperti CI/CD otomatis):
- `PROD_IP` — IP VPS production
- `SSH_USER` — Username SSH
- `SSH_KEY` — Private key SSH
- `DB_PASSWORD_PROD` — Password database production
- `JWT_SECRET_PROD` — JWT secret production
- `GITHUB_TOKEN` — Otomatis (tidak perlu set manual)

Untuk development deploy (tambahan):
- `VPS_DEV_IP` — IP VPS development (opsional)
- `VPS_USER` — Username SSH development (opsional)
- `VPS_SSH_KEY` — Private key SSH development (opsional)
- `DB_PASSWORD_DEV` — Password database development (opsional)
- `JWT_SECRET_DEV` — JWT secret development (opsional)

---

## 14. Troubleshooting

### "Image not found / denied" di VPS

```bash
# 1. Cek nama image di .env — harus LOWERCASE!
grep GHCR_REPO .env
# → GHCR_REPO=rizalibrah08/hris-management-system

# 2. Cek package GHCR sudah Public
# Buka: https://github.com/Rizalibrah08/hris-management-system/pkgs/container/hris-management-system
# Package settings → Change visibility → Public

# 3. Kalau masih error, login manual:
echo "YOUR_GITHUB_TOKEN" | docker login ghcr.io -u Rizalibrah08 --password-stdin
```

### Container conflict (nama sudah dipakai)

```bash
# Hapus paksa container lama
docker rm -f hris-mysql hris-web 2>/dev/null

# Start ulang
cd ~/hris-prod
docker compose -f docker-compose.ghcr.yml up -d
```

### MySQL "setgid: Operation not permitted" (AWS VPS)

Error ini muncul di VPS AWS karena kernel membatasi `setgid` di container:

```
[ERROR] [MY-010126] [Server] setgid: Operation not permitted
```

**Solusi**: Compose file (`docker-compose.ghcr.yml`) sudah dikonfigurasi:
- `mysql:8.0` (bukan `mysql:8` / `mysql:8.4`)
- `security_opt: seccomp:unconfined`
- `cap_add: [SETGID, SETUID]`
- Tidak pakai `no-new-privileges`

Kalau masih error, download ulang compose file:

```bash
cd ~/hris-prod
docker compose -f docker-compose.ghcr.yml down
docker rm -f hris-mysql hris-web 2>/dev/null
curl -sL "https://raw.githubusercontent.com/Rizalibrah08/hris-management-system/main/docker-compose.ghcr.yml" -o docker-compose.ghcr.yml
docker compose -f docker-compose.ghcr.yml up -d
```

### Database connection error

```bash
# Cek MySQL sudah healthy
docker compose -f docker-compose.ghcr.yml ps
# mysql harus "healthy"

# Tunggu 30 detik, restart web container
docker compose -f docker-compose.ghcr.yml restart web

# Jika masih gagal, cek password
docker compose -f docker-compose.ghcr.yml exec mysql \
  mysql -uroot -p"$(grep DB_PASSWORD .env | cut -d= -f2)" -e "SELECT 1;"
```

### CI/CD Deploy gagal

1. Buka **Actions** tab → klik workflow run
2. Expand job **Deploy to VPS** → lihat error
3. Kemungkinan:
   - `SSH_KEY` salah format → cek tidak terpotong, harus include `-----BEGIN/END OPENSSH PRIVATE KEY-----`
   - `PROD_IP` tidak bisa diakses → cek firewall allow port 22
   - `.env` di VPS corrupt → generate ulang
   - GHCR package belum Public → cek [Section 5.1](#51-set-package-ghcr-ke-public)

### Cloudflare "Error 502 Bad Gateway"

```bash
# Di VPS:
systemctl status nginx       # Cek nginx running
nginx -t                     # Cek config valid
curl http://127.0.0.1:5000/health  # Cek app running

# Kalau app jalan tapi nginx error:
# Cek upstream di nginx config → harus proxy_pass http://127.0.0.1:5000
# (bukan http://web:5000 — itu hanya untuk Docker-internal)
```

### VPS kehabisan disk

```bash
# Cleanup Docker
docker image prune -af
docker system prune -f

# Cek folder besar
du -sh ~/hris-prod/* | sort -h

# Cek backup size
du -sh ~/hris-prod/backups/
```

### Web container crash loop

```bash
# Cek logs detail
docker compose -f docker-compose.ghcr.yml logs --tail=100 web

# Cek apakah .env ada
ls -la ~/hris-prod/.env

# Cek apakah MySQL bisa diakses dari web
docker compose -f docker-compose.ghcr.yml exec web \
  nc -z mysql 3306 && echo "MySQL reachable" || echo "MySQL unreachable"

# Jika web container terus restart, cek resource
docker stats --no-stream
free -h
```

---

## 15. Cheatsheet

### VPS Commands

```bash
cd ~/hris-prod

# Start / Stop
docker compose -f docker-compose.ghcr.yml up -d      # Start
docker compose -f docker-compose.ghcr.yml down         # Stop (keep data)
docker compose -f docker-compose.ghcr.yml down -v       # ⚠️ Stop + HAPUS DATA

# Update
docker compose -f docker-compose.ghcr.yml pull web     # Pull image baru
docker compose -f docker-compose.ghcr.yml up -d       # Restart dengan image baru

# Monitoring
docker compose -f docker-compose.ghcr.yml ps           # Status container
docker compose -f docker-compose.ghcr.yml logs -f web  # Log realtime
docker stats                                            # CPU/RAM usage

# Database
docker compose -f docker-compose.ghcr.yml exec mysql mysql -uroot -p"$(grep DB_PASSWORD .env | cut -d= -f2)" hris_db
bash backup-db.sh                                       # Backup manual
```

### GitHub Workflow

```bash
# Development (test only, NO deploy)
git push origin develop

# Production (auto deploy)
git push origin main

# Manual deploy (dari GitHub Actions UI)
# Buka: https://github.com/Rizalibrah08/hris-management-system/actions
# Pilih "Manual Deploy" → Run workflow

# Cek status
# Buka: https://github.com/Rizalibrah08/hris-management-system/actions
```

### Secrets Checklist

| # | Secret | Status |
|---|--------|:---:|
| 1 | `PROD_IP` | ☐ |
| 2 | `SSH_USER` | ☐ |
| 3 | `SSH_KEY` | ☐ |
| 4 | `DB_PASSWORD_PROD` | ☐ |
| 5 | `JWT_SECRET_PROD` | ☐ |
| 6 | `DOMAIN` | ☐ |

### File Penting

| File | Lokasi |
|------|--------|
| `.env` | `~/hris-prod/.env` |
| Compose file | `~/hris-prod/docker-compose.ghcr.yml` |
| Backup DB | `~/hris-prod/backups/` |
| Backup script | `~/hris-prod/backup-db.sh` |
| Nginx config | `/etc/nginx/sites-available/hris` |
| SSL cert | `/etc/nginx/ssl/cert.pem` |
| SSL key | `/etc/nginx/ssl/key.pem` |

### Link Penting

| Link | Keterangan |
|------|-----------|
| https://github.com/Rizalibrah08/hris-management-system/actions | CI/CD status |
| https://github.com/Rizalibrah08/hris-management-system/pkgs/container/hris-management-system | GHCR package |
| https://github.com/Rizalibrah08/hris-management-system/settings/secrets/actions | GitHub Secrets |
| Cloudflare Dashboard → DNS | DNS records |
| Cloudflare Dashboard → SSL/TLS | SSL settings |

---

*Panduan deploy lengkap — dari nol sampai production.*
*Diperbarui: Mei 2026 — Fix manual-deploy workflow (GHCR pull untuk production), fix setup-vps Cloudflare Tunnel, tambah env vars reference, monitoring, manual deploy workflow, troubleshooting update.*