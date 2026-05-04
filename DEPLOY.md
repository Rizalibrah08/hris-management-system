# VPS Deployment Guide (Docker-Based)

Panduan deploy manual HRIS di VPS menggunakan Docker Compose.

> 💡 **Untuk deploy otomatis via CI/CD**, lihat [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

---

## 1. Prerequisites

| Tool | Minimum Version | Installation |
|------|-----------------|--------------|
| Docker | 20.10+ | [Docker Installation Guide](https://docs.docker.com/engine/install/) |
| Docker Compose | 2.0+ | [Compose Installation Guide](https://docs.docker.com/compose/install/) |
| Git | 2.30+ | `apt install git` or equivalent |

### Verify Installation

```bash
docker --version       # Should show 20.10.x or higher
docker compose version # Should show 2.x.x or higher
git --version          # Should show 2.30.x or higher
```

### System Requirements

- **RAM**: Minimum 2GB (4GB recommended)
- **Storage**: Minimum 10GB free space
- **Ports**: Port 5000 untuk aplikasi web

---

## 2. Quick Start

### Cara 1: Production (GHCR Pull) — Rekomendasi

Image sudah di-build oleh GitHub Actions, VPS tinggal pull & run:

```bash
# Jalankan setup script otomatis
bash -c "$(curl -fsSL https://raw.githubusercontent.com/Rizalibrah08/hris-management-system/main/scripts/setup-vps.sh)"
```

Atau manual:

```bash
mkdir -p ~/hris-prod && cd ~/hris-prod

# Download compose file
curl -sLO https://raw.githubusercontent.com/Rizalibrah08/hris-management-system/main/docker-compose.ghcr.yml

# Buat .env
openssl rand -base64 24  # → DB_PASSWORD
openssl rand -base64 48  # → JWT_SECRET

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

# Cek health
curl http://localhost:5000/health
```

### Cara 2: Development (Build Lokal)

Clone repo dan build sendiri:

```bash
git clone https://github.com/Rizalibrah08/hris-management-system.git
cd hris-management-system

# Buat .env (isi DB_PASSWORD & JWT_SECRET)
cp hris-web/backend/.env.example .env
nano .env

# Build & start
docker compose up -d
docker compose ps

# Setup database
docker compose exec web npm run db:setup
```

Akses di `http://your-vps-ip:5000`

---

## 3. Environment Variables

The HRIS application requires the following environment variables in your `.env` file:

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DB_PASSWORD` | MySQL root password | `MySecurePass123!` |
| `JWT_SECRET` | Secret key for JWT tokens | `super-secret-key-xyz789` |

### Default Values

The following variables are pre-configured in `docker-compose.yml` and do not need to be changed unless you have specific requirements:

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_HOST` | `mysql` | Internal Docker network hostname |
| `DB_PORT` | `3306` | MySQL port (internal only) |
| `DB_USER` | `root` | MySQL root user |
| `DB_NAME` | `hris_db` | Database name |
| `PORT` | `5000` | Application port |

### Example .env File

```bash
# Database Configuration
DB_PASSWORD=your_secure_database_password_here

# Security Configuration
JWT_SECRET=your_jwt_secret_key_here
```

**Security Tip**: Generate a strong JWT secret using:

```bash
openssl rand -base64 32
```

---

## 4. Database Setup

After starting the containers, you need to initialize the database with the schema and seed data.

### Initial Setup

```bash
# Run the database setup script
docker compose exec web npm run db:setup
```

This command will:
- Create the `hris_db` database if it doesn't exist
- Execute schema files (`schema.sql`, `payroll-schema.sql`)
- Insert seed data from `seed.sql`

### Default Admin Account

After database setup, you can log in with the default admin account:

| Field | Value |
|-------|-------|
| NIK | `ADM001` |
| Password | `admin123` |

**Important**: Change the default admin password immediately after first login.

### Reset Database

If you need to reset the database (this will delete all data):

```bash
# Stop containers
docker compose down

# Remove the MySQL volume
docker volume rm hris-management-system_mysql_data

# Start containers again
docker compose up -d

# Re-run database setup
docker compose exec web npm run db:setup
```

---

## 5. Building

You can rebuild the application containers if you make changes to the code or Dockerfile.

### Full Rebuild

```bash
# Rebuild all containers from scratch
docker compose build --no-cache

# Start with the rebuilt containers
docker compose up -d
```

### Rebuild Single Service

```bash
# Rebuild only the web container
docker compose build web

# Restart the web container
docker compose up -d web
```

### View Build Logs

```bash
# Watch the build process
docker compose build --progress=plain 2>&1
```

---

## 6. Running

The application runs as Docker containers managed by Docker Compose.

### Start the Application

```bash
# Start all services in detached mode
docker compose -f docker-compose.yml up -d
```

### Check Status

```bash
# View running containers
docker compose ps

# View logs from all services
docker compose logs

# View logs from a specific service
docker compose logs web
docker compose logs mysql

# Follow logs in real-time
docker compose logs -f
```

### Restart Services

```bash
# Restart all services
docker compose restart

# Restart a specific service
docker compose restart web
docker compose restart mysql
```

### Access Application Shell

```bash
# Open a shell inside the web container
docker compose exec web sh

# Open a shell inside the MySQL container
docker compose exec mysql bash
```

---

## 7. Verification

Verify that the application is running correctly using these curl commands.

### Health Check Endpoint

```bash
# Check if the application is responding
curl http://localhost:5000/health
```

Expected response:

```json
{"status":"ok"}
```

### API Endpoints

```bash
# Check authentication endpoint (should return 400 for missing credentials)
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"nik":"ADM001","password":"admin123"}'
```

Expected response:

```json
{"token":"eyJhbGc...","user":{"id":1,"nik":"ADM001","role":"Admin"}}
```

### Check All Services

```bash
# Verify web container is running
curl -I http://localhost:5000/health

# Verify MySQL is accessible (from inside web container)
docker compose exec web nc -z mysql 3306 && echo "MySQL is accessible"
```

### Browser Verification

Open your browser and navigate to:

```
http://your-vps-ip:5000
```

You should see the HRIS login page.

---

## 8. Stopping

When you need to stop the application, use the following commands.

### Stop Without Removing Data

```bash
# Stop all containers (keeps volumes intact)
docker compose down
```

### Stop and Remove Volumes (Data Loss)

```bash
# Stop containers and remove all volumes (DELETES DATABASE)
docker compose down -v
```

**Warning**: This will delete all database data. Only use if you want a complete reset.

### Stop Specific Service

```bash
# Stop only the web container
docker compose stop web

# Stop only the MySQL container
docker compose stop mysql
```

### Emergency Stop

```bash
# Force stop all containers
docker compose kill

# Or stop Docker entirely
sudo systemctl stop docker
```

---

## 9. Updating

### Otomatis via CI/CD (Rekomendasi)

Cukup push/merge ke `main` branch, GitHub Actions akan:
1. Build image baru
2. Push ke GHCR
3. SSH ke VPS → pull image → restart container

```bash
git checkout main
git merge develop
git push origin main
# → Auto deploy! 🚀
```

### Manual Update (GHCR)

```bash
cd ~/hris-prod
docker compose -f docker-compose.ghcr.yml pull web
docker compose -f docker-compose.ghcr.yml up -d
```

### Manual Update (Build Lokal)

```bash
cd hris-management-system
git pull origin main
docker compose build --no-cache
docker compose down
docker compose up -d
docker compose ps
```

### Database Migrations

Jika update termasuk perubahan database:

```bash
docker compose exec web npm run db:setup
```

> ⚠️ Selalu backup database sebelum update! Lihat [Backup Strategy](#10-security-notes).

---

## 10. Troubleshooting

Common issues and their solutions:

### Container Won't Start

**Problem**: `docker compose up` fails immediately

**Solutions**:

```bash
# Check for port conflicts
sudo lsof -i :5000

# Check Docker service status
sudo systemctl status docker

# View detailed error logs
docker compose logs web
docker compose logs mysql
```

### Database Connection Errors

**Problem**: Application cannot connect to MySQL

**Solutions**:

```bash
# Check if MySQL is healthy
docker compose ps

# Wait for MySQL to be ready (takes ~30 seconds)
docker compose logs mysql | grep "ready for connections"

# Verify environment variables
docker compose exec web env | grep DB_

# Restart the web container after MySQL is ready
docker compose restart web
```

### Permission Denied Errors

**Problem**: Docker commands fail with permission denied

**Solution**:

```bash
# Add your user to the docker group
sudo usermod -aG docker $USER

# Log out and log back in for changes to take effect
```

### Out of Memory

**Problem**: Containers exit with OOM errors

**Solutions**:

```bash
# Check available memory
free -h

# View container memory usage
docker stats

# Add swap space (if needed)
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### Reset Everything

If you need to start fresh:

```bash
# Stop and remove everything
docker compose down -v

# Remove all unused images
docker image prune -a -f

# Start fresh
docker compose up -d
docker compose exec web npm run db:setup
```

### Check Logs

```bash
# View last 100 lines of logs
docker compose logs --tail=100

# Follow logs in real-time
docker compose logs -f

# View logs with timestamps
docker compose logs -t
```

---

## 11. Security Notes

### Change Default Credentials

**Immediately after deployment**, change these default values:

1. **Admin Password**: Log in with `ADM001` / `admin123` and change the password

2. **Database Password**: Edit your `.env` file and use a strong password:
   ```bash
   DB_PASSWORD=your_strong_unique_password_here
   ```

3. **JWT Secret**: Generate a secure random string:
   ```bash
   openssl rand -base64 32
   ```

### Network Security

- MySQL port (3306) is **not exposed** to the host by design
- Only port 5000 (application) is exposed
- Services communicate over an internal Docker network

### File Permissions

Ensure your `.env` file has restricted permissions:

```bash
chmod 600 .env
```

### Environment Variables

Never commit the `.env` file to version control. The `.gitignore` already excludes it, but verify:

```bash
cat .gitignore | grep env
```

### Regular Updates

Keep Docker images updated for security patches:

```bash
# Pull latest base images
docker compose pull

# Rebuild with latest images
docker compose build --no-cache
docker compose up -d
```

### Backup Strategy

Regularly backup your database volume:

```bash
# Create a cron job for daily backups
echo "0 2 * * * /usr/bin/docker run --rm -v hris-management-system_mysql_data:/data -v /backups:/backup alpine tar czf /backup/hris-db-\$(date +\%Y\%m\%d).tar.gz -C /data ." | sudo crontab -
```

---

## Additional Resources

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Docker Security Best Practices](https://docs.docker.com/engine/security/)
- [Project README](README.md)
- [Web Setup Guide](hris-web/SETUP.md)

---

## Support

If you encounter issues not covered in this guide:

1. Check the logs: `docker compose logs`
2. Review the [Troubleshooting](#10-troubleshooting) section
3. Consult the project documentation
4. Open an issue on the project repository

---

*Last updated: May 2026*
