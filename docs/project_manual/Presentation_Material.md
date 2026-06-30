# Materi Presentasi Proyek
# Sistem HRIS Terpadu Berbasis Cloud
### (Human Resource Information System)

---

## SLIDE 1 — Judul (Title Slide)

**Sistem HRIS Terpadu Berbasis Cloud**
*(Human Resource Information System)*

**Sub-judul:** Dashboard Web HR/Finance + Aplikasi Mobile Self-Service Karyawan

> Sebuah sistem terpadu yang mengintegrasikan manajemen data karyawan, absensi GPS+selfie, pengajuan cuti, dan penggajian (payroll) dalam satu platform berbasis cloud.

---

## SLIDE 2 — Identitas & Ruang Lingkup

**Ruang Lingkup Proyek**
- **Web Dashboard** — untuk HR / Finance / Super Admin (React + Vite)
- **Backend API** — RESTful API berbasis Node.js + Express + MySQL
- **Mobile App** — self-service karyawan (React Native + Expo)

**Fokus Presentasi:** Web Dashboard HRIS

| Layanan | URL / Akses |
|---------|-------------|
| Web Dashboard | `http://localhost:5173` |
| Backend API | `http://localhost:5000` |
| Health Check | `http://localhost:5000/health` |

---

## SLIDE 3 — Latar Belakang Masalah

**Mengapa sistem HRIS dibutuhkan?**

Permasalahan manajemen SDM yang umum dihadapi perusahaan:

1. **Data karyawan terpencar** — tidak ada single source of truth
2. **Absensi manual** — rentan kecurangan, tidak ada verifikasi lokasi
3. **Pengajuan cuti tidak terstruktur** — via WhatsApp/paper, sulit ditelusuri
4. **Proses payroll manual & rawan error** — hitung gaji pakai Excel
5. **Sulit membuat laporan** — data tersebar di banyak file
6. **Tidak ada kontrol akses berbasis peran** — semua orang lihat semua data

---

## SLIDE 4 — Tujuan Proyek

**Tujuan yang ingin dicapai:**

1. **Terotomatisasi** — proses absensi, cuti, dan payroll berjalan otomatis
2. **Terintegrasi** — satu sistem untuk semua kebutuhan HR
3. **Tervalidasi** — absensi dengan verifikasi GPS + selfie (anti-kecurangan)
4. **Transparan** — workflow approval yang jelas dan dapat ditelusuri (audit log)
5. **Aksesibel** — dashboard web untuk admin + aplikasi mobile untuk karyawan
6. **Aman** — autentikasi JWT + RBAC + enkripsi password (bcrypt)
7. **Terukur** — laporan & analitik real-time dengan grafik interaktif

---

## SLIDE 5 — Pemangku Kepentingan (Stakeholders)

| Peran | Deskripsi | Akses Utama |
|------|-----------|-------------|
| **Super Admin** | Administrator sistem tertinggi | Semua modul + User Management + Role Management |
| **HRD** | Manajer HR / SDM | Karyawan, Absensi, Cuti, Payroll, Laporan, Master Data, Pengaturan |
| **Finance** | Bagian keuangan | Payroll (Approve & Finalize), Slip Gaji, Laporan |
| **Manager** | Atasan langsung karyawan | Approval cuti, monitoring tim |
| **Employee** | Karyawan (via mobile app) | Self-service: absensi, cuti, slip gaji, profil |

---

## SLIDE 6 — Tech Stack

| Layer | Teknologi | Keterangan |
|-------|-----------|------------|
| **Web Frontend** | React 19, Vite 8, React Router 6 | Dashboard SPA, fast HMR |
| **Visualisasi Data** | Recharts 3 | Pie/Bar/Line chart analitik |
| **Export PDF** | jsPDF, jspdf-autotable | Slip gaji & laporan PDF |
| **Backend API** | Node.js, Express 5 | RESTful API server |
| **Database** | MySQL 8 (XAMPP/Aiven/TiDB) | Relational database |
| **Autentikasi** | JWT (jsonwebtoken), bcryptjs | Token-based auth + hash password |
| **Upload File** | Multer + Cloudinary | Foto selfie & profil |
| **Security** | Helmet, CORS | HTTP security headers + origin restriction |
| **Mobile** | React Native 0.81, Expo SDK 54 | Aplikasi karyawan Android/iOS |
| **Deployment** | Render (monorepo) | Cloud hosting untuk produksi |

---

## SLIDE 7 — Arsitektur Sistem (Overview)

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser / HP)                  │
│                                                              │
│   ┌──────────────────┐         ┌──────────────────────┐      │
│   │  Web Dashboard   │         │   Mobile App (Expo)  │      │
│   │  React + Vite    │         │   React Native       │      │
│   │  port 5173       │         │                      │      │
│   └────────┬─────────┘         └──────────┬───────────┘      │
└────────────┼──────────────────────────────┼───────────────────┘
             │  HTTP/JSON (REST)            │
             │  Authorization: Bearer <JWT>  │
             └──────────────┬───────────────┘
                            │
              ┌─────────────▼──────────────┐
              │     Backend API Server      │
              │     Node.js + Express 5    │
              │     port 5000              │
              │                            │
              │  • JWT Auth Middleware     │
              │  • Role-Based Access (RBAC)│
              │  • Helmet (Security)       │
              │  • Multer (Upload)         │
              │  • Morgan (Logging)        │
              └─────────────┬──────────────┘
                            │
              ┌─────────────▼──────────────┐
              │      MySQL Database         │
              │      (MySQL 8 / XAMPP)     │
              │      25+ tabel             │
              └─────────────┬──────────────┘
                            │
              ┌─────────────▼──────────────┐
              │     Cloudinary (Cloud)      │
              │     Penyimpanan foto        │
              └────────────────────────────┘
```

---

## SLIDE 8 — Arsitektur Backend (Detail)

**Struktur Backend (`hris-web/backend/`)**

```
backend/
├── src/
│   ├── server.js          # API routes utama (60+ endpoint)
│   ├── db.js              # Koneksi MySQL (connection pool)
│   ├── middleware.js      # Auth (JWT) & Role middleware (RBAC)
│   ├── setup-db.js        # Setup database otomatis
│   └── utils/             # Helper functions
├── schema.sql             # Schema database inti (25+ tabel)
├── payroll-schema.sql     # Schema payroll lanjutan
└── seed.sql               # Data awal (roles, admin, dept, dst)
```

**Prinsip Desain:**
- **Service-Oriented** — endpoint terorganisir per modul (auth, employees, attendance, leave, payroll, reports)
- **Parameterized Queries** — mencegah SQL Injection
- **Audit Logging** — semua aksi sensitif payroll tercatat
- **Error Handling Terstruktur** — response JSON dengan kode HTTP yang sesuai

---

## SLIDE 9 — Desain Database (ERD Overview)

**Entity-Relationship Diagram — 25+ Tabel**

```
┌─────────────┐     ┌─────────────┐     ┌──────────────┐
│   roles     │────<│    users    │────<│  employees   │
│ (5 role)    │     │ (NIK+pwd)   │     │ (data diri)  │
└─────────────┘     └─────────────┘     └──────┬───────┘
                                               │
                    ┌──────────────────────────┼──────────────────────┐
                    │                          │                      │
              ┌─────▼──────┐          ┌───────▼────────┐      ┌──────▼───────┐
              │ attendance │          │ leave_request   │      │ salary_      │
              │ (clock in) │          │ (pengajuan cuti)│      │ profiles     │
              └────────────┘          └────────────────┘      └──────┬───────┘
                                                                              │
                    ┌───────────────────────────────────────────────────────▼──┐
                    │           PAYROLL MODULE                                  │
                    │  ┌──────────────┐  ┌───────────────┐  ┌───────────────┐   │
                    │  │payroll_runs  │<>│payroll_run_   │<>│payroll_run_   │   │
                    │  │(Draft→Final) │  │items          │  │item_components│   │
                    │  └──────┬───────┘  └───────────────┘  └───────────────┘   │
                    │         │                                                  │
                    │  ┌──────▼───────┐  ┌───────────────┐  ┌───────────────┐   │
                    │  │payroll_       │  │payroll_       │  │  payslips     │   │
                    │  │approvals      │  │audit_logs     │  │ (slip gaji)   │   │
                    │  └──────────────┘  └───────────────┘  └───────────────┘   │
                    └──────────────────────────────────────────────────────────┘

Tabel lain: departments, positions, leave_types, payroll_components,
            notifications, company_settings, expenses, tasks, office_assets
```

---

## SLIDE 10 — Modul Utama (Overview)

| No | Modul | Deskripsi | Pengguna |
|----|-------|-----------|----------|
| 1 | **Autentikasi** | Login JWT, logout, validasi role | Semua |
| 2 | **Dashboard** | Ringkasan statistik real-time | HRD, Finance, Super Admin |
| 3 | **Manajemen Karyawan** | CRUD karyawan + import CSV + profil gaji | HRD, Super Admin |
| 4 | **Absensi** | Monitoring kehadiran GPS + selfie | HRD, Super Admin |
| 5 | **Cuti & Izin** | Pengajuan + approval workflow | Manager, HRD, Super Admin |
| 6 | **Payroll** | Generate → Review → Approve → Finalize | HRD, Finance, Super Admin |
| 7 | **Slip Gaji** | Generate + download PDF payslip | HRD, Finance, Employee |
| 8 | **Laporan** | Grafik analitik + export PDF | HRD, Finance, Super Admin |
| 9 | **Master Data** | CRUD Departemen, Jabatan, Jenis Izin | HRD, Super Admin |
| 10 | **Pengaturan** | Lokasi kantor + geofence + info perusahaan | HRD, Super Admin |
| 11 | **Role Management** | Manajemen peran & hak akses | Super Admin |

---

## SLIDE 11 — Modul 1: Autentikasi & Otorisasi

**Fitur Utama:**
- Login menggunakan **NIK + Password**
- Token **JWT** disimpan di localStorage (`hris_token`)
- Password dienkripsi dengan **bcrypt** (10 salt rounds)
- Token kedaluwarsa dalam **1 hari** (`expiresIn: '1d'`)
- Fitur **"Simpan Login"** — menyimpan NIK di localStorage

**Role-Based Access Control (RBAC):**

| Role | Web Dashboard | Mobile App |
|------|:------------:|:----------:|
| Super Admin | Full access | Limited |
| HRD | HR + Payroll + Laporan + Master Data | Limited |
| Finance | Payroll + Slip Gaji + Laporan | Limited |
| Manager | Approval Cuti + Monitoring | Limited |
| Employee | Blocked from web dashboard | Full access |

**Validasi Login:**
- NIK tidak ditemukan → pesan "NIK tidak ditemukan"
- Password salah → pesan "Password salah"
- Token tidak valid → 401 "Token tidak valid atau telah kadaluarsa"

---

## SLIDE 12 — Modul 2: Dashboard

**Tampilan Dashboard Web:**

4 Kartu Ringkasan Real-Time:
1. **Total Karyawan** — jumlah seluruh karyawan
2. **Kehadiran Hari Ini (%)** — persentase yang sudah clock in
3. **Cuti Menunggu** — jumlah pengajuan cuti berstatus Pending
4. **Total Payroll Bulan Ini** — total gaji bulan berjalan

**Data di-fetch dari endpoint:** `GET /reports/dashboard`

**UI Features:**
- Sidebar navigasi yang dapat di-collapse/expand
- Menu disesuaikan dengan role pengguna (RBAC)
- Info user card di sidebar footer (nama, role, departemen)
- Tombol logout

---

## SLIDE 13 — Modul 3: Manajemen Karyawan

**Fitur Utama (CRUD):**

| Aksi | Detail |
|------|--------|
| **Lihat Daftar** | Tabel: Nama, NIK, Password, Departemen, Jabatan, Gaji Pokok, Akhir Kontrak, Status |
| **Tambah** | Modal form: Nama (wajib), Departemen, Jabatan, Email, Telepon, Akhir Kontrak |
| **Edit** | Modal edit dengan data pre-filled |
| **Nonaktifkan/Aktifkan** | Toggle status `is_active` tanpa hapus data |
| **Atur Gaji** | Modal salary: Gaji Pokok, Tunjangan, Potongan + preview Take Home Pay |
| **Import CSV** | Upload file CSV (header: nama, departemen, jabatan, nik, gaji_pokok, dll) |
| **Pencarian** | Filter real-time berdasarkan nama/departemen/jabatan |

**Status Kontrak Otomatis:**
- Hijau = Aktif (> 30 hari)
- Kuning = Akan berakhir (≤ 30 hari)
- Merah = Berakhir
- Abu = Tanpa kontrak

---

## SLIDE 14 — Modul 4: Absensi Digital

**Fitur Monitoring Absensi (Web Dashboard):**

- Tabel log kehadiran **hari ini** dari semua karyawan
- Kolom: Nama, Departemen, Clock In, Clock Out, Selfie, Lokasi GPS, Status

**Validasi Anti-Kecurangan (di backend):**
1. **Geofencing** — rumus Haversine menghitung jarak GPS karyawan ke kantor
   - Jika > radius (default 500m) → absen ditolak
   - Konfigurasi di Pengaturan → Lokasi Kantor
2. **Foto Selfie** — wajib upload foto sebagai bukti kehadiran
   - Disimpan di **Cloudinary** (cloud storage)
3. **Anti Double Clock-In** — tidak bisa absen masuk 2x di hari yang sama

**Statistik Real-Time:**
- Kehadiran Hari Ini (%)
- Hadir Tepat Waktu
- Terlambat

**Fitur Interaktif:**
- Klik foto selfie → buka di tab baru
- Klik badge GPS → buka koordinat di OpenStreetMap

---

## SLIDE 15 — Modul 5: Cuti & Izin (Leave Management)

**Fitur Pengajuan Cuti:**
- Form pengajuan: pilih karyawan (admin), jenis cuti, tanggal mulai/selesai, alasan
- Dropdown jenis cuti dari master data (`/leave-types`)
- Validasi: tanggal mulai tidak boleh setelah tanggal selesai

**Approval Workflow:**
- Status: **Pending** → **Approved** / **Rejected**
- Approver: Manager, HRD, Super Admin
- Tombol "Setuju" / "Tolak" hanya tampil untuk status Pending
- **Notifikasi otomatis** terkirim ke karyawan saat cuti di-approve/reject

**Statistik Dashboard:**
- Kartu: Menunggu Approval, Disetujui, Ditolak (jumlah real-time)

**Kuota Cuti (Leave Quota):**
- Default per tahun: Cuti Tahunan (12), Izin Sakit (12), Izin (6), Cuti Khusus (3)
- Tracking otomatis berdasarkan cuti yang sudah Approved

---

## SLIDE 16 — Modul 6: Payroll (Penggajian) — Workflow

**Workflow 4 Tahap (Draft → Reviewed → Approved → Finalized):**

```
┌─────────┐     ┌──────────┐     ┌──────────┐     ┌───────────┐     ┌───────────┐
│  DRAFT  │────>│ REVIEWED │────>│ APPROVED │────>│ FINALIZED │────>│ PUBLISHED │
│         │     │          │     │          │     │           │     │           │
│ HRD     │     │ HRD      │     │ Finance  │     │ Finance   │     │ HRD/Fin   │
│ Generate│     │ Submit   │     │ Approve  │     │ Finalize  │     │ Generate  │
│         │     │ Review   │     │          │     │           │     │ Payslip   │
└────┬────┘     └────┬─────┘     └────┬─────┘     └───────────┘     └───────────┘
     │               │                │
     │    Reject ◄───┴────────────────┘
     │      (status kembali ke DRAFT)
     ▼
```

**Tahapan Detail:**
| Tahap | Aktor | Aksi |
|-------|-------|------|
| 1. Generate Draft | HRD/Finance | Sistem hitung gaji semua karyawan aktif dari profil gaji |
| 2. Submit Review | HRD/Super Admin | Validasi data (profil gaji, data bank, net minus) |
| 3. Approve | Finance/Super Admin | Persetujuan setelah review |
| 4. Finalize | Finance/Super Admin | Kunci data payroll, kirim notifikasi ke karyawan |
| 5. Generate Payslip | HRD/Finance | Buat slip gaji + ubah status ke Published |

---

## SLIDE 17 — Modul 6: Payroll (Detail Fitur)

**Fitur Payroll Lengkap:**

1. **Generate Draft Run** — hitung gaji otomatis berdasarkan:
   - Profil gaji karyawan (`employee_salary_profiles`)
   - Komponen gaji (tunjangan/potongan)
   - Hanya karyawan aktif (`is_active = 1`)

2. **Validasi Payroll** — cek sebelum finalize:
   - Net amount tidak boleh minus
   - Profil gaji sudah diset
   - Data bank lengkap (untuk metode bank_transfer)
   - Gross amount tidak nol

3. **Anti-Duplikasi** — tidak bisa generate 2x untuk periode yang sama (status draft/reviewed/approved)

4. **Detail Run** — tabel per karyawan:
   - Gross, Potongan, Net
   - Rincian komponen gaji per item
   - Pencarian nama karyawan
   - **Export CSV**

5. **Audit Trail** — semua aksi tercatat di `payroll_audit_logs`:
   - Aktor, aksi, data sebelum/sesudah (JSON), timestamp, IP address

---

## SLIDE 18 — Modul 7: Slip Gaji (Payslip)

**Fitur Slip Gaji:**

| Fitur | Admin (HRD/Finance) | Employee |
|-------|:-------------------:|:--------:|
| Generate slip gaji | ✓ | ✗ |
| Lihat semua slip | ✓ | ✗ |
| Lihat slip sendiri | ✓ | ✓ |
| Download PDF | ✓ | ✓ |
| Detail komponen | ✓ | ✓ |

**Alur Generate Slip:**
1. Pilih payroll run berstatus "finalized"
2. Klik "Generate Slip Gaji"
3. Sistem buat slip untuk semua karyawan di run tersebut
4. Status run berubah ke "published"
5. Notifikasi terkirim ke semua karyawan

**Format Slip Gaji (PDF):**
- Nomor slip unik: `SLIP-YYYYMM-RRRR-EEEE`
- Header: periode, nama, departemen, jabatan
- Rincian: Pendapatan (earning) & Potongan (deduction)
- Total: Take Home Pay (THP)
- Generated via **jsPDF + jsPDF-AutoTable**

---

## SLIDE 19 — Modul 8: Laporan & Analitik

**Dashboard Laporan (6 Grafik Interaktif):**

| # | Grafik | Tipe | Data Source |
|---|--------|------|-------------|
| 1 | Distribusi Gaji per Departemen | Pie Chart | `/reports/salary-distribution` |
| 2 | Jumlah Cuti per Tipe | Bar Chart | `/reports/leave-stats` |
| 3 | Tren Kehadiran (7 Hari) | Line Chart | `/reports/dashboard` |
| 4 | Biaya Payroll per Departemen | Bar Chart | `/reports/dashboard` |
| 5 | Distribusi Gaji per Posisi | Bar Chart | `/reports/salary-distribution` |
| 6 | Status Cuti Bulanan (3 Bulan) | Bar Chart | `/reports/leave-stats` |

**Fitur Tambahan:**
- 4 kartu ringkasan (Total Karyawan, Kehadiran, Cuti Pending, Total Payroll)
- Tabel detail distribusi gaji per departemen
- **Export PDF** — laporan lengkap dengan tabel terstruktur
- Loading indicator saat fetch data
- "No data available" handling untuk data kosong

**Library Visualisasi:** Recharts (React charting library)

---

## SLIDE 20 — Modul 9: Master Data

**3 Tab Data Referensi:**

| Tab | Endpoint | Field |
|-----|----------|-------|
| **Departemen** | `/departments` | Nama departemen |
| **Jabatan** | `/positions` | Nama jabatan |
| **Jenis Izin** | `/leave-types` | Nama jenis izin/cuti |

**Operasi CRUD per tab:**
- **Create** — tambah data baru via input + tombol "Tambah"
- **Read** — tabel dengan nomor urut
- **Update** — inline edit (klik Edit, ubah langsung di tabel, Simpan)
- **Delete** — hapus dengan konfirmasi

**Validasi Referensi:**
- Tidak bisa hapus departemen yang masih dipakai karyawan → pesan "Departemen masih digunakan oleh karyawan"
- Tidak bisa hapus jabatan yang masih dipakai karyawan
- Tidak bisa hapus jenis izin yang masih dipakai pengajuan cuti
- Tidak bisa tambah data duplikat → pesan "Departemen sudah ada" (409 Conflict)

---

## SLIDE 21 — Modul 10: Pengaturan

**2 Tab Pengaturan:**

### Tab 1: Lokasi Kantor & Geofence
- **Peta interaktif** (OpenStreetMap embed)
- Field: Latitude, Longitude, Radius Geofence (meter)
- Tombol **"Gunakan Lokasi Saya"** — deteksi GPS otomatis via `navigator.geolocation`
- Tombol **"Refresh Map"** — re-render peta
- Rentang radius: 50 - 10.000 meter
- Data tersimpan di tabel `company_settings`

### Tab 2: Info Perusahaan
- Field: Nama Perusahaan, Alamat Perusahaan
- Disimpan sebagai key-value di `company_settings`

**Fungsi Pengaturan Lokasi:**
- Koordinat kantor digunakan untuk **validasi geofence** saat absensi (clock in/out)
- Jika GPS karyawan di luar radius → absen ditolak
- Menggunakan rumus **Haversine** untuk hitung jarak (meter)

---

## SLIDE 22 — Modul 11: Role Management

**Tabel Role & Hak Akses (Super Admin only):**

| Role | Akses Modul | Status |
|------|-------------|--------|
| **Super Admin** | Semua Modul (termasuk User Management & Role Management) | Aktif |
| **HRD** | Karyawan, Absensi, Cuti, Payroll, Laporan, Master Data, Pengaturan | Aktif |
| **Finance** | Payroll (Approve & Finalize), Slip Gaji, Laporan | Aktif |
| **Manager** | Approval Cuti & Monitoring Tim | Aktif |
| **Employee** | Self-service (via mobile app: absensi, cuti, slip gaji, profil) | Aktif |

**Implementasi RBAC di Kode:**
- Middleware `authRequired` — cek token JWT valid
- Middleware `roleRequired('HRD', 'Super Admin')` — cek role diizinkan
- Menu sidebar di-filter berdasarkan role di frontend (`roleMenus`)
- Akses endpoint ditolak dengan **HTTP 403 Forbidden** jika tidak berhak

---

## SLIDE 23 — Keamanan Sistem

**Lapisan Keamanan yang Diterapkan:**

| # | Aspek | Implementasi |
|---|-------|-------------|
| 1 | **Autentikasi** | JWT token (1 hari expiry), verifikasi signature |
| 2 | **Otorisasi** | RBAC — role check di setiap endpoint sensitif |
| 3 | **Password** | bcrypt hash (10 rounds) — tidak plaintext |
| 4 | **SQL Injection** | Parameterized queries (`mysql2/promise`) |
| 5 | **HTTP Headers** | Helmet middleware (XSS, clickjacking, MIME sniffing) |
| 6 | **CORS** | Restrict origin ke domain yang diizinkan |
| 7 | **Upload File** | Limit 5MB, filter MIME type (image only) |
| 8 | **Audit Trail** | Logging lengkap untuk semua aksi payroll |
| 9 | **Error Handling** | Tidak expose detail internal ke response |
| 10 | **Geofence** | Validasi GPS untuk absensi (anti-location spoofing) |
| 11 | **Foto Selfie** | Bukti fisik kehadiran, disimpan di Cloudinary |

---

## SLIDE 24 — API Documentation (Ringkasan Endpoint)

**60+ RESTful API Endpoints:**

| Modul | Method | Endpoint | Deskripsi |
|-------|--------|----------|-----------|
| Auth | POST | `/auth/login` | Login (NIK + password) |
| Auth | GET | `/auth/me` | Profil user yang login |
| Karyawan | GET | `/employees` | Daftar karyawan (HRD/Super Admin) |
| Karyawan | POST | `/employees` | Tambah karyawan |
| Karyawan | POST | `/employees/import` | Import CSV |
| Absensi | GET | `/attendance/today` | Log absensi hari ini |
| Cuti | GET | `/leave` | Daftar pengajuan cuti |
| Cuti | POST | `/leave` | Ajukan cuti |
| Cuti | PUT | `/leave/approve` | Approve/reject cuti |
| Payroll | POST | `/payroll/runs/generate` | Generate draft payroll |
| Payroll | POST | `/payroll/runs/:id/review` | Submit review |
| Payroll | POST | `/payroll/runs/:id/approve` | Approve (Finance) |
| Payroll | POST | `/payroll/runs/:id/finalize` | Finalize payroll |
| Payslip | POST | `/payroll/runs/:id/payslips/generate` | Generate slip gaji |
| Payslip | GET | `/payslips/:id/pdf` | Data untuk PDF slip |
| Reports | GET | `/reports/dashboard` | Dashboard metrics |
| Reports | GET | `/reports/salary-distribution` | Distribusi gaji |
| Reports | GET | `/reports/leave-stats` | Statistik cuti |
| Master | CRUD | `/departments`, `/positions`, `/leave-types` | Data referensi |
| Settings | PUT | `/company-settings` | Simpan pengaturan |
| Users | CRUD | `/users` | User management (Super Admin) |
| Notif | GET | `/notifications/my` | Notifikasi user |

---

## SLIDE 25 — Testing & Kualitas

**Blackbox Testing — 96 Skenario Pengujian**

| Modul | Jumlah Test | Hasil |
|-------|:-----------:|:-----:|
| Autentikasi | 8 | LULUS |
| Dashboard | 4 | LULUS |
| Karyawan | 12 | LULUS |
| Absensi | 5 | LULUS |
| Cuti & Izin | 9 | LULUS |
| Payroll | 14 | LULUS |
| Slip Gaji | 8 | LULUS |
| Laporan | 9 | LULUS |
| Master Data | 10 | LULUS |
| Pengaturan | 7 | LULUS |
| Role Management | 2 | LULUS |
| Keamanan & RBAC | 8 | LULUS |
| **TOTAL** | **96** | **100% LULUS** |

**Cakupan Pengujian:**
- 72 skenario positif (happy path)
- 24 skenario negatif (validasi/error handling)
- RBAC testing per role (Super Admin, HRD, Finance, Employee)
- Workflow payroll end-to-end testing

**Functional Testing (Backend API):** 19/19 skenario LULUS

---

## SLIDE 26 — Deployment

**Strategi Deployment:**

```
┌──────────────────────────────────────────────────────────┐
│                    GITHUB REPOSITORY                      │
│                  (WEB HRIS monorepo)                      │
└──────────────────────────┬───────────────────────────────┘
                           │ git push main
                           ▼
              ┌────────────────────────────┐
              │      RENDER (Cloud)        │
              │                            │
              │  • Auto-deploy on push     │
              │  • Build: npm install      │
              │  • Start: npm start:server │
              │  • Node.js 20.x runtime    │
              └─────────────┬──────────────┘
                            │
              ┌─────────────▼──────────────┐
              │     Production Server       │
              │     (Express serves dist)   │
              │     Static + API + SPA      │
              └─────────────────────────────┘
```

**Konfigurasi via Environment Variables (`.env`):**
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- `JWT_SECRET`, `JWT_EXPIRY`
- `PORT` (default 5000)
- `CORS_ORIGIN` (production domain)
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

**Database Setup Otomatis:** `npm run db:setup`
- Membuat database `hris_db`
- Membuat 25+ tabel dari `schema.sql` + `payroll-schema.sql`
- Seed data awal (roles, admin default, departemen, posisi, jenis cuti)

---

## SLIDE 27 — Demo & Akses Cepat

**Cara Menjalankan Sistem:**

```bash
# 1. Start MySQL (XAMPP Control Panel → MySQL → Start)

# 2. Copy environment variables
cp .env.example .env
# Isi: DB_HOST=localhost, DB_USER=root, DB_PASSWORD=, JWT_SECRET=xxx

# 3. Install dependencies
cd hris-web
npm install

# 4. Setup database (otomatis buat DB + tabel + seed)
npm run db:setup

# 5. Jalankan backend + frontend bersamaan
npm run dev:all
```

**Akses:**
| Layanan | URL |
|---------|-----|
| Web Dashboard | http://localhost:5173 |
| Backend API | http://localhost:5000 |
| Health Check | http://localhost:5000/health |

**Login Default:**
- NIK: `ADM001`
- Password: `admin123`

---

## SLIDE 28 — Keunggulan Sistem

**Keunggulan Kompetitif:**

1. **Terintegrasi Penuh** — satu sistem untuk semua proses HR (karyawan → absensi → cuti → payroll → laporan)

2. **Anti-Kecurangan Absensi** — kombinasi **GPS geofencing + foto selfie**

3. **Workflow Payroll Profesional** — 4 tahap approval (Draft → Reviewed → Approved → Finalized) dengan **audit trail** lengkap

4. **Multi-Platform** — Web untuk admin, Mobile untuk karyawan, sharing backend yang sama

5. **Role-Based Access Control** — 5 peran dengan hak akses berbeda

6. **Real-Time Analytics** — 6 grafik interaktif + export PDF

7. **Cloud-Ready** — siap deploy ke Render/Heroku, foto disimpan di Cloudinary

8. **Audit Compliance** — setiap aksi payroll tercatat (siapa, kapan, apa yang berubah, IP address)

9. **Open Source Stack** — menggunakan teknologi open source (React, Node.js, Express, MySQL)

10. **Production-Ready** — 96 skenario blackbox testing LULUS 100%

---

## SLIDE 29 — Tantangan & Solusi

| Tantangan | Solusi |
|-----------|--------|
| Kecurangan absensi (titip absen) | GPS geofencing + foto selfie wajib |
| Data karyawan terpencar | Single database MySQL terpusat (25+ tabel) |
| Payroll error manual | Otomatisasi generate + 4 tahap validation |
| Sulit tracking approval cuti | Workflow status (Pending → Approved/Rejected) + notifikasi |
| Keamanan data sensitif | JWT + bcrypt + RBAC + Helmet + parameterized queries |
| Akses karyawan mobile | Auto-detect IP LAN, no manual config |
| Audit kepatuhan | `payroll_audit_logs` + `payroll_approvals` |
| Laporan manual di Excel | Dashboard real-time + export PDF otomatis |

---

## SLIDE 30 — Roadmap Pengembangan

**Sudah Implementasi (Current):**
- [x] Autentikasi JWT + RBAC (5 role)
- [x] CRUD Karyawan + Import CSV
- [x] Absensi GPS + Selfie (geofencing)
- [x] Cuti & Approval workflow + notifikasi
- [x] Payroll 4-tahap + audit trail
- [x] Slip gaji + download PDF
- [x] Dashboard analitik + 6 grafik + export PDF
- [x] Master Data (Departemen, Jabatan, Jenis Izin)
- [x] Pengaturan lokasi kantor + geofence
- [x] Mobile app (React Native + Expo)
- [x] Cloudinary integration (foto)
- [x] Blackbox testing 96 skenario (100% pass)

**Rencana Pengembangan:**
- [ ] Input validation middleware (Zod/Joi)
- [ ] Rate limiting untuk API security
- [ ] WebSocket untuk real-time updates
- [ ] Caching layer (Redis) untuk performa
- [ ] E2E testing framework (Playwright/Cypress)
- [ ] Performance monitoring (APM)
- [ ] Integrasi sistem absensi mesin fingerprint
- [ ] Modul rekrutmen & onboarding
- [ ] BPJS & PPh21 otomatis
- [ ] Multi-company support (SaaS)

---

## SLIDE 31 — Kesimpulan

**Sistem HRIS Terpadu Berbasis Cloud** berhasil mengintegrasikan seluruh proses manajemen SDM dalam satu platform:

**Pencapaian Utama:**

1. **11 Modul Fungsional** lengkap dan terintegrasi
2. **60+ REST API endpoints** dengan dokumentasi terstruktur
3. **25+ tabel database** dengan relasi yang normalized
4. **5 Role** dengan hak akses berbeda (RBAC)
5. **Workflow payroll 4-tahap** profesional dengan audit trail
6. **Absensi anti-kecurangan** (GPS geofencing + selfie)
7. **Real-time analytics** dengan 6 grafik interaktif
8. **96 skenario blackbox testing** — 100% LULUS
9. **Multi-platform** — Web Dashboard + Mobile App
10. **Production-ready** — siap deploy ke cloud (Render)

**Dampak Bisnis:**
- Efisiensi proses HR meningkat (otomatisasi payroll, cuti, absensi)
- Akurasi data terjaga (single source of truth)
- Transparansi & akuntabilitas (audit trail + approval workflow)
- Pengalaman karyawan lebih baik (self-service mobile app)

---

## SLIDE 32 — Penutup & Tanya Jawab

**Terima Kasih**

---

**Detail Proyek:**
- **Repository:** WEB HRIS (local / GitHub)
- **Dokumentasi:** `docs/project_manual/` (6 dokumen + 10 diagram UML)
- **Testing Report:** `docs/project_manual/Blackbox_Testing.md`
- **Setup Guide:** `README.md` + `DEVELOPMENT-GUIDE.md`

**Kontak Teknis:**
- Backend: `hris-web/backend/src/server.js`
- Frontend: `hris-web/src/App.jsx`
- Database: `hris-web/backend/schema.sql` + `payroll-schema.sql`

---

### ? Q&A
### Silakan ajukan pertanyaan

---

## LAMPIRAN — Struktur Folder Proyek

```
WEB HRIS/
├── .env                            # Environment variables
├── package.json                    # Root (Render deploy)
├── README.md                       # Setup & dokumentasi
├── DEVELOPMENT-GUIDE.md            # Panduan development
│
├── hris-web/                       # Web Dashboard + Backend API
│   ├── src/
│   │   ├── pages/                  # 11 halaman (Login, Dashboard, Karyawan,
│   │   │                           #   Absensi, Cuti, Payroll, SlipGaji,
│   │   │                           #   Laporan, MasterData, Pengaturan, RoleMgmt)
│   │   ├── components/             # Reusable components
│   │   ├── contexts/               # AuthContext (JWT state)
│   │   ├── api/                    # API client
│   │   ├── utils/                  # Formatters, validators, payslip PDF
│   │   ├── styles/                 # CSS modules
│   │   └── App.jsx                 # Main app shell + routing
│   ├── backend/
│   │   ├── src/
│   │   │   ├── server.js           # 60+ API endpoints (2247 lines)
│   │   │   ├── db.js               # MySQL connection pool
│   │   │   ├── middleware.js       # authRequired + roleRequired
│   │   │   └── setup-db.js        # Auto DB setup
│   │   ├── schema.sql             # 25+ tabel inti
│   │   ├── payroll-schema.sql      # Schema payroll lanjutan
│   │   └── seed.sql                # Data awal
│   ├── ARCHITECTURE.md             # Arsitektur & design patterns
│   ├── AGENTS.md                   # AI coding guidelines
│   └── package.json                # Scripts: dev, build, db:setup
│
├── hris-mobile/                    # Mobile App (Karyawan)
│   └── frontend/                   # React Native + Expo
│
└── docs/                           # Dokumentasi lengkap
    ├── project_manual/             # 6 dokumen teknis
    ├── 01-requirements-analysis.md  # Analisis kebutuhan (26 fungsi)
    └── *.puml                      # 10 diagram UML
```

---

## LAMPIRAN — Diagram UML yang Tersedia

| No | Diagram | File |
|----|---------|------|
| 1 | Class Diagram | `01-class-diagram.puml` |
| 2 | Use Case Diagram | `02-use-case-diagram.puml` |
| 3 | Sequence Diagram — Payroll | `03-sequence-diagram-payroll.puml` |
| 4 | Activity Diagram — Leave | `04-activity-diagram-leave.puml` |
| 5 | Component Diagram | `05-component-diagram.puml` |
| 6 | ER Diagram | `06-er-diagram.puml` |
| 7 | Deployment Diagram | `07-deployment-diagram.puml` |
| 8 | State Diagram — Payroll | `08-state-diagram-payroll.puml` |
| 9 | Sequence Diagram — Attendance | `09-sequence-diagram-attendance.puml` |
| 10 | API Package Diagram | `10-api-package-diagram.puml` |

---

## LAMPIRAN — Kebutuhan Non-Fungsional (Ringkasan)

| Kategori | Kebutuhan |
|----------|-----------|
| **Keamanan** | JWT, RBAC, bcrypt, Helmet, CORS, SQL Injection prevention |
| **Audit** | Payroll audit logs, approval history berjenjang |
| **Validasi** | Geofence GPS, foto selfie, kuota cuti, referensi data |
| **Ketersediaan** | Health check endpoint, error handling terstruktur |
| **Skalabilitas** | Connection pooling, cloud deployment |
| **Portabilitas** | Multi-platform (Web + Mobile), .env configuration |
| **Maintainability** | CI/CD pipeline, auto DB setup, modular architecture |
| **Usability** | Login sederhana, UI intuitif, export PDF |
| **Kinerja** | Parameterized queries, efficient SQL |
| **Interoperabilitas** | RESTful API JSON |

---

*Akhir Materi Presentasi*
