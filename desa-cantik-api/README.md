# Desa Cantik API
**Sistem Informasi Desa Cinta Statistik Toraja Utara**  
Backend API - Laravel 12 | PHP 8.2 | MySQL 8.0

[![Laravel](https://img.shields.io/badge/Laravel-12.37-FF2D20?style=flat&logo=laravel&logoColor=white)](https://laravel.com)
[![PHP](https://img.shields.io/badge/PHP-8.2-777BB4?style=flat&logo=php&logoColor=white)](https://www.php.net)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=flat&logo=mysql&logoColor=white)](https://www.mysql.com)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat&logo=docker&logoColor=white)](https://www.docker.com)

---
## Daftar Isi

- [Tentang Proyek](#tentang-proyek)
- [Tim Pengembang](#tim-pengembang)
- [Tech Stack](#tech-stack)
- [Fitur Utama](#fitur-utama)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Struktur Database](#struktur-database)
- [Test Credentials](#test-credentials)
- [Development Workflow](#development-workflow)
- [API Documentation](#api-documentation)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [Documentation](#documentation)
- [Project Structure](#project-structure)
- [Security](#security)
- [License](#license)
- [Contact & Support](#contact--support)
- [Acknowledgments](#acknowledgments)
- [Project Stats](#project-stats)

---

## Tentang Proyek

**Sistem Informasi Desa Cinta Statistik (Cantik)** merupakan sistem informasi berbasis web untuk pengelolaan dan publikasi data statistik desa binaan BPS Kabupaten Toraja Utara, saat ini meliputi Desa Nonongan Selatan dan Desa Rindingbatu.

### Tujuan Sistem
- **Pengelolaan Data Statistik**: Mengelola indikator statistik desa secara terstruktur
- **Publikasi**: Upload dan kelola dokumen publikasi
- **Peta Tematik**: Visualisasi data geospasial dengan GeoJSON
- **Multi-User Access**: Role-based access (Pegawai BPS, Perangkat Desa, Masyarakat Umum)
- **Keamanan Data**: Menggunakan JWT authentication dan authorization

### Lingkup Proyek
- **Organisasi:** BPS Kabupaten Toraja Utara
- **Desa Binaan:** Nonongan Selatan, Rindingbatu

---

## Tim Pengembang

**Tim 4 Kelas 3SI1**

| Nama                                  | NIM       | Role                               |
| ------------------------------------- | --------- | ---------------------------------- |
| **Teguh Christianto Simbolon**        | 222313403 | Project Manager, Backend Developer |
| **Alif Zakiansyah As Syauqi**         | 222312958 | Lead Backend Developer             |
| **Ahmad Adib Husaini Al Munawwar**    | 222312948 | Backend Developer                  |
| **Amir Syaifudin**                    | 222312968 | Lead Frontend Developer            |
| **Anggita Cristin Meylani**           | 222312982 | Frontend Developer                 |
| **Nyimas Virna Salsa Lestari Risqia** | 222313307 | Frontend Developer                 |

**Institusi:** Politeknik Statistika STIS Program Studi D-IV Komputasi Statistik

---

## Tech Stack

### Backend (API)
- **Framework:** Laravel 12.37.0
- **Language:** PHP 8.2.29
- **Database:** MySQL 8.0
- **Web Server:** Nginx Alpine
- **Authentication:** Laravel Sanctum (Bearer Token)
- **Dokumentasi API:** OpenAPI 3.0 (atribut swagger-php) — dihasilkan melalui `php artisan openapi:generate`
- **Testing:** PHPUnit, Pest

### Infrastruktur
- **Kontainerisasi:** Docker & Docker Compose
- **Orkestrasi:** Docker Compose v2
- **Kontrol Versi:** Git & GitLab
- **CI/CD:** GitLab CI/CD (Direncanakan)

### Alat Pengembangan
- **Memori PHP:** 1GB (untuk menangani file besar)
- **Batas Upload:** 200MB (publikasi PDF)
- **Ukuran Paket Database:** 200MB
- **Driver Session:** Database
- **Driver Cache:** File (pengembangan) / Redis (produksi)

---

## Fitur Utama

### 1. Manajemen Pengguna & Autentikasi
- Login dengan Laravel Sanctum (Bearer Token)
- Role-based Access Control (RBAC)
  - Admin BPS: Akses penuh ke semua desa dan fungsi admin
  - Perangkat Desa: Akses hanya ke data desa yang ditugaskan
  - Tamu (Publik): Akses baca saja tanpa autentikasi
- Manajemen profil pengguna
- Reset password dengan token
- Logout & logout all devices

### 2. Manajemen Data Desa
- CRUD daftar desa
- Profil desa (deskripsi, visi-misi, logo)
- Aktivasi/deaktivasi modul per desa
- Tampilkan/sembunyikan desa dari portal publik

### 3. Statistik Desa
- Kelola indikator statistik (kategori, unit, deskripsi)
- Input data statistik time-series (per tahun)
- Impor data CSV massal
- Ekspor data ke CSV/Excel
- Visualisasi data (grafik, diagram)

### 4. Publikasi Laporan
- Upload file PDF (max 200MB)
- Metadata publikasi (judul, deskripsi, kategori)
- Download publikasi
- Soft delete

### 5. Peta Tematik
- Upload GeoJSON batas desa
- Manajemen berbagai layer tematik
- Konfigurasi tampilan peta (warna, opacity)
- Link indikator ke peta tematik

---

## Prerequisites

Pastikan sudah terinstall:

- **Docker** v20.10 atau lebih baru
- **Docker Compose** v2.0 atau lebih baru
- **Git** v2.30 atau lebih baru
- **WSL2** (untuk pengguna Windows)

### Verifikasi Instalasi

```bash
docker --version
# Docker version 20.10.x atau lebih baru

docker-compose --version
# Docker Compose version v2.x.x atau lebih baru

git --version
# git version 2.30.x atau lebih baru
```

---

## Quick Start

### 1. Clone Repository

```bash
git clone https://git.stis.ac.id/rpl-lancarnyaman/desa-cantik-api.git
cd desa-cantik-api
```

### 2. Setup Environment

```bash
# Copy environment file
cp .env.example .env

# Edit .env jika perlu (opsional)
nano .env
```

### 3. Start Docker Containers

```bash
# Build & start semua services
docker-compose up -d --build

# Tunggu ~30 detik sampai semua container ready
```

### Fast Mode (docker-compose.fast.yml) - Mode Pengembangan Cepat

Jika Anda ingin menjalankan container dengan performa lebih baik (lebih cepat), gunakan `docker-compose.fast.yml`.
Mode ini melakukan dua hal utama:

- `BAKE_VENDOR=1` saat build image: menjalankan `composer install` di saat build sehingga dependency PHP (`vendor/`) di-bake ke dalam image.
- Menggunakan `vendor_data` sebagai named volume untuk menaruh `vendor/` di dalam volume kontainer, sehingga mengurangi I/O dari bind mount host pada Windows/macOS.

Catatan: mode ini tetap mempertahankan bind mount kode proyek agar Anda tetap bisa mengedit kode, tetapi file vendor akan diambil dari volume yang lebih cepat.

Contoh perintah (Docker):
```bash
docker compose -f .\docker-compose.yml -f .\docker-compose.fast.yml up -d --build
```

Contoh perintah (Podman):
```powershell
podman compose -f docker-compose.yml -f docker-compose.fast.yml up -d --build
```

Jika Anda ingin mengembalikan `vendor` ke kondisi bawaan (mis. setelah mengubah dependensi), hapus volume `vendor_data` lalu jalankan kembali:
```bash
docker compose -f docker-compose.yml -f docker-compose.fast.yml down -v
docker volume rm <project>_vendor_data
docker compose -f docker-compose.yml -f docker-compose.fast.yml up -d --build
```

Atau, untuk memaksa populasi manual `vendor_data` dari container (mis. jika Anda tidak menggunakan build baking):
```bash
docker compose exec app composer install --no-interaction --prefer-dist --optimize-autoloader
docker compose exec app chown -R www-data:www-data /var/www/vendor
```

Catatan khusus (Windows/Podman): Pastikan `-f` berada sebelum perintah `up` saat menggunakan `podman compose` pada Windows, misalnya `podman compose -f docker-compose.yml -f docker-compose.fast.yml up -d --build`.

Gunakan mode ini bila Anda ingin melakukan benchmark/perbandingan performa antara native vs docker (kecepatan request yang lebih cepat terutama bila `vendor/` sangat besar).


### 4. Install Dependencies

```bash
# Masuk ke container app
docker-compose exec app bash

# Install Composer packages
composer install

# Generate application key
php artisan key:generate

# Create storage symbolic link
php artisan storage:link

# Exit container
exit
```

### 5. Run Migrations & Seeders

```bash
# Run database migrations
docker-compose exec app php artisan migrate

# Seed data dummy (includes test data)
docker-compose exec app php artisan db:seed
```

**Seeder yang tersedia:**
- `RoleSeeder` - Roles (bps_admin, village_officer)
- `VillageSeeder` - Master data desa (Nonongan Selatan, Rindingbatu)
- `StatisticTypeSeeder` - Master indikator statistik (10 jenis)
- `UserSeeder` - User test credentials
- `GeospatialDataSeeder` - Data geospasial (GeoJSON)
- `ThematicMapSeeder` - Peta tematik per desa
- `PublicationSeeder` - Publikasi dokumen (10 records)
- `VillageStatisticSeeder` - Data statistik time-series (60 records)
- `VillageModuleSeeder` - Aktivasi modul per desa (6 records)
- `MapPointSeeder` - Titik peta tematik (20 records)


**Re-seed database:**
```bash
docker-compose exec app php artisan migrate:fresh --seed
```

**Catatan:** DatabaseSeeder berisi pemanggilan duplikat (PublicationSeeder, VillageStatisticSeeder, VillageModuleSeeder dipanggil dua kali) - ini disengaja untuk tujuan pembuatan data.

### 6. Verify Installation

```bash
# Test API endpoint
curl -I http://localhost:8000

# Expected: HTTP/1.1 200 OK
```

### 7. Access Application

Buka browser:
```
http://localhost:8000
```

**Sukses!** Jika muncul Laravel welcome page, instalasi berhasil!

### 8. Verify Database Seeding

```bash
# Cek data yang sudah terisi
docker-compose exec mysql mysql -u desa_cantik_user -pDesaCantik2025! desa_cantik_db -e "SELECT 'Roles' as table_name, COUNT(*) as count FROM roles UNION ALL SELECT 'Villages', COUNT(*) FROM villages UNION ALL SELECT 'Users', COUNT(*) FROM users UNION ALL SELECT 'Publications', COUNT(*) FROM publications UNION ALL SELECT 'Village Statistics', COUNT(*) FROM village_statistics;"
```

**Expected output:**
- Roles: 2
- Villages: 2
- Users: 3
- Publications: 10
- Village Statistics: 60
- Village Modules: 6
- Map Points: 20

---

## Struktur Database

### Tabel Aplikasi (15 tabel)

| Tabel                     | Deskripsi                               | Relasi                                          |
| ------------------------- | --------------------------------------- | ----------------------------------------------- |
| **roles**                 | Role user (Pegawai BPS, Perangkat Desa) | → users                                         |
| **villages**              | Master data desa                        | → users, village_profiles, village_modules, dll |
| **users**                 | Akun pengguna sistem                    | ← roles, ← villages                             |
| **village_profiles**      | Profil lengkap desa (1:1)               | ← villages                                      |
| **village_modules**       | Aktivasi modul per desa                 | ← villages                                      |
| **statistic_types**       | Master indikator statistik              | → village_statistics                            |
| **village_statistics**    | Data statistik time-series              | ← villages, ← statistic_types                   |
| **publications**          | File publikasi PDF                      | ← villages                                      |
| **geospatial_data**       | GeoJSON boundary desa                   | ← villages                                      |
| **thematic_maps**         | Layer peta tematik                      | ← villages                                      |
| **map_points**            | Titik lokasi di peta tematik            | ← thematic_maps                                 |
| **thematic_indicators**   | Junction table (maps ↔ indicators)      | ← thematic_maps, ← statistic_types              |
| **activity_logs**         | Log aktivitas pengguna                  | ← users, ← villages                             |
| **media**                 | Media files (Spatie Media Library)      | -                                               |
| **password_reset_tokens** | Token reset password                    | ← users                                         |

### Tabel Laravel System (8 tabel)

- `cache`, `cache_locks` - Cache storage
- `sessions` - Session database driver
- `jobs`, `job_batches`, `failed_jobs` - Queue system
- `migrations` - Migration tracker
- `personal_access_tokens` - Sanctum tokens

**Total:** 23 tabel

### Data Test yang Tersedia

Setelah menjalankan `php artisan db:seed`, database akan terisi dengan:

- **2 Roles**: bps_admin, village_officer
- **2 Villages**: Nonongan Selatan, Rindingbatu
- **3 Users**: Admin BPS + 2 Perangkat Desa
- **2 Village Profiles**: Profil lengkap per desa
- **10 Statistic Types**: Indikator statistik (Populasi, UMKM, dll)
- **60 Village Statistics**: Data statistik 3 tahun (2022-2024) × 10 jenis × 2 desa
- **6 Geospatial Data**: GeoJSON per desa (Polygon, Point, LineString)
- **6 Thematic Maps**: 3 peta per desa (Kepadatan Penduduk, Fasilitas Pendidikan, Fasilitas Kesehatan)
- **20 Map Points**: Titik lokasi di peta tematik
- **10 Publications**: Dokumen publikasi per desa
- **6 Village Modules**: Modul aktif per desa

### Entity Relationship Diagram (ERD)

Lihat dokumentasi lengkap di:
- **Laporan Progres Milestone 2 Tim 4 Kelas 3SI1:** Halaman 48-49

---

## Test Credentials

**Catatan:** Pengguna tamu/publik tidak perlu login - mereka memiliki akses baca saja ke data publik.

### Admin BPS (Full Access)
```
Email: admin@bps.go.id
Password: password123
Role: bps_admin
Access: Full access to all villages and admin functions
```

### Perangkat Desa - Nonongan Selatan
```
Email: nonongan@desacantik.id
Password: password123
Role: village_officer
Access: Data for Desa Nonongan Selatan only
```

### Perangkat Desa - Rindingbatu
```
Email: rindingbatu@desacantik.id
Password: password123
Role: village_officer
Access: Data for Desa Rindingbatu only
```

**PENTING:** Ganti password default sebelum production deployment!

---

## Development Workflow

### Git Branch Strategy (GitFlow)

```
main (production)
 ↑
 └─ develop (integration)
      ↑
      ├─ feature/authentication
      ├─ feature/desa-management
      ├─ feature/statistics
      ├─ feature/publications
      ├─ feature/maps
      └─ bugfix/issue-xxx
```

### Workflow Steps

1. **Create Feature Branch**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/your-feature-name
   ```

2. **Development**
   ```bash
   # Make changes
   git add .
   git commit -m "feat: add your feature"
   ```

3. **Push & Create Merge Request**
   ```bash
   git push origin feature/your-feature-name
   ```

4. **Code Review & Merge**
   - Create Merge Request di GitLab
   - Request review dari team
   - Fix review comments
   - Merge ke `develop`

5. **Delete Feature Branch**
   ```bash
   git branch -d feature/your-feature-name
   git push origin --delete feature/your-feature-name
   ```

### Commit Message Convention

Gunakan [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add user authentication API
fix: resolve database connection timeout
docs: update README installation steps
style: format code with PSR-12
refactor: restructure controller methods
test: add unit tests for User model
chore: update composer dependencies
```

---

## API Documentation

### API Documentation (OpenAPI 3.0)

- Base URL: `${APP_URL}/api` (default: `http://localhost:8000/api`)
- Swagger UI: `http://localhost:8000/api/documentation`
- Spec output (generated by `openapi:generate`):
   - JSON: `storage/api-docs/api-docs.json`
   - YAML: `storage/api-docs/api-docs.yaml`

Generate/rebuild manually:
```bash
# generate JSON spec
php artisan openapi:generate

# generate JSON + YAML
php artisan openapi:generate --yaml
```

Notes:
- Autentikasi menggunakan token bearer Sanctum. Gunakan tombol "Authorize" di Swagger UI dan tempel `Bearer <token>` dari `/api/v1/auth/login`.
- Sumber anotasi terletak di `app/Docs` dan controller di `app/Http/Controllers/Api`.
- Untuk melayani UI secara lokal, rute `/api/documentation` akan menampilkan Swagger UI minimal yang mengambil spesifikasi JSON dari `/api/documentation/json`.
- Konfigurasi pembuatan API: `config/swagger.php` berisi path scan dan pengaturan output yang digunakan oleh perintah generator. Secara default diatur untuk memindai `app/Http/Controllers/Api` dan `app/Docs` serta menulis file yang dihasilkan ke `storage/api-docs`.

Pemeriksaan cepat dan contoh pengambilan
```bash
# generate JSON spec
php artisan openapi:generate

# generate JSON + YAML
php artisan openapi:generate --yaml

# view JSON spec using CLI
curl -s http://localhost:8000/api/documentation/json | jq .

# download YAML spec
curl -o api-docs.yaml http://localhost:8000/api/documentation/yaml
```

### Koleksi Postman

Koleksi Postman tersedia di:
```
/docs/postman/Desa-Cantik-API.postman_collection.json
```

### Ringkasan Endpoint API

**Endpoint Publik (Tidak Memerlukan Autentikasi):**
- `GET /api/v1/villages` - List desa
- `GET /api/v1/villages/{id}` - Detail desa
- `GET /api/v1/villages/{id}/profile` - Profil desa
- `GET /api/v1/villages/{id}/statistics` - Data statistik (dengan filter year, statistic_type_id)
- `GET /api/v1/villages/{id}/statistics/summary` - Ringkasan statistik
- `GET /api/v1/villages/{id}/statistics/export` - Export statistik ke CSV/Excel (throttled)
- `GET /api/v1/villages/{id}/publications` - Publikasi
- `GET /api/v1/publications/{id}` - Detail publikasi
- `GET /api/v1/publications/{id}/download` - Download publikasi
- `GET /api/v1/villages/{id}/geospatial` - Data geospasial
- `GET /api/v1/villages/{id}/geospatial/{geo}` - Detail geospatial
- `GET /api/v1/villages/{id}/thematic-maps` - Peta tematik
- `GET /api/v1/thematic-maps/{map}` - Detail peta tematik
- `GET /api/v1/statistic-types` - Daftar tipe statistik
- `GET /api/v1/statistics/validation-flow` - Status alur validasi statistik
- `GET /api/v1/dashboard/public` - Dashboard publik
- `POST /api/v1/auth/register` - Register user baru
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/password/forgot` - Forgot password
- `POST /api/v1/auth/password/reset` - Reset password

**Endpoint Terlindungi (Memerlukan Autentikasi):**
- `GET /api/v1/auth/user` - User profile
- `PUT /api/v1/auth/password` - Update password
- `GET /api/v1/dashboard/admin` - Dashboard admin (BPS Admin only)
- `GET /api/v1/dashboard/village` - Dashboard desa (BPS Admin + Village Officer)
- `POST /api/v1/villages/{id}/statistics` - Create statistik
- `PUT /api/v1/villages/{id}/statistics/{id}` - Update statistik
- `DELETE /api/v1/villages/{id}/statistics/{id}` - Delete statistik
- `POST /api/v1/villages/{id}/statistics/import` - Import statistik dari CSV (throttled)
- `PUT /api/v1/villages/{id}/statistics/{id}/approve` - Approve statistik (BPS Admin)
- `PUT /api/v1/villages/{id}/statistics/{id}/reject` - Reject statistik dengan reason (BPS Admin)
- `POST /api/v1/villages/{id}/publications` - Upload publikasi
- `PUT /api/v1/villages/{id}/publications/{id}` - Update publikasi
- `POST /api/v1/villages/{id}/publications/{id}/replace-file` - Replace file publikasi
- `DELETE /api/v1/villages/{id}/publications/{id}` - Delete publikasi
- `PUT /api/v1/villages/{id}/profile` - Update profil desa
- `POST /api/v1/villages/{id}/profile/logo` - Upload logo desa
- `GET /api/v1/villages/{id}/modules` - List modul desa (BPS Admin)
- `POST /api/v1/villages/{id}/modules` - Create modul desa (BPS Admin)
- `PUT /api/v1/villages/{id}/modules/{id}` - Update modul desa (BPS Admin)
- `PUT /api/v1/villages/{id}/modules/{id}/toggle` - Toggle modul status (BPS Admin)
- `DELETE /api/v1/villages/{id}/modules/{id}` - Delete modul (BPS Admin)
- `GET /api/v1/villages/{id}/documentation` - Get village documentation (BPS Admin + Village Officer)
- `GET /api/v1/users` - List users (BPS Admin)
- `GET /api/v1/users/{id}` - Get user details (BPS Admin)
- `POST /api/v1/users` - Create user (BPS Admin)
- `PUT /api/v1/users/{id}` - Update user (BPS Admin)
- `PUT /api/v1/users/{id}/reset-password` - Reset user password (BPS Admin)
- `DELETE /api/v1/users/{id}` - Delete user (BPS Admin)
- `GET /api/v1/activity-logs` - Activity logs (BPS Admin)
- `GET /api/v1/activity-logs/export` - Export activity logs (BPS Admin)
- `GET /api/v1/activity-logs/{id}` - Get activity log details (BPS Admin)

**Endpoint Khusus Admin (Admin BPS melalui auth:sanctum + role:bps_admin):**
- `POST /api/v1/villages` - Create desa
- `PUT /api/v1/villages/{id}` - Update desa
- `DELETE /api/v1/villages/{id}` - Delete desa (soft delete)
- `PUT /api/v1/villages/{id}/toggle-status` - Toggle village visibility
- `GET /api/v1/statistics` - List all statistics cross-village
- `POST /api/v1/villages/{id}/geospatial` - Create geospatial data
- `PUT /api/v1/villages/{id}/geospatial/{geo}` - Update geospatial data
- `DELETE /api/v1/villages/{id}/geospatial/{geo}` - Delete geospatial data
- `POST /api/v1/villages/{id}/thematic-maps` - Create thematic map
- `PUT /api/v1/villages/{id}/thematic-maps/{map}` - Update thematic map
- `DELETE /api/v1/villages/{id}/thematic-maps/{map}` - Delete thematic map

---

## Pemecahan Masalah

### Container tidak start

```bash
# Check logs
docker-compose logs app
docker-compose logs mysql
docker-compose logs nginx

# Restart containers
docker-compose restart

# Rebuild jika perlu
docker-compose down
docker-compose up -d --build
```

### Error: "Connection refused"

```bash
# Pastikan container running
docker-compose ps

# Expected: 3 containers dengan status "Up"
```

### Error: "Table not found"

```bash
# Run migrations
docker-compose exec app php artisan migrate

# Atau fresh migrate
docker-compose exec app php artisan migrate:fresh --seed
```

### Error: "Permission denied" (Storage)

```bash
# Fix permissions
docker-compose exec app chown -R www-data:www-data storage bootstrap/cache
docker-compose exec app chmod -R 775 storage bootstrap/cache
```

### Port 8000 sudah digunakan

```bash
# Edit docker-compose.yml
# Ganti port nginx:
#   ports:
#     - "8080:80"  # Ganti 8000 ke 8080

# Restart
docker-compose down
docker-compose up -d
```

### Debugging Commands

```bash
# Check container logs
docker-compose logs -f app

# Execute commands in container
docker-compose exec app php artisan tinker

# Check database
docker-compose exec mysql mysql -u desa_cantik_user -p

# Restart specific service
docker-compose restart app
```

---

## Contributing

### Setup Development Environment

```bash
# 1. Clone & setup
git clone https://git.stis.ac.id/rpl-lancarnyaman/desa-cantik-api.git
cd desa-cantik-api
cp .env.example .env

# 2. Start Docker
docker-compose up -d

# 3. Install dependencies
docker-compose exec app composer install

# 4. Run migrations
docker-compose exec app php artisan migrate:fresh --seed

# 5. Create your feature branch
git checkout -b feature/your-feature
```

### Code Style

Proyek ini menggunakan **PSR-12** coding standard:

```bash
# Format code
docker-compose exec app ./vendor/bin/pint

# Check style
docker-compose exec app ./vendor/bin/phpcs
```

### Menjalankan Tests

**Status:** Struktur test suite sudah ada (`phpunit.xml`, `phpunit.mysql.xml`) tetapi belum ada test yang diimplementasikan.

Saat menambahkan test:
```bash
# Run all tests
docker-compose exec app php artisan test

# Run specific test
docker-compose exec app php artisan test --filter=UserTest

# With coverage
docker-compose exec app php artisan test --coverage
```

### Daftar Periksa Pull Request

- [ ] Kode mengikuti standar PSR-12
- [ ] Semua tes berhasil
- [ ] Tidak ada konflik merge dengan develop
- [ ] File migrasi disertakan (jika ada perubahan DB)
- [ ] Dokumentasi API diperbarui (jika ada endpoint baru)
- [ ] Pesan commit mengikuti konvensi
- [ ] Nama branch deskriptif (feature/*, bugfix/*)

---

## Documentation

**Semua dokumentasi proyek tersimpan di repository frontend:**

**[desa-cantik-frontend/docs/](https://git.stis.ac.id/rpl-lancarnyaman/desa-cantik-frontend/-/tree/develop/docs)**

### Dokumen Resmi
| Dokumen | Deskripsi | Link |
|---------|-----------|------|
| **Laporan Final Project** | Laporan akhir pengembangan sistem| [📥 Download PDF](https://git.stis.ac.id/rpl-lancarnyaman/desa-cantik-frontend/-/blob/develop/docs/Laporan_Final_Projek_3SI1_Tim_4.pdf) |
| **Petunjuk Instalasi & Penggunaan** | User Manual lengkap untuk Admin BPS, Perangkat Desa, dan Masyarakat | [📥 Download PDF](https://git.stis.ac.id/rpl-lancarnyaman/desa-cantik-frontend/-/blob/develop/docs/Petunjuk_Instalasi_dan_Penggunaan.pdf) |
| **Lisensi & Alih Hak Sistem** | Perjanjian lisensi dan alih hak sistem kepada BPS Toraja Utara | [📥 Download PDF](https://git.stis.ac.id/rpl-lancarnyaman/desa-cantik-frontend/-/blob/develop/docs/Perjanjian_Lisensi_Desa_Cantik_Toraja_Utara.pdf) |
| **BAST** | Berita Acara Serah Terima sistem kepada klien (BPS Toraja Utara) | [📥 Download PDF](https://git.stis.ac.id/rpl-lancarnyaman/desa-cantik-frontend/-/blob/develop/docs/Berita_Acara_Serah_Terima_Desa_Cantik_Toraja_Utara.pdf) |

### 📖 Backend-Specific Documentation

- **API Routes:** Lihat [routes/api.php](./routes/api.php)
- **Database Schema:** Lihat [Struktur Database](#struktur-database)
- **OpenAPI Specification:** Generate dengan `php artisan openapi:generate`

### 🔗 Resources

- [Laravel 12 Documentation](https://laravel.com/docs/12.x)
- [Docker Documentation](https://docs.docker.com)
- [GitLab CI/CD Guide](https://docs.gitlab.com/ee/ci/)
- [Laravel Sanctum](https://laravel.com/docs/12.x/sanctum)

## Project Structure

```
desa-cantik-api/
├── app/
│   ├── Http/
│   │   ├── Controllers/    # API Controllers
│   │   ├── Middleware/     # Custom middleware
│   │   └── Resources/      # API Resources
│   ├── Models/             # Eloquent Models
│   ├── Services/           # Business Logic
│   └── Policies/           # Authorization
├── database/
│   ├── migrations/         # Database migrations (32 files)
│   ├── seeders/            # Database seeders (10 files)
│   └── factories/          # Model factories
├── docker/
│   ├── nginx/              # Nginx configuration
│   ├── php/                # PHP-FPM configuration
│   └── mysql/              # MySQL configuration
├── routes/
│   ├── api.php             # API routes
│   └── web.php             # Web routes
├── tests/
│   ├── Feature/            # Feature tests
│   └── Unit/               # Unit tests
├── docs/                   # Project documentation
├── storage/                # Storage & logs
├── docker-compose.yml      # Docker orchestration
├── .env.example            # Environment template
├── docker-compose.yml       # Docker orchestration
├── composer.json            # PHP dependencies
├── phpunit.xml              # PHPUnit configuration
└── README.md                # This file
```

---

## Security

### Pelaporan Vulnerability

Jika menemukan security issue, **JANGAN** buat public issue. Hubungi:

- **Project Manager:** Teguh Christianto Simbolon (222313403@stis.ac.id)
- **Lead Backend Developer:** Alif Zakiansyah As Syauqi (222312958@stis.ac.id)

### Security Features
- Laravel Sanctum Authentication (Bearer Token)
- Password hashing (bcrypt)
- SQL Injection prevention (Eloquent ORM)
- XSS protection (Laravel built-in)
- CSRF protection
- Rate limiting (throttle middleware)
- CORS configuration
- Soft deletes untuk data sensitif
- Activity logging untuk audit trail  

---

## License

Proyek ini dikembangkan untuk keperluan akademik dengan lisensi sebagai berikut.

**Copyright © 2025 Tim 4 - Kelas 3SI1**  
**Politeknik Statistika STIS**

Untuk keperluan pendidikan dan penelitian. Tidak untuk penggunaan komersial tanpa izin.

---

## Contact & Support

### Support

- **Technical Issues:** Buat GitLab Issue
- **Questions:** Hubungi Project Manager atau Lead Backend Developer
- **Documentation:** Periksa di folder `/docs`

### Links

- **GitLab Repository:** https://git.stis.ac.id/rpl-lancarnyaman/desa-cantik-api
- **Project Board:** https://git.stis.ac.id/rpl-lancarnyaman/desa-cantik-api/-/boards
- **Milestones:** https://git.stis.ac.id/rpl-lancarnyaman/desa-cantik-api/-/milestones

---

## Acknowledgments

Terima kasih kepada:
- **Tim Desa Cantik BPS Kabupaten Toraja Utara** atas segala dukungan dan sumber daya yang diberikan.
- **Dosen Pembimbing** atas segala bimbingan dan petunjuk yang diberikan.
- **Politeknik Statistika STIS**
- **Open Source Community**

---

## Project Stats

![GitHub last commit](https://img.shields.io/badge/last%20commit-November%202025-brightgreen)
![GitHub contributors](https://img.shields.io/badge/contributors-6-blue)
![PHP Version](https://img.shields.io/badge/PHP-8.2-777BB4)
![Laravel Version](https://img.shields.io/badge/Laravel-12.37-FF2D20)
![Database](https://img.shields.io/badge/MySQL-8.0-4479A1)

---

<div align="center">

### Dibangun dengan lancar dan nyaman oleh Tim 4 Kelas 3SI1

**Politeknik Statistika STIS • Jakarta • 2025**

[Documentation](docs/) • [Report Bug](https://git.stis.ac.id/rpl-lancarnyaman/desa-cantik-api/-/issues) • [Request Feature](https://git.stis.ac.id/rpl-lancarnyaman/desa-cantik-api/-/issues)

</div>
