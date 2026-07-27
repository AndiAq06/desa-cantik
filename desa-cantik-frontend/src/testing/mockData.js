// Data mock terpusat untuk pengujian UI lokal (tidak digunakan dalam alur produksi)

export const mockPublications = [
  {
    id: 1,
    title: "Laporan Statistik 2025",
    subject: "Statistik Desa",
    releaseDate: new Date("2025-10-10"),
    status: "Rilis",
    fileName: "laporan-statistik-2025.pdf",
    fileUrl: "/mock-files/laporan-statistik-2025.pdf",
  },
];

export const mockStatistics = [
  {
    id: 1,
    title: "Data Penduduk Lembang Nonongan Selatan 2024",
    subject: "Demografi",
    updatedDate: new Date("2025-11-15"),
    status: "Terverifikasi",
    fileName: "data-penduduk-2024.csv",
    fileUrl: "/mock-files/data-penduduk-2024.csv",
  },
];

export const mockGeospatial = [
  {
    id: "geo001",
    name: "Batas Wilayah Desa A",
    type: "Polygon",
    source: "data_desa_a.geojson",
  },
  {
    id: "geo002",
    name: "Titik Lokasi Sekolah",
    type: "Point",
    source: "data_sekolah.geojson",
  },
];
