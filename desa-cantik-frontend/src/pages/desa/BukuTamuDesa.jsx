import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Loader2, Users, Download, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { dataApi } from "@/services/dataApi";

export default function BukuTamuDesa() {
  const { activeVillageId, user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (!activeVillageId) return;
    try {
      setLoading(true);
      const res = await dataApi.adminGetBukuTamu(activeVillageId);
      setItems(res || []);
    } catch (err) {
      console.error(err);
      toast.error("Gagal memuat buku tamu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeVillageId]);

  const handleDeleteClick = async (id) => {
    if (!activeVillageId) return;
    if (!window.confirm("Apakah Anda yakin ingin menghapus catatan buku tamu ini?")) return;
    
    try {
      setLoading(true);
      await dataApi.adminDeleteBukuTamu(activeVillageId, id);
      toast.success("Catatan buku tamu berhasil dihapus");
      loadData();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Gagal menghapus catatan buku tamu");
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    if (items.length === 0) return;
    
    let csvContent = "\uFEFF"; // BOM for Excel formatting
    csvContent += "No,Tanggal Kunjungan,Nama Tamu,Asal Instansi,Jabatan,Keperluan\n";
    
    items.forEach((row, index) => {
      const date = new Date(row.tanggal_kunjungan).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "numeric",
        year: "numeric"
      });
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
    
    const villageName = user?.village?.name || "desa";
    link.setAttribute("download", `buku_tamu_${villageName.toLowerCase().replace(/\s+/g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <Card className="border-slate-200 shadow-lg">
        <CardHeader className="bg-white border-b border-slate-100 py-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-50 text-[#1C6EA4]">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-slate-800">Daftar Buku Tamu</CardTitle>
                <CardDescription>Catatan kunjungan tamu dan instansi eksternal ke kantor desa</CardDescription>
              </div>
            </div>
            <Button
              onClick={downloadCSV}
              disabled={items.length === 0 || loading}
              className="bg-[#4eaf47] hover:bg-[#439e3d] text-white text-xs font-semibold rounded-lg shadow h-9 flex items-center gap-1.5 self-end sm:self-auto"
            >
              <Download className="h-4 w-4" />
              Ekspor Buku Tamu (CSV)
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          {loading ? (
            <div className="p-16 text-center text-slate-400 flex items-center justify-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-[#1C6EA4]" />
              <span>Memuat buku tamu...</span>
            </div>
          ) : items.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow className="border-slate-100">
                    <TableHead className="w-[60px] text-center font-semibold text-slate-700">No</TableHead>
                    <TableHead className="font-semibold text-slate-700">Tanggal Kunjungan</TableHead>
                    <TableHead className="font-semibold text-slate-700">Nama Lengkap</TableHead>
                    <TableHead className="font-semibold text-slate-700">Asal Instansi & Jabatan</TableHead>
                    <TableHead className="font-semibold text-slate-700">Keperluan</TableHead>
                    <TableHead className="font-semibold text-slate-700 text-center">Tanda Tangan</TableHead>
                    <TableHead className="font-semibold text-slate-700 text-center">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item, index) => (
                    <TableRow key={item.id} className="border-slate-100 hover:bg-slate-50/50 text-slate-600">
                      <TableCell className="text-center font-medium">{index + 1}</TableCell>
                      <TableCell className="text-xs">
                        {new Date(item.tanggal_kunjungan).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </TableCell>
                      <TableCell className="font-semibold text-slate-900 text-sm">{item.nama_lengkap}</TableCell>
                      <TableCell>
                        <div className="flex flex-col text-sm">
                          <span className="font-medium text-slate-800">{item.asal_instansi}</span>
                          <span className="text-xs text-slate-400">{item.jabatan}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-slate-500 max-w-[250px] truncate" title={item.keperluan}>
                        {item.keperluan}
                      </TableCell>
                      <TableCell className="flex justify-center items-center py-2">
                        {item.tanda_tangan_url ? (
                          <img
                            src={item.tanda_tangan_url}
                            alt="Signature"
                            className="h-10 w-24 object-contain bg-slate-50 border border-slate-150 rounded"
                          />
                        ) : (
                          <span className="text-xs text-slate-400">Tidak ada TTD</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center py-2.5">
                        <Button
                          variant="destructive"
                          onClick={() => handleDeleteClick(item.id)}
                          className="text-xs h-8 px-3 rounded-lg flex items-center justify-center gap-1 mx-auto"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Hapus
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="p-16 text-center text-slate-400 text-sm">
              Belum ada kunjungan tamu yang tercatat di buku tamu desa Anda.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
