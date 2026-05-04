# CI/CD GitHub Actions - Setup Guide

Panduan lengkap untuk mengatur CI/CD pipeline HRIS dengan GitHub Actions.

---

## 📋 Overview

Pipeline ini:
- ✅ **Test** — Cek build setiap push
- 🐳 **Build Docker** — Build dan push image ke GHCR (hanya `main`)
- 🚀 **Deploy** — Auto deploy ke VPS (hanya `main`)

### 🔵 Develop Mode (`develop` branch)
```
Push develop → Test & Build Check → Selesai (TIDAK deploy)
```
Aman buat ngoding, VPS tidak tersentuh.

### 🔴 Production Mode (`main` branch)
```
Push main → Test → Build & Push GHCR → Auto Deploy VPS
```
Merge/push ke main = langsung deploy otomatis.

---

## 🔧 Setup Secrets di GitHub

Masuk ke **Settings > Secrets and variables > Actions > New repository secret**, tambahkan:

### Wajib

| Secret | Deskripsi | Contoh |
|--------|-----------|--------|
| `PROD_IP` | IP Address VPS | `54.123.45.67` |
| `SSH_USER` | Username SSH VPS | `ubuntu` atau `root` |
| `SSH_KEY` | Private Key SSH (isi lengkap) | `-----BEGIN OPENSSH PRIVATE KEY-----...` |
| `DB_PASSWORD_PROD` | Password MySQL | `password_aman_123` |
| `JWT_SECRET_PROD` | JWT Secret | `jwt_secret_panjang_dan_acak` |
| `DOMAIN` | Domain aplikasi | `hris.perusahaan.com` |

---

## 🔐 Cara Generate SSH Key

```bash
# 1. Generate key pair di komputer lokal
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/hris_deploy

# 2. Copy public key ke VPS
cat ~/.ssh/hris_deploy.pub
# Copy isi file, lalu paste ke ~/.ssh/authorized_keys di VPS

# 3. Copy private key ke GitHub Secrets
cat ~/.ssh/hris_deploy
# Copy isi lengkap (termasuk -----BEGIN... dan -----END...)
# Paste ke secret SSH_KEY di GitHub
```

---

## 📁 Struktur File CI/CD

```
.github/
├── workflows/
│   ├── ci-cd.yml          # Main workflow (auto trigger)
│   ├── manual-deploy.yml  # Manual deploy
│   └── README.md          # File ini
├── CI_CD_ARCHITECTURE.md  # Arsitektur CI/CD
└── QUICK_REFERENCE.md     # Quick reference
```

---

## 🚀 Alur Kerja Pipeline

```
┌──────────────────────────────────────────────────────────────┐
│                     GitHub Repository                         │
│                                                               │
│   ┌──────────┐   ┌──────────┐   ┌──────────────────────┐    │
│   │  Push    │   │   PR     │   │   Manual Trigger     │    │
│   │  main    │   │  opened  │   │   (workflow_dispatch)│    │
│   └────┬─────┘   └────┬─────┘   └──────────┬───────────┘    │
└────────┼──────────────┼────────────────────┼────────────────┘
         │              │                    │
         ▼              ▼                    ▼
┌──────────────────────────────────────────────────────────────┐
│                     GitHub Actions Runner                     │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Stage 1: Test & Build Check                            │  │
│  │  • npm ci (install dependencies)                        │  │
│  │  • npm run build (build frontend)                       │  │
│  └────────────────────────────────────────────────────────┘  │
│                              │                                │
│              (HANYA jika push ke main)                        │
│                              ▼                                │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Stage 2: Build Docker Image                            │  │
│  │  • Build multi-stage image (AMD64)                      │  │
│  │  • Push ke GitHub Container Registry (ghcr.io)          │  │
│  │  • Tag: latest, latest-sha-xxxx                         │  │
│  └────────────────────────────────────────────────────────┘  │
│                              │                                │
│              (HANYA jika push ke main)                        │
│                              ▼                                │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Stage 3: Deploy ke VPS                                 │  │
│  │  • SSH ke VPS                                           │  │
│  │  • Tulis .env dari secrets                              │  │
│  │  • docker compose pull (image baru)                     │  │
│  │  • docker compose up -d (deploy)                        │  │
│  │  • Health check (curl /health)                          │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

---

## 🔍 Monitoring & Logs

### GitHub Actions Logs
- Buka tab **Actions** di repository
- Klik workflow run untuk melihat detail
- Setiap job bisa di-expand untuk melihat logs

### VPS Logs (setelah deploy)
```bash
# SSH ke VPS
ssh user@your-vps-ip

# Lihat logs container
cd ~/hris-prod
docker compose -f docker-compose.ghcr.yml logs -f web
docker compose -f docker-compose.ghcr.yml logs -f mysql

# Cek status container
docker compose -f docker-compose.ghcr.yml ps

# Health check
curl http://localhost:5000/health
```

---

## 🔄 Rollback (Jika Deploy Gagal)

### Manual Rollback
```bash
# SSH ke VPS
ssh user@your-vps-ip
cd ~/hris-prod

# Lihat image yang tersedia
docker images | grep hris-management-system

# Rollback ke versi sebelumnya
docker compose -f docker-compose.ghcr.yml down
docker pull ghcr.io/rizalibrah08/hris-management-system:latest-sha-XXXXX
docker tag ghcr.io/rizalibrah08/hris-management-system:latest-sha-XXXXX ghcr.io/rizalibrah08/hris-management-system:latest
docker compose -f docker-compose.ghcr.yml up -d
```

> Pipeline akan fail jika health check gagal, tapi container tetap berjalan dengan versi lama.

---

## 🛡️ Security Best Practices

1. **Jangan hardcode secrets** - Selalu gunakan GitHub Secrets
2. **SSH Key terpisah** - Gunakan key khusus untuk CI/CD
3. **Enable 2FA** - Aktifkan 2FA untuk akun GitHub
4. **GHCR Public** - Set package visibility ke Public
5. **Backup rutin** - Setup cron backup database

---

## 📝 Contoh Penggunaan

### Ngoding aman di develop
```bash
git checkout develop
git add .
git commit -m "feat: add new feature"
git push origin develop
# → Test jalan, tapi TIDAK deploy. Aman!
```

### Deploy ke Production
```bash
git checkout main
git merge develop
git push origin main
# → Auto: Test → Build → Push GHCR → Deploy VPS 🚀
```

---

## 🐛 Troubleshooting

### Pipeline Failed di "Test"
```bash
# Fix di lokal dulu
cd hris-web
npm run build
# Fix semua error, lalu push ulang
```

### Deploy Failed - SSH Error
- Cek `SSH_KEY` sudah benar (format OpenSSH)
- Pastikan public key sudah di `~/.ssh/authorized_keys` di VPS
- Cek firewall VPS allow port 22

### Deploy Failed - Health Check
- SSH ke VPS, cek logs: `docker compose logs web`
- Kemungkinan: DB belum ready, port conflict, atau env vars salah

### GHCR "denied"
- Cek package visibility di GitHub → Packages → **Change visibility → Public**
- Cek `GHCR_REPO` di `.env` VPS sudah lowercase (`rizalibrah08/...`)

---

## 📚 Referensi

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Build Push Action](https://github.com/docker/build-push-action)
- [SSH Action](https://github.com/appleboy/ssh-action)

---

## ✅ Checklist Setup

- [ ] Tambahkan 6 secrets ke GitHub
- [ ] Setup SSH key di VPS
- [ ] Set package GHCR ke Public
- [ ] Push ke `develop` → cek test jalan ✅
- [ ] Merge ke `main` → cek auto deploy jalan 🚀
- [ ] Verifikasi `https://domain.com` bisa diakses

**Butuh bantuan?** Cek logs di GitHub Actions tab.
