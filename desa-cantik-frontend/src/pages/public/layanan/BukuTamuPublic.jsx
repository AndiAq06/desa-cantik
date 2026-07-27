import React, { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Loader2, Calendar, FileText, CheckCircle2, RefreshCw, Download, Pencil } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { villageService } from "@/services/villageService";
import { dataApi } from "@/services/dataApi";
import VillageDetailNavbar from "@/components/shared/VillageDetailNavbar";
import Footer from "@/components/shared/Footer";

export default function BukuTamuPublic() {
  const { slug } = useParams();
  const [village, setVillage] = useState(null);
  const [loadingVillage, setLoadingVillage] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState([]);
  const [loadingTable, setLoadingTable] = useState(true);

  // Signature drawing state
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    nama_lengkap: "",
    jabatan: "",
    asal_instansi: "",
    tanggal_kunjungan: new Date().toISOString().slice(0, 16), // datetime-local format
    keperluan: "",
  });

  const fetchVillageAndTable = async () => {
    try {
      const vData = await villageService.getVillageById(slug);
      setVillage(vData);
      
      const tData = await dataApi.getBukuTamu(vData.id);
      setResults(tData || []);
    } catch (err) {
      console.error("Gagal memuat data:", err);
      toast.error("Gagal memuat data");
    } finally {
      setLoadingVillage(false);
      setLoadingTable(false);
    }
  };

  useEffect(() => {
    fetchVillageAndTable();
  }, [slug]);

  // Canvas Drawing Methods
  useEffect(() => {
    if (loadingVillage || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.strokeStyle = "#0F172A"; // Dark slate
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, [loadingVillage]);

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e) => {
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasSignature(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current.getContext("2d");
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let signatureBase64 = null;
    if (hasSignature) {
      signatureBase64 = canvasRef.current.toDataURL("image/png");
    }

    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        tanda_tangan: signatureBase64
      };

      await dataApi.createBukuTamu(village.id, payload);
      toast.success("Buku tamu berhasil disimpan!");
      
      // Reset form
      setFormData({
        nama_lengkap: "",
        jabatan: "",
        asal_instansi: "",
        tanggal_kunjungan: new Date().toISOString().slice(0, 16),
        keperluan: "",
      });
      clearCanvas();
      
      // Refresh table
      setLoadingTable(true);
      const tData = await dataApi.getBukuTamu(village.id);
      setResults(tData || []);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Gagal menyimpan buku tamu");
    } finally {
      setSubmitting(false);
      setLoadingTable(false);
    }
  };

  const downloadCSV = () => {
    if (results.length === 0) return;
    
    let csvContent = "\uFEFF"; // Byte Order Mark for Excel encoding compatibility
    csvContent += "No,Tanggal Kunjungan,Nama Tamu,Asal Instansi,Jabatan,Keperluan\n";
    
    results.forEach((row, index) => {
      const date = new Date(row.tanggal_kunjungan).toLocaleDateString("id-ID");
      const nama = `"${row.nama_lengkap.replace(/"/g, '""')}"`;
      const instansi = `"${row.asal_instansi.replace(/"/g, '""')}"`;
      const jb = `"${row.jabatan.replace(/"/g, '""')}"`;
      const kep = `"${row.keperluan.replace(/"/g, '""')}"`;
      
      csvContent += `${index + 1},${date},${nama},${instansi},${jb},${kep}\n`;
    });
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `buku_tamu_${village.name.toLowerCase().replace(/\s+/g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
            Formulir Buku Tamu
          </h1>
          <p className="text-slate-500 mt-2 text-sm max-w-md mx-auto">
            Data kunjungan tamu dan pengunjung Desa {village?.name}
          </p>
        </div>

        {/* Formulir Pengisian Buku Tamu */}
        <Card className="border-slate-200 shadow-xl rounded-2xl overflow-hidden bg-white mb-10">
          <CardContent className="p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nama Lengkap */}
                <div className="grid gap-2">
                  <Label className="text-sm font-semibold text-slate-700">Nama Lengkap <span className="text-red-500">*</span></Label>
                  <Input
                    name="nama_lengkap"
                    value={formData.nama_lengkap}
                    onChange={handleChange}
                    placeholder="Masukkan nama lengkap"
                    className="rounded-xl border-slate-300 focus-visible:ring-slate-400"
                    required
                  />
                </div>

                {/* Jabatan / Pekerjaan */}
                <div className="grid gap-2">
                  <Label className="text-sm font-semibold text-slate-700">Jabatan / Pekerjaan <span className="text-red-500">*</span></Label>
                  <Input
                    name="jabatan"
                    value={formData.jabatan}
                    onChange={handleChange}
                    placeholder="Contoh: Staff Dinas, Mahasiswa, Wiraswasta, dll"
                    className="rounded-xl border-slate-300 focus-visible:ring-slate-400"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Asal Instansi */}
                <div className="grid gap-2">
                  <Label className="text-sm font-semibold text-slate-700">Asal Instansi / Tempat <span className="text-red-500">*</span></Label>
                  <Input
                    name="asal_instansi"
                    value={formData.asal_instansi}
                    onChange={handleChange}
                    placeholder="Contoh: Dinas Kominfo, Universitas, Perusahaan, dll"
                    className="rounded-xl border-slate-300 focus-visible:ring-slate-400"
                    required
                  />
                </div>

                {/* Tanggal Kunjungan */}
                <div className="grid gap-2">
                  <Label className="text-sm font-semibold text-slate-700">Tanggal Kunjungan <span className="text-red-500">*</span></Label>
                  <Input
                    type="datetime-local"
                    name="tanggal_kunjungan"
                    value={formData.tanggal_kunjungan}
                    onChange={handleChange}
                    className="rounded-xl border-slate-300 focus-visible:ring-slate-400"
                    required
                  />
                </div>
              </div>

              {/* Keperluan */}
              <div className="grid gap-2">
                <Label className="text-sm font-semibold text-slate-700">Keperluan <span className="text-red-500">*</span></Label>
                <Textarea
                  name="keperluan"
                  value={formData.keperluan}
                  onChange={handleChange}
                  placeholder="Tuliskan keperluan kunjungan Anda secara detail"
                  className="rounded-xl border-slate-300 focus-visible:ring-slate-400 min-h-[90px]"
                  required
                />
              </div>

              {/* Tanda Tangan Digital */}
              <div className="grid gap-2">
                <Label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                  <Pencil className="h-4 w-4 text-slate-500" />
                  Tanda Tangan Digital
                </Label>
                <div className="border border-slate-300 rounded-xl bg-slate-50 p-2.5 flex flex-col items-center">
                  <canvas
                    ref={canvasRef}
                    width={500}
                    height={180}
                    className="max-w-full bg-white border border-slate-200 rounded-lg cursor-crosshair touch-none"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                  />
                  <div className="w-full flex justify-between items-center mt-3 px-1">
                    <span className="text-[11px] text-slate-400">Gunakan mouse atau sentuhan layar untuk tanda tangan</span>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={clearCanvas}
                      className="text-xs bg-rose-100 hover:bg-rose-200 text-rose-700 border-rose-200 rounded-full h-8 px-4"
                    >
                      Hapus TTD
                    </Button>
                  </div>
                </div>
              </div>

              {/* Button Submit */}
              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#4eaf47] hover:bg-[#439e3d] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md transition-colors h-11"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Menyimpan Data...
                    </>
                  ) : (
                    "Simpan Buku Tamu"
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
