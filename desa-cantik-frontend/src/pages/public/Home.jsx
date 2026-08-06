// src/pages/public/Home.jsx
import { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MapPin, Users, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { villageService } from "@/services/villageService";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import ScrollReveal from "@/components/shared/ScrollReveal";
import logoSangkutu from "@/assets/images/logo_sangkutu.png";
import logoDesa from "@/assets/images/logo_desa.png";
import background from "@/assets/images/bg.jpg";

const VISIBLE = 3;
const AUTO_DELAY = 5000;
const CARD_GAP = 20; // px, harus sama dengan gap di CSS

export default function Home() {
  const getVillageUrl = (name) => {
    const slug = name.toLowerCase().replace(/\s+/g, "-");
    const hostname = window.location.hostname;
    if (/^[0-9.]+$/.test(hostname) || hostname === 'localhost') {
      return `/desa/${slug}`;
    }
    const protocol = window.location.protocol;
    const parts = hostname.split('.');
    const baseDomain = parts.slice(-3).join('.');
    return `${protocol}//${slug}.${baseDomain}`;
  };

  const villagesRef = useRef(null);
  const [villages, setVillages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [curIdx, setCurIdx] = useState(0);
  const autoTimer = useRef(null);
  const trackRef = useRef(null);
  const containerRef = useRef(null);
  const [cardWidth, setCardWidth] = useState(0);

  useEffect(() => {
    const loadVillages = async () => {
      try {
        const data = await villageService.getAllVillages();
        setVillages(data);
      } catch (error) {
        console.error("Error loading villages:", error);
      } finally {
        setLoading(false);
      }
    };
    loadVillages();
  }, []);

  // Hitung lebar 1 kartu berdasarkan container
  useEffect(() => {
    const calcCardWidth = () => {
      if (!containerRef.current) return;
      const totalGap = CARD_GAP * (VISIBLE - 1);
      setCardWidth((containerRef.current.offsetWidth - totalGap) / VISIBLE);
    };
    calcCardWidth();
    window.addEventListener("resize", calcCardWidth);
    return () => window.removeEventListener("resize", calcCardWidth);
  }, [loading]);

  const maxIdx = Math.max(0, villages.length - VISIBLE);
  const totalDots = maxIdx + 1;

  const startAutoTimer = useCallback(() => {
    clearInterval(autoTimer.current);
    if (villages.length <= VISIBLE) return;
    autoTimer.current = setInterval(() => {
      setCurIdx((prev) => (prev >= maxIdx ? 0 : prev + 1));
    }, AUTO_DELAY);
  }, [villages.length, maxIdx]);

  useEffect(() => {
    startAutoTimer();
    return () => clearInterval(autoTimer.current);
  }, [startAutoTimer]);

  // Smooth scroll track saat curIdx berubah
  useEffect(() => {
    if (!trackRef.current || cardWidth === 0) return;
    const offset = curIdx * (cardWidth + CARD_GAP);
    trackRef.current.style.transform = `translateX(-${offset}px)`;
  }, [curIdx, cardWidth]);

  const handleGoTo = useCallback(
    (n) => {
      const target = Math.max(0, Math.min(n, maxIdx));
      setCurIdx(target);
      startAutoTimer();
    },
    [maxIdx, startAutoTimer],
  );

  const scrollToSection = (sectionId) => {
    const el = document.getElementById(sectionId);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const scrollToVillages = () => {
    if (villagesRef.current) {
      const y = villagesRef.current.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar scrollToVillages={scrollToVillages} />

      {/* Hero Section */}
      <section className="relative h-[calc(100vh-80px)] min-h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={background} alt="Latar belakang desa" className="w-full h-full object-cover" onError={(e) => (e.target.src = "https://placehold.co/1920x600/1c6ea4/ffffff?text=Desa+Cantik")} />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-white/30" />
        </div>
        <div className="relative z-10 container mx-auto px-6 py-20 text-center">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8 flex justify-center">
              <div className="w-85 h-85 rounded-3xl shadow-2xl p-1 hover:scale-105 transition-transform flex items-center justify-center">
                <img src={logoSangkutu} alt="Logo Sangkutu" className="w-80 h-80 object-contain" />
              </div>
            </div>
            <h1 className="text-3xl sm:text-5xl md:text-6xl text-white mb-6" style={{ textShadow: "2px 4px 8px rgba(0,0,0,0.5)" }}>
              <span className="text-[#FFF9AF]">SANGKUTU</span>
            </h1>
            <p className="text-sm sm:text-xl md:text-2xl text-white mb-8" style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.5)" }}>
              Satu Data Lembang/Kelurahan Toraja Utara
            </p>
            <Button onClick={scrollToVillages} size="lg" className="bg-[#33A1E0] hover:bg-[#1C6EA4] text-white text-base sm:text-xl px-10 sm:px-12 py-5 sm:py-6 rounded-full shadow-xl hover:shadow-2xl transition-all">
              Jelajahi Desa Binaan
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* SCROLL DOWN INDICATOR */}
        <div 
          className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2 animate-bounce cursor-pointer opacity-70 hover:opacity-100 transition-opacity z-20"
          onClick={() => scrollToSection("tentang-section")}
        >
          <span className="text-xs tracking-widest uppercase font-semibold text-white/80">Jelajahi</span>
          <svg className="w-5 h-5 text-white" fill="none" strokeWidth="2.5" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
          </svg>
        </div>
      </section>

      {/* Tentang Desa Cantik Section */}
      <section
        id="tentang-section"
        className="relative w-full min-h-[calc(100vh-80px)] md:h-[calc(100vh-80px)] overflow-hidden py-12 md:py-0 flex items-center"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#4BADE4] via-[#33A1E0] to-[#1C6EA4]" />
        <div className="relative z-10 container mx-auto px-6 w-full">
          <div className="max-w-7xl mx-auto">
            <ScrollReveal duration={800}>
              <div className="text-center mb-16">
                <h2 className="text-4xl sm:text-5xl md:text-6xl text-white mb-4" style={{ textShadow: "rgba(0,0,0,0.2) 2px 4px 8px" }}>
                  Tentang <span className="text-[#FFF9AF]">Desa Cantik</span>
                </h2>
                <div className="w-full max-w-[240px] h-1 bg-[#FFF9AF] mx-auto rounded-full" />
              </div>
            </ScrollReveal>
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <ScrollReveal delay={150} duration={850}>
                  <div className="relative">
                    <div className="absolute -inset-4 bg-white/10 rounded-3xl blur-xl" />
                    <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                      <img src={logoDesa} alt="Tentang Desa Cantik" className="w-full h-full object-contain" onError={(e) => (e.target.src = "https://placehold.co/800x600/4BADE4/ffffff?text=Tentang+Kami")} />
                    </div>
                  </div>
                </ScrollReveal>
              </div>
              <div className="order-1 md:order-2 text-white space-y-6">
                <ScrollReveal delay={300} duration={850}>
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
                    <p className="text-lg leading-relaxed mb-6">
                      Berdasarkan UU No. 17 Tahun 1997 Tentang Statistik, BPS menjadi <span className="text-[#FFF9AF]">leading sector</span> dalam pembinaan statistik sektoral sebagai pengembangan Sistem Statistik Nasional (SSN) dan mendukung
                      pembangunan.
                    </p>
                    <p className="text-lg leading-relaxed mb-8">
                      <span className="text-[#FFF9AF]">Desa Cinta Statistik (Desa Cantik)</span> merupakan program yang bertujuan untuk meningkatkan literasi, kesadaran, dan peran aktif perangkat desa/kelurahan dan masyarakat dalam
                      penyelenggaraan kegiatan statistik.
                    </p>
                    <Button asChild className="bg-[#FFF9AF] hover:bg-[#FFE680] text-[#154D71] px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all w-full md:w-auto">
                      <Link to="/tentang">
                        Pelajari Lebih Lanjut <ArrowRight className="ml-2 h-5 w-5" />
                      </Link>
                    </Button>
                  </div>
                </ScrollReveal>
              </div>
            </div>
          </div>
        </div>

        {/* SCROLL DOWN TO VILLAGES INDICATOR */}
        <div 
          className="absolute bottom-4 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-1.5 animate-bounce cursor-pointer opacity-70 hover:opacity-100 transition-opacity z-20"
          onClick={scrollToVillages}
        >
          <svg className="w-5 h-5 text-white" fill="none" strokeWidth="2.5" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
          </svg>
          <span className="text-xs tracking-widest uppercase font-semibold text-white/80">Lihat Desa Binaan</span>
        </div>
      </section>

      {/* Desa Binaan Section */}
      <section
        ref={villagesRef}
        className="min-h-[calc(100vh-80px)] flex items-center py-20 bg-gradient-to-b from-white to-gray-50 scroll-mt-28"
      >
        <div className="container mx-auto px-6 w-full">
          {/* Heading */}
          <ScrollReveal>
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-5xl text-[#154D71] mb-4">
                Desa Binaan <span className="text-[#33A1E0]">BPS</span>
              </h2>
              <p className="text-sm sm:text-xl text-gray-600 max-w-2xl mx-auto">Daftar desa yang telah bergabung dalam program Desa Cinta Statistik</p>
              <div className="w-full max-w-[120px] h-1 bg-gradient-to-r from-[#33A1E0] to-[#1C6EA4] mx-auto mt-4 rounded-full" />
            </div>
          </ScrollReveal>

          {/* Loading */}
          {loading && <div className="text-center py-12 text-gray-600">Memuat desa binaan...</div>}

          {/* Slider */}
          {/* Slider */}
          {!loading && villages.length > 0 && (
            <div className="w-full">
              {/* DESKTOP VERSION: Slider Navigasi Manual */}
              <div className="hidden md:block max-w-5xl mx-auto">
                {/* Navigasi atas */}
                <div className="flex items-center justify-between mb-5">
                  <span className="text-sm text-gray-400">
                    {curIdx + 1}–{Math.min(curIdx + VISIBLE, villages.length)} dari {villages.length} desa
                  </span>
                  {villages.length > VISIBLE && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleGoTo(curIdx - 1)}
                        disabled={curIdx === 0}
                        className="w-9 h-9 rounded-full border border-gray-200 bg-white flex items-center justify-center hover:border-[#33A1E0] hover:bg-[#EBF6FD] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        aria-label="Sebelumnya"
                      >
                        <ChevronLeft className="h-4 w-4 text-gray-500" />
                      </button>
                      <button
                        onClick={() => handleGoTo(curIdx + 1)}
                        disabled={curIdx >= maxIdx}
                        className="w-9 h-9 rounded-full border border-gray-200 bg-white flex items-center justify-center hover:border-[#33A1E0] hover:bg-[#EBF6FD] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        aria-label="Berikutnya"
                      >
                        <ChevronRight className="h-4 w-4 text-gray-500" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Sliding track — semua kartu dirender, track digeser */}
                <div ref={containerRef} className="overflow-hidden">
                  <div
                    ref={trackRef}
                    className="flex"
                    style={{
                      gap: `${CARD_GAP}px`,
                      transition: "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                      willChange: "transform",
                    }}
                  >
                    {villages.map((village) => (
                      <div
                        key={village.id}
                        className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col group flex-shrink-0"
                        style={{ width: cardWidth > 0 ? `${cardWidth}px` : `calc((100% - ${CARD_GAP * (VISIBLE - 1)}px) / ${VISIBLE})` }}
                      >
                        <div className="h-44 overflow-hidden relative flex-shrink-0 bg-[#1C6EA4]">
                          {/* Nama desa sebagai background fallback — ukuran teks selalu seragam */}
                          <div className="absolute inset-0 flex items-center justify-center px-4">
                            <span className="text-white text-3xl font-bold text-center leading-snug">{village.name}</span>
                          </div>
                          {/* Gambar asli menutupi fallback jika berhasil load dan bukan placeholder */}
                          <img
                            src={village.image}
                            alt={village.name}
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                            onLoad={(e) => {
                              if (e.target.src.includes("placehold.co")) {
                                e.target.style.display = "none";
                              }
                            }}
                          />
                          <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-widest bg-[#EBF6FD] text-[#1C6EA4] px-3 py-1 rounded-full z-10">Desa Binaan</span>
                        </div>
                        <div className="p-5 flex flex-col flex-1 gap-2">
                          <h3 className="text-base font-semibold text-[#154D71] truncate">{village.name}</h3>
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-2 text-gray-500">
                              <MapPin className="h-3.5 w-3.5 text-[#33A1E0] flex-shrink-0" />
                              <span className="text-xs">
                                {village.district}, {village.regency}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-500">
                              <Users className="h-3.5 w-3.5 text-[#33A1E0] flex-shrink-0" />
                              <span className="text-xs">{village.population.toLocaleString("id-ID")} jiwa</span>
                            </div>
                          </div>
                          <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 flex-1">
                            {village.name} adalah desa yang terletak di {village.district}, {village.regency}. Desa ini merupakan bagian dari program Desa Cinta Statistik.
                          </p>
                          <a
                            href={getVillageUrl(village.name)}
                            className="mt-2 w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#33A1E0] to-[#1C6EA4] hover:from-[#1C6EA4] hover:to-[#154D71] text-white text-sm font-semibold px-4 py-2.5 rounded-full shadow-md hover:shadow-lg transition-all group/btn"
                          >
                            Lihat Detail
                            <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Dots */}
                {villages.length > VISIBLE && (
                  <div className="flex justify-center items-center gap-2 mt-6">
                    {Array.from({ length: totalDots }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => handleGoTo(i)}
                        className="h-2 rounded-full focus:outline-none transition-all duration-500"
                        style={{
                          width: i === curIdx ? "28px" : "8px",
                          background: i === curIdx ? "#33A1E0" : "#d1d5db",
                        }}
                        aria-label={`Slide ${i + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* MOBILE & TABLET VERSION: Smooth Infinite Loop Marquee */}
              <div className="block md:hidden w-full overflow-hidden relative py-4">
                <style dangerouslySetInnerHTML={{__html: `
                  @keyframes marquee-home {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                  }
                  .animate-marquee-home {
                    display: flex;
                    width: max-content;
                    animation: marquee-home 20s linear infinite;
                  }
                  .animate-marquee-home:hover {
                    animation-play-state: paused;
                  }
                `}} />
                <div className="animate-marquee-home gap-5">
                  {/* Duplikasi data desa untuk looping tidak terputus */}
                  {[...villages, ...villages].map((village, index) => (
                    <div
                      key={`${village.id}-${index}`}
                      className="bg-white rounded-2xl overflow-hidden shadow-md border border-slate-100 flex flex-col flex-shrink-0 w-[270px] group"
                    >
                      <div className="h-40 overflow-hidden relative flex-shrink-0 bg-[#1C6EA4]">
                        <div className="absolute inset-0 flex items-center justify-center px-4">
                          <span className="text-white text-2xl font-bold text-center leading-snug">{village.name}</span>
                        </div>
                        <img
                          src={village.image}
                          alt={village.name}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                          onLoad={(e) => {
                            if (e.target.src.includes("placehold.co")) {
                              e.target.style.display = "none";
                            }
                          }}
                        />
                        <span className="absolute top-3 left-3 text-[9px] font-bold uppercase tracking-widest bg-[#EBF6FD] text-[#1C6EA4] px-2.5 py-0.5 rounded-full z-10">Desa Binaan</span>
                      </div>
                      <div className="p-4 flex flex-col flex-1 gap-2">
                        <h3 className="text-sm font-semibold text-[#154D71] truncate">{village.name}</h3>
                        <div className="flex flex-col gap-1.5 text-xs text-gray-500">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3.5 w-3.5 text-[#33A1E0] flex-shrink-0" />
                            <span className="truncate">{village.district}, {village.regency}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-3.5 w-3.5 text-[#33A1E0] flex-shrink-0" />
                            <span>{village.population.toLocaleString("id-ID")} jiwa</span>
                          </div>
                        </div>
                        <p className="text-gray-500 text-xs leading-relaxed line-clamp-2 mt-1">
                          {village.name} adalah desa binaan dalam program Desa Cinta Statistik.
                        </p>
                        <a
                          href={getVillageUrl(village.name)}
                          className="mt-2 w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#33A1E0] to-[#1C6EA4] hover:from-[#1C6EA4] hover:to-[#154D71] text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-md transition-all"
                        >
                          Lihat Detail
                          <ArrowRight className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer scrollToVillages={scrollToVillages} />
    </div>
  );
}
