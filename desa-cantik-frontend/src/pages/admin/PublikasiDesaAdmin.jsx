// src/pages/dashboard/PublikasiDesaAdmin.jsx
import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BookOpen,
  MapPin,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  FileText,
  Download,
  Search,
  Loader2,
} from "lucide-react";
import { dataApi } from "@/services/dataApi";
import { publicationService } from "@/services/publicationService";

export default function PublikasiDesaAdmin() {
  // State
  const [villages, setVillages] = useState([]);
  const [villagesLoading, setVillagesLoading] = useState(true);
  const [selectedDesa, setSelectedDesa] = useState(null);
  const [publications, setPublications] = useState([]);
  const [publicationsLoading, setPublicationsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("add"); // 'add' or 'edit'
  const [currentItem, setCurrentItem] = useState(null);

  // Delete Dialog State
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [publicationToDelete, setPublicationToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load villages list
  useEffect(() => {
    const loadVillages = async () => {
      try {
        setVillagesLoading(true);
        const response = await dataApi.listVillages({
          per_page: 100,
          is_active: "all",
        });
        const items = response.items || [];
        setVillages(items);
      } catch (error) {
        console.error("Gagal memuat desa:", error);
      } finally {
        setVillagesLoading(false);
      }
    };

    loadVillages();
  }, []);

  // Efek: ambil publikasi dari backend saat desa berubah
  useEffect(() => {
    const loadPublications = async () => {
      if (!selectedDesa) {
        setPublications([]);
        setPublicationsLoading(false);
        return;
      }
      try {
        setPublicationsLoading(true);
        const data = await publicationService.getPublications(selectedDesa, {
          per_page: 100,
        });
        const list = Array.isArray(data) ? data : data.data || [];
        const filteredList = list.filter(item => (item.category || "").toLowerCase() !== 'dokumentasi');
        setPublications(filteredList);
      } catch (error) {
        console.error("Gagal memuat publikasi desa:", error);
        setPublications([]);
      } finally {
        setPublicationsLoading(false);
      }
    };

    loadPublications();
  }, [selectedDesa]);

  // Handler CRUD
  const handleOpenModal = (type, item = null) => {
    setModalType(type);
    setCurrentItem(item);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (pub) => {
    setPublicationToDelete(pub);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedDesa || !publicationToDelete) return;

    try {
      setIsDeleting(true);
      await publicationService.deletePublication(
        selectedDesa,
        publicationToDelete.id
      );
      setPublications((prev) =>
        prev.filter((p) => p.id !== publicationToDelete.id)
      );
      toast.success("Publikasi berhasil dihapus");
      setDeleteConfirmOpen(false);
    } catch (error) {
      console.error("Gagal menghapus publikasi:", error);
      toast.error("Gagal menghapus publikasi.");
    } finally {
      setIsDeleting(false);
      setPublicationToDelete(null);
    }
  };

  const handleDownload = async (publicationId, directUrl = null) => {
    try {
      if (directUrl) {
        window.open(directUrl, "_blank");
        return;
      }
      await publicationService.downloadPublication(publicationId);
    } catch (error) {
      console.error("Gagal mengunduh publikasi:", error);
      toast.error("Gagal mengunduh publikasi.");
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    try {
      if (!selectedDesa) {
        toast.error("Pilih desa terlebih dahulu");
        return;
      }

      if (modalType === "add") {
        // Validate file is present for CREATE
        if (!data.file || !(data.file instanceof File)) {
          toast.error("File publikasi harus dilampirkan");
          return;
        }

        const formData = new FormData();
        formData.append("title", data.title);
        formData.append("category", data.category || "Umum");
        formData.append("status", data.status || "Draft");
        formData.append(
          "published_at",
          `${data.year || new Date().getFullYear()}-01-01`
        );
        formData.append("file", data.file);

        await publicationService.createPublication(selectedDesa, formData);
        toast.success("Publikasi berhasil ditambahkan");
      } else if (currentItem?.id) {
        await publicationService.updatePublication(
          selectedDesa,
          currentItem.id,
          {
            title: data.title,
            category: data.category,
            status: data.status || "Draft",
            published_at: `${data.year || new Date().getFullYear()}-01-01`,
          }
        );
        toast.success("Publikasi berhasil diperbarui");
      }

      const refreshedData = await publicationService.getPublications(
        selectedDesa,
        {
          per_page: 100,
        }
      );
      const list = Array.isArray(refreshedData)
        ? refreshedData
        : refreshedData.data || [];
      const filteredList = list.filter(item => (item.category || "").toLowerCase() !== 'dokumentasi');
      setPublications(filteredList);
    } catch (error) {
      console.error("Gagal menyimpan publikasi:", error);
      toast.error("Gagal menyimpan publikasi.");
    }
    setIsModalOpen(false);
  };

  // Filter pencarian lokal
  const filteredPublications = publications.filter((p) =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* 1. PILIH DESA (Wajib) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Pilih Desa
          </CardTitle>
          <CardDescription>
            Pilih desa untuk mengelola publikasi dan dokumen statistik mereka.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {villagesLoading ? (
            <div className="flex items-center gap-3 text-slate-500">
              <Loader2 className="h-5 w-5 animate-spin" />
              Memuat daftar desa...
            </div>
          ) : (
            <Select onValueChange={setSelectedDesa} value={selectedDesa || ""}>
              <SelectTrigger className="w-full md:w-1/2">
                <SelectValue placeholder="Pilih desa..." />
              </SelectTrigger>
              <SelectContent>
                {villages.map((desa) => (
                  <SelectItem key={desa.id} value={String(desa.id)}>
                    {desa.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </CardContent>
      </Card>

      {/* 2. KONTEN UTAMA (Hanya muncul jika desa dipilih) */}
      {!selectedDesa ? (
        <div className="flex flex-col items-center justify-center h-[50vh] bg-slate-50 rounded-xl border border-dashed">
          <div className="p-4 bg-white rounded-full shadow-sm mb-3">
            <MapPin className="h-8 w-8 text-blue-500" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">
            Belum Ada Desa Dipilih
          </h3>
          <p className="text-slate-500 max-w-sm text-center mt-1">
            Silakan pilih desa pada menu dropdown di atas untuk mulai mengelola
            data publikasi.
          </p>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <CardTitle>Daftar Publikasi</CardTitle>
                <CardDescription>
                  Dokumen yang diterbitkan untuk{" "}
                  {villages.find((d) => String(d.id) === String(selectedDesa))
                    ?.name || "-"}
                  .
                </CardDescription>
              </div>
              <Button
                className="bg-[#1C6EA4] hover:bg-[#154D71] shadow-sm whitespace-nowrap"
                onClick={() => handleOpenModal("add")}
              >
                <Plus className="mr-2 h-4 w-4" />
                Tambah Publikasi
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Tabel Data */}
            <div className="rounded-md border overflow-x-auto">
              <div className="min-w-[600px] text-sm md:text-base">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Judul Publikasi</TableHead>
                      <TableHead>Tahun</TableHead>
                      <TableHead>Kategori</TableHead>
                      <TableHead>File</TableHead>
                      <TableHead className="w-[200px] text-center">
                        Aksi
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {publicationsLoading ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="h-32 text-center text-gray-500"
                        >
                          <div className="flex flex-col items-center justify-center gap-2">
                            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                            Memuat publikasi desa...
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : filteredPublications.length > 0 ? (
                      filteredPublications.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <BookOpen className="h-4 w-4 text-blue-600" />
                              {item.title}
                            </div>
                          </TableCell>
                          <TableCell>{item.year}</TableCell>
                          <TableCell>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {item.category}
                            </span>
                          </TableCell>
                          <TableCell>
                            {item.fileUrl || item.downloadUrl ? (
                              <a
                                href={item.fileUrl || item.downloadUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 hover:underline"
                              >
                                <FileText className="h-3 w-3" />
                                <span className="truncate max-w-[150px]">
                                  {item.fileName || "File"}
                                </span>
                              </a>
                            ) : item.fileName ? (
                              <span className="flex items-center gap-1 text-sm text-amber-600">
                                <FileText className="h-3 w-3" />
                                <span className="truncate max-w-[150px]">
                                  {item.fileName}
                                </span>
                                <span className="text-xs">(N/A)</span>
                              </span>
                            ) : (
                              <span className="text-sm text-gray-400 italic">
                                Tidak ada file
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center gap-2">
                              {/* Unduh Button */}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleDownload(
                                    item.id,
                                    item.fileUrl || item.downloadUrl
                                  )
                                }
                                disabled={!item.fileUrl && !item.downloadUrl}
                                className="flex items-center justify-center gap-2 rounded-full border border-emerald-200 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 h-8 px-3 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Download className="h-3 w-3" />
                                Unduh
                              </Button>

                              {/* Edit Button */}
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleOpenModal("edit", item)}
                                className="bg-[#1C6EA4] hover:bg-[#154D71] text-white h-8 px-3 text-xs"
                              >
                                Edit
                              </Button>

                              {/* Hapus Button */}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteClick(item)}
                                className="flex items-center justify-center gap-2 border border-rose-200 bg-rose-100 text-rose-700 hover:bg-rose-200 h-8 px-3 text-xs"
                              >
                                Hapus
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="h-24 text-center text-gray-500"
                        >
                          Belum ada publikasi untuk desa ini.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* MODAL ADD/EDIT */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleFormSubmit}>
            <DialogHeader>
              <DialogTitle>
                {modalType === "add"
                  ? "Tambah Publikasi Baru"
                  : "Edit Publikasi"}
              </DialogTitle>
              <DialogDescription>
                Isi detail dokumen publikasi di bawah ini.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Judul Publikasi</Label>
                <Input
                  id="title"
                  name="title"
                  defaultValue={currentItem?.title}
                  placeholder="Contoh: Kecamatan Dalam Angka 2024"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="year">Tahun</Label>
                  <Input
                    id="year"
                    name="year"
                    type="number"
                    defaultValue={currentItem?.year || new Date().getFullYear()}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category">Kategori</Label>
                  <Select
                    name="category"
                    defaultValue={currentItem?.category || "Laporan Statistik"}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Laporan Statistik">
                        Laporan Statistik
                      </SelectItem>
                      <SelectItem value="Profil Desa">Profil Desa</SelectItem>
                      <SelectItem value="Infografis">Infografis</SelectItem>
                      <SelectItem value="Berita Resmi">Berita Resmi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="status">Status Publikasi</Label>
                <Select
                  name="status"
                  defaultValue={currentItem?.status || "Draft"}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Rilis">Rilis (Publik)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  Draft hanya terlihat oleh admin. Rilis akan tampil di halaman
                  publik.
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">
                  Deskripsi Singkat (Opsional)
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Penjelasan singkat tentang isi dokumen..."
                />
              </div>

              <div className="grid gap-2 overflow-hidden">
                <Label htmlFor="file">Upload File (PDF)</Label>
                <div className="overflow-hidden">
                  <Input
                    id="file"
                    name="file"
                    type="file"
                    accept=".pdf"
                    required={modalType === "add"}
                    className="w-full"
                  />
                </div>
                {modalType === "edit" &&
                  (currentItem?.fileName || currentItem?.fileUrl) && (
                    <p className="text-xs text-gray-500 truncate">
                      File saat ini:{" "}
                      <span className="font-medium">
                        {currentItem.fileName || currentItem.fileUrl}
                      </span>
                    </p>
                  )}
              </div>
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button
                  type="button"
                  className="bg-red-400 hover:bg-red-500 shadow-sm whitespace-nowrap text-white"
                  variant="outline"
                >
                  Batal
                </Button>
              </DialogClose>
              <Button
                type="submit"
                className="bg-[#1C6EA4] hover:bg-[#154D71] shadow-sm whitespace-nowrap"
              >
                Simpan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRM DIALOG */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="max-w-sm rounded-lg border border-red-200 bg-white">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Konfirmasi Hapus
            </DialogTitle>
          </DialogHeader>
          <div className="py-2 text-sm text-slate-600">
            Apakah Anda yakin ingin menghapus publikasi{" "}
            <b>{publicationToDelete?.title}</b>?
            <br />
            Tindakan ini tidak dapat dibatalkan.
          </div>
          <DialogFooter className="gap-2 sm:justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteConfirmOpen(false)}
              disabled={isDeleting}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? "Menghapus..." : "Ya, Hapus"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
