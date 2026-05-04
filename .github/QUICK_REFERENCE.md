# CI/CD Setup - Quick Reference Card

## 🚀 Cara Deploy

```bash
# 🔵 Development mode — test only, NO deploy
git checkout develop
git add .
git commit -m "feat: your feature"
git push origin develop
# ↓ Test & build check aja. Aman, tidak deploy.

# 🔴 Production mode — auto deploy ke VPS
git checkout main
git merge develop
git push origin main
# ↓ Otomatis: Test → Build → Push GHCR → Deploy VPS 🚀
```

---

## 🔑 Required Secrets

Masuk ke: `GitHub Repo > Settings > Secrets and variables > Actions > New repository secret`

### Wajib (6 secrets)

| Secret | Contoh | Keterangan |
|--------|--------|------------|
| `PROD_IP` | `54.123.45.67` | IP VPS |
| `SSH_USER` | `ubuntu` | Username SSH |
| `SSH_KEY` | `-----BEGIN OPENSSH...` | Private key SSH |
| `DB_PASSWORD_PROD` | `password_aman` | Password MySQL |
| `JWT_SECRET_PROD` | `jwt_secret_panjang` | JWT secret |
| `DOMAIN` | `hris.domain.com` | Domain aplikasi |

---

## 📁 Files CI/CD

```
.github/
├── workflows/
│   ├── ci-cd.yml          ← Main workflow (auto trigger)
│   ├── manual-deploy.yml  ← Manual deploy workflow
│   └── README.md          ← Setup guide
├── CI_CD_ARCHITECTURE.md  ← Architecture docs
└── QUICK_REFERENCE.md     ← File ini
```

---

## 🔄 Pipeline Flow

```
🔵 Push ke develop:
   🔍 Test & Build Check → ✅ Done (no deploy)

🔴 Push ke main:
   🔍 Test → 📦 Build & Push GHCR → 🚀 Auto Deploy VPS → ✅ Live!
```

---

## 🎯 Mode Branch

| Branch | Test | Build Image | Deploy VPS |
|--------|:--:|:--:|:--:|
| `develop` | ✅ | ❌ | ❌ |
| `main` | ✅ | ✅ | 🚀 Auto |

---

## 🆘 Emergency Commands

```bash
# SSH ke VPS
ssh ubuntu@YOUR_VPS_IP

# Lihat logs
cd ~/hris-prod
docker compose -f docker-compose.ghcr.yml logs -f web

# Restart service
docker compose -f docker-compose.ghcr.yml restart web

# Rollback (jika perlu)
docker compose -f docker-compose.ghcr.yml down
docker pull ghcr.io/rizalibrah08/hris-management-system:latest-sha-XXXXX
docker tag ghcr.io/rizalibrah08/hris-management-system:latest-sha-XXXXX ghcr.io/rizalibrah08/hris-management-system:latest
docker compose -f docker-compose.ghcr.yml up -d

# Backup database manual
cd ~/hris-prod
docker compose -f docker-compose.ghcr.yml exec mysql mysqldump -u root -p hris_db > backup.sql
```

---

## 📊 Status Checks

| Check | Command | Expected |
|-------|---------|----------|
| Health | `curl http://IP:5000/health` | `{"status":"ok"}` |
| Login | `curl -X POST http://IP:5000/api/auth/login -H "Content-Type: application/json" -d '{"nik":"ADM001","password":"admin123"}'` | Token JSON |
| Containers | `docker compose -f docker-compose.ghcr.yml ps` | 2 containers running |

---

## ⚡ Troubleshooting

| Problem | Solution |
|---------|----------|
| Pipeline failed | Check **Actions** tab → Lihat logs |
| Deploy tapi app error | SSH ke VPS → `docker compose logs web` |
| DB connection error | Cek `DB_PASSWORD` secret benar? |
| SSH error | Cek `SSH_KEY` format (OpenSSH) |
| GHCR denied | Cek package visibility → **Public** |
| Image not found | Cek `GHCR_REPO` lowercase (`rizalibrah08/...`) |

---

## ✅ Pre-Deploy Checklist

Sebelum merge ke `main` (production):

- [ ] Tests pass di lokal (`npm run build`)
- [ ] Tidak ada hardcoded secrets
- [ ] Sudah merge dari develop
- [ ] Semua GitHub secrets terisi

---

## 🔗 Useful Links

- **GitHub Actions**: https://github.com/Rizalibrah08/hris-management-system/actions
- **Container Registry**: https://github.com/Rizalibrah08/hris-management-system/pkgs/container/hris-management-system

---

## 📞 Support

Jika ada masalah:
1. Cek logs di GitHub Actions
2. SSH ke VPS dan cek `docker compose logs`
3. Verifikasi secrets sudah benar
4. Test manual: `curl http://IP:5000/health`

---

**Siap deploy! 🚀**
