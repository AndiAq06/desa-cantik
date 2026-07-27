import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Loader2, FileText, CheckCircle2, XCircle, Eye, ChevronLeft, ChevronRight, Save } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { dataApi } from "@/services/dataApi";

export default function SuratPengantarDesa() {
  const { activeVillageId } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0,
  });

  // Modal Review State
  const [selectedSurat, setSelectedSurat] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [status, setStatus] = useState("");
  const [keterangan, setKeterangan] = useState("");

  const loadData = async (page = 1) => {
    if (!activeVillageId) return;
    try {
      setLoading(true);
      const res = await dataApi.adminGetSuratPengantar(activeVillageId, { page });
      setItems(res.items || []);
      if (res.meta) {
        setPagination({
          currentPage: res.meta.current_page || 1,
          lastPage: res.meta.last_page || 1,
          total: res.meta.total || 0,
        });
      }
    } catch (err) {
      console.error(err);
      toast.error("Gagal memuat permohonan surat");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(1);
  }, [activeVillageId]);

  const handleReviewClick = (surat) => {
    setSelectedSurat(surat);
    setStatus(surat.status);
    setKeterangan(surat.keterangan || "");
    setIsModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!activeVillageId || !selectedSurat) return;

    try {
      setIsUpdating(true);
      await dataApi.adminUpdateSuratPengantar(activeVillageId, selectedSurat.id, {
        status,
        keterangan,
      });
      toast.success("Status permohonan berhasil diperbarui");
      setIsModalOpen(false);
      loadData(pagination.currentPage);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Gagal memperbarui status permohonan");
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Disetujui":
        return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100 pointer-events-none">Disetujui</Badge>;
      case "Ditolak":
        return <Badge className="bg-rose-100 text-rose-800 border-rose-200 hover:bg-rose-100 pointer-events-none">Ditolak</Badge>;
      default:
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100 pointer-events-none">Menunggu Verifikasi</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-slate-200 shadow-lg">
        <CardHeader className="bg-white border-b border-slate-100 py-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-50 text-[#1C6EA4]">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-slate-800">Manajemen Permohonan Surat</CardTitle>
              <CardDescription>Verifikasi dan tindak lanjuti pengajuan surat pengantar mandiri dari masyarakat</CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          {loading ? (
            <div className="p-16 text-center text-slate-400 flex items-center justify-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-[#1C6EA4]" />
              <span>Memuat permohonan surat...</span>
            </div>
          ) : items.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow className="border-slate-100">
                    <TableHead className="font-semibold text-slate-700">Tanggal Pengajuan</TableHead>
                    <TableHead className="font-semibold text-slate-700">Jenis Surat</TableHead>
                    <TableHead className="font-semibold text-slate-700">NIK & Nama Pemohon</TableHead>
                    <TableHead className="font-semibold text-slate-700">Kontak</TableHead>
                    <TableHead className="font-semibold text-slate-700 text-center">Status</TableHead>
                    <TableHead className="font-semibold text-slate-700 text-center">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id} className="border-slate-100 hover:bg-slate-50/50 text-slate-600">
                      <TableCell className="text-xs">
                        {new Date(item.created_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </TableCell>
                      <TableCell className="font-bold text-slate-900 text-sm">{item.jenis_surat}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-slate-900 font-semibold text-sm">{item.nama_lengkap}</span>
                          <span className="text-xs text-slate-400">NIK: {item.nik}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col text-xs text-slate-500">
                          <span>HP: {item.nomor_hp}</span>
                          <span>Email: {item.email}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">{getStatusBadge(item.status)}</TableCell>
                      <TableCell className="text-center py-2.5">
                        <Button
                          onClick={() => handleReviewClick(item)}
                          className="bg-[#1C6EA4] hover:bg-[#154D71] text-white text-xs h-8 rounded-lg flex items-center justify-center gap-1 mx-auto"
                        >
                          <Eye className="h-4 w-4" />
                          Tinjau
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="p-16 text-center text-slate-400 text-sm">
              Belum ada permohonan surat pengantar yang diajukan oleh masyarakat.
            </div>
          )}

          {/* Pagination Footer */}
          {pagination.lastPage > 1 && (
            <div className="flex justify-between items-center px-6 py-4 border-t border-slate-100 bg-slate-50/50">
              <span className="text-xs text-slate-500">Total {pagination.total} permohonan</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadData(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="rounded-lg"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-xs font-semibold text-slate-700">Halaman {pagination.currentPage} dari {pagination.lastPage}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadData(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.lastPage}
                  className="rounded-lg"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl bg-white border border-slate-200 rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-800">Tinjau Permohonan Surat</DialogTitle>
            <DialogDescription>Periksa detail data kependudukan dan tentukan status verifikasi berkas permohonan</DialogDescription>
          </DialogHeader>

          {selectedSurat && (
            <form onSubmit={handleUpdate} className="space-y-6 mt-4">
              
              {/* Detail Pemohon */}
              <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl space-y-3">
                <h4 className="text-xs font-bold text-[#1C6EA4] uppercase tracking-wider">Informasi Pemohon</h4>
                
                <div className="grid grid-cols-2 gap-x-6 gap-y-2.5 text-sm">
                  <div>
                    <span className="text-xs text-slate-400 block">Jenis Surat</span>
                    <span className="font-bold text-slate-800">{selectedSurat.jenis_surat}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">NIK</span>
                    <span className="font-bold text-slate-850">{selectedSurat.nik}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">Nama Lengkap</span>
                    <span className="font-semibold text-slate-800">{selectedSurat.nama_lengkap}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">Pekerjaan</span>
                    <span className="text-slate-800">{selectedSurat.pekerjaan}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">Tempat/Tanggal Lahir</span>
                    <span className="text-slate-800">{selectedSurat.tempat_lahir}, {new Date(selectedSurat.tanggal_lahir).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">Jenis Kelamin</span>
                    <span className="text-slate-800">{selectedSurat.jenis_kelamin}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-xs text-slate-400 block">Alamat Lengkap</span>
                    <span className="text-slate-850">{selectedSurat.alamat_lengkap}</span>
                  </div>
                </div>

                {/* Event specific fields if SURAT IZIN KEGIATAN */}
                {selectedSurat.jenis_surat === "SURAT IZIN KEGIATAN" && (
                  <div className="border-t border-slate-200 pt-3 mt-3 grid grid-cols-2 gap-x-6 gap-y-2.5 text-sm">
                    <div>
                      <span className="text-xs text-slate-400 block">Hari & Tanggal Kegiatan</span>
                      <span className="text-slate-800 font-semibold">{selectedSurat.hari_pelaksanaan}, {selectedSurat.tanggal_kegiatan ? new Date(selectedSurat.tanggal_kegiatan).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "-"}</span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 block">Acara / Jenis Kegiatan</span>
                      <span className="text-slate-800">{selectedSurat.jenis_kegiatan || "-"}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-xs text-slate-400 block">Tempat / Lokasi Kegiatan</span>
                      <span className="text-slate-850 font-semibold">{selectedSurat.tempat_kegiatan || "-"}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Form */}
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label className="text-sm font-semibold text-slate-700">Tentukan Status <span className="text-red-500">*</span></Label>
                  <Select
                    value={status}
                    onValueChange={setStatus}
                    required
                  >
                    <SelectTrigger className="rounded-xl border-slate-300 focus:ring-slate-400 bg-white">
                      <SelectValue placeholder="Pilih status" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="Menunggu Verifikasi">Menunggu Verifikasi</SelectItem>
                      <SelectItem value="Disetujui">Disetujui</SelectItem>
                      <SelectItem value="Ditolak">Ditolak</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label className="text-sm font-semibold text-slate-700">Catatan / Alasan Penolakan</Label>
                  <Textarea
                    value={keterangan}
                    onChange={(e) => setKeterangan(e.target.value)}
                    placeholder="Tuliskan keterangan pengambilan surat atau alasan jika permohonan ditolak..."
                    className="rounded-xl border-slate-300 focus-visible:ring-slate-400 min-h-[90px]"
                  />
                </div>
              </div>

              <DialogFooter className="flex flex-col sm:flex-row gap-3 sm:justify-end border-t border-slate-100 pt-4 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isUpdating}
                  className="rounded-xl border-slate-200"
                >
                  Kembali
                </Button>
                <Button
                  type="submit"
                  disabled={isUpdating}
                  className="bg-[#1C6EA4] hover:bg-[#154D71] text-white rounded-xl font-bold flex items-center justify-center gap-1.5 min-w-[120px]"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Simpan Status
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
