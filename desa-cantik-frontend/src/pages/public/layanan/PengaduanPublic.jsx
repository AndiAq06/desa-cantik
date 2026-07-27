import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Loader2, FileText, CheckSquare, Search, Send, Upload, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { villageService } from "@/services/villageService";
import { dataApi } from "@/services/dataApi";
import VillageDetailNavbar from "@/components/shared/VillageDetailNavbar";
import Footer from "@/components/shared/Footer";

export default function PengaduanPublic() {
  const { slug } = useParams();
  const [village, setVillage] = useState(null);
  const [loadingVillage, setLoadingVillage] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [file, setFile] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    nama_lengkap: "",
    email: "",
    nomor_telepon: "",
    alamat: "",
    judul_pengaduan: "",
    uraian: "",
  });

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error("Ukuran file tidak boleh lebih dari 10MB");
        e.target.value = null;
        setFile(null);
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      
      const payload = new FormData();
      payload.append("nama_lengkap", formData.nama_lengkap);
      payload.append("email", formData.email);
      payload.append("nomor_telepon", formData.nomor_telepon);
      payload.append("alamat", formData.alamat);
      payload.append("judul_pengaduan", formData.judul_pengaduan);
      payload.append("uraian", formData.uraian);
      
      if (file) {
        payload.append("lampiran", file);
      }

      await dataApi.createPengaduan(village.id, payload);
      toast.success("Pengaduan Anda berhasil terkirim!");
      
      // Reset form
      setFormData({
        nama_lengkap: "",
        email: "",
        nomor_telepon: "",
        alamat: "",
        judul_pengaduan: "",
        uraian: "",
      });
      setFile(null);
      const fileInput = document.getElementById("file-attachment");
      if (fileInput) fileInput.value = null;
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Gagal mengirim pengaduan");
    } finally {
      setSubmitting(false);
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
            Pengaduan Masyarakat
          </h1>
          <p className="text-slate-500 mt-2 text-sm max-w-lg mx-auto">
            Sistem terbuka untuk menyuarakan permasalahan dan memperbaiki pelayanan. Kami mendengar, bertindak, dan membangun solusi bersama untuk meningkatkan kualitas hidup.
          </p>
        </div>

        {/* Steps header (Gambar 4) */}
        <div className="flex justify-center items-center gap-8 md:gap-16 mb-8 text-slate-500 text-xs md:text-sm font-semibold border-b border-slate-200 pb-4 max-w-md mx-auto">
          <div className="flex flex-col items-center gap-1.5 text-[#1C6EA4]">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center border-2 border-[#1C6EA4]">
              <FileText className="h-5 w-5 text-[#1C6EA4]" />
            </div>
            <span>Isi Formulir</span>
          </div>

          <div className="flex flex-col items-center gap-1.5">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
              <CheckSquare className="h-5 w-5 text-slate-400" />
            </div>
            <span>Bukti Laporan</span>
          </div>

          <Link to={`/desa/${slug}/layanan-online/status-pengaduan`} className="flex flex-col items-center gap-1.5 hover:text-[#1C6EA4] transition-colors">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 hover:border-blue-300">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <span>Monitoring</span>
          </Link>
        </div>

        <Card className="border-slate-200 shadow-xl rounded-2xl overflow-hidden bg-white">
          <CardContent className="p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Kolom A: DATA DIRI */}
                <div className="space-y-4">
                  <h3 className="text-md font-bold text-slate-800 border-b border-slate-100 pb-2">
                    A. DATA DIRI
                  </h3>

                  {/* Nama Lengkap */}
                  <div className="grid gap-2">
                    <Label className="text-sm font-semibold text-slate-700">Nama Lengkap <span className="text-red-500">*</span></Label>
                    <Input
                      name="nama_lengkap"
                      value={formData.nama_lengkap}
                      onChange={handleChange}
                      placeholder="Masukkan Nama Lengkap"
                      className="rounded-xl border-slate-300 focus-visible:ring-slate-400"
                      required
                    />
                  </div>

                  {/* Email */}
                  <div className="grid gap-2">
                    <Label className="text-sm font-semibold text-slate-700">Email <span className="text-red-500">*</span></Label>
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Masukkan Alamat Email"
                      className="rounded-xl border-slate-300 focus-visible:ring-slate-400"
                      required
                    />
                  </div>

                  {/* Nomor Telepon */}
                  <div className="grid gap-2">
                    <Label className="text-sm font-semibold text-slate-700">Nomor Telepon <span className="text-red-500">*</span></Label>
                    <Input
                      name="nomor_telepon"
                      value={formData.nomor_telepon}
                      onChange={handleChange}
                      placeholder="Contoh: 081234567890"
                      className="rounded-xl border-slate-300 focus-visible:ring-slate-400"
                      required
                    />
                  </div>

                  {/* Alamat Lengkap */}
                  <div className="grid gap-2">
                    <Label className="text-sm font-semibold text-slate-700">Alamat <span className="text-red-500">*</span></Label>
                    <Textarea
                      name="alamat"
                      value={formData.alamat}
                      onChange={handleChange}
                      placeholder="Masukkan Alamat Lengkap"
                      className="rounded-xl border-slate-300 focus-visible:ring-slate-400 min-h-[100px]"
                      required
                    />
                  </div>
                </div>

                {/* Kolom B: URAIAN PENGADUAN */}
                <div className="space-y-4">
                  <h3 className="text-md font-bold text-slate-800 border-b border-slate-100 pb-2">
                    B. URAIAN PENGADUAN
                  </h3>

                  {/* Judul Pengaduan */}
                  <div className="grid gap-2">
                    <Label className="text-sm font-semibold text-slate-700">Judul Pengaduan <span className="text-red-500">*</span></Label>
                    <Input
                      name="judul_pengaduan"
                      value={formData.judul_pengaduan}
                      onChange={handleChange}
                      placeholder="Masukkan Judul Pengaduan"
                      className="rounded-xl border-slate-300 focus-visible:ring-slate-400"
                      required
                    />
                  </div>

                  {/* Uraian Lengkap */}
                  <div className="grid gap-2">
                    <Label className="text-sm font-semibold text-slate-700">Uraian Lengkap <span className="text-red-500">*</span></Label>
                    <Textarea
                      name="uraian"
                      value={formData.uraian}
                      onChange={handleChange}
                      placeholder="Jelaskan secara detail pengaduan Anda..."
                      className="rounded-xl border-slate-300 focus-visible:ring-slate-400 min-h-[140px]"
                      required
                    />
                  </div>

                  {/* Lampiran (Choose File) */}
                  <div className="grid gap-2">
                    <Label className="text-sm font-semibold text-slate-700">Lampiran (jika ada)</Label>
                    <div className="flex flex-col gap-2">
                      <div className="relative border border-dashed border-slate-300 rounded-xl p-4 bg-slate-50 flex flex-col items-center justify-center hover:bg-slate-100 transition-colors">
                        <Upload className="h-6 w-6 text-slate-400 mb-2" />
                        <span className="text-xs text-slate-600 font-medium">Unggah Berkas</span>
                        <input
                          id="file-attachment"
                          type="file"
                          accept=".pdf,image/jpg,image/jpeg,image/png"
                          onChange={handleFileChange}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        {file && (
                          <div className="mt-2 text-xs font-bold text-[#1C6EA4] truncate max-w-full px-2 bg-blue-50 py-1 rounded">
                            {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3 shrink-0" />
                        Lampiran dokumen/foto pendukung (pdf, jpg, jpeg, png) maks 10MB
                      </span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Button Kirim */}
              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#4eaf47] hover:bg-[#439e3d] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md transition-colors h-11"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Mengirim Pengaduan...
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      Kirim Pengaduan
                    </>
                  )}
                </Button>
              </div>

            </form>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
