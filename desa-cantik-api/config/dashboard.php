<?php

return [
    'cache_ttl' => env('APP_ENV') === 'local' ? 0 : 300, // bypass cache in local development

    'public_statistics_codes' => [
        'total_population' => 'Jumlah Penduduk',
        'total_umkm' => 'Jumlah UMKM',
        'literacy_rate_avg' => 'Angka Melek Huruf',
    ],

    'profile_required_fields' => [
        'village_code',
        'name',
        'kecamatan',
        'kabupaten',
        'deskripsi',
        'area',
        'population',
        'logo_url',
    ],
];
