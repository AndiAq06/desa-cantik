import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Loader2, ArrowLeft } from "lucide-react";
import { villageService } from "@/services/villageService";
import { documentationService } from "@/services/documentationService";
import Footer from "@/components/shared/Footer";
import VillageDetailNavbar from "@/components/shared/VillageDetailNavbar";

export default function VillageGallery() {
  const { slug: paramSlug } = useParams();

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

  const subdomain = getSubdomain();
  const slug = paramSlug || subdomain;
  const id = slug;

  const [village, setVillage] = useState(null);
  const [documentation, setDocumentation] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingDocs, setLoadingDocs] = useState(true);

  useEffect(() => {
    const loadVillage = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await villageService.getVillageById(id);
        setVillage(data);
      } catch (err) {
        console.error("Gagal memuat detail desa:", err);
      } finally {
        setLoading(false);
      }
    };
    loadVillage();
  }, [id]);

  useEffect(() => {
    const loadDocs = async () => {
      if (!id) return;
      try {
        setLoadingDocs(true);
        const docs = await documentationService.getDocumentationByVillage(id);
        setDocumentation(docs || []);
      } catch (err) {
        console.error("Gagal memuat dokumentasi:", err);
      } finally {
        setLoadingDocs(false);
      }
    };
    loadDocs();
  }, [id]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "";
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (e) {
      return "";
    }
  };

  const getBadgeText = (doc) => {
    if (!doc) return "Pembinaan";
    const desc = (doc.description || doc.title || "").toLowerCase();
    if (desc.includes("pelatihan") || desc.includes("latih")) return "Pelatihan";
    if (desc.includes("sosialisasi") || desc.includes("sosial")) return "Sosialisasi";
    if (desc.includes("rapat") || desc.includes("musyawarah")) return "Musyawarah";
    return "Pembinaan";
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-[#154D71] font-medium animate-pulse">
        Memuat data galeri...
      </div>
    );
  }

  if (!village) {
    return (
      <div className="h-screen flex items-center justify-center text-red-500">
        Data desa tidak ditemukan.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
      <div>
        <VillageDetailNavbar activeSection="" scrollToSection={() => {}} village={village} />

        <div className="container mx-auto px-6 py-12">
          {/* Back Navigation Button */}
          <div className="mb-8">
            <Link
              to={subdomain ? "/" : `/desa/${id}`}
              className="inline-flex items-center gap-2 text-sm text-[#1C6EA4] hover:text-[#154D71] font-semibold transition-all hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Desa {village.name}
            </Link>
          </div>

          {/* Header section */}
          <div className="mb-10 text-left">
            <h1 className="text-3xl sm:text-5xl font-extrabold text-[#154D71] tracking-tight mb-3">
              Galeri Kegiatan
            </h1>
            <p className="text-sm sm:text-base text-gray-600 max-w-3xl">
              Dokumentasi lengkap program pembinaan, bimbingan teknis, dan sosialisasi di Lembang/Desa {village.name}.
            </p>
          </div>

          {loadingDocs ? (
            <div className="flex items-center justify-center py-20 text-gray-500">
              <Loader2 className="h-8 w-8 animate-spin text-[#154D71] mr-2" />
              <span>Memuat galeri kegiatan...</span>
            </div>
          ) : documentation.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {documentation.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full group"
                >
                  {/* Image Container */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100 shrink-0">
                    <img
                      src={doc.image_url}
                      alt={doc.description || doc.title || "Dokumentasi"}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  {/* Content Container */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-start">
                    <span className="text-slate-800 font-semibold text-xs sm:text-sm mb-1.5 block">
                      {formatDate(doc.created_at || doc.date) || "2026-07-30"}
                    </span>
                    <h3 className="font-bold text-slate-800 text-sm sm:text-base leading-snug line-clamp-2">
                      {doc.description || doc.title || "Kegiatan Pembinaan"}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-gray-400 border-2 border-dashed rounded-xl bg-gray-50/50">
              Belum ada foto dokumentasi kegiatan untuk desa ini.
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
