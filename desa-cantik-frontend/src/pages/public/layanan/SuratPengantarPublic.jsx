import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Loader2, Send } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { villageService } from "@/services/villageService";
import { dataApi } from "@/services/dataApi";
import VillageDetailNavbar from "@/components/shared/VillageDetailNavbar";
import Footer from "@/components/shared/Footer";

export default function SuratPengantarPublic() {
  const { slug } = useParams();
  const [village, setVillage] = useState(null);
  const [loadingVillage, setLoadingVillage] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    jenis_surat: "",
    nik: "",
    nama_lengkap: "",
    alamat_lengkap: "",
    tempat_lahir: "",
    tanggal_lahir: "",
    jenis_kelamin: "",
    pekerjaan: "",
    nomor_hp: "",
    email: "",
    hari_pelaksanaan: "",
    tanggal_kegiatan: "",
    tempat_kegiatan: "",
    jenis_kegiatan: "",
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

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.nik.length !== 16) {
      toast.error("NIK harus terdiri dari 16 digit");
      return;
    }

    try {
      setSubmitting(true);
      // Clean nullable fields if not Surat Izin Kegiatan
      const payload = { ...formData };
      if (formData.jenis_surat !== "SURAT IZIN KEGIATAN") {
        delete payload.hari_pelaksanaan;
        delete payload.tanggal_kegiatan;
        delete payload.tempat_kegiatan;
        delete payload.jenis_kegiatan;
      }

      await dataApi.createSuratPengantar(village.id, payload);
      toast.success("Permohonan layanan administrasi berhasil dikirim!");
      
      // Reset form
      setFormData({
        jenis_surat: "",
        nik: "",
        nama_lengkap: "",
        alamat_lengkap: "",
        tempat_lahir: "",
        tanggal_lahir: "",
        jenis_kelamin: "",
        pekerjaan: "",
        nomor_hp: "",
        email: "",
        hari_pelaksanaan: "",
        tanggal_kegiatan: "",
        tempat_kegiatan: "",
        jenis_kegiatan: "",
      });
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Gagal mengirim permohonan layanan administrasi");
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

  if (!village) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50">
        <h1 className="text-2xl font-bold text-red-500">Desa Tidak Ditemukan</h1>
        <Link to="/" className="text-blue-600 hover:underline mt-4">Kembali ke Beranda</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <VillageDetailNavbar village={village} />

      <main className="flex-1 container mx-auto px-4 py-10 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800 uppercase tracking-tight">
            Formulir Layanan Administrasi
          </h1>
          <p className="text-slate-500 mt-2 text-sm max-w-lg mx-auto">
            Pilih jenis surat untuk menampilkan form sesuai kebutuhan administrasi Desa {village.name}
          </p>
        </div>

        <Card className="border-slate-200 shadow-xl rounded-2xl overflow-hidden bg-white">
          <CardContent className="p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Jenis Surat */}
              <div className="grid gap-2">
                <Label className="text-sm font-semibold text-slate-700">Pilih Jenis Surat <span className="text-red-500">*</span></Label>
                <Select
                  value={formData.jenis_surat}
                  onValueChange={(val) => handleSelectChange("jenis_surat", val)}
                  required
                >
                  <SelectTrigger className="rounded-xl border-slate-300 focus:ring-slate-400">
                    <SelectValue placeholder="-- Pilih Jenis Surat --" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="Surat Keterangan Usaha (SKU)">Surat Keterangan Usaha (SKU)</SelectItem>
                    <SelectItem value="Surat Keterangan Tidak Mampu (SKTM)">Surat Keterangan Tidak Mampu (SKTM)</SelectItem>
                    <SelectItem value="Surat Keterangan Kematian">Surat Keterangan Kematian</SelectItem>
                    <SelectItem value="SURAT IZIN KEGIATAN">SURAT IZIN KEGIATAN</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* NIK */}
                <div className="grid gap-2">
                  <Label className="text-sm font-semibold text-slate-700">NIK <span className="text-red-500">*</span></Label>
                  <Input
                    name="nik"
                    value={formData.nik}
                    onChange={handleChange}
                    maxLength={16}
                    placeholder="Masukkan 16 digit NIK"
                    className="rounded-xl border-slate-300 focus-visible:ring-slate-400"
                    required
                  />
                </div>

                {/* Nama Lengkap */}
                <div className="grid gap-2">
                  <Label className="text-sm font-semibold text-slate-700">Nama Lengkap <span className="text-red-500">*</span></Label>
                  <Input
                    name="nama_lengkap"
                    value={formData.nama_lengkap}
                    onChange={handleChange}
                    placeholder="Nama lengkap sesuai KTP"
                    className="rounded-xl border-slate-300 focus-visible:ring-slate-400"
                    required
                  />
                </div>
              </div>

              {/* Alamat Lengkap */}
              <div className="grid gap-2">
                <Label className="text-sm font-semibold text-slate-700">Alamat Lengkap <span className="text-red-500">*</span></Label>
                <Textarea
                  name="alamat_lengkap"
                  value={formData.alamat_lengkap}
                  onChange={handleChange}
                  placeholder="Alamat lengkap tempat tinggal"
                  className="rounded-xl border-slate-300 focus-visible:ring-slate-400 min-h-[80px]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Tempat Lahir */}
                <div className="grid gap-2">
                  <Label className="text-sm font-semibold text-slate-700">Tempat Lahir <span className="text-red-500">*</span></Label>
                  <Input
                    name="tempat_lahir"
                    value={formData.tempat_lahir}
                    onChange={handleChange}
                    placeholder="Kota/Kabupaten tempat lahir"
                    className="rounded-xl border-slate-300 focus-visible:ring-slate-400"
                    required
                  />
                </div>

                {/* Tanggal Lahir */}
                <div className="grid gap-2">
                  <Label className="text-sm font-semibold text-slate-700">Tanggal Lahir <span className="text-red-500">*</span></Label>
                  <Input
                    type="date"
                    name="tanggal_lahir"
                    value={formData.tanggal_lahir}
                    onChange={handleChange}
                    className="rounded-xl border-slate-300 focus-visible:ring-slate-400"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Jenis Kelamin */}
                <div className="grid gap-2">
                  <Label className="text-sm font-semibold text-slate-700">Jenis Kelamin <span className="text-red-500">*</span></Label>
                  <Select
                    value={formData.jenis_kelamin}
                    onValueChange={(val) => handleSelectChange("jenis_kelamin", val)}
                    required
                  >
                    <SelectTrigger className="rounded-xl border-slate-300 focus:ring-slate-400">
                      <SelectValue placeholder="-- Pilih Jenis Kelamin --" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                      <SelectItem value="Perempuan">Perempuan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Pekerjaan */}
                <div className="grid gap-2">
                  <Label className="text-sm font-semibold text-slate-700">Pekerjaan <span className="text-red-500">*</span></Label>
                  <Input
                    name="pekerjaan"
                    value={formData.pekerjaan}
                    onChange={handleChange}
                    placeholder="Pekerjaan saat ini"
                    className="rounded-xl border-slate-300 focus-visible:ring-slate-400"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nomor HP */}
                <div className="grid gap-2">
                  <Label className="text-sm font-semibold text-slate-700">Nomor HP <span className="text-red-500">*</span></Label>
                  <Input
                    name="nomor_hp"
                    value={formData.nomor_hp}
                    onChange={handleChange}
                    placeholder="Contoh: 081234567890"
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
                    placeholder="email@domain.com"
                    className="rounded-xl border-slate-300 focus-visible:ring-slate-400"
                    required
                  />
                </div>
              </div>

              {/* DYNAMIC FIELDS: HANYA UNTUK SURAT IZIN KEGIATAN */}
              {formData.jenis_surat === "SURAT IZIN KEGIATAN" && (
                <div className="border-t border-slate-200 pt-6 mt-6 space-y-6">
                  <h3 className="text-md font-bold text-slate-800">Detail Kegiatan</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Hari Pelaksanaan */}
                    <div className="grid gap-2">
                      <Label className="text-sm font-semibold text-slate-700">Hari Pelaksanaan <span className="text-red-500">*</span></Label>
                      <Input
                        name="hari_pelaksanaan"
                        value={formData.hari_pelaksanaan}
                        onChange={handleChange}
                        placeholder="Contoh: Senin, Selasa, dll"
                        className="rounded-xl border-slate-300 focus-visible:ring-slate-400"
                        required
                      />
                    </div>

                    {/* Tanggal Kegiatan */}
                    <div className="grid gap-2">
                      <Label className="text-sm font-semibold text-slate-700">Tanggal Kegiatan <span className="text-red-500">*</span></Label>
                      <Input
                        type="date"
                        name="tanggal_kegiatan"
                        value={formData.tanggal_kegiatan}
                        onChange={handleChange}
                        className="rounded-xl border-slate-300 focus-visible:ring-slate-400"
                        required
                      />
                    </div>
                  </div>

                  {/* Tempat Kegiatan */}
                  <div className="grid gap-2">
                    <Label className="text-sm font-semibold text-slate-700">Tempat Kegiatan <span className="text-red-500">*</span></Label>
                    <Input
                      name="tempat_kegiatan"
                      value={formData.tempat_kegiatan}
                      onChange={handleChange}
                      placeholder="Lokasi lengkap kegiatan"
                      className="rounded-xl border-slate-300 focus-visible:ring-slate-400"
                      required
                    />
                  </div>

                  {/* Jenis/Acara Kegiatan */}
                  <div className="grid gap-2">
                    <Label className="text-sm font-semibold text-slate-700">Jenis/Acara Kegiatan <span className="text-red-500">*</span></Label>
                    <Input
                      name="jenis_kegiatan"
                      value={formData.jenis_kegiatan}
                      onChange={handleChange}
                      placeholder="Jenis acara/kegiatan yang dilaksanakan"
                      className="rounded-xl border-slate-300 focus-visible:ring-slate-400"
                      required
                    />
                  </div>
                </div>
              )}

              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#4eaf47] hover:bg-[#439e3d] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md transition-colors h-11"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Mengirim Permohonan...
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    Kirim Permohonan Surat
                  </>
                )}
              </Button>

            </form>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
