# 3. Struktur Folder (Direktori)

Sistem memiliki struktur berbasis monorepo (meski tidak formal menggunakan tools monorepo), dengan pembagian utama:

- `/backend/`
  - `/src/` : Kumpulan logika Express, routing (`server.js`), konfigurasi DB (`db.js`), JWT, middlewares (`authMiddleware`).
  - `schema.sql` : Script definisi skema tabel utama dan *seed data* dasar.
  - `payroll-schema.sql` : Skema tabel tambahan khusus ekosistem Payroll (runs, items, components).
- `/src/` (Frontend)
  - `/pages/` : React Components berbasis Halaman aplikasi.
  - `/components/` : *Reusable UI components* (Navbar, Sidebar, dll).
- `/docs/` : Folder dokumentasi, *diagram UML*, dan panduan (Project Manual).
- `/templates/` : *Template* import seperti Excel.
