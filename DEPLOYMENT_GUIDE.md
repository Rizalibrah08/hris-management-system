# 🚀 HRIS Deployment Guide — Full Lengkap (Zero to Production)

Panduan deploy lengkap dari nol: beli VPS → setup domain → Cloudflare → GitHub CI/CD → auto deploy.

> 🔥 **Arsitektur**: Build di GitHub Actions → push ke GHCR → VPS pull ringan → Cloudflare DNS & SSL.
> - VPS tidak perlu build (cukup 1GB RAM)
> - Image di-build gratis oleh GitHub Actions
> - Cloudflare gratis: DNS, SSL, DDoS protection



---

## 📋 Daftar Isi

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
11. [Troubleshooting](#11-troubleshooting)
12. [Cheatsheet](#12-cheatsheet)



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
│  🌐 DNS: hris.domain.com → VPS IP                       │
│  🔒 SSL: Full (strict) — gratis, auto-renew             │
│  🛡️ DDoS protection, CDN cache, WAF                    │
└─────────────────────────────────────────────────────────┘
```

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

> ⏱️ **Propagasi DNS**: 5 menit sampai 24 jam. Biasanya < 30 menit.
> Cek status: Cloudflare dashboard akan menunjukkan "✅ Active" kalau sudah berhasil.

### 3.3 Tambahkan DNS Record

Di dashboard Cloudflare → **DNS** → **Records** → **Add record**:

| Type | Name | Content | Proxy Status |
|------|------|---------|:---:|
| `A` | `hris` | `ISI_IP_VPS_KAMU` | 🟠 Proxied |
| `A` | `@` | `ISI_IP_VPS_KAMU` | 🟠 Proxied |

Contoh:
- `hris.perusahaan.com` → `54.123.45.67`
- `perusahaan.com` → `54.123.45.67`

> 🟠 **Proxy ON** (orange cloud) = traffic lewat Cloudflare → dapat DDoS protection, CDN, SSL.

### 3.4 Setup SSL/TLS

**Cloudflare Dashboard** → **SSL/TLS** → **Overview** → Pilih: **Full (strict)**

| Mode | Keamanan | Perlu Setup Nginx? |
|------|:--:|:--:|
| **Flexible** | Rendah | Tidak |
| **Full** | Sedang | Ya (self-signed OK) |
| **Full (strict)** ✅ | Tinggi | Ya (valid cert) |

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

Satu command, semua otomatis:

```bash
bash -c "$(curl -fsSL https://raw.githubusercontent.com/Rizalibrah08/hris-management-system/main/scripts/setup-vps.sh)"
```

Script ini akan:
1. ✅ Install Docker (kalau belum)
2. ✅ Download `docker-compose.ghcr.yml`
3. ✅ Generate `.env` dengan password random aman
4. ✅ Pull image dari GHCR
5. ✅ Start MySQL + Web app
6. ✅ Setup firewall (UFW)
7. ✅ Download script backup

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
# → {"token":"eyJ...","role":"Super Admin","employeeId":null}
```

### 4.6 Akses dari Browser

Buka `http://IP_VPS:5000` → harus muncul halaman login HRIS.

> Login default: **NIK**: `ADM001` | **Password**: `admin123`
> ⚠️ **GANTI password admin setelah login pertama!**

---

## 5. Setup GitHub

### 5.1 Set Package GHCR ke Public

1. Buka https://github.com/Rizalibrah08/hris-management-system/pkgs/container/hris-management-system
2. Klik **Package settings** (kanan bawah)
3. Scroll ke **Danger Zone** → **Change visibility** → **Public**

> Kalau belum ada package, jalankan dulu workflow CI/CD (Section 6) atau trigger manual deploy.

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
🔵 DEVELOP (branch: develop)
   Push → Test & Build Check → ✅ Selesai
   AMAN: Tidak build image, tidak deploy, VPS tidak tersentuh.

🔴 PRODUCTION (branch: main)
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
# → GitHub Actions: test & build check ✅ (tidak deploy)
```

### 6.3 Production — Deploy

```bash
# Sudah yakin fitur OK? Merge ke main:
git checkout main
git merge develop
git push origin main

# → GitHub Actions otomatis:
#   🔍 Test
#   📦 Build Docker image
#   ⬆️ Push ke GHCR
#   🚀 SSH ke VPS → pull image → restart → health check
```

### 6.4 Cek Status Deploy

1. Buka https://github.com/Rizalibrah08/hris-management-system/actions
2. Klik workflow run terbaru
3. Harus lihat 3 job sukses: **Test** → **Build & Push to GHCR** → **Deploy to VPS**

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

    # Proxy ke aplikasi Express
    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

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
}
```

### 7.4 Aktifkan Nginx

```bash
# Rate limit zone
echo 'limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;' > /etc/nginx/conf.d/rate-limit.conf

# Aktifkan site
ln -sf /etc/nginx/sites-available/hris /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test config
nginx -t

# Reload
systemctl reload nginx
systemctl enable nginx
```

> Setelah ini, akses via `https://hris.perusahaan.com` — harusnya gembok hijau 🔒.

---

## 8. Verifikasi

### 8.1 Checklist Go-Live

- [ ] VPS running, aplikasi bisa diakses via `http://IP:5000`
- [ ] Cloudflare DNS pointing ke VPS IP (🟠 proxy on)
- [ ] SSL mode **Full (strict)** (atau Flexible)
- [ ] Nginx running (kalau pakai Full mode)
- [ ] `https://domain.com` bisa dibuka, gembok hijau 🔒
- [ ] Login ADM001 / admin123 berhasil
- [ ] Semua halaman berfungsi (Dashboard, Employee, Attendance, Payroll)
- [ ] **GANTI password admin!**
- [ ] GitHub 6 secrets terisi semua
- [ ] Package GHCR disetel ke **Public**
- [ ] Push ke main → auto deploy sukses
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

Script backup sudah terdownload di `~/hris-prod/backup-db.sh`. Setup cron:

```bash
# Test manual dulu
cd ~/hris-prod
bash backup-db.sh
# → ✅ Backup saved: backups/db-20260504-020000.sql.gz

# Setup cron (tiap jam 2 pagi)
crontab -e
# Tambahkan baris ini:
0 2 * * * cd ~/hris-prod && bash backup-db.sh
```

Backup disimpan di `~/hris-prod/backups/`, otomatis hapus yang > 7 hari.

### 9.2 Restore Database

```bash
cd ~/hris-prod

# Stop web dulu
docker compose -f docker-compose.ghcr.yml stop web

# Restore dari backup
gunzip -c backups/db-20260504-020000.sql.gz | \
  docker compose -f docker-compose.ghcr.yml exec -T mysql \
  mysql -uroot -p"$(grep DB_PASSWORD .env | cut -d= -f2)" hris_db

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
# → Auto: Test → Build → Push GHCR → Deploy VPS 🚀
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

### 10.3 Rollback

```bash
# Di VPS — lihat image yang tersedia
docker images | grep hris-management-system

# Pull versi spesifik (dari GitHub Actions log)
docker pull ghcr.io/rizalibrah08/hris-management-system:latest-sha-XXXXX
docker tag ghcr.io/rizalibrah08/hris-management-system:latest-sha-XXXXX \
  ghcr.io/rizalibrah08/hris-management-system:latest

# Restart
docker compose -f docker-compose.ghcr.yml up -d
```

---

## 11. Troubleshooting

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

### Container tidak start

```bash
# Lihat logs detail
docker compose -f docker-compose.ghcr.yml logs web
docker compose -f docker-compose.ghcr.yml logs mysql

# Cek resource
docker stats
free -h
df -h
```

### Database connection error

```bash
# Cek MySQL sudah healthy
docker compose -f docker-compose.ghcr.yml ps
# mysql harus "healthy"

# Tunggu 30 detik, restart web container
docker compose -f docker-compose.ghcr.yml restart web
```

### CI/CD Deploy gagal

1. Buka **Actions** tab → klik workflow run
2. Expand job **Deploy to VPS** → lihat error
3. Kemungkinan:
   - `SSH_KEY` salah format → cek tidak terpotong
   - `PROD_IP` tidak bisa diakses → cek firewall allow port 22
   - `.env` di VPS corrupt → generate ulang

### Cloudflare "Error 502 Bad Gateway"

```bash
# Di VPS:
systemctl status nginx
nginx -t
curl http://127.0.0.1:5000/health
# → Pastikan aplikasi jalan
```

### VPS kehabisan disk

```bash
# Cleanup
docker image prune -af
docker system prune -f

# Cek folder besar
du -sh ~/hris-prod/* | sort -h
```

---

## 12. Cheatsheet

### VPS Commands

```bash
cd ~/hris-prod

# Start / Stop
docker compose -f docker-compose.ghcr.yml up -d      # Start
docker compose -f docker-compose.ghcr.yml down        # Stop (keep data)
docker compose -f docker-compose.ghcr.yml down -v     # ⚠️ Stop + HAPUS DATA

# Update
docker compose -f docker-compose.ghcr.yml pull web    # Pull image baru
docker compose -f docker-compose.ghcr.yml up -d       # Restart

# Monitoring
docker compose -f docker-compose.ghcr.yml ps          # Status container
docker compose -f docker-compose.ghcr.yml logs -f web # Log realtime
docker stats                                           # CPU/RAM usage

# Database
docker compose -f docker-compose.ghcr.yml exec mysql mysql -uroot -p hris_db
bash backup-db.sh                                     # Backup
```

### GitHub Workflow

```bash
# Development (test only, NO deploy)
git push origin develop

# Production (auto deploy 🚀)
git push origin main

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
| Nginx config | `/etc/nginx/sites-available/hris` |
| SSL cert | `/etc/nginx/ssl/cert.pem` |

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
*Terakhir update: Mei 2026*
