# Frontend Modular Refactoring: Monolithic App.jsx → Modular Architecture + React Router

## TL;DR

> **Quick Summary**: Refactor HRIS web frontend from a 1,708-line monolithic `App.jsx` into a modular architecture with React Router for URL-based navigation, CSS modules per page, and proper separation of concerns. Zero behavioral or visual changes.
> 
> **Deliverables**:
> - Modular directory structure (pages/, components/, hooks/, utils/, contexts/)
> - React Router v6 with URL-based navigation
> - AuthContext for state management across routes
> - 8 extracted page components (Login, Dashboard, Karyawan, Absensi, Cuti, Payroll, Laporan, RoleManagement)
> - Shared layout components (Layout, Sidebar, TopBar)
> - Custom hooks (usePayroll, useEmployees, useReports)
> - Per-page CSS files + global shared styles
> - Shared utilities (api client, formatters, PDF export, constants)
> - ESLint fix for empty catch block
> 
> **Estimated Effort**: Large
> **Parallel Execution**: YES - 5 waves, max 4 concurrent tasks
> **Critical Path**: T1 → T3 → T4 → T5-T12 (sequential) → T13 → T14 → T15

---

## Context

### Original Request
User wants to refactor the HRIS web frontend from its current monolithic structure (1,708-line App.jsx with 824-line FeaturePages function) into a modular, maintainable architecture. The codebase lacks React Router, has 27 state variables in a single component, and 45+ props drilled through FeaturePages.

### Interview Summary
**Key Discussions**:
- Scope: Full modular refactoring + React Router (not incremental)
- CSS: Per-page CSS modules with global shared styles
- Testing: Build + Lint verification (no new test framework)
- No behavioral or visual changes allowed

**Research Findings**:
- App.jsx: 1,708 lines, FeaturePages: 824 lines, App.css: 833 lines
- 27 state variables, 14 async functions, 4 useEffect hooks
- No react-router-dom installed (needs installation)
- Backend already follows modular pattern (services/controllers/routes)
- src/ has zero sub-directories (flat structure)

### Metis Review
**Identified Gaps** (addressed):
- State loss on navigation: Will use AuthContext to persist auth state; accept that page-local state resets on navigation (standard SPA behavior)
- 45+ prop drilling: Will use AuthContext + feature-specific hooks to eliminate prop drilling
- CSS shared classes (`.panel`, `.status`, etc.): Will keep in global stylesheet, only extract page-specific styles
- Hardcoded "Rani Amelia": Preserve as-is (no behavior changes)
- React Router version: Use v6 (stable, NOT v7 beta)
- `exportPayrollCsv` closure: Convert to standalone utility receiving data as arguments
- URL paths: Use Indonesian keys matching menu labels (/karyawan, /absensi, etc.)

---

## Work Objectives

### Core Objective
Transform HRIS web frontend from monolithic single-file architecture into a modular, maintainable codebase with React Router, without any behavioral or visual changes.

### Concrete Deliverables
- `src/api/client.js` — Central API fetch wrapper
- `src/api/endpoints.js` — API path constants
- `src/utils/formatters.js` — formatRupiah utility
- `src/utils/pdfExport.js` — PDF export utility
- `src/utils/constants.js` — Menus, COLORS, role permissions
- `src/contexts/AuthContext.jsx` — Auth state provider
- `src/hooks/usePayroll.js` — Payroll state & operations hook
- `src/hooks/useEmployees.js` — Employee data & CRUD hook
- `src/hooks/useReports.js` — Reports data fetching hook
- `src/components/Layout.jsx` — Layout shell (sidebar + topbar + outlet)
- `src/components/Sidebar.jsx` — Navigation sidebar
- `src/components/TopBar.jsx` — Search bar + user info
- `src/components/Modal.jsx` — Reusable modal
- `src/components/MetricsGrid.jsx` — Dashboard metrics
- `src/components/PayrollItemBreakdown.jsx` — Payroll detail component
- `src/pages/Login.jsx` — Login page
- `src/pages/Dashboard.jsx` — Dashboard page
- `src/pages/Karyawan.jsx` — Employee page
- `src/pages/Absensi.jsx` — Attendance page
- `src/pages/Cuti.jsx` — Leave page
- `src/pages/Payroll.jsx` — Payroll page (with sub-tabs)
- `src/pages/Laporan.jsx` — Reports page
- `src/pages/RoleManagement.jsx` — Role management page
- `src/styles/global.css` — Shared/global styles
- `src/styles/login.css` through `src/styles/role.css` — Per-page styles
- Simplified `src/App.jsx` (< 100 lines, Router shell only)
- Updated `src/main.jsx` (with BrowserRouter)

### Definition of Done
- [ ] `npm run lint` → 0 errors
- [ ] `npm run build` → success (no errors)
- [ ] Login flow works: NIK + password → Dashboard
- [ ] All 7 menu items navigate correctly via URL
- [ ] Direct URL access works (e.g., `/payroll`)
- [ ] Unauthenticated URL access redirects to login
- [ ] All API calls still function (employees, attendance, payroll, etc.)
- [ ] PDF export still generates correctly
- [ ] CSV export still downloads correctly
- [ ] Edit salary modal still opens/closes (including Escape key)
- [ ] Responsive layout still works at all breakpoints

### Must Have
- Exact same visual appearance (zero CSS changes visible to user)
- Exact same API calls and form submissions
- React Router v6 with proper URL-based navigation
- AuthContext for token/role persistence across routes
- Feature-specific hooks replacing prop drilling
- Per-page CSS files for maintainability
- ESLint clean (0 errors)

### Follow-up Plan (AFTER this refactoring is complete)
- **Data Dummy Plan**: Create realistic seed data (30-50 employees, 30 days attendance, 3 months payroll, varied leave requests, expenses, tasks) as a SEPARATE plan after this refactoring is done. This is NOT part of the current scope.

### Must NOT Have (Guardrails)
- NO new features (no 404 page, no error boundaries, no loading skeletons)
- NO new dependencies beyond `react-router-dom`
- NO visual changes to any element
- NO API endpoint changes or backend modifications
- NO TypeScript, PropTypes, or testing framework additions
- NO route-based code splitting or lazy loading
- NO shared UI component library (DataTable, Modal, etc.) — that's scope creep
- NO change to hardcoded "Rani Amelia" username
- NO CSS Modules `.module.css` format — use regular per-page CSS imports
- NO change to the `AbortController` data-fetching pattern
- NO removal of the Escape key handler for modals
- NO change to `attendanceRows` fallback data behavior

---

## Verification Strategy

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed. No exceptions.

### Test Decision
- **Infrastructure exists**: NO (no testing framework)
- **Automated tests**: None (Build + Lint verification only)
- **Framework**: N/A
- **Primary verification**: Agent-executed QA scenarios after each task

### QA Policy
Every task MUST include agent-executed QA scenarios.
Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

- **Frontend/UI**: Use Playwright — Navigate, interact, assert DOM, screenshot
- **Build verification**: Bash (`npm run lint` + `npm run build`)
- **API/Backend**: Use Bash (curl) — Verify endpoints still respond

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately — foundation, no behavioral changes):
├── T1: Install react-router-dom dependency [quick]
└── T2: Extract shared utilities (api, formatters, pdfExport, constants) [unspecified-high]

Wave 2 (After Wave 1 — core infrastructure, depends on utilities):
├── T3: Create AuthContext + custom hooks [deep]
└── T4: Create Layout + shared components [visual-engineering]

Wave 3 (After Wave 2 — page extraction, SEQUENTIAL due to App.jsx conflicts):
├── T5: Extract Login page [quick]
├── T6: Extract Dashboard page [unspecified-high]
├── T7: Extract Karyawan + Absensi + Cuti pages [unspecified-high]
├── T8: Extract Payroll page (most complex — 500+ lines) [deep]
├── T9: Extract Laporan + RoleManagement pages [unspecified-high]

Wave 4 (After Wave 3 — integration, depends on all pages extracted):
├── T10: Wire up React Router (update main.jsx + App.jsx) [deep]
└── T11: Split CSS into per-page files [visual-engineering]

Wave 5 (After Wave 4 — cleanup):
└── T12: Fix ESLint error + final cleanup [quick]

Wave FINAL (After ALL tasks — 4 parallel reviews):
├── F1: Plan compliance audit (oracle)
├── F2: Code quality review (unspecified-high)
├── F3: Real manual QA via Playwright (unspecified-high + playwright)
└── F4: Scope fidelity check (deep)

Critical Path: T1 → T3 → T4 → T5 → T6 → T7 → T8 → T9 → T10 → T11 → T12 → F1-F4
Max Concurrent: 2 (Waves 1-2), 1 (Wave 3)
```

### Dependency Matrix

| Task | Depends On | Blocks |
|------|-----------|--------|
| T1 | — | T3, T10 |
| T2 | — | T3, T4, T5-T9 |
| T3 | T1, T2 | T5-T9, T10 |
| T4 | T2 | T5-T9, T10 |
| T5 | T3, T4 | T10 |
| T6 | T3, T4, T5 | T10 |
| T7 | T3, T4, T6 | T10 |
| T8 | T3, T4, T7 | T10 |
| T9 | T3, T4, T8 | T10 |
| T10 | T5-T9 | T11, T12 |
| T11 | T10 | T12 |
| T12 | T10, T11 | F1-F4 |

### Agent Dispatch Summary

- **Wave 1**: 2 tasks — T1 → `quick`, T2 → `unspecified-high`
- **Wave 2**: 2 tasks — T3 → `deep`, T4 → `visual-engineering`
- **Wave 3**: 5 tasks (sequential) — T5 → `quick`, T6 → `unspecified-high`, T7 → `unspecified-high`, T8 → `deep`, T9 → `unspecified-high`
- **Wave 4**: 2 tasks — T10 → `deep`, T11 → `visual-engineering`
- **Wave 5**: 1 task — T12 → `quick`
- **FINAL**: 4 tasks — F1 → `oracle`, F2 → `unspecified-high`, F3 → `unspecified-high` + `playwright`, F4 → `deep`

---

## TODOs

- [x] 1. Install react-router-dom dependency

  **What to do**:
  - Install `react-router-dom` (v6, latest stable — NOT v7 beta) as a production dependency
  - Verify installation by importing `BrowserRouter` in a test file temporarily and confirming no errors
  - Update `package.json` and `package-lock.json`

  **Must NOT do**:
  - Do NOT install v7 (use v6 stable only)
  - Do NOT install any other new dependencies (no CSS-in-JS, no state management libs)
  - Do NOT modify any existing code yet

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T2)
  - **Parallel Group**: Wave 1
  - **Blocks**: T3, T10
  - **Blocked By**: None (can start immediately)

  **References**:
  - `hris-web/package.json` — Current dependencies, verify react-router-dom not already installed
  - `hris-web/vite.config.js` — Vite configuration, ensure no path conflicts

  **WHY Each Reference Matters**:
  - `package.json`: Must verify no existing react-router-dom, check React version compatibility (React 19.2.5)
  - `vite.config.js`: May need to check proxy config still works after Router addition

  **Acceptance Criteria**:
  - [ ] `react-router-dom` appears in `package.json` dependencies with version ^6.x
  - [ ] `npm run build` succeeds
  - [ ] No existing code modified (only package.json and package-lock.json changed)

  **QA Scenarios**:

  ```
  Scenario: Dependency installed correctly
    Tool: Bash
    Preconditions: Node.js installed, hris-web directory exists
    Steps:
      1. cd "D:\WEB HRIS\hris-web"
      2. cat package.json | findstr react-router-dom
      3. Verify version starts with ^6 (NOT ^7)
    Expected Result: react-router-dom ^6.x listed in dependencies
    Failure Indicators: Version ^7.x, package not found, or no output
    Evidence: .sisyphus/evidence/task-1-dep-install.txt
  ```

  **Commit**: YES
  - Message: `chore(web): install react-router-dom dependency`
  - Files: `package.json`, `package-lock.json`
  - Pre-commit: `npm run build`

- [x] 2. Extract shared utilities from App.jsx

  **What to do**:
  - Create `src/api/client.js` — Extract the `api()` helper function from App.jsx (lines ~21-30). Export as named export. This function handles fetch with JWT token, error handling, and AbortController.
  - Create `src/api/endpoints.js` — Extract all API path strings into constants: AUTH_LOGIN, EMPLOYEES, SALARY_PROFILES, ATTENDANCE_TODAY, LEAVE, PAYROLL_RUNS, REPORTS_DASHBOARD, REPORTS_SALARY_DISTRIBUTION, REPORTS_LEAVE_STATS. Each constant should match the current path strings used in App.jsx.
  - Create `src/utils/formatters.js` — Extract `formatRupiah()` function. Export as named export.
  - Create `src/utils/pdfExport.js` — Extract `exportReportsToPDF()` function (~160 lines). This function currently takes `report`, `salaryDistribution`, `leaveStats` as parameters. Convert to named export keeping same signature.
  - Create `src/utils/constants.js` — Extract the following: (a) `menus` array (7 items with key/label/icon), (b) `COLORS` array used in Laporan charts, (c) role permission flags `canRunPayroll`, `canApproveFinance`, `canReview`, `canEditSalary` as functions that take a role string and return boolean.
  - Update `App.jsx` to import from the new files instead of defining inline.
  - Verify `npm run build` still succeeds after each extraction.

  **Must NOT do**:
  - Do NOT change any function signatures or behavior
  - Do NOT add TypeScript types or PropTypes
  - Do NOT change any visual output
  - Do NOT remove the original definitions until they're replaced with imports
  - Do NOT create shared UI components (DataTable, etc.) — that's scope creep

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T1)
  - **Parallel Group**: Wave 1
  - **Blocks**: T3, T4, T5-T9
  - **Blocked By**: None (can start immediately)

  **References**:
  - `hris-web/src/App.jsx` (lines 1-33) — Contains `api()` helper, module-level constants
  - `hris-web/src/App.jsx` (line ~21) — `api()` function definition
  - `hris-web/src/App.jsx` (line ~1542) — `formatRupiah()` function
  - `hris-web/src/App.jsx` (lines 1546-1706) — `exportReportsToPDF()` function
  - `hris-web/src/App.jsx` (line ~521) — Hardcoded "Rani Amelia" (DO NOT CHANGE)
  - `hris-web/src/App.jsx` (lines ~108-117) — `attendanceRows` useMemo with fallback data (PRESERVE pattern)
  - `hris-web/src/App.jsx` (lines ~255-266) — Escape key handler (PRESERVE pattern)

  **WHY Each Reference Matters**:
  - Lines 1-33: Source of the `api()` function and module-level constants to extract
  - Line 1542: The `formatRupiah` utility that's used in multiple places
  - Lines 1546-1706: The PDF export utility that must maintain exact same behavior
  - Line 521: Hardcoded username — must NOT be changed
  - Lines 108-117: Fallback data pattern — must be preserved exactly
  - Lines 255-266: Escape handler — must be preserved exactly

  **Acceptance Criteria**:
  - [ ] `src/api/client.js` exists and exports the `api` function
  - [ ] `src/api/endpoints.js` exists and exports all API path constants
  - [ ] `src/utils/formatters.js` exists and exports `formatRupiah`
  - [ ] `src/utils/pdfExport.js` exists and exports `exportReportsToPDF`
  - [ ] `src/utils/constants.js` exists and exports `menus`, `COLORS`, role permission functions
  - [ ] `App.jsx` imports from the new files instead of defining inline
  - [ ] `npm run build` succeeds with no errors
  - [ ] App behavior unchanged (manual visual check)

  **QA Scenarios**:

  ```
  Scenario: Build succeeds after utility extraction
    Tool: Bash
    Preconditions: All utility files created and App.jsx updated
    Steps:
      1. cd "D:\WEB HRIS\hris-web"
      2. npm run build
      3. Check exit code is 0
    Expected Result: Build completes successfully with no errors
    Failure Indicators: Build fails, import errors, undefined references
    Evidence: .sisyphus/evidence/task-2-build.txt

  Scenario: API client works correctly
    Tool: Bash
    Preconditions: App running (npm run dev:all)
    Steps:
      1. curl -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d '{"nik":"ADM001","password":"admin123"}'
      2. Verify response contains token
    Expected Result: Login returns { token: "...", role: "Super Admin", employeeId: 1 }
    Failure Indicators: 500 error, no token in response, import error
    Evidence: .sisyphus/evidence/task-2-api-client.txt
  ```

  **Commit**: YES
  - Message: `refactor(web): extract shared utilities from App.jsx`
  - Files: `src/api/client.js`, `src/api/endpoints.js`, `src/utils/formatters.js`, `src/utils/pdfExport.js`, `src/utils/constants.js`, `src/App.jsx`
  - Pre-commit: `npm run build`

- [x] 3. Create AuthContext and custom hooks

  **What to do**:
  - Create `src/contexts/AuthContext.jsx`:
    - Create a React Context that provides: `token`, `role`, `employeeId`, `user` (from /auth/me), `login(nik, password)`, `logout()`
    - Store token in localStorage on login, remove on logout
    - Auto-restore token from localStorage on mount
    - Fetch user data from `/auth/me` when token changes (use the `api` function from `src/api/client.js`)
    - Export `AuthProvider` and `useAuth` hook
  - Create `src/hooks/useEmployees.js`:
    - Extract employee-related state and functions: `employees`, `loadingEmployees`, fetch functions
    - Use `useAuth()` hook to get token for API calls
    - Return: `{ employees, loadingEmployees, fetchEmployees }`
  - Create `src/hooks/usePayroll.js`:
    - Extract ALL payroll-related state: `payrollTab`, `payrollRuns`, `selectedRunId`, `payrollDetail`, `selectedPayrollItemId`, `payrollDetailSearch`, `payrollMessage`, `runningPayroll`, `finalizingPayroll`, `salaryStructures`, `loadingSalary`, `salaryForm`, `editingEmployeeId`, `editSalaryModal`
    - Extract ALL payroll functions: `loadPayrollRuns`, `loadPayrollDetail`, `handleRunPayroll`, `handleReviewRun`, `handleApproveRun`, `handleRejectRun`, `handleFinalizeRun`, `handleValidateRun`, `handleSaveSalaryStructure`, `handleEditSalaryStructure`, `handleSaveEditedSalary`, `handleDeleteSalaryStructure`, and salary form change handlers
    - Use `useAuth()` hook to get token for API calls
    - This is the MOST COMPLEX hook — it manages ~15 pieces of payroll state
  - Create `src/hooks/useReports.js`:
    - Extract report-related state: `report`, `salaryDistribution`, `leaveStats`, `loadingReports`
    - Extract `loadDashboardData` and report fetch functions
    - Use `useAuth()` hook to get token for API calls

  **Must NOT do**:
  - Do NOT change any API call signatures or behavior
  - Do NOT change how data is fetched — same endpoints, same data shapes
  - Do NOT add new features (refresh tokens, error boundaries, etc.)
  - Do NOT modify backend code
  - Do NOT change the `api()` function behavior

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T4)
  - **Parallel Group**: Wave 2
  - **Blocks**: T5-T9, T10
  - **Blocked By**: T1, T2

  **References**:
  - `hris-web/src/App.jsx` (lines 35-682) — ALL state variables and functions to extract
  - `hris-web/src/App.jsx` (lines 39-58) — Login handler (`handleLogin`)
  - `hris-web/src/App.jsx` (lines 177-225) — Initial data load useEffect with AbortController
  - `hris-web/src/App.jsx` (lines 227-253) — Payroll/Reports data load useEffect
  - `hris-web/src/App.jsx` (lines 255-266) — Escape key handler useEffect
  - `hris-web/src/api/client.js` — API client to use in hooks (created in T2)
  - `hris-web/src/api/endpoints.js` — API constants to use (created in T2)

  **WHY Each Reference Matters**:
  - Lines 35-682: The ENTIRE App component containing all 27 state variables and 14 async functions — must be carefully extracted
  - Lines 177-225: The critical useEffect that loads data on login — AbortController pattern must be preserved
  - Lines 39-58: Login handler that sets token/role — must match exact behavior
  - Lines 227-253: Conditional data loading based on activePage — will become page-level effects
  - Lines 255-266: Escape key handler — must be preserved in Payroll page

  **Acceptance Criteria**:
  - [ ] `src/contexts/AuthContext.jsx` exists with AuthProvider and useAuth hook
  - [ ] `src/hooks/usePayroll.js` exists with all payroll state and functions
  - [ ] `src/hooks/useEmployees.js` exists with employee data and functions
  - [ ] `src/hooks/useReports.js` exists with report data and functions
  - [ ] All hooks use the `api` function from `src/api/client.js`
  - [ ] All hooks use `endpoints` constants from `src/api/endpoints.js`
  - [ ] `npm run build` succeeds
  - [ ] App.jsx still works (uses hooks via the context, not yet fully refactored)

  **QA Scenarios**:

  ```
  Scenario: AuthContext provides login/logout
    Tool: Bash
    Preconditions: App running (npm run dev:all)
    Steps:
      1. curl -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d '{"nik":"ADM001","password":"admin123"}'
      2. Verify response has token and role
    Expected Result: Login works, AuthContext stores token
    Failure Indicators: 401 error, undefined context values
    Evidence: .sisyphus/evidence/task-3-auth.txt

  Scenario: Hooks don't break build
    Tool: Bash
    Preconditions: All hook files created
    Steps:
      1. cd "D:\WEB HRIS\hris-web"
      2. npm run build
      3. Check exit code is 0
    Expected Result: Build succeeds
    Failure Indicators: Import errors, undefined exports
    Evidence: .sisyphus/evidence/task-3-build.txt
  ```

  **Commit**: YES
  - Message: `refactor(web): add AuthContext and custom hooks`
  - Files: `src/contexts/AuthContext.jsx`, `src/hooks/usePayroll.js`, `src/hooks/useEmployees.js`, `src/hooks/useReports.js`
  - Pre-commit: `npm run build`

- [x] 4. Create Layout and shared components

  **What to do**:
  - Create `src/components/Layout.jsx`:
    - Extract the main layout structure from App.jsx (sidebar + topbar + content area)
    - Use `<Outlet />` from react-router-dom for page content area
    - Accept children or use Outlet pattern for React Router
    - Preserve EXACT same CSS classes for layout (sidebar, content, topbar, etc.)
  - Create `src/components/Sidebar.jsx`:
    - Extract the sidebar/menu navigation from App.jsx (lines ~sidebar render)
    - Use `useAuth()` hook for role-based menu visibility
    - Use the `menus` constant from `src/utils/constants.js`
    - Use `<Link>` or `<NavLink>` from react-router-dom for navigation (instead of `setActivePage`)
    - Import `canRunPayroll`, `canApproveFinance`, etc. from constants for menu visibility
    - Preserve EXACT visual appearance: same icons, same hover effects, same active state
  - Create `src/components/TopBar.jsx`:
    - Extract the topbar/section-label from App.jsx
    - Show current page name (from route/path)
    - Include logout button that calls `logout()` from `useAuth()`
    - Preserve EXACT same CSS classes
  - Create `src/components/Modal.jsx`:
    - Extract the modal overlay/card component from App.jsx (used in edit salary)
    - Props: `open`, `onClose`, `children`, `title`
    - Include Escape key handler for closing
    - Preserve EXACT same CSS classes (modal-overlay, modal-card, etc.)
  - Create `src/components/MetricsGrid.jsx`:
    - Extract the metrics grid (4 cards) from Dashboard section
    - Accept `metrics` as prop (array of {label, value, color, icon})
    - Preserve EXACT same CSS classes
  - Create `src/components/PayrollItemBreakdown.jsx`:
    - Extract the payroll item breakdown component (lines 1510-1539)
    - Accept `item` as prop
    - Preserve EXACT same rendering logic

  **Must NOT do**:
  - Do NOT change any CSS classes or visual appearance
  - Do NOT add animations, transitions, or visual enhancements
  - Do NOT change the logout behavior (must still clear localStorage)
  - Do NOT add loading skeletons, error boundaries, or new UI components
  - Do NOT create a shared DataTable component (scope creep)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`playwright`]

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T3)
  - **Parallel Group**: Wave 2
  - **Blocks**: T5-T9, T10
  - **Blocked By**: T2

  **References**:
  - `hris-web/src/App.jsx` (sidebar section) — Sidebar HTML structure with menu items and icons
  - `hris-web/src/App.jsx` (topbar section) — TopBar with search input and user display
  - `hris-web/src/App.jsx` (modal section) — Modal overlay with form fields
  - `hris-web/src/App.jsx` (metrics section) — Dashboard metrics grid with 4 cards
  - `hris-web/src/App.jsx` (lines 1510-1539) — PayrollItemBreakdown component
  - `hris-web/src/App.css` (lines 60-165) — Sidebar and topbar CSS
  - `hris-web/src/App.css` (lines 167-394) — Dashboard and panel CSS
  - `hris-web/src/App.css` (lines 644-688) — Modal CSS
  - `hris-web/src/utils/constants.js` — menus array and role permissions (created in T2)
  - `hris-web/src/contexts/AuthContext.jsx` — AuthContext with useAuth hook (created in T3)

  **WHY Each Reference Matters**:
  - Sidebar section: Source HTML for navigation component — must preserve exact structure and classes
  - Lines 60-165: CSS for sidebar/topbar — must use same classes to keep identical appearance
  - Lines 1510-1539: PayrollItemBreakdown — already a separate component, just needs extraction
  - Lines 644-688: Modal CSS — must use same classes for identical visual behavior
  - `constants.js`: Menu items and permissions — needed for navigation and role-based visibility

  **Acceptance Criteria**:
  - [ ] `src/components/Layout.jsx` exists with Outlet pattern
  - [ ] `src/components/Sidebar.jsx` exists with NavLink-based navigation
  - [ ] `src/components/TopBar.jsx` exists with logout button
  - [ ] `src/components/Modal.jsx` exists with open/close/Escape handler
  - [ ] `src/components/MetricsGrid.jsx` exists with metrics prop
  - [ ] `src/components/PayrollItemBreakdown.jsx` exists with item prop
  - [ ] All components use same CSS classes as original App.jsx
  - [ ] `npm run build` succeeds

  **QA Scenarios**:

  ```
  Scenario: Components render without errors
    Tool: Bash
    Preconditions: All component files created
    Steps:
      1. cd "D:\WEB HRIS\hris-web"
      2. npm run build
      3. Check for no import errors or undefined references
    Expected Result: Build succeeds with 0 errors
    Failure Indicators: Import errors, undefined components, missing exports
    Evidence: .sisyphus/evidence/task-4-build.txt

  Scenario: Visual appearance unchanged
    Tool: Playwright
    Preconditions: App running (npm run dev:all), logged in
    Steps:
      1. Navigate to http://localhost:5173
      2. Login with ADM001/admin123
      3. Take screenshot of sidebar
      4. Take screenshot of topbar
      5. Compare CSS classes match original
    Expected Result: Sidebar and topbar render identically to original
    Failure Indicators: Missing elements, wrong colors, different sizing
    Evidence: .sisyphus/evidence/task-4-visual.png
  ```

  **Commit**: YES
  - Message: `refactor(web): extract Layout and shared components`
  - Files: `src/components/Layout.jsx`, `src/components/Sidebar.jsx`, `src/components/TopBar.jsx`, `src/components/Modal.jsx`, `src/components/MetricsGrid.jsx`, `src/components/PayrollItemBreakdown.jsx`
  - Pre-commit: `npm run build`

- [x] 5. Extract Login page from App.jsx

  **What to do**:
  - Create `src/pages/Login.jsx`:
    - Extract the login form section from App.jsx (the conditional render when `!token`)
    - Use `useAuth()` hook for `login()` function
    - Local state: `nik`, `password`, `error` (these are login-only state)
    - Preserve EXACT same form structure: NIK input, password input, "Masuk" button
    - Preserve EXACT same CSS classes
  - Import Login in the router setup (will be wired in T10)
  - Remove login rendering from App.jsx and replace with route reference

  **Must NOT do**:
  - Do NOT change the login form fields or validation
  - Do NOT change error messages (must stay in Indonesian)
  - Do NOT change the visual appearance
  - Do NOT add new features (remember me, forgot password, etc.)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 3 (sequential)
  - **Blocks**: T6, T10
  - **Blocked By**: T3, T4

  **References**:
  - `hris-web/src/App.jsx` (login section) — The conditional render when `!token`
  - `hris-web/src/contexts/AuthContext.jsx` — AuthContext with `login()` function (created in T3)
  - `hris-web/src/App.css` (lines 8-58) — Login page CSS classes

  **Acceptance Criteria**:
  - [ ] `src/pages/Login.jsx` exists with login form
  - [ ] Uses `useAuth()` hook for login
  - [ ] Same CSS classes as original
  - [ ] `npm run build` succeeds
  - [ ] Login form looks identical to original

  **QA Scenarios**:

  ```
  Scenario: Login form renders correctly
    Tool: Playwright
    Preconditions: App running, not logged in
    Steps:
      1. Navigate to http://localhost:5173
      2. Verify login form is visible with NIK and password fields
      3. Enter ADM001 / admin123
      4. Click "Masuk" button
    Expected Result: Login succeeds, redirects to dashboard
    Failure Indicators: Form not visible, login fails, wrong error message
    Evidence: .sisyphus/evidence/task-5-login.png
  ```

  **Commit**: YES
  - Message: `refactor(web): extract Login page from App.jsx`
  - Files: `src/pages/Login.jsx`, `src/App.jsx`
  - Pre-commit: `npm run build`

- [x] 6. Extract Dashboard page from App.jsx

  **What to do**:
  - Create `src/pages/Dashboard.jsx`:
    - Extract the dashboard section from FeaturePages (or App.jsx main render)
    - Uses `useAuth()` for role/employee data
    - Uses `useReports()` hook for dashboard data (report, salaryDistribution, leaveStats, loadingReports)
    - Uses `useEmployees()` hook for employee data
    - State: attendance data, leave data
    - Renders: MetricsGrid (4 cards), attendance table, leave timeline, payroll highlights
    - Preserve EXACT same rendering logic and CSS classes
  - Import Dashboard in the router setup

  **Must NOT do**:
  - Do NOT change dashboard metrics or card layout
  - Do NOT change the attendance table or leave timeline
  - Do NOT change any data fetching logic
  - Do NOT add new dashboard features

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 3 (sequential)
  - **Blocks**: T7, T10
  - **Blocked By**: T3, T4, T5

  **References**:
  - `hris-web/src/App.jsx` (dashboard section) — Metrics grid, attendance table, leave timeline rendering
  - `hris-web/src/App.jsx` (lines 177-225) — useEffect that loads dashboard data
  - `hris-web/src/hooks/useReports.js` — Reports data hook (created in T3)
  - `hris-web/src/hooks/useEmployees.js` — Employee data hook (created in T3)
  - `hris-web/src/components/MetricsGrid.jsx` — Shared metrics component (created in T4)

  **Acceptance Criteria**:
  - [ ] `src/pages/Dashboard.jsx` exists
  - [ ] Uses custom hooks for data fetching
  - [ ] Renders metrics grid, attendance table, leave timeline
  - [ ] `npm run build` succeeds
  - [ ] Dashboard looks identical to original

  **QA Scenarios**:

  ```
  Scenario: Dashboard renders with data
    Tool: Playwright
    Preconditions: App running, logged in as ADM001
    Steps:
      1. Navigate to http://localhost:5173/dashboard
      2. Verify 4 metric cards are visible
      3. Verify attendance table shows data
      4. Verify leave section shows pending requests
    Expected Result: Dashboard renders identically to original
    Failure Indicators: Missing cards, empty tables, broken layout
    Evidence: .sisyphus/evidence/task-6-dashboard.png
  ```

  **Commit**: YES
  - Message: `refactor(web): extract Dashboard page from App.jsx`
  - Files: `src/pages/Dashboard.jsx`, `src/App.jsx`
  - Pre-commit: `npm run build`

- [x] 7. Extract Karyawan, Absensi, and Cuti pages

  **What to do**:
  - Create `src/pages/Karyawan.jsx`:
    - Extract the employee (Karyawan) section from FeaturePages
    - Uses `useAuth()` for role permissions
    - Uses `useEmployees()` for employee data and CRUD operations
    - Renders: employee table, add/edit forms
    - Preserve EXACT same table structure and form fields
  - Create `src/pages/Absensi.jsx`:
    - Extract the attendance (Absensi) section from FeaturePages
    - Uses `useAuth()` for role
    - Local state: attendance data
    - Renders: attendance stats and table
    - Preserve EXACT same rendering including `attendanceRows` useMemo with fallback data
  - Create `src/pages/Cuti.jsx`:
    - Extract the leave (Cuti) section from FeaturePages
    - Uses `useAuth()` for role
    - Local state: leave data, pending/recent leaves
    - Renders: leave stats, approve/reject actions, leave table
    - Preserve EXACT same rendering including status badges
  - Remove these sections from FeaturePages/App.jsx

  **Must NOT do**:
  - Do NOT change table columns or sort order
  - Do NOT change form validation or error messages
  - Do NOT change status badge colors or styles
  - Do NOT add new CRUD operations

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 3 (sequential)
  - **Blocks**: T8, T10
  - **Blocked By**: T3, T4, T6

  **References**:
  - `hris-web/src/App.jsx` (karyawan section in FeaturePages) — Employee table and forms
  - `hris-web/src/App.jsx` (absensi section in FeaturePages) — Attendance stats and table
  - `hris-web/src/App.jsx` (cuti section in FeaturePages) — Leave requests and approvals
  - `hris-web/src/App.jsx` (lines 108-117) — `attendanceRows` useMemo with hardcoded fallback — MUST PRESERVE
  - `hris-web/src/hooks/useEmployees.js` — Employee hook (created in T3)
  - `hris-web/src/contexts/AuthContext.jsx` — AuthContext (created in T3)

  **Acceptance Criteria**:
  - [ ] `src/pages/Karyawan.jsx` exists with employee table and forms
  - [ ] `src/pages/Absensi.jsx` exists with attendance stats and table
  - [ ] `src/pages/Cuti.jsx` exists with leave management
  - [ ] `attendanceRows` fallback data preserved exactly
  - [ ] `npm run build` succeeds
  - [ ] All three pages render identically to original

  **QA Scenarios**:

  ```
  Scenario: Employee page renders with data
    Tool: Playwright
    Preconditions: App running, logged in
    Steps:
      1. Navigate to /karyawan
      2. Verify employee table shows data rows
      3. Verify table has columns: Nama, NIK, Departemen, Posisi, Status
    Expected Result: Employee table renders with data, same as before
    Failure Indicators: Empty table, missing columns, different layout
    Evidence: .sisyphus/evidence/task-7-karyawan.png

  Scenario: Attendance page with fallback data
    Tool: Playwright
    Preconditions: App running, logged in
    Steps:
      1. Navigate to /absensi
      2. Verify attendance stats render
      3. Verify table shows rows (even if API data is empty, fallback should show)
    Expected Result: Attendance page with stats and table
    Failure Indicators: Empty page, missing fallback data, broken stats
    Evidence: .sisyphus/evidence/task-7-absensi.png

  Scenario: Leave page with pending requests
    Tool: Playwright
    Preconditions: App running, logged in as admin
    Steps:
      1. Navigate to /cuti
      2. Verify leave requests are visible
      3. Verify status badges (Pending, Approved, Rejected) display correctly
    Expected Result: Leave management page works identically
    Failure Indicators: Missing requests, broken status badges
    Evidence: .sisyphus/evidence/task-7-cuti.png
  ```

  **Commit**: YES
  - Message: `refactor(web): extract Karyawan, Absensi, Cuti pages`
  - Files: `src/pages/Karyawan.jsx`, `src/pages/Absensi.jsx`, `src/pages/Cuti.jsx`, `src/App.jsx`
  - Pre-commit: `npm run build`

- [x] 8. Extract Payroll page (most complex — 500+ lines)

  **What to do**:
  - Create `src/pages/Payroll.jsx`:
    - This is the MOST COMPLEX page to extract (~500+ lines)
    - Uses `usePayroll()` hook for ALL payroll state and functions
    - Uses `useAuth()` for role permissions (`canRunPayroll`, `canApproveFinance`, `canReview`, `canEditSalary`)
    - Contains two tabs: "Run" and "Salary Structure"
    - "Run" tab: payroll run table, run detail view, action buttons (review, approve, reject, finalize, validate)
    - "Salary Structure" tab: salary profiles table, add/edit salary form with modal
    - MUST preserve the `editSalaryModal` with Escape key handler
    - MUST preserve the `exportPayrollCsv` function (convert from closure to standalone, receives data as params)
    - MUST preserve the `PayrollItemBreakdown` component (already extracted in T4)
    - Preserve EXACT same CSS classes: payroll-layout, payroll-tabs, salary-form, etc.
  - Remove the payroll section from FeaturePages/App.jsx

  **Must NOT do**:
  - Do NOT change payroll workflow (Draft → Review → Approve → Finalize)
  - Do NOT change salary calculation logic
  - Do NOT change the edit salary modal behavior (including Escape key)
  - Do NOT change CSV export format
  - Do NOT add new payroll features

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 3 (sequential, most complex task)
  - **Blocks**: T9, T10
  - **Blocked By**: T3, T4, T7

  **References**:
  - `hris-web/src/App.jsx` (payroll section in FeaturePages, lines ~820-1400) — Largest section, two tabs
  - `hris-web/src/App.jsx` (editSalaryModal state) — Modal with Escape key handler
  - `hris-web/src/App.jsx` (lines 255-266) — Escape key useEffect — MUST PRESERVE
  - `hris-web/src/hooks/usePayroll.js` — Payroll hook with 15+ state items (created in T3)
  - `hris-web/src/components/Modal.jsx` — Shared modal component (created in T4)
  - `hris-web/src/components/PayrollItemBreakdown.jsx` — Payroll detail component (created in T4)
  - `hris-web/src/App.css` (lines 476-702) — Payroll-specific CSS classes

  **WHY Each Reference Matters**:
  - Payroll section: Most complex page — two tabs, multiple tables, forms, modals
  - editSalaryModal: Must preserve Escape key close behavior
  - Lines 255-266: The useEffect that adds Escape key listener — critical for UX
  - Payroll CSS: Complex layout classes that must be preserved exactly

  **Acceptance Criteria**:
  - [ ] `src/pages/Payroll.jsx` exists with both tabs (Run + Salary Structure)
  - [ ] Uses `usePayroll()` hook for all payroll operations
  - [ ] Edit salary modal works (open/close/submit/Escape key)
  - [ ] Payroll workflow: Draft → Review → Approve → Finalize works
  - [ ] CSV export still downloads correctly
  - [ ] `npm run build` succeeds
  - [ ] Payroll page renders identically to original

  **QA Scenarios**:

  ```
  Scenario: Payroll run tab works
    Tool: Playwright
    Preconditions: App running, logged in as admin
    Steps:
      1. Navigate to /payroll
      2. Verify "Run" tab is active
      3. Verify payroll run table displays
      4. Click on a run to see detail
      5. Verify action buttons (Review, Approve, Finalize) appear
    Expected Result: Payroll page renders with run table and detail view
    Failure Indicators: Empty table, missing action buttons, broken layout
    Evidence: .sisyphus/evidence/task-8-payroll-run.png

  Scenario: Edit salary modal with Escape key
    Tool: Playwright
    Preconditions: App running, logged in as admin
    Steps:
      1. Navigate to /payroll
      2. Switch to "Salary Structure" tab
      3. Click edit button on a salary entry
      4. Verify modal opens with form fields
      5. Press Escape key
      6. Verify modal closes
    Expected Result: Modal opens and closes correctly with Escape key
    Failure Indicators: Modal doesn't open, doesn't close on Escape
    Evidence: .sisyphus/evidence/task-8-payroll-modal.png

  Scenario: Payroll CSV export
    Tool: Playwright
    Preconditions: App running, logged in as admin
    Steps:
      1. Navigate to /payroll
      2. Click on a payroll run
      3. Look for CSV export button
      4. Click it
    Expected Result: CSV file downloads with payroll data
    Failure Indicators: No download, wrong format, error
    Evidence: .sisyphus/evidence/task-8-payroll-csv.txt
  ```

  **Commit**: YES
  - Message: `refactor(web): extract Payroll page from App.jsx`
  - Files: `src/pages/Payroll.jsx`, `src/App.jsx`
  - Pre-commit: `npm run build`

- [x] 9. Extract Laporan and RoleManagement pages

  **What to do**:
  - Create `src/pages/Laporan.jsx`:
    - Extract the reports (Laporan) section from FeaturePages
    - Uses `useReports()` hook for report data, salary distribution, leave stats
    - Contains: metric cards, charts (PieChart, BarChart, LineChart), export PDF button
    - Uses `COLORS` constant from `src/utils/constants.js`
    - Uses `exportReportsToPDF` from `src/utils/pdfExport.js`
    - Uses `formatRupiah` from `src/utils/formatters.js`
    - Uses recharts components (PieChart, BarChart, etc.)
    - Preserve EXACT same chart rendering and PDF export
  - Create `src/pages/RoleManagement.jsx`:
    - Extract the role management section from FeaturePages
    - Uses `useAuth()` for role permissions
    - Contains: role table with permissions
    - Preserve EXACT same table structure
  - Remove these sections from FeaturePages/App.jsx
  - After this task, FeaturePages component should be EMPTY or removed entirely

  **Must NOT do**:
  - Do NOT change chart types or colors
  - Do NOT change PDF export format
  - Do NOT change report data or calculations
  - Do NOT add new report types

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 3 (sequential)
  - **Blocks**: T10
  - **Blocked By**: T3, T4, T8

  **References**:
  - `hris-web/src/App.jsx` (laporan section in FeaturePages) — Reports page with charts and PDF export
  - `hris-web/src/App.jsx` (role section in FeaturePages) — Role management table
  - `hris-web/src/utils/pdfExport.js` — PDF export utility (created in T2)
  - `hris-web/src/utils/formatters.js` — formatRupiah (created in T2)
  - `hris-web/src/utils/constants.js` — COLORS array (created in T2)
  - `hris-web/src/hooks/useReports.js` — Reports hook (created in T3)

  **Acceptance Criteria**:
  - [ ] `src/pages/Laporan.jsx` exists with charts and PDF export
  - [ ] `src/pages/RoleManagement.jsx` exists with role table
  - [ ] PDF export button generates correct PDF
  - [ ] Charts render with same colors and data
  - [ ] `npm run build` succeeds
  - [ ] Both pages render identically to original

  **QA Scenarios**:

  ```
  Scenario: Reports page with charts
    Tool: Playwright
    Preconditions: App running, logged in as admin
    Steps:
      1. Navigate to /laporan
      2. Verify chart containers are visible
      3. Verify metric cards show data
      4. Click "Export PDF" button
    Expected Result: Reports page renders with charts, PDF downloads
    Failure Indicators: Missing charts, empty data, PDF export fails
    Evidence: .sisyphus/evidence/task-9-laporan.png

  Scenario: Role management page
    Tool: Playwright
    Preconditions: App running, logged in as admin
    Steps:
      1. Navigate to /role
      2. Verify role table is visible with permissions
    Expected Result: Role management table displays correctly
    Failure Indicators: Empty table, missing columns
    Evidence: .sisyphus/evidence/task-9-role.png
  ```

  **Commit**: YES
  - Message: `refactor(web): extract Laporan and RoleManagement pages`
  - Files: `src/pages/Laporan.jsx`, `src/pages/RoleManagement.jsx`, `src/App.jsx`
  - Pre-commit: `npm run build`

- [x] 10. Wire up React Router with URL-based navigation

  **What to do**:
  - Update `src/main.jsx`:
    - Wrap `<App />` with `<BrowserRouter>` from react-router-dom
    - Import and render App component inside Router
  - Rewrite `src/App.jsx`:
    - Remove ALL page content from App.jsx (it should now only be a router shell)
    - Import Layout component from `src/components/Layout.jsx`
    - Import all page components from `src/pages/`
    - Define route configuration using `<Routes>` and `<Route>` from react-router-dom
    - Route map:
      - `/` → Redirect to `/dashboard` if authenticated, `/login` if not
      - `/login` → Login page
      - `/dashboard` → Dashboard page (protected)
      - `/karyawan` → Karyawan page (protected)
      - `/absensi` → Absensi page (protected)
      - `/cuti` → Cuti page (protected)
      - `/payroll` → Payroll page (protected)
      - `/laporan` → Laporan page (protected)
      - `/role` → RoleManagement page (protected)
    - Create a `<ProtectedRoute>` component that checks `useAuth().token` and redirects to `/login` if not authenticated
    - App.jsx should be < 100 lines after this refactor
  - Remove `activePage` state and `setActivePage` function (no longer needed)
  - Remove `FeaturePages` component (entire 824-line function)
  - Remove all page-specific state from App.jsx (they're now in hooks/pages)
  - Remove all page-specific functions from App.jsx (they're now in hooks/pages)
  - App.jsx should now only contain: Router, Route definitions, ProtectedRoute wrapper
  - Verify URL navigation works: clicking sidebar items updates URL
  - Verify direct URL access works: typing `/payroll` in browser loads payroll page
  - Verify unauthenticated access redirects to login: typing `/payroll` when not logged in redirects to `/login`

  **Must NOT do**:
  - Do NOT add route-based code splitting (React.lazy, Suspense) — that's scope creep
  - Do NOT add a 404 page — that's a new feature
  - Do NOT add error boundaries — that's a new feature
  - Do NOT add loading spinners/skeletons — that's a new feature
  - Do NOT change the URL path naming convention (use Indonesian as per menu keys)

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 4
  - **Blocks**: T11, T12
  - **Blocked By**: T5, T6, T7, T8, T9

  **References**:
  - `hris-web/src/main.jsx` — Current entry point (needs BrowserRouter wrapper)
  - `hris-web/src/App.jsx` — Current monolithic file to replace with router shell
  - `hris-web/src/contexts/AuthContext.jsx` — AuthContext with token/role (created in T3)
  - `hris-web/src/components/Layout.jsx` — Layout with Sidebar + TopBar + Outlet (created in T4)
  - `hris-web/src/components/Sidebar.jsx` — Sidebar with NavLink (created in T4)
  - `hris-web/src/pages/` — All page components (created in T5-T9)
  - React Router v6 docs for `<Routes>`, `<Route>`, `<Navigate>`, `<Outlet>`

  **WHY Each Reference Matters**:
  - `main.jsx`: Must wrap App with BrowserRouter for routing to work
  - `App.jsx`: The ENTIRE refactored file — must remove all content and replace with router shell
  - `AuthContext.jsx`: Needed for ProtectedRoute to check authentication
  - `Layout.jsx`: The shell component with Outlet for page rendering
  - React Router docs: Ensure correct v6 API usage (not v5)

  **Acceptance Criteria**:
  - [ ] `src/main.jsx` wraps App with BrowserRouter
  - [ ] `src/App.jsx` is < 100 lines and contains only routes + ProtectedRoute
  - [ ] All 7 pages have routes defined
  - [ ] Unauthenticated access redirects to /login
  - [ ] Authenticated users see Layout with Sidebar
  - [ ] URL updates when clicking sidebar items
  - [ ] Direct URL access works (e.g., /payroll loads payroll page)
  - [ ] `npm run build` succeeds
  - [ ] `npm run lint` passes with 0 errors

  **QA Scenarios**:

  ```
  Scenario: URL navigation works
    Tool: Playwright
    Preconditions: App running, logged in
    Steps:
      1. Navigate to http://localhost:5173/dashboard
      2. Verify URL bar shows /dashboard
      3. Click "Karyawan" in sidebar
      4. Verify URL bar shows /karyawan
      5. Click "Payroll" in sidebar
      6. Verify URL bar shows /payroll
      7. Click "Laporan" in sidebar
      8. Verify URL bar shows /laporan
    Expected Result: URL updates with each sidebar click
    Failure Indicators: URL stays at /dashboard, page doesn't change
    Evidence: .sisyphus/evidence/task-10-url-nav.png

  Scenario: Direct URL access works
    Tool: Playwright
    Preconditions: App running, logged in
    Steps:
      1. Navigate directly to http://localhost:5173/payroll
      2. Verify payroll page loads
      3. Navigate directly to http://localhost:5173/karyawan
      4. Verify employee page loads
    Expected Result: Direct URL access loads correct page
    Failure Indicators: 404, blank page, redirect to dashboard
    Evidence: .sisyphus/evidence/task-10-direct-url.png

  Scenario: Unauthenticated redirect
    Tool: Playwright
    Preconditions: App running, NOT logged in
    Steps:
      1. Navigate directly to http://localhost:5173/payroll
      2. Verify redirect to /login
      3. Login with ADM001/admin123
      4. Verify redirect to /dashboard
    Expected Result: Unauthenticated access redirects to login
    Failure Indicators: Blank page, access to payroll without login
    Evidence: .sisyphus/evidence/task-10-auth-redirect.png

  Scenario: Full login-logout flow
    Tool: Playwright
    Preconditions: App running
    Steps:
      1. Navigate to http://localhost:5173
      2. Login with ADM001/admin123
      3. Verify dashboard loads
      4. Click "Logout"
      5. Verify login page appears
      6. Navigate to http://localhost:5173/dashboard
      7. Verify redirect to /login
    Expected Result: Login → Dashboard → Logout → Login flow works
    Failure Indicators: Stuck on page, no redirect after logout
    Evidence: .sisyphus/evidence/task-10-login-logout.png
  ```

  **Commit**: YES
  - Message: `feat(web): add React Router with URL-based navigation`
  - Files: `src/App.jsx`, `src/main.jsx`
  - Pre-commit: `npm run build`

- [x] 11. Split CSS into per-page files

  **What to do**:
  - Create `src/styles/global.css`:
    - Extract ALL shared/base CSS from App.css:
    - Login styles (.login-page, .login-card)
    - Sidebar styles (.sidebar, .brand, .menu, .menu-item, .user-card, .logout-btn)
    - Topbar styles (.topbar, .section-label)
    - Layout styles (.dashboard-layout, .content)
    - Shared component styles (.panel, .quick-grid, .status, .primary-btn, .small-btn, .modal-overlay, .modal-card, etc.)
    - Animation keyframes
    - Responsive media queries for shared layout
    - Reset/base styles (keep from index.css)
    - CSS variable definitions for colors if any
  - Create per-page CSS files:
    - `src/styles/dashboard.css` — Metrics grid, main grid, panels, table panels
    - `src/styles/karyawan.css` — Employee-specific styles
    - `src/styles/absensi.css` — Attendance-specific styles
    - `src/styles/cuti.css` — Leave/request styles
    - `src/styles/payroll.css` — Payroll layout, tabs, salary form, actions, breakdown styles
    - `src/styles/laporan.css` — Charts grid, chart container styles
    - `src/styles/role.css` — Role table styles
  - Update each page component to import its own CSS file + global.css
  - Remove the original App.css (or keep as empty/minimal re-export)
  - CRITICAL: Ensure NO style is lost during the split. Every class that exists in App.css must exist in exactly ONE of the new CSS files.

  **Must NOT do**:
  - Do NOT change any visual appearance — every element must look identical
  - Do NOT use CSS Modules (.module.css) format — use regular CSS imports
  - Do NOT add new styles or CSS variables
  - Do NOT remove any media query or responsive rule
  - Do NOT convert to CSS-in-JS or styled-components

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`playwright`]

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 4 (after T10)
  - **Blocks**: T12
  - **Blocked By**: T10

  **References**:
  - `hris-web/src/App.css` (833 lines) — ALL current CSS styles to split
  - `hris-web/src/pages/*.jsx` — Each page component needs its own CSS import
  - `hris-web/src/components/Layout.jsx` — Layout needs global.css import
  - `hris-web/src/components/Sidebar.jsx` — Sidebar needs global.css styles
  - `hris-web/src/index.css` — Keep base/reset styles (currently 9 lines)

  **Acceptance Criteria**:
  - [ ] Every CSS class from App.css exists in exactly one of the new CSS files
  - [ ] Each page component imports its own CSS + global.css
  - [ ] Layout component imports global.css
  - [ ] Original App.css is removed or emptied (all styles moved)
  - [ ] Visual appearance is IDENTICAL to original (all elements, spacings, colors, responsive)
  - [ ] Responsive layout works at all breakpoints (1920px, 1200px, 900px)
  - [ ] `npm run build` succeeds

  **QA Scenarios**:

  ```
  Scenario: Visual regression check
    Tool: Playwright
    Preconditions: App running, logged in
    Steps:
      1. Navigate to each page: /dashboard, /karyawan, /absensi, /cuti, /payroll, /laporan, /role
      2. Take screenshot of each page
      3. Compare with pre-refactor screenshots (same elements, same colors, same layout)
      4. Resize browser to 900px width and repeat
    Expected Result: Every page looks identical to the original
    Failure Indicators: Missing styles, broken layout, different fonts/sizes/colors
    Evidence: .sisyphus/evidence/task-11-visual-regression/

  Scenario: Responsive breakpoints work
    Tool: Playwright
    Preconditions: App running, logged in
    Steps:
      1. Set viewport to 1920px width — verify desktop layout
      2. Set viewport to 1200px width — verify tablet layout
      3. Set viewport to 900px width — verify mobile layout
    Expected Result: Responsive layout works at all breakpoints
    Failure Indicators: Broken layout, sidebar not collapsing, text overflow
    Evidence: .sisyphus/evidence/task-11-responsive.png
  ```

  **Commit**: YES
  - Message: `refactor(web): split CSS into per-page files`
  - Files: `src/styles/*.css`, `src/pages/*.jsx`, `src/App.css` (removed/emptied)
  - Pre-commit: `npm run build`

- [x] 12. Fix ESLint error + final cleanup

  **What to do**:
  - Fix the ESLint error in `backend/src/setup-db.js` line 35:
    ```javascript
    // Change from:
    try { await conn.execute(`DROP TABLE IF EXISTS \`${t}\``) } catch {}
    // Change to:
    try { await conn.execute(`DROP TABLE IF EXISTS \`${t}\``) } catch { /* intentional: table may not exist */ }
    ```
  - Clean up `src/App.jsx`:
    - Remove any remaining dead code or unused imports
    - Ensure App.jsx is clean and < 100 lines (just Router + ProtectedRoute + Routes)
  - Clean up any unused code across all new files:
    - Remove console.log statements
    - Remove commented-out code
    - Remove unused imports
  - Verify `src/main.jsx` is clean and minimal
  - Run full lint and build

  **Must NOT do**:
  - Do NOT add new ESLint rules
  - Do NOT refactor any other code beyond cleanup
  - Do NOT change any functionality

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 5 (final cleanup)
  - **Blocks**: F1-F4
  - **Blocked By**: T10, T11

  **References**:
  - `backend/src/setup-db.js` (line 35) — Empty catch block ESLint error
  - `src/App.jsx` — Final shape should be < 100 lines
  - `src/main.jsx` — Final shape should be minimal
  - All `src/pages/*.jsx` — Check for unused imports
  - All `src/hooks/*.js` — Check for unused imports
  - All `src/components/*.jsx` — Check for unused imports

  **Acceptance Criteria**:
  - [ ] `npm run lint` passes with 0 errors
  - [ ] `npm run build` succeeds
  - [ ] `src/App.jsx` is < 100 lines
  - [ ] No console.log statements in production code
  - [ ] No unused imports in any file
  - [ ] No commented-out code in any file

  **QA Scenarios**:

  ```
  Scenario: ESLint passes
    Tool: Bash
    Preconditions: All refactoring complete
    Steps:
      1. cd "D:\WEB HRIS\hris-web"
      2. npm run lint
      3. Check exit code is 0
    Expected Result: ESLint passes with 0 errors (warnings OK)
    Failure Indicators: ESLint errors, remaining empty catch block
    Evidence: .sisyphus/evidence/task-12-lint.txt

  Scenario: Build succeeds
    Tool: Bash
    Preconditions: All refactoring complete
    Steps:
      1. cd "D:\WEB HRIS\hris-web"
      2. npm run build
      3. Check exit code is 0
    Expected Result: Build completes successfully with 0 errors
    Failure Indicators: Build fails, missing imports, undefined references
    Evidence: .sisyphus/evidence/task-12-build.txt

  Scenario: App.jsx is clean and minimal
    Tool: Bash
    Preconditions: All refactoring complete
    Steps:
      1. Count lines in src/App.jsx
      2. Verify < 100 lines
      3. Check for no FeaturePages function
      4. Check for no activePage state
    Expected Result: App.jsx is < 100 lines, contains only router setup
    Failure Indicators: App.jsx > 100 lines, FeaturePages still exists
    Evidence: .sisyphus/evidence/task-12-app-size.txt
  ```

  **Commit**: YES
  - Message: `fix(web): resolve ESLint error and final cleanup`
  - Files: `backend/src/setup-db.js`, various `src/` files for cleanup
  - Pre-commit: `npm run lint && npm run build`

---

## Final Verification Wave

- [x] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. For each "Must Have": verify implementation exists (read file, check import). For each "Must NOT Have": search codebase for forbidden patterns. Check evidence files. Compare deliverables against plan.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [x] F2. **Code Quality Review** — `unspecified-high`
  Run `npm run lint` + `npm run build`. Review all changed files for: console.log in prod, unused imports, hardcoded values that shouldn't be, inconsistent naming. Check no behavioral changes: login flow, API calls, form submissions must match original.
  Output: `Build [PASS/FAIL] | Lint [PASS/FAIL] | Files [N clean/N issues] | VERDICT`

- [x] F3. **Real Manual QA** — `unspecified-high` (+ `playwright` skill)
  Start app with `npm run dev:all`. Execute comprehensive QA: Login → Dashboard → every page → Payroll workflow → Logout → Direct URL access. Test responsive layout. Capture screenshots.
  Save evidence to `.sisyphus/evidence/final-qa/`.
  Output: `Scenarios [N/N pass] | Integration [N/N] | Edge Cases [N tested] | VERDICT`

- [x] F4. **Scope Fidelity Check** — `deep`
  For each task: read "What to do", read actual diff. Verify 1:1 — everything in spec was built (no missing), nothing beyond spec was built (no creep). Check "Must NOT do" compliance. Detect cross-task contamination. Verify App.jsx is < 100 lines.
  Output: `Tasks [N/N compliant] | Contamination [CLEAN/N issues] | Unaccounted [CLEAN/N files] | VERDICT`

---

## Commit Strategy

- **T1**: `chore(web): install react-router-dom dependency` — package.json, package-lock.json
- **T2**: `refactor(web): extract shared utilities from App.jsx` — src/api/, src/utils/
- **T3**: `refactor(web): add AuthContext and custom hooks` — src/contexts/, src/hooks/
- **T4**: `refactor(web): extract Layout and shared components` — src/components/
- **T5**: `refactor(web): extract Login page from App.jsx` — src/pages/Login.jsx
- **T6**: `refactor(web): extract Dashboard page from App.jsx` — src/pages/Dashboard.jsx
- **T7**: `refactor(web): extract Karyawan, Absensi, Cuti pages` — src/pages/
- **T8**: `refactor(web): extract Payroll page from App.jsx` — src/pages/Payroll.jsx
- **T9**: `refactor(web): extract Laporan and RoleManagement pages` — src/pages/
- **T10**: `feat(web): add React Router with URL-based navigation` — src/App.jsx, src/main.jsx
- **T11**: `refactor(web): split CSS into per-page files` — src/styles/
- **T12**: `fix(web): resolve ESLint empty catch block + cleanup` — backend/src/setup-db.js

---

## Success Criteria

### Verification Commands
```bash
cd "D:\WEB HRIS\hris-web" && npm run lint
# Expected: 0 errors (warnings OK)

cd "D:\WEB HRIS\hris-web" && npm run build
# Expected: Build completes successfully

cd "D:\WEB HRIS\hris-web" && ls src/pages/
# Expected: Login.jsx Dashboard.jsx Karyawan.jsx Absensi.jsx Cuti.jsx Payroll.jsx Laporan.jsx RoleManagement.jsx

cd "D:\WEB HRIS\hris-web" && wc -l src/App.jsx
# Expected: < 100 lines
```

### Final Checklist
- [ ] All "Must Have" requirements met
- [ ] All "Must NOT Have" items absent
- [ ] `npm run lint` passes with 0 errors
- [ ] `npm run build` succeeds
- [ ] All 7 pages navigate via React Router URLs
- [ ] Login/logout flow works identically
- [ ] Payroll workflow (Draft → Review → Approve → Finalize) works
- [ ] PDF and CSV exports still function
- [ ] Edit salary modal works (including Escape key)
- [ ] Responsive layout unchanged at all breakpoints