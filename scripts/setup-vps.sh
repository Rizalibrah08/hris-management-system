#!/bin/bash
# =============================================================================
# HRIS VPS Setup — Mode: GHCR Pull + Cloudflare
# =============================================================================
# VPS TIDAK build. Hanya pull image ringan dari GitHub Container Registry.
# Cocok untuk VPS kecil (1GB RAM, 1 CPU).
#
# PRASYARAT:
#   1. GitHub repo sudah setup CI/CD (build image ke GHCR)
#   2. DNS Cloudflare sudah mengarah ke IP VPS ini
#
# Usage:
#   GITHUB_REPO=Rizalibrah08/hris-management-system \
#     bash setup-vps.sh
# =============================================================================

set -e

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# =============================================================================
# CONFIG — ganti sesuai project kamu
# =============================================================================
GITHUB_REPO="${GITHUB_REPO:-Rizalibrah08/hris-management-system}"
GITHUB_BRANCH="${GITHUB_BRANCH:-main}"
APP_DIR="${APP_DIR:-$HOME/hris-prod}"
DOMAIN="${DOMAIN:-}"
CF_API_TOKEN="${CF_API_TOKEN:-}"

GHCR_IMAGE="ghcr.io/${GITHUB_REPO}:latest"

echo -e "${CYAN}"
echo "╔══════════════════════════════════════════════════════╗"
echo "║   HRIS VPS Setup — GHCR Pull + Cloudflare           ║"
echo "╚══════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""
echo "Repo:   ${GITHUB_REPO}"
echo "Image:  ${GHCR_IMAGE}"
echo "Dir:    ${APP_DIR}"
echo "Domain: ${DOMAIN:-nanti diatur}"
echo ""

# =============================================================================
# 1. Install Docker (kalau belum)
# =============================================================================
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}📦 Installing Docker...${NC}"
    curl -fsSL https://get.docker.com | sh
    usermod -aG docker "$USER"
    echo -e "${GREEN}✅ Docker installed${NC}"
else
    echo -e "${GREEN}✅ Docker: $(docker --version)${NC}"
fi

# =============================================================================
# 2. Setup direktori
# =============================================================================
mkdir -p "${APP_DIR}"
cd "${APP_DIR}"

# =============================================================================
# 3. Download docker-compose file dari GitHub
# =============================================================================
echo -e "${YELLOW}📥 Downloading docker-compose.ghcr.yml...${NC}"
curl -sL "https://raw.githubusercontent.com/${GITHUB_REPO}/${GITHUB_BRANCH}/docker-compose.ghcr.yml" \
    -o docker-compose.ghcr.yml
echo -e "${GREEN}✅ Download complete${NC}"

# =============================================================================
# 4. Generate .env
# =============================================================================
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}🔐 Generating secure secrets...${NC}"
    DB_PASSWORD=$(openssl rand -base64 24)
    JWT_SECRET=$(openssl rand -base64 48)

    cat > .env << ENVEOF
# Generated: $(date)
DB_PASSWORD=${DB_PASSWORD}
DB_NAME=hris_db
DB_HOST=mysql
DB_PORT=3306
DB_USER=root
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRY=1d
PORT=5000
NODE_ENV=production
GHCR_REPO=${GITHUB_REPO}
ENVEOF
    chmod 600 .env

    echo -e "${GREEN}✅ Secrets generated${NC}"
    echo -e "${CYAN}   📋 SIMPAN INI (tidak bisa direcover):${NC}"
    echo -e "${CYAN}   DB_PASSWORD=${DB_PASSWORD}${NC}"
    echo -e "${CYAN}   JWT_SECRET=${JWT_SECRET}${NC}"
else
    echo -e "${GREEN}✅ .env sudah ada, skip generate${NC}"
fi

# =============================================================================
# 5. Login GHCR (public repo: tidak perlu login)
# =============================================================================
# Untuk public repo, GHCR bisa diakses tanpa login.
# Untuk private repo, perlu GitHub token.
if [ -n "${GITHUB_TOKEN}" ]; then
    echo -e "${YELLOW}🔑 Logging in to GHCR...${NC}"
    echo "${GITHUB_TOKEN}" | docker login ghcr.io -u ignored --password-stdin
    echo -e "${GREEN}✅ Logged in${NC}"
else
    echo -e "${YELLOW}ℹ️  No GITHUB_TOKEN set — assuming public repo${NC}"
fi

# =============================================================================
# 6. Pull & Start
# =============================================================================
echo -e "${YELLOW}📥 Pulling image: ${GHCR_IMAGE}...${NC}"
docker compose -f docker-compose.ghcr.yml pull web
echo -e "${GREEN}✅ Image pulled${NC}"

echo -e "${YELLOW}🚀 Starting application...${NC}"
docker compose -f docker-compose.ghcr.yml up -d

# =============================================================================
# 7. Health check
# =============================================================================
echo -e "${YELLOW}⏳ Waiting for services to be healthy...${NC}"
for i in $(seq 1 30); do
    if curl -sf http://localhost:5000/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Application is healthy!${NC}"
        break
    fi
    sleep 2
done

# =============================================================================
# 8. Firewall
# =============================================================================
if command -v ufw &> /dev/null; then
    echo -e "${YELLOW}🔥 Configuring firewall...${NC}"
    ufw allow 22/tcp
    ufw allow 80/tcp
    ufw allow 443/tcp
    ufw --force enable
    echo -e "${GREEN}✅ Firewall active${NC}"
fi

# =============================================================================
# 9. Download backup script
# =============================================================================
mkdir -p backups
curl -sL "https://raw.githubusercontent.com/${GITHUB_REPO}/${GITHUB_BRANCH}/scripts/backup-db.sh" \
    -o backup-db.sh 2>/dev/null || true
chmod +x backup-db.sh 2>/dev/null || true

# =============================================================================
# 10. Setup Cloudflare Tunnel (opsional, lebih aman)
# =============================================================================
if [ -n "${DOMAIN}" ] && [ -n "${CF_API_TOKEN}" ]; then
    echo -e "${YELLOW}☁️  Setting up Cloudflare Tunnel...${NC}"

    # Install cloudflared
    curl -fsSL https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 \
        -o /usr/local/bin/cloudflared
    chmod +x /usr/local/bin/cloudflared

    # Login & create tunnel
    cloudflared tunnel login
    cloudflared tunnel create hris-tunnel

    # Config
    mkdir -p ~/.cloudflared
    cat > ~/.cloudflared/config.yml << YML
tunnel: $(cloudflared tunnel list --name hris-tunnel -o json | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
credentials-file: ~/.cloudflared/hris-tunnel.json

ingress:
  - hostname: ${DOMAIN}
    service: http://localhost:5000
  - service: http_status:404
YML

    # DNS record
    cloudflared tunnel route dns hris-tunnel "${DOMAIN}"

    # Run as service
    cloudflared service install
    systemctl start cloudflared
    systemctl enable cloudflared

    echo -e "${GREEN}✅ Cloudflare Tunnel active — ${DOMAIN}${NC}"
fi

# =============================================================================
# Summary
# =============================================================================
PUBLIC_IP=$(curl -s ifconfig.me 2>/dev/null || echo "VPS_IP")

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   Setup Complete! 🎉                                 ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${CYAN}📋 Akses Aplikasi:${NC}"
echo "   Lokal VPS:  http://localhost:5000"
echo "   Public IP:  http://${PUBLIC_IP}:5000"
if [ -n "${DOMAIN}" ]; then
    echo "   Domain:     https://${DOMAIN}"
fi
echo ""
echo -e "${CYAN}📋 Login:${NC}"
echo "   NIK:      ADM001"
echo "   Password: admin123  ← GANTI SETELAH LOGIN!"
echo ""
echo -e "${CYAN}📋 Perintah Penting:${NC}"
echo "   docker compose -f docker-compose.ghcr.yml ps"
echo "   docker compose -f docker-compose.ghcr.yml logs -f web"
echo "   docker compose -f docker-compose.ghcr.yml pull web   ← Update image"
echo "   docker compose -f docker-compose.ghcr.yml up -d"
echo ""
echo -e "${CYAN}📋 GitHub Secrets (copy .env values ke GitHub):${NC}"
echo "   DB_PASSWORD_PROD  = $(grep DB_PASSWORD .env | cut -d= -f2)"
echo "   JWT_SECRET_PROD   = $(grep JWT_SECRET .env | cut -d= -f2)"
echo "   PROD_IP           = ${PUBLIC_IP}"
echo "   DOMAIN            = ${DOMAIN:-yourdomain.com}"
echo "   SSH_USER          = $(whoami)"
echo "   SSH_KEY           = (isi private key untuk GitHub Actions)"
echo ""
echo -e "${YELLOW}⚠️  Jangan lupa setup cron backup:${NC}"
echo "   crontab -e"
echo "   0 2 * * * cd ${APP_DIR} && bash backup-db.sh"
