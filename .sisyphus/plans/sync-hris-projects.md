# Sinkronisasi & Verifikasi HRIS Mobile + Web

## TL;DR

> **Quick Summary**: Perbaiki API URL mobile agar mengarah ke backend web (port 5000 bukan 5001), hapus backend mobile yang sudah deprecated, update dokumentasi, dan verifikasi kedua frontend dapat build & run.
> 
> **Deliverables**:
> - Mobile frontend terhubung ke backend web yang benar
> - Backend mobile yang deprecated dihapus seluruhnya
> - Dokumentasi README diperbarui agar konsisten
> - Kedua frontend terverifikasi build & run tanpa error
> 
> **Estimated Effort**: Short (4-6 tasks, 1-2 jam kerja)
> **Parallel Execution**: YES - 2 waves
> **Critical Path**: Task 1 → Task 4,5,6 (Task 2,3 parallel setelah Task 1)

---

## Context

### Original Request
User meminta sinkronisasi kedua project HRIS (hris-mobile dan hris-web) dan memastikan kedua frontend berjalan mulus.

### Interview Summary
**Key Discussions**:
- Backend mobile sudah tidak dipakai (README bilang "Tidak Digunakan") → User konfirmasi: **hapus seluruhnya**
- Semua screen mobile sudah pakai real API, bukan mock data → User konfirmasi: **verifikasi semua screen**
- Kedua frontend harus bisa build & run → User konfirmasi: **ya, verifikasi keduanya**

**Research Findings**:
- API URL di `hris-mobile/frontend/services/api.js` masih menunjuk ke `http://10.0.2.2:5001` (port backend mobile yang sudah deprecated). Seharusnya `http://10.0.2.2:5000`.
- Web backend di port 5000 sudah memiliki **SEMUA** endpoint yang dibutuhkan mobile, dengan format response yang **100% identik**.
- CORS di web backend sudah open (`app.use(cors())`), sehingga mobile app bisa mengakses tanpa masalah.
- JWT_SECRET sama (`super-secret-key`), token kompatibel antar kedua system.
- Prisma schema di mobile backend hanya berisi komentar peringatan — sudah dikonfirmasi tidak dipakai.

### Metis Review
**Identified Gaps** (addressed):
- Production URL placeholder (`https://your-production-api.com`) → **Default applied**: Biarkan sebagai placeholder, user belum punya domain production. Catat sebagai known issue.
- Mobile README klaim "data statis (mockup)" → **Minor fix**: Update README untuk mencerminkan kenyataan bahwa semua screen sudah pakai real API.
- Root README masih referensi mobile backend dan port 5001 → **Minor fix**: Update README.
- Auth response format kompatibilitas → **Auto-resolved**: Dimetris verifikasi 100% identik, tidak ada perubahan code diperlukan.

---

## Work Objectives

### Core Objective
Memastikan hris-mobile dan hris-web menggunakan satu backend yang sama (port 5000) dan kedua frontend dapat build & run tanpa error.

### Concrete Deliverables
- `hris-mobile/frontend/services/api.js` — API URL diperbaiki ke port 5000
- `hris-mobile/backend/` — Dihapus seluruhnya
- `hris-mobile/README.md` — Diupdate tanpa referensi backend terpisah
- `README.md` (root) — Diupdate tanpa referensi mobile backend port 5001
- Kedua frontend terverifikasi: `npm install` + `npm run build` / `npx expo start` berhasil

### Definition of Done
- [ ] `grep "5001" hris-mobile/frontend/services/api.js` mengembalikan 0 hasil
- [ ] `grep "5000" hris-mobile/frontend/services/api.js` menunjukkan `http://10.0.2.2:5000`
- [ ] `ls hris-mobile/backend/` mengembalikan error (directory deleted)
- [ ] `grep -r "5001" hris-mobile/frontend/` mengembalikan 0 hasil
- [ ] `cd hris-web && npm run build` exit code 0
- [ ] `cd hris-mobile/frontend && npm install` exit code 0
- [ ] Root README tidak mengandung "port 5001" atau bagian "Mobile API"
- [ ] Mobile README tidak mengandung instruksi backend terpisah

### Must Have
- Mobile frontend mengarah ke backend port 5000 yang benar
- Backend mobile dihapus seluruhnya
- Kedua frontend build tanpa error
- Dokumentasi konsisten

### Must NOT Have (Guardrails)
- JANGAN ubah format response API di web backend
- JANGAN tambahkan fitur baru (token refresh, rate limiting, dll.)
- JANGAN refactor web frontend App.jsx
- JANGAN implementasi fitur Task/Burnout yang belum ada
- JANGAN ubah database schema
- JANGAN konfigurasi production URL (belum ada domain)
- JANGAN tambahkan .env file untuk mobile (current __DEV__ approach cukup)

---

## Verification Strategy (MANDATORY)

> **ZERO HUMAN INTERVENTION** - ALL verification is agent-executed. No exceptions.

### Test Decision
- **Infrastructure exists**: NO (no test framework in either project)
- **Automated tests**: NO (not in scope — this is a sync/fix task, not feature development)
- **Framework**: none
- **Agent-Executed QA**: ALL tasks verified through Bash commands and file inspection

### QA Policy
Every task includes agent-executed QA scenarios.
Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

- **CLI/Build**: Use Bash — run build commands, verify exit codes, grep for strings
- **File Operations**: Use Bash — verify file/directory existence, content changes
- **API Check**: Use Bash (curl) — start backend, hit health endpoint, verify JSON response

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately - single critical fix):
└── Task 1: Fix API URL mobile dari port 5001 ke 5000 [quick]

Wave 2 (After Task 1 - cleanup + verification, MAX PARALLEL):
├── Task 2: Hapus backend mobile yang deprecated [quick]
├── Task 3: Update dokumentasi README [quick]
├── Task 4: Verifikasi build web frontend [quick]
├── Task 5: Verifikasi build mobile frontend [quick]
└── Task 6: Verifikasi web backend health + scan sisa referensi 5001 [quick]

Wave FINAL (After ALL tasks — review):
├── Task F1: Plan compliance audit (oracle)
├── Task F2: Code quality review (unspecified-high)
├── Task F3: Real manual QA (unspecified-high)
└── Task F4: Scope fidelity check (deep)

Critical Path: Task 1 → Task 2-6 (parallel) → F1-F4 → user okay
Parallel Speedup: ~60% faster than sequential
Max Concurrent: 5 (Wave 2)
```

### Dependency Matrix

| Task | Blocked By | Blocks |
|------|-----------|--------|
| 1 | - | 2, 3, 4, 5, 6 |
| 2 | 1 | F1-F4 |
| 3 | 1 | F1-F4 |
| 4 | 1 | F1-F4 |
| 5 | 1 | F1-F4 |
| 6 | 1 | F1-F4 |
| F1 | 1-6 | user okay |
| F2 | 1-6 | user okay |
| F3 | 1-6 | user okay |
| F4 | 1-6 | user okay |

### Agent Dispatch Summary

- **Wave 1**: 1 task — T1 → `quick`
- **Wave 2**: 5 tasks — T2-T5 → `quick`, T6 → `quick`
- **FINAL**: 4 tasks — F1 → `oracle`, F2 → `unspecified-high`, F3 → `unspecified-high`, F4 → `deep`

---

## TODOs

- [ ] 1. Fix API URL Mobile dari Port 5001 ke 5000

  **What to do**:
  - Edit file `hris-mobile/frontend/services/api.js`
  - Pada line 2, ubah `http://10.0.2.2:5001` menjadi `http://10.0.2.2:5000`
  - Production URL line 3 (`https://your-production-api.com`) dibiarkan sebagai placeholder — user belum punya domain production
  - Verifikasi tidak ada referensi lain ke port 5001 di seluruh frontend mobile

  **Must NOT do**:
  - Jangan tambahkan .env file (current __DEV__ approach cukup)
  - Jangan ubah format request/response
  - Jangan konfigurasi production URL

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Single line change, straightforward
  - **Skills**: []
    - No special skills needed for this simple edit

  **Parallelization**:
  - **Can Run In Parallel**: NO (other tasks depend on this)
  - **Parallel Group**: Wave 1 (solo)
  - **Blocks**: Tasks 2, 3, 4, 5, 6
  - **Blocked By**: None (can start immediately)

  **References**:

  **Pattern References** (existing code to follow):
  - `hris-mobile/frontend/services/api.js:1-5` - API URL configuration pattern — the `API_BASE_URL` constant with `__DEV__` ternary
  - `hris-web/vite.config.js:9-13` - Web frontend proxy pattern showing port 5000 is the canonical backend port

  **API/Type References** (contracts to implement against):
  - `hris-web/backend/src/server.js:14` - Backend port from env: `const PORT = process.env.PORT || 5000`
  - `hris-web/backend/.env:1` - Confirms PORT=5000 for web backend

  **WHY Each Reference Matters**:
  - `api.js` — This is THE file that needs to change. Contains the wrong port.
  - `vite.config.js` — Confirms web frontend also uses port 5000 (via proxy)
  - `server.js` — Confirms web backend default port is 5000
  - `.env` — Explicit configuration showing PORT=5000

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY)**:

  ```
  Scenario: API URL points to correct port
    Tool: Bash (grep)
    Preconditions: File hris-mobile/frontend/services/api.js exists
    Steps:
      1. Run: grep -n "5001" hris-mobile/frontend/services/api.js
      2. Assert: output is empty (0 matches)
      3. Run: grep -n "5000" hris-mobile/frontend/services/api.js
      4. Assert: output shows line with "http://10.0.2.2:5000"
    Expected Result: No references to port 5001 remain; port 5000 is present
    Failure Indicators: grep finds "5001" references, or grep doesn't find "5000"
    Evidence: .sisyphus/evidence/task-1-api-url-fix.txt

  Scenario: No other files reference port 5001
    Tool: Bash (grep recursive)
    Preconditions: API URL fix applied
    Steps:
      1. Run: grep -rn "5001" hris-mobile/frontend/ --include="*.js" --include="*.json"
      2. Assert: output is empty or only contains comments
    Expected Result: Zero functional references to port 5001 in mobile frontend
    Failure Indicators: grep finds "5001" in code (not comments)
    Evidence: .sisyphus/evidence/task-1-port-scan.txt
  ```

  **Commit**: YES
  - Message: `fix(mobile): redirect API to web backend port 5000`
  - Files: `hris-mobile/frontend/services/api.js`
  - Pre-commit: `grep -c "5001" hris-mobile/frontend/services/api.js` → should be 0

---

- [ ] 2. Hapus Backend Mobile yang Deprecated

  **What to do**:
  - Hapus seluruh direktori `hris-mobile/backend/` beserta isinya:
    - `hris-mobile/backend/server.js`
    - `hris-mobile/backend/.env`
    - `hris-mobile/backend/package.json`
    - `hris-mobile/backend/package-lock.json`
    - `hris-mobile/backend/node_modules/`
    - `hris-mobile/backend/prisma/` (schema.prisma + generated/)
    - `hris-mobile/backend/prisma.config.ts`
    - `hris-mobile/backend/README.md`
  - Verifikasi tidak ada import dari frontend mobile yang merujuk ke backend lokal

  **Must NOT do**:
  - Jangan hapus `hris-mobile/README.md` (root mobile README, itu Task 3)
  - Jangan ubah file di hris-web backend
  - Jangan hapus node_modules mobile frontend

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple directory deletion
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 3, 4, 5, 6)
  - **Blocks**: F1-F4
  - **Blocked By**: Task 1

  **References**:

  **Pattern References**:
  - `hris-mobile/backend/README.md` — Explicitly states "Tidak Digunakan" (not used), confirms this directory can be safely deleted

  **API/Type References**:
  - `hris-mobile/frontend/services/api.js` — Already points to external API (not local backend imports), confirms no import dependency on local backend

  **WHY Each Reference Matters**:
  - `backend/README.md` — Provides explicit confirmation the backend is deprecated
  - `api.js` — Confirms mobile frontend makes HTTP requests, not local imports — deleting backend won't break frontend

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY)**:

  ```
  Scenario: Backend directory fully deleted
    Tool: Bash
    Preconditions: Task 1 completed
    Steps:
      1. Run: ls "D:\WEB HRIS\hris-mobile\backend" 2>&1
      2. Assert: output contains error/directory not found
      3. Run: test -d "D:\WEB HRIS\hris-mobile\backend" && echo "EXISTS" || echo "DELETED"
      4. Assert: output is "DELETED"
    Expected Result: Directory does not exist
    Failure Indicators: Directory still exists
    Evidence: .sisyphus/evidence/task-2-backend-deleted.txt

  Scenario: No frontend imports reference deleted backend
    Tool: Bash (grep)
    Preconditions: Backend directory deleted
    Steps:
      1. Run: grep -rn "from.*backend" hris-mobile/frontend/ --include="*.js" --include="*.jsx"
      2. Assert: output is empty
      3. Run: grep -rn "require.*backend" hris-mobile/frontend/ --include="*.js" --include="*.jsx"
      4. Assert: output is empty
    Expected Result: No import/require statements reference the deleted backend
    Failure Indicators: Any import/require pointing to backened directory
    Evidence: .sisyphus/evidence/task-2-no-orphan-imports.txt
  ```

  **Commit**: YES (groups with Task 3)
  - Message: `chore(mobile): remove deprecated backend, update documentation`
  - Files: entire `hris-mobile/backend/` directory + README changes from Task 3
  - Pre-commit: `test -d "D:\WEB HRIS\hris-mobile\backend"` → should fail

---

- [ ] 3. Update Dokumentasi README

  **What to do**:
  - **Update `hris-mobile/README.md`**:
    - Hapus bagian "Backend (Server)" dari Tech Stack (termasuk mention SQLite dan Prisma)
    - Hapus bagian "Menjalankan Backend" dari Cara Menjalankan
    - Hapus `backend/` dari struktur folder proyek
    - Update arsitektur diagram: mobile frontend → hris-web backend (port 5000)
    - Perbaiki klaim "data statis (mockup)" — semua screen sudah pakai real API
    - Update instruksi setup: hanya perlu `npx expo start` untuk frontend, dan `npm run dev:all` dari hris-web untuk backend
    - Hapus roadmap item tentang "Koneksi modul ke REST API backend" karena sudah terhubung
  
  - **Update root `README.md`** (`D:\WEB HRIS\README.md`):
    - Hapus bagian "Mobile API (port 5001)" endpoint table
    - Update "Menjalankan Secara Terpisah" — hapus instruksi mobile backend
    - Update struktur proyek — hapus `hris-mobile/backend/` subdirectory
    - Update troubleshooting — ganti referensi "port 5001" jadi "port 5000"
    - Update bagian setup mobile: hanya perlu start hris-web backend + mobile frontend
    - Tambahkan arsitektur diagram baru yang menunjukkan mobile frontend → web backend

  **Must NOT do**:
  - Jangan rewrite seluruh README — hanya update bagian yang relevan
  - Jangan hapus informasi yang masih akurat
  - Jangan tambahkan fitur baru ke dokumentasi

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Documentation updates, straightforward text edits
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 2, 4, 5, 6)
  - **Blocks**: F1-F4
  - **Blocked By**: Task 1

  **References**:

  **Pattern References**:
  - `D:\WEB HRIS\README.md` — Root README that needs mobile backend references removed
  - `D:\WEB HRIS\hris-mobile\README.md` — Mobile README with outdated backend references and "mockup data" claim

  **WHY Each Reference Matters**:
  - Both READMEs contain outdated information that directly contradicts the current architecture

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY)**:

  ```
  Scenario: Root README has no port 5001 references
    Tool: Bash (grep)
    Preconditions: Task 3 edits complete
    Steps:
      1. Run: grep -n "5001" "D:\WEB HRIS\README.md"
      2. Assert: output is empty
      3. Run: grep -n "Mobile API" "D:\WEB HRIS\README.md"
      4. Assert: output is empty or only in context of "not used" / "deprecated"
    Expected Result: No references to port 5001 or standalone Mobile API section
    Failure Indicators: grep finds "5001" or "Mobile API" as active endpoint
    Evidence: .sisyphus/evidence/task-3-root-readme-check.txt

  Scenario: Mobile README has no backend setup instructions
    Tool: Bash (grep)
    Preconditions: Task 3 edits complete
    Steps:
      1. Run: grep -n "node server.js" "D:\WEB HRIS\hris-mobile\README.md"
      2. Assert: output is empty or only says "not used" / "deprecated"
      3. Run: grep -n "mockup" "D:\WEB HRIS\hris-mobile\README.md"
      4. Assert: output is empty (claim of mock data removed)
      5. Run: grep -n "port 5001" "D:\WEB HRIS\hris-mobile\README.md"
      6. Assert: output is empty
    Expected Result: Mobile README doesn't reference deprecated backend or mock data claims
    Failure Indicators: README still contains "node server.js" instructions or "port 5001"
    Evidence: .sisyphus/evidence/task-3-mobile-readme-check.txt
  ```

  **Commit**: YES (groups with Task 2)
  - Message: `chore(mobile): remove deprecated backend, update documentation`
  - Files: `hris-mobile/backend/` (deleted) + `hris-mobile/README.md` + `README.md`
  - Pre-commit: verify README changes

---

- [ ] 4. Verifikasi Build Web Frontend

  **What to do**:
  - Navigate ke `D:\WEB HRIS\hris-web`
  - Jalankan `npm install` untuk memastikan dependencies terinstal
  - Jalankan `npm run build` untuk memastikan frontend React bisa build tanpa error
  - Jalankan `npm run lint` untuk check kode quality
  - Catat hasil build: exit code, warning, error

  **Must NOT do**:
  - Jangan start database atau jalankan backend untuk task ini
  - Jangan fix lint warnings — hanya catat dan laporkan
  - Jangan modifikasi kode untuk menyelesaikan build errors (itu scope berbeda)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Running build commands, straightforward verification
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 2, 3, 5, 6)
  - **Blocks**: F1-F4
  - **Blocked By**: Task 1

  **References**:

  **Pattern References**:
  - `D:\WEB HRIS\hris-web\package.json:6-12` — Build scripts: `dev`, `dev:server`, `dev:all`, `build`, `lint`
  - `D:\WEB HRIS\AGENTS.md` — Documents expected build/lint commands

  **WHY Each Reference Matters**:
  - `package.json` — Defines the build commands to run
  - `AGENTS.md` — Specifies expected validation workflow

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY)**:

  ```
  Scenario: Web frontend builds successfully
    Tool: Bash
    Preconditions: Node.js available, hris-web directory exists
    Steps:
      1. Run: cd "D:\WEB HRIS\hris-web" && npm install
      2. Assert: exit code 0
      3. Run: cd "D:\WEB HRIS\hris-web" && npm run build
      4. Assert: exit code 0
      5. Run: cd "D:\WEB HRIS\hris-web" && npm run lint
      6. Assert: exit code 0 (or only warnings, no errors)
    Expected Result: `npm install`, `npm run build`, and `npm run lint` all succeed
    Failure Indicators: Any command returns non-zero exit code
    Evidence: .sisyphus/evidence/task-4-web-build.txt

  Scenario: Build produces dist directory
    Tool: Bash
    Preconditions: Build succeeded
    Steps:
      1. Run: test -d "D:\WEB HRIS\hris-web\dist" && echo "EXISTS" || echo "MISSING"
      2. Assert: output is "EXISTS"
      3. Run: ls "D:\WEB HRIS\hris-web\dist" | head -5
      4. Assert: output contains "index.html" or "assets"
    Expected Result: Build output directory exists with expected files
    Failure Indicators: dist directory missing or empty
    Evidence: .sisyphus/evidence/task-4-dist-check.txt
  ```

  **Commit**: NO (verification only, no code changes)

---

- [ ] 5. Verifikasi Build Mobile Frontend

  **What to do**:
  - Navigate ke `D:\WEB HRIS\hris-mobile\frontend`
  - Jalankan `npm install` untuk memastikan dependencies terinstal
  - Verifikasi `npx expo start --help` bisa dijalankan (tidak perlu full start, cukup verifikasi Expo CLI tersedia)
  - Catat hasil: exit code, warning, error
  - Periksa apakah `node_modules` terinstal dengan benar

  **Must NOT do**:
  - Jangan start Expo dev server secara penuh (butuh emulator/device)
  - Jangan fix dependency errors — hanya catat dan laporkan
  - Jangan modifikasi package.json

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Running install commands, straightforward verification
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 2, 3, 4, 6)
  - **Blocks**: F1-F4
  - **Blocked By**: Task 1

  **References**:

  **Pattern References**:
  - `D:\WEB HRIS\hris-mobile\frontend\package.json` — Defines dependencies and Expo scripts
  - `D:\WEB HRIS\hris-mobile\frontend\app.json` — Expo configuration

  **WHY Each Reference Matters**:
  - `package.json` — Defines the install/start commands
  - `app.json` — Confirms this is a valid Expo project

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY)**:

  ```
  Scenario: Mobile frontend installs successfully
    Tool: Bash
    Preconditions: Node.js available, hris-mobile/frontend directory exists
    Steps:
      1. Run: cd "D:\WEB HRIS\hris-mobile\frontend" && npm install
      2. Assert: exit code 0
      3. Run: test -d "D:\WEB HRIS\hris-mobile\frontend\node_modules" && echo "EXISTS" || echo "MISSING"
      4. Assert: output is "EXISTS"
    Expected Result: npm install succeeds and node_modules created
    Failure Indicators: npm install fails with non-zero exit code
    Evidence: .sisyphus/evidence/task-5-mobile-install.txt

  Scenario: Expo CLI is available
    Tool: Bash
    Preconditions: npm install succeeded
    Steps:
      1. Run: cd "D:\WEB HRIS\hris-mobile\frontend" && npx expo --version
      2. Assert: exit code 0 (Expo CLI version shown)
    Expected Result: Expo CLI version is displayed, confirming it's available
    Failure Indicators: npx expo command fails or not found
    Evidence: .sisyphus/evidence/task-5-expo-cli.txt
  ```

  **Commit**: NO (verification only, no code changes)

---

- [ ] 6. Verifikasi Web Backend Health + Scan Sisa Referensi 5001

  **What to do**:
  - Scan seluruh project (`D:\WEB HRIS`) untuk sisa referensi yang mungkin masih mengarah ke port 5001
  - Verifikasi web backend bisa start (opsional: `cd hris-web && npm run dev:server` + health check)
  - Verifikasi tidak ada import/hardcoded reference ke mobile backend di seluruh codebase
  - Verifikasi CORS di web backend menerima request dari origin manapun
  - Catat semua temuan

  **Must NOT do**:
  - Jangan start database MySQL jika belum berjalan (health check bisa skip jika DB tidak available)
  - Jangan modifikasi kode web backend
  - Jangan fix CORS jika sudah open (it is open)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Scanning and verification, no code changes needed
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 2, 3, 4, 5)
  - **Blocks**: F1-F4
  - **Blocked By**: Task 1

  **References**:

  **Pattern References**:
  - `D:\WEB HRIS\hris-web\backend\src\server.js:14-15` — CORS and port configuration to verify
  - `D:\WEB HRIS\hris-web\backend\.env` — Confirms PORT=5000 and database config

  **WHY Each Reference Matters**:
  - `server.js` — Contains `app.use(cors())` which needs verification that it allows mobile requests
  - `.env` — Confirms backend port is 5000

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY)**:

  ```
  Scenario: No remaining references to port 5001 in entire project
    Tool: Bash (grep recursive)
    Preconditions: Tasks 1-3 completed
    Steps:
      1. Run: grep -rn "5001" "D:\WEB HRIS" --include="*.js" --include="*.json" --include="*.md" --include="*.env" --include="*.sql" 2>/dev/null | grep -v "node_modules" | grep -v ".git"
      2. Review output for any functional references (not just comments in deleted/ignored files)
      3. Assert: No functional code references to port 5001 remain
    Expected Result: Zero functional code references to port 5001 across both projects
    Failure Indicators: Any .js or .config file still references 5001 as an active port
    Evidence: .sisyphus/evidence/task-6-port-scan-full.txt

  Scenario: Web backend CORS is open (allows mobile requests)
    Tool: Bash (grep)
    Preconditions: hris-web backend source available
    Steps:
      1. Run: grep -n "cors()" "D:\WEB HRIS\hris-web\backend\src\server.js"
      2. Assert: output contains "app.use(cors())" (open CORS, no origin restrictions)
    Expected Result: CORS is configured with no origin restriction, allowing mobile requests
    Failure Indicators: CORS is configured with specific origins that might exclude mobile
    Evidence: .sisyphus/evidence/task-6-cors-check.txt

  Scenario: No imports reference mobile backend directory
    Tool: Bash (grep recursive)
    Preconditions: Mobile backend directory deleted
    Steps:
      1. Run: grep -rn "hris-mobile/backend" "D:\WEB HRIS" --include="*.js" --include="*.json" --include="*.md" 2>/dev/null | grep -v "node_modules" | grep -v ".git"
      2. Assert: No references to hris-mobile/backend path in any active code
    Expected Result: No active code references the deleted backend directory
    Failure Indicators: Any import, script, or config still pointing to hris-mobile/backend
    Evidence: .sisyphus/evidence/task-6-backend-ref-scan.txt
  ```

  **Commit**: NO (verification only, no code changes)

---

## Final Verification Wave (MANDATORY — after ALL implementation tasks)

> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.

- [ ] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. For each "Must Have": verify implementation exists (read file, run command). For each "Must NOT Have": search codebase for forbidden patterns — reject with file:line if found. Check evidence files exist in .sisyphus/evidence/. Compare deliverables against plan.
  Output: `Must Have [5/5] | Must NOT Have [6/6] | Tasks [6/6] | VERDICT: APPROVE/REJECT`

- [ ] F2. **Code Quality Review** — `unspecified-high`
  Run `npm run lint` in hris-web and `npm run lint` (if available) in hris-mobile/frontend. Review `hris-mobile/frontend/services/api.js` for correctness. Check for: hardcoded wrong ports, orphaned imports, dead code referencing deleted backend. Verify README files are consistent with new architecture.
  Output: `Lint [PASS/FAIL] | Port Check [PASS/FAIL] | Orphaned Imports [PASS/FAIL] | README Consistency [PASS/FAIL] | VERDICT`

- [ ] F3. **Real Manual QA** — `unspecified-high`
  Start web backend: `cd hris-web && npm run dev:server`. Verify health: `curl http://localhost:5000/health` → `{"status":"ok"}`. Verify key endpoints: `POST /auth/login` with default credentials, `GET /dashboard/mobile` with token. Check mobile frontend `api.js` content: port is 5000. Verify `hris-mobile/backend/` directory does not exist.
  Output: `Health Check [PASS/FAIL] | Auth [PASS/FAIL] | Mobile API [PASS/FAIL] | Backend Deleted [PASS/FAIL] | VERDICT`

- [ ] F4. **Scope Fidelity Check** — `deep`
  For each task: read "What to do", verify implementation matches spec with no scope creep. Check "Must NOT do" compliance. Verify no files were modified beyond planned scope. Confirm Task 1 only changed api.js, Task 2 only deleted backend directory, Task 3 only updated READMEs.
  Output: `Tasks [6/6 compliant] | Scope Creep [CLEAN/N issues] | Unaccounted [CLEAN/N files] | VERDICT`

---

## Commit Strategy

- **Task 1**: `fix(mobile): redirect API to web backend port 5000` - `hris-mobile/frontend/services/api.js`
- **Tasks 2+3**: `chore(mobile): remove deprecated backend, update documentation` - `hris-mobile/backend/` (deleted) + `hris-mobile/README.md` + `README.md`
- Tasks 4, 5, 6: No commit (verification only)

---

## Success Criteria

### Verification Commands
```bash
# API URL fix verified
grep "5001" hris-mobile/frontend/services/api.js
# Expected: empty output (no 5001 references)

grep "5000" hris-mobile/frontend/services/api.js
# Expected: shows http://10.0.2.2:5000

# Backend directory deleted
ls "D:\WEB HRIS\hris-mobile\backend" 2>&1
# Expected: error / directory not found

# Web frontend builds
cd "D:\WEB HRIS\hris-web" && npm run build
# Expected: exit code 0

# Mobile frontend installs
cd "D:\WEB HRIS\hris-mobile\frontend" && npm install
# Expected: exit code 0

# No orphaned port 5001 references
grep -rn "5001" "D:\WEB HRIS" --include="*.js" --include="*.json" | grep -v node_modules | grep -v ".git"
# Expected: empty or only comments

# CORS is open
grep "cors()" hris-web/backend/src/server.js
# Expected: app.use(cors())
```

### Final Checklist
- [ ] All "Must Have" present: API URL fixed, backend deleted, READMEs updated, builds verified
- [ ] All "Must NOT Have" absent: No API format changes, no new features, no schema changes
- [ ] Web frontend builds successfully
- [ ] Mobile frontend installs successfully
- [ ] No port 5001 references remain in active code
- [ ] Documentation accurately reflects new architecture