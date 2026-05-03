# CI/CD GitHub Actions - Setup Guide

Panduan lengkap untuk mengatur CI/CD pipeline HRIS dengan GitHub Actions.

---

## 📋 Overview

Pipeline ini akan otomatis:
1. ✅ **Test & Lint** - Cek kualitas kode
2. 🔒 **Security Scan** - Scan vulnerability
3. 🐳 **Build Docker** - Build dan push image ke GitHub Container Registry
4. 🚀 **Deploy** - Deploy ke VPS (Development/Production)

---

## 🔧 Setup Secrets di GitHub

Masuk ke **Settings > Secrets and variables > Actions**, lalu tambahkan secrets berikut:

### Wajib untuk Deploy

| Secret | Deskripsi | Contoh |
|--------|-----------|--------|
| `VPS_DEV_IP` | IP Address VPS Development | `203.0.113.45` |
| `VPS_PROD_IP` | IP Address VPS Production | `198.51.100.20` |
| `VPS_USER` | Username SSH VPS | `ubuntu` atau `root` |
| `VPS_SSH_KEY` | Private Key SSH (isi lengkap dengan header/footer) | `-----BEGIN OPENSSH PRIVATE KEY-----...` |
| `DB_PASSWORD_DEV` | Password MySQL Development | `dev_password_123` |
| `DB_PASSWORD_PROD` | Password MySQL Production | `prod_secure_password_456` |
| `JWT_SECRET_DEV` | JWT Secret Development | `dev_jwt_secret_key` |
| `JWT_SECRET_PROD` | JWT Secret Production | `prod_jwt_secret_key_super_secure` |

### Opsional

| Secret | Deskripsi |
|--------|-----------|
| `DISCORD_WEBHOOK` | Webhook URL untuk notifikasi Discord |

---

## 🔐 Cara Generate SSH Key

```bash
# 1. Generate key pair di komputer lokal
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github_actions

# 2. Copy public key ke VPS
cat ~/.ssh/github_actions.pub
# Copy isi file, lalu paste ke ~/.ssh/authorized_keys di VPS

# 3. Copy private key ke GitHub Secrets
cat ~/.ssh/github_actions
# Copy isi lengkap (termasuk -----BEGIN... dan -----END...)
# Paste ke secret VPS_SSH_KEY di GitHub
```

---

## 📁 Struktur File CI/CD

```
.github/
└── workflows/
    └── ci-cd.yml          # File workflow utama
```

---

## 🚀 Alur Kerja Pipeline

### Push ke Branch `develop`
```
Push to develop
    ↓
Test & Lint → Security Scan → Build Docker Image
    ↓
Deploy to Development VPS
```

### Push ke Branch `main`
```
Push to main
    ↓
Test & Lint → Security Scan → Build Docker Image
    ↓
Backup Database → Deploy to Production VPS
```

### Manual Trigger (Mobile Build)
```
GitHub Actions → Workflow dispatch
    ↓
Build Mobile APK
    ↓
Upload Artifact
```

---

## 🎯 Environment Setup di GitHub

### 1. Buat Environment

1. Buka **Settings > Environments**
2. Klik **New environment**
3. Buat 2 environment:
   - `development`
   - `production`

### 2. Konfigurasi Production Environment

Untuk environment `production`, aktifkan protection:

- ✅ **Required reviewers** - Tambahkan user yang boleh approve deploy
- ✅ **Wait timer** - Tunggu 5 menit sebelum deploy (opsional)
- ✅ **Deployment branches** - Hanya allow dari branch `main`

---

## 📊 Diagram Alur CI/CD

```
┌─────────────────────────────────────────────────────────────┐
│                       GitHub Repository                      │
│                                                              │
│   ┌──────────┐   ┌──────────┐   ┌──────────────────────┐   │
│   │  Push    │   │   PR     │   │   Manual Trigger     │   │
│   │  main    │   │  opened  │   │   (workflow_dispatch)│   │
│   └────┬─────┘   └────┬─────┘   └──────────┬───────────┘   │
└────────┼──────────────┼────────────────────┼───────────────┘
         │              │                    │
         ▼              ▼                    ▼
┌──────────────────────────────────────────────────────────────┐
│                     GitHub Actions Runner                     │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Stage 1: Test & Quality                                │  │
│  │  • npm ci (install dependencies)                        │  │
│  │  • npm run lint (check code style)                      │  │
│  │  • prettier --check (formatting)                        │  │
│  │  • npm run build (build frontend)                       │  │
│  └────────────────────────────────────────────────────────┘  │
│                              │                                │
│                              ▼                                │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Stage 2: Security Scan                                 │  │
│  │  • Trivy vulnerability scanner                          │  │
│  │  • Scan dependencies & filesystem                       │  │
│  └────────────────────────────────────────────────────────┘  │
│                              │                                │
│                              ▼                                │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Stage 3: Build Docker Image                            │  │
│  │  • Build multi-platform image (AMD64, ARM64)            │  │
│  │  • Push to GitHub Container Registry (ghcr.io)          │  │
│  │  • Tag: latest, main, sha-xxxx                          │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────┬───────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────┐
│                       VPS Server                              │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Stage 4: Deploy                                         │  │
│  │  • SSH ke VPS                                           │  │
│  │  • Pull latest code                                     │  │
│  │  • docker compose pull (image baru)                     │  │
│  │  • docker compose up -d (deploy)                        │  │
│  │  • npm run db:setup (setup DB)                          │  │
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
cd ~/hris-dev  # atau hris-prod
docker compose logs -f web
docker compose logs -f mysql

# Cek status container
docker compose ps

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

# Lihat image lama
docker images

# Rollback ke versi sebelumnya
docker compose down
docker pull ghcr.io/username/repo:sha-xxxx  # versi lama
docker tag ghcr.io/username/repo:sha-xxxx ghcr.io/username/repo:latest
docker compose up -d

# Restore database dari backup (jika perlu)
mysql -u root -p hris_db < backup-YYYYMMDD-HHMMSS.sql
```

### Automated Rollback
Pipeline akan otomatis fail jika health check gagal, tapi container tetap berjalan dengan versi lama.

---

## 🛡️ Security Best Practices

1. **Jangan hardcode secrets** - Selalu gunakan GitHub Secrets
2. **SSH Key terpisah** - Gunakan key khusus untuk CI/CD, bukan key pribadi
3. **Restrict IP** - Batasi IP yang bisa SSH ke VPS
4. **Enable 2FA** - Aktifkan 2FA untuk akun GitHub
5. **Database Backup** - Pipeline otomatis backup sebelum deploy production
6. **Vulnerability Scan** - Trivy scan setiap build

---

## 📝 Contoh Penggunaan

### Deploy Cepat ke Development
```bash
# 1. Commit dan push ke develop
git checkout develop
git add .
git commit -m "feat: add new feature"
git push origin develop

# 2. GitHub Actions akan otomatis deploy ke dev VPS
# 3. Akses di: http://YOUR_DEV_VPS_IP:5000
```

### Deploy ke Production
```bash
# 1. Merge ke main (via PR)
git checkout main
git merge develop
git push origin main

# 2. GitHub Actions akan deploy ke production setelah tests pass
# 3. Akses di: http://YOUR_PROD_VPS_IP:5000
```

### Build Mobile APK (Manual)
1. Buka GitHub repository
2. Klik tab **Actions**
3. Pilih workflow **CI/CD Pipeline**
4. Klik **Run workflow**
5. Pilih **build-mobile** job
6. Download APK dari artifacts setelah selesai

---

## 🐛 Troubleshooting

### Pipeline Failed di "Test & Lint"
```bash
# Fix di lokal dulu
cd hris-web
npm run lint
npm run build
# Fix semua error, lalu push ulang
```

### Deploy Failed - SSH Error
- Cek VPS_SSH_KEY sudah benar (format OpenSSH)
- Pastikan public key sudah di `~/.ssh/authorized_keys` di VPS
- Cek firewall VPS allow port 22

### Deploy Failed - Health Check
- SSH ke VPS, cek logs: `docker compose logs web`
- Kemungkinan: DB belum ready, port conflict, atau env vars salah

### Image Build Failed
- Cek Dockerfile valid
- Cek `docker-compose.yml` valid
- Pastikan tidak ada syntax error

---

## 📚 Referensi

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Build Push Action](https://github.com/docker/build-push-action)
- [SSH Action](https://github.com/appleboy/ssh-action)
- [Trivy Security Scanner](https://github.com/aquasecurity/trivy-action)

---

## ✅ Checklist Setup

- [ ] Tambahkan semua secrets ke GitHub
- [ ] Setup SSH key di VPS
- [ ] Buat environment `development` dan `production`
- [ ] Test pipeline dengan push ke `develop`
- [ ] Verifikasi deploy berhasil ke dev VPS
- [ ] Test pipeline dengan push ke `main` (production)
- [ ] Setup notifikasi Discord (opsional)

**Butuh bantuan?** Cek logs di GitHub Actions tab untuk detail error.
