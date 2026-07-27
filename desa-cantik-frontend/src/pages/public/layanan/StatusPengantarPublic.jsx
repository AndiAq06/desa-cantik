import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Loader2, Search, FileText, CheckCircle2, AlertTriangle, XCircle, ArrowRight, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { villageService } from "@/services/villageService";
import { dataApi } from "@/services/dataApi";
import VillageDetailNavbar from "@/components/shared/VillageDetailNavbar";
import Footer from "@/components/shared/Footer";

export default function StatusPengantarPublic() {
  const { slug } = useParams();
  const [village, setVillage] = useState(null);
  const [loadingVillage, setLoadingVillage] = useState(true);
  const [nik, setNik] = useState("");
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [results, setResults] = useState([]);

  useEffect(() => {
    const fetchVillage = async () => {
      try {
        setLoadingVillage(true);
        const data = await villageService.getVillageById(slug);
        setVillage(data);
      } catch (err) {
        console.error("Gagal memuat data desa:", err);
        toast.error("Gagal memuat data desa");
      } finally {
        setLoadingVillage(false);
      }
    };
    fetchVillage();
  }, [slug]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!nik.trim()) {
      toast.error("Silakan masukkan NIK Anda");
      return;
    }
    try {
      setSearching(true);
      const data = await dataApi.checkSuratStatus(village.id, nik.trim());
      setResults(data || []);
      setHasSearched(true);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Gagal memeriksa status");
    } finally {
      setSearching(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Disetujui":
        return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Disetujui</Badge>;
      case "Ditolak":
        return <Badge className="bg-rose-100 text-rose-800 border-rose-200">Ditolak</Badge>;
      default:
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Menunggu Verifikasi</Badge>;
    }
  };

  if (loadingVillage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-[#1C6EA4]" />
          <p className="text-sm text-slate-500 font-medium">Memuat Halaman...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <VillageDetailNavbar village={village} />

      <main className="flex-1 container mx-auto px-4 py-10 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800 uppercase tracking-tight">
            Hasil Layanan Administrasi
          </h1>
          <p className="text-slate-500 mt-2 text-sm max-w-md mx-auto">
            Masukkan NIK Anda untuk melihat hasil dan status pengajuan layanan administrasi warga Desa {village?.name}
          </p>
        </div>

        {/* Form Pengecekan */}
        <Card className="border-slate-200 shadow-lg rounded-2xl bg-white mb-10">
          <CardContent className="p-6">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1 w-full gap-2 grid">
                <label className="text-sm font-semibold text-slate-700">Nomor Induk Kependudukan (NIK) <span className="text-red-500">*</span></label>
                <Input
                  value={nik}
                  onChange={(e) => setNik(e.target.value)}
                  maxLength={16}
                  placeholder="Masukkan 16 digit NIK Anda"
                  className="rounded-xl border-slate-300 focus-visible:ring-slate-400 h-11"
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={searching}
                className="w-full sm:w-auto bg-[#4eaf47] hover:bg-[#439e3d] text-white font-semibold rounded-xl px-6 h-11 flex items-center justify-center gap-2 shadow"
              >
                {searching ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Memeriksa...
                  </>
                ) : (
                  <>
                    <Search className="h-5 w-5" />
                    Cek Status
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Panduan Visual Alur Status */}
        <div className="border border-slate-200 bg-white rounded-2xl p-6 shadow-md mb-10">
          <h2 className="text-center text-md font-bold text-slate-800 uppercase tracking-wider mb-6">
            Cek Status Pengajuan Layanan Administrasi Anda
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
              <CheckCircle2 className="h-8 w-8 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-emerald-900 text-sm">Permohonan Disetujui</h4>
                <p className="text-xs text-emerald-700 mt-1">Berkas/Dokumen PDF hasil layanan administrasi siap diunduh</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100">
              <Loader2 className="h-8 w-8 text-amber-600 shrink-0 mt-0.5 animate-spin-slow" style={{ animationDuration: '3s' }} />
              <div>
                <h4 className="font-bold text-amber-900 text-sm">Menunggu Verifikasi</h4>
                <p className="text-xs text-amber-700 mt-1">Berkas permohonan sedang diperiksa dan diproses oleh admin desa</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-rose-50 rounded-xl border border-rose-100">
              <XCircle className="h-8 w-8 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-rose-900 text-sm">Permohonan Ditolak</h4>
                <p className="text-xs text-rose-700 mt-1">Pengajuan ditolak karena persyaratan kurang lengkap atau data tidak valid</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tampilan Hasil Pencarian */}
        {hasSearched && (
          <Card className="border-slate-200 shadow-lg rounded-2xl bg-white mb-10 overflow-hidden">
            <CardHeader className="bg-slate-50 border-b border-slate-100">
              <CardTitle className="text-slate-800 text-md">Hasil Pengecekan NIK: <span className="font-bold text-[#1C6EA4]">{nik}</span></CardTitle>
              <CardDescription>Ditemukan {results.length} pengajuan layanan administrasi</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {results.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-slate-50/50">
                      <TableRow className="border-slate-100">
                        <TableHead className="font-semibold text-slate-600 pl-6">Tanggal Pengajuan</TableHead>
                        <TableHead className="font-semibold text-slate-600">Jenis Surat</TableHead>
                        <TableHead className="font-semibold text-slate-600">Nama Pemohon</TableHead>
                        <TableHead className="font-semibold text-slate-600">Status</TableHead>
                        <TableHead className="font-semibold text-slate-600">Dokumen Hasil</TableHead>
                        <TableHead className="font-semibold text-slate-600 pr-6">Keterangan / Alasan</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {results.map((item) => (
                        <TableRow key={item.id} className="border-slate-100 hover:bg-slate-50/50 text-slate-700">
                          <TableCell className="text-xs pl-6">
                            {new Date(item.created_at).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </TableCell>
                          <TableCell className="font-semibold text-sm text-slate-900">{item.jenis_surat}</TableCell>
                          <TableCell className="text-sm">{item.nama_lengkap}</TableCell>
                          <TableCell>{getStatusBadge(item.status)}</TableCell>
                          <TableCell>
                            {item.file_hasil_url ? (
                              <a
                                href={item.file_hasil_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg shadow-sm transition-colors"
                              >
                                <Download className="h-3.5 w-3.5" />
                                Unduh PDF
                              </a>
                            ) : (
                              <span className="text-xs text-slate-400 italic">Belum tersedia</span>
                            )}
                          </TableCell>
                          <TableCell className="text-xs text-slate-500 max-w-[200px] truncate pr-6" title={item.keterangan}>
                            {item.keterangan || "-"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="p-10 text-center text-slate-400 text-sm">
                  Tidak ada data pengajuan layanan administrasi untuk NIK tersebut.
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Jenis Surat yang Tersedia */}
        <div>
          <h3 className="text-center text-sm font-bold text-slate-800 uppercase tracking-wider mb-6">
            Jenis Surat yang Tersedia
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-3">
                  <FileText className="h-5 w-5" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm">Surat Keterangan Usaha (SKU)</h4>
                <p className="text-xs text-slate-500 mt-1">Untuk keperluan administrasi usaha, pengajuan kredit, dan legalitas usaha lainnya.</p>
              </div>
              <Button asChild className="mt-4 bg-[#1C6EA4] hover:bg-[#154D71] text-white text-xs rounded-lg h-9 w-full flex items-center justify-center gap-1">
                <Link to={`/desa/${slug}/layanan-online/surat-pengantar`}>
                  Ajukan Sekarang <ArrowRight className="h-3 w-3" />
                </Link>
              </Button>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mb-3">
                  <FileText className="h-5 w-5" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm">Surat Keterangan Tidak Mampu (SKTM)</h4>
                <p className="text-xs text-slate-500 mt-1">Untuk keperluan beasiswa pendidikan, keringanan biaya kesehatan, dan bantuan sosial.</p>
              </div>
              <Button asChild className="mt-4 bg-[#1C6EA4] hover:bg-[#154D71] text-white text-xs rounded-lg h-9 w-full flex items-center justify-center gap-1">
                <Link to={`/desa/${slug}/layanan-online/surat-pengantar`}>
                  Ajukan Sekarang <ArrowRight className="h-3 w-3" />
                </Link>
              </Button>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 mb-3">
                  <FileText className="h-5 w-5" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm">Surat Keterangan Kematian</h4>
                <p className="text-xs text-slate-500 mt-1">Untuk bukti administrasi pelaporan kematian kerabat / keluarga kepada pihak kelurahan/desa.</p>
              </div>
              <Button asChild className="mt-4 bg-[#1C6EA4] hover:bg-[#154D71] text-white text-xs rounded-lg h-9 w-full flex items-center justify-center gap-1">
                <Link to={`/desa/${slug}/layanan-online/surat-pengantar`}>
                  Ajukan Sekarang <ArrowRight className="h-3 w-3" />
                </Link>
              </Button>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mb-3">
                  <FileText className="h-5 w-5" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm">Surat Izin Kegiatan</h4>
                <p className="text-xs text-slate-500 mt-1">Untuk keperluan perizinan pelaksanaan acara atau kegiatan keramaian di lingkungan desa.</p>
              </div>
              <Button asChild className="mt-4 bg-[#1C6EA4] hover:bg-[#154D71] text-white text-xs rounded-lg h-9 w-full flex items-center justify-center gap-1">
                <Link to={`/desa/${slug}/layanan-online/surat-pengantar`}>
                  Ajukan Sekarang <ArrowRight className="h-3 w-3" />
                </Link>
              </Button>
            </div>

          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
