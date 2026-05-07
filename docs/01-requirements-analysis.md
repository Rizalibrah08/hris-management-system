# Analisis Kebutuhan Sistem HRIS
*(Human Resource Information System)*

---

## A. KEBUTUHAN FUNGSIONAL

---

### A.1 Autentikasi & Otorisasi

---

#### Tabel 1. Analisis Kebutuhan Fungsional "Mengelola Hak Akses & Login"

| **Nama Fungsi** | Mengelola Hak Akses & Login |
|---|---|
| **Stakeholder** | Super Admin, HRD, Finance, Manajer, Karyawan |
| **Deskripsi** | Fungsi untuk memvalidasi identitas pengguna agar dapat masuk ke dalam sistem sesuai dengan hak akses yang dimiliki. |
| **Kondisi Awal** | Pengguna berada di halaman Login dan belum masuk ke dalam sistem. |

**Alur Normal:**

| No | Aksi Stakeholder | Respon Sistem |
|----|------------------|---------------|
| 1 | Pengguna memasukkan NIK dan Password, lalu klik tombol **Login**. | Sistem memvalidasi kredensial terhadap data di tabel `users`. |
| 2 | — | Jika valid, sistem menghasilkan token JWT dan mengarahkan pengguna ke dashboard sesuai peran (Role). |
| 2a | *(Alternatif)* Pengguna memasukkan kredensial yang salah. | Sistem menampilkan pesan kesalahan "NIK atau Password salah" dan tetap berada di halaman Login. |

| **Kondisi Akhir** | Pengguna berhasil masuk ke aplikasi HRIS (web atau mobile) dan sistem menampilkan dashboard yang sesuai dengan peran pengguna. |

---

#### Tabel 2. Analisis Kebutuhan Fungsional "Registrasi Mandiri"

| **Nama Fungsi** | Registrasi Mandiri |
|---|---|
| **Stakeholder** | Karyawan (pengguna baru) |
| **Deskripsi** | Fungsi bagi calon pengguna untuk mendaftarkan akun secara mandiri melalui aplikasi mobile. |
| **Kondisi Awal** | Calon pengguna berada di halaman Register pada aplikasi mobile dan belum memiliki akun. |

**Alur Normal:**

| No | Aksi Stakeholder | Respon Sistem |
|----|------------------|---------------|
| 1 | Calon pengguna mengisi formulir: NIK, nama lengkap, email, nomor telepon, dan password. | Sistem memvalidasi kelengkapan data dan memeriksa apakah NIK sudah terdaftar. |
| 2 | Calon pengguna klik **Daftar**. | Sistem membuat data karyawan baru di tabel `employees` dan akun pengguna baru di tabel `users` dengan peran **Employee**. |
| 3 | — | Sistem mengarahkan ke halaman Login dengan pesan sukses. |

| **Kondisi Akhir** | Akun karyawan berhasil dibuat dan siap digunakan untuk login ke aplikasi mobile. |

---

### A.2 Manajemen Karyawan

---

#### Tabel 3. Analisis Kebutuhan Fungsional "Mengelola Data Karyawan"

| **Nama Fungsi** | Mengelola Data Karyawan |
|---|---|
| **Stakeholder** | Super Admin, HRD |
| **Deskripsi** | Fungsi untuk menambah, melihat, mengubah, dan menghapus data karyawan (CRUD) melalui web dashboard. |
| **Kondisi Awal** | Pengguna berperan HRD atau Super Admin, sudah login, dan berada di halaman **Karyawan**. |

**Alur Normal:**

| No | Aksi Stakeholder | Respon Sistem |
|----|------------------|---------------|
| 1 | Pengguna membuka halaman Karyawan. | Sistem menampilkan daftar seluruh karyawan dalam bentuk tabel (NIK, nama, departemen, jabatan, status kontrak). |
| 2 | ***(Tambah)*** Pengguna klik **Tambah Karyawan**, mengisi formulir data karyawan, lalu klik **Simpan**. | Sistem memvalidasi data, menyimpan ke tabel `employees`, dan menampilkannya di daftar. |
| 3 | ***(Edit)*** Pengguna klik **Edit** pada salah satu karyawan, mengubah data, lalu klik **Simpan**. | Sistem memvalidasi perubahan dan memperbarui data di tabel `employees`. |
| 4 | ***(Hapus)*** Pengguna klik **Hapus** pada salah satu karyawan dan mengonfirmasi penghapusan. | Sistem memeriksa apakah karyawan memiliki data terkait (user, absensi, cuti), lalu menghapus data dari `employees` jika aman. |

| **Kondisi Akhir** | Data karyawan berhasil dikelola sesuai aksi yang dipilih oleh pengguna. |

---

#### Tabel 4. Analisis Kebutuhan Fungsional "Memperbarui Profil Pribadi"

| **Nama Fungsi** | Memperbarui Profil Pribadi |
|---|---|
| **Stakeholder** | Semua pengguna (termasuk Karyawan melalui aplikasi mobile) |
| **Deskripsi** | Fungsi bagi pengguna untuk mengubah data pribadinya sendiri, termasuk alamat email, nomor telepon, dan foto profil. |
| **Kondisi Awal** | Pengguna sudah login dan berada di halaman **Profil** (web) atau **Profile** (mobile). |

**Alur Normal:**

| No | Aksi Stakeholder | Respon Sistem |
|----|------------------|---------------|
| 1 | Pengguna membuka halaman Profil. | Sistem menampilkan data pribadi pengguna saat ini (nama, NIK, email, telepon, foto). |
| 2 | Pengguna mengubah data (email/telepon) atau mengunggah foto profil baru. | Sistem memvalidasi format data (email valid, nomor telepon numerik). |
| 3 | Pengguna klik **Simpan**. | Sistem menyimpan perubahan ke tabel `employees` dan menampilkan pesan sukses. |

| **Kondisi Akhir** | Data profil pengguna berhasil diperbarui dan ditampilkan di halaman Profil. |

---

### A.3 Presensi (Kehadiran)

---

#### Tabel 5. Analisis Kebutuhan Fungsional "Melakukan Presensi Masuk (Clock In)"

| **Nama Fungsi** | Melakukan Presensi Masuk (Clock In) |
|---|---|
| **Stakeholder** | Karyawan |
| **Deskripsi** | Fungsi bagi karyawan untuk melakukan absensi masuk kerja melalui aplikasi mobile, dilengkapi dengan verifikasi lokasi GPS dan foto selfie sebagai bukti kehadiran. |
| **Kondisi Awal** | Karyawan sudah login di aplikasi mobile, berada di halaman Attendance, dan belum melakukan Clock In pada hari tersebut. |

**Alur Normal:**

| No | Aksi Stakeholder | Respon Sistem |
|----|------------------|---------------|
| 1 | Karyawan menekan tombol **Clock In**. | Aplikasi mengambil koordinat GPS perangkat dan membuka kamera untuk foto selfie. |
| 2 | Karyawan mengambil foto selfie dan mengonfirmasi pengiriman. | Sistem memvalidasi apakah koordinat GPS berada dalam radius yang diizinkan dari titik koordinat kantor (geofence). |
| 3 | — | Jika valid, sistem menyimpan data presensi (waktu masuk, koordinat, foto) ke tabel `attendance`. |
| 3a | *(Alternatif)* Lokasi GPS di luar radius kantor. | Sistem menolak Clock In dan menampilkan pesan "Anda berada di luar area kantor". |

| **Kondisi Akhir** | Data presensi masuk tersimpan dan status kehadiran hari ini tercatat. |

---

#### Tabel 6. Analisis Kebutuhan Fungsional "Melakukan Presensi Pulang (Clock Out)"

| **Nama Fungsi** | Melakukan Presensi Pulang (Clock Out) |
|---|---|
| **Stakeholder** | Karyawan |
| **Deskripsi** | Fungsi bagi karyawan untuk melakukan absensi pulang kerja melalui aplikasi mobile, dilengkapi verifikasi lokasi GPS. |
| **Kondisi Awal** | Karyawan sudah login, sudah melakukan Clock In pada hari tersebut, dan berada di halaman Attendance. |

**Alur Normal:**

| No | Aksi Stakeholder | Respon Sistem |
|----|------------------|---------------|
| 1 | Karyawan menekan tombol **Clock Out**. | Aplikasi mengambil koordinat GPS perangkat. |
| 2 | Karyawan mengonfirmasi Clock Out. | Sistem memvalidasi lokasi GPS terhadap radius kantor. Jika valid, menyimpan data presensi pulang ke tabel `attendance` (waktu pulang, koordinat). |
| 2a | *(Alternatif)* Lokasi GPS di luar radius kantor. | Sistem menolak Clock Out dan menampilkan pesan "Anda berada di luar area kantor". |

| **Kondisi Akhir** | Data presensi pulang tersimpan dan riwayat kehadiran hari ini lengkap. |

---

#### Tabel 7. Analisis Kebutuhan Fungsional "Melihat Riwayat Presensi Pribadi"

| **Nama Fungsi** | Melihat Riwayat Presensi Pribadi |
|---|---|
| **Stakeholder** | Karyawan |
| **Deskripsi** | Fungsi bagi karyawan untuk melihat rekapitulasi kehadiran pribadi dalam periode tertentu. |
| **Kondisi Awal** | Karyawan sudah login di aplikasi mobile dan berada di halaman Attendance. |

**Alur Normal:**

| No | Aksi Stakeholder | Respon Sistem |
|----|------------------|---------------|
| 1 | Karyawan membuka halaman Riwayat Presensi dan dapat memilih filter bulan. | Sistem menampilkan daftar presensi pribadi (tanggal, jam masuk, jam pulang, status, koordinat, foto selfie). |

| **Kondisi Akhir** | Riwayat presensi pribadi ditampilkan sesuai periode yang dipilih. |

---

#### Tabel 8. Analisis Kebutuhan Fungsional "Memonitor Presensi Harian"

| **Nama Fungsi** | Memonitor Presensi Harian |
|---|---|
| **Stakeholder** | Super Admin, HRD |
| **Deskripsi** | Fungsi bagi HRD dan Super Admin untuk memantau kehadiran seluruh karyawan pada hari berjalan melalui web dashboard. |
| **Kondisi Awal** | Pengguna berperan HRD atau Super Admin, sudah login, dan berada di halaman **Absensi**. |

**Alur Normal:**

| No | Aksi Stakeholder | Respon Sistem |
|----|------------------|---------------|
| 1 | Pengguna membuka halaman Absensi. | Sistem menampilkan daftar seluruh karyawan beserta status presensi hari ini (Sudah Clock In, Sudah Clock Out, Belum Absen, Terlambat, Diluar Area). |

| **Kondisi Akhir** | Status kehadiran seluruh karyawan pada hari berjalan ditampilkan. |

---

### A.4 Cuti

---

#### Tabel 9. Analisis Kebutuhan Fungsional "Mengajukan Cuti"

| **Nama Fungsi** | Mengajukan Cuti |
|---|---|
| **Stakeholder** | Karyawan |
| **Deskripsi** | Fungsi bagi karyawan untuk mengajukan permohonan cuti melalui aplikasi mobile dengan memilih jenis cuti, tanggal, dan menyertakan alasan. |
| **Kondisi Awal** | Karyawan sudah login di aplikasi mobile dan berada di halaman Leave. |

**Alur Normal:**

| No | Aksi Stakeholder | Respon Sistem |
|----|------------------|---------------|
| 1 | Karyawan menekan tombol **Ajukan Cuti**. | Sistem menampilkan formulir pengajuan cuti (jenis cuti, tanggal mulai, tanggal selesai, alasan). |
| 2 | Karyawan memilih jenis cuti, mengisi tanggal dan alasan, lalu klik **Submit**. | Sistem memvalidasi kuota cuti yang tersedia untuk jenis cuti tersebut. |
| 3 | — | Jika kuota mencukupi, sistem menyimpan pengajuan ke tabel `leave_request` dengan status **Pending** dan mengirim notifikasi ke Manajer/HRD. |
| 3a | *(Alternatif)* Kuota cuti tidak mencukupi. | Sistem menolak pengajuan dan menampilkan pesan "Kuota cuti tidak mencukupi". |

| **Kondisi Akhir** | Pengajuan cuti tersimpan dengan status Pending dan notifikasi terkirim ke pihak yang berwenang menyetujui. |

---

#### Tabel 10. Analisis Kebutuhan Fungsional "Menyetujui / Menolak Cuti"

| **Nama Fungsi** | Menyetujui / Menolak Cuti |
|---|---|
| **Stakeholder** | Manajer, HRD, Super Admin |
| **Deskripsi** | Fungsi bagi atasan atau HRD untuk menyetujui (Approve) atau menolak (Reject) pengajuan cuti karyawan melalui web dashboard. |
| **Kondisi Awal** | Pengguna berperan Manajer, HRD, atau Super Admin, sudah login, dan berada di halaman **Cuti**. |

**Alur Normal:**

| No | Aksi Stakeholder | Respon Sistem |
|----|------------------|---------------|
| 1 | Pengguna membuka halaman Cuti dan melihat daftar pengajuan cuti yang berstatus Pending. | Sistem menampilkan daftar pengajuan cuti (nama karyawan, jenis cuti, tanggal, alasan, status). |
| 2 | Pengguna klik **Approve** atau **Reject** pada salah satu pengajuan. | Sistem memproses perubahan status: jika **Approve**, sistem mengurangi kuota cuti karyawan; jika **Reject**, kuota tetap. |
| 3 | — | Sistem menyimpan perubahan status, mencatat persetujuan di `leave_request`, dan mengirim notifikasi ke karyawan terkait. |

| **Kondisi Akhir** | Status cuti berubah menjadi Approved atau Rejected, kuota cuti diperbarui (jika disetujui), dan notifikasi terkirim ke karyawan. |

---

#### Tabel 11. Analisis Kebutuhan Fungsional "Melihat Kuota & Riwayat Cuti"

| **Nama Fungsi** | Melihat Kuota & Riwayat Cuti |
|---|---|
| **Stakeholder** | Karyawan (pribadi), HRD, Manajer, Super Admin, Finance (semua cuti) |
| **Deskripsi** | Fungsi untuk melihat sisa kuota cuti per jenis cuti dan riwayat pengajuan cuti. |
| **Kondisi Awal** | Pengguna sudah login. Karyawan di aplikasi mobile; HRD/Manajer/Super Admin di web dashboard. |

**Alur Normal:**

| No | Aksi Stakeholder | Respon Sistem |
|----|------------------|---------------|
| 1 | Karyawan membuka halaman Kuota Cuti. | Sistem menampilkan kuota cuti per jenis (total kuota, terpakai, sisa). |
| 2 | Karyawan membuka halaman Riwayat Cuti. | Sistem menampilkan daftar pengajuan cuti pribadi (tanggal ajuan, jenis, status, tanggal disetujui/ditolak). |
| 3 | HRD/Manajer membuka halaman Cuti di web dashboard. | Sistem menampilkan seluruh pengajuan cuti dari semua karyawan dengan filter status (Pending/Approved/Rejected). |

| **Kondisi Akhir** | Informasi kuota dan riwayat cuti ditampilkan sesuai hak akses pengguna. |

---

### A.5 Payroll (Penggajian)

---

#### Tabel 12. Analisis Kebutuhan Fungsional "Mengelola Komponen Gaji"

| **Nama Fungsi** | Mengelola Komponen Gaji |
|---|---|
| **Stakeholder** | Super Admin, HRD |
| **Deskripsi** | Fungsi untuk menambah, mengubah, dan menonaktifkan komponen gaji (tunjangan dan potongan) yang digunakan dalam perhitungan payroll. |
| **Kondisi Awal** | Pengguna berperan HRD atau Super Admin, sudah login, dan berada di halaman **Komponen Gaji** di modul Payroll. |

**Alur Normal:**

| No | Aksi Stakeholder | Respon Sistem |
|----|------------------|---------------|
| 1 | Pengguna membuka halaman Komponen Gaji. | Sistem menampilkan daftar komponen gaji (kode, nama, tipe: earning/deduction, taxable, aktif/tidak). |
| 2 | ***(Tambah)*** Pengguna klik **Tambah**, mengisi kode, nama, tipe (earning/deduction), taxable, lalu **Simpan**. | Sistem memvalidasi data dan menyimpan komponen baru ke tabel `payroll_components`. |
| 3 | ***(Edit)*** Pengguna klik **Edit**, mengubah data komponen, lalu **Simpan**. | Sistem memperbarui data komponen di `payroll_components`. |
| 4 | ***(Nonaktifkan)*** Pengguna klik **Hapus** pada komponen. | Sistem melakukan soft-delete (menandai `active = 0`) agar komponen tidak muncul di perhitungan baru, tetapi tetap tersimpan untuk keperluan audit. |

| **Kondisi Akhir** | Daftar komponen gaji diperbarui sesuai perubahan. |

---

#### Tabel 13. Analisis Kebutuhan Fungsional "Mengelola Profil Gaji Karyawan"

| **Nama Fungsi** | Mengelola Profil Gaji Karyawan |
|---|---|
| **Stakeholder** | Super Admin, HRD, Finance |
| **Deskripsi** | Fungsi untuk mengatur gaji pokok, komponen gaji (nilai/persen), dan metode pembayaran untuk setiap karyawan. |
| **Kondisi Awal** | Pengguna berperan HRD, Finance, atau Super Admin, sudah login, dan berada di halaman **Profil Gaji**. |

**Alur Normal:**

| No | Aksi Stakeholder | Respon Sistem |
|----|------------------|---------------|
| 1 | Pengguna membuka halaman Profil Gaji. | Sistem menampilkan daftar karyawan beserta informasi profil gaji (gaji pokok, jumlah komponen). |
| 2 | Pengguna memilih salah satu karyawan. | Sistem menampilkan detail profil gaji: gaji pokok, daftar komponen gaji dengan nilai nominal/persen, dan metode pembayaran. |
| 3 | Pengguna menambah, mengubah, atau menghapus komponen nilai gaji untuk karyawan tersebut, lalu klik **Simpan**. | Sistem menyimpan perubahan ke tabel `employee_salary_profiles` dan `employee_salary_component_values`. |
| 4 | Pengguna mengisi data pembayaran (metode: transfer/cash, nama bank, nomor rekening). | Sistem menyimpan data pembayaran ke profil gaji karyawan. |

| **Kondisi Akhir** | Profil gaji karyawan tersimpan dan siap digunakan untuk perhitungan payroll berikutnya. |

---

#### Tabel 14. Analisis Kebutuhan Fungsional "Menjalankan Payroll"

| **Nama Fungsi** | Menjalankan Payroll (Generate → Review → Approve → Finalize) |
|---|---|
| **Stakeholder** | Super Admin, HRD (Generate & Review), Finance (Approve & Finalize) |
| **Deskripsi** | Fungsi untuk memproses penggajian secara periodik melalui alur kerja (workflow) empat tahap yang melibatkan HRD dan Finance. |
| **Kondisi Awal** | Pengguna berperan HRD atau Finance, sudah login, dan berada di modul **Payroll**. |

**Alur Normal:**

| No | Aksi Stakeholder | Respon Sistem |
|----|------------------|---------------|
| 1 | ***(Generate)*** HRD memilih periode penggajian (bulan/tahun) dan klik **Generate Payroll**. | Sistem menghitung gaji seluruh karyawan berdasarkan profil gaji dan komponen gaji, menghasilkan `payroll_run`, `payroll_run_items`, dan `payroll_run_item_components`. Status payroll: **Draft**. |
| 2 | ***(Review)*** HRD meninjau hasil perhitungan untuk setiap karyawan. Jika sesuai, klik **Submit for Review**. | Sistem mengubah status menjadi **Reviewed**. Jika ditemukan anomali, sistem menampilkan peringatan (validasi). |
| 3 | ***(Approve)*** Finance meninjau payroll run yang sudah direview. Jika disetujui, klik **Approve**. | Sistem mengubah status menjadi **Approved** dan mencatat persetujuan di `payroll_approvals`. |
| 4 | ***(Finalize)*** Finance melakukan finalisasi dengan klik **Finalize**. | Sistem mengubah status menjadi **Finalized**, mengunci data payroll agar tidak dapat diubah, dan mencatat seluruh aktivitas di `payroll_audit_logs`. |
| 5 | *(Alternatif)* Jika pada tahap mana pun ditemukan kesalahan, pengguna dapat klik **Reject**. | Sistem mengembalikan status ke **Draft** agar dapat diperbaiki dan di-generate ulang. |

| **Kondisi Akhir** | Payroll run berstatus Finalized, data terkunci, dan siap untuk penerbitan slip gaji. |

---

#### Tabel 15. Analisis Kebutuhan Fungsional "Melihat Slip Gaji Pribadi"

| **Nama Fungsi** | Melihat Slip Gaji Pribadi |
|---|---|
| **Stakeholder** | Karyawan (pribadi), HRD, Finance, Super Admin (semua slip) |
| **Deskripsi** | Fungsi bagi karyawan untuk melihat slip gaji per periode penggajian melalui aplikasi mobile, dan bagi HRD/Finance untuk melihat semua slip gaji melalui web dashboard. |
| **Kondisi Awal** | Karyawan sudah login di aplikasi mobile (halaman Payroll); HRD/Finance sudah login di web dashboard (halaman Slip Gaji). |

**Alur Normal:**

| No | Aksi Stakeholder | Respon Sistem |
|----|------------------|---------------|
| 1 | Karyawan membuka halaman Payroll dan memilih periode. | Sistem menampilkan ringkasan gaji untuk periode tersebut. |
| 2 | Karyawan klik salah satu periode untuk melihat detail. | Sistem menampilkan rincian slip gaji (gaji pokok, tunjangan, potongan, total diterima) lengkap dengan komponen perhitungan. |
| 3 | HRD/Finance membuka halaman Slip Gaji di web, memilih periode dan karyawan. | Sistem menampilkan slip gaji karyawan yang dipilih. |

| **Kondisi Akhir** | Slip gaji ditampilkan secara rinci sesuai periode yang dipilih. |

---

#### Tabel 16. Analisis Kebutuhan Fungsional "Melihat Log Audit Payroll"

| **Nama Fungsi** | Melihat Log Audit Payroll |
|---|---|
| **Stakeholder** | Super Admin, HRD, Finance |
| **Deskripsi** | Fungsi untuk melihat jejak audit (audit trail) seluruh aktivitas yang terjadi selama proses payroll, termasuk siapa yang melakukan, kapan, dan perubahan data apa yang terjadi. |
| **Kondisi Awal** | Pengguna berperan HRD, Finance, atau Super Admin, sudah login, dan berada di modul Payroll. |

**Alur Normal:**

| No | Aksi Stakeholder | Respon Sistem |
|----|------------------|---------------|
| 1 | Pengguna membuka halaman Log Audit. | Sistem menampilkan daftar aktivitas (aktor, aksi, timestamp, alamat IP) yang tersimpan di `payroll_audit_logs`. |
| 2 | Pengguna memilih salah satu log untuk melihat detail. | Sistem menampilkan data sebelum dan sesudah perubahan dalam format JSON. |
| 3 | Pengguna dapat memfilter log berdasarkan ID payroll run. | Sistem menampilkan log audit untuk payroll run tertentu. |

| **Kondisi Akhir** | Jejak audit payroll ditampilkan untuk keperluan penelusuran dan audit. |

---

### A.6 Laporan

---

#### Tabel 17. Analisis Kebutuhan Fungsional "Melihat Dashboard & Laporan Statistik"

| **Nama Fungsi** | Melihat Dashboard & Laporan Statistik |
|---|---|
| **Stakeholder** | Super Admin, HRD, Finance, Manajer |
| **Deskripsi** | Fungsi untuk menampilkan ringkasan statistik organisasi dalam bentuk grafik dan tabel, meliputi jumlah karyawan, presensi, cuti, dan distribusi gaji. |
| **Kondisi Awal** | Pengguna sudah login di web dashboard dan berada di halaman **Dashboard** atau **Laporan**. |

**Alur Normal:**

| No | Aksi Stakeholder | Respon Sistem |
|----|------------------|---------------|
| 1 | Pengguna membuka halaman Dashboard. | Sistem menampilkan ringkasan dalam bentuk kartu (total karyawan, hadir hari ini, cuti pending, total payroll bulan ini) dan grafik tren (kehadiran, payroll bulanan). |
| 2 | Pengguna membuka halaman Laporan, memilih jenis laporan (Distribusi Gaji atau Statistik Cuti). | Sistem menampilkan laporan dalam bentuk grafik batang/pie (Recharts) dan tabel data pendukung. |
| 3 | Karyawan membuka Dashboard di aplikasi mobile. | Sistem menampilkan statistik pribadi (kehadiran bulan ini, sisa cuti, gaji terbaru) dan ringkasan perusahaan (jumlah karyawan). |

| **Kondisi Akhir** | Dashboard dan laporan statistik ditampilkan sesuai dengan data terkini di database. |

---

#### Tabel 18. Analisis Kebutuhan Fungsional "Mengekspor Laporan ke PDF"

| **Nama Fungsi** | Mengekspor Laporan ke PDF |
|---|---|
| **Stakeholder** | Super Admin, HRD, Finance |
| **Deskripsi** | Fungsi untuk mengekspor laporan statistik (distribusi gaji, statistik cuti) dan slip gaji ke dalam format PDF untuk keperluan dokumentasi dan cetak. |
| **Kondisi Awal** | Pengguna sudah login, berada di halaman Laporan atau Slip Gaji, dan laporan/slip sudah ditampilkan. |

**Alur Normal:**

| No | Aksi Stakeholder | Respon Sistem |
|----|------------------|---------------|
| 1 | Pengguna klik tombol **Ekspor PDF**. | Sistem menghasilkan file PDF berisi data laporan atau slip gaji yang sedang ditampilkan. |
| 2 | — | Sistem mengunduh file PDF ke perangkat pengguna. |

| **Kondisi Akhir** | File PDF berhasil diunduh dan siap untuk dicetak atau didistribusikan. |

---

### A.7 Data Referensi (Master Data)

---

#### Tabel 19. Analisis Kebutuhan Fungsional "Mengelola Data Referensi"

| **Nama Fungsi** | Mengelola Data Referensi (Departemen, Jabatan, Jenis Cuti) |
|---|---|
| **Stakeholder** | Super Admin, HRD |
| **Deskripsi** | Fungsi untuk menambah, mengubah, dan menghapus data referensi yang digunakan oleh modul lain, meliputi Departemen, Jabatan, dan Jenis Cuti. |
| **Kondisi Awal** | Pengguna berperan HRD atau Super Admin, sudah login, dan berada di halaman **Data Referensi** (Master Data). |

**Alur Normal:**

| No | Aksi Stakeholder | Respon Sistem |
|----|------------------|---------------|
| 1 | Pengguna membuka halaman Data Referensi dan memilih tab (Departemen / Jabatan / Jenis Cuti). | Sistem menampilkan daftar data referensi sesuai tab yang dipilih. |
| 2 | ***(Tambah)*** Pengguna klik **Tambah**, mengisi nama (dan kode untuk komponen gaji), lalu **Simpan**. | Sistem menyimpan data baru ke tabel terkait (`departments`, `positions`, atau `leave_types`). |
| 3 | ***(Edit)*** Pengguna klik **Edit**, mengubah data, lalu **Simpan**. | Sistem memperbarui data di tabel terkait. |
| 4 | ***(Hapus)*** Pengguna klik **Hapus**. | Sistem memeriksa apakah data referensi masih digunakan oleh data karyawan atau pengajuan cuti. Jika tidak, data dihapus. Jika masih digunakan, sistem menolak dengan pesan peringatan. |

| **Kondisi Akhir** | Data referensi berhasil dikelola dan langsung tersedia untuk digunakan di modul terkait. |

---

### A.8 Manajemen Pengguna & Peran

---

#### Tabel 20. Analisis Kebutuhan Fungsional "Mengelola Akun Pengguna"

| **Nama Fungsi** | Mengelola Akun Pengguna |
|---|---|
| **Stakeholder** | Super Admin |
| **Deskripsi** | Fungsi eksklusif bagi Super Admin untuk membuat, mengubah, dan menonaktifkan akun pengguna, termasuk mengaitkan pengguna dengan data karyawan dan menentukan perannya. |
| **Kondisi Awal** | Super Admin sudah login dan berada di halaman **Manajemen Pengguna**. |

**Alur Normal:**

| No | Aksi Stakeholder | Respon Sistem |
|----|------------------|---------------|
| 1 | Super Admin membuka halaman Manajemen Pengguna. | Sistem menampilkan daftar seluruh pengguna (NIK, nama, peran, status aktif/nonaktif). |
| 2 | ***(Tambah)*** Super Admin klik **Tambah Pengguna**, memilih karyawan, memilih peran (Role), mengisi password awal, lalu **Simpan**. | Sistem membuat akun baru di tabel `users` yang terhubung dengan data karyawan. |
| 3 | ***(Edit)*** Super Admin klik **Edit**, mengubah peran atau status aktif pengguna, lalu **Simpan**. | Sistem memperbarui data pengguna di `users`. |
| 4 | ***(Reset Password)*** Super Admin klik **Reset Password**, memasukkan password baru, lalu **Simpan**. | Sistem meng-hash password baru dan menyimpannya. |
| 5 | Semua pengguna dapat mengubah password sendiri melalui halaman Profil. | Sistem memvalidasi password lama sebelum menyimpan password baru. |

| **Kondisi Akhir** | Akun pengguna berhasil dikelola dan perubahan berlaku segera. |

---

#### Tabel 21. Analisis Kebutuhan Fungsional "Mengelola Peran & Hak Akses"

| **Nama Fungsi** | Mengelola Peran & Hak Akses |
|---|---|
| **Stakeholder** | Super Admin |
| **Deskripsi** | Fungsi eksklusif bagi Super Admin untuk melihat daftar peran (Role) beserta hak akses yang dimiliki setiap peran dalam sistem. |
| **Kondisi Awal** | Super Admin sudah login dan berada di halaman **Manajemen Peran**. |

**Alur Normal:**

| No | Aksi Stakeholder | Respon Sistem |
|----|------------------|---------------|
| 1 | Super Admin membuka halaman Manajemen Peran. | Sistem menampilkan daftar peran (Super Admin, HRD, Finance, Manajer, Karyawan) beserta modul yang dapat diakses oleh masing-masing peran. |

| **Kondisi Akhir** | Informasi peran dan hak akses ditampilkan sebagai referensi bagi Super Admin. |

---

### A.9 Pengaturan Sistem

---

#### Tabel 22. Analisis Kebutuhan Fungsional "Mengelola Pengaturan Perusahaan"

| **Nama Fungsi** | Mengelola Pengaturan Perusahaan |
|---|---|
| **Stakeholder** | Super Admin |
| **Deskripsi** | Fungsi untuk mengatur parameter sistem yang memengaruhi validasi presensi, yaitu koordinat GPS kantor dan radius yang diizinkan untuk Clock In/Out. |
| **Kondisi Awal** | Super Admin sudah login dan berada di halaman **Lokasi Kantor**. |

**Alur Normal:**

| No | Aksi Stakeholder | Respon Sistem |
|----|------------------|---------------|
| 1 | Super Admin membuka halaman Lokasi Kantor. | Sistem menampilkan pengaturan saat ini (koordinat latitude/longitude dan radius dalam meter) beserta peta interaktif (Leaflet). |
| 2 | Super Admin mengubah koordinat (dengan klik di peta) atau mengubah radius, lalu klik **Simpan**. | Sistem menyimpan perubahan ke tabel `company_settings`. |
| 3 | — | Pengaturan baru langsung berlaku untuk validasi presensi selanjutnya. |

| **Kondisi Akhir** | Pengaturan lokasi kantor dan radius berhasil diperbarui. |

---

### A.10 Mobile (Self-Service Karyawan)

---

#### Tabel 23. Analisis Kebutuhan Fungsional "Mengajukan Klaim Biaya (Expense)"

| **Nama Fungsi** | Mengajukan Klaim Biaya (Expense) |
|---|---|
| **Stakeholder** | Karyawan (pengaju), HRD/Finance (peninjau) |
| **Deskripsi** | Fungsi bagi karyawan untuk mengajukan klaim pengeluaran bisnis dengan melampirkan bukti kwitansi. |
| **Kondisi Awal** | Karyawan sudah login di aplikasi mobile dan berada di halaman Expense. |

**Alur Normal:**

| No | Aksi Stakeholder | Respon Sistem |
|----|------------------|---------------|
| 1 | Karyawan menekan tombol **Tambah Klaim**. | Sistem menampilkan formulir klaim (judul, jumlah, kategori, unggah kwitansi). |
| 2 | Karyawan mengisi formulir, mengunggah foto kwitansi, lalu klik **Submit**. | Sistem menyimpan klaim ke tabel `expenses` dengan status **Pending** dan mengirim notifikasi ke HRD/Finance. |
| 3 | HRD/Finance meninjau klaim dan mengubah status menjadi **Review** lalu **Approved** atau **Rejected**. | Sistem memperbarui status klaim dan mengirim notifikasi ke karyawan. |

| **Kondisi Akhir** | Klaim biaya tersimpan dan statusnya berubah sesuai keputusan peninjau. |

---

#### Tabel 24. Analisis Kebutuhan Fungsional "Mengelola Tugas (Task)"

| **Nama Fungsi** | Mengelola Tugas (Task) |
|---|---|
| **Stakeholder** | Karyawan |
| **Deskripsi** | Fungsi bagi karyawan untuk mengelola daftar tugas pribadi dengan status To Do, In Progress, dan Done (model Kanban). |
| **Kondisi Awal** | Karyawan sudah login di aplikasi mobile dan berada di halaman Task. |

**Alur Normal:**

| No | Aksi Stakeholder | Respon Sistem |
|----|------------------|---------------|
| 1 | Karyawan membuka halaman Task. | Sistem menampilkan tugas-tugas pribadi yang dikelompokkan berdasarkan status (To Do, In Progress, Done). |
| 2 | Karyawan klik **Tambah Tugas**, mengisi nama tugas, prioritas, dan tenggat waktu, lalu **Simpan**. | Sistem menyimpan tugas baru ke tabel `tasks` dengan status **To Do**. |
| 3 | Karyawan mengubah status tugas (geser dari To Do → In Progress → Done). | Sistem memperbarui status tugas. |
| 4 | Karyawan menghapus tugas yang sudah selesai. | Sistem menghapus tugas dari `tasks`. |

| **Kondisi Akhir** | Daftar tugas pribadi diperbarui sesuai status terbaru. |

---

#### Tabel 25. Analisis Kebutuhan Fungsional "Melihat Aset Kantor"

| **Nama Fungsi** | Melihat Aset Kantor |
|---|---|
| **Stakeholder** | Karyawan |
| **Deskripsi** | Fungsi bagi karyawan untuk melihat daftar aset kantor yang ditugaskan kepadanya. |
| **Kondisi Awal** | Karyawan sudah login di aplikasi mobile dan berada di halaman Profile atau Assets. |

**Alur Normal:**

| No | Aksi Stakeholder | Respon Sistem |
|----|------------------|---------------|
| 1 | Karyawan membuka halaman Aset Kantor. | Sistem menampilkan daftar aset yang tercatat atas nama karyawan (nama aset, brand, nomor seri, kondisi). |

| **Kondisi Akhir** | Daftar aset kantor yang ditugaskan kepada karyawan ditampilkan. |

---

### A.11 Notifikasi

---

#### Tabel 26. Analisis Kebutuhan Fungsional "Menerima & Mengelola Notifikasi"

| **Nama Fungsi** | Menerima & Mengelola Notifikasi |
|---|---|
| **Stakeholder** | Semua pengguna |
| **Deskripsi** | Fungsi untuk menerima pemberitahuan sistem terkait status cuti, klaim expense, pengumuman HR, dan aktivitas lain yang relevan bagi pengguna. |
| **Kondisi Awal** | Pengguna sudah login di aplikasi (web atau mobile). |

**Alur Normal:**

| No | Aksi Stakeholder | Respon Sistem |
|----|------------------|---------------|
| 1 | Pengguna membuka halaman Notifikasi. | Sistem menampilkan daftar notifikasi (pesan, status sudah/belum dibaca, waktu) yang tersimpan di tabel `notifications`. |
| 2 | Pengguna klik salah satu notifikasi. | Sistem menandai notifikasi sebagai telah dibaca (`read = 1`). |
| 3 | Pengguna klik **Tandai Semua Dibaca**. | Sistem menandai seluruh notifikasi pengguna sebagai telah dibaca. |

| **Kondisi Akhir** | Notifikasi ditampilkan dan status baca diperbarui. |

---

## B. KEBUTUHAN NON-FUNGSIONAL

| No | Kategori | Kebutuhan Non-Fungsional | Keterangan |
|----|----------|--------------------------|------------|
| 1 | **Keamanan** | Autentikasi JWT | Seluruh endpoint API (kecuali login dan register) memerlukan token JWT yang valid dalam header `Authorization`. Token memiliki masa kedaluwarsa dan ditolak jika tidak valid. |
| 2 | **Keamanan** | Role-Based Access Control (RBAC) | Setiap peran (Super Admin, HRD, Finance, Manajer, Karyawan) memiliki hak akses yang terbatas sesuai fungsinya. Karyawan diblokir dari web dashboard oleh middleware `webPortalGuard`. |
| 3 | **Keamanan** | Enkripsi Kata Sandi | Seluruh kata sandi pengguna disimpan dalam bentuk hash menggunakan pustaka bcryptjs. Tidak ada kata sandi yang tersimpan sebagai teks biasa di database. |
| 4 | **Keamanan** | HTTP Security Headers | Menggunakan middleware Helmet untuk mengamankan header HTTP dari serangan XSS (Cross-Site Scripting), clickjacking, MIME sniffing, dan kerentanan header lainnya. |
| 5 | **Keamanan** | Pembatasan Akses Lintas Asal (CORS) | Hanya origin yang telah dikonfigurasi yang diizinkan mengakses API, mencegah permintaan dari domain tidak sah. |
| 6 | **Audit** | Pencatatan Audit Payroll | Seluruh aktivitas payroll (generate, review, approve, finalize, reject) dicatat di tabel `payroll_audit_logs` lengkap dengan data sebelum dan sesudah perubahan dalam format JSON, nama aktor, timestamp, dan alamat IP. |
| 7 | **Audit** | Riwayat Persetujuan Berjenjang | Setiap tahap persetujuan dalam workflow payroll dicatat di tabel `payroll_approvals` dengan tingkatan, status, komentar, dan timestamp yang dapat ditelusuri. |
| 8 | **Validasi** | Verifikasi Geofence (GPS) | Proses Clock In dan Clock Out hanya berhasil jika koordinat GPS perangkat pengguna berada dalam radius yang telah ditentukan dari titik koordinat kantor yang tersimpan di `company_settings`. |
| 9 | **Validasi** | Verifikasi Selfie | Clock In mewajibkan unggahan foto selfie sebagai bukti kehadiran fisik. Foto disimpan di server dan dapat ditinjau oleh HRD. |
| 10 | **Validasi** | Validasi Kuota Cuti | Sistem menolak pengajuan cuti jika sisa kuota untuk jenis cuti yang diajukan tidak mencukupi atau tanggal yang diminta tidak valid (tanggal selesai lebih awal dari tanggal mulai). |
| 11 | **Validasi** | Validasi Referensi Data | Data referensi (departemen, jabatan, jenis cuti) tidak dapat dihapus jika masih digunakan oleh data karyawan atau pengajuan cuti yang aktif. |
| 12 | **Ketersediaan** | Health Check Endpoint | Endpoint `GET /health` tersedia untuk memantau status server (uptime monitoring) tanpa memerlukan autentikasi. |
| 13 | **Ketersediaan** | Penanganan Galat Terstruktur | Setiap kesalahan API mengembalikan respons dalam format JSON dengan kode status HTTP yang sesuai (400, 401, 403, 404, 500) dan pesan galat yang informatif namun aman (tanpa membocorkan detail internal). |
| 14 | **Skalabilitas** | Kontainerisasi Docker | Sistem dikemas dalam tiga profil Docker Compose: `dev` (development), `prod` (production), dan `ghcr` (GitHub Container Registry), memungkinkan skalabilitas horizontal dengan menambah replika kontainer. |
| 15 | **Skalabilitas** | Nginx Reverse Proxy | Pada mode produksi, Nginx bertindak sebagai reverse proxy yang menangani load balancing, serving file statis, dan terminasi SSL. |
| 16 | **Skalabilitas** | MySQL Connection Pooling | Backend menggunakan pool koneksi (`mysql2/promise`) untuk mengelola koneksi database secara efisien pada beban tinggi. |
| 17 | **Portabilitas** | Dukungan Multi-Platform | Sistem terdiri dari dua antarmuka: Web Dashboard (React/Vite) yang dapat diakses melalui browser desktop, dan Aplikasi Mobile (React Native/Expo) yang berjalan di Android dan iOS. Keduanya berbagi backend yang sama. |
| 18 | **Maintainability** | CI/CD Pipeline | GitHub Actions mengotomatiskan proses pengujian (testing), build, pembuatan Docker image, dan deployment ke server produksi saat terjadi push ke branch `main`. |
| 19 | **Maintainability** | Database Auto-Setup | Perintah `npm run db:setup` secara otomatis membuat database, menjalankan seluruh schema (25 tabel), dan mengisi data awal (seed) untuk roles, admin default, departemen, posisi, dan jenis cuti. |
| 20 | **Usability** | Login Sederhana | Pengguna cukup memasukkan NIK dan kata sandi untuk login—tidak memerlukan email atau OTP yang rumit—mempercepat proses autentikasi. |
| 21 | **Usability** | Antarmuka Mobile Intuitif | Aplikasi mobile (Workmate) dirancang dengan navigasi tab bawah (Home, Attendance, Payroll, Leave, Profile) yang memudahkan karyawan mengakses fitur self-service. |
| 22 | **Usability** | Ekspor Laporan PDF | Dashboard, laporan statistik, dan slip gaji dapat diekspor ke format PDF untuk keperluan cetak, dokumentasi, dan distribusi. |
| 23 | **Kinerja** | Query Basis Data Efisien | Backend menggunakan query SQL yang terstruktur dengan parameterized queries untuk mencegah SQL injection dan mengoptimalkan waktu respons. |
| 24 | **Keandalan** | Konfigurasi Berbasis Environment | Konfigurasi sistem (koneksi database, JWT secret, port server) dikelola melalui file `.env` yang memungkinkan deployment di berbagai lingkungan tanpa mengubah kode sumber. |
| 25 | **Interoperabilitas** | RESTful API JSON | Seluruh komunikasi antara frontend dan backend menggunakan REST API dengan format JSON sebagai standar pertukaran data, memungkinkan integrasi dengan sistem eksternal di masa mendatang. |

---

*Dokumen ini disusun berdasarkan hasil analisis terhadap: Use Case Diagram, Entity-Relationship Diagram, implementasi API (server.js), schema database (schema.sql & payroll-schema.sql), dan struktur antarmuka pengguna (web & mobile).*
