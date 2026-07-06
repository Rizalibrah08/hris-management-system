# Update Data Dummy HRIS v2.0

**Update Date**: 6 Juli 2026  
**Changes**: Format NIK yang lebih real dan penambahan karyawan kontrak

---

## 🆕 Perubahan Utama

### 1. **Format NIK yang Lebih Real**

#### Sebelumnya:
```
EMP001, EMP002, EMP003, ...
ADM001, HRD001, FIN001, MGR001
```

#### Sesudah:
```
Format: EMP-YYYYMMDD-XXX
- YYYYMMDD = Tanggal bergabung (join date)
- XXX = Nomor urut (001, 002, 003, ...)

Contoh:
- EMP-20220101-001 (bergabung 1 Januari 2022, admin pertama)
- EMP-20230115-001 (bergabung 15 Januari 2023, karyawan ke-1 di tahun itu)
- EMP-20240201-004 (bergabung 1 Februari 2024, karyawan ke-4)
```

**NIK Admin Users (Permanent):**
- `EMP-20220101-001` - Super Admin (Administrator)
- `EMP-20220201-002` - HRD Manager
- `EMP-20220301-003` - Finance Manager
- `EMP-20220401-004` - Engineering Manager

### 2. **Karyawan Kontrak vs Permanen**

Sistem sekarang membedakan antara:

#### **Karyawan Permanen** (26 orang)
- Tidak ada `contract_end` date
- Status: `is_active = 1` (semua aktif)
- Posisi: Manager, Senior, Specialist, permanent staff
- Contoh:
  - Budi Santoso (Engineering Manager) - `EMP-20230115-001` - Permanen
  - Dewi Lestari Putri (HR Manager) - `EMP-20220801-011` - Permanen

#### **Karyawan Kontrak** (15 orang)
- Ada `contract_end` date (1-2 tahun dari join date)
- Status bisa aktif atau tidak aktif tergantung apakah kontrak sudah selesai
- Posisi: Junior, Admin, beberapa Specialist
- **4 karyawan kontrak sudah tidak aktif** (`is_active = 0`):

| NIK | Nama | Posisi | Join Date | Contract End | Status |
|-----|------|--------|-----------|--------------|--------|
| EMP-20240201-004 | Arief Rahman Hakim | Software Engineer | 2024-02-01 | 2026-01-31 | ❌ Tidak Aktif |
| EMP-20250401-009 | Putri Ayu Lestari | Junior Software Engineer | 2025-04-01 | 2026-03-31 | ❌ Tidak Aktif |
| EMP-20240601-025 | Ratih Puspitasari | Content Writer | 2024-06-01 | 2025-12-31 | ❌ Tidak Aktif |
| EMP-20250401-032 | Novia Anggraini | Admin Staff | 2025-04-01 | 2026-03-31 | ❌ Tidak Aktif |

- **11 karyawan kontrak masih aktif**:

| NIK | Nama | Posisi | Join Date | Contract End | Status |
|-----|------|--------|-----------|--------------|--------|
| EMP-20240315-005 | Dina Mariana | Software Engineer | 2024-03-15 | 2026-03-14 | ✅ Aktif |
| EMP-20250201-008 | Galih Pratama | Junior Software Engineer | 2025-02-01 | 2027-01-31 | ✅ Aktif |
| EMP-20240501-014 | Rudi Hermawan | HR Admin | 2024-05-01 | 2026-04-30 | ✅ Aktif |
| EMP-20250301-015 | Intan Permatasari | HR Admin | 2025-03-01 | 2027-02-28 | ✅ Aktif |
| EMP-20250101-021 | Sari Rahayu | Tax Specialist | 2025-01-01 | 2026-12-31 | ✅ Aktif |
| EMP-20240301-024 | Kevin Aditya Putra | Digital Marketing Specialist | 2024-03-01 | 2026-02-28 | ✅ Aktif |
| EMP-20250201-027 | Doni Setiawan | Content Writer | 2025-02-01 | 2027-01-31 | ✅ Aktif |
| EMP-20240201-030 | Wulan Dari | Admin Staff | 2024-02-01 | 2026-01-31 | ✅ Aktif |
| EMP-20240801-035 | Bayu Aji Nugroho | Data Analyst | 2024-08-01 | 2026-07-31 | ✅ Aktif |
| EMP-20240901-038 | Kartika Sari | Legal Counsel | 2024-09-01 | 2026-08-31 | ✅ Aktif |
| EMP-20240501-040 | Joko Susilo | IT Support Specialist | 2024-05-01 | 2026-04-30 | ✅ Aktif |

### 3. **Karyawan Tidak Aktif**

Karyawan yang tidak aktif (`is_active = 0`):
- **Tidak memiliki user account** (tidak bisa login)
- **Tidak ada data aktivitas baru**:
  - Tidak ada tasks
  - Tidak ada expenses
  - Tidak ada office assets assignment baru
  - Tidak ada notifications
- **Data historis tetap ada**:
  - Attendance records (sampai tanggal terakhir aktif)
  - Leave requests yang pernah diajukan
  - Salary profile dan payroll history

---

## 📊 Statistik Data Terbaru

| Kategori | Jumlah | Keterangan |
|----------|--------|------------|
| **Total Employees** | 45 | 4 admin + 41 dummy |
| **Karyawan Aktif** | 41 | 4 admin + 37 dummy aktif |
| **Karyawan Tidak Aktif** | 4 | Kontrak selesai |
| **Karyawan Permanen** | 30 | 4 admin + 26 dummy permanen |
| **Karyawan Kontrak** | 15 | 11 aktif + 4 tidak aktif |
| **Attendance Records** | ~2,436 | Hanya untuk karyawan aktif |
| **Leave Requests** | ~73 | Termasuk historis karyawan tidak aktif |
| **Salary Profiles** | 41 | Hanya untuk karyawan aktif |
| **Payroll Runs** | 3 | Apr (published), May (finalized), Jun (reviewed) |
| **Payslips** | 41 | Hanya April yang published |
| **Tasks** | ~127 | Hanya untuk karyawan aktif |
| **Expenses** | ~84 | Hanya untuk karyawan aktif |
| **Office Assets** | ~82 | Hanya untuk karyawan aktif |
| **Notifications** | ~199 | Hanya untuk karyawan aktif |

---

## 🔍 Contoh Data Karyawan

### Karyawan Permanen (Active)
```javascript
{
  name: 'Budi Santoso',
  nik: 'EMP-20230115-001',
  gender: 'L',
  dept: 'Engineering',
  pos: 'Engineering Manager',
  role: 'Manager',
  email: 'budi.santoso@hris.local',
  joinDate: '2023-01-15',
  contractType: 'permanent',
  contractEnd: null,
  isActive: true
}
```

### Karyawan Kontrak (Active)
```javascript
{
  name: 'Dina Mariana',
  nik: 'EMP-20240315-005',
  gender: 'P',
  dept: 'Engineering',
  pos: 'Software Engineer',
  role: 'Employee',
  email: 'dina.mariana@hris.local',
  joinDate: '2024-03-15',
  contractType: 'contract',
  contractEnd: '2026-03-14', // Kontrak 2 tahun
  isActive: true
}
```

### Karyawan Kontrak (Inactive - Kontrak Selesai)
```javascript
{
  name: 'Arief Rahman Hakim',
  nik: 'EMP-20240201-004',
  gender: 'L',
  dept: 'Engineering',
  pos: 'Software Engineer',
  role: 'Employee',
  email: 'arief.rahman@hris.local',
  joinDate: '2024-02-01',
  contractType: 'contract',
  contractEnd: '2026-01-31', // Kontrak sudah selesai
  isActive: false // Tidak aktif
}
```

---

## 💾 Schema Changes

### Tabel `employees`

```sql
CREATE TABLE IF NOT EXISTS employees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  department_id INT,
  position_id INT,
  contract_end DATE,              -- ✅ Digunakan untuk karyawan kontrak
  is_active TINYINT(1) NOT NULL DEFAULT 1,  -- ✅ 0 untuk karyawan tidak aktif
  email VARCHAR(100) NULL,
  phone VARCHAR(30) NULL,
  FOREIGN KEY (department_id) REFERENCES departments(id),
  FOREIGN KEY (position_id) REFERENCES positions(id)
);
```

**Perubahan:**
- Field `contract_end` sekarang digunakan untuk menandai karyawan kontrak
- Field `is_active` digunakan untuk menandai karyawan yang sudah tidak aktif
- Karyawan permanen: `contract_end = NULL`, `is_active = 1`
- Karyawan kontrak aktif: `contract_end = [date]`, `is_active = 1`
- Karyawan kontrak tidak aktif: `contract_end = [date]`, `is_active = 0`

### Tabel `users`

```sql
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nik VARCHAR(30) UNIQUE NOT NULL,  -- ✅ Format: EMP-YYYYMMDD-XXX
  email VARCHAR(100) NULL,
  phone VARCHAR(30) NULL,
  password VARCHAR(255) NOT NULL,
  role_id INT NOT NULL,
  employee_id INT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,  -- ✅ Linked dengan employees.is_active
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES roles(id),
  FOREIGN KEY (employee_id) REFERENCES employees(id)
);
```

**Perubahan:**
- NIK format: `EMP-YYYYMMDD-XXX` (lebih terstruktur)
- User hanya dibuat untuk karyawan aktif (`is_active = 1`)
- Karyawan tidak aktif tidak memiliki user account (tidak bisa login)

---

## 🎯 Use Cases & Testing Scenarios

### 1. **Login dengan NIK Baru**

**Admin Users:**
```
NIK: EMP-20220101-001 (Super Admin)
Password: admin123

NIK: EMP-20220201-002 (HRD Manager)
Password: admin123

NIK: EMP-20220301-003 (Finance Manager)
Password: admin123

NIK: EMP-20220401-004 (Engineering Manager)
Password: admin123
```

**Dummy Employees (Aktif):**
```
NIK: EMP-20230115-001 (Budi Santoso - Engineering Manager)
Password: admin123

NIK: EMP-20240315-005 (Dina Mariana - Software Engineer, Kontrak)
Password: admin123

NIK: EMP-20250201-008 (Galih Pratama - Junior Software Engineer, Kontrak)
Password: admin123
```

**Karyawan Tidak Aktif (Tidak Bisa Login):**
```
❌ NIK: EMP-20240201-004 (Arief Rahman Hakim - Kontrak Selesai)
❌ NIK: EMP-20250401-009 (Putri Ayu Lestari - Kontrak Selesai)
❌ NIK: EMP-20240601-025 (Ratih Puspitasari - Kontrak Selesai)
❌ NIK: EMP-20250401-032 (Novia Anggraini - Kontrak Selesai)
```

### 2. **Filter Karyawan Berdasarkan Status**

**Web Dashboard - Employee List:**

Filter "Status":
- ✅ Aktif (41 karyawan)
- ❌ Tidak Aktif (4 karyawan)

Filter "Tipe Kontrak":
- 🟢 Permanen (30 karyawan)
- 🟡 Kontrak (15 karyawan: 11 aktif + 4 tidak aktif)

### 3. **Notifikasi Kontrak Akan Berakhir**

Sistem bisa mengirim notifikasi untuk karyawan kontrak yang akan berakhir dalam 30/60/90 hari:

**Kontrak yang akan berakhir < 90 hari dari sekarang (6 Juli 2026):**
- Bayu Aji Nugroho (EMP-20240801-035) - berakhir 31 Juli 2026 (25 hari lagi)
- Kartika Sari (EMP-20240901-038) - berakhir 31 Agustus 2026 (56 hari lagi)

Query contoh:
```sql
SELECT e.name, e.contract_end, u.nik, DATEDIFF(e.contract_end, CURDATE()) as days_left
FROM employees e
JOIN users u ON e.id = u.employee_id
WHERE e.is_active = 1 
  AND e.contract_end IS NOT NULL
  AND e.contract_end BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 90 DAY)
ORDER BY e.contract_end ASC;
```

### 4. **Renewal Kontrak**

HRD bisa memperpanjang kontrak karyawan dengan:
1. Update `contract_end` date
2. Pastikan `is_active = 1`

Contoh:
```sql
-- Perpanjang kontrak Bayu Aji dari 31 Juli 2026 → 31 Juli 2028
UPDATE employees 
SET contract_end = '2028-07-31' 
WHERE id = [employee_id];
```

### 5. **Terminate Kontrak**

Jika kontrak tidak diperpanjang:
1. Set `is_active = 0` di tabel `employees`
2. Set `is_active = 0` di tabel `users` (atau hapus user)
3. Karyawan tidak bisa login lagi
4. Data historis tetap ada

Contoh:
```sql
-- Terminate karyawan
UPDATE employees SET is_active = 0 WHERE id = [employee_id];
UPDATE users SET is_active = 0 WHERE employee_id = [employee_id];
```

### 6. **View Data Historis Karyawan Tidak Aktif**

Di web dashboard, HRD/Finance bisa melihat:
- Riwayat attendance karyawan yang sudah tidak aktif
- Riwayat leave requests
- Payslip history
- Performance records

Filter: "Show All Employees (including inactive)"

---

## 🔄 Migration dari Data Lama

Jika Anda sudah punya database dengan format NIK lama (`EMP001`, `ADM001`, dll), berikut cara migrate:

### Option 1: Reset Database (Recommended untuk Development)

```bash
cd hris-web
npm run db:setup
```

Ini akan drop semua data dan create fresh dengan format baru.

### Option 2: Manual Migration (Production)

**Step 1: Backup database**
```bash
mysqldump -u root -p hris_db > backup_before_migration.sql
```

**Step 2: Update NIK format**
```sql
-- Generate new NIK format based on created_at or arbitrary date
UPDATE users 
SET nik = CONCAT('EMP-20230101-', LPAD(id, 3, '0'))
WHERE nik NOT LIKE 'EMP-%';

-- Or manual update for specific users
UPDATE users SET nik = 'EMP-20220101-001' WHERE nik = 'ADM001';
UPDATE users SET nik = 'EMP-20220201-002' WHERE nik = 'HRD001';
-- etc...
```

**Step 3: Add contract info for contract employees**
```sql
-- Set contract_end untuk karyawan kontrak
UPDATE employees 
SET contract_end = '2026-12-31' 
WHERE id IN (SELECT employee_id FROM users WHERE nik IN ('EMP-xxx', 'EMP-yyy'));
```

**Step 4: Mark inactive employees**
```sql
-- Set is_active = 0 untuk karyawan yang sudah tidak aktif
UPDATE employees SET is_active = 0 WHERE id IN ([list of inactive employee ids]);
UPDATE users SET is_active = 0 WHERE employee_id IN ([list of inactive employee ids]);
```

---

## 📋 Business Rules

### Karyawan Kontrak:
1. **Durasi Kontrak**: 1-2 tahun (bisa diperpanjang)
2. **Notifikasi Reminder**: 
   - 90 hari sebelum berakhir → notif ke HRD
   - 60 hari sebelum berakhir → notif ke HRD + Manager
   - 30 hari sebelum berakhir → notif ke HRD + Manager + Karyawan
3. **Status Berakhir**:
   - Auto set `is_active = 0` jika `contract_end < CURDATE()` (bisa via cronjob)
   - Atau manual terminate oleh HRD
4. **Renewal**:
   - Update `contract_end` dengan tanggal baru
   - Pastikan `is_active = 1`

### Karyawan Permanen:
1. **contract_end**: `NULL`
2. **is_active**: `1` (sampai resign/terminasi)
3. **Tidak ada auto-expire**

### Karyawan Tidak Aktif:
1. **is_active**: `0`
2. **Tidak bisa login** (user `is_active = 0` atau user dihapus)
3. **Data historis tetap ada** di database
4. **Tidak muncul di active employee list** (default filter)
5. **Bisa di-reactivate** jika diperlukan (set `is_active = 1`)

---

## 🐛 Known Issues & Limitations

1. **Auto-expire Contract**: Belum ada cronjob untuk auto-set `is_active = 0` saat kontrak berakhir. Saat ini manual via HRD.

2. **Notification Reminder**: Notifikasi kontrak akan berakhir belum otomatis. Perlu implement di backend.

3. **NIK Migration**: Untuk production dengan data existing, perlu careful migration plan agar NIK format konsisten.

4. **Join Date**: Saat ini hanya di NIK format, belum ada field `join_date` terpisah di tabel employees. Bisa ditambah jika perlu:
   ```sql
   ALTER TABLE employees ADD COLUMN join_date DATE AFTER position_id;
   ```

---

## ✅ Testing Checklist

- [x] Setup database dengan format NIK baru
- [x] Login dengan NIK admin format baru
- [x] Login dengan NIK karyawan dummy format baru
- [x] Karyawan tidak aktif tidak bisa login
- [x] Filter karyawan berdasarkan status (aktif/tidak aktif)
- [x] Filter karyawan berdasarkan tipe kontrak (permanen/kontrak)
- [x] View contract_end date di employee detail
- [x] Data attendance hanya untuk karyawan aktif
- [x] Data tasks/expenses/assets hanya untuk karyawan aktif
- [x] Data historis karyawan tidak aktif tetap ada
- [x] Payroll calculation untuk semua karyawan (termasuk yang baru saja tidak aktif di bulan yang sama)

---

## 📚 API Changes

### GET /api/employees

**Query Parameters (new):**
```javascript
{
  status: 'active' | 'inactive' | 'all',  // default: 'active'
  contractType: 'permanent' | 'contract' | 'all'  // default: 'all'
}
```

**Response:**
```javascript
{
  "employees": [
    {
      "id": 1,
      "name": "Budi Santoso",
      "nik": "EMP-20230115-001",
      "department": "Engineering",
      "position": "Engineering Manager",
      "email": "budi.santoso@hris.local",
      "phone": "081234567890",
      "contractEnd": null,  // null = permanent
      "isActive": true,
      "contractType": "permanent"  // computed field
    },
    {
      "id": 5,
      "name": "Dina Mariana",
      "nik": "EMP-20240315-005",
      "department": "Engineering",
      "position": "Software Engineer",
      "email": "dina.mariana@hris.local",
      "phone": "081298765432",
      "contractEnd": "2026-03-14",
      "isActive": true,
      "contractType": "contract"
    }
  ]
}
```

### GET /api/employees/contract-expiring

**Query Parameters:**
```javascript
{
  days: 30 | 60 | 90  // default: 90
}
```

**Response:**
```javascript
{
  "expiring": [
    {
      "id": 35,
      "name": "Bayu Aji Nugroho",
      "nik": "EMP-20240801-035",
      "contractEnd": "2026-07-31",
      "daysLeft": 25
    }
  ]
}
```

---

**Last Updated**: 6 Juli 2026  
**Version**: 2.0.0  
**Previous Version**: [DUMMY-DATA-IMPROVEMENT.md](DUMMY-DATA-IMPROVEMENT.md)
