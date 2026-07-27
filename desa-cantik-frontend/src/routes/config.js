// src/routes/config.js
import {
  LayoutDashboard,
  Users,
  MapPin,
  BookOpen,
  FileText,
  Map,
  Lock,
  User,
  BarChart3
} from 'lucide-react';

// Menu untuk Admin BPS
export const adminMenuItems = [
  { id: 'admin-dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
  { id: 'admin-daftar-desa', label: 'Daftar Desa', icon: MapPin, path: '/admin/daftar-desa' },
  { id: 'admin-perangkat-desa', label: 'Perangkat Desa', icon: Users, path: '/admin/perangkat-desa' },
  { id: 'admin-modul-desa', label: 'Modul Desa', icon: BookOpen, path: '/admin/modul-desa' },
  { id: 'admin-data-statistik', label: 'Data Statistik', icon: BarChart3, path: '/admin/data-statistik' },
  { id: 'admin-publikasi', label: 'Publikasi Desa', icon: FileText, path: '/admin/publikasi' },
  { id: 'admin-peta-tematik', label: 'Peta Tematik', icon: Map, path: '/admin/peta-tematik' },
  { id: 'admin-tim-pengelola', label: 'Tim Pengelola', icon: Users, path: '/admin/tim-pengelola' },
  { id: 'admin-footer', label: 'Kelola Kontak', icon: Users, path: '/admin/footer' },
  { id: 'admin-ubah-password', label: 'Ubah Password', icon: Lock, path: '/admin/ubah-password' },
];

// Menu untuk Perangkat Desa
export const villageMenuItems = [
  { id: 'desa-dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/desa-dashboard/dashboard' },
  { id: 'desa-profil-umum', label: 'Profil Umum', icon: User, path: '/desa-dashboard/profil-umum' },
  { id: 'desa-publikasi', label: 'Publikasi Desa', icon: FileText, path: '/desa-dashboard/publikasi' },
  { id: 'desa-modul-desa', label: 'Modul Desa', icon: BookOpen, path: '/desa-dashboard/modul-desa' },
  { id: 'desa-data-statistik', label: 'Data Statistik', icon: BarChart3, path: '/desa-dashboard/data-statistik' },
  { id: 'desa-peta-tematik', label: 'Peta Tematik', icon: Map, path: '/desa-dashboard/peta-tematik' },
  { id: 'desa-dokumentasi', label: 'Dokumentasi Kegiatan', icon: FileText, path: '/desa-dashboard/dokumentasi' },
  { id: 'desa-ubah-password', label: 'Ubah Password', icon: Lock, path: '/desa-dashboard/ubah-password' },
];