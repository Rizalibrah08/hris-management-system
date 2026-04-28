# Workmate - HR Management System

Workmate adalah aplikasi HRIS (Human Resource Information System) modern yang dirancang untuk membantu karyawan mengelola perjalanan kerja mereka dengan lebih efisien dan mudah.

## 🚀 Fitur Utama (Saat Ini)

### Frontend (Mobile App)

- **Onboarding Experience**: Perkenalan fitur aplikasi melalui slide interaktif yang informatif dengan animasi halus.

- **Sistem Autentikasi**:
    - **Sign In**: Mendukung login melalui Email, Employee ID, atau nomor telepon.
    - **Sign Up**: Pendaftaran akun baru dengan validasi Company ID dan integrasi Syarat & Ketentuan (slide-up modal).
    - **Verifikasi Email**: Sistem verifikasi menggunakan kode OTP (One-Time Password) setelah pendaftaran.
    - **Lupa Password (3-Step Flow)**:
        - **Step 1 – Email Input**: Slide-up modal untuk memasukkan email. Tombol Submit terkunci hingga email terisi.
        - **Step 2 – Kode Verifikasi**: Input 6-digit OTP dengan auto-focus antar kolom dan validasi saat submit.
        - **Step 3 – New Password**: Form input password baru dan konfirmasi password, dilengkapi ikon mata (show/hide) yang tidak menutup keyboard secara tidak sengaja, serta ikon gembok di setiap field.

- **UI/UX Modern**: Desain bersih menggunakan skema warna ungu (Lavender/Violet) dengan navigasi yang intuitif.

- **Attendance Module**:
    - **Dashboard Kehadiran**: Pemantauan jam kerja terintegrasi dan daftar riwayat aktivitas presensi karyawan.
    - **Selfie Verification**: Integrasi kamera depan (`expo-camera`) untuk memvalidasi absensi lengkap dengan *Geo-location* (Lat/Long) dan *Timestamp*.
    - **State Management Dinamis**: Status UI interaktif sesuai kondisi harian (*Clock In Now* → *Clock Out* → *Clocked Out*).
    - **Attendance Details**: Rekap detail laporan jam kerja secara spesifik pada masing-masing hari dan tersedianya aksi simulasi *Export As PDF*.

- **Profile Module**:
    - **User Profile**: Layar profil karyawan modern yang menyediakan manajemen pengaturan dan navigasi akun.
    - **Personal Data**: Tampilan dan pengelolaan data pribadi karyawan.
    - **Office Assets**: Layar daftar aset kantor yang dipinjam karyawan, dapat diakses dari halaman profil.
    - **Payroll & Tax Management**: Daftar rekapitulasi gaji bulanan yang menyajikan *Total Hours*, *Received Amount*, dan parameter pajak.
    - **Payroll Details/Slip**: Dokumen rinci spesifikasi penggajian (Basic Salary, Reimbursement, Overtime, Tax, dll) disertai integrasi cetak/pdf.

- **Expense Summary Module**:
    - Menu bawaan yang terpasang pada navigasi bawah untuk melihat rincian klaim (*Review*, *Approved*, *Rejected*). Mendukung transisi UX mulus dan *Empty State*.

- **Leave Module**:
    - **Leave Screen**: Tampilan daftar pengajuan cuti dengan status (*Pending*, *Approved*, *Rejected*) dan riwayat cuti.
    - **Submit Leave**: Form pengajuan cuti baru dengan slide-up modal interaktif untuk:
        - Pilihan kategori cuti (Annual Leave, Sick Leave, dll).
        - Pemilihan rentang tanggal (*date range*) secara visual.
    - **UX**: Tombol Submit terkunci hingga semua field terisi dengan benar.

- **Task Module** ⭐ *Baru*:
    - **Task Screen**: Halaman utama tugas yang dapat diakses via tombol tengah bottom navigation (tab khusus).
    - **Header Ilustrasi**: Header berwarna ungu dengan ilustrasi clipboard dan bintang dinamis.
    - **Summary of Work**: Kartu ringkasan progres tugas yang menampilkan *To Do*, *In Progress*, dan *Done*.
    - **Burnout Stats Card**: Kartu indikator tingkat burnout karyawan (Good/Warning/Critical) dengan progress bar visual. Dapat diklik untuk membuka halaman detail.
    - **Filter Tugas**: Tab filter (*All*, *In Progress*, *Finish*) untuk menyortir daftar tugas.
    - **Empty State**: Ilustrasi informatif ketika tidak ada tugas untuk hari ini.
    - **Create Task Button**: Tombol *floating* untuk membuat tugas baru.

- **Burnout Stats Screen** ⭐ *Baru*:
    - **Header + Navigasi**: Header dengan judul "Burnout Stats" dan tombol kembali (back button).
    - **Burnout Stats Card**: Status burnout saat ini (badge "Good") dengan emoji dan progress bar hijau.
    - **Working Level Chart**: Visualisasi grafik batang (*bar chart*) riwayat *story point* per Sprint (Sprint 1-5), dengan penyorotan Sprint aktif menggunakan warna ungu.
    - **Working Period Chart**: Visualisasi area/garis (*line area chart*) yang menampilkan rata-rata jam kerja per bulan (May–Sept) dengan titik data dan gradient halus.

- **Global UX Improvements**:
    - **Interactive & Dismissible Modals**: Penggunaan ekstensif *Slide-up Modal bottom-sheets* interaktif. Seluruh modal mendukung gestur "ketuk-di-luar" (*click-outside-to-dismiss*) untuk otomatis kembali/keluar.
    - Optimasi *Top Padding* layar di bawah Status Bar (*Notch*) untuk memastikan komponen selalu rekat nyaman secara *cross-platform*.
    - **SafeAreaView**: Seluruh layar menggunakan `SafeAreaView` dari `react-native-safe-area-context` (bukan dari `react-native`) sesuai rekomendasi terbaru.
    - **Navigation Bar**: Konfigurasi navigasi bar Android dioptimalkan untuk menghindari white space pada layout.

### Backend (Server)
- **Framework**: Express.js (Node.js).
- **Database**: SQLite (untuk pengembangan lokal yang ringan).
- **ORM**: Prisma untuk manajemen skema database yang type-safe.

## 🛠️ Tech Stack

### Frontend
- **React Native** (Expo SDK 54)
- **React Navigation** (Native Stack / Bottom Tabs)
- **react-native-safe-area-context** (Safe area handling)
- **Expo Camera** (Akses sensor perangkat keras)
- **Expo Linear Gradient** (Efek visual gradasi)
- **Expo Navigation Bar** (Kontrol Android navigation bar)
- **Vector Icons** (Ionicons)

### Backend
- **Node.js**
- **Express.js**
- **Prisma ORM**
- **SQLite**

## 📂 Struktur Proyek

```text
workmate-hr-app/
├── frontend/                   # Aplikasi React Native (Expo)
│   ├── assets/                 # Gambar dan icon
│   ├── screens/
│   │   ├── OnboardingScreen.js      # Onboarding + Lupa Password (3-step)
│   │   ├── SignUpScreen.js          # Registrasi akun
│   │   ├── DashboardScreen.js       # Dashboard utama
│   │   ├── AttendanceScreen.js      # Absensi & riwayat
│   │   ├── AttendanceDetailsScreen.js
│   │   ├── CameraScreen.js          # Selfie clock-in
│   │   ├── SubmitClockInScreen.js
│   │   ├── ClockInScreen.js
│   │   ├── ProfileScreen.js         # Profil karyawan
│   │   ├── PersonalDataScreen.js
│   │   ├── OfficeAssetsScreen.js    # Aset kantor
│   │   ├── PayrollTaxScreen.js
│   │   ├── PayrollDetailsScreen.js
│   │   ├── ExpenseScreen.js
│   │   ├── LeaveScreen.js           # Manajemen cuti
│   │   ├── SubmitLeaveScreen.js
│   │   ├── TaskScreen.js            # ⭐ Modul Task (Baru)
│   │   └── BurnoutStatsScreen.js    # ⭐ Detail Burnout Stats (Baru)
│   └── App.js                  # Entry point & navigasi frontend
├── backend/                    # Server API (Express.js)
│   ├── prisma/                 # Skema database & migrasi
│   └── server.js               # Entry point backend
└── README.md
```

## ⚙️ Cara Menjalankan

### 1. Prasyarat
- Node.js terinstall.
- Expo Go di perangkat mobile atau Emulator (Android/iOS).

### 2. Menjalankan Frontend
```bash
cd frontend
npm install
npx expo start
```

> Untuk membersihkan cache bundler jika ada error:
> ```bash
> npx expo start --clear
> ```

### 3. Menjalankan Backend
```bash
cd backend
npm install
npx prisma generate
node server.js
```

## 📝 Catatan Pengembangan
- Backend saat ini sedang dalam tahap inisialisasi struktur dasar.
- Database menggunakan SQLite untuk kemudahan setup tanpa perlu server database eksternal di tahap awal.
- Seluruh data pada modul Task, Burnout Stats, Leave, Attendance, dan Payroll masih menggunakan data statis (*mockup*) — belum terhubung ke API backend.

## 🗺️ Roadmap (Next Steps)
- [ ] Form **Create Task** — layar input untuk membuat tugas baru.
- [ ] Integrasi Task Screen dengan API backend (filter & list tugas nyata).
- [ ] Integrasi Burnout Stats dengan data dinamis dari server.
- [ ] Koneksi modul Leave, Attendance, dan Payroll ke REST API backend.
