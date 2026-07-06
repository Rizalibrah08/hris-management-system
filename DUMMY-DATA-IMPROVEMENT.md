# Dokumentasi Perbaikan Data Dummy HRIS

Dokumen ini menjelaskan perbaikan dan peningkatan kualitas data dummy yang telah dilakukan pada sistem HRIS untuk mendukung testing, demo, dan development yang lebih realistis.

---

## 📊 Ringkasan Perbaikan

Data dummy telah diperbaiki dan disesuaikan dengan requirement sistem HRIS untuk memberikan simulasi yang lebih mendekati kondisi produksi nyata.

### Statistik Data Dummy Baru

| Modul | Jumlah Data | Keterangan |
|-------|-------------|------------|
| **Employees** | 41 karyawan | 21 laki-laki, 20 perempuan dari 8 departemen |
| **Admin Users** | 4 admin | ADM001, HRD001, FIN001, MGR001 (password: admin123) |
| **Attendance** | ~2,668 records | April-Juni 2026 dengan pola realistis |
| **Leave Requests** | ~85 pengajuan | Berbagai tipe dengan status approval yang variatif |
| **Salary Profiles** | 45 profiles | Range gaji 5-30 juta sesuai level posisi |
| **Payroll Runs** | 3 runs | April (published), Mei (finalized), Juni (reviewed) |
| **Payslips** | 45 slips | Hanya untuk payroll yang sudah published (April) |
| **Tasks** | ~133 tasks | Relevan dengan posisi masing-masing karyawan |
| **Expenses** | ~94 pengajuan | 7 kategori dengan nominal 20k-5jt |
| **Office Assets** | ~91 assets | Disesuaikan dengan kebutuhan posisi |
| **Notifications** | ~225 notifikasi | Kontekstual dengan aktivitas karyawan |

---

## 🔧 Detail Perbaikan Per Modul

### 1. **Data Karyawan (Employees)**

#### Sebelumnya:
- 21 karyawan dengan nama Indonesia sederhana
- Email format basic (nama@hris.local)
- Tidak ada variasi gender yang terstruktur

#### Sesudah Perbaikan:
- **41 karyawan** dengan nama Indonesia yang lebih realistis (nama lengkap 2-3 kata)
- **Gender seimbang**: 21 laki-laki, 20 perempuan
- **Email profesional**: namalengkap@hris.local
- **Distribusi per departemen**:
  - Engineering: 10 orang (termasuk Manager, Senior, Junior, DevOps, Designer)
  - HRD: 5 orang (Manager, Specialist, Recruitment, Admin)
  - Finance: 6 orang (Manager, Payroll Analyst, Accountant, Tax Specialist)
  - Marketing: 7 orang (Lead, Digital Marketing, SEO, Content Writer, Designer)
  - Operations: 4 orang (Manager, Admin Staff)
  - Product: 4 orang (Manager, Data Analyst, Designer)
  - Legal: 2 orang (Legal Counsel)
  - IT Support: 3 orang (IT Support Specialist)

**Contoh Data:**
```javascript
{ name: 'Budi Santoso', gender: 'L', dept: 'Engineering', pos: 'Engineering Manager', role: 'Manager', email: 'budi.santoso@hris.local', nik: 'EMP001' }
{ name: 'Dewi Lestari Putri', gender: 'P', dept: 'HRD', pos: 'HR Manager', role: 'HRD', email: 'dewi.lestari@hris.local', nik: 'EMP011' }
```

---

### 2. **Attendance (Kehadiran)**

#### Sebelumnya:
- Pola sederhana: 5% absence, clock in 07:30-09:15, clock out 16:30-18:45
- Semua status hanya "Hadir" atau "Terlambat"
- Tidak ada variasi WFH atau pola keterlambatan realistis

#### Sesudah Perbaikan:
- **Periode**: April - Juni 2026 (3 bulan, exclude weekend)
- **Pola Realistis**:
  - 70% on-time (07:30-08:45) → Status: "Hadir"
  - 25% terlambat (08:46-09:30) → Status: "Terlambat"
  - 5% sangat terlambat (09:31-10:30) → Status: "Terlambat"
  - 8% absence (cuti/sakit/izin, tidak ada record)
  - 2% WFH (no selfie, GPS berbeda)

- **Clock Out dengan variasi**:
  - 60% pulang normal (16:30-17:30)
  - 30% lembur ringan (17:31-18:30)
  - 10% lembur berat (18:31-19:30)

- **GPS Location**:
  - Office: `-6.2088,106.8456`
  - WFH: `-6.2500,106.8700`

- **Selfie URL**: `https://cloudinary.com/hris/selfie_{NIK}_{DATE}.jpg` (null untuk WFH)

**Total Records**: ~2,668 attendance records untuk 45 employees

---

### 3. **Leave Requests (Pengajuan Cuti)**

#### Sebelumnya:
- Random 35 cuti dengan tipe terbatas
- Status approval tidak proporsional

#### Sesudah Perbaikan:
- **2-3 pengajuan per karyawan** dalam 3 bulan
- **Distribusi Tipe Cuti** (weighted random):
  - 40% Cuti Tahunan (durasi 2-5 hari)
  - 25% Cuti Sakit (durasi 1-3 hari)
  - 20% Izin Pribadi (durasi 1-2 hari)
  - 10% Izin Mendadak (durasi 1 hari)
  - 3% Cuti Menikah (durasi 2-3 hari)
  - 2% Cuti Melahirkan (90 hari, khusus perempuan)

- **Status Approval**:
  - 65% Approved
  - 25% Pending
  - 10% Rejected

- **Reason/Alasan** disesuaikan dengan tipe cuti:
  - Cuti Tahunan: "Liburan keluarga", "Acara keluarga", dll
  - Cuti Sakit: "Demam", "Flu dan batuk", "Periksa kesehatan", dll
  - Izin Pribadi: "Urusan keluarga", "Keperluan mendadak", dll

**Total**: ~85 leave requests

---

### 4. **Salary & Payroll Components**

#### Sebelumnya:
- Gaji flat berdasar role (12-25 juta untuk admin, 6-12 juta untuk staff)
- Tunjangan 10% dari gaji pokok
- Transport/makan nominal kecil (50k/30k)

#### Sesudah Perbaikan:
- **Struktur Gaji Realistis** berdasar level dan departemen:

| Level | Range Gaji (Rp) | Contoh Posisi |
|-------|-----------------|---------------|
| Top Management | 18 - 30 juta | Super Admin, C-Level |
| Manager | 15 - 25 juta | Engineering Manager, HR Manager, Finance Manager |
| Senior/Lead | 10 - 18 juta | Senior Engineer, Marketing Lead |
| Specialist/Analyst | 8 - 14 juta | HR Specialist, Payroll Analyst, Data Analyst |
| Staff/Engineer | 6 - 12 juta | Software Engineer, Marketing Specialist |
| Junior | 5 - 8 juta | Junior Engineer |
| Admin/Support | 5 - 9 juta | Admin Staff, HR Admin |

- **Komponen Gaji**:
  - **Gaji Pokok (GAPOK)**: Sesuai level
  - **Tunjangan Tetap (TUNJ)**: 20% dari gaji pokok
  - **Tunjangan Transport**: Rp 500k per bulan (flat)
  - **Tunjangan Makan**: Rp 600k per bulan (flat)
  - **BPJS Ketenagakerjaan**: 2% dari gaji pokok
  - **BPJS Kesehatan**: 1% dari gaji pokok
  - **PPh21**: 5% simplified (untuk demo)

- **Metode Pembayaran**:
  - Bank Transfer (BCA, Mandiri, BNI, BRI)
  - Nomor rekening acak 10 digit

**Total Salary Profiles**: 45 (untuk semua employees termasuk admin)

---

### 5. **Payroll Runs**

#### Sebelumnya:
- 3 payroll runs dengan status published/finalized/reviewed
- Potongan keterlambatan random (0-3x 50k)

#### Sesudah Perbaikan:
- **3 Payroll Runs** dengan status yang jelas:

| Period | Status | Finalized At | Payslips Generated |
|--------|--------|--------------|-------------------|
| April 2026 | published | 28 Apr 2026 10:00 | ✅ 45 slips |
| Mei 2026 | finalized | 28 Mei 2026 14:00 | ❌ (ready to publish) |
| Juni 2026 | reviewed | - | ❌ (masih review) |

- **Perhitungan Potongan Keterlambatan**:
  - Diambil dari data attendance real (bukan random)
  - Rp 50k per hari keterlambatan
  - Dicatat di `payroll_run_item_components` sebagai "Potongan Keterlambatan"

- **Payslip Number Format**: `SLIP-{PERIOD}-{NIK}`
  - Contoh: `SLIP-202604-EMP001`

- **Total Gross/Deduction/Net** dihitung otomatis dan tersimpan di tabel `payroll_runs`

**Total Payslips**: 45 (hanya untuk April yang sudah published)

---

### 6. **Tasks (Tugas)**

#### Sebelumnya:
- Generic "Task 1", "Task 2", dst
- Tidak relevan dengan posisi karyawan

#### Sesudah Perbaikan:
- **2-5 tasks per karyawan** sesuai job description
- **Task Templates per Posisi**:

**Software Engineer**:
- Implement user authentication feature
- Fix bug in payment module
- Code review untuk PR #
- Write unit tests
- Optimize database queries

**DevOps Engineer**:
- Setup CI/CD pipeline
- Monitor server performance
- Database backup automation
- Security patching

**UI/UX Designer**:
- Design mobile app mockup
- User research interview
- Create design system
- Usability testing

**Product Manager**:
- Product roadmap planning
- Stakeholder meeting
- User story prioritization
- Market research analysis

**HR Specialist**:
- Employee onboarding
- Review CV candidates
- Conduct interviews
- Performance appraisal

**Finance**:
- Monthly budget report
- Invoice verification
- Tax report preparation
- Financial audit

**Marketing**:
- Social media content plan
- Campaign performance analysis
- SEO optimization
- Blog article writing

**Operations**:
- Process documentation
- Inventory check
- Vendor coordination
- Office supplies procurement

- **Status**: To Do, In Progress, Done (random)
- **Priority**: Low, Medium, High (random)
- **Due Date**: Hari ini hingga 30 hari ke depan

**Total Tasks**: ~133 tasks

---

### 7. **Expenses (Pengeluaran)**

#### Sebelumnya:
- Generic "Pengeluaran Transport", "Pengeluaran Meals"
- Nominal 50k-500k
- Hanya 2 status (Approved/Pending)

#### Sesudah Perbaikan:
- **1-3 expenses per karyawan**
- **7 Kategori Spesifik** dengan item dan nominal realistis:

| Kategori | Items | Range Nominal |
|----------|-------|---------------|
| **Transport** | Taksi ke client, Bensin dinas, Parkir, Tol | 50k - 300k |
| **Meals** | Makan dengan client, Coffee meeting, Team lunch | 100k - 500k |
| **Office Supplies** | Kertas A4, Tinta printer, Alat tulis | 50k - 500k |
| **Training** | Online course, Seminar, Workshop, Certification | 500k - 5jt |
| **Communication** | Pulsa internet, Kurir, Pos dokumen | 50k - 200k |
| **Equipment** | Mouse, Keyboard, Webcam, Headset | 200k - 1.5jt |
| **Other** | Printing, Fotokopi, Laminating | 20k - 300k |

- **Status Approval**:
  - 70% Approved (dengan receipt URL)
  - 20% Pending
  - 10% Rejected

- **Receipt URL**: `https://cloudinary.com/hris/receipts/receipt_{NIK}_{TIMESTAMP}.jpg` (untuk yang approved)
- **Created Date**: 1-60 hari yang lalu

**Total Expenses**: ~94 pengajuan

---

### 8. **Office Assets (Aset Kantor)**

#### Sebelumnya:
- Random 30 assets (MacBook, ThinkPad, Monitor, Mouse, Keyboard)
- Tidak disesuaikan dengan kebutuhan posisi

#### Sesudah Perbaikan:
- **Assets disesuaikan dengan posisi dan departemen**:

**Engineering/Developer** (3-4 assets):
- MacBook Pro 14" M3 (Apple, warranty ✅)
- Dell UltraSharp 27" Monitor (Dell, warranty ✅)
- Logitech MX Master 3 (Logitech, warranty ✅)
- Keychron K8 Mechanical Keyboard (Keychron)

**Designer** (3-4 assets):
- MacBook Pro 16" M3 Max (Apple, warranty ✅)
- LG UltraFine 32" 4K Monitor (LG, warranty ✅)
- Wacom Intuos Pro (Wacom, warranty ✅)
- Magic Mouse 2 (Apple)

**IT Support** (2-3 assets):
- ThinkPad X1 Carbon (Lenovo, warranty ✅)
- HP EliteDisplay 24" (HP, warranty ✅)
- Network Tools Kit (Generic)

**Office/Staff** (1-2 assets):
- HP EliteBook 840 (HP, warranty ✅)
- Samsung 24" Monitor (Samsung, warranty ✅)
- Logitech Wireless Mouse/Keyboard (Logitech)

- **Serial Number**: Format `SN-{BRAND}-{6DIGIT}` (e.g., `SN-APP-123456`)
- **Purchase Date**: Random dalam tahun 2025
- **Received Date**: 1-14 hari setelah purchase
- **Condition**: 85% Good, 15% Fair/Needs Repair
- **Image URL**: `https://cloudinary.com/hris/assets/{brand}_{nik}.jpg`

**Total Assets**: ~91 assets

---

### 9. **Notifications (Notifikasi)**

#### Sebelumnya:
- Generic "Notifikasi Sistem"
- Tidak kontekstual

#### Sesudah Perbaikan:
- **3-7 notifikasi per karyawan**
- **9 Tipe Notifikasi Kontekstual**:

| Type | Title | Message Template | Reference |
|------|-------|-----------------|-----------|
| success | Cuti Disetujui | Pengajuan cuti {leaveType} Anda telah disetujui | leave_approved |
| warning | Cuti Ditolak | Pengajuan cuti Anda telah ditolak. Silakan hubungi HRD | leave_rejected |
| info | Slip Gaji Tersedia | Slip gaji bulan {month} sudah tersedia untuk diunduh | payslip_ready |
| info | Task Baru | Anda mendapat tugas baru: {taskTitle} | task_assigned |
| warning | Reminder Absensi | Anda belum clock out hari ini | attendance_reminder |
| success | Reimbursement Disetujui | Pengajuan reimbursement Rp {amount} telah disetujui | expense_approved |
| info | Asset Diterima | Asset {assetName} telah terdaftar atas nama Anda | asset_received |
| info | Pengumuman | Reminder: Meeting all-hands besok pukul 10:00 WIB | announcement |
| warning | Perhatian Keterlambatan | Anda sudah terlambat {count} kali bulan ini | late_warning |

- **Personalisasi**: Variable di message template diganti dengan data random yang sesuai
- **Created Date**: 1-30 hari yang lalu dengan jam kerja (8:00-17:00)
- **Read Status**: 60% sudah dibaca, 40% belum

**Total Notifications**: ~225 notifikasi

---

## 🚀 Cara Menggunakan

### Setup Database dengan Data Dummy Baru

1. Pastikan MySQL sudah running (XAMPP/Aiven/TiDB)

2. Jalankan setup database:
   ```bash
   cd hris-web
   npm run db:setup
   ```

3. Script akan:
   - Drop semua tabel existing
   - Buat schema baru (schema.sql + payroll-schema.sql)
   - Insert master data (roles, departments, positions, leave types, payroll components)
   - Insert 4 admin users (ADM001, HRD001, FIN001, MGR001)
   - Generate 41 dummy employees
   - Generate semua data dummy dengan pola realistis

4. Login ke web dashboard atau mobile app dengan:
   - NIK: `ADM001` (atau HRD001, FIN001, MGR001, EMP001-EMP041)
   - Password: `admin123`

### Verifikasi Data

Setelah setup, Anda dapat memverifikasi di web dashboard:

- **Dashboard**: Lihat statistik attendance, leave, payroll
- **Employees**: 45 karyawan (4 admin + 41 dummy)
- **Attendance**: Filter April-Juni 2026 untuk melihat pola realistis
- **Leave Management**: Lihat berbagai status approval
- **Payroll**: 
  - April (published) → ada payslips
  - May (finalized) → siap untuk publish
  - June (reviewed) → masih dalam review
- **Tasks**: Setiap karyawan punya 2-5 tasks relevan
- **Expenses**: Lihat berbagai kategori dengan receipt
- **Office Assets**: Lihat aset per karyawan
- **Notifications**: Buka inbox untuk melihat notifikasi kontekstual

---

## 📝 Catatan Teknis

### File yang Dimodifikasi

- `hris-web/backend/src/seed-dummy.js` - Complete rewrite dengan logic baru

### Dependencies

Tidak ada dependency baru yang ditambahkan. Semua menggunakan library existing:
- `mysql2/promise` untuk database operations
- Built-in JavaScript `Math.random()` untuk randomization
- Built-in `Date` object untuk date/time handling

### Performance

- Setup time: ~10-15 detik (tergantung spec komputer)
- Total records generated: ~3,500+ records
- Database size: ~5-10 MB (data only, exclude indexes)

### Randomization Seeds

Data dummy menggunakan `Math.random()` tanpa seed fixed, sehingga setiap kali `npm run db:setup` dijalankan akan menghasilkan data yang sedikit berbeda (nama tetap sama, tapi attendance pattern, leave dates, task assignments, dll akan berbeda).

Jika Anda ingin hasil yang konsisten, tambahkan seed di awal `seed-dummy.js`:
```javascript
// Add at the top of seedDummyData function
Math.seedrandom = require('seedrandom')
Math.random = Math.seedrandom('hris-seed-2026')
```

---

## 🎯 Testing Scenarios

Dengan data dummy baru ini, Anda bisa test scenario berikut:

### Web Dashboard

1. **Attendance Monitoring**:
   - Filter by date range (Apr-Jun 2026)
   - Lihat karyawan yang terlambat
   - Lihat pola WFH (GPS berbeda, no selfie)

2. **Leave Management**:
   - Review pending leave requests
   - Approve/Reject cuti
   - Lihat berbagai tipe cuti (tahunan, sakit, melahirkan, dll)

3. **Payroll Processing**:
   - Review payroll June (status: reviewed)
   - Finalize dan publish payroll June
   - Generate payslips untuk June
   - Download payslip PDF

4. **Employee Management**:
   - Lihat distribusi karyawan per department
   - View salary profiles
   - Assign office assets

5. **Expense & Reimbursement**:
   - Review pending expenses
   - Approve dengan receipt URL
   - Filter by category

### Mobile App

1. **Clock In/Out**:
   - Karyawan bisa clock in dengan selfie + GPS
   - Lihat riwayat kehadiran 3 bulan terakhir

2. **Leave Request**:
   - Buat pengajuan cuti baru
   - Lihat status approval cuti yang sudah diajukan

3. **Payslip**:
   - Download payslip April (yang sudah published)
   - View breakdown gaji (earning vs deduction)

4. **Notifications**:
   - Lihat berbagai notifikasi kontekstual
   - Mark as read

5. **Profile**:
   - View employee profile
   - Lihat office assets yang diterima

---

## 🔄 Update & Maintenance

### Menambah Karyawan Baru

Edit `employeeData` array di `seed-dummy.js`:
```javascript
{ name: 'Nama Lengkap', gender: 'L/P', dept: 'Department', pos: 'Position', role: 'Role', email: 'email@hris.local', nik: 'EMPXXX' }
```

### Menambah Template Tasks

Edit `taskTemplates` object di bagian Tasks:
```javascript
'Position Name': [
  'Task template 1',
  'Task template 2',
  // ...
]
```

### Menambah Kategori Expenses

Edit `expenseCategories` array di bagian Expenses:
```javascript
{ cat: 'Category', items: ['Item 1', 'Item 2'], range: [minAmount, maxAmount] }
```

### Menambah Tipe Notifikasi

Edit `notifTemplates` array di bagian Notifications:
```javascript
{ type: 'success/warning/info', titleTemplate: 'Title', messageTemplate: 'Message with {variable}', relatedTo: 'reference_type' }
```

Setelah edit, jalankan `npm run db:setup` untuk regenerate data.

---

## 📚 Referensi

- **Main README**: `README.md`
- **Development Guide**: `DEVELOPMENT-GUIDE.md`
- **Web Setup**: `hris-web/SETUP.md`
- **API Documentation**: `docs/project_manual/05_API_Documentation.md`
- **System Architecture**: `docs/project_manual/01_System_Architecture.md`

---

## 🐛 Known Issues & Limitations

1. **Date Range Fixed**: Attendance dan leave hardcoded untuk April-Juni 2026. Untuk bulan lain, edit variabel `startDate` dan `endDate`.

2. **Timezone**: Semua date menggunakan UTC. Untuk WIB, perlu adjustment di aplikasi.

3. **Random Seed**: Tidak ada seed fixed, jadi setiap setup akan berbeda (nama tetap, pattern berbeda).

4. **Cloudinary URLs**: URL untuk selfie, receipt, dan asset images adalah mock URL. Untuk production, perlu setup Cloudinary atau storage lain.

5. **Salary Calculation**: PPh21 menggunakan flat 5% untuk simplifikasi. Production perlu perhitungan pajak progresif yang benar.

6. **BPJS**: Perhitungan BPJS simplified (2% + 1%). Production perlu sesuaikan dengan aturan BPJS terbaru.

---

## ✅ Checklist Quality Assurance

- [x] Data karyawan dengan nama Indonesia realistis
- [x] Gender balance (50:50)
- [x] Distribusi departemen proporsional
- [x] Attendance pattern realistis (on-time, late, WFH, absent)
- [x] Leave requests dengan berbagai tipe dan approval status
- [x] Salary structure sesuai market Indonesia
- [x] Payroll calculation dengan potongan keterlambatan real
- [x] Tasks relevan dengan job description
- [x] Expenses dengan kategori dan nominal realistis
- [x] Office assets sesuai kebutuhan posisi
- [x] Notifications kontekstual dengan aktivitas
- [x] Database setup script berjalan tanpa error
- [x] Total records generated sesuai estimasi
- [x] Referential integrity terjaga (foreign keys)
- [x] Dokumentasi lengkap dan terstruktur

---
