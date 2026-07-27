<?php

namespace Database\Seeders;

use App\Models\Publication;
use App\Models\User;
use App\Models\Village;
use Illuminate\Database\Seeder;

class PublicationSeeder extends Seeder
{
    /**
     * Seeding publikasi BERBEDA untuk setiap desa
     */
    public function run(): void
    {
        $villages = Village::all();
        $admin = User::where('email', 'admin@bps.go.id')->first();

        if ($villages->isEmpty()) {
            $this->command->warn('Tidak ada desa yang ditemukan. Silakan jalankan VillageSeeder terlebih dahulu.');

            return;
        }

        if (! $admin) {
            $this->command->warn('Pengguna admin tidak ditemukan. Silakan jalankan UserSeeder terlebih dahulu.');

            return;
        }

        // Publikasi berbeda untuk setiap desa
        $publicationsByVillage = [
            1 => [ // Nonongan Selatan - Wisata Adat
                [
                    'title' => 'Profil Wisata Adat Nonongan Selatan 2024',
                    'description' => 'Kompilasi lengkap objek wisata adat, ritual tradisional, dan landmark budaya yang dapat dikunjungi wisatawan.',
                    'category' => 'Statistik Desa',
                    'status' => 'Terverifikasi',
                    'file_path' => null, // No actual file - seeded data
                    'file_name' => 'profil-wisata-adat-nonongan-2024.pdf',
                    'file_type' => 'application/pdf',
                    'file_size_bytes' => 3355443,
                    'published_at' => now()->subMonths(1),
                ],
                [
                    'title' => 'Laporan Kunjungan Wisatawan Tahun 2024',
                    'description' => 'Statistik kunjungan wisatawan domestik dan mancanegara serta dampak ekonomi terhadap masyarakat lokal.',
                    'category' => 'Ekonomi Lokal',
                    'status' => 'Terverifikasi',
                    'file_path' => null, // No actual file - seeded data
                    'file_name' => 'laporan-kunjungan-wisatawan-2024.pdf',
                    'file_type' => 'application/pdf',
                    'file_size_bytes' => 1887436,
                    'published_at' => now()->subMonths(2),
                ],
                [
                    'title' => 'Panduan Rumah Adat Tongkonan',
                    'description' => 'Dokumentasi arsitektur, filosofi, dan sejarah rumah adat Tongkonan yang menjadi ikon Nonongan Selatan.',
                    'category' => 'Umum',
                    'status' => 'Terverifikasi',
                    'file_path' => null, // No actual file - seeded data
                    'file_name' => 'panduan-tongkonan-nonongan.pdf',
                    'file_type' => 'application/pdf',
                    'file_size_bytes' => 4718592,
                    'published_at' => now()->subMonths(3),
                ],
                [
                    'title' => 'Kalender Upacara Adat 2024-2025',
                    'description' => 'Jadwal lengkap upacara adat Rambu Solo, Rambu Tuka, dan ritual lainnya sepanjang tahun.',
                    'category' => 'Sosial',
                    'status' => 'Terverifikasi',
                    'file_path' => null, // No actual file - seeded data
                    'file_name' => 'kalender-upacara-adat-2024-2025.pdf',
                    'file_type' => 'application/pdf',
                    'file_size_bytes' => 1258291,
                    'published_at' => now()->subMonths(4),
                ],
                [
                    'title' => 'Laporan Statistik Desa 2024',
                    'description' => 'Data kependudukan, ekonomi, pendidikan, dan kesehatan Desa Nonongan Selatan.',
                    'category' => 'Statistik Desa',
                    'status' => 'Terverifikasi',
                    'file_path' => null, // No actual file - seeded data
                    'file_name' => 'laporan-statistik-nonongan-2024.pdf',
                    'file_type' => 'application/pdf',
                    'file_size_bytes' => 2201288,
                    'published_at' => now()->subMonths(1),
                ],
            ],
            2 => [ // Rindingbatu - Kerajinan Bambu
                [
                    'title' => 'Katalog Produk Kerajinan Bambu Rindingbatu 2024',
                    'description' => 'Daftar lengkap produk kerajinan bambu yang diproduksi pengrajin lokal, lengkap dengan harga dan kontak.',
                    'category' => 'Ekonomi Lokal',
                    'status' => 'Terverifikasi',
                    'file_path' => null, // No actual file - seeded data
                    'file_name' => 'katalog-kerajinan-bambu-2024.pdf',
                    'file_type' => 'application/pdf',
                    'file_size_bytes' => 6082560,
                    'published_at' => now()->subMonths(1),
                ],
                [
                    'title' => 'Panduan Budidaya Bambu Berkelanjutan',
                    'description' => 'Teknik budidaya, pemanenan, dan pengolahan bambu yang ramah lingkungan untuk menjaga keberlanjutan.',
                    'category' => 'Umum',
                    'status' => 'Terverifikasi',
                    'file_path' => null, // No actual file - seeded data
                    'file_name' => 'panduan-budidaya-bambu.pdf',
                    'file_type' => 'application/pdf',
                    'file_size_bytes' => 2621440,
                    'published_at' => now()->subMonths(2),
                ],
                [
                    'title' => 'Laporan Perkembangan UMKM Kerajinan 2024',
                    'description' => 'Analisis pertumbuhan usaha kerajinan bambu, omzet penjualan, dan jangkauan pasar.',
                    'category' => 'Ekonomi Lokal',
                    'status' => 'Terverifikasi',
                    'file_path' => null, // No actual file - seeded data
                    'file_name' => 'laporan-umkm-kerajinan-2024.pdf',
                    'file_type' => 'application/pdf',
                    'file_size_bytes' => 1782579,
                    'published_at' => now()->subMonths(3),
                ],
                [
                    'title' => 'Pelatihan Desain Produk Kerajinan Modern',
                    'description' => 'Dokumentasi program pelatihan inovasi desain kerajinan bambu dengan sentuhan modern.',
                    'category' => 'Pemerintahan',
                    'status' => 'Terverifikasi',
                    'file_path' => null, // No actual file - seeded data
                    'file_name' => 'pelatihan-desain-modern-2024.pdf',
                    'file_type' => 'application/pdf',
                    'file_size_bytes' => 3565158,
                    'published_at' => now()->subMonths(5),
                ],
                [
                    'title' => 'Profil Desa dan Data Statistik 2024',
                    'description' => 'Profil lengkap Desa Rindingbatu dengan data kependudukan, ekonomi, dan infrastruktur.',
                    'category' => 'Statistik Desa',
                    'status' => 'Terverifikasi',
                    'file_path' => null, // No actual file - seeded data
                    'file_name' => 'profil-desa-rindingbatu-2024.pdf',
                    'file_type' => 'application/pdf',
                    'file_size_bytes' => 2936012,
                    'published_at' => now()->subWeeks(2),
                ],
            ],
        ];

        foreach ($villages as $village) {
            $publications = $publicationsByVillage[$village->id] ?? [];

            foreach ($publications as $pub) {
                Publication::updateOrCreate(
                    [
                        'village_id' => $village->id,
                        'title' => $pub['title'],
                    ],
                    array_merge($pub, [
                        'village_id' => $village->id,
                        'uploaded_by' => $admin->id,
                    ])
                );
            }
        }

        $this->command->info('✓ ' . Publication::count() . ' unique publications created for each village');
    }
}
