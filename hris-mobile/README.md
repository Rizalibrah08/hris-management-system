# Workmate — HRIS Mobile App

Aplikasi mobile HRIS (Human Resource Information System) berbasis **React Native (Expo)** untuk karyawan. Terhubung ke backend dari project `hris-web` (port 5000) dan menyediakan absensi selfie + GPS, pengajuan cuti, slip gaji, notifikasi, serta dashboard karyawan.

> Pada layar login app ini ditampilkan dengan judul **"Curated HR"**; package Android: `com.hris.workmate`.

---

## Daftar Isi

- [Fitur Utama](#fitur-utama)
- [Tech Stack](#tech-stack)
- [Struktur Proyek](#struktur-proyek)
- [Konfigurasi Koneksi API](#konfigurasi-koneksi-api)
- [Cara Menjalankan](#cara-menjalankan)
- [Build APK](#build-apk)
- [Catatan Pengembangan](#catatan-pengembangan)
- [Roadmap](#roadmap)

---

## Fitur Utama

### Onboarding
- Slide perkenalan fitur interaktif (4 slide) dengan animasi halus dan tombol skip/get-started (`OnboardingScreen.js`).

### Autentikasi
- **Login NIK + Password** menggantikan alur lama (email/employee ID/telepon, sign up, OTP, dan forgot password telah dihapus).
- Toggle show/hide password, opsi "Simpan login", dan error box inline.
- **Pengaturan Server** (slide-up modal): tampilkan URL aktif, ubah/reset URL backend manual, atau gunakan auto-detect LAN.
- **Sesi Persisten**: token disimpan di AsyncStorage; saat app dibuka kembali, `AuthContext` memanggil `/auth/me` untuk memvalidasi sesi.
- **Auto Logout**: respons `401` dari API otomatis memicu logout (via `setOnUnauthorized`).

### Dashboard (Home Tab)
- Menampilkan data dari endpoint `/dashboard/mobile`: kartu sambutan, info clock-in hari ini, statistik (total karyawan, attendance rate, pending leave), dan aksi cepat.
- Mendukung pull-to-refresh.

### Attendance (Tab)
- Status absensi harian (`my-status`) dengan tombol dinamis *Clock In Now* → *Clock Out* → *Clocked Out*.
- **Selfie Verification**: kamera depan (`expo-camera`) + GPS (`expo-location`) untuk clock-in; upload via multipart form.
- Konfirmasi clock-out melalui modal sukses.
- Riwayat absensi bulanan (`my-history`) dan **Kalender Absensi** per bulan (`AttendanceCalendarScreen.js`) dengan penanda hari kerja.
- Detail absensi per hari + simulasi export PDF (`AttendanceDetailsScreen.js`).

### Leave (Tab)
- Daftar pengajuan cuti dengan status (Pending/Approved/Rejected) dari `/leave/my`.
- **Submit Leave** (`SubmitLeaveScreen.js`): slide-up modal untuk pilih kategori cuti (`/leave-types`), rentang tanggal, dan alasan. Tombol submit terkunci sampai semua field valid.
- Info kuota cuti (`/leave/quota`).

### Payroll (Tab)
- Daftar rekap gaji (`/payroll/my`, `/payroll/my-runs`).
- **Payroll Details/Slip** (`PayrollDetailsScreen.js`): rincian gaji (basic salary, reimbursement, overtime, tax, dll) + aksi cetak/share PDF via `expo-print` & `expo-sharing`.

### Profile (Tab)
- Profil karyawan dari `/employees/me`: nama, jabatan, departemen, email, telepon, dan akhir kontrak.
- **Personal Data** (`PersonalDataScreen.js`): pengelolaan & update data pribadi, termasuk upload foto profil (`/employees/me/photo`, multipart).
- Logout dengan konfirmasi.

### Notifications
- Daftar notifikasi pengguna (`/notifications/my`) dengan refresh, mark read per item, dan mark-all-read (`NotificationScreen.js`).

### UX Global
- **SafeAreaView** dari `react-native-safe-area-context` di seluruh layar (bukan `react-native`).
- **Slide-up Modals** interaktif dengan click-outside-to-dismiss.
- **ErrorBoundary** global + **Toast** untuk notifikasi feedback.
- **React Query** untuk caching & state data API (`QueryClient` dengan retry & staleTime default).
- **Loading screen** "Memulihkan sesi..." saat validasi token di awal.
- Android navigation bar di-*hidden* via `expo-navigation-bar` untuk layout edge-to-edge.

---

## Tech Stack

### Frontend
| Kategori | Teknologi |
|----------|----------|
| Framework | React Native 0.81.5, Expo SDK 54, React 19.1 |
| Navigation | `@react-navigation/native`, `native-stack`, `bottom-tabs` |
| State / Data | `@tanstack/react-query`, Context API (`AuthContext`) |
| Storage | `@react-native-async-storage/async-storage` (token, user, server URL, NIK tersimpan) |
| Kamera & Media | `expo-camera`, `expo-image-picker`, `expo-image-manipulator` |
| Lokasi | `expo-location`, `react-native-maps` |
| Output | `expo-print`, `expo-sharing` (PDF payslip / slip gaji) |
| UI | `expo-linear-gradient`, `@expo/vector-icons` (Ionicons), `react-native-safe-area-context`, `expo-status-bar`, `expo-navigation-bar` |

> Mengaktifkan **New Architecture** (`newArchEnabled: true` di `app.json`).

### Izin Android (`app.json`)
- `CAMERA`
- `ACCESS_FINE_LOCATION`, `ACCESS_COARSE_LOCATION`
- `usesCleartextTraffic: true` (untuk HTTP ke backend lokal/VPS)
- `edgeToEdgeEnabled: true`

### Backend
- Tidak ada di repo ini. Dipakai dari project `hris-web` (port 5000). Daftar endpoint yang dipakai ada di `frontend/services/api.js`.

---

## Struktur Proyek

```text
hris-mobile/
├── frontend/                              # Aplikasi React Native (Expo)
│   ├── assets/                           # Icon, splash, dan onboarding images
│   ├── components/
│   │   ├── ErrorBoundary.js              # Boundary error global
│   │   └── Toast.js                       # Sistem toast notifikasi
│   ├── contexts/
│   │   └── AuthContext.js                # Provider auth: login, logout, refreshUser, sesi
│   ├── services/
│   │   └── api.js                         # Klien API (auth, employees, attendance,
│   │                                      #   company, leave, payroll, payslips,
│   │                                      #   dashboard, notifications) + auto-LAN URL
│   ├── screens/
│   │   ├── OnboardingScreen.js           # Slide perkenalan
│   │   ├── LoginScreen.js                # Login NIK + pengaturan server
│   │   ├── DashboardScreen.js            # Home tab
│   │   ├── AttendanceScreen.js           # Absensi + status + history
│   │   ├── ClockInScreen.js              # Konfirmasi sebelum selfie
│   │   ├── CameraScreen.js               # Selfie clock-in
│   │   ├── SubmitClockInScreen.js        # Submit clock-in (GPS + foto)
│   │   ├── AttendanceDetailsScreen.js    # Detail & export PDF
│   │   ├── AttendanceCalendarScreen.js   # Kalender absensi bulanan
│   │   ├── LeaveScreen.js                # Daftar cuti
│   │   ├── SubmitLeaveScreen.js          # Form pengajuan cuti
│   │   ├── PayrollTaxScreen.js           # Daftar payroll
│   │   ├── PayrollDetailsScreen.js       # Slip gaji + cetak PDF
│   │   ├── ProfileScreen.js              # Profil karyawan + logout
│   │   ├── PersonalDataScreen.js         # Edit data pribadi & upload foto
│   │   └── NotificationScreen.js         # Daftar notifikasi
│   ├── android/                          # Output `expo prebuild` (native project)
│   ├── dist/                             # Bundle build output
│   ├── App.js                            # Entry point: navigasi + provider tree
│   ├── app.json                          # Konfigurasi Expo
│   ├── eas.json                          # Konfigurasi EAS Build
│   ├── metro.config.js
│   ├── index.js
│   └── package.json
├── package-lock.json                     # Root package (untuk deploy Render)
└── README.md
```

### Navigasi (App.js)
- **Stack**: `Onboarding` → `Login` → `Main` (Bottom Tabs)
- **Bottom Tabs (urutan)**: `Home`, `Attendance`, `Payroll`, `Leave`, `Profile`
- **Stack Screens tambahan**: `ClockIn`, `Camera`, `SubmitClockIn`, `AttendanceDetails`, `PayrollTax`, `PayrollDetails`, `PersonalData`, `SubmitLeave`, `Notifications`, `AttendanceCalendar`

---

## Konfigurasi Koneksi API

`frontend/services/api.js` menentukan base URL dengan prioritas:

1. **Custom URL** — disimpan manual via modal "Pengaturan Server" di LoginScreen (AsyncStorage key `api_server_url`). Dipakai jika HP & PC beda jaringan.
2. **Auto-detect LAN** — di mode `__DEV__`, ambil IP dev machine dari `Constants.expoConfig.hostUri` + port `5000`. Otomatis saat HP & PC satu WiFi.
3. **Production URL** — `process.env.EXPO_PUBLIC_API_URL` atau fallback `https://your-production-api.com`.

Helper publik: `setServerUrl(url)`, `getServerUrl()`, `setAuthToken()`, `clearAuthToken()`, `setOnUnauthorized()`.

Untuk build APK production, set env saat build:
```bash
export EXPO_PUBLIC_API_URL=https://api.yourcompany.com
```
atau edit `PROD_URL` di `services/api.js`.

---

## Cara Menjalankan

### Prasyarat
- Node.js 18+
- Expo Go di HP, atau emulator Android/iOS

### Menjalankan Frontend
```bash
cd frontend
npm install
npx expo start
```

Bersihkan cache bila ada error:
```bash
npx expo start --clear
```

### Menjalankan Backend (Web)
Mobile app bergantung pada backend dari `hris-web` di port 5000:
```bash
cd ../hris-web
npm install
npm run dev:all
```
Backend berjalan di `http://localhost:5000`.

> Saat dipakai di HP fisik di jaringan yang sama dengan PC, app otomatis menemukan IP backend (mode LAN). Jika tidak, buka modal "Pengaturan Server" di layar login dan isi URL backend secara manual.

---

## Build APK

Panduan lengkap (prebuild, release/debug, signing, troubleshooting) ada di [`frontend/BUILD-APK.md`](frontend/BUILD-APK.md).

Ringkasan alur release:
```bash
# 1. Set EXPO_PUBLIC_API_URL atau edit PROD_URL di services/api.js
cd frontend
npm install
npx expo prebuild --platform android
cd android
./gradlew assembleRelease
adb install app/build/outputs/apk/release/app-release-unsigned.apk
```

Output:
- Debug: `android/app/build/outputs/apk/debug/app-debug.apk`
- Release: `android/app/build/outputs/apk/release/app-release-unsigned.apk`

---

## Catatan Pengembangan
- Seluruh modul (Attendance, Leave, Payroll, Profile, Notifications) sudah terhubung ke backend `hris-web`.
- Modul lama (SignUp + OTP, Forgot Password 3-step, Expense Summary, Office Assets, Task, Burnout Stats) telah **dihapus** dari basis kode ini.
- Penanganan sesi: token di AsyncStorage + validasi via `/auth/me`; `401` otomatis logout.
- Error terkonsolidasi via `ErrorBoundary` dan `Toast`.

---

## Roadmap
- [ ] Push notification real-time (saat ini hanya in-app list via `/notifications/my`).
- [ ] Sinkron kalender absensi offline-first.
- [ ] Ekspor slip gaji PDF dengan lokasi penyimpanan kustom.
- [ ] Dukungan multi-bahasa (i18n) ID/EN.
- [ ] Signed release build + AAB untuk Play Store.