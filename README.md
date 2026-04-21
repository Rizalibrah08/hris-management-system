# Workmate - HR Management System

Workmate adalah aplikasi HRIS (Human Resource Information System) modern yang dirancang untuk membantu karyawan mengelola perjalanan kerja mereka dengan lebih efisien dan mudah.

## 🚀 Fitur Utama (Saat Ini)

### Frontend (Mobile App)
- **Onboarding Experience**: Perkenalan fitur aplikasi melalui slide interaktif yang informatif.
- **Sistem Autentikasi**:
    - **Sign In**: Mendukung login melalui Email, Employee ID, atau nomor telepon.
    - **Sign Up**: Pendaftaran akun baru dengan validasi Company ID dan integrasi Syarat & Ketentuan.
    - **Verifikasi Email**: Sistem verifikasi menggunakan kode OTP (One-Time Password) setelah pendaftaran.
- **UI/UX Modern**: Desain bersih menggunakan skema warna ungu (Lavender/Violet) dengan navigasi yang intuitif.
- **Attendance Module**: 
    - **Dashboard Kehadiran**: Pemantauan jam kerja terintegrasi dan daftar riwayat aktivitas presensi karyawan.
    - **Selfie Verification**: Integrasi kamera depan (`expo-camera`) untuk memvalidasi absensi lengkap dengan *Geo-location* (Lat/Long) dan *Timestamp*.
    - **State Management Dinamis**: Status UI interaktif sesuai kondisi harian (*Clock In Now* → *Clock Out* → *Clocked Out*).
    - **Attendance Details**: Rekap detail laporan jam kerja secara spesifik pada masing-masing hari dan tersedianya aksi simulasi *Export As PDF*.
- **Profile & Payroll Module**:
    - **User Profile**: Layar profil karyawan modern yang menyediakan manajemen pengaturan dan navigasi akun.
    - **Payroll & Tax Management**: Daftar rekapitulasi gaji bulanan yang menyajikan *Total Hours*, *Received Amount*, dan parameter pajak.
    - **Payroll Details/Slip**: Dokumen rinci spesifikasi penggajian (Basic Salary, Reimbursement, Overtime, Tax, dll) disertai integrasi cetak/pdf.
- **Expense Summary Module**:
    - Menu bawaan yang terpasang pada navigasi bawah untuk melihat rincian klaim (*Review*, *Approved*, *Rejected*). Mendukung transisi UX mulus dan *Empty State*.
- **Global UX Improvements**: 
    - **Interactive & Dismissible Modals**: Penggunaan ekstensif *Slide-up Modal bottom-sheets* interaktif. Seluruh modal mendukung gestur "ketuk-di-luar" (*click-outside-to-dismiss*) untuk otomatis kembali/keluar, memblokir propagasi klik internal yang tak disengaja.
    - Optimasi *Top Padding* layar di bawah Status Bar (*Notch*) untuk memastikan komponen selalu rekat nyaman secara *cross-platform*.

### Backend (Server)
- **Framework**: Express.js (Node.js).
- **Database**: SQLite (untuk pengembangan lokal yang ringan).
- **ORM**: Prisma untuk manajemen skema database yang type-safe.

## 🛠️ Tech Stack

### Frontend
- **React Native** (Expo SDK 54)
- **React Navigation** (Native Stack / Bottom Tabs)
- **Expo Camera** (Akses sensor perangkat keras)
- **Expo Linear Gradient** (Efek visual gradasi)
- **Vector Icons** (Ionicons)

### Backend
- **Node.js**
- **Express.js**
- **Prisma ORM**
- **SQLite**

## 📂 Struktur Proyek

```text
workmate-hr-app/
├── frontend/           # Aplikasi React Native (Expo)
│   ├── assets/         # Gambar dan icon
│   ├── screens/        # Layar aplikasi (Onboarding, SignUp, dll)
│   └── App.js          # Entry point & navigasi frontend
├── backend/            # Server API (Express.js)
│   ├── prisma/         # Skema database & migrasi
│   └── server.js       # Entry point backend
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
