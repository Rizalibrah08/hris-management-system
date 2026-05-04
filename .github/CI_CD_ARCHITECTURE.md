# CI/CD Architecture Overview

Dokumen ini menjelaskan arsitektur CI/CD untuk HRIS Web Application.

---

## 🎯 Goals

1. **Automated Testing** - Setiap push ke repository di-test otomatis
2. **Production Deploy on Main** - Push/merge ke `main` = auto build & deploy
3. **Safe Development** - Push ke `develop` = test saja, tidak deploy
4. **Zero Downtime** - Deploy tanpa mematikan service
5. **Rollback Ready** - Image versioned, mudah rollback

---

## 🏗️ Architecture Components

### 1. Source Control (GitHub)
```
Repository
├── main branch → Production (auto deploy)
├── develop branch → Development (test only)
└── feature/* branches → Development
```

### 2. CI/CD Platform (GitHub Actions)
```
GitHub Actions Runner (Ubuntu)
├── Test Job → npm ci, build check
├── Build Job → Docker build & push ke GHCR  (HANYA main)
└── Deploy Job → SSH ke VPS, pull & restart  (HANYA main)
```

### 3. Container Registry (GitHub Container Registry)
```
ghcr.io/rizalibrah08/hris-management-system
├── latest (main branch)
└── latest-sha-xxxx (versioned)
```

### 4. Deployment Target
```
VPS Production
├─ MySQL Container
├─ Web Container
│  ├─ Express API
│  └─ React Static
└─ Port 5000 → Cloudflare → HTTPS
```

---

## 📊 Workflow Triggers

### 🔵 Develop Mode — Push ke `develop`
```
Push develop → 🔍 Test & Build Check → ✅ Selesai
                                   ↓
                         (TIDAK build image, TIDAK deploy)
```
**Aman buat ngoding, tidak menyentuh VPS sama sekali.**

### 🔴 Production Mode — Push / Merge ke `main`
```
Push main → 🔍 Test → 📦 Build & Push GHCR → 🚀 Auto Deploy VPS
```
**Begitu merge/push ke main, langsung otomatis deploy!**

### 📋 Ringkasan

| Event | Branch | Test | Build Image | Deploy |
|-------|--------|:--:|:--:|:--:|
| Push | `develop` | ✅ | ❌ | ❌ |
| Push | `main` | ✅ | ✅ | ✅ Auto |
| Pull Request | `main` | ✅ | ❌ | ❌ |
| Manual (workflow_dispatch) | — | ✅ | Opsional | Opsional |

---

## 🔄 Deployment Flow

### Development Mode (develop)
```
Developer push ke develop
         │
         ▼
┌──────────────────────┐
│ GitHub Actions       │
│ ├─ Checkout code     │
│ ├─ npm ci            │
│ ├─ Build check       │
│ └─ ✅ Selesai        │
└──────────────────────┘
   (Tidak deploy)
```

### Production Mode (main)
```
Merge/push ke main
         │
         ▼
┌──────────────────────┐
│ GitHub Actions       │
│ ├─ Checkout code     │
│ ├─ npm ci + build    │
│ ├─ Docker build      │
│ ├─ Push ke GHCR      │
│ └─ SSH deploy VPS    │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ VPS Production       │
│ ├─ Pull image baru   │
│ ├─ docker compose up │
│ ├─ Health check      │
│ └─ Cleanup old imgs  │
└──────────────────────┘
    ↓
🎉 Deployed! https://domain.com
```

---

## 🔐 Security Layers

```
┌────────────────────────────────────────────────────────┐
│  Layer 1: Code Security                                 │
│  • Secrets di GitHub (encrypted)                        │
│  • No hardcoded credentials                             │
│  • .env files di .gitignore                             │
└────────────────────────────────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│  Layer 2: Container Security                            │
│  • Non-root user                                        │
│  • Multi-stage build                                    │
│  • Read-only filesystem                                 │
└────────────────────────────────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│  Layer 3: Deployment Security                           │
│  • SSH key authentication                               │
│  • Secrets injection at runtime                         │
│  • GHCR package (public/private)                        │
└────────────────────────────────────────────────────────┘
```

---

## 📈 Monitoring & Observability

### GitHub Actions Monitoring
- **Workflow runs history** - Lihat status setiap deploy
- **Job logs** - Detail tiap step
- **Artifacts** - Build outputs

### Application Monitoring
```bash
# Health check endpoint
curl http://vps-ip:5000/health
# Response: {"status":"ok"}

# Logs
docker compose logs -f web
docker compose logs -f mysql

# Container stats
docker stats
```

---

## 🚀 Performance Optimizations

### Docker Build
- ✅ Multi-stage build (kecilkan image size)
- ✅ Build cache (GitHub Actions cache)
- ✅ Single platform (AMD64)

### Deployment
- ✅ Layer caching (Docker layer reuse)
- ✅ Selective build (hanya main branch)

---

## 🆘 Disaster Recovery

### Scenario 1: Deploy Gagal
```bash
# Pipeline otomatis stop, container lama tetap jalan
# Manual rollback:
docker compose down
docker pull ghcr.io/user/repo:previous-tag
docker compose up -d
```

### Scenario 2: Database Corrupt
```bash
# Restore dari backup terakhir
docker compose exec mysql mysql -u root -p hris_db < backup-latest.sql
```

### Scenario 3: VPS Down
```bash
# Setup VPS baru
# 1. Install Docker
# 2. Copy .env file
# 3. docker compose up -d
# 4. Restore DB dari backup
```

---

## 📋 Maintenance Checklist

### Setiap Minggu
- [ ] Review failed pipeline runs
- [ ] Check VPS disk space

### Setiap Bulan
- [ ] Update Docker base images
- [ ] Rotate SSH keys
- [ ] Cleanup old Docker images

### Setiap Quarter
- [ ] Performance review pipeline
- [ ] Update GitHub Actions versions
- [ ] Disaster recovery drill

---

## 🎓 Best Practices

### 1. Commit Message Convention
```
feat: add new employee dashboard
fix: resolve attendance clock-in bug
docs: update API documentation
refactor: optimize payroll calculation
test: add unit tests for auth
chore: update dependencies
```

### 2. Branch Strategy
```
main (production — auto deploy)
  ↑
develop (development — test only)
  ↑
feature/login-page
feature/payroll-export
```

### 3. Environment Variables
```
# Never commit ini!
.env
*.pem
*.key
```

### 4. Secrets Management
```
✅ GitHub Secrets (encrypted)
✅ Injected at runtime
❌ Hardcode in code
❌ Commit ke repository
```

---

## 🔧 Customization

### Menambahkan Test Job Baru
Edit `.github/workflows/ci-cd.yml`:
```yaml
e2e-test:
  name: E2E Tests
  runs-on: ubuntu-latest
  needs: test
  steps:
    - uses: actions/checkout@v4
    - name: Run Cypress
      uses: cypress-io/github-action@v6
```

### Notifikasi Custom
```yaml
notify-slack:
  runs-on: ubuntu-latest
  needs: deploy
  steps:
    - uses: slackapi/slack-github-action@v1
      with:
        payload: |
          {"text": "🚀 Deployed to Production!"}
      env:
        SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

---

## 📚 Resources

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [GitHub Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)

---

## ✅ Quick Start Checklist

Setup CI/CD untuk pertama kali:

- [ ] 1. Copy workflow files ke `.github/workflows/`
- [ ] 2. Tambahkan secrets ke GitHub (Settings > Secrets)
- [ ] 3. Setup SSH key di VPS
- [ ] 4. Set package GHCR ke Public
- [ ] 5. Push ke `develop` → cek test jalan
- [ ] 6. Push/merge ke `main` → cek deploy jalan
- [ ] 7. Verifikasi aplikasi bisa diakses

**Total setup time: ~30 menit**

---

Selamat! Anda sekarang memiliki CI/CD pipeline untuk HRIS application.
