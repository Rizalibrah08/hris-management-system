# Plan: Docker Local Testing for HRIS

## Goal
Enable zero-friction local testing of HRIS web application using Docker Compose with auto-seeding database.

## Constraints
- MUST use production mode (single web container serving both frontend + backend)
- MUST delete docker-compose.override.yml (causes network/proxy issues)
- MUST auto-seed database on first run (no manual steps)
- MUST NOT change server.js or vite.config.js (they already work)
- MUST NOT create separate frontend container (unnecessary for testing)
- Keep MySQL data persistent across restarts

## Assumptions
- User has Docker Desktop installed and running
- Port 5000 is available on host machine
- .env file exists with required variables

## T1: Delete docker-compose.override.yml
**Why**: This file creates a separate frontend container with broken networking and proxy config. It auto-loads and conflicts with production mode.

**Action**:
- [ ] Delete `docker-compose.override.yml`

**Acceptance**:
```bash
docker compose up --build -d
# Only mysql and web containers should start (not frontend)
docker compose ps | grep -c "frontend"  # Expected: 0
```

## T2: Create docker-entrypoint.sh
**Why**: Need to wait for MySQL, run database seeding, then start the server - all in one entrypoint.

**Action**:
- [ ] Create `hris-web/docker-entrypoint.sh`
- [ ] Wait for MySQL to be healthy (retry logic)
- [ ] Run `node backend/src/setup-db.js` (idempotent - drops + recreates)
- [ ] Start `node backend/src/server.js`

**File: hris-web/docker-entrypoint.sh**
```bash
#!/bin/sh
set -e

echo "Waiting for MySQL at ${DB_HOST}:${DB_PORT}..."
until nc -z ${DB_HOST} ${DB_PORT}; do
  sleep 1
done
echo "MySQL is up!"

echo "Seeding database..."
node backend/src/setup-db.js || echo "Seed completed (may have warnings)"

echo "Starting HRIS server..."
exec node backend/src/server.js
```

**Acceptance**:
```bash
docker compose logs web | grep "Database hris_db siap digunakan"
# Expected: Found
```

## T3: Update Dockerfile for entrypoint
**Why**: Docker container needs the entrypoint script and netcat for health checking.

**Action**:
- [ ] Add `RUN apk add --no-cache netcat-openbsd` to runner stage
- [ ] `COPY docker-entrypoint.sh /app/`
- [ ] `RUN chmod +x /app/docker-entrypoint.sh`
- [ ] Change `CMD` to `ENTRYPOINT ["/app/docker-entrypoint.sh"]`

**File: hris-web/Dockerfile changes**
```dockerfile
# Stage 2: Runner
FROM node:20-alpine
RUN apk add --no-cache netcat-openbsd
WORKDIR /app
COPY docker-entrypoint.sh /app/
RUN chmod +x /app/docker-entrypoint.sh
COPY --from=builder /app/package*.json ./
RUN npm install --omit=dev
COPY --from=builder /app/backend ./backend
COPY --from=builder /app/dist ./dist
USER node
EXPOSE 5000
ENTRYPOINT ["/app/docker-entrypoint.sh"]
```

**Acceptance**:
```bash
docker compose build web
# Build succeeds
```

## T4: Verify .env file exists with correct values
**Why**: Docker Compose reads from root .env file. Must have DB_HOST=mysql for Docker networking.

**Action**:
- [ ] Verify `.env` at project root exists
- [ ] Ensure DB_HOST=mysql (not localhost)
- [ ] Ensure DB_PASSWORD matches MYSQL_ROOT_PASSWORD

**Expected .env content**:
```
DB_PASSWORD=hris_secret_2024
DB_NAME=hris_db
DB_HOST=mysql
DB_PORT=3306
DB_USER=root
JWT_SECRET=hris-jwt-secret-key-for-production
PORT=5000
```

**Acceptance**:
```bash
cat .env | grep "DB_HOST=mysql"
# Expected: Found
```

## F1: Final Integration Test
**Action**:
- [ ] Clean start: `docker compose down -v` (remove volumes)
- [ ] Build and up: `docker compose up --build -d`
- [ ] Wait 30 seconds for MySQL healthcheck
- [ ] Check logs: `docker compose logs web | tail -20`
- [ ] Health check: `curl http://localhost:5000/health`
- [ ] Login test: `curl -X POST http://localhost:5000/auth/login -H "Content-Type: application/json" -d '{"nik":"ADM001","password":"admin123"}'`
- [ ] Open browser at http://localhost:5000
- [ ] Test all 7 pages: Login → Dashboard → Karyawan → Absensi → Cuti → Payroll → Laporan

**Acceptance Criteria**:
```bash
# 1. Health check
curl http://localhost:5000/health
# Expected: {"status":"ok"}

# 2. Login works
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"nik":"ADM001","password":"admin123"}'
# Expected: 200 with token, role, employeeId

# 3. Dashboard loads (requires login cookie/token, test in browser)
# Open http://localhost:5000 in browser
# Login with ADM001/admin123
# Expected: Dashboard shows stats, charts load

# 4. All pages accessible
# Navigate to each page via sidebar
# Expected: No 404s, no blank screens

# 5. Clean teardown
docker compose down
# Expected: Containers stop gracefully
```

## Post-Implementation Notes

### What Works After This Plan
- Single command: `docker compose up --build -d`
- Auto-seeding on first run (or every run - setup-db.js is idempotent)
- Access at http://localhost:5000
- All 7 pages functional
- Login with ADM001/admin123

### Commands Reference
```bash
# Start everything
docker compose up --build -d

# View logs
docker compose logs -f web

# Stop
docker compose down

# Reset everything (delete data)
docker compose down -v

# Access MySQL
docker compose exec mysql mysql -uroot -p hris_db
```

### Testing Checklist
- [ ] Build completes without errors
- [ ] MySQL container reports healthy
- [ ] Web container logs show "Database hris_db siap digunakan"
- [ ] Web container logs show "HRIS API running on http://localhost:5000"
- [ ] http://localhost:5000/health returns {"status":"ok"}
- [ ] Login with ADM001/admin123 succeeds
- [ ] Dashboard loads with data
- [ ] All sidebar navigation works
- [ ] Payroll page shows data
- [ ] Reports page shows charts
- [ ] Logout works
