# Diagram Sistem HRIS Cloud (PlantUML)

Folder ini berisi diagram-diagram PlantUML untuk dokumentasi arsitektur dan alur bisnis sistem HRIS Cloud. Semua diagram menggunakan **bahasa Indonesia**.

## Cara Menampilkan Diagram

### Opsi 1: Extension VS Code (Direkomendasikan)
1. Install extension **"PlantUML"** oleh Jebbs
2. Buka file `.puml`
3. Tekan `Alt + D` (Windows/Linux) atau `Option + D` (Mac) untuk preview
4. Klik kanan → "Export Current File Diagrams" untuk menyimpan sebagai PNG/SVG/PDF

### Opsi 2: Online (Tidak perlu install)
1. Buka [www.plantuml.com/plantuml](http://www.plantuml.com/plantuml)
2. Copy-paste isi file `.puml` ke textarea
3. Klik "Submit" untuk melihat diagram

### Opsi 3: CLI (Command Line)
```bash
# Install PlantUML (membutuhkan Java)
java -jar plantuml.jar docs/diagrams/*.puml

# Atau menggunakan Docker
docker run -v $(pwd)/docs/diagrams:/data plantuml/plantuml /data/*.puml
```

---

## Daftar Diagram

### 1. ERD - Entity Relationship Diagram
**File:** `01-erd.puml`

Diagram relasi entitas basis data HRIS yang mencakup:
- **Master Data:** roles, departments, positions, payroll_components
- **Karyawan:** employees, users, employee_salary_profiles
- **Absensi:** attendance
- **Cuti:** leave_request
- **Penggajian:** payroll_runs, payroll_run_items, payroll_run_item_components, payroll_variable_inputs, payroll_approvals, payroll_audit_logs
- **Lainnya:** expenses, office_assets, tasks

### 2. Arsitektur Sistem
**File:** `02-arsitektur-sistem.puml`

Diagram arsitektur tingkat tinggi yang menunjukkan:
- **Klien:** Browser dengan React SPA
- **Frontend:** Vite DevServer / Nginx dengan proxy API
- **Backend:** Node.js + Express dengan middleware (CORS, Helmet, Morgan, JWT, Role Check)
- **Modul API:** Auth, Karyawan, Absensi, Cuti, Penggajian, Laporan
- **Layanan:** Service layer untuk setiap modul
- **Database:** MySQL 8.x dengan tabel master, transaksi, dan payroll
- **Infrastruktur:** PM2 / systemd, Docker

### 3. Use Case Diagram
**File:** `03-use-case.puml`

Diagram aktor dan use case yang mencakup 5 aktor:
- **Karyawan:** Clock in/out, ajukan cuti, lihat slip gaji, dasbor
- **Manajer:** Setujui cuti, laporan tim
- **HRD:** CRUD karyawan, kelola absensi, laporan
- **Finance:** Jalankan payroll, approval payroll, laporan keuangan
- **Super Admin:** Kelola peran, hak akses, semua fitur

### 4. Class Diagram - Backend
**File:** `04-class-backend.puml`

Diagram kelas backend dengan 5 paket:
- **Kontroler:** AuthController, EmployeeController, AttendanceController, LeaveController, PayrollController, ReportController
- **Layanan:** AuthService, EmployeeService, AttendanceService, LeaveService, PayrollService, ReportService
- **Akses Data:** Database, QueryBuilder
- **Entitas:** User, Employee, Attendance, LeaveRequest, PayrollRun, PayrollRunItem
- **Middleware:** AuthMiddleware, RoleMiddleware, ErrorHandler
- **Utilitas:** Validator, Formatter, AuditLogger

### 5. Sequence Diagram - Login
**File:** `05-sequence-login.puml`

Diagram sekuen proses otentikasi:
1. Input kredensial (NIK & Password)
2. Validasi input di frontend
3. Request ke backend /auth/login
4. Verifikasi NIK di database
5. Perbandingan password dengan bcrypt
6. Generate JWT token
7. Simpan token & redirect ke dashboard
8. Akses route terlindungi dengan Bearer token

### 6. Sequence Diagram - Cuti
**File:** `06-sequence-cuti.puml`

Diagram sekuen alur pengajuan & persetujuan cuti:
1. **Pengajuan:** Karyawan isi form → validasi → insert ke leave_request → notifikasi ke approver
2. **Persetujuan:** Approver lihat daftar pending → pilih setujui/tolak → update status → kurangi saldo cuti (jika disetujui) → notifikasi ke karyawan
3. **Notifikasi:** Karyawan lihat hasil persetujuan

### 7. Sequence Diagram - Payroll
**File:** `07-sequence-payroll.puml`

Diagram sekuen alur payroll run lengkap:
1. **Inisiasi:** Pilih periode → create payroll_runs (draft) → loop per karyawan → hitung gaji (base + komponen + variabel - potongan - pajak - BPJS) → insert payroll_run_items & components
2. **Review:** Kirim untuk review → update status → log audit
3. **Approval:** Approver lihat detail → setujui → insert payroll_approvals → log audit
4. **Finalisasi:** Finalisasi & publish → generate payslip per karyawan → kirim email → status published

### 8. Component Diagram - Frontend
**File:** `08-component-frontend.puml`

Diagram komponen frontend React:
- **Halaman:** LoginPage, DashboardPage, EmployeesPage, AttendancePage, LeavePage, PayrollPage, ReportsPage, RoleManagementPage
- **Tata Letak:** Sidebar, Topbar, MainLayout
- **Komponen Bersama:** DataTable, Modal, ConfirmDialog, StatusBadge, PrimaryButton, Spinner
- **Hooks Kustom:** useAuth, useApi, useEmployees, useAttendance, useLeave, usePayroll, useReports, usePagination, useLocalStorage
- **Konteks:** AuthContext, AuthProvider
- **Klien API:** apiClient, endpoints
- **Utilitas:** formatters, validators, constants, pdfExport
- **Router:** React Router, ProtectedRoute, RoleBasedRoute

---

## Struktur Folder

```
docs/
└── diagrams/
    ├── 01-erd.puml                    # Entity Relationship Diagram
    ├── 02-arsitektur-sistem.puml      # System Architecture
    ├── 03-use-case.puml               # Use Case Diagram
    ├── 04-class-backend.puml          # Backend Class Diagram
    ├── 05-sequence-login.puml         # Login Sequence
    ├── 06-sequence-cuti.puml          # Leave Approval Sequence
    ├── 07-sequence-payroll.puml       # Payroll Run Sequence
    ├── 08-component-frontend.puml     # Frontend Component Diagram
    └── README.md                      # Dokumen ini
```

---

## Tips Render

### Render ke PNG (batch)
```bash
# Semua file
cd docs/diagrams
plantuml *.puml -tpng

# Satu file
plantuml 01-erd.puml -tpng
```

### Render ke SVG (vektor, lebih tajam)
```bash
plantuml *.puml -tsvg
```

### Render ke PDF
```bash
plantuml *.puml -tpdf
```

---

## Ketergantungan

- **Java 8+** (untuk PlantUML CLI)
- **Graphviz** (untuk layout diagram otomatis)
  - Windows: `choco install graphviz`
  - macOS: `brew install graphviz`
  - Linux: `sudo apt-get install graphviz`

---

*Dibuat untuk dokumentasi arsitektur HRIS Cloud*
