# 1. Arsitektur Sistem (System Architecture)

Sistem dibangun menggunakan pendekatan arsitektur terpisah antara sisi Frontend dan Backend (Decoupled Architecture), dengan rincian *stack* teknologi:

- **Backend (API):** Node.js menggunakan framework Express.js. Melayani seluruh permintaan RESTful API.
- **Database:** MySQL 8. Skema database di-manage via *SQL scripts* (berada di folder `backend/`).
- **Frontend:** React (Vite) menggunakan TailwindCSS untuk desain antarmuka, serta Recharts untuk visualisasi data/grafik analitik.
- **Autentikasi:** JSON Web Token (JWT) dengan *Role-Based Access Control* (RBAC) - mendukung 5 peran: Admin (ADM), Human Resource (HRD), Finance (FIN), Manager (MGR), dan Employee (EMP).
