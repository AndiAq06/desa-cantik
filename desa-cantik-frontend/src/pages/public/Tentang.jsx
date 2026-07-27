import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Users, Target, TrendingUp, Shield, FileText, UserCircle2 } from "lucide-react";

import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";

import { dashboardService } from "@/services/dashboardService";
import { teamApi } from "@/services/teamApi";

import backgroundImage from "@/assets/images/bg.jpg";
import Logo from "@/assets/images/logo desa cantik.jpg";

const Tentang = () => {
  const [stats, setStats] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loadingTeam, setLoadingTeam] = useState(true);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoadingStats(true);
        const data = await dashboardService.getPublicDashboard();
        const transformedStats = [
          { icon: Users, label: "Desa Binaan", value: data.summary?.totalVillages ? `${data.summary.totalVillages}` : "0" },
          { icon: FileText, label: "Publikasi", value: data.summary?.totalPublications ? `${data.summary.totalPublications}` : "0" },
          { icon: TrendingUp, label: "Data Statistik", value: data.summary?.totalStatistics || "0" },
          { icon: Shield, label: "Update Terakhir", value: data.summary?.lastUpdate ? new Date(data.summary.lastUpdate).toLocaleDateString("id-ID") : "-" },
        ];
        setStats(transformedStats);
      } catch (error) {
        console.error("Gagal memuat statistik:", error);
        setStats([
          { icon: Users, label: "Desa Binaan", value: "-" },
          { icon: FileText, label: "Publikasi", value: "-" },
          { icon: TrendingUp, label: "Data Statistik", value: "-" },
          { icon: Shield, label: "Update Terakhir", value: "-" },
        ]);
      } finally {
        setLoadingStats(false);
      }
    };
    loadStats();
  }, []);

  useEffect(() => {
    const loadTeamMembers = async () => {
      try {
        setLoadingTeam(true);
        const data = await teamApi.listTeamMembers();
        // Ganti Teguh Christiawan → Andi Ardiansyah Nasir
        const normalized = data.map((m) => (m.name === "Teguh Christiawan" ? { ...m, name: "Andi Ardiansyah Nasir", role: "Toraja Utara" } : m));
        setTeamMembers(normalized);
      } catch (error) {
        console.error("Gagal memuat tim pengelola:", error);
        setTeamMembers([]);
      } finally {
        setLoadingTeam(false);
      }
    };
    loadTeamMembers();
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar scrollToVillages={scrollToTop} />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#5ab8ee] to-[#347dad] text-white py-24 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-20 mix-blend-overlay" style={{ backgroundImage: `url(${backgroundImage})` }}></div>
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 drop-shadow-lg leading-tight">
              Tentang Program <span className="text-[#FFF9AF]">Desa Cantik</span>
            </h1>
            <p className="text-lg md:text-xl text-blue-50 max-w-2xl mx-auto leading-relaxed font-light">Inisiatif Badan Pusat Statistik untuk membangun desa yang sadar data, cerdas statistik, dan transparan dalam pembangunan.</p>
          </div>
        </div>
      </section>

      {/* Konten Utama */}
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-7xl mx-auto space-y-24">
          {/* Penjelasan Program */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-block">
                <span className="bg-blue-50 text-[#33A1E0] px-4 py-1.5 text-sm font-semibold rounded-full border border-blue-100">Program Unggulan BPS</span>
              </div>
              <h2 className="text-4xl font-bold text-[#154D71]">Apa itu Desa Cantik?</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed text-lg">
                <p>
                  <span className="font-semibold text-[#33A1E0]">Desa Cinta Statistik (Desa Cantik)</span> adalah program pembinaan statistik sektoral di tingkat desa yang dirancang oleh BPS. Program ini bertujuan untuk meningkatkan
                  kompetensi aparatur desa dalam pengelolaan dan pemanfaatan data.
                </p>
                <p>Dengan data yang berkualitas, desa dapat merencanakan pembangunan yang lebih tepat sasaran, memantau hasil pembangunan secara akurat, dan meningkatkan transparansi kepada masyarakat.</p>
              </div>
            </div>
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-[#33A1E0] to-[#1C6EA4] rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition duration-500"></div>
              <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-video bg-gray-100">
                <img
                  src={Logo}
                  alt="Kegiatan Desa Cantik"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                  onError={(e) => (e.target.src = "https://placehold.co/800x600/33A1E0/ffffff?text=Tentang+Program")}
                />
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {loadingStats
              ? Array(4)
                  .fill(0)
                  .map((_, i) => (
                    <Card key={i} className="p-6 border border-gray-100 shadow-sm bg-white">
                      <CardContent className="p-0 flex flex-col items-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-2xl mb-4 animate-pulse"></div>
                        <div className="h-8 w-24 bg-gray-100 rounded mb-2 animate-pulse"></div>
                        <div className="h-4 w-32 bg-gray-100 rounded animate-pulse"></div>
                      </CardContent>
                    </Card>
                  ))
              : stats.map((stat, index) => (
                  <Card key={index} className="text-center p-6 border-0 shadow-lg hover:shadow-xl transition-all bg-white group hover:-translate-y-1">
                    <CardContent className="p-0">
                      <div className="w-16 h-16 mx-auto mb-4 bg-blue-50 rounded-2xl flex items-center justify-center group-hover:bg-[#33A1E0] transition-colors duration-300">
                        <stat.icon className="h-8 w-8 text-[#33A1E0] group-hover:text-white transition-colors duration-300" />
                      </div>
                      <p className="text-3xl font-bold text-[#154D71] mb-1">{stat.value}</p>
                      <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                    </CardContent>
                  </Card>
                ))}
          </div>

          {/* Tujuan & Manfaat */}
          <section className="grid md:grid-cols-2 gap-8">
            <Card className="border-0 shadow-xl bg-white overflow-hidden group hover:shadow-2xl transition-shadow duration-300">
              <div className="h-1.5 bg-gradient-to-r from-[#1C6EA4] to-[#33A1E0]"></div>
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <Target className="h-8 w-8 text-[#1C6EA4]" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#154D71]">Tujuan Program</h3>
                </div>
                <ul className="space-y-4">
                  {["Meningkatkan literasi statistik perangkat desa", "Standarisasi pengelolaan data di level desa", "Optimalisasi penggunaan data untuk pembangunan", "Mewujudkan desa yang mandiri data"].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-gray-600 group/item">
                      <div className="w-1.5 h-1.5 bg-[#33A1E0] rounded-full mt-2.5 flex-shrink-0 group-hover/item:scale-125 transition-transform" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-white overflow-hidden group hover:shadow-2xl transition-shadow duration-300">
              <div className="h-1.5 bg-gradient-to-r from-[#33A1E0] to-[#4BADE4]"></div>
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <TrendingUp className="h-8 w-8 text-[#33A1E0]" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#154D71]">Manfaat Program</h3>
                </div>
                <ul className="space-y-4">
                  {["Perencanaan pembangunan lebih tepat sasaran", "Efisiensi anggaran desa berbasis bukti", "Publikasi potensi desa yang lebih menarik", "Meningkatkan kepercayaan publik melalui transparansi"].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-gray-600 group/item">
                      <div className="w-1.5 h-1.5 bg-[#4BADE4] rounded-full mt-2.5 flex-shrink-0 group-hover/item:scale-125 transition-transform" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </section>

          {/* Tim Pengelola */}
          <section className="bg-[#154D71] rounded-3xl py-16 px-6 md:px-12 text-center shadow-2xl text-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Tim Pengelola Program</h2>
              <p className="text-blue-200 mb-12 max-w-2xl mx-auto">Orang-orang berdedikasi di balik kesuksesan implementasi Desa Cantik</p>

              {loadingTeam ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                  {Array(3)
                    .fill(0)
                    .map((_, i) => (
                      <div key={i} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                        <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-white/20 animate-pulse"></div>
                        <div className="h-6 bg-white/20 rounded mb-2 animate-pulse"></div>
                        <div className="h-4 bg-white/20 rounded animate-pulse"></div>
                      </div>
                    ))}
                </div>
              ) : teamMembers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                  {teamMembers.map((person, index) => (
                    <div key={person.id || index} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/20 transition-colors">
                      {/* Avatar icon modern — seragam semua */}
                      <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#33A1E0] to-[#1C6EA4] flex items-center justify-center shadow-lg ring-4 ring-white/20">
                        <UserCircle2 className="w-12 h-12 text-white" strokeWidth={1.5} />
                      </div>
                      <h3 className="text-xl font-semibold mb-1">{person.name}</h3>
                      <p className="text-blue-200 text-sm">{person.role}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-blue-200">
                  <p>Informasi tim pengelola akan segera ditambahkan</p>
                </div>
              )}
            </div>
          </section>

          {/* Dokumen SK */}
          <section className="bg-[#FFF9AF]/50 rounded-3xl p-8 md:p-12 border border-[#FFF9AF] flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-3 text-[#154D71]">
                <FileText className="w-8 h-8" />
                <h2 className="text-2xl md:text-3xl font-bold">Booklet Desa Cantik</h2>
              </div>
              <p className="text-gray-700 leading-relaxed">Booklet ini memuat pedoman teknis, Tata Kelola Desa Cantik, dan mekanisme pendampingan desa.</p>
            </div>
            <div className="flex-shrink-0">
              <a href="/Desa_Cantik_Booklet.pdf" download>
                <Button className="bg-[#154D71] hover:bg-[#0f3a57] text-white px-8 py-6 text-lg shadow-xl hover:shadow-2xl transition-all rounded-xl" onClick={() => window.open("/Desa_Cantik_Booklet.pdf", "_blank")}>
                  <Download className="mr-2 h-5 w-5" />
                  Unduh Booklet
                </Button>
              </a>
            </div>
          </section>
        </div>
      </div>

      <Footer scrollToVillages={scrollToTop} />
    </div>
  );
};

export default Tentang;
