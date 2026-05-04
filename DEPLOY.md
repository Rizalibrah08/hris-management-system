# VPS Deployment — Quick Reference

> 📖 **Panduan deploy lengkap & full**: [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

---

## ⚡ Quick Start VPS

```bash
# 1 command, semua otomatis:
bash -c "$(curl -fsSL https://raw.githubusercontent.com/Rizalibrah08/hris-management-system/main/scripts/setup-vps.sh)"
```

## ⚡ Manual Setup

```bash
mkdir -p ~/hris-prod && cd ~/hris-prod
curl -sLO https://raw.githubusercontent.com/Rizalibrah08/hris-management-system/main/docker-compose.ghcr.yml

# Generate secrets
openssl rand -base64 24  # → DB_PASSWORD
openssl rand -base64 48  # → JWT_SECRET

# Buat .env
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

# Pull & start
docker compose -f docker-compose.ghcr.yml up -d
```

## ⚡ Commands Sehari-hari

```bash
cd ~/hris-prod

docker compose -f docker-compose.ghcr.yml ps          # Status
docker compose -f docker-compose.ghcr.yml logs -f web  # Logs
docker compose -f docker-compose.ghcr.yml pull web     # Update image
docker compose -f docker-compose.ghcr.yml up -d        # Restart
docker compose -f docker-compose.ghcr.yml down         # Stop
```

## ⚡ CI/CD

```bash
# Development (test only)
git push origin develop

# Production (auto deploy 🚀)
git push origin main
```

## ⚡ Login Default

| Field | Value |
|-------|-------|
| NIK | `ADM001` |
| Password | `admin123` |

> ⚠️ **Ganti password setelah login pertama!**
