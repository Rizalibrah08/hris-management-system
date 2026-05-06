# HRIS Development Setup Guide

Panduan lengkap untuk menjalankan HRIS Web + Mobile dengan ngrok (akses dari HP).

---

## 📋 Daftar Isi

1. [Prasyarat](#prasyarat)
2. [Install ngrok](#install-ngrok)
3. [Konfigurasi File](#konfigurasi-file)
4. [Menjalankan Aplikasi](#menjalankan-aplikasi)
5. [Cara Pakai (Setiap Kali Development)](#cara-pakai-setiap-kali-development)
6. [Troubleshooting](#troubleshooting)
7. [Tips & Trik](#tips--trik)

---

## Prasyarat

Pastikan sudah terinstall di PC:

- [ ] **Node.js** (v18+)
- [ ] **MySQL** (running)
- [ ] **npm** (sudah include dengan Node.js)
- [ ] **Expo Go** app (di HP, install dari Play Store/App Store)
- [ ] **ngrok** (akan diinstall di bawah)

---

## Install ngrok

### Langkah 1: Install via npm

```bash
npm install -g ngrok
```

### Langkah 2: Daftar Akun Gratis

1. Buka [https://ngrok.com](https://ngrok.com) di browser
2. Klik **"Sign Up"** (gratis, pakai email atau Google)
3. Login ke [dashboard.ngrok.com](https://dashboard.ngrok.com)
4. Di menu **"Your Authtoken"**, copy token Anda

### Langkah 3: Simpan Token

```bash
ngrok config add-authtoken TOKEN_ANDA_DI_SINI
```

**Contoh:**
```bash
ngrok config add-authtoken 2abcDEF123ghiJKL456mnoPQR789
```

---

## Konfigurasi File

File-file berikut sudah diupdate otomatis. Verifikasi saja:

### 1. `hris-web/vite.config.js`

```javascript
server: {
  host: true,  // ← Sudah ditambahkan
  proxy: {
    '/api': {
      target: 'http://localhost:5000',
      // ...
    }
  }
}
```

### 2. `hris-web/backend/src/server.js`

Di bagian akhir file, pastikan ada `0.0.0.0`:

```javascript
app.listen(port, '0.0.0.0', () => {
  console.log(`HRIS API running on http://0.0.0.0:${port}`)
})
```

### 3. `hris-mobile/frontend/services/api.js`

**File ini WAJIB diupdate setiap kali ngrok dijalankan!**

Ganti bagian ini:

```javascript
// GANTI URL INI dengan URL ngrok Anda
const NGROK_URL = 'https://YOUR_NGROK_URL_HERE.ngrok-free.app';
```

**Contoh setelah ngrok jalan:**
```javascript
const NGROK_URL = 'https://abc123-def456.ngrok-free.app';
```

---

## Menjalankan Aplikasi

### Opsi A: Pakai File Batch (Direkomendasikan)

1. Double-click file `start-dev.bat` di folder `D:\WEB HRIS\`
2. Akan terbuka 4 window terminal
3. Tunggu semua service jalan
4. Copy URL ngrok dari window "ngrok Tunnel"
5. Update `api.js` dengan URL tersebut
6. Scan QR code dari window "Expo Mobile"

### Opsi B: Manual (Terminal Terpisah)

**Terminal 1 - Backend:**
```bash
cd D:\WEB HRIS\hris-web
npm run dev:server
```

**Terminal 2 - ngrok:**
```bash
ngrok http 5000
```

**Catat URL yang muncul:**
```
Forwarding: https://abc123-def456.ngrok-free.app -> http://localhost:5000
```

**Terminal 3 - Web Frontend (opsional):**
```bash
cd D:\WEB HRIS\hris-web
npm run dev
```

**Terminal 4 - Mobile:**
```bash
cd D:\WEB HRIS\hris-mobile\frontend
npx expo start
```

---

## Cara Pakai (Setiap Kali Development)

### Step-by-Step

```
┌─────────────────────────────────────────────────────┐
│  1. Jalankan start-dev.bat (double-click)          │
│     → 4 terminal akan terbuka                       │
│                                                     │
│  2. Tunggu 10-15 detik                             │
│     → Backend jalan di http://localhost:5000       │
│     → ngrok aktif dengan URL public                │
│                                                     │
│  3. Copy URL ngrok                                 │
│     → Contoh: https://abc123.ngrok-free.app        │
│                                                     │
│  4. Edit api.js                                    │
│     → Buka hris-mobile/frontend/services/api.js    │
│     → Ganti NGROK_URL dengan URL tadi              │
│                                                     │
│  5. Save & Restart Mobile                          │
│     → Di terminal Expo, tekan 'r' untuk reload     │
│     → Atau tutup lalu npx expo start --clear       │
│                                                     │
│  6. Buka Expo Go di HP                             │
│     → Scan QR code di terminal Expo                │
│     → Atau ketik URL manual                        │
│                                                     │
│  7. Login & Test!                                  │
│     → NIK: ADM001                                  │
│     → Password: admin123                           │
└─────────────────────────────────────────────────────┘
```

---

## Troubleshooting

### ❌ "Cannot connect to server" di Mobile

**Penyebab:** URL ngrok belum diupdate di `api.js`

**Solusi:**
1. Cek window ngrok, copy URL https://
2. Buka `hris-mobile/frontend/services/api.js`
3. Ganti `NGROK_URL` dengan URL tersebut
4. Save file
5. Di terminal Expo, tekan `r` untuk reload

### ❌ "NIK tidak ditemukan"

**Penyebab:** Database belum di-seed atau backend tidak connect ke DB

**Solusi:**
```bash
cd D:\WEB HRIS\hris-web
npm run db:setup
```

### ❌ ngrok tidak jalan

**Penyebab:** Token belum di-set

**Solusi:**
```bash
ngrok config add-authtoken YOUR_TOKEN_HERE
```

### ❌ Expo QR code tidak muncul

**Penyebab:** Port 8081 sudah dipakai

**Solusi:**
```bash
npx expo start --clear
```

### ❌ Backend error CORS

**Solusi:** CORS sudah di-enable di `server.js`. Jika masih error, pastikan `vite.config.js` proxy ke `localhost:5000`.

---

## Tips & Trik

### 🔗 URL ngrok bersifat temporary

Setiap kali restart ngrok, URL akan **BERUBAH**.

**Tips:** Jika ingin URL tetap (tidak berubah), upgrade ke ngrok Pro (~$5/bulan) untuk custom subdomain.

### 📱 Test tanpa HP

Jika tidak punya HP, bisa pakai Android Emulator:
1. Install Android Studio
2. Buat Virtual Device
3. Install Expo Go di emulator
4. Jalankan `npx expo start` dan pilih emulator

### 🔄 Auto-reload

Saat development:
- Edit code di PC → Save
- Mobile akan auto-reload (hot reload)
- Backend akan auto-restart (nodemon)

### 📊 Monitoring

- **Backend health check:** `http://localhost:5000/health`
- **ngrok dashboard:** [dashboard.ngrok.com](https://dashboard.ngrok.com)

### 📝 Log

- **Backend log:** Terminal 1
- **API request log:** Terminal 2 (ngrok)
- **Mobile log:** Terminal 4 (Expo)

---

## Diagram Alur

```
┌─────────────┐         ┌──────────────────┐         ┌─────────────────┐
│  HP Anda    │         │   ngrok (Cloud)  │         │   PC Anda       │
│             │         │                  │         │                 │
│ ┌─────────┐ │         │ ┌──────────────┐ │         │ ┌─────────────┐ │
│ │Expo Go  │ │──scan──→│ │ ngrok tunnel │ │←────────│ │ Backend     │ │
│ │(App)    │ │  QR     │ │ :5000        │ │         │ │ :5000       │ │
│ └─────────┘ │         │ └──────────────┘ │         │ └─────────────┘ │
│      │      │         │         │        │         │        │        │
│      ▼      │         │         ▼        │         │        ▼        │
│ API calls   │────────→│ Forward to PC    │         │ MySQL DB        │
│ /auth/login │         │                  │         │                 │
│ /attendance │         │ URL: abc123.     │         │ JWT Secret      │
│ /leave      │         │      ngrok.io    │         │                 │
└─────────────┘         └──────────────────┘         └─────────────────┘

     Internet                  Tunnel                    Localhost
```

---

## File yang Sudah Dikonfigurasi

| File | Perubahan | Status |
|---|---|---|
| `hris-web/vite.config.js` | Tambah `host: true` | ✅ Done |
| `hris-web/backend/src/server.js` | Listen `0.0.0.0` | ✅ Done |
| `hris-mobile/frontend/services/api.js` | Template ngrok | ✅ Done |
| `start-dev.bat` | Auto-launch script | ✅ Done |
| `DESAIN UI/pages/*.html` | Restore English | ✅ Done |

---

## Butuh Bantuan?

Jika ada error, cek:
1. Semua terminal tidak ada error merah
2. MySQL running (XAMPP/WAMP/services)
3. Port 5000 dan 8081 tidak dipakai aplikasi lain
4. ngrok token sudah di-set
5. URL ngrok sudah diupdate di `api.js`

---

**Selamat mencoba!** 🚀

*Catatan: Untuk production/deploy, gunakan VPS/cloud server, bukan ngrok.*
