// src/routes/index.jsx
import { BrowserRouter as Router, Routes, Route, Link, useParams, Outlet } from "react-router-dom";

// Impor Halaman Publik
import Home from "@/pages/public/Home";
import Login from "@/pages/public/Login";
import ForgotPassword from "@/pages/public/ForgotPassword";
import ResetPassword from "@/pages/public/ResetPassword";
import Tentang from "@/pages/public/Tentang";
import VillageDetail from "@/pages/public/VillageDetail";
import PublicationDetail from "@/pages/public/PublicationDetail";

// --- Impor Halaman Admin BPS ---
import DashboardLayout from "@/layouts/DashboardLayout";
import DashboardAdmin from "@/pages/admin/DashboardAdmin";
import UbahPasswordAdminBPS from "@/pages/admin/UbahPasswordAdminBPS";
import PetaTematikAdmin from "@/pages/admin/PetaTematikAdmin";
import ModulDesaAdmin from "@/pages/admin/ModulDesaAdmin";
import DaftarDesaAdmin from "@/pages/admin/DaftarDesaAdmin";
import PerangkatDesaAdmin from "@/pages/admin/PerangkatDesaAdmin";
import PublikasiDesaAdmin from "@/pages/admin/PublikasiDesaAdmin";
import DataStatistikAdmin from "@/pages/admin/DataStatistikAdmin";
import TimPengelolaAdmin from "@/pages/admin/TimPengelolaAdmin";
import FooterAdmin from "@/pages/admin/FooterAdmin";

// --- Impor Halaman Perangkat Desa ---
import DashboardDesa from "@/pages/desa/DashboardDesa";
import UbahPasswordPerangkatDesa from "@/pages/desa/UbahPasswordPerangkatDesa";
import PetaTematikDesa from "@/pages/desa/PetaTematikDesa";
import ProfilUmumDesa from "@/pages/desa/ProfilUmumDesa";
import PublikasiDesa from "@/pages/desa/PublikasiDesa";
import DataStatistikDesa from "@/pages/desa/DataStatistikDesa";
import ModulDesaPerangkatDesa from "@/pages/desa/ModulDesaPerangkatDesa";
import DokumentasiDesa from "@/pages/desa/DokumentasiDesa";

// --- Impor Halaman Publik Layanan Online ---
import SuratPengantarPublic from "@/pages/public/layanan/SuratPengantarPublic";
import StatusPengantarPublic from "@/pages/public/layanan/StatusPengantarPublic";
import PengaduanPublic from "@/pages/public/layanan/PengaduanPublic";
import StatusPengaduanPublic from "@/pages/public/layanan/StatusPengaduanPublic";
import BukuTamuPublic from "@/pages/public/layanan/BukuTamuPublic";

// --- Impor Halaman Dashboard Perangkat Desa Layanan Online ---
import SuratPengantarDesa from "@/pages/desa/SuratPengantarDesa";
import PengaduanDesa from "@/pages/desa/PengaduanDesa";
import BukuTamuDesa from "@/pages/desa/BukuTamuDesa";

// Komponen Rute Terlindungi
import ProtectedRoute from "@/components/shared/ProtectedRoute";

// Komponen placeholder
const Placeholder = ({ pageName }) => (
  <div className="p-10 text-center">
    <h1 className="text-3xl font-bold text-red-500">Halaman Placeholder</h1>
    <p className="text-xl mt-2">Halaman untuk "{pageName}" belum dibuat.</p>
    <Link to="/" className="text-blue-600 hover:underline mt-4 inline-block">
      &larr; Kembali ke Home
    </Link>
  </div>
);

const getSubdomain = () => {
  const hostname = window.location.hostname;
  if (/^[0-9.]+$/.test(hostname)) {
    return null;
  }
  const parts = hostname.split('.');
  const isTwoPartTld = parts[parts.length - 2] === 'co' || parts[parts.length - 2] === 'web' || parts[parts.length - 2] === 'go';
  const minPartsForSubdomain = isTwoPartTld ? 4 : 3;

  if (parts.length < minPartsForSubdomain || parts[0] === 'www' || parts[0] === 'api') {
    return null;
  }
  return parts[0];
};

function AppRoutes() {
  const subdomain = getSubdomain();

  return (
    <Router>
      <Routes>
        {/* --- Rute Publik --- */}
        <Route path="/" element={subdomain ? <VillageDetail /> : <Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/tentang" element={<Tentang />} />
        <Route path="/desa/:slug" element={<VillageDetail />} />
        <Route path="/desa/:slug/layanan-online/surat-pengantar" element={<SuratPengantarPublic />} />
        <Route path="/desa/:slug/layanan-online/status-pengantar" element={<StatusPengantarPublic />} />
        <Route path="/desa/:slug/layanan-online/pengaduan" element={<PengaduanPublic />} />
        <Route path="/desa/:slug/layanan-online/status-pengaduan" element={<StatusPengaduanPublic />} />
        <Route path="/desa/:slug/layanan-online/buku-tamu" element={<BukuTamuPublic />} />
        <Route path="/publikasi/:id" element={<PublicationDetail />} />
        <Route path="/lupa-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* --- 2. Rute Layout Admin (Internal) --- */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["bps_admin"]}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<DashboardAdmin />} />
          <Route path="perangkat-desa" element={<PerangkatDesaAdmin pageName="Admin: Perangkat Desa" />} />
          <Route path="daftar-desa" element={<DaftarDesaAdmin pageName="Admin: Daftar Desa" />} />
          <Route path="modul-desa" element={<ModulDesaAdmin pageName="Admin: Modul Desa" />} />
          <Route path="data-statistik" element={<DataStatistikAdmin />} />
          <Route path="publikasi" element={<PublikasiDesaAdmin pageName="Admin: Publikasi" />} />
          <Route path="peta-tematik" element={<PetaTematikAdmin />} />
          <Route path="tim-pengelola" element={<TimPengelolaAdmin />} />
          <Route path="footer" element={<FooterAdmin />} />
          <Route path="ubah-password" element={<UbahPasswordAdminBPS />} />
          <Route index element={<DashboardAdmin />} />
        </Route>

        {/* --- 3. Rute Layout Perangkat Desa (Internal) --- */}
        <Route
          path={subdomain ? "" : "/:villageSlug"}
          element={
            <ProtectedRoute allowedRoles={["village_officer"]}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<DashboardDesa />} />
          <Route path="profil-umum" element={<ProfilUmumDesa pageName="Desa: Profil Umum" />} />
          <Route path="publikasi" element={<PublikasiDesa pageName="Desa: Publikasi" />} />
          <Route path="modul-desa" element={<ModulDesaPerangkatDesa pageName="Desa: Modul Desa" />} />
          <Route path="data-statistik" element={<DataStatistikDesa pageName="Desa: Data Statistik" />} />
          <Route path="peta-tematik" element={<PetaTematikDesa />} />
          <Route path="dokumentasi" element={<DokumentasiDesa />} />
          <Route path="surat-pengantar" element={<SuratPengantarDesa />} />
          <Route path="pengaduan" element={<PengaduanDesa />} />
          <Route path="buku-tamu" element={<BukuTamuDesa />} />
          <Route path="ubah-password" element={<UbahPasswordPerangkatDesa />} />
          {!subdomain && <Route index element={<DashboardDesa />} />}
        </Route>
      </Routes>
    </Router>
  );
}

export default AppRoutes;
