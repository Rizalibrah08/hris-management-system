# RENCANA PERBAIKAN HRIS MOBILE

## Status: COMPLETED - 07 May 2026

---

## Ringkasan Perubahan

### Fase 1: API Layer & Backend Support ✅

| No | Tugas | File | Status |
|----|-------|------|--------|
| 1.1 | Tambahkan `api.auth.logout()` | `hris-mobile/frontend/services/api.js` | ✅ |
| 1.2 | Upload selfie via multipart/form-data | `api.js` + `SubmitClockInScreen.js` | ✅ |
| 1.3 | Tambahkan `multer` middleware | `hris-web/backend/src/server.js` | ✅ |
| 1.4 | Endpoint delegasi `GET /employees/delegation-list` | `server.js` | ✅ |
| 1.5 | Endpoint upload foto profil | `server.js` | ✅ |
| 1.6 | Endpoint notifikasi + tabel | `server.js` | ✅ |
| 1.7 | Endpoint sisa cuti `GET /leave/quota` | `server.js` | ✅ |
| Bonus | Endpoint `GET /payroll/my-runs/:id` | `server.js` | ✅ |
| Bonus | Kolom `photo_url` di tabel employees | `server.js` (auto-migration) | ✅ |
| Bonus | Notifikasi trigger di leave approve & payroll finalize | `server.js` | ✅ |

### Fase 2: Hardware Integration ✅

| No | Tugas | File | Status |
|----|-------|------|--------|
| 2.1 | Real GPS via `expo-location` | `ClockInScreen.js`, `SubmitClockInScreen.js`, `CameraScreen.js`, `app.json` | ✅ |
| 2.2 | PDF export via `expo-print` + `expo-sharing` | `AttendanceDetailsScreen.js`, `PayrollDetailsScreen.js` | ✅ |
| 2.3 | Foto profil via `expo-image-picker` | `PersonalDataScreen.js` | ✅ |
| 2.4 | Kompresi selfie via `expo-image-manipulator` | `SubmitClockInScreen.js` | ✅ |

### Fase 3: Fitur Baru ✅

| No | Fitur | File | Status |
|----|-------|------|--------|
| 3.1 | Biometric Login (Face ID / Sidik Jari) | `LoginScreen.js` | ✅ |
| 3.2 | Share Slip Gaji (via PDF export) | `PayrollDetailsScreen.js` | ✅ |
| 3.3 | Kalender Kehadiran | `AttendanceCalendarScreen.js` (new) | ✅ |
| 3.4 | Notifikasi In-App + badge | `NotificationScreen.js` (new) | ✅ |

### Fase 4: UI Polish & Bug Fixes ✅

| No | Tugas | Status |
|----|-------|--------|
| 4.1 | Fetch delegasi dari backend | ✅ |
| 4.2 | Tampilkan sisa kuota cuti | ✅ |
| 4.3 | Gambar onboarding berbeda per slide | ⏭️ (low priority) |
| 4.4 | Seragamkan bahasa ke Indonesia | ✅ |
| 4.5 | Loading + error state | ✅ (existing) |
| 4.6 | Pull-to-refresh di Leave & Payroll | ✅ |
| 4.7 | Perbaiki navigator (Profile duplikat) | ✅ |

### Fase 5: Upgrade Arsitektur ✅

| No | Tugas | Status |
|----|-------|--------|
| 5.1 | TanStack Query (QueryClientProvider) | ✅ |
| 5.2 | Toast notification component | ✅ |
| 5.3 | Error Boundary | ✅ |
| 5.4 | FlatList optimization | ✅ (notifications screen) |
| 5.5 | Hapus dependencies tidak terpakai | ⏭️ (expo-linear-gradient masih dipakai) |

### Fase 6: Cleanup ✅

| No | Tugas | Status |
|----|-------|--------|
| 6.1 | Hapus placeholder onboarding duplikat | ✅ |
| 6.2 | Hapus hardcoded data delegasi | ✅ |
| 6.3 | Hapus fake GPS coordinates | ✅ |
| 6.4 | Hapus kode PDF modal palsu | ✅ |

---

## File yang Diubah

### Backend (`hris-web/backend/src/`)
- `server.js` — +~200 lines (multer, photo upload, notifications, delegation, leave quota, payroll detail)

### Mobile (`hris-mobile/frontend/`)
- `services/api.js` — +multipart support, +new endpoints
- `contexts/AuthContext.js` — (no change needed, logout already works)
- `App.js` — +QueryClientProvider, +ToastProvider, +ErrorBoundary, +2 new screens
- `app.json` — +location permissions
- `screens/LoginScreen.js` — +biometric login
- `screens/ClockInScreen.js` — +real GPS, -fake map text
- `screens/CameraScreen.js` — +gpsLocation pass-through
- `screens/SubmitClockInScreen.js` — +real GPS, +compression, +multipart
- `screens/AttendanceDetailsScreen.js` — +real PDF export, -fake modal
- `screens/PayrollDetailsScreen.js` — +real PDF export, -fake modal
- `screens/PersonalDataScreen.js` — +photo upload via image picker
- `screens/SubmitLeaveScreen.js` — +delegation from API, +leave quotas
- `screens/DashboardScreen.js` — +notification bell icon
- `screens/AttendanceScreen.js` — +calendar button
- `screens/LeaveScreen.js` — +pull-to-refresh
- `screens/PayrollTaxScreen.js` — +pull-to-refresh

### File Baru
- `screens/NotificationScreen.js` — Daftar notifikasi + mark read
- `screens/AttendanceCalendarScreen.js` — Kalender kehadiran bulanan
- `components/Toast.js` — Toast notification component
- `components/ErrorBoundary.js` — Global error handler

---

## Instalasi Package Baru

**Backend:**
- `multer` — File upload handling

**Mobile:**
- `expo-location` — GPS coordinates
- `expo-print` — PDF generation
- `expo-sharing` — Share PDF files
- `expo-image-picker` — Photo gallery picker
- `expo-image-manipulator` — Image compression
- `expo-local-authentication` — Biometric (Face ID/Fingerprint)
- `expo-secure-store` — Encrypted storage for credentials
- `@tanstack/react-query` — Data fetching & caching
