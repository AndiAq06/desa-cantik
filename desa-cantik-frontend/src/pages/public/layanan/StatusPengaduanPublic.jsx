import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Loader2, Search, FileText, CheckCircle2, RefreshCw, XCircle, Download, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { villageService } from "@/services/villageService";
import { dataApi } from "@/services/dataApi";
import VillageDetailNavbar from "@/components/shared/VillageDetailNavbar";
import Footer from "@/components/shared/Footer";

export default function StatusPengaduanPublic() {
  const { slug } = useParams();
  const [village, setVillage] = useState(null);
  const [loadingVillage, setLoadingVillage] = useState(true);
  const [email, setEmail] = useState("");
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
    if (!email.trim()) {
      toast.error("Silakan masukkan email Anda");
      return;
    }
    try {
      setSearching(true);
      const data = await dataApi.checkPengaduanStatus(village.id, email.trim());
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
      case "Selesai":
        return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Selesai</Badge>;
      case "Diproses":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Diproses</Badge>;
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
            Status Pengaduan Masyarakat
          </h1>
          <p className="text-slate-500 mt-2 text-sm max-w-md mx-auto">
            Masukkan Email Anda untuk memantau status tindak lanjut pengaduan Anda di Desa {village?.name}
          </p>
        </div>

        {/* Form Pengecekan */}
        <Card className="border-slate-200 shadow-lg rounded-2xl bg-white mb-10">
          <CardContent className="p-6">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1 w-full gap-2 grid">
                <label className="text-sm font-semibold text-slate-700">Alamat Email Pengirim <span className="text-red-500">*</span></label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Masukkan alamat email yang Anda daftarkan"
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

        {/* Tampilan Hasil Pencarian */}
        {hasSearched && (
          <Card className="border-slate-200 shadow-lg rounded-2xl bg-white mb-10 overflow-hidden">
            <CardHeader className="bg-slate-50 border-b border-slate-100">
              <CardTitle className="text-slate-800 text-md">Daftar Pengaduan Email: <span className="font-bold text-[#1C6EA4]">{email}</span></CardTitle>
              <CardDescription>Ditemukan {results.length} laporan pengaduan</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {results.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-slate-50/50">
                      <TableRow className="border-slate-100">
                        <TableHead className="font-semibold text-slate-600 pl-6">Tanggal Pengaduan</TableHead>
                        <TableHead className="font-semibold text-slate-600">Judul Pengaduan</TableHead>
                        <TableHead className="font-semibold text-slate-600">Isi Pengaduan</TableHead>
                        <TableHead className="font-semibold text-slate-600">Lampiran</TableHead>
                        <TableHead className="font-semibold text-slate-600">Status</TableHead>
                        <TableHead className="font-semibold text-slate-600 pr-6">Tanggapan/Keterangan</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {results.map((item) => (
                        <TableRow key={item.id} className="border-slate-100 hover:bg-slate-50/50 text-slate-700">
                          <TableCell className="text-xs pl-6">
                            {new Date(item.created_at).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "long",
                              year: "numeric"
                            })}
                          </TableCell>
                          <TableCell className="font-semibold text-sm text-slate-900">{item.judul_pengaduan}</TableCell>
                          <TableCell className="text-xs text-slate-500 max-w-[200px] truncate" title={item.uraian}>
                            {item.uraian}
                          </TableCell>
                          <TableCell>
                            {item.lampiran_url ? (
                              <a
                                href={item.lampiran_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-semibold"
                              >
                                Berkas <ExternalLink className="h-3 w-3" />
                              </a>
                            ) : (
                              <span className="text-xs text-slate-400">-</span>
                            )}
                          </TableCell>
                          <TableCell>{getStatusBadge(item.status)}</TableCell>
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
                  Tidak ada data pengaduan untuk alamat email tersebut.
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="text-center">
          <p className="text-sm text-slate-500">
            Ingin mengajukan permasalahan baru?{" "}
            <Link to={`/desa/${slug}/layanan-online/pengaduan`} className="text-[#1C6EA4] font-semibold hover:underline">
              Isi Formulir Pengaduan
            </Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
