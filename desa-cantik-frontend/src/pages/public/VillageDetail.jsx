import React, { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { MapContainer, TileLayer, GeoJSON, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

import { MapPin, Users, Layers, CalendarDays, ArrowRight, Landmark, Download, Eye, ListChecks, FileText, BarChart3, ExternalLink, Loader2, ChevronDown, ChevronRight, ChevronUp, GraduationCap, Heart, DollarSign, Coins, Leaf, Heading2 } from "lucide-react";

// KOMPONEN UI
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

// LAYANAN
import { villageService } from "@/services/villageService";
import { geoService } from "@/services/geoService";
import { publicationService } from "@/services/publicationService";
import { statisticService } from "@/services/statisticService";
import { documentationService } from "@/services/documentationService";

// KOMPONEN BERSAMA
import VillageDetailNavbar from "@/components/shared/VillageDetailNavbar";
import Footer from "@/components/shared/Footer";
import ExcelTableViewer from "@/components/shared/ExcelTableViewer";
import ScrollReveal from "@/components/shared/ScrollReveal";
import PDFThumbnail from "@/components/shared/PDFThumbnail";
import logoSangkutu from "@/assets/images/logo_sangkutu.png";

const monthOptions = [
  { value: "all", label: "Semua Bulan" },
  { value: "1", label: "Januari" },
  { value: "2", label: "Februari" },
  { value: "3", label: "Maret" },
  { value: "4", label: "April" },
  { value: "5", label: "Mei" },
  { value: "6", label: "Juni" },
  { value: "7", label: "Juli" },
  { value: "8", label: "Agustus" },
  { value: "9", label: "September" },
  { value: "10", label: "Oktober" },
  { value: "11", label: "November" },
  { value: "12", label: "Desember" },
];

const currentYear = new Date().getFullYear();
const yearOptions = ["All", ...Array.from({ length: 5 }, (_, i) => (currentYear - i).toString())];

const getCategoryIcon = (categoryName) => {
  const name = (categoryName || "").toLowerCase();
  if (name.includes("wilayah") || name.includes("pemerintah")) {
    return Landmark;
  }
  if (name.includes("penduduk") || name.includes("kependudukan")) {
    return Users;
  }
  if (name.includes("didik") || name.includes("sekolah") || name.includes("pendidikan")) {
    return GraduationCap;
  }
  if (name.includes("sehat") || name.includes("kesehatan") || name.includes("medis")) {
    return Heart;
  }
  if (name.includes("ekonomi") || name.includes("keuangan") || name.includes("usaha")) {
    return DollarSign;
  }
  return BarChart3;
};

const getCategoryIconBg = (categoryName) => {
  const name = (categoryName || "").toLowerCase();
  if (name.includes("wilayah") || name.includes("pemerintah")) {
    return "bg-[#4eaf47]"; // Green
  }
  if (name.includes("penduduk") || name.includes("kependudukan")) {
    return "bg-[#038fcb]"; // Blue
  }
  if (name.includes("didik") || name.includes("sekolah") || name.includes("pendidikan")) {
    return "bg-[#9b51e0]"; // Purple
  }
  if (name.includes("sehat") || name.includes("kesehatan") || name.includes("medis")) {
    return "bg-[#e05151]"; // Red/Rose
  }
  if (name.includes("ekonomi") || name.includes("keuangan") || name.includes("usaha")) {
    return "bg-[#f37021]"; // Orange
  }
  return "bg-gray-500";
};

const getBadgeColor = (subject) => {
  const sub = (subject || "").toLowerCase();
  if (sub.includes("pemerintah") || sub.includes("hukum") || sub.includes("regulasi") || sub.includes("laporan") || sub.includes("politik")) {
    return "bg-orange-50 text-[#f37021] border-orange-100/40 hover:bg-orange-100";
  }
  if (sub.includes("ekonomi") || sub.includes("uang") || sub.includes("dana") || sub.includes("anggaran") || sub.includes("apb") || sub.includes("apblem") || sub.includes("kerja")) {
    return "bg-emerald-50 text-emerald-700 border-emerald-100/50 hover:bg-emerald-100";
  }
  if (sub.includes("sosial") || sub.includes("didik") || sub.includes("sekolah") || sub.includes("sehat") || sub.includes("kesehatan") || sub.includes("penduduk")) {
    return "bg-amber-50 text-amber-700 border-amber-100/50 hover:bg-amber-100";
  }
  return "bg-blue-50 text-blue-700 border-blue-100/50 hover:bg-blue-100";
};

// KOMPONEN MAP CONTROLLER UNTUK FIT BOUNDS
const MapController = ({ data, visibility }) => {
  const map = useMap();

  useEffect(() => {
    if (!data || data.length === 0) return;

    const visibleLayers = data.filter((l) => visibility[l.id] && l.geometry);
    if (visibleLayers.length === 0) return;

    try {
      const geoJsonData = visibleLayers.map((l) => l.geometry);
      const group = window.L.geoJSON(geoJsonData);

      if (group.getLayers().length > 0) {
        const bounds = group.getBounds();
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [50, 50] });
        }
      }
    } catch (err) {
      console.warn("Gagal mengatur zoom otomatis:", err);
    }
  }, [data, visibility, map]);

  return null;
};

export default function VillageDetail() {
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

  // The identifier parameter is now the village name slug directly
  const id = slug;

  // Status Data Utama
  const [village, setVillage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("tentang");

  // Status Peta
  const [mapData, setMapData] = useState([]);
  const [localLayerVisibility, setLocalLayerVisibility] = useState({});

  // Accordion state for sidebar details
  const [openAccordion, setOpenAccordion] = useState({
    luas: true,
    jarak: false,
    topografi: false,
    dusun: false,
  });

  const toggleAccordion = (section) => {
    setOpenAccordion((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Status Publikasi
  const [publications, setPublications] = useState([]);
  const [selectedYear, setSelectedYear] = useState("All");
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 4;

  // Status Statistik
  const [subjectGroups, setSubjectGroups] = useState([]);
  const [allTables, setAllTables] = useState({});
  const [activeSubjectId, setActiveSubjectId] = useState("");
  const [activeTableId, setActiveTableId] = useState("");
  const [activeDomainId, setActiveDomainId] = useState("");

  // Status Dokumentasi
  const [documentation, setDocumentation] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(true);

  // 1. Muat Data Desa
  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await villageService.getVillageById(id);
        setVillage(data);
      } catch (err) {
        console.error("Gagal memuat data desa:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  // 2. Muat Peta
  useEffect(() => {
    const loadMapData = async () => {
      if (!id) return;
      try {
        const allMaps = await geoService.getLayersByVillage(id);

        const combinedData = allMaps.map((map) => {
          const config = map.layer_config || {};
          const color = config.color || map.color || "#3388ff";

          let geometry = map.features || map.geojson_data || map.geometry;

          if (typeof geometry === "string") {
            try {
              geometry = JSON.parse(geometry);
            } catch (e) {
              console.error("Failed to parse geometry:", e);
              geometry = null;
            }
          }

          return {
            id: map.id,
            name: map.layer_name || map.map_name || map.theme_name || map.name || "Layer Tanpa Nama",
            description: map.description || "",
            type: map.map_type || "thematic",
            geometry: geometry,
            color: color,
            is_visible: map.is_active !== undefined ? Boolean(map.is_active) : true,
            geometry_type: map.geometry_type,
          };
        });

        const visibleLayers = combinedData.filter((layer) => layer.is_visible && layer.geometry);

        setMapData(visibleLayers);

        const initialVisibility = {};
        visibleLayers.forEach((layer) => {
          initialVisibility[layer.id] = true;
        });
        setLocalLayerVisibility(initialVisibility);
      } catch (err) {
        console.error("Gagal memuat peta:", err);
      }
    };
    loadMapData();
  }, [id]);

  // 3. Muat Publikasi
  useEffect(() => {
    const loadPublications = async () => {
      if (!id) return;
      try {
        const data = await publicationService.getPublications(id);
        const list = Array.isArray(data) ? data : data.data || [];
        const filteredList = list.filter(item => (item.category || "").toLowerCase() !== 'dokumentasi');
        const formatted = filteredList.map((item) => ({
          id: item.id,
          title: item.title,
          subject: item.category || "Umum",
          date: new Date(item.created_at).toLocaleDateString("id-ID"),
          year: new Date(item.created_at).getFullYear().toString(),
          month: (new Date(item.created_at).getMonth() + 1).toString(),
          description: item.description,
          imageUrl: item.cover_url || item.thumbnail_url || "https://placehold.co/300x400/f1f5f9/94a3b8?text=Dokumen",
          fileUrl: item.view_url || item.file_url || item.download_url,
        }));
        setPublications(formatted);
      } catch (err) {
        console.error("Gagal memuat publikasi:", err);
      }
    };
    loadPublications();
  }, [id]);

  // 4. Muat Statistik
  useEffect(() => {
    const loadStats = async () => {
      if (!id) return;
      try {
        const rawStats = await statisticService.getStatisticsByVillage(id, { per_page: "all" });
        const allStats = Array.isArray(rawStats) ? rawStats : rawStats.data || [];

        const listStats = allStats.filter((s) => {
          const statusOk = s.status && s.status.trim() === "Terverifikasi";
          const moduleOk = s.module ? s.module.is_active : true;
          const isPublished = s.is_published !== false && s.isPublished !== false;
          return statusOk && moduleOk && isPublished;
        });

        const groups = {};
        const tables = {};

        listStats.forEach((stat) => {
          const typeName = stat.module?.module_name || stat.type?.category || stat.statistic_type?.category || "Lainnya";
          const typeId = `subject-${typeName.replace(/\s+/g, "-").toLowerCase()}`;

          if (!groups[typeId]) {
            groups[typeId] = {
              id: typeId,
              name: typeName,
              tables: [],
            };
          }

          const indicatorName = stat.name || stat.indicator_name || "Data Statistik";
          const tableId = `table-${typeId}-${indicatorName.replace(/\s+/g, "-").toLowerCase()}`;

          if (!groups[typeId].tables.find((t) => t.id === tableId)) {
            groups[typeId].tables.push({ id: tableId, title: indicatorName });
          }

          if (!tables[tableId]) {
            tables[tableId] = {
              title: indicatorName,
              source: stat.source || "BPS / Desa",
              updatedAt: stat.updated_at,
              file_name: stat.file_name,
              data: {
                headers: ["Tahun", "Sumber Data", "File Spreadsheet"],
                rows: [],
              },
            };
          }

          tables[tableId].data.rows.push([stat.year || "-", stat.source || "Kantor Lembang", stat.file_name || "-"]);
        });

        const subjectGroupsArray = Object.values(groups);
        Object.values(tables).forEach((tbl) => {
          tbl.data.rows.sort((a, b) => b[0] - a[0]);
        });

        setSubjectGroups(subjectGroupsArray);
        setAllTables(tables);

        // No default active category/table initially as requested by user
      } catch (err) {
        console.error("Gagal memuat statistik:", err);
      }
    };
    loadStats();
  }, [id]);

  // 5. Muat Dokumentasi Kegiatan
  useEffect(() => {
    const loadDocs = async () => {
      if (!village?.id) return;
      try {
        setLoadingDocs(true);
        const data = await documentationService.getVillageDocumentation(village.id);
        const list = Array.isArray(data) ? data : data.data || [];
        setDocumentation(list);
      } catch (err) {
        console.error("Gagal memuat dokumentasi:", err);
      } finally {
        setLoadingDocs(false);
      }
    };
    loadDocs();
  }, [village?.id]);

  // Hook untuk otomatis scroll ke tabel data saat terpilih di HP/Tab
  useEffect(() => {
    if (!activeTableId) return;
    if (window.innerWidth < 1024) {
      const tableElement = document.getElementById("table-view-section");
      if (tableElement) {
        setTimeout(() => {
          tableElement.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      }
    }
  }, [activeTableId]);

  // Fungsi UI & Logika Pembantu
  const handleLocalLayerToggle = (layerId) => {
    setLocalLayerVisibility((prev) => ({ ...prev, [layerId]: !prev[layerId] }));
  };

  const scrollToSection = (sectionId) => {
    const el = document.getElementById(sectionId);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  // FIX 2: Reset currentPage ke 1 setiap kali filter berubah
  const handleYearChange = (val) => {
    setSelectedYear(val);
    setCurrentPage(1);
  };

  const handleMonthChange = (val) => {
    setSelectedMonth(val);
    setCurrentPage(1);
  };

  const filteredPublications = useMemo(() => {
    return publications.filter((pub) => {
      const matchYear = selectedYear === "All" || pub.year === selectedYear;
      const matchMonth = selectedMonth === "all" || pub.month === selectedMonth;
      return matchYear && matchMonth;
    });
  }, [publications, selectedYear, selectedMonth]);

  // FIX 3: Pastikan currentPage tidak melebihi totalPages setelah filter berubah
  const totalPages = Math.ceil(filteredPublications.length / ITEMS_PER_PAGE);
  const safePage = Math.min(currentPage, totalPages || 1);
  const currentPublications = filteredPublications.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  const currentTable = allTables[activeTableId];
  const activeSubject = subjectGroups.find((s) => s.id === activeSubjectId);
  const categoryTables = activeSubject ? activeSubject.tables : [];

  const docImages = documentation.map((d) => d.image_url).filter(Boolean);
  if (docImages.length === 0 && !loadingDocs) {
    docImages.push("https://placehold.co/800x600/e2e8f0/94a3b8?text=Dokumentasi+1");
    docImages.push("https://placehold.co/800x600/cbd5e1/64748b?text=Dokumentasi+2");
  }



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

  const getGoogleMapsDirectionsUrl = (geometry) => {
    if (!geometry) return null;
    try {
      let targetGeo = geometry;
      if (geometry.type === "FeatureCollection" && Array.isArray(geometry.features) && geometry.features.length > 0) {
        targetGeo = geometry.features[0].geometry;
      }
      
      if (!targetGeo) return null;

      if (targetGeo.type === "Point" && Array.isArray(targetGeo.coordinates)) {
        const [lng, lat] = targetGeo.coordinates;
        return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
      } else if (targetGeo.type === "LineString" && Array.isArray(targetGeo.coordinates) && targetGeo.coordinates.length > 0) {
        const [lng, lat] = targetGeo.coordinates[0];
        return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
      } else if (targetGeo.type === "Polygon" && Array.isArray(targetGeo.coordinates) && targetGeo.coordinates[0] && targetGeo.coordinates[0].length > 0) {
        const [lng, lat] = targetGeo.coordinates[0][0];
        return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
      }
    } catch (err) {
      console.warn("Gagal membuat link rute Google Maps:", err);
    }
    return null;
  };

  if (loading) return <div className="h-screen flex items-center justify-center text-[#154D71] font-medium animate-pulse">Memuat data desa...</div>;
  if (!village) return <div className="h-screen flex items-center justify-center text-red-500">Data desa tidak ditemukan.</div>;

  const isLongVision = (village?.vision || "").length > 180;
  const isLongMission = (village?.mission || []).length >= 7 || (village?.mission || []).reduce((sum, m) => sum + (m || "").length, 0) > 450;
  const isAnyLong = isLongVision || isLongMission;

  return (
    <div className="min-h-screen bg-gray-50">
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
        .custom-div-icon {
          background: none !important;
          border: none !important;
        }
      `}</style>

      <VillageDetailNavbar activeSection={activeSection} scrollToSection={scrollToSection} village={village} />

      {/* HERO SECTION */}
      <section className="relative h-[calc(100vh-80px)] min-h-[450px] sm:min-h-[600px] flex items-center justify-center text-white overflow-hidden py-10 sm:py-16">
        <div className="absolute inset-0 bg-gradient-to-br from-[#154D71] via-[#1C6EA4] to-[#33A1E0]">
          {village.image_url && <img src={village.image_url} className="w-full h-full object-cover opacity-25 mix-blend-overlay" alt="Background" />}
        </div>

        {/* Subtle glassmorphic grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px]"></div>

        <div className="container mx-auto px-6 relative z-10 text-center flex flex-col items-center">

          {/* Logo & Branding SANGKUTU (Centered, Transparent & Larger) */}
          <div className="flex flex-col items-center gap-4 mb-8">
            <div className="w-40 h-40 sm:w-60 sm:h-60 md:w-80 md:h-80 flex items-center justify-center hover:scale-105 transition-transform duration-300 filter drop-shadow-xl">
              <img src={logoSangkutu} alt="Logo Sangkutu" className="w-full h-full object-contain" />
            </div>
            <div className="max-w-3xl text-center">
              <h2 className="text-[#FFF9AF] font-black text-2xl sm:text-4xl md:text-5xl tracking-widest uppercase filter drop-shadow-lg">
                SANGKUTU
              </h2>
              <p className="text-blue-100 text-xs sm:text-base md:text-lg font-semibold tracking-wide mt-2 uppercase opacity-95 filter drop-shadow">
                Satu Data Lembang/Kelurahan Toraja Utara
              </p>
            </div>
          </div>

          {/* Village Main Title (The Absolute Highlight) */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black mb-6 tracking-tight filter drop-shadow-lg text-white mt-2">
            {village.name}
          </h1>

          {/* Location & Population Info */}
          <div className="flex flex-wrap justify-center gap-4 text-sm sm:text-base font-semibold">
            <div className="flex items-center gap-2 bg-white/10 border border-white/10 px-5 py-2.5 rounded-full backdrop-blur-md shadow-inner hover:bg-white/15 transition-all">
              <MapPin className="h-5 w-5 text-[#FFF9AF]" />
              <span className="tracking-wide">{village.district}, {village.regency}</span>
            </div>
            {village.population > 0 && (
              <div className="flex items-center gap-2 bg-white/10 border border-white/10 px-5 py-2.5 rounded-full backdrop-blur-md shadow-inner hover:bg-white/15 transition-all">
                <Users className="h-5 w-5 text-[#FFF9AF]" />
                <span className="tracking-wide">{Number(village.population).toLocaleString("id-ID")} Jiwa</span>
              </div>
            )}
          </div>

        </div>

        {/* SCROLL DOWN INDICATOR */}
        <div 
          className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2 animate-bounce cursor-pointer z-20 group"
          onClick={() => scrollToSection('tentang')}
        >
          <span className="text-xs tracking-widest uppercase font-semibold text-white/70 group-hover:text-[#FFF9AF] transition-colors filter drop-shadow">
            Jelajahi
          </span>
          <svg className="w-5 h-5 text-white/70 group-hover:text-[#FFF9AF] group-hover:scale-110 transition-all" fill="none" strokeWidth="2.5" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
          </svg>
        </div>
      </section>

      {/* TENTANG DESA */}
      <section
        id="tentang"
        className="relative min-h-[calc(100vh-80px)] flex items-center bg-white py-16 sm:py-24"
      >
        <div className="container mx-auto px-6 w-full">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="relative group">
              <ScrollReveal duration={800}>
                <div className="absolute -inset-4 bg-gradient-to-r from-[#33A1E0] to-[#1C6EA4] rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition duration-500"></div>
                <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-[4/3]">
                  <img
                    src={village.image_url || village.logo_url || "https://placehold.co/800x600/f1f5f9/94a3b8?text=Foto+Desa"}
                    alt={village.name}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition duration-700"
                  />
                </div>
              </ScrollReveal>
            </div>
            <div>
              <ScrollReveal delay={150} duration={850}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <FileText className="w-6 h-6 text-[#33A1E0]" />
                  </div>
                  <h2 className="text-2xl sm:text-4xl font-bold text-[#154D71]">Tentang Desa</h2>
                </div>
                <p className="text-sm sm:text-lg text-gray-600 leading-relaxed mb-8">{village.description || "Belum ada deskripsi detail mengenai desa ini. Silakan hubungi admin untuk informasi lebih lanjut."}</p>

                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-white to-blue-50/20 p-5 rounded-2xl border border-blue-100/50 shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-4">
                    <div className="p-3 bg-blue-50/70 rounded-xl text-[#33A1E0] shrink-0">
                      <Layers className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-medium mb-0.5">Luas Wilayah</p>
                      <p className="text-lg sm:text-2xl font-black bg-gradient-to-r from-[#154D71] to-[#1C6EA4] bg-clip-text text-transparent">{village.area || "-"} km²</p>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-white to-blue-50/20 p-5 rounded-2xl border border-blue-100/50 shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-4">
                    <div className="p-3 bg-blue-50/70 rounded-xl text-[#33A1E0] shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-medium mb-0.5">Kode Wilayah</p>
                      <p className="text-lg sm:text-2xl font-black bg-gradient-to-r from-[#154D71] to-[#1C6EA4] bg-clip-text text-transparent">{village.village_code || "-"}</p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>

        {/* SCROLL DOWN INDICATOR */}
        <div 
          className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2 animate-bounce cursor-pointer z-20 group"
          onClick={() => scrollToSection('publikasi')}
        >
          <span className="text-[10px] tracking-widest uppercase font-bold text-gray-400 group-hover:text-[#154D71] transition-colors">
            Visi, Misi & Publikasi
          </span>
          <svg className="w-5 h-5 text-gray-400 group-hover:text-[#154D71] group-hover:scale-115 transition-all" fill="none" strokeWidth="2.5" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
          </svg>
        </div>
      </section>

      {/* VISI, MISI & PUBLIKASI */}
      <section
        id="publikasi"
        className="relative min-h-[calc(100vh-80px)] pt-6 sm:pt-8 pb-20 sm:pb-24 bg-gray-50 border-t border-gray-100 flex flex-col justify-start"
      >
        <div className="container mx-auto px-6 w-full">
          {(village.vision || (village.mission && village.mission.length > 0)) && (
            <ScrollReveal delay={150} duration={850}>
              <div className={cn(
                "grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch",
                isAnyLong ? "mb-14" : "mb-24"
              )}>
                {/* Visi Card */}
                {village.vision && (
                  <div className={cn(
                    "bg-gradient-to-br from-[#114364]/95 via-[#154D71] to-[#1C6EA4] text-white rounded-3xl border border-white/10 shadow-lg flex flex-col justify-center relative overflow-hidden hover:shadow-2xl hover:shadow-[#154D71]/20 hover:-translate-y-1 transition duration-300",
                    isLongVision ? "p-5 sm:p-6" : "p-8 sm:p-10"
                  )}>
                    <div className="absolute -right-8 -bottom-8 text-white/5 pointer-events-none transform -rotate-12">
                      <Eye className="w-48 h-48" />
                    </div>
                    <h3 className={cn(
                      "font-bold text-white tracking-tight relative z-10",
                      isLongVision ? "text-xl sm:text-2xl mb-3" : "text-2xl sm:text-3xl mb-5"
                    )}>Visi</h3>
                    <p className={cn(
                      "text-blue-50/90 leading-relaxed whitespace-pre-line relative z-10 font-medium",
                      isLongVision ? "text-sm sm:text-base" : "text-base sm:text-[18px]"
                    )}>
                      {village.vision}
                    </p>
                  </div>
                )}

                {/* Misi Card */}
                {village.mission && village.mission.length > 0 && (
                  <div className={cn(
                    "bg-white/90 backdrop-blur-md text-gray-800 rounded-3xl border border-blue-100/50 shadow-sm flex flex-col justify-center relative overflow-hidden hover:shadow-xl hover:-translate-y-1 transition duration-300",
                    isLongMission ? "p-5 sm:p-6" : "p-8 sm:p-10"
                  )}>
                    <div className="absolute -right-8 -bottom-8 text-blue-50 pointer-events-none transform -rotate-12">
                      <ListChecks className="w-48 h-48" />
                    </div>
                    <h3 className={cn(
                      "font-bold text-[#154D71] tracking-tight relative z-10",
                      isLongMission ? "text-xl sm:text-2xl mb-3" : "text-2xl sm:text-3xl mb-5"
                    )}>Misi</h3>
                    <ol className={cn(
                      "relative z-10",
                      isLongMission ? "space-y-2" : "space-y-4"
                    )}>
                      {village.mission.map((m, idx) => (
                         <li key={idx} className={cn(
                           "flex items-start group/item",
                           isLongMission ? "gap-3" : "gap-4"
                         )}>
                          <span className={cn(
                            "flex-shrink-0 flex items-center justify-center rounded-lg bg-gradient-to-br from-[#154D71] to-[#33A1E0] text-white font-black shadow-sm group-hover/item:scale-110 transition-transform duration-300 mt-0.5",
                            isLongMission ? "w-6 h-6 text-xs" : "w-8 h-8 text-sm"
                          )}>
                             {idx + 1}
                          </span>
                          <span className={cn(
                            "text-gray-600 leading-relaxed font-medium",
                            isLongMission ? "text-xs sm:text-sm" : "text-sm sm:text-base"
                          )}>
                            {m}
                          </span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            </ScrollReveal>
          )}

          {/* PUBLIKASI CONTENT */}
          <div>
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-4 gap-6">
              <ScrollReveal>
                <div>
                  <h2 className="text-2xl sm:text-4xl font-bold text-[#154D71] mb-2">Publikasi Desa</h2>
                  <p className="text-xs sm:text-sm text-gray-600">Dokumen dan laporan resmi desa</p>
                </div>
              </ScrollReveal>
              <div className="flex gap-4 bg-white p-2 rounded-lg border border-gray-200">
                <Select value={selectedYear} onValueChange={handleYearChange}>
                  <SelectTrigger className="w-[120px] bg-white border-0 shadow-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {yearOptions.map((y) => (
                      <SelectItem key={y} value={y}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedMonth} onValueChange={handleMonthChange}>
                  <SelectTrigger className="w-[140px] bg-white border-0 shadow-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {monthOptions.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {currentPublications.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6">
                {currentPublications.map((pub) => (
                  <Link key={pub.id} to={`/publikasi/${pub.id}`} className="group bg-white border border-gray-150 rounded-3xl p-3.5 hover:shadow-2xl hover:border-blue-150 transition-all duration-500 flex gap-4 items-stretch cursor-pointer hover:-translate-y-0.5">
                    <div className="w-20 h-28 shrink-0 bg-gray-150 rounded-r-md overflow-hidden relative shadow-[2px_4px_8px_rgba(0,0,0,0.15)] group-hover:shadow-[4px_8px_16px_rgba(0,0,0,0.2)] group-hover:scale-[1.04] group-hover:-rotate-1 transition-all duration-300">
                      <PDFThumbnail pdfUrl={pub.fileUrl} title={pub.title} className="w-full h-full" />
                      {/* Book spine crease shadow */}
                      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-r from-black/20 via-black/5 to-transparent z-10" />
                      {/* Book page edge stack */}
                      <div className="absolute right-0 top-0.5 bottom-0.5 w-[2px] bg-slate-100/60 z-10 rounded-r shadow-[1px_0_1px_rgba(0,0,0,0.05)]" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors pointer-events-none z-20" />
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-0.5">
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <Badge variant="outline" className={cn("text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 border shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-colors duration-300", getBadgeColor(pub.subject))}>
                            {pub.subject}
                          </Badge>
                          <span className="text-[11px] text-gray-400 flex items-center gap-1 font-medium">
                            <CalendarDays className="w-3.5 h-3.5" /> {pub.date}
                          </span>
                        </div>
                        <h3 className="font-bold text-[#154D71] text-sm sm:text-base leading-snug mb-1.5 line-clamp-2 group-hover:text-[#33A1E0] transition-colors duration-300">{pub.title}</h3>
                      </div>
                      <div className="inline-flex items-center text-xs font-bold text-[#33A1E0] group-hover:text-[#154D71] transition-colors duration-300 mt-1">
                        Lihat Detail <ArrowRight className="w-3.5 h-3.5 ml-1 transform group-hover:translate-x-1.5 transition-transform duration-300" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <p className="text-gray-500">Tidak ada publikasi ditemukan.</p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-10 flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} className={cn("cursor-pointer", safePage === 1 && "pointer-events-none opacity-50")} />
                    </PaginationItem>
                    <span className="mx-4 text-sm text-gray-500 self-center">
                      Halaman {safePage} dari {totalPages}
                    </span>
                    <PaginationItem>
                      <PaginationNext onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} className={cn("cursor-pointer", safePage === totalPages && "pointer-events-none opacity-50")} />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>
        </div>

        {/* SCROLL DOWN INDICATOR */}
        <div 
          className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2 animate-bounce cursor-pointer z-20 group"
          onClick={() => scrollToSection('data')}
        >
          <span className="text-[10px] tracking-widest uppercase font-bold text-gray-400 group-hover:text-[#154D71] transition-colors">
            Data Statistik
          </span>
          <svg className="w-5 h-5 text-gray-400 group-hover:text-[#154D71] group-hover:scale-115 transition-all" fill="none" strokeWidth="2.5" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
          </svg>
        </div>
      </section>

      {/* DATA STATISTIK */}
      <section id="data" className="relative min-h-[calc(100vh-80px)] flex items-center bg-white py-12 sm:py-16">
        <div className="container mx-auto px-6 w-full">
          <ScrollReveal>
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-2xl sm:text-4xl font-bold text-[#154D71] mb-2 sm:mb-4">Data Statistik</h2>
              <p className="text-xs sm:text-base text-gray-600">Data statistik resmi yang dihasilkan Desa dan di validasi oleh BPS</p>
            </div>
          </ScrollReveal>

          {subjectGroups.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Filter & List of Indicators */}
              <div className="lg:col-span-1 space-y-3">
                <h2 className="text-base sm:text-xl font-bold text-slate-800 tracking-tight pl-1">
                  Kategori
                </h2>
                {subjectGroups.map((s) => {
                  const isExpanded = activeSubjectId === s.id;
                  const CategoryIcon = getCategoryIcon(s.name);
                  const iconBg = getCategoryIconBg(s.name);

                  return (
                    <div key={s.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                      {/* Level 1: Category Header Card */}

                      <button
                        onClick={() => {
                          if (isExpanded) {
                            setActiveSubjectId("");
                          } else {
                            setActiveSubjectId(s.id);
                            if (s.tables?.length) {
                              setActiveTableId(s.tables[0].id);
                            }
                          }
                        }}
                        className="w-full flex items-center justify-between p-3 bg-white hover:bg-gray-50/50 transition-colors text-left"
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn("p-1.5 rounded-md shrink-0 text-white shadow-sm", iconBg)}>
                            <CategoryIcon className="w-4 h-4" />
                          </div>
                          <span className="font-bold text-gray-800 text-sm sm:text-[15px] font-sans leading-snug">
                            {s.name}
                          </span>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-gray-600 shrink-0 ml-2" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-400 shrink-0 ml-2" />
                        )}
                      </button>

                      {/* Level 2: List of Indicators inside Category */}
                      {isExpanded && s.tables && s.tables.length > 0 && (
                        <div className="p-2.5 bg-gray-50/40 border-t border-gray-100 space-y-1">
                          {s.tables.map((t) => {
                            const isTableActive = activeTableId === t.id;

                            return (
                              <button
                                key={t.id}
                                onClick={() => setActiveTableId(t.id)}
                                className={cn(
                                  "w-full text-left text-xs sm:text-sm py-2 px-3 rounded-lg transition-all block leading-snug border-0",
                                  isTableActive
                                    ? "bg-[#4eaf47] text-white shadow-md font-semibold"
                                    : "bg-transparent text-gray-650 hover:bg-gray-250/50 hover:text-gray-900 font-medium"
                                )}
                              >
                                {t.title}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Right Column: Table details */}
              <div id="table-view-section" className="lg:col-span-2 scroll-mt-24">
                {currentTable ? (
                  <Card className="border border-slate-150 shadow-lg overflow-hidden">
                    <CardHeader className="bg-white border-b px-6 py-5 flex flex-row items-center justify-between space-y-0">
                      <div>
                        <CardTitle className="text-base sm:text-xl text-[#154D71]">{currentTable.title}</CardTitle>
                        <CardDescription className="mt-1">Update Terakhir: {currentTable.updatedAt ? new Date(currentTable.updatedAt).toLocaleDateString("id-ID") : "-"}</CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      {currentTable.file_name ? (
                        <ExcelTableViewer
                          fileUrl={currentTable.file_name.startsWith('http')
                            ? currentTable.file_name
                            : `${(import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api").replace(/\/api$/, "")}/storage/statistics/${currentTable.file_name}`}
                          title={currentTable.title}
                        />
                      ) : (
                        <div className="h-64 flex flex-col items-center justify-center text-gray-400">
                          File excel/spreadsheet belum diunggah.
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <div className="h-64 flex flex-col items-center justify-center bg-white rounded-xl shadow-sm border border-dashed border-gray-300 text-slate-400 p-6 text-center">
                    <BarChart3 className="w-12 h-12 mb-3 opacity-30 text-[#154D71]" />
                    <p className="text-sm font-medium text-slate-600 max-w-sm">Buka panel di sebelah kiri, pilih kategori dan indikator untuk menampilkan data.</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <BarChart3 className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">Belum Ada Data Statistik</h3>
              <p className="text-gray-500 max-w-md mx-auto">Data statistik untuk desa ini sedang dalam proses pengumpulan dan verifikasi.</p>
            </div>
          )}
        </div>

        {/* SCROLL DOWN INDICATOR */}
        <div 
          className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2 animate-bounce cursor-pointer z-20 group"
          onClick={() => scrollToSection('peta')}
        >
          <span className="text-[10px] tracking-widest uppercase font-bold text-gray-400 group-hover:text-[#154D71] transition-colors">
            Peta Tematik
          </span>
          <svg className="w-5 h-5 text-gray-400 group-hover:text-[#154D71] group-hover:scale-115 transition-all" fill="none" strokeWidth="2.5" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
          </svg>
        </div>
      </section>

      {/* PETA TEMATIK */}
      <section id="peta" className="relative min-h-[calc(100vh-80px)] flex flex-col justify-start bg-gray-50 pt-8 sm:pt-12 pb-16">
        <div className="container mx-auto px-6 w-full">
          <ScrollReveal>
            <div className="mb-6">
              <h2 className="text-2xl sm:text-4xl font-bold text-[#154D71] mb-2 sm:mb-3">Peta Digital</h2>
              <p className="text-xs sm:text-sm text-gray-600 max-w-2xl">Eksplorasi data geospasial dan tematik wilayah desa.</p>
            </div>
          </ScrollReveal>

          <div className="relative w-full rounded-2xl shadow-xl overflow-hidden border-4 border-white group h-[340px] sm:h-[400px] md:h-[480px] lg:h-[540px] xl:h-[580px] max-h-[70vh]">
            {/* FLOATING FILTER POPUP */}
            {id !== "nonongan-selatan" && (
              <div className="absolute top-4 right-4 z-[1000]">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button className="bg-white text-[#154D71] hover:bg-gray-100 shadow-lg gap-2 border border-gray-200 font-medium">
                      <Layers className="w-4 h-4" />
                      Layer Peta
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-72 p-0 bg-white mr-4 mt-2 shadow-2xl border-gray-200 z-[1001]" align="end" sideOffset={5}>
                    <div className="p-3 border-b border-gray-100 bg-gray-50/50">
                      <h4 className="font-semibold text-[#154D71] text-sm flex items-center gap-2">
                        <Layers className="w-3 h-3" /> Layer Aktif
                      </h4>
                    </div>
                    <div className="p-2 max-h-64 overflow-y-auto custom-scrollbar">
                      {mapData.length === 0 ? (
                        <div className="p-4 text-center text-xs text-gray-500">Belum ada data peta.</div>
                      ) : (
                        mapData.map((layer) => (
                          <div
                            key={layer.id}
                            className={cn("flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer select-none", localLayerVisibility[layer.id] ? "bg-blue-50/50" : "")}
                            onClick={(e) => {
                              e.preventDefault();
                              handleLocalLayerToggle(layer.id);
                            }}
                          >
                            <Checkbox
                              id={`layer-${layer.id}`}
                              checked={localLayerVisibility[layer.id] || false}
                              onCheckedChange={() => handleLocalLayerToggle(layer.id)}
                              onClick={(e) => e.stopPropagation()}
                              className="data-[state=checked]:bg-[#154D71] data-[state=checked]:border-[#154D71]"
                            />
                            <div className="grid gap-0.5 leading-none flex-1">
                              <label htmlFor={`layer-${layer.id}`} className="text-sm font-medium leading-none cursor-pointer text-gray-700" onClick={(e) => e.stopPropagation()}>
                                {layer.name}
                              </label>
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full shadow-sm" style={{ backgroundColor: layer.color }}></div>
                                <span className="text-[10px] text-gray-500 uppercase tracking-wider">{layer.type}</span>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            )}

            {/* MAP CONTAINER */}
            <div className="z-0 h-full w-full">
              {id === "nonongan-selatan" ? (
                <iframe
                  src="https://www.google.com/maps/d/embed?mid=1TxMpeWTmDzz0BMtCKZhN_hcQKdTOgvo&ehbc=2E312F"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  title="Peta Nonongan Selatan"
                  allowFullScreen
                ></iframe>
              ) : (
                <MapContainer center={[-2.9739, 119.9045]} zoom={14} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
                  <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <MapController data={mapData} visibility={localLayerVisibility} />
                  {mapData.map(
                    (layer) =>
                      localLayerVisibility[layer.id] &&
                      layer.geometry && (
                        <GeoJSON
                          key={layer.id}
                          data={layer.geometry}
                          style={{
                            color: layer.color,
                            fillColor: layer.color,
                            weight: 2,
                            fillOpacity: 0.3,
                          }}
                          pointToLayer={(feature, latlng) => {
                            return L.marker(latlng, {
                              icon: L.divIcon({
                                html: `
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${layer.color || '#1C6EA4'}" stroke="white" stroke-width="1.5" style="width: 22px; height: 22px; filter: drop-shadow(0px 2px 3px rgba(0,0,0,0.35));">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                    <circle cx="12" cy="10" r="3" fill="white" />
                                  </svg>
                                `,
                                className: "custom-div-icon",
                                iconSize: [22, 22],
                                iconAnchor: [11, 22],
                                popupAnchor: [0, -22]
                              })
                            });
                          }}
                        >
                          <Popup>
                            <div className="p-2 min-w-[200px]">
                              <h4 className="font-bold text-[#154D71] text-sm mb-2">{layer.name}</h4>
                              <p className="text-xs text-gray-600 leading-relaxed">{layer.description || "Tidak ada deskripsi tambahan."}</p>
                              
                              {getGoogleMapsDirectionsUrl(layer.geometry) && (
                                <div className="mt-3 pt-2.5 border-t border-slate-100">
                                  <a
                                    href={getGoogleMapsDirectionsUrl(layer.geometry)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-xs text-[#1C6EA4] hover:text-[#154D71] font-semibold hover:underline"
                                  >
                                    <MapPin className="w-3.5 h-3.5" />
                                    Petunjuk Arah (Google Maps)
                                  </a>
                                </div>
                              )}
                            </div>
                          </Popup>
                        </GeoJSON>
                      ),
                  )}
                </MapContainer>
              )}
            </div>
          </div>
        </div>

        {/* SCROLL DOWN INDICATOR */}
        <div 
          className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2 animate-bounce cursor-pointer z-20 group"
          onClick={() => scrollToSection('dokumentasi')}
        >
          <span className="text-[10px] tracking-widest uppercase font-bold text-gray-400 group-hover:text-[#154D71] transition-colors">
            Dokumentasi Kegiatan
          </span>
          <svg className="w-5 h-5 text-gray-400 group-hover:text-[#154D71] group-hover:scale-115 transition-all" fill="none" strokeWidth="2.5" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
          </svg>
        </div>
      </section>

      {/* DOKUMENTASI KEGIATAN */}
      <section id="dokumentasi" className="py-12 sm:py-20 bg-white border-t border-gray-100">
        <div className="container mx-auto px-6">
          <ScrollReveal>
            <div className="mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div className="text-left">
                <h2 className="text-2xl sm:text-4xl font-extrabold text-[#154D71] mb-2 sm:mb-3">
                  Dokumentasi Kegiatan
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 max-w-2xl">
                  Galeri foto pembinaan dan dokumentasi kegiatan Desa Cantik (DesCan) di {village?.name || 'Desa'}.
                </p>
              </div>
              <div className="shrink-0 text-left sm:text-right">
                <Link
                  to={subdomain ? "/galeri" : `/desa/${id}/galeri`}
                  className="bg-[#1C6EA4] hover:bg-[#154D71] text-white font-semibold text-xs sm:text-sm px-5 py-3 rounded-full inline-flex items-center gap-2 shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Lihat Semua Foto ({documentation.length})
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </ScrollReveal>

          {loadingDocs ? (
            <div className="flex items-center justify-center py-20 text-gray-500">
              <Loader2 className="h-8 w-8 animate-spin text-[#154D71] mr-2" />
              <span>Memuat galeri kegiatan...</span>
            </div>
          ) : documentation.length > 0 ? (
            <ScrollReveal delay={150} duration={800}>
              <div className="w-full overflow-hidden relative py-2">
                {documentation.length > 1 ? (
                  <>
                    <style dangerouslySetInnerHTML={{__html: `
                      @keyframes marquee-docs-all {
                        0% { transform: translateX(0); }
                        100% { transform: translateX(-50%); }
                      }
                      .animate-marquee-docs-all {
                        display: flex;
                        width: max-content;
                        animation: marquee-docs-all 35s linear infinite;
                      }
                      .animate-marquee-docs-all:hover {
                        animation-play-state: paused;
                      }
                    `}} />
                    <div className="animate-marquee-docs-all gap-6">
                      {(documentation.length < 6
                        ? [...documentation, ...documentation, ...documentation, ...documentation, ...documentation, ...documentation]
                        : [...documentation, ...documentation]
                      ).map((doc, index) => (
                        <div
                          key={`${doc.id}-${index}`}
                          className="bg-white rounded-3xl border border-blue-50/30 overflow-hidden shadow-sm flex-shrink-0 w-[280px] sm:w-[320px] flex flex-col group hover:shadow-xl hover:border-blue-100/50 transition-all duration-500 hover:-translate-y-1"
                        >
                          {/* Image Container */}
                          <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100 shrink-0">
                            <img 
                              src={doc.image_url} 
                              alt={doc.description || doc.title || 'Dokumentasi'}
                              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110" 
                            />
                            <div className="absolute inset-0 bg-[#154D71]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10" />
                          </div>
                          {/* Content Container */}
                          <div className="p-5 flex-1 flex flex-col justify-start">
                            <span className="text-gray-400 font-bold text-xs mb-1.5 block">
                              {formatDate(doc.created_at || doc.date) || "2026-07-30"}
                            </span>
                            <h3 className="font-bold text-[#154D71] group-hover:text-[#1C6EA4] text-sm leading-relaxed line-clamp-2 transition-colors duration-300">
                              {doc.description || doc.title || "Kegiatan Pembinaan"}
                            </h3>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  // Single photo layout
                  <div className="max-w-md mx-auto bg-white rounded-3xl border border-blue-50/30 overflow-hidden shadow-sm flex flex-col group hover:shadow-xl hover:border-blue-100/50 transition-all duration-500 hover:-translate-y-1">
                    {/* Image Container */}
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100 shrink-0">
                      <img 
                        src={documentation[0].image_url} 
                        alt={documentation[0].description || documentation[0].title || 'Dokumentasi'}
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110" 
                      />
                      <div className="absolute inset-0 bg-[#154D71]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10" />
                    </div>
                    {/* Content Container */}
                    <div className="p-5 flex-1 flex flex-col justify-start">
                      <span className="text-gray-400 font-bold text-xs mb-1.5 block">
                        {formatDate(documentation[0].created_at || documentation[0].date) || "2026-07-30"}
                      </span>
                      <h3 className="font-bold text-[#154D71] group-hover:text-[#1C6EA4] text-sm leading-relaxed line-clamp-2 transition-colors duration-300">
                        {documentation[0].description || documentation[0].title || "Kegiatan Pembinaan"}
                      </h3>
                    </div>
                  </div>
                )}
              </div>
            </ScrollReveal>
          ) : (
            <div className="text-center py-20 text-gray-400 border-2 border-dashed rounded-xl bg-gray-50/50">
              Belum ada foto dokumentasi kegiatan untuk desa ini.
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
