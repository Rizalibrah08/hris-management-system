# 🚀 HRIS Deployment Guide — GHCR + Cloudflare

Panduan deploy: **build di GitHub Actions → push ke GHCR → VPS pull ringan → Cloudflare DNS & SSL**.

> 🔥 **Kenapa arsitektur ini?**
> - VPS tidak perlu build (cukup 1GB RAM)
> - Image di-build oleh server GitHub (gratis, powerful)
> - Cloudflare gratis: DNS, SSL, DDoS protection, CDN cache
> - VPS hanya pull & run image (~50MB pull, bukan 500MB build)

---

## 🏗️ Arsitektur

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

## 1. Persiapan

### 1.1 Yang harus disiapkan

| Item | Keterangan |
|------|------------|
| **VPS** | Ubuntu 22.04, **1GB RAM cukup**, 10GB disk |
| **Domain** | Beli di mana saja (contoh: `hris.perusahaan.com`) |
| **Cloudflare** | Akun gratis di [cloudflare.com](https://cloudflare.com) |
| **GitHub** | Repository dengan workflow CI/CD |

### 1.2 Biaya

| Item | Biaya |
|------|-------|
| VPS 1GB (Hetzner) | ~Rp 60rb/bln |
| VPS 1GB (DigitalOcean) | ~Rp 90rb/bln |
| Domain .com | ~Rp 150rb/**tahun** |
| Cloudflare | **Gratis** |
| GitHub Actions | **Gratis** (2000 menit/bln) |
| GHCR storage | **Gratis** (public repo) |
| **Total** | ~Rp 70-100rb/bulan |

---

## 2. Setup Cloudflare DNS

### 2.1 Tambahkan domain ke Cloudflare

1. Buka [cloudflare.com](https://cloudflare.com) → Sign up/login
2. Klik **Add a Site** → masukkan domain kamu
3. Pilih plan **Free**
4. Cloudflare akan memberikan **2 nameserver baru**:
   ```
   nolan.ns.cloudflare.com
   uma.ns.cloudflare.com
   ```

### 2.2 Ganti nameserver di registrar

Buka tempat kamu beli domain (Niagahoster, Namecheap, dll).  
Ganti nameserver ke nameserver Cloudflare di atas.

> ⏱️ Propagasi DNS: 5 menit - 24 jam (biasanya < 30 menit)

### 2.3 Tambahkan DNS record

Di dashboard Cloudflare → DNS → Records → **Add record**:

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| A | `hris` | `ISI_IP_VPS` | 🟠 Proxied |

Contoh: `hris.perusahaan.com` → `203.0.113.10`

### 2.4 Setup SSL/TLS

**Cloudflare Dashboard** → SSL/TLS → Overview:

Pilih mode: **Full (strict)**

> **Penjelasan mode SSL Cloudflare**:
> - **Flexible**: Visitor ↔ Cloudflare (HTTPS) → Cloudflare ↔ VPS (HTTP). ✅ Paling gampang, no VPS setup.
> - **Full**: Visitor ↔ Cloudflare (HTTPS) → Cloudflare ↔ VPS (HTTPS, self-signed OK). ✅ Rekomendasi.
> - **Full (strict)**: Sama seperti Full, tapi certificate di VPS harus valid. Paling aman.

**Untuk mode Full (rekomendasi)**, buat Origin Certificate:

1. Cloudflare → SSL/TLS → Origin Server → **Create Certificate**
2. Pilih "Let Cloudflare generate a private key and a CSR"
3. Simpan **2 file**: `cert.pem` dan `key.pem`
4. Upload ke VPS nanti

---

## 3. Setup VPS

### 3.1 Buat & login VPS

```bash
ssh root@IP_VPS
```

### 3.2 Update sistem

```bash
apt update && apt upgrade -y
timedatectl set-timezone Asia/Jakarta
```

### 3.3 Install Docker

```bash
curl -fsSL https://get.docker.com | sh
newgrp docker
```

### 3.4 Jalankan setup script

```bash
# Setup dengan 1 command
bash -c "$(curl -fsSL https://raw.githubusercontent.com/Rizalibrah08/hris-management-system/main/scripts/setup-vps.sh)"
```

> Script ini otomatis:
> 1. Install Docker
> 2. Download `docker-compose.ghcr.yml` dari GitHub
> 3. Generate `.env` dengan secrets aman
> 4. Pull image dari GHCR
> 5. Start MySQL + Web
> 6. Setup firewall

### 3.5 Manual (kalau tidak pakai script)

```bash
# 1. Buat folder
mkdir -p ~/hris-prod && cd ~/hris-prod

# 2. Download compose file
curl -sLO https://raw.githubusercontent.com/Rizalibrah08/hris-management-system/main/docker-compose.ghcr.yml

# 3. Generate secrets & buat .env
openssl rand -base64 24  # → copy output untuk DB_PASSWORD
openssl rand -base64 48  # → copy output untuk JWT_SECRET

cat > .env << 'EOF'
DB_PASSWORD=PASTE_DB_PASSWORD
DB_NAME=hris_db
DB_HOST=mysql
DB_PORT=3306
DB_USER=root
JWT_SECRET=PASTE_JWT_SECRET
JWT_EXPIRY=1d
PORT=5000
NODE_ENV=production
GHCR_REPO=rizalibrah08/hris-management-system
EOF

chmod 600 .env

# 4. Pull & start
docker compose -f docker-compose.ghcr.yml up -d

# 5. Cek health
curl http://localhost:5000/health
```

---

## 4. Setup SSL di VPS (untuk mode Cloudflare Full)

### 4.1 Upload Origin Certificate

Dari file yang didownload dari Cloudflare (Step 2.4):

```bash
# Di VPS:
mkdir -p /etc/nginx/ssl

# Upload cert.pem dan key.pem (copy-paste isinya)
nano /etc/nginx/ssl/cert.pem
nano /etc/nginx/ssl/key.pem

chmod 600 /etc/nginx/ssl/key.pem
```

### 4.2 Install Nginx

```bash
apt install nginx -y
```

### 4.3 Buat nginx config

```bash
nano /etc/nginx/sites-available/hris
```

Isi:
```nginx
server {
    listen 80;
    server_name hris.perusahaan.com;

    # Redirect ke HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name hris.perusahaan.com;

    # SSL — Origin Certificate dari Cloudflare
    ssl_certificate     /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    ssl_protocols       TLSv1.2 TLSv1.3;
    ssl_ciphers         HIGH:!aNULL:!MD5;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Proxy ke aplikasi
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Rate limit login
    location /api/auth/login {
        limit_req zone=login burst=3 nodelay;
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 4.4 Aktifkan & reload

```bash
# Definisikan rate limit zone
echo 'limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;' > /etc/nginx/conf.d/rate-limit.conf

# Aktifkan site
ln -sf /etc/nginx/sites-available/hris /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test & reload
nginx -t
systemctl reload nginx
```

---

## 5. Setup CI/CD GitHub Actions

### 5.1 Mode Development vs Production

| Mode | Branch | Trigger | Yang Terjadi |
|------|--------|---------|--------------|
| 🔵 **Dev** | `develop` | Push | Test & build check saja — **TIDAK deploy** |
| 🔴 **Prod** | `main` | Push / Merge | Test → Build image → Push GHCR → **Auto deploy ke VPS** |

> 💡 **Cara kerja**: Ngoding bebas di `develop` tanpa takut deploy. Kalau sudah siap production, merge/push ke `main` — otomatis deploy!

### 5.2 Secrets di GitHub

Buka repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**:

| Secret | Value | Keterangan |
|--------|-------|------------|
| `PROD_IP` | `203.0.113.10` | IP VPS production |
| `SSH_USER` | `root` atau `ubuntu` | Username SSH VPS |
| `SSH_KEY` | `isi private key` | Untuk GitHub login ke VPS |
| `DOMAIN` | `hris.perusahaan.com` | Domain aplikasi |
| `DB_PASSWORD_PROD` | `isi password` | Password MySQL production |
| `JWT_SECRET_PROD` | `isi secret` | JWT secret production |

### 5.3 Setup SSH untuk GitHub Actions

```bash
# Di LAPTOP (bukan VPS), generate key khusus CI/CD:
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/hris_deploy

# Upload public key ke VPS:
ssh-copy-id -i ~/.ssh/hris_deploy.pub root@IP_VPS

# Copy private key → paste ke GitHub Secret "SSH_KEY":
cat ~/.ssh/hris_deploy
```

### 5.4 Test CI/CD

```bash
# Push ke main = auto deploy
git add . && git commit -m "deploy: initial setup" && git push origin main
```

Buka GitHub → **Actions** tab → lihat workflow berjalan.  
3 jobs akan muncul: **Test** → **Build & Push to GHCR** → **Deploy to VPS**.

---

## 6. Verifikasi

### 6.1 Cek dari VPS

```bash
# Health check
curl http://localhost:5000/health
# → {"status":"ok"}

# Login test
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"nik":"ADM001","password":"admin123"}'
# → {"token":"eyJ...","role":"Super Admin","employeeId":null}

# Status container
docker compose -f docker-compose.ghcr.yml ps
```

### 6.2 Cek dari browser

Buka `https://hris.perusahaan.com`:

- [ ] Muncul halaman login
- [ ] Gembok hijau 🔒
- [ ] Login ADM001 / admin123 berhasil
- [ ] Dashboard tampil data
- [ ] Semua halaman bisa diakses

### 6.3 Cek Cloudflare

Dashboard Cloudflare → Analytics:
- [ ] Traffic muncul
- [ ] SSL active
- [ ] No errors

---

## 7. Backup Database

```bash
# Download script backup dari repo
cd ~/hris-prod
curl -sLO https://raw.githubusercontent.com/Rizalibrah08/hris-management-system/main/scripts/backup-db.sh
chmod +x backup-db.sh

# Test jalanin
bash backup-db.sh

# Setup cron (tiap jam 2 pagi)
crontab -e
# Tambah: 0 2 * * * cd ~/hris-prod && bash backup-db.sh
```

---

## 8. Update Aplikasi

### Otomatis (via CI/CD) — Rekomendasi

Cukup push/merge ke `main` branch. GitHub Actions auto:
1. Test kode
2. Build image baru
3. Push ke GHCR
4. SSH ke VPS, pull image, restart container
5. Health check

```bash
git checkout main
git merge develop
git push origin main
# → Auto deploy! 🚀
```

### Manual (kalau CI/CD belum jalan)

```bash
cd ~/hris-prod
docker compose -f docker-compose.ghcr.yml pull web
docker compose -f docker-compose.ghcr.yml up -d
```

---

## 9. Troubleshooting

### "Image not found" di VPS

```bash
# Cek nama image benar
grep GHCR_REPO .env

# Kalau private repo, login dulu:
echo "YOUR_GITHUB_TOKEN" | docker login ghcr.io -u USERNAME --password-stdin
```

### "Connection refused" dari Cloudflare

1. Cek SSL/TLS mode di Cloudflare → **Full (strict)**
2. Cek nginx config valid: `nginx -t`
3. Cek origin certificate sudah diupload

### VPS kehabisan disk

```bash
# Cleanup Docker images lama
docker image prune -af

# Cek folder besar
du -sh ~/hris-prod/* | sort -h
```

### Cloudflare caching halaman lama

- Cloudflare → Caching → Purge Cache → **Purge Everything**
- Atau enable **Development Mode** saat testing

---

## 📋 Cheatsheet

```bash
# === VPS Commands ===
cd ~/hris-prod

# Start/Stop
docker compose -f docker-compose.ghcr.yml up -d      # Start
docker compose -f docker-compose.ghcr.yml down        # Stop (keep data)
docker compose -f docker-compose.ghcr.yml down -v     # ⚠️ Stop + HAPUS DATA

# Update image
docker compose -f docker-compose.ghcr.yml pull web    # Pull image baru
docker compose -f docker-compose.ghcr.yml up -d       # Restart dengan image baru

# Monitoring
docker compose -f docker-compose.ghcr.yml ps          # Status
docker compose -f docker-compose.ghcr.yml logs -f web # Log realtime
docker stats                                           # CPU/RAM

# Database
docker compose -f docker-compose.ghcr.yml exec mysql mysql -uroot -p hris_db
bash backup-db.sh                                     # Backup

# === GitHub Workflow ===
# Dev mode (test only, NO deploy)
git push origin develop

# Production (auto deploy ke VPS)
git push origin main          # → Test → Build → Deploy 🚀
```

---

## 🎯 Checklist Go-Live

- [ ] VPS running, aplikasi bisa diakses via IP:5000
- [ ] Cloudflare DNS pointing ke VPS IP (🟠 proxy on)
- [ ] SSL mode **Full (strict)** di Cloudflare
- [ ] Nginx running dengan Origin Certificate
- [ ] `https://domain.com` bisa dibuka, gembok hijau
- [ ] Login ADM001/admin123 berhasil
- [ ] Semua halaman berfungsi
- [ ] **GANTI password admin!**
- [ ] GitHub secrets terisi (PROD_IP, SSH_USER, SSH_KEY, DB_PASSWORD_PROD, JWT_SECRET_PROD, DOMAIN)
- [ ] CI/CD berjalan (push main → auto deploy)
- [ ] Package GHCR disetel ke **Public**
- [ ] Backup cron aktif

---

*Selesai! Aplikasi HRIS production-ready dengan CI/CD otomatis.*
