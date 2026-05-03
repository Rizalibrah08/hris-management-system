# CI/CD Architecture Overview

Dokumen ini menjelaskan arsitektur CI/CD lengkap untuk HRIS Web Application.

---

## 🎯 Goals

1. **Automated Testing** - Setiap push ke repository di-test otomatis
2. **Security First** - Scan vulnerability sebelum deploy
3. **Zero Downtime** - Deploy tanpa mematikan service
4. **Multi Environment** - Development dan Production terpisah
5. **Rollback Ready** - Backup otomatis sebelum deploy production

---

## 🏗️ Architecture Components

### 1. Source Control (GitHub)
```
Repository
├── main branch → Production
├── develop branch → Development
└── feature/* branches → Development
```

### 2. CI/CD Platform (GitHub Actions)
```
GitHub Actions Runner (Ubuntu)
├── Test Job → npm test, lint, build
├── Security Job → Trivy scan
├── Build Job → Docker build & push
└── Deploy Job → SSH ke VPS
```

### 3. Container Registry (GitHub Container Registry)
```
ghcr.io/username/hris-management-system
├── latest (main branch)
├── main-sha-xxxx
├── develop-sha-xxxx
└── development-latest
```

### 4. Deployment Targets
```
VPS Development                VPS Production
├─ MySQL Container            ├─ MySQL Container
├─ Web Container              ├─ Web Container
│  ├─ Express API            │  ├─ Express API
│  └─ React Static           │  └─ React Static
└─ Port 5000                 └─ Port 5000
```

---

## 📊 Workflow Triggers

### Automatic Triggers

| Event | Branch | Action |
|-------|--------|--------|
| Push | `main` | Test → Build → Deploy Production |
| Push | `develop` | Test → Build → Deploy Development |
| Pull Request | any | Test only (no deploy) |

### Manual Triggers

| Workflow | Kapan Digunakan |
|----------|----------------|
| **Manual Deploy** | Deploy spesifik branch ke environment tertentu |
| **Build Mobile** | Build APK Android |

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
│  Layer 2: Dependency Security                           │
│  • npm audit (auto check)                               │
│  • Trivy vulnerability scan                             │
│  • Dependency review PR check                           │
└────────────────────────────────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│  Layer 3: Container Security                            │
│  • Minimal base image (Alpine)                          │
│  • Non-root user                                        │
│  • Multi-stage build                                    │
└────────────────────────────────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│  Layer 4: Deployment Security                           │
│  • SSH key authentication                               │
│  • Secrets injection at runtime                         │
│  • Database backup before deploy                        │
└────────────────────────────────────────────────────────┘
```

---

## 🔄 Deployment Flow

### Development Deployment
```
Developer push ke develop
         │
         ▼
┌──────────────────────┐
│ GitHub Actions       │
│ ├─ Checkout code     │
│ ├─ Run tests         │
│ ├─ Security scan     │
│ ├─ Build Docker      │
│ └─ Push to GHCR      │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ VPS Development      │
│ ├─ Pull new image    │
│ ├─ Backup DB         │
│ ├─ Deploy new ver    │
│ ├─ Health check      │
│ └─ Notify success    │
└──────────────────────┘
```

### Production Deployment
```
Merge PR ke main
         │
         ▼
┌──────────────────────┐
│ Required Reviewers   │
│ (GitHub Environment) │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ GitHub Actions       │
│ ├─ Full test suite   │
│ ├─ Security scan     │
│ ├─ Build & push      │
│ └─ Deploy to Prod    │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ VPS Production       │
│ ├─ Create DB backup  │
│ ├─ Pull new image    │
│ ├─ Deploy            │
│ ├─ Health check      │
│ └─ Cleanup old imgs  │
└──────────────────────┘
```

---

## 📈 Monitoring & Observability

### GitHub Actions Monitoring
- **Workflow runs history** - Lihat status setiap deploy
- **Job logs** - Detail tiap step
- **Artifacts** - Build outputs (APK, test reports)

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

### Alerts (Opsional)
Tambahkan integrasi:
- **Discord** - Notifikasi deploy success/fail
- **Slack** - Channel notifikasi
- **Email** - Alert critical errors

---

## 🚀 Performance Optimizations

### Docker Build
- ✅ Multi-stage build (kecilkan image size)
- ✅ Build cache (GitHub Actions cache)
- ✅ Multi-platform (AMD64 & ARM64)

### Deployment
- ✅ Parallel jobs (test + security scan bersamaan)
- ✅ Layer caching (Docker layer reuse)
- ✅ Selective deploy (hanya jika file berubah)

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
- [ ] Review security scan results

### Setiap Bulan
- [ ] Update Docker base images
- [ ] Rotate SSH keys
- [ ] Review dan update dependencies
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
main (production)
  ↑
develop (integration)
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

### Menambahkan Deployment Target Baru
```yaml
deploy-staging:
  name: Deploy to Staging
  needs: build-docker
  environment:
    name: staging
    url: http://${{ secrets.VPS_STAGING_IP }}:5000
  steps:
    # ... deployment steps
```

### Notifikasi Custom
```yaml
notify-slack:
  runs-on: ubuntu-latest
  needs: deploy-prod
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
- [Trivy Security Scanner](https://aquasecurity.github.io/trivy/)

---

## ✅ Quick Start Checklist

Setup CI/CD untuk pertama kali:

- [ ] 1. Copy workflow files ke `.github/workflows/`
- [ ] 2. Tambahkan secrets ke GitHub (Settings > Secrets)
- [ ] 3. Buat environment `development` dan `production`
- [ ] 4. Setup SSH key di VPS
- [ ] 5. Push ke `develop` branch
- [ ] 6. Verifikasi pipeline berjalan
- [ ] 7. Cek deployment di dev VPS
- [ ] 8. Merge ke `main` untuk production

**Total setup time: ~30 menit**

---

Selamat! Anda sekarang memiliki CI/CD pipeline enterprise-grade untuk HRIS application.
