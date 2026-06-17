# 2. Modul dan Fitur-fitur Utama

### 2.1. Modul Manajemen Karyawan (Core Employee Management)
- **Registrasi & Data Diri**: Mendata nama, kontak, departemen, posisi pekerjaan, dan *nik*.
- **Role Control**: Pengaturan menu dan hak istimewa berdasarkan *role* di aplikasi.
- **Import Karyawan**: Kemampuan untuk mengimpor massal daftar karyawan via file `.xlsx`.

### 2.2. Modul Kehadiran (Attendance)
- **Clock In / Clock Out**: Karyawan dapat mencatat absensi masuk dan keluar. Terdapat validasi *double clock-in* harian.
- **Riwayat Absensi**: Menampilkan rekap jam kerja, keterlambatan, dan riwayat presensi harian karyawan.

### 2.3. Modul Cuti (Leave Management)
- **Pengajuan Cuti**: Pengajuan tipe cuti (Tahunan, Sakit, Melahirkan, dsb.) beserta rentang tanggal.
- **Approval Cuti**: Atasan / Manajer dapat melakukan penyetujuan (*Approve*) atau penolakan (*Reject*).
- **Notifikasi**: Sistem mengirim *alert* kepada pihak terkait apabila terdapat perubahan status.

### 2.4. Modul Penggajian (Payroll System)
- **Profil Gaji**: Penetapan *base salary*, komponen tambahan, serta rekening bank spesifik tiap karyawan.
- **Generate Payroll Run**: Membuat slip gaji massal (draft) secara dinamis sesuai kehadiran dan komponen gaji bulanan per-karyawan aktif.
- **Siklus Payroll**: Alur status payroll harus memenuhi kriteria hierarki: *Draft -> Reviewed -> Approved -> Finalized*.
- **Slip Gaji**: Karyawan dapat mengunduh atau melihat slip gaji masing-masing pada menu `My Payroll Runs`.

### 2.5. Modul Rekrutmen (Recruitment)
- Pencatatan lowongan pekerjaan (*Job Vacancies*) dan pelamar (*Applicants*).
- Status pelamar (*Applied, Interview, Accepted, Rejected*).

### 2.6. Modul Penugasan (Task Management)
- Pemberian tugas (*Tasks*) ke karyawan tertentu lengkap dengan prioritas (*Low, Medium, High*), tenggat waktu (*Due Date*), dan status pelacakan (*To Do, In Progress, Done*).
