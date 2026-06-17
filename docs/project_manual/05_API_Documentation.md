# 5. Dokumentasi API (RESTful Endpoints)

Aplikasi *Backend* mengekspos sejumlah *endpoint* RESTful. Seluruh *endpoint* (kecuali otentikasi awal) mensyaratkan token JWT pada *Header Authorization* (`Bearer <token>`).

## 1. Authentication
| Method | Endpoint | Deskripsi | Parameter/Body Utama |
|--------|----------|-----------|----------------------|
| POST | `/auth/login` | Melakukan otentikasi pengguna | `nik`, `password` |
| POST | `/auth/register`| Mendaftarkan karyawan baru | `nik`, `name`, `password`, `department_id`, `position_id` |
| GET | `/auth/me` | Mengambil data pengguna login | *Header JWT* |

## 2. Kehadiran (Attendance)
| Method | Endpoint | Deskripsi | Parameter/Body Utama |
|--------|----------|-----------|----------------------|
| POST | `/attendance/clockin` | Presensi masuk | `gps_location`, `selfie` |
| POST | `/attendance/clockout` | Presensi keluar | `gps_location` |
| GET | `/attendance/my` | Menarik riwayat presensi | *Header JWT* |

## 3. Cuti & Izin (Leave Management)
| Method | Endpoint | Deskripsi | Parameter/Body Utama |
|--------|----------|-----------|----------------------|
| POST | `/leave` | Mengajukan cuti | `leave_type`, `start_date`, `end_date`, `reason` |
| PUT | `/leave/approve` | Menyetujui/menolak cuti | `leave_id`, `status` (*Approved/Rejected*) |
| GET | `/leave/my` | Riwayat cuti pribadi | *Header JWT* |

## 4. Penggajian (Payroll)
| Method | Endpoint | Deskripsi | Parameter/Body Utama |
|--------|----------|-----------|----------------------|
| POST | `/salary-profiles` | Membuat profil gaji karyawan | `employeeId`, `baseSalary`, `paymentMethod`, `bankName`, dsb. |
| POST | `/payroll/runs/generate`| Memulai draf *payroll* bulanan | `period_month` |
| GET | `/payroll/runs` | Daftar proses *payroll* berjalan | *Header JWT* |
| POST | `/payroll/runs/:id/review`| Melakukan validasi *payroll* | *URL Param: id* |
| POST | `/payroll/runs/:id/approve`| *Approve* (Finalisasi) *payroll* | *URL Param: id* |
| GET | `/payroll/my-runs` | Data *slip* gaji pribadi | *Header JWT* |

## 5. Master Data
| Method | Endpoint | Deskripsi | Parameter/Body Utama |
|--------|----------|-----------|----------------------|
| GET | `/employees` | Menampilkan seluruh karyawan | *Header JWT* |
| GET | `/departments` | Menampilkan data departemen | *Header JWT* |
| GET | `/positions` | Menampilkan data posisi/jabatan | *Header JWT* |
