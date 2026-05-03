# CI/CD Setup - Quick Reference Card

## 🚀 One Command Deploy

```bash
# Push ke development
git checkout develop
git add .
git commit -m "feat: your feature"
git push origin develop
# ↓ Otomatis deploy ke dev VPS

# Push ke production
git checkout main
git merge develop
git push origin main
# ↓ Otomatis deploy ke production VPS
```

---

## 🔑 Required Secrets

Masuk ke: `GitHub Repo > Settings > Secrets and variables > Actions`

### Wajib
```
VPS_DEV_IP          = 203.0.113.45
VPS_PROD_IP         = 198.51.100.20
VPS_USER            = ubuntu
VPS_SSH_KEY         = -----BEGIN OPENSSH PRIVATE KEY-----
                      ... (private key) ...
                      -----END OPENSSH PRIVATE KEY-----

DB_PASSWORD_DEV     = dev_password_secure
DB_PASSWORD_PROD    = prod_password_super_secure
JWT_SECRET_DEV      = dev_jwt_secret_key_long
JWT_SECRET_PROD     = prod_jwt_secret_key_super_long
```

---

## 📁 Files Created

```
.github/
├── workflows/
│   ├── ci-cd.yml          ← Main workflow (auto trigger)
│   ├── manual-deploy.yml  ← Manual deploy workflow
│   └── README.md          ← Setup guide
└── CI_CD_ARCHITECTURE.md  ← Architecture docs
```

---

## 🔄 Pipeline Flow

```
Push ke GitHub
    ↓
┌─────────────────┐
│ 1. Test & Lint  │ ← npm test, lint, build
│ 2. Security     │ ← Trivy scan
│ 3. Build Docker │ ← Push ke GHCR
└────────┬────────┘
         ↓
┌─────────────────┐
│ 4. Deploy VPS   │ ← SSH + docker compose up
│ 5. Health Check │ ← curl /health
└─────────────────┘
    ↓
🎉 Deployed!
```

---

## 🎯 Environments

| Environment | Branch | URL | Trigger |
|-------------|--------|-----|---------|
| **Development** | `develop` | http://DEV_VPS_IP:5000 | Auto push |
| **Production** | `main` | http://PROD_VPS_IP:5000 | Auto push + Approval |

---

## 🆘 Emergency Commands

```bash
# SSH ke VPS
ssh ubuntu@YOUR_VPS_IP

# Lihat logs
cd ~/hris-dev  # atau hris-prod
docker compose logs -f web

# Restart service
docker compose restart web

# Rollback (jika perlu)
docker compose down
docker pull ghcr.io/USER/REPO:previous-tag
docker compose up -d

# Backup database manual
docker compose exec mysql mysqldump -u root -p hris_db > backup.sql
```

---

## 📊 Status Checks

| Check | Command | Expected |
|-------|---------|----------|
| Health | `curl http://IP:5000/health` | `{"status":"ok"}` |
| API | `curl http://IP:5000/api/employees` | JSON array |
| SPA | `curl http://IP:5000/` | HTML page |

---

## 🔔 Notifications

**Discord Webhook** (Opsional):
1. Buat webhook di Discord channel
2. Tambahkan secret `DISCORD_WEBHOOK`
3. Notifikasi otomatis setiap deploy

---

## ⚡ Troubleshooting

| Problem | Solution |
|---------|----------|
| Pipeline failed | Check **Actions** tab → Lihat logs |
| Deploy tapi app error | SSH ke VPS → `docker compose logs web` |
| DB connection error | Cek `DB_PASSWORD` secret benar? |
| SSH error | Cek `VPS_SSH_KEY` format (OpenSSH) |
| 404 not found | Cek branch sudah push? |

---

## 📱 Build Mobile APK (Manual)

1. Buka GitHub → Actions tab
2. Pilih workflow **Manual Deploy**
3. Click **Run workflow**
4. Pilih job **Build Mobile**
5. Download APK dari artifacts

---

## ✅ Pre-Deploy Checklist

Sebelum push ke `main` (production):

- [ ] Tests pass di lokal (`npm run test`)
- [ ] Build success (`npm run build`)
- [ ] Tidak ada hardcoded secrets
- [ ] Database migration sudah tested
- [ ] Sudah deploy ke dev dan tested
- [ ] Team informed

---

## 🔗 Useful Links

- **GitHub Actions**: https://github.com/USER/REPO/actions
- **Container Registry**: https://github.com/USER/REPO/pkgs/container/REPO
- **Environments**: https://github.com/USER/REPO/settings/environments

---

## 📞 Support

Jika ada masalah:
1. Cek logs di GitHub Actions
2. SSH ke VPS dan cek `docker compose logs`
3. Verifikasi secrets sudah benar
4. Test manual: `curl http://IP:5000/health`

---

**Siap deploy! 🚀**
