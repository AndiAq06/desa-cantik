import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Loader2, MessageSquare, ExternalLink, Eye, ChevronLeft, ChevronRight, Save, Trash2 } from "lucide-react";
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

export default function PengaduanDesa() {
  const { activeVillageId } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0,
  });

  // Modal State
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [status, setStatus] = useState("");
  const [keterangan, setKeterangan] = useState("");

  const loadData = async (page = 1) => {
    if (!activeVillageId) return;
    try {
      setLoading(true);
      const res = await dataApi.adminGetPengaduan(activeVillageId, { page });
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
      toast.error("Gagal memuat pengaduan masyarakat");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(1);
  }, [activeVillageId]);

  const handleReviewClick = (complaint) => {
    setSelectedComplaint(complaint);
    setStatus(complaint.status);
    setKeterangan(complaint.keterangan || "");
    setIsModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!activeVillageId || !selectedComplaint) return;

    try {
      setIsUpdating(true);
      await dataApi.adminUpdatePengaduan(activeVillageId, selectedComplaint.id, {
        status,
        keterangan,
      });
      toast.success("Tanggapan pengaduan berhasil disimpan");
      setIsModalOpen(false);
      loadData(pagination.currentPage);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Gagal menyimpan tanggapan pengaduan");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteClick = async (id) => {
    if (!activeVillageId) return;
    if (!window.confirm("Apakah Anda yakin ingin menghapus pengaduan ini?")) return;
    
    try {
      setLoading(true);
      await dataApi.adminDeletePengaduan(activeVillageId, id);
      toast.success("Pengaduan berhasil dihapus");
      loadData(pagination.currentPage);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Gagal menghapus pengaduan");
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Selesai":
        return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100 pointer-events-none">Selesai</Badge>;
      case "Diproses":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100 pointer-events-none">Diproses</Badge>;
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
              <MessageSquare className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-slate-800">Daftar Pengaduan Masyarakat</CardTitle>
              <CardDescription>Pantau permasalahan warga dan berikan tanggapan tindak lanjut yang transparan</CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          {loading ? (
            <div className="p-16 text-center text-slate-400 flex items-center justify-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-[#1C6EA4]" />
              <span>Memuat pengaduan...</span>
            </div>
          ) : items.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow className="border-slate-100">
                    <TableHead className="font-semibold text-slate-700">Tanggal Pengaduan</TableHead>
                    <TableHead className="font-semibold text-slate-700">Kategori Laporan</TableHead>
                    <TableHead className="font-semibold text-slate-700">Nama Pengirim</TableHead>
                    <TableHead className="font-semibold text-slate-700">Lampiran</TableHead>
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
                          year: "numeric"
                        })}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col max-w-[280px]">
                          <span className="font-bold text-slate-900 text-sm">{item.judul_pengaduan}</span>
                          <span className="text-xs text-slate-400 truncate" title={item.uraian}>{item.uraian}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col text-xs text-slate-500">
                          <span className="text-slate-900 font-semibold text-sm">{item.nama_lengkap}</span>
                          <span>{item.email}</span>
                          <span>Telp: {item.nomor_telepon}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {item.lampiran_url ? (
                          <a
                            href={item.lampiran_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-semibold"
                          >
                            Lampiran <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        ) : (
                          <span className="text-xs text-slate-400">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">{getStatusBadge(item.status)}</TableCell>
                      <TableCell className="text-center py-2.5">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            onClick={() => handleReviewClick(item)}
                            className="bg-[#1C6EA4] hover:bg-[#154D71] text-white text-xs h-8 rounded-lg flex items-center justify-center gap-1"
                          >
                            <Eye className="h-4 w-4" />
                            Tanggapi
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => handleDeleteClick(item.id)}
                            className="text-xs h-8 px-3 rounded-lg flex items-center justify-center gap-1"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Hapus
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="p-16 text-center text-slate-400 text-sm">
              Belum ada pengaduan masyarakat yang diajukan untuk desa Anda.
            </div>
          )}

          {/* Pagination Footer */}
          {pagination.lastPage > 1 && (
            <div className="flex justify-between items-center px-6 py-4 border-t border-slate-100 bg-slate-50/50">
              <span className="text-xs text-slate-500">Total {pagination.total} laporan pengaduan</span>
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
            <DialogTitle className="text-lg font-bold text-slate-800">Detail & Tanggapan Pengaduan</DialogTitle>
            <DialogDescription>Periksa detail pengaduan warga dan berikan tanggapan / catatan tindak lanjut</DialogDescription>
          </DialogHeader>

          {selectedComplaint && (
            <form onSubmit={handleUpdate} className="space-y-6 mt-4">
              
              {/* Detail Laporan */}
              <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl space-y-3">
                <h4 className="text-xs font-bold text-[#1C6EA4] uppercase tracking-wider">Laporan Pengaduan</h4>
                
                <div className="grid grid-cols-2 gap-x-6 gap-y-2.5 text-sm">
                  <div>
                    <span className="text-xs text-slate-400 block">Judul Laporan</span>
                    <span className="font-bold text-slate-800">{selectedComplaint.judul_pengaduan}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">Nama Pengirim</span>
                    <span className="font-semibold text-slate-800">{selectedComplaint.nama_lengkap}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">Email & No Telp</span>
                    <span className="text-slate-800">{selectedComplaint.email} / {selectedComplaint.nomor_telepon}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">Lampiran Pendukung</span>
                    {selectedComplaint.lampiran_url ? (
                      <a
                        href={selectedComplaint.lampiran_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-semibold mt-0.5"
                      >
                        Lihat Berkas Lampiran <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    ) : (
                      <span className="text-slate-400 text-xs">Tidak ada lampiran</span>
                    )}
                  </div>
                  <div className="col-span-2">
                    <span className="text-xs text-slate-400 block">Uraian Masalah</span>
                    <div className="text-slate-850 bg-white border border-slate-200 rounded-lg p-3 mt-1 text-xs whitespace-pre-wrap leading-relaxed max-h-[150px] overflow-y-auto">
                      {selectedComplaint.uraian}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <span className="text-xs text-slate-400 block">Alamat Pelapor</span>
                    <span className="text-slate-850 text-xs">{selectedComplaint.alamat}</span>
                  </div>
                </div>
              </div>

              {/* Action Form */}
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label className="text-sm font-semibold text-slate-700">Tindak Lanjut Status <span className="text-red-500">*</span></Label>
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
                      <SelectItem value="Diproses">Diproses</SelectItem>
                      <SelectItem value="Selesai">Selesai</SelectItem>
                      <SelectItem value="Ditolak">Ditolak</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label className="text-sm font-semibold text-slate-700">Tanggapan / Catatan Tindak Lanjut</Label>
                  <Textarea
                    value={keterangan}
                    onChange={(e) => setKeterangan(e.target.value)}
                    placeholder="Tulis tanggapan dari pemerintah desa atau langkah penanganan masalah yang sedang/telah dilakukan..."
                    className="rounded-xl border-slate-300 focus-visible:ring-slate-400 min-h-[100px]"
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
                      Simpan Tanggapan
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
