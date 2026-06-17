# 4. Panduan Menjalankan Aplikasi (Deployment Guide)

### Persyaratan Sistem (Prerequisites)
1. Node.js versi 18 atau lebih baru.
2. XAMPP (untuk service MySQL). Tersedia konfigurasi *root* user dengan password kosong atau sesuai *environment variable*.

### Langkah-langkah
1. **Konfigurasi Database**
   - Jalankan MySQL server via XAMPP Control Panel atau menggunakan `mysql_start.bat`.
   - Jalankan *setup script* awal: `npm run db:setup`. Script ini secara otomatis mengimpor tabel-tabel, master data (departemen, posisi, komponen payroll), dan user default.
2. **Konfigurasi Environment Variable**
   - Pastikan file `.env` berada pada akar folder (root) proyek dan berisikan pengaturan *PORT, DB_HOST, DB_USER, DB_NAME, DB_PASSWORD, JWT_SECRET*.
3. **Menjalankan Server Backend**
   - Eksekusi perintah: `npm run start:server`
   - API Server akan berjalan pada `http://localhost:5000`
4. **Menjalankan Klien Frontend**
   - Buka tab terminal baru, jalankan: `npm run dev`
   - Frontend Server akan berjalan dan dapat diakses pada *browser* via Vite local port (biasanya `http://localhost:5173`).

## Daftar Akses Default (Seed Data)
Secara otomatis setelah `npm run db:setup`, aplikasi dilengkapi dengan beberapa pengguna percobaan untuk setiap *role*:
- **Admin**: `ADM001`
- **HRD**: `HRD001`
- **Finance**: `FIN001`
- **Manager**: `MGR001`
*(Catatan: Semua password default untuk akun seed adalah `admin123`)*.
