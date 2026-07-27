# Desa Cantik Frontend

**Sistem Informasi Desa Cinta Statistik - Frontend Application**

![Status](https://img.shields.io/badge/status-in%20development-yellow)
![React](https://img.shields.io/badge/React-19.0.0--rc.1-blue)
![Vite](https://img.shields.io/badge/Vite-7.1.7-purple)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.18-cyan)
![License](https://img.shields.io/badge/license-Academic-green)

---

## Daftar Isi

- [Tentang Proyek](#tentang-proyek)
- [Tim Pengembang](#tim-pengembang)
- [Tech Stack](#tech-stack)
- [Fitur Utama](#fitur-utama)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Struktur Proyek](#struktur-proyek)
- [Environment Variables](#environment-variables)
- [Development Workflow](#development-workflow)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [Documentation](#documentation)
- [License](#license)

---

## Tentang Proyek

Desa Cantik Frontend adalah aplikasi web berbasis React untuk **Sistem Informasi Desa Cinta Statistik (Desa Cantik)** BPS Kabupaten Toraja Utara. Aplikasi ini menyediakan antarmuka pengguna untuk:

- **Pengelolaan Data Desa** (Nonongan Selatan & Rindingbatu)
- **Visualisasi Data Statistik** dengan grafik interaktif
- **Peta Tematik** menggunakan Leaflet.js dan GeoJSON
- **Dashboard Role-Based** untuk Admin BPS, Perangkat Desa, dan Masyarakat
- **Upload dan Kelola Publikasi** dokumentasi desa

**Backend API:** [desa-cantik-api](https://git.stis.ac.id/rpl-lancarnyaman/desa-cantik-api)

---

## Tim Pengembang

**Tim 4  Kelas 3SI1**

| Nama                              | NIM       | Role                  |
| --------------------------------- | --------- | --------------------- |
| Teguh Christianto Simbolon        | 222313403 | Project Lead, Backend |
| Amir Syaifudin                    | 222312968 | Frontend Lead         |
| Anggita Cristin Meylani           | 222312982 | Frontend              |
| Nyimas Virna Salsa Lestari Risqia | 222313307 | Frontend              |
| Alif Zakiansyah As Syauqi         | 222312958 | Backend Lead          |
| Ahmad Adib Husaini Al Munawwar    | 222312948 | Backend               |


---

## Tech Stack

### Core
- **[React](https://react.dev)** 19.1.1 - UI Library
- **[Vite](https://vitejs.dev)** 7.2.2 - Build Tool & Dev Server
- **[React Router](https://reactrouter.com/)** 7.9.5 - Routing

### Styling
- **[TailwindCSS](https://tailwindcss.com/)** 3.4.18 - Utility-first CSS
- **[shadcn/ui](https://ui.shadcn.com/)** - Component Library
- **[Lucide React](https://lucide.dev/)** - Icon Library
- **[tailwindcss-animate](https://www.npmjs.com/package/tailwindcss-animate)** - Animation utilities

### Data Fetching & Maps
- **[Axios](https://axios-http.com/)** - HTTP Client
- **[Leaflet](https://leafletjs.com/)** - Interactive Maps
- **[React-Leaflet](https://react-leaflet.js.org/)** - React wrapper for Leaflet

### Development Tools
- **[ESLint](https://eslint.org/)** 9.36.0 - Linting
- **[PostCSS](https://postcss.org/)** - CSS Processing
- **[Autoprefixer](https://github.com/postcss/autoprefixer)** - CSS Vendor Prefixing

---

## Fitur Utama

1. **Autentikasi & Otorisasi**
   - Login berbasis JWT melalui API backend
   - Kontrol akses berbasis peran (RBAC):
     - **Admin BPS**: Mengelola semua desa dan validasi data
     - **Perangkat Desa**: Mengelola data desa masing-masing
     - **Masyarakat**: Hanya melihat data publik
   - Rute terlindungi dengan komponen `ProtectedRoute`
   - Penyegaran token otomatis dan logout

2. **Dashboard Berbasis Peran**
   - **Dashboard Admin BPS**: Gambaran semua desa, statistik agregat, aktivitas terkini
   - **Dashboard Perangkat Desa**: Gambaran desa masing-masing, statistik lokal
   - Visualisasi dengan Recharts (pie chart, bar chart)

3. **Manajemen Desa (Admin BPS)**
   - **Daftar Desa**: CRUD data desa, toggle status aktif/nonaktif
   - **Perangkat Desa**: Kelola akun perangkat desa (tambah, edit, hapus)
   - **Modul Desa**: Kelola modul/fitur yang tersedia untuk setiap desa
   - Paginasi dan pencarian untuk semua daftar

### 4. **Data Statistik dengan Validasi**
   - **Perangkat Desa**: 
     - Input data statistik (CSV upload)
     - Status otomatis "Menunggu Validasi" saat create
     - Tidak bisa mengubah status (hanya admin yang bisa)
     - Filter berdasarkan subjek dan tahun
   - **Admin BPS**:
     - Lihat semua data statistik dari semua desa
     - Validasi data (Setujui/Tolak)
     - Filter berdasarkan desa dan status
     - Alasan penolakan saat reject
     - Search data statistik
   
   **Alur Validasi:**
   1. Perangkat Desa menambah data → Status: "Menunggu Validasi"
   2. Admin BPS melihat data di halaman Data Statistik
   3. Admin BPS bisa:
      - **Setujui** → Status: "Terverifikasi"
      - **Tolak** → Status: "Ditolak" (dengan alasan)
   4. Perangkat Desa melihat status update di halaman mereka

### 5. **Publikasi Desa**
   - **Perangkat Desa**: Upload dan kelola publikasi desa (PDF)
   - **Admin BPS**: Kelola publikasi semua desa
   - Kategori: Laporan Statistik, Profil Desa, Infografis, Berita Resmi
   - Search dan filter

### 6. **Peta Tematik**
   - **Perangkat Desa**: Kelola data geospatial dan layer peta untuk desa sendiri
   - **Admin BPS**: Kelola peta tematik untuk semua desa
   - Upload GeoJSON data
   - Visualisasi dengan Leaflet.js
   - Layer management dengan warna custom

### 7. **Profil Umum Desa**
   - Edit profil desa (nama, demografi, dll)
   - Upload foto/gambar profil
   - Informasi umum desa

### 8. **Manajemen Modul**
   - Admin BPS dapat mengaktifkan/nonaktifkan modul per desa
   - Kontrol granular fitur yang bisa diakses setiap desa
   - Modul: Data Statistik, Publikasi, Peta Tematik, Profil Umum

---

## Prerequisites

Sebelum memulai, pastikan sudah terinstall:

- **Node.js** >= 20.x ([Download](https://nodejs.org/))
- **npm** >= 10.x (included with Node.js)
- **Git** ([Download](https://git-scm.com/))
- **Backend API** running di `http://localhost:8000` (lihat [desa-cantik-api README](https://git.stis.ac.id/rpl-lancarnyaman/desa-cantik-api/-/blob/develop/README.md))

**Cek versi:**
```bash
node --version  # v20.x atau lebih baru
npm --version   # v10.x atau lebih baru
```

---

## Quick Start

### 1. Clone Repository

```bash
git clone https://git.stis.ac.id/rpl-lancarnyaman/desa-cantik-frontend.git
cd desa-cantik-frontend
```

### 2. Periksa Branch Develop

```bash
git checkout develop
git pull origin develop
```

### 3. Instal Dependensi

```bash
npm install
```

**Paket terinstal:**
- React 19 + React DOM
- React Router v7
- Axios, Leaflet, React-Leaflet
- TailwindCSS, komponen shadcn/ui
- ESLint, plugin Vite

### 4. Konfigurasi Environment

```bash
# Buat file .env
cp .env.example .env

# Edit .env
nano .env
```

**Konfigurasi minimal:**
```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

**Catatan:** Nama variabel harus `VITE_API_BASE_URL` (bukan `VITE_API_URL`)

### 5. Mulai Server Pengembangan

```bash
npm run dev
```

**Output:**
```
  VITE v7.2.2  ready in 2246 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

**Buka browser:** `http://localhost:5173`

---

## Struktur Proyek

```
desa-cantik-frontend/
├── public/                    # Aset statis
├── src/
│   ├── assets/               # Gambar, font
│   │   ├── fonts/
│   │   └── images/
│   │
│   ├── components/           # Komponen UI yang dapat digunakan kembali
│   │   ├── shared/          # Komponen bersama
│   │   │   ├── Footer.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── SidebarAdminBPS.jsx
│   │   │   ├── SidebarPerangkatDesa.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── VillageDetailNavbar.jsx
│   │   └── ui/              # Komponen shadcn/ui
│   │       ├── button.jsx
│   │       ├── card.jsx
│   │       ├── dialog.jsx
│   │       ├── table.jsx
│   │       └── ... (semua komponen UI)
│   │
│   ├── hooks/                # Hook React kustom
│   │
│   ├── layouts/              # Komponen layout
│   │   ├── DashboardLayout.jsx
│   │   └── MainLayout.jsx
│   │
│   ├── lib/                  # Fungsi utilitas
│   │   └── utils.js
│   │
│   ├── pages/                # Komponen halaman (rute)
│   │   ├── admin/            # Halaman Admin BPS
│   │   │   ├── DashboardAdmin.jsx
│   │   │   ├── DaftarDesaAdmin.jsx
│   │   │   ├── PerangkatDesaAdmin.jsx
│   │   │   ├── ModulDesaAdmin.jsx
│   │   │   ├── DataStatistikAdmin.jsx
│   │   │   ├── PublikasiDesaAdmin.jsx
│   │   │   ├── PetaTematikAdmin.jsx
│   │   │   └── UbahPasswordAdminBPS.jsx
│   │   ├── desa/             # Halaman Perangkat Desa
│   │   │   ├── DashboardDesa.jsx
│   │   │   ├── ProfilUmumDesa.jsx
│   │   │   ├── DataStatistikDesa.jsx
│   │   │   ├── PublikasiDesa.jsx
│   │   │   ├── PetaTematikDesa.jsx
│   │   │   └── UbahPasswordPerangkatDesa.jsx
│   │   └── public/           # Halaman Publik
│   │       ├── Home.jsx
│   │       ├── Login.jsx
│   │       ├── Tentang.jsx
│   │       └── VillageDetail.jsx
│   │
│   ├── routes/               # Konfigurasi React Router
│   │   ├── index.jsx         # Definisi rute
│   │   └── config.js         # Item menu untuk sidebar
│   │
│   ├── services/             # Lapisan layanan API
│   │   ├── apiClient.js      # Pembungkus HTTP client
│   │   ├── authApi.js        # API Autentikasi
│   │   ├── dataApi.js        # API data umum (desa, statistik, dll)
│   │   ├── dashboardService.js
│   │   ├── publicationService.js
│   │   ├── statisticService.js
│   │   ├── geoService.js
│   │   └── villageProfileService.js
│   │
│   ├── App.css
│   ├── App.jsx               # Root component
│   ├── index.css             # Global styles
│   └── main.jsx              # Entry point
│
├── .env.example              # Environment template
├── .gitignore
├── components.json           # shadcn/ui config
├── eslint.config.js          # ESLint rules
├── index.html                # HTML template
├── jsconfig.json             # Path aliases
├── package.json              # Dependencies
├── postcss.config.js         # PostCSS config
├── README.md
├── tailwind.config.js        # TailwindCSS config
└── vite.config.js            # Vite configuration
```

---

## Environment Variables

Create `.env` in project root (gitignored):

```env
# Backend API Base URL (dengan /v1 di akhir)
VITE_API_BASE_URL=http://localhost:8000/api/v1

# Optional: App Name
VITE_APP_NAME="Desa Cantik"
```

**File Environment:**
- `.env` - Pengembangan lokal (gitignored)
- `.env.example` - Template (committed ke repo)
- Produksi: Konfigurasi di platform hosting (variabel env Vercel/Netlify)

**Mengakses dalam kode:**
```javascript
const API_URL = import.meta.env.VITE_API_BASE_URL;
// Fallback default: 'http://localhost:8000/api/v1'
```

---

## Development Workflow

### Alur Kerja Harian (Developer Individual)

**Pagi - Sinkronisasi dengan Tim:**
```bash
# 1. Pindah ke develop
git checkout develop

# 2. Tarik perubahan terbaru
git pull origin develop

# 3. Buat feature branch
git checkout -b feature/auth-ui

# 4. Mulai coding!
npm run dev
```

**Sore - Commit & Push:**
```bash
# 1. Periksa perubahan
git status

# 2. Tambahkan file
git add .

# 3. Commit dengan pesan konvensional
git commit -m "feat(auth): add login form component with validation"

# 4. Push feature branch
git push origin feature/auth-ui
```

### Pesan Commit Konvensional

Format: `<type>(<scope>): <description>`

**Tipe:**
- `feat`: Fitur baru
- `fix`: Perbaikan bug
- `docs`: Dokumentasi
- `style`: Pemformatan (tidak ada perubahan kode)
- `refactor`: Restrukturasi kode
- `test`: Menambahkan test
- `chore`: Pemeliharaan

**Contoh:**
```bash
git commit -m "feat(map): integrate Leaflet for desa boundaries"
git commit -m "fix(login): resolve token refresh issue"
git commit -m "docs(readme): update installation steps"
```

### Buat Merge Request

1. **Push feature branch** (seperti di atas)

2. **Pergi ke GitLab:**
   - Navigasi ke: `https://git.stis.ac.id/rpl-lancarnyaman/desa-cantik-frontend/-/merge_requests/new`

3. **Isi Formulir MR:**
   ```markdown
   Title: feat: Add authentication UI components

   ## Changes
   - Created LoginForm component with validation
   - Integrated Axios for API calls
   - Added error handling

   ## Testing
   - [x] Form validation working
   - [x] API integration tested with backend
   - [x] Responsive on mobile

   ## Screenshots
   [Attach screenshots]
   ```

4. **Atur:**
   - Source: `feature/auth-ui`
   - Target: `develop`
   - Assignee: Team Lead
   - Reviewers: 2 teammate

5. **Dapatkan Persetujuan** → Merge → Hapus feature branch

---

## Skrip yang Tersedia

```bash
# Mulai server pengembangan (HMR enabled)
npm run dev
# Server akan berjalan di http://localhost:5173

# Build untuk produksi
npm run build
# Output: folder /dist dengan aset yang dioptimalkan

# Preview build produksi
npm run preview
# Preview build produksi secara lokal

# Jalankan linter
npm run lint
# Periksa kualitas kode dengan ESLint
```

**Output Build Produksi:**
- Membuat folder `/dist`
- Aset yang dioptimalkan dan diminimalkan
- Siap untuk deployment ke Vercel/Netlify/static hosting

**Server Pengembangan:**
- Hot Module Replacement (HMR) diaktifkan
- Penyegaran cepat untuk komponen React
- Auto-reload saat file berubah

---

## Testing

### Daftar Periksa Testing Manual

**Sebelum commit:**
- [ ] Komponen render tanpa error
- [ ] Responsif di mobile (DevTools)
- [ ] Panggilan API berfungsi (Network tab)
- [ ] Tidak ada error di console
- [ ] Lint berhasil (`npm run lint`)

### Testing Integrasi

**Test dengan API Backend:**
```bash
# Terminal 1: Backend API
cd ../desa-cantik-api
php artisan serve  # atau docker-compose up -d

# Terminal 2: Frontend
cd desa-cantik-frontend
npm run dev

# Test endpoint:
# - Home: http://localhost:5173/
# - Login: http://localhost:5173/login
# - Admin Dashboard: http://localhost:5173/admin/dashboard
# - Desa Dashboard: http://localhost:5173/desa-dashboard/dashboard
# - Data Statistik Admin: http://localhost:5173/admin/data-statistik
# - Peta Tematik: http://localhost:5173/admin/peta-tematik
```

**Kredensial Test (sesuaikan dengan backend):**
- Admin BPS: `admin@bps.go.id` / `password`
- Perangkat Desa: `perangkat@desa.go.id` / `password`

### Testing Otomatis (TODO)

**Implementasi masa depan:**
- Unit tests: Jest + React Testing Library
- E2E tests: Cypress atau Playwright
- Target cakupan: ≥ 70%

---

## Pemecahan Masalah

### Masalah: `npm install` gagal

**Solusi:**
```bash
# Bersihkan cache npm
npm cache clean --force

# Hapus node_modules
rm -rf node_modules package-lock.json

# Instal ulang
npm install
```

---

### Masalah: Port 5173 sudah digunakan

**Solusi:**
```bash
# Matikan proses di port 5173 (Windows)
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Atau ubah port di vite.config.js:
export default defineConfig({
  server: { port: 3000 }
})
```

---

### Masalah: Error CORS API

**Gejala:**
```
Access to XMLHttpRequest blocked by CORS policy
```

**Solusi:**
1. **Backend harus mengizinkan origin** di `config/cors.php`:
   ```php
   'allowed_origins' => ['http://localhost:5173'],
   ```

2. **Atau gunakan proxy** di `vite.config.js`:
   ```javascript
   export default defineConfig({
     server: {
       proxy: {
         '/api': 'http://localhost:8000'
       }
     }
   })
   ```

---

### Masalah: Variabel environment tidak berfungsi

**Solusi:**
1. **Awali dengan `VITE_` dan gunakan nama yang benar:**
   ```env
   # Salah
   API_URL=http://localhost:8000
   VITE_API_URL=http://localhost:8000/api

   # Benar
   VITE_API_BASE_URL=http://localhost:8000/api/v1
   ```

2. **Restart dev server** setelah mengubah `.env`

---

### Masalah: Halaman kosong di browser

**Periksa:**
1. **Error di console** (F12)
2. **Network tab** - Panggilan API gagal?
3. **Routing** - Apakah rute didefinisikan di `src/routes/index.jsx`?
4. **Ekspor komponen** - Default vs named export

**Debug:**
```javascript
// Tambahkan ke komponen
console.log('Component rendering:', props);
```

---

## Contributing

### Gaya Kode

**React:**
- Komponen fungsional + Hooks
- Named exports untuk komponen
- PropTypes untuk type checking (jika tidak menggunakan TypeScript)

**CSS:**
- Kelas utilitas TailwindCSS
- Gunakan komponen shadcn/ui jika memungkinkan
- Hindari inline styles kecuali dinamis

**Penamaan File:**
- Komponen: `PascalCase.jsx` (mis. `LoginForm.jsx`)
- Utilitas: `camelCase.js` (mis. `formatDate.js`)
- Folder: `kebab-case/` (mis. `api-services/`)

### Daftar Periksa Pull Request

Sebelum mengirim MR:
- [ ] Kode mengikuti gaya proyek
- [ ] ESLint berhasil (`npm run lint`)
- [ ] Tidak ada pernyataan console.log
- [ ] Komponen diuji secara manual
- [ ] Desain responsif diperiksa
- [ ] Integrasi API diuji
- [ ] README diperbarui (jika diperlukan)
- [ ] Screenshot dilampirkan (untuk perubahan UI)

---

## Resources
**Technical Docs**
- [React 19 Docs](https://react.dev/)
- [Vite Guide](https://vitejs.dev/guide/)
- [TailwindCSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [React Router](https://reactrouter.com/en/main)
- [Leaflet](https://leafletjs.com/reference.html)
- [Recharts](https://recharts.org/) - Chart library
- [date-fns](https://date-fns.org/) - Date formatting

---

## Documentation

Dokumentasi lengkap proyek tersedia di folder [`/docs`](./docs/):

### Dokumen Resmi

| Dokumen | Deskripsi | Link |
|---------|-----------|------|
| **Laporan Final Project** | Laporan akhir pengembangan sistem| [📥 Download PDF](./docs/Laporan_Final_Projek_3SI1_Tim_4.pdf) |
| **Petunjuk Instalasi & Penggunaan** | User Manual lengkap untuk Admin BPS, Perangkat Desa, dan Masyarakat | [📥 Download PDF](./docs/Petunjuk_Instalasi_dan_Penggunaan.pdf) |
| **Lisensi & Alih Hak Sistem** | Perjanjian lisensi dan alih hak sistem kepada BPS Toraja Utara | [📥 Download PDF](./docs/Perjanjian_Lisensi_Desa_Cantik_Toraja_Utaraa.pdf) |
| **BAST** | Berita Acara Serah Terima sistem kepada klien (BPS Toraja Utara) | [📥 Download PDF](./docs/Berita_Acara_Serah_Terima_Desa_Cantik_Toraja_Utara.pdf) |

### Repository Terkait

- **Backend API:** [desa-cantik-api](https://git.stis.ac.id/rpl-lancarnyaman/desa-cantik-api)
- **Dokumentasi Backend:** Lihat [README Backend](https://git.stis.ac.id/rpl-lancarnyaman/desa-cantik-api/-/blob/develop/README.md)

### Panduan Cepat

- **Instalasi Developer:** Lihat [Quick Start](#quick-start)
- **Deployment Production:** Lihat [Petunjuk Instalasi PDF](./docs/Petunjuk_Instalasi_dan_Penggunaan.pdf) - Section 4
- **Troubleshooting:** Lihat [User Manual PDF](./docs/Petunjuk_Instalasi_dan_Penggunaan.pdf) - Section 8

---

## Lisensi

Proyek ini dikembangkan untuk keperluan akademik:

**Hak Cipta © 2025 Tim 4 - Kelas 3SI1**  
**Politeknik Statistika STIS**

Untuk keperluan pendidikan dan penelitian. Tidak untuk penggunaan komersial tanpa izin.

---

## Contact & Support

**Team Communication:**
- Daily Standup: WhatsApp group
- Weekly Review: Tatap muka, waktu menyusul
- GitLab Issues: [Create Issue](https://git.stis.ac.id/rpl-lancarnyaman/desa-cantik-frontend/-/issues)

---
<div align="center">

### **Dibangun dengan lancar dan nyaman oleh Tim 4 Kelas 3SI1**

**Politeknik Statistika STIS • Jakarta • 2025**

[Documentation](docs/) • [Report Bug](https://git.stis.ac.id/rpl-lancarnyaman/desa-cantik-frontend/-/issues) • [Request Feature](https://git.stis.ac.id/rpl-lancarnyaman/desa-cantik-frontend/-/issues)

</div>