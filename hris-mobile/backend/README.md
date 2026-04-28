# HRIS Mobile - Backend (Tidak Digunakan)

Backend ini **tidak digunakan lagi**. Semua API sekarang dilayani oleh backend hris-web yang berjalan di port 5000.

## Arsitektur

```
hris-web/backend (port 5000)  <---  MySQL (hris_db)  --->  hris-web/frontend
         ^                                             
         |                                             
hris-mobile/frontend (Expo/React Native)               
```

Mobile frontend langsung mengakses API di `hris-web/backend` melalui service layer `frontend/services/api.js`.

## Cara Menjalankan

1. Jalankan backend hris-web: `cd D:\WEB HRIS\hris-web && npm run dev:all`
2. Jalankan mobile frontend: `cd D:\WEB HRIS\hris-mobile\frontend && npx expo start`

## Konfigurasi API URL

Edit file `frontend/services/api.js` untuk mengubah `API_BASE_URL`:
- Android Emulator: `http://10.0.2.2:5000`
- iOS Simulator: `http://localhost:5000`
- Device fisik: `http://<IP_KOMPUTER>:5000`