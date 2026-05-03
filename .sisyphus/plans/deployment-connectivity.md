# Deployment Connectivity — Mobile APK + Web Deploy (Docker)

## TL;DR

> **Quick Summary**: Configure Express for production (API middleware + static serving + SPA fallback), Dockerize the full stack (MySQL + Express), configure mobile app for VPS connectivity and APK build readiness.
>
> **Deliverables**:
> - Express server configured for production (API middleware + static serving + SPA fallback)
> - Web frontend supports VITE_API_URL env var for production deployment
> - Mobile app configured with production API URL placeholder and Android build settings
> - Dockerfile (multi-stage build) + .dockerignore for web app
> - docker-compose.yml for production (MySQL + Express)
> - docker-compose.override.yml for development (hot-reload + MySQL)
> - VPS deployment guide (Docker-based, markdown)
> - APK build guide (markdown)
>
> **Estimated Effort**: Large
> **Parallel Execution**: YES - 3 waves + final verification
> **Critical Path**: T1 → T5-T7 → T8-T10 → T13 → F1-F4

---

## Context

### Original Request
"untuk yang mobile ingin saya export ke apk, untuk yang web akan dideploy, kira kira gmn caranya kedua aplikasi ini bisa terhubung?"

### Interview Summary
**Key Discussions**:
- Mobile: Export ke APK (local build via npx expo run:android)
- Web: Deploy ke VPS via Docker
- Full stack Docker: MySQL + Express in containers
- Docker Compose for dev AND production
- Access via IP address only (no domain, no SSL)
- Express serves static files (not adding nginx)
- Express middleware strips /api prefix (matches Vite proxy behavior)

**Research Findings**:
- Web frontend uses `fetch()` with relative path `/api` (const API = '/api' in App.jsx:17)
- Vite proxy strips /api prefix → backend routes are at root level
- `dotenv.config({ path: 'backend/.env' })` — CWD-dependent path, affects Dockerfile structure
- No `start` script in package.json — only `start:server` — Dockerfile CMD needs `node backend/src/server.js`
- `mysql2/promise` pool with `waitForConnections: true` — helps with MySQL startup
- Mobile app uses `__DEV__` ternary: dev → `10.0.2.2:5000`, prod → placeholder URL
- No android.package in app.json, no android/ directory, no signing config
- CORS is open (app.use(cors()))

### Metis Review
**Identified Gaps** (addressed):
- Android cleartext HTTP: Android 9+ blocks HTTP → add `usesCleartextTraffic="true"`
- /api middleware must use mount pattern `app.use('/api', ...)` → NOT global regex
- SPA fallback must NOT intercept /api 404s → must return JSON not HTML
- Middleware ordering: cors → helmet → morgan → json → /api-strip → routes → static → SPA-fallback → error-handler
- Mobile app calls routes WITHOUT /api prefix → root-level routes must still work
- Docker `.env` path is CWD-dependent → Dockerfile must set WORKDIR correctly or copy .env to expected path
- MySQL startup race condition → add health check + wait-for-it in docker-compose
- Port 3306 for MySQL container should not be exposed to host in production

---

## Work Objectives

### Core Objective
Dockerize the HRIS web app (MySQL + Express) for both development and production deployment, configure Express for production serving, and prepare the mobile app for APK export with VPS connectivity.

### Concrete Deliverables
- Modified `hris-web/backend/src/server.js` with /api middleware, static serving, SPA fallback
- Modified `hris-web/src/App.jsx` with VITE_API_URL env var support
- Modified `hris-mobile/frontend/services/api.js` with production URL
- Modified `hris-mobile/frontend/app.json` with android.package and cleartext traffic config
- New `hris-web/Dockerfile` (multi-stage: build frontend + run Express)
- New `hris-web/.dockerignore`
- New `docker-compose.yml` (production: MySQL + web app)
- New `docker-compose.override.yml` (dev: hot-reload + MySQL)
- New `DEPLOY.md` in project root (Docker-based VPS deployment guide)
- New `hris-mobile/frontend/BUILD-APK.md` (APK build guide)

### Definition of Done
- [ ] Express serves `/api/*` routes correctly (stripped to root-level routes)
- [ ] Express serves static files from `dist/` for the web frontend
- [ ] SPA fallback serves `index.html` for non-API routes but NOT for /api 404s
- [ ] `npm run dev:all` still works (Vite proxy not broken)
- [ ] Web frontend builds with `npm run build` and VITE_API_URL works
- [ ] Docker production build succeeds (`docker compose build`)
- [ ] Docker production container starts and serves both API and static files
- [ ] Docker dev environment starts with hot-reload for backend and frontend
- [ ] Mobile app.json has `android.package` and cleartext traffic config
- [ ] Mobile api.js has updated production URL placeholder
- [ ] Deployment guide covers Docker setup on VPS
- [ ] APK build guide covers prebuild, cleartext config, and build commands

### Must Have
- Express /api strip middleware using mount pattern (NOT global regex)
- Express static serving from dist/ directory
- SPA fallback that excludes /api paths
- VITE_API_URL env var with /api default
- Mobile production URL hardcoded as `http://YOUR_VPS_IP:5000`
- Android cleartext traffic permission
- Android package name in app.json
- Dockerfile with multi-stage build (build frontend, serve with Express)
- docker-compose.yml for production with MySQL + web app
- docker-compose.override.yml for dev with hot-reload
- Both guides as markdown files

### Must NOT Have (Guardrails)
- DO NOT modify any existing route definitions (they stay at root level)
- DO NOT modify CORS configuration (stays open)
- DO NOT add nginx or reverse proxy config
- DO NOT set up release signing for mobile app
- DO NOT change mobile app's __DEV__ ternary pattern
- DO NOT add new features or change API response formats
- DO NOT expose MySQL port 3306 to host in production docker-compose
- DO NOT use PM2/systemd (Docker handles process management)
- DO NOT add SSL/HTTPS configuration
- DO NOT create CI/CD pipeline

---

## Verification Strategy (MANDATORY)

> **ZERO HUMAN INTERVENTION** - ALL verification is agent-executed. No exceptions.

### Test Decision
- **Infrastructure exists**: NO (no test framework in either project)
- **Automated tests**: NO (deployment configuration, not feature code)
- **Framework**: None
- **Agent-Executed QA**: ALWAYS — curl for API, Docker commands for containers, build verification for mobile

### QA Policy
Every task MUST include agent-executed QA scenarios.
Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

- **API/Backend**: Use Bash (curl) — Send requests, assert status + response fields
- **Docker**: Use Bash (docker) — Build, run, stop, check container status, logs
- **Web UI**: Use Bash (curl) — Verify static serving, SPA routing
- **Mobile Config**: Use Bash — Verify file contents, build config values
- **Build**: Use Bash — Run build commands, check output

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately - config changes + Docker files, MAX PARALLEL):
├── Task 1: Configure Express for production (api middleware + static + SPA) [unspecified-high]
├── Task 2: Add VITE_API_URL env var to web App.jsx [quick]
├── Task 3: Update mobile api.js production URL [quick]
├── Task 4: Configure mobile app.json for Android build [quick]
├── Task 5: Create Dockerfile + .dockerignore [quick]
├── Task 6: Create docker-compose.yml (production) [unspecified-high]
└── Task 7: Create docker-compose.override.yml (dev) [unspecified-high]

Wave 2 (After Wave 1 - verification):
├── Task 8: Verify Docker production build + run (depends: 1, 5, 6) [deep]
├── Task 9: Verify Docker dev environment (depends: 6, 7) [deep]
├── Task 10: Verify backend serving via Docker (depends: 1, 8) [deep]
├── Task 11: Verify web frontend production build (depends: 2) [unspecified-high]
├── Task 12: Prebuild + verify mobile Android config (depends: 3, 4) [unspecified-high]

Wave 3 (After Wave 2 - guides):
├── Task 13: Create VPS deployment guide (depends: 8, 10) [writing]
└── Task 14: Create APK build guide (depends: 4, 12) [writing]

Wave FINAL (After ALL tasks — 4 parallel reviews):
├── Task F1: Plan compliance audit (oracle)
├── Task F2: Code quality review (unspecified-high)
├── Task F3: Real manual QA (unspecified-high)
└── Task F4: Scope fidelity check (deep)
-> Present results -> Get explicit user okay
```

### Dependency Matrix

| Task | Blocked By | Blocks |
|------|-----------|--------|
| 1    | -         | 8, 10, 13 |
| 2    | -         | 11    |
| 3    | -         | 12, 14 |
| 4    | -         | 12, 14 |
| 5    | -         | 8     |
| 6    | -         | 8, 9   |
| 7    | -         | 9     |
| 8    | 1, 5, 6   | 10, 13 |
| 9    | 6, 7      | -     |
| 10   | 1, 8      | 13    |
| 11   | 2         | -     |
| 12   | 3, 4      | 14    |
| 13   | 8, 10     | -     |
| 14   | 4, 12     | -     |

### Agent Dispatch Summary

- **Wave 1**: **7** — T1 → `unspecified-high`, T2-T5 → `quick`, T6-T7 → `unspecified-high`
- **Wave 2**: **5** — T8-T10 → `deep`, T11-T12 → `unspecified-high`
- **Wave 3**: **2** — T13-T14 → `writing`
- **FINAL**: **4** — F1 → `oracle`, F2-F3 → `unspecified-high`, F4 → `deep`

---

## TODOs

- [x] 1. Configure Express for Production (API Middleware + Static Serving + SPA Fallback)

  **What to do**:
  - In `hris-web/backend/src/server.js`, add `/api` strip middleware using mount pattern `app.use('/api', (req, res, next) => { req.url = req.url.replace(/^\/api/, ''); next(); })` — place AFTER `app.use(express.json())` but BEFORE all route definitions
  - After ALL route definitions and BEFORE the error handler, add static file serving: `app.use(express.static(path.join(__dirname, '../../dist')))` — serves built frontend from dist/
  - After static serving, add SPA fallback: `app.get('*', (req, res) => { if (!req.url.startsWith('/api')) { res.sendFile(path.join(__dirname, '../../dist/index.html')) } })` — serves index.html for all non-API routes BUT NOT for /api routes
  - Add `import path from 'path'` at top of server.js if not already present
  - Verify the final middleware ordering is: `cors → helmet → morgan → json → /api-strip → routes → static → SPA-fallback → error-handler`
  - Ensure `/health` endpoint still works at both `/health` and `/api/health`

  **Must NOT do**:
  - DO NOT change any existing route definitions
  - DO NOT add global regex middleware that mutates ALL request URLs
  - DO NOT modify CORS configuration

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high` — Careful middleware ordering and Express.js expertise
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES — Wave 1
  - **Blocks**: Tasks 8, 10, 13
  - **Blocked By**: None

  **References**:
  - `hris-web/backend/src/server.js:1-20` — Current middleware ordering
  - `hris-web/backend/src/server.js:1276-1291` — Error handler position
  - `hris-web/vite.config.js:8-14` — Vite proxy regex pattern to match
  - `hris-web/backend/src/server.js:19` — `/health` endpoint for testing

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: /api routes return JSON after middleware strip
    Tool: Bash (curl)
    Preconditions: Backend running on port 5000
    Steps:
      1. cd hris-web && node backend/src/server.js (or npm run dev:server)
      2. curl -s http://localhost:5000/api/health → assert "status":"ok"
      3. curl -s http://localhost:5000/health → assert "status":"ok"
    Expected Result: Both /api/health and /health return identical JSON
    Evidence: .sisyphus/evidence/task-1-api-middleware.txt

  Scenario: SPA fallback serves index.html for non-API routes
    Tool: Bash (curl)
    Preconditions: Frontend built (npm run build), backend running
    Steps:
      1. cd hris-web && npm run build && node backend/src/server.js
      2. curl -s http://localhost:5000/ | head -5 → assert HTML
      3. curl -s http://localhost:5000/dashboard | head -5 → assert HTML
    Expected Result: Root URL and SPA routes serve index.html
    Evidence: .sisyphus/evidence/task-1-spa-fallback.txt

  Scenario: API 404 returns JSON not HTML
    Tool: Bash (curl)
    Preconditions: Backend running with static serving
    Steps:
      1. curl -s http://localhost:5000/api/nonexistent-route
      2. Assert response is JSON (contains "message" or "error")
      3. Assert response does NOT contain "<!DOCTYPE html"
    Expected Result: JSON error message, not SPA index.html
    Evidence: .sisyphus/evidence/task-1-api-404-json.txt
  ```

  **Commit**: YES (groups with Task 2)
  - Message: `feat(web): add production API middleware and static serving`
  - Files: `hris-web/backend/src/server.js`

- [x] 2. Add VITE_API_URL Env Var to Web App.jsx

  **What to do**:
  - In `hris-web/src/App.jsx`, change `const API = '/api'` to `const API = import.meta.env.VITE_API_URL || '/api'`
  - Create `.env.example` in `hris-web/` with: `# VITE_API_URL=http://YOUR_VPS_IP:5000/api`
  - Verify `npm run build` still succeeds without VITE_API_URL set

  **Must NOT do**:
  - DO NOT change any other line in App.jsx
  - DO NOT create .env with actual values

  **Recommended Agent Profile**:
  - **Category**: `quick` — Single-line change plus one new file
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES — Wave 1
  - **Blocks**: Task 11
  - **Blocked By**: None

  **References**:
  - `hris-web/src/App.jsx:17` — Current API constant definition

  **Acceptance Criteria**:

  ```
  Scenario: Default build works
    Tool: Bash (npm)
    Steps:
      1. cd hris-web && npm run build
      2. grep -r "/api" dist/assets/*.js | head -3
      3. Assert /api found in bundle
    Evidence: .sisyphus/evidence/task-2-default-build.txt

  Scenario: Custom URL build works
    Tool: Bash (npm)
    Steps:
      1. VITE_API_URL="http://192.168.1.100:5000/api" npm run build
      2. grep -r "192.168.1.100" dist/assets/*.js | head -3
      3. Assert custom URL found in bundle
    Evidence: .sisyphus/evidence/task-2-custom-url.txt
  ```

  **Commit**: YES (groups with Task 1)
  - Message: `feat(web): add production API middleware and static serving`
  - Files: `hris-web/src/App.jsx`, `hris-web/.env.example`

- [x] 3. Update Mobile api.js Production URL

  **What to do**:
  - In `hris-mobile/frontend/services/api.js`, change production URL from `'https://your-production-api.com'` to `'http://YOUR_VPS_IP:5000'`
  - Full line: `const API_BASE_URL = __DEV__ ? 'http://10.0.2.2:5000' : 'http://YOUR_VPS_IP:5000';`
  - Add comment above explaining YOUR_VPS_IP must be replaced before building APK
  - URL uses `http://` (no SSL)

  **Must NOT do**:
  - DO NOT change __DEV__ ternary pattern
  - DO NOT add https://
  - DO NOT add environment variable systems

  **Recommended Agent Profile**:
  - **Category**: `quick` — Single-line change with comment
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES — Wave 1
  - **Blocks**: Tasks 12, 14
  - **Blocked By**: None

  **References**:
  - `hris-mobile/frontend/services/api.js:1-3` — Current API_BASE_URL definition

  **Acceptance Criteria**:

  ```
  Scenario: Production URL correctly formatted
    Tool: Bash (grep)
    Steps:
      1. cat hris-mobile/frontend/services/api.js | head -5
      2. Assert __DEV__ ternary present with YOUR_VPS_IP:5000 in production branch
      3. Assert http:// used (not https://)
    Evidence: .sisyphus/evidence/task-3-api-url.txt
  ```

  **Commit**: YES (groups with Task 4)
  - Message: `feat(mobile): configure production API URL and Android build`
  - Files: `hris-mobile/frontend/services/api.js`

- [x] 4. Configure Mobile app.json for Android Build

  **What to do**:
  - In `hris-mobile/frontend/app.json`, add `"package": "com.hris.workmate"` under `expo.android`
  - Add `"usesCleartextTraffic": true` under `expo.android` (HTTP support for Android 9+)
  - Verify JSON is valid

  **Must NOT do**:
  - DO NOT add release signing config
  - DO NOT create eas.json
  - DO NOT change app name or other existing config

  **Recommended Agent Profile**:
  - **Category**: `quick` — Small config change to JSON file
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES — Wave 1
  - **Blocks**: Tasks 12, 14
  - **Blocked By**: None

  **References**:
  - `hris-mobile/frontend/app.json` — Current Expo config

  **Acceptance Criteria**:

  ```
  Scenario: app.json has Android package and cleartext config
    Tool: Bash (grep)
    Steps:
      1. grep "com.hris.workmate" hris-mobile/frontend/app.json
      2. grep "usesCleartextTraffic" hris-mobile/frontend/app.json
      3. node -e "JSON.parse(require('fs').readFileSync('hris-mobile/frontend/app.json','utf8')); console.log('VALID')"
    Evidence: .sisyphus/evidence/task-4-app-json.txt
  ```

  **Commit**: YES (groups with Task 3)
  - Message: `feat(mobile): configure production API URL and Android build`
  - Files: `hris-mobile/frontend/app.json`

- [x] 5. Create Dockerfile + .dockerignore

  **What to do**:
  - Create `hris-web/Dockerfile` with multi-stage build:
    - **Stage 1 (builder)**: Use `node:20-alpine`, copy package.json + package-lock.json, run `npm install`, copy all source files, run `npm run build` to produce dist/
    - **Stage 2 (runner)**: Use `node:20-alpine`, copy package.json + package-lock.json from builder, run `npm install --omit=dev` (production only), copy backend/src/ and dist/ from builder, set WORKDIR to `/app`, expose port 5000, CMD `node backend/src/server.js`
    - **Important**: The `.env` loading uses `dotenv.config({ path: 'backend/.env' })` which is CWD-dependent. In Docker, WORKDIR must be set so that `backend/.env` resolves correctly. Set `WORKDIR /app` and ensure the file structure matches: `/app/backend/.env`, `/app/backend/src/server.js`, `/app/dist/`
  - Create `hris-web/.dockerignore` with: `node_modules`, `dist`, `.git`, `.env`, `*.md`, `.sisyphus`

  **Must NOT do**:
  - DO NOT copy .env into Docker image (pass via docker-compose env vars or bind mount)
  - DO NOT run as root user (add `USER node` in runner stage for security)
  - DO NOT install dev dependencies in runner stage

  **Recommended Agent Profile**:
  - **Category**: `quick` — Standard Dockerfile creation
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES — Wave 1
  - **Blocks**: Task 8
  - **Blocked By**: None

  **References**:
  - `hris-web/package.json` — Scripts: `build`, `start:server`, dependencies list
  - `hris-web/backend/src/server.js:1-11` — dotenv config path `backend/.env` (CWD-dependent)
  - `hris-web/vite.config.js` — Build output goes to `dist/`

  **Acceptance Criteria**:

  ```
  Scenario: Dockerfile builds successfully
    Tool: Bash (docker)
    Steps:
      1. cd hris-web
      2. docker build -t hris-web .
      3. Assert BUILD SUCCESS and image created
    Evidence: .sisyphus/evidence/task-5-docker-build.txt

  Scenario: .dockerignore excludes node_modules and .env
    Tool: Bash (cat)
    Steps:
      1. cat hris-web/.dockerignore
      2. Assert node_modules, .env, .git are listed
    Evidence: .sisyphus/evidence/task-5-dockerignore.txt
  ```

  **Commit**: YES (groups with Task 6, 7)
  - Message: `feat(devops): add Docker configuration for web app`
  - Files: `hris-web/Dockerfile`, `hris-web/.dockerignore`

- [x] 6. Create docker-compose.yml (Production)

  **What to do**:
  - Create `docker-compose.yml` in project root (`D:\WEB HRIS\docker-compose.yml`) with:
    - **mysql** service: `mysql:8` image, environment vars (MYSQL_ROOT_PASSWORD, MYSQL_DATABASE=hris_db), named volume for data persistence, health check with `mysqladmin ping`, no port exposure to host (only internal network)
    - **web** service: build from `./hris-web`, depends_on mysql (with condition: service_healthy), environment vars (DB_HOST=mysql, DB_PORT=3306, DB_USER=root, DB_PASSWORD, DB_NAME=hris_db, JWT_SECRET, PORT=5000), ports `5000:5000`, restart: unless-stopped
    - **volumes**: mysql_data for MySQL persistence
    - **networks**: internal network for mysql ↔ web communication
  - MySQL should NOT expose port 3306 to the host (security)
  - Web app should expose port 5000

  **Must NOT do**:
  - DO NOT expose MySQL port 3306 to host in production compose
  - DO NOT hardcode passwords in docker-compose.yml (use .env file or environment variables)
  - DO NOT add nginx or reverse proxy service

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high` — Docker Compose networking and service orchestration
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES — Wave 1
  - **Blocks**: Tasks 8, 9
  - **Blocked By**: None

  **References**:
  - `hris-web/backend/.env.example` — Environment variable names and defaults
  - `hris-web/backend/src/server.js:1-11` — `dotenv.config({ path: 'backend/.env' })` path handling
  - `hris-web/backend/src/db.js` — MySQL connection config (mysql2/promise)

  **Acceptance Criteria**:

  ```
  Scenario: docker-compose.yml has all required services
    Tool: Bash (grep)
    Steps:
      1. grep "mysql" docker-compose.yml
      2. grep "web" docker-compose.yml
      3. grep "5000:5000" docker-compose.yml
      4. grep "depends_on" docker-compose.yml
    Evidence: .sisyphus/evidence/task-6-compose-services.txt

  Scenario: MySQL port not exposed to host
    Tool: Bash (grep)
    Steps:
      1. grep "3306" docker-compose.yml
      2. Assert NO "3306:3306" port mapping (only internal)
    Evidence: .sisyphus/evidence/task-6-mysql-internal.txt
  ```

  **Commit**: YES (groups with Task 5, 7)
  - Message: `feat(devops): add Docker configuration for web app`
  - Files: `docker-compose.yml`

- [x] 7. Create docker-compose.override.yml (Development)

  **What to do**:
  - Create `docker-compose.override.yml` in project root with development overrides:
    - **web** service override: mount `./hris-web/backend/src` as volume for hot-reload, override command with nodemon or node --watch for backend hot-reload, mount `./hris-web/src` for frontend dev server
    - Add **frontend** service for Vite dev server: build context not needed, use `npm run dev` command, volume mount `./hris-web/src`, expose port 5173, depends_on web
    - **mysql**: expose port 3306 to host for dev convenience (3306:3306)
  - The override file is automatically merged with docker-compose.yml by Docker Compose
  - For dev: `docker compose up` (uses both docker-compose.yml AND docker-compose.override.yml)
  - For prod: `docker compose -f docker-compose.yml up` (production only, no overrides)

  **Must NOT do**:
  - DO NOT include production-sensitive values in override
  - DO NOT override the web service's production build (only override command and volumes)
  - DO NOT add services that aren't needed for dev

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high` — Docker Compose override configuration
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES — Wave 1
  - **Blocks**: Task 9
  - **Blocked By**: None

  **References**:
  - `hris-web/package.json` — Dev scripts: `dev`, `dev:server`, `dev:all`
  - `hris-web/vite.config.js` — Vite dev server config (port 5173, proxy)

  **Acceptance Criteria**:

  ```
  Scenario: Override file has dev services
    Tool: Bash (grep)
    Steps:
      1. grep "5173" docker-compose.override.yml (frontend dev port)
      2. grep "3306:3306" docker-compose.override.yml (MySQL exposed for dev)
      3. grep "volume" docker-compose.override.yml (hot-reload mounts)
    Evidence: .sisyphus/evidence/task-7-override-services.txt
  ```

  **Commit**: YES (groups with Task 5, 6)
  - Message: `feat(devops): add Docker configuration for web app`
  - Files: `docker-compose.override.yml`

- [x] 8. Verify Docker Production Build + Run

  **What to do**:
  - Build the Docker image: `docker compose build`
  - Start the production stack: `docker compose -f docker-compose.yml up -d`
  - Wait for MySQL to be healthy and web app to start
  - Run comprehensive tests:
    1. `curl http://localhost:5000/api/health` → JSON ok
    2. `curl http://localhost:5000/health` → JSON ok
    3. `curl http://localhost:5000/` → HTML (SPA)
    4. `curl http://localhost:5000/dashboard` → HTML (SPA fallback)
    5. `curl http://localhost:5000/api/nonexistent` → JSON error (NOT HTML)
  - Check MySQL is NOT accessible from host: `curl http://localhost:3306` should fail
  - Stop and clean up: `docker compose -f docker-compose.yml down`

  **Must NOT do**:
  - DO NOT modify any code during this task
  - DO NOT commit any changes

  **Recommended Agent Profile**:
  - **Category**: `deep` — Methodical verification of Docker container behavior
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO — needs Tasks 1, 5, 6 completed first
  - **Blocks**: Tasks 10, 13
  - **Blocked By**: Tasks 1, 5, 6

  **References**:
  - `docker-compose.yml` — Production compose config created in Task 6
  - `hris-web/Dockerfile` — Dockerfile created in Task 5

  **Acceptance Criteria**:

  ```
  Scenario: Docker image builds successfully
    Tool: Bash (docker)
    Steps:
      1. docker compose build
      2. Assert BUILD SUCCESS and image created
    Evidence: .sisyphus/evidence/task-8-docker-build.txt

  Scenario: Production containers start and serve
    Tool: Bash (docker + curl)
    Steps:
      1. docker compose -f docker-compose.yml up -d
      2. sleep 15 (wait for MySQL health check + app startup)
      3. curl -s http://localhost:5000/api/health → assert "ok"
      4. curl -s http://localhost:5000/ → assert HTML
      5. curl -s http://localhost:5000/api/nonexistent → assert JSON (not HTML)
    Evidence: .sisyphus/evidence/task-8-docker-run.txt

  Scenario: MySQL not exposed to host in production
    Tool: Bash (curl)
    Steps:
      1. curl -s http://localhost:3306 2>&1 | head -3
      2. Assert connection refused or timeout (NOT MySQL response)
    Evidence: .sisyphus/evidence/task-8-mysql-internal.txt
  ```

  **Commit**: NO (verification only)

- [x] 9. Verify Docker Dev Environment

  **What to do**:
  - Start dev environment: `docker compose up` (uses both compose files)
  - Verify MySQL is accessible from host at port 3306
  - Verify backend hot-reload works (modify a console.log, see it reflected)
  - Verify frontend dev server runs at port 5173
  - Verify Vite proxy works: `curl http://localhost:5173/api/health` → JSON ok
  - Stop and clean up

  **Must NOT do**:
  - DO NOT modify any code permanently
  - DO NOT commit any changes

  **Recommended Agent Profile**:
  - **Category**: `deep` — Methodical verification of dev environment
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO — needs Tasks 6, 7 completed first
  - **Blocks**: None
  - **Blocked By**: Tasks 6, 7

  **References**:
  - `docker-compose.override.yml` — Dev overrides created in Task 7
  - `docker-compose.yml` — Production config created in Task 6

  **Acceptance Criteria**:

  ```
  Scenario: Dev environment starts correctly
    Tool: Bash (docker)
    Steps:
      1. docker compose up -d
      2. sleep 10 (wait for services)
      3. docker compose ps → assert all services running
    Evidence: .sisyphus/evidence/task-9-dev-start.txt

  Scenario: MySQL accessible from host in dev
    Tool: Bash (curl/telnet)
    Steps:
      1. curl -s http://localhost:3306 2>&1 | head -3
      2. Assert MySQL response (or connection established)
    Evidence: .sisyphus/evidence/task-9-dev-mysql.txt

  Scenario: Vite dev server works with proxy
    Tool: Bash (curl)
    Steps:
      1. curl -s http://localhost:5173/api/health
      2. Assert JSON response with "status":"ok"
    Evidence: .sisyphus/evidence/task-9-dev-vite.txt
  ```

  **Commit**: NO (verification only)

- [x] 10. Verify Backend Serving via Docker

  **What to do**:
  - Using the Docker production stack from Task 8, verify all backend functionality:
    1. `/api/health` returns JSON
    2. `/health` returns JSON (backward compat)
    3. `/` serves HTML (SPA)
    4. `/dashboard` serves HTML (SPA fallback)
    5. `/api/nonexistent` returns JSON (not HTML)
  - Also verify `npm run dev:all` still works outside Docker

  **Must NOT do**:
  - DO NOT modify any code
  - DO NOT commit any changes

  **Recommended Agent Profile**:
  - **Category**: `deep` — Comprehensive API behavior verification
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO — needs Tasks 1, 8 completed first
  - **Blocks**: Task 13
  - **Blocked By**: Tasks 1, 8

  **References**:
  - `hris-web/backend/src/server.js` — Middleware and route config from Task 1

  **Acceptance Criteria**:

  ```
  Scenario: All routes work through Docker
    Tool: Bash (curl)
    Steps:
      1. docker compose -f docker-compose.yml up -d
      2. sleep 15
      3. curl -s http://localhost:5000/api/health → JSON ok
      4. curl -s http://localhost:5000/health → JSON ok
      5. curl -s http://localhost:5000/ → HTML
      6. curl -s http://localhost:5000/dashboard → HTML
      7. curl -s http://localhost:5000/api/nonexistent → JSON error
    Evidence: .sisyphus/evidence/task-10-docker-routes.txt

  Scenario: Dev mode still works outside Docker
    Tool: Bash (npm + curl)
    Steps:
      1. cd hris-web && npm run dev:all
      2. sleep 5
      3. curl -s http://localhost:5173/api/health → JSON ok
    Evidence: .sisyphus/evidence/task-10-dev-mode.txt
  ```

  **Commit**: NO (verification only)

- [x] 11. Verify Web Frontend Production Build

  **What to do**:
  - Run `cd hris-web && npm run build` to verify production build succeeds
  - Check `dist/` directory contents
  - Verify built JS contains `/api` path (default)
  - Test build with `VITE_API_URL` set and verify custom URL in bundle
  - Run `npm run lint` to check for issues

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high` — Build verification
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (independent)
  - **Blocks**: None
  - **Blocked By**: Task 2

  **References**:
  - `hris-web/package.json` — Build scripts

  **Acceptance Criteria**:

  ```
  Scenario: Build succeeds and contains /api
    Tool: Bash (npm + grep)
    Steps:
      1. cd hris-web && npm run build
      2. ls dist/ → assert index.html exists
      3. grep -r "/api" dist/assets/*.js | head -3 → assert found
    Evidence: .sisyphus/evidence/task-11-build.txt

  Scenario: Custom VITE_API_URL builds correctly
    Tool: Bash (npm + grep)
    Steps:
      1. VITE_API_URL="http://192.168.1.100:5000/api" npm run build
      2. grep -r "192.168.1.100" dist/assets/*.js → assert found
    Evidence: .sisyphus/evidence/task-11-custom-url.txt
  ```

  **Commit**: NO (verification only)

- [x] 12. Prebuild + Verify Mobile Android Config

  **What to do**:
  - Run `npx expo prebuild --platform android --clean` in hris-mobile/frontend
  - Verify AndroidManifest.xml has `usesCleartextTraffic="true"`
  - Verify build.gradle has `applicationId "com.hris.workmate"`
  - DO NOT commit android/ directory to git

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high` — Native config verification
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Blocks**: Task 14
  - **Blocked By**: Tasks 3, 4

  **References**:
  - `hris-mobile/frontend/app.json` — Source config from Task 4

  **Acceptance Criteria**:

  ```
  Scenario: Expo prebuild generates android/ with correct config
    Tool: Bash (npx + grep)
    Steps:
      1. cd hris-mobile/frontend && npx expo prebuild --platform android --clean
      2. grep "usesCleartextTraffic" android/app/src/main/AndroidManifest.xml
      3. grep "com.hris.workmate" android/app/build.gradle
    Evidence: .sisyphus/evidence/task-12-prebuild.txt
  ```

  **Commit**: NO (verification only, android/ not committed)

- [x] 13. Create VPS Deployment Guide (Docker-Based)

  **What to do**:
  - Create `DEPLOY.md` in project root with Docker-based deployment guide:
    1. **Prerequisites**: Docker, Docker Compose, Git
    2. **Quick Start**: `git clone`, `docker compose up -d`, create .env
    3. **Environment Variables**: Required env vars (DB_PASSWORD, JWT_SECRET, etc.)
    4. **Database Setup**: `docker compose exec web npm run db:setup` or manual MySQL init
    5. **Building**: `docker compose build`
    6. **Running**: `docker compose -f docker-compose.yml up -d` (production)
    7. **Verification**: curl commands to test endpoints
    8. **Stopping**: `docker compose down`
    9. **Updating**: Pull latest code, rebuild, restart
    10. **Troubleshooting**: Common Docker issues
    11. **Security Notes**: Change JWT_SECRET and DB_PASSWORD from defaults

  **Must NOT do**:
  - DO NOT include PM2/systemd (Docker handles process management)
  - DO NOT include nginx, SSL, or domain configuration
  - DO NOT include CI/CD pipeline setup

  **Recommended Agent Profile**:
  - **Category**: `writing` — Documentation/guide writing
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Blocks**: None
  - **Blocked By**: Tasks 8, 10

  **References**:
  - `hris-web/SETUP.md` — Existing setup guide for style reference
  - `docker-compose.yml` — Production compose config
  - `hris-web/backend/.env.example` — Environment variable names

  **Acceptance Criteria**:

  ```
  Scenario: DEPLOY.md has all required sections
    Tool: Bash (grep)
    Steps:
      1. grep -i "docker compose" DEPLOY.md
      2. grep -i "environment" DEPLOY.md
      3. grep -i "verification\|curl" DEPLOY.md
      4. grep -i "security\|JWT_SECRET" DEPLOY.md
    Evidence: .sisyphus/evidence/task-13-deploy.md
  ```

  **Commit**: YES (groups with Task 14)
  - Message: `docs: add Docker deployment and APK build guides`
  - Files: `DEPLOY.md`

- [x] 14. Create APK Build Guide

  **What to do**:
  - Create `hris-mobile/frontend/BUILD-APK.md` with:
    1. **Prerequisites**: Android Studio, JDK 17+, Android SDK
    2. **Configuration**: Replace `YOUR_VPS_IP` in api.js with actual VPS IP
    3. **Prebuild**: `npx expo prebuild --platform android`
    4. **APK Types**: Explain dev build vs release build
    5. **Development Build**: `npx expo run:android` (__DEV__=true → uses dev URL)
    6. **Release Build**: `./gradlew assembleRelease` with debug signing
    7. **Cleartext Traffic**: Explain usesCleartextTraffic and why it's needed
    8. **Troubleshooting**: Common issues

  **Must NOT do**:
  - DO NOT add signing configs (debug signing only)
  - DO NOT add eas.json
  - DO NOT include app store distribution steps

  **Recommended Agent Profile**:
  - **Category**: `writing` — Documentation/guide writing
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Blocks**: None
  - **Blocked By**: Tasks 4, 12

  **References**:
  - `hris-mobile/frontend/services/api.js:1-3` — YOUR_VPS_IP placeholder
  - `hris-mobile/frontend/app.json` — Android config

  **Acceptance Criteria**:

  ```
  Scenario: BUILD-APK.md has all required sections
    Tool: Bash (grep)
    Steps:
      1. grep -i "prerequisites\|android studio" hris-mobile/frontend/BUILD-APK.md
      2. grep -i "YOUR_VPS_IP" hris-mobile/frontend/BUILD-APK.md
      3. grep -i "prebuild" hris-mobile/frontend/BUILD-APK.md
      4. grep -i "cleartext" hris-mobile/frontend/BUILD-APK.md
      5. grep -i "__DEV__" hris-mobile/frontend/BUILD-APK.md
    Evidence: .sisyphus/evidence/task-14-apk.md
  ```

  **Commit**: YES (groups with Task 13)
  - Message: `docs: add Docker deployment and APK build guides`
  - Files: `hris-mobile/frontend/BUILD-APK.md`

---

## Commit Strategy

- **Commit 1**: `feat(web): add production API middleware and static serving` — server.js, App.jsx, .env.example (Tasks 1, 2)
- **Commit 2**: `feat(mobile): configure production API URL and Android build` — api.js, app.json (Tasks 3, 4)
- **Commit 3**: `feat(devops): add Docker configuration for web app` — Dockerfile, .dockerignore, docker-compose.yml, docker-compose.override.yml (Tasks 5, 6, 7)
- **Commit 4**: `docs: add Docker deployment and APK build guides` — DEPLOY.md, BUILD-APK.md (Tasks 13, 14)

---

## Success Criteria

### Verification Commands
```bash
# Docker: Production build + run
docker compose build
# Expected: BUILD SUCCESS

docker compose -f docker-compose.yml up -d
# Expected: Both containers running

# Docker: API routes work
curl -s http://localhost:5000/api/health | jq '.status'
# Expected: "ok"

curl -s http://localhost:5000/health | jq '.status'
# Expected: "ok"

# Docker: Static serving + SPA
curl -s http://localhost:5000/ | head -5
# Expected: HTML content

curl -s http://localhost:5000/dashboard | head -5
# Expected: HTML content (SPA fallback)

curl -s http://localhost:5000/api/nonexistent | jq '.message'
# Expected: JSON error (not HTML)

# Dev: Docker Compose with overrides
docker compose up -d
# Expected: MySQL + backend + frontend all running
curl -s http://localhost:5173/api/health | jq '.status'
# Expected: "ok" (through Vite proxy)

# Non-Docker: Dev mode still works
cd hris-web && npm run dev:all
# Expected: Both frontend and backend running

# Web: Build succeeds
cd hris-web && npm run build
# Expected: dist/ created, no errors

# Mobile: Android config
cat hris-mobile/frontend/app.json | jq '.expo.android.package'
# Expected: "com.hris.workmate"
```

### Final Checklist
- [ ] All "Must Have" present
- [ ] All "Must NOT Have" absent
- [ ] Docker production build succeeds
- [ ] Docker production containers start and serve correctly
- [ ] Docker dev environment starts with hot-reload
- [ ] npm run dev:all still works (non-Docker dev)
- [ ] npm run build succeeds for web frontend
- [ ] Express serves both API and static files on same port
- [ ] /api routes return JSON (not HTML)
- [ ] Mobile app.json has android.package and cleartext config
- [ ] MySQL not exposed to host in production docker-compose

---

## Final Verification Wave