# Laporan Pengujian Fungsional (Functional Testing Report)
**Proyek:** Sistem HRIS Terpadu Berbasis Cloud
**Tanggal Pengujian:** 17 Juni 2026
**Lingkungan Pengujian:** Local Environment (Node.js v24.15.0, MySQL 8 via XAMPP)

---

## 1. Tujuan Pengujian
Melakukan validasi terhadap fungsionalitas inti (core features) dari backend sistem HRIS guna memastikan bahwa alur kerja utama seperti Autentikasi, Manajemen Karyawan, Absensi, Cuti, dan Penggajian (Payroll) berjalan dengan baik dan bebas dari *bug*.

## 2. Metodologi Pengujian
Pengujian dilakukan menggunakan pendekatan *Automated API Testing* dengan skrip Node.js kustom yang mensimulasikan pemanggilan endpoint REST API langsung ke backend server. Skenario diurutkan menyerupai *user journey* di dunia nyata.

---

## 3. Ringkasan Hasil Pengujian (Test Results)

Dari total **19 Skenario Pengujian** yang dijalankan, **100% (19/19)** dinyatakan **LULUS (PASS)** setelah dilakukannya perbaikan minor pada sisi backend dan skema database.

### Modul Core & Karyawan
| No | Skenario Pengujian | Endpoint | Status |
|----|--------------------|----------|--------|
| 1 | Pengecekan status server API (Health Check) | `GET /health` | ✅ PASS |
| 2 | Login dengan kredensial Admin | `POST /auth/login` | ✅ PASS |
| 3 | Pendaftaran/Registrasi karyawan baru | `POST /auth/register` | ✅ PASS |
| 4 | Mendapatkan profil karyawan yang sedang login | `GET /auth/me` | ✅ PASS |
| 5 | Melakukan absen masuk (Clock In) | `POST /attendance/clockin` | ✅ PASS |
| 6 | Melakukan absen masuk ganda di hari yang sama (Validasi negatif) | `POST /attendance/clockin` | ✅ PASS |
| 7 | Melakukan absen keluar (Clock Out) | `POST /attendance/clockout` | ✅ PASS |
| 8 | Mengajukan cuti tahunan (Leave Request) | `POST /leave` | ✅ PASS |
| 9 | Memproses *approval* cuti oleh Admin/HRD | `PUT /leave/approve` | ✅ PASS |
| 10 | Melihat riwayat cuti karyawan | `GET /leave/my` | ✅ PASS |
| 11 | Validasi perubahan status cuti menjadi *Approved* | `GET /leave/my` | ✅ PASS |

### Modul Payroll (Penggajian)
| No | Skenario Pengujian | Endpoint | Status |
|----|--------------------|----------|--------|
| 12 | Menambahkan profil gaji (Salary Profile) dan rekening bank | `POST /salary-profiles` | ✅ PASS |
| 13 | Melakukan *generate payroll run* bulanan | `POST /payroll/runs/generate` | ✅ PASS |
| 14 | Mendapatkan daftar *payroll run* yang aktif | `GET /payroll/runs` | ✅ PASS |
| 15 | Memverifikasi ketersediaan *payroll run* yang baru digenerate | `GET /payroll/runs` | ✅ PASS |
| 16 | Melakukan review terhadap *payroll run* (Validasi) | `POST /payroll/runs/:id/review` | ✅ PASS |
| 17 | Melakukan *approval payroll run* oleh Finance | `POST /payroll/runs/:id/approve` | ✅ PASS |
| 18 | Melihat riwayat gaji (My Payroll) untuk karyawan terkait | `GET /payroll/my-runs` | ✅ PASS |
| 19 | Validasi status *payroll* pada sisi karyawan menjadi *Approved* | `GET /payroll/my-runs` | ✅ PASS |

---

## 4. Temuan Bug & Perbaikan (Issue Log)

Selama pengujian, ditemukan beberapa *bug* (error) yang berhasil diidentifikasi dan **langsung diperbaiki**:

### Bug 1: Error 500 saat Approval Cuti
- **Masalah:** Saat atasan/Admin melakukan *approve* pengajuan cuti, server mengembalikan status HTTP 500 (Internal Server Error) dan alur *approval* gagal.
- **Penyebab:** Fungsi *approval* berusaha mencatat aktivitas ke tabel `notifications`, tetapi tabel tersebut tidak otomatis terbuat ketika inisialisasi database dijalankan (`npm run db:setup`).
- **Tindakan Perbaikan:** Menambahkan sintaks `CREATE TABLE notifications` ke dalam file `backend/schema.sql` agar saat *setup* ulang database, tabel notifikasi juga terbuat dengan baik.
- **Status:** **Terselesaikan**

### Bug 2: Error Validasi saat Review Payroll
- **Masalah:** Proses *Review Payroll Run* gagal dan menghasilkan *Error 400 Bad Request* karena alasan validasi (misal: "Profil gaji belum diset untuk Karyawan X").
- **Penyebab:** Pada file `server.js`, fungsi generate payroll memanggil *query* `SELECT id FROM employees ORDER BY id` yang mengambil **semua** data karyawan (termasuk karyawan yang sudah tidak aktif/dihapus atau karyawan testing) tanpa pandang bulu. Hal ini menyebabkan error jika karyawan-karyawan tersebut tidak lengkap datanya.
- **Tindakan Perbaikan:** Mengubah query tersebut dengan menambahkan kondisi menjadi `SELECT id FROM employees WHERE is_active = 1 ORDER BY id`, agar sistem penggajian secara pintar mengabaikan karyawan yang tidak aktif.
- **Status:** **Terselesaikan**

---

## 5. Kesimpulan
Aplikasi Backend (REST API) untuk HRIS sudah dapat menjalankan *Critical Happy Path* dengan lancar. Proses esensial mulai dari absen karyawan, pengajuan cuti, hingga siklus penuh penggajian (mulai dari setup, generate, review, sampai approve) bekerja secara akurat sesuai dengan desain sistem.

Disarankan untuk selanjutnya dapat merambah ke pengujian performa UI/Frontend agar sinkron dengan kemantapan data di *backend*.
