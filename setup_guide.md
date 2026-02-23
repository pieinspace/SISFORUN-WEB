# Panduan Setup Proyek RunTrackingAdmin

Panduan ini berisi langkah-langkah lengkap untuk menjalankan proyek **RunTrackingAdmin** dari awal setelah melakukan `git clone`.

## 1. Persyaratan Sistem (Prerequisites)
Sebelum memulai, pastikan perangkat Anda sudah terinstall:
- **Node.js** (Rekomendasi versi 18 ke atas)
- **PostgreSQL** (Database)
- **Git**

## 2. Instalasi Dependency
Proyek ini terdiri dari dua bagian: **Frontend** (Vite/React) di root folder dan **Backend** (Node.js/Express) di folder `server/`.

### Frontend (Root Folder)
Buka terminal di direktori utama proyek, lalu jalankan:
```bash
npm install
```

### Backend (Folder Server)
Masuk ke folder server, lalu jalankan:
```bash
cd server
npm install
```

---

## 3. Konfigurasi Environment (.env)
Anda perlu membuat file `.env` di dua lokasi berbeda.

### .env di Folder Root (Frontend)
Buat file bernama `.env` di direktori utama:
```env
VITE_API_BASE_URL=http://localhost:4001
```

### .env di Folder Server (Backend)
Buat file bernama `.env` di dalam folder `server/`:
```env
PORT=4001
DATABASE_URL=postgresql://USERNAME:PASSWORD@localhost:5432/NAMA_DATABASE
INTEGRATION_SECRET=3c3b5a36b403abfa7c36844f383c5379b44180ee05d703c1872c3c00efd6f0e7
JWT_SECRET=8f9a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a
```
> [!NOTE]
> Ganti `USERNAME`, `PASSWORD`, dan `NAMA_DATABASE` sesuai dengan konfigurasi PostgreSQL lokal Anda.

---

## 4. Setup Database
Ikuti langkah-langkah ini untuk menyiapkan database secara berurutan:

1.  **Buat Database**: Buat database baru di PostgreSQL (misalnya bernama `runtracking`).
2.  **Inisialisasi Tabel Admin**: Jalankan script SQL yang ada di `server/sql/setup_login_web.sql` atau jalankan script node:
    ```bash
    cd server
    npx ts-node insert_admin.ts
    ```
3.  **Inisialisasi Master Data**: Jalankan script untuk membuat tabel master (Kotama, Kesatuan, Pangkat, Corps):
    ```bash
    node recreate_master_tables.js
    ```
4.  **Import Data Lengkap**: Untuk mengisi data personil militer dan ASN:
    ```bash
    node import_full_data.js
    ```

---

## 5. Menjalankan Aplikasi
Buka dua jendela terminal terpisah.

### Terminal 1: Backend
```bash
cd server
npm run dev
```
Backend akan berjalan di `http://localhost:4001`.

### Terminal 2: Frontend
```bash
npm run dev
```
Frontend akan berjalan di `http://localhost:8080` (atau port yang tertera di terminal).

---

## 6. Kredensial Login (Web Panel)
Gunakan akun default berikut untuk masuk ke panel admin:
- **Username**: `admin`
- **Password**: `admin123`

Atau untuk Super Admin:
- **Username**: `superadmin`
- **Password**: `admin123`
