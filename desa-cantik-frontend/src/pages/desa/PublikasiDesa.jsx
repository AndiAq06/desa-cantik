import { useState, useMemo, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Edit,
  Trash,
  Plus,
  Calendar as CalendarIcon,
  FileText,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { dataApi } from "@/services/dataApi";
import { useAuth } from "@/contexts/AuthContext";

const subjectOptions = [
  "Statistik Desa",
  "Sosial",
  "Ekonomi Lokal",
  "Pemerintahan",
];
const statusOptions = ["Rilis", "Diarsipkan"];

const defaultFormState = {
  title: "",
  description: "",
  subject: subjectOptions[0],
  releaseDate: new Date(),
  status: statusOptions[0],
  file: null,
  fileName: "",
  fileUrl: "",
};

export default function PublikasiDesa() {
  const { activeVillageId } = useAuth();
  const [publications, setPublications] = useState([]);
  const [formState, setFormState] = useState(defaultFormState);
  const [filterSubject, setFilterSubject] = useState("all");
  const [filterYear, setFilterYear] = useState("all");
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Delete Dialog State
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [publicationToDelete, setPublicationToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const formatDateForApi = (date) => {
    if (!date) return null;
    const parsedDate = date instanceof Date ? date : new Date(date);
    if (Number.isNaN(parsedDate.getTime())) {
      return null;
    }
    return parsedDate.toISOString().split("T")[0];
  };

  const loadData = async () => {
    if (!activeVillageId) return;

    try {
      setLoading(true);
      const res = await dataApi.listPublications(activeVillageId);
      const filteredItems = (res.items || []).filter(item => (item.category || "").toLowerCase() !== 'dokumentasi');
      const data = filteredItems.map((d) => {
        // Map fileUrl, ensuring we use the backend's provided URL
        const mappedFileUrl = d.fileUrl || d.downloadUrl || "";
        
        // Debug: Log if a publication has fileName but no URL
        if (d.fileName && !mappedFileUrl) {
          console.warn(`Publication "${d.title}" has fileName but no fileUrl`, {
            fileName: d.fileName,
            fileUrl: d.fileUrl,
            downloadUrl: d.downloadUrl,
            file_path: d.file_path,
          });
        }
        
        return {
          ...d,
          subject: d.category || d.subject || "Umum",
          releaseDate: d.published_at
            ? new Date(d.published_at)
            : d.publishedAt
            ? new Date(d.publishedAt)
            : d.date
            ? new Date(d.date)
            : d.releaseDate
            ? new Date(d.releaseDate)
            : null,

          status:
            d.status === "published"
              ? "Rilis"
              : d.status === "archived"
              ? "Diarsipkan"
              : d.status || "Rilis",
          fileUrl: mappedFileUrl,
          fileName: d.file_name || d.original_name || d.fileName || "Dokumen.pdf",
        };
      });
      setPublications(data);
    } catch (error) {
      console.error(error);
      toast.error("Gagal memuat data publikasi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeVillageId]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date) => {
    setFormState((prev) => ({ ...prev, releaseDate: date }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        // 2MB limit
        toast.error("Ukuran file terlalu besar. Maksimal 2MB.");
        e.target.value = null;
        return;
      }
      setFormState((prev) => ({
        ...prev,
        file,
        fileName: file.name,
        fileUrl: URL.createObjectURL(file),
      }));
    }
  };

  const handleOpenTambah = () => {
    setFormState(defaultFormState);
    setEditingId(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (pub) => {
    setEditingId(pub.id);
    setFormState({
      ...pub,
      description: pub.description || "",
      file: null,
      fileUrl: pub.fileUrl || "",
      fileName: pub.fileName || "",
      subject: pub.category || pub.subject,
      status:
        pub.status === "published"
          ? "Rilis"
          : pub.status === "archived"
          ? "Diarsipkan"
          : pub.status,
      releaseDate: pub.published_at
        ? new Date(pub.published_at)
        : pub.releaseDate
        ? new Date(pub.releaseDate)
        : new Date(),
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    loadData();
  };

  const handleDeleteClick = (pub) => {
    setPublicationToDelete(pub);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!activeVillageId || !publicationToDelete) return;

    try {
      setIsDeleting(true);
      await dataApi.deletePublication(activeVillageId, publicationToDelete.id);
      await loadData();
      toast.success("Publikasi berhasil dihapus");
      setDeleteConfirmOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Gagal menghapus publikasi.");
    } finally {
      setIsDeleting(false);
      setPublicationToDelete(null);
    }
  };

  const handleSubmit = async () => {
    if (!activeVillageId) return;

    try {
      if (!formState.title || !formState.subject) {
        toast.error("Mohon lengkapi Judul dan Kategori.");
        return;
      }

      if (!editingId && !formState.file) {
        toast.error("Mohon unggah berkas PDF untuk publikasi baru.");
        return;
      }

      const publishedDate = formatDateForApi(formState.releaseDate);

      if (!publishedDate) {
        toast.error("Tanggal rilis tidak valid.");
        return;
      }

      const payload = {
        title: formState.title.trim(),
        description: formState.description ? formState.description.trim() : "",
        category: formState.subject,
        status: formState.status,
        published_at: publishedDate,
      };

      if (editingId) {
        await dataApi.updatePublication(activeVillageId, editingId, payload);

        if (formState.file) {
          await dataApi.replacePublicationFile(
            activeVillageId,
            editingId,
            formState.file
          );
        }
      } else {
        const formData = new FormData();

        Object.entries(payload).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            formData.append(key, value);
          }
        });

        formData.append("file", formState.file);
        await dataApi.createPublication(activeVillageId, formData);
      }

      await loadData();
      setIsDialogOpen(false);
      setEditingId(null);
      setFormState(defaultFormState);
      toast.success(
        editingId
          ? "Publikasi berhasil diperbarui"
          : "Publikasi berhasil ditambahkan"
      );
    } catch (error) {
      console.error(error);
      toast.error("Gagal menyimpan publikasi.");
    }
  };

  const filteredPublications = publications.filter((pub) => {
    const matchSubject =
      filterSubject === "all" || pub.subject === filterSubject;
    const pubYear =
      pub.releaseDate instanceof Date && !isNaN(pub.releaseDate)
        ? pub.releaseDate.getFullYear().toString()
        : "";
    const matchYear = filterYear === "all" || pubYear === filterYear;
    return matchSubject && matchYear;
  });

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-end">
        <Button
          onClick={handleOpenTambah}
          className="bg-[#1C6EA4] hover:bg-[#154D71]"
        >
          <Plus className="mr-2 h-4 w-4" />
          Tambah Publikasi
        </Button>
      </div>

      <Card className="shadow-lg border-0 rounded-x1 overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <div className="min-w-[720px] text-sm md:text-base">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="w-[50px] font-semibold text-slate-600">
                      No.
                    </TableHead>
                    <TableHead className="font-semibold text-slate-600">
                      Judul Publikasi
                    </TableHead>
                    <TableHead className="font-semibold text-slate-600">
                      Kategori
                    </TableHead>
                    <TableHead className="font-semibold text-slate-600">
                      Tanggal Rilis
                    </TableHead>
                    <TableHead className="font-semibold text-slate-600">
                      Status
                    </TableHead>
                    <TableHead className="font-semibold text-slate-600">
                      Berkas
                    </TableHead>
                    <TableHead className="text-center font-semibold text-slate-600">
                      Aksi
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="h-24 text-center text-slate-500"
                      >
                        Memuat data...
                      </TableCell>
                    </TableRow>
                  ) : publications.length > 0 ? (
                    publications.map((pub, index) => (
                      <TableRow
                        key={`${pub.id}-${index}`}
                        className="hover:bg-slate-50/50 transition-colors"
                      >
                        <TableCell className="text-slate-500">
                          {index + 1}
                        </TableCell>
                        <TableCell className="font-medium text-slate-800">
                          {pub.title}
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                            {pub.subject}
                          </span>
                        </TableCell>
                        <TableCell className="text-slate-600">
                          {pub.releaseDate instanceof Date &&
                          !isNaN(pub.releaseDate)
                            ? format(pub.releaseDate, "dd LLL yyyy", {
                                locale: id,
                              })
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              pub.status === "Rilis" ? "default" : "secondary"
                            }
                            className={cn(
                              "font-normal",
                              pub.status === "Rilis"
                                ? "bg-emerald-500 hover:bg-emerald-600"
                                : "bg-slate-400 hover:bg-slate-500"
                            )}
                          >
                            {pub.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {pub.fileUrl ? (
                            <a
                              href={pub.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center text-sm text-blue-600 hover:text-blue-800 hover:underline max-w-[150px] truncate"
                              title={pub.fileName}
                            >
                              <FileText className="h-4 w-4 mr-1 flex-shrink-0" />
                              <span className="truncate">{pub.fileName}</span>
                            </a>
                          ) : pub.fileName ? (
                            <span className="flex items-center text-xs text-amber-600 max-w-[150px]" title={`${pub.fileName} (Metadata saja, file tidak tersedia)`}>
                              <FileText className="h-4 w-4 mr-1 flex-shrink-0" />
                              <span className="truncate">{pub.fileName}</span>
                              <span className="ml-1 text-[10px]">(N/A)</span>
                            </span>
                          ) : (
                            <span className="text-slate-400 text-xs italic">
                              Tidak ada file
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center gap-2">
                            <Button
                              variant="default"
                              size="sm"
                              className="bg-[#1C6EA4] hover:bg-[#154D71] text-white h-8 px-3 text-xs"
                              onClick={() => handleOpenEdit(pub)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="flex items-center justify-center gap-2 border border-rose-200 bg-rose-100 text-rose-700 hover:bg-rose-200 h-8 px-3 text-xs"
                              onClick={() => handleDeleteClick(pub)}
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
                        colSpan={7}
                        className="h-24 text-center text-slate-500"
                      >
                        Tidak ada publikasi yang ditemukan.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Publikasi" : "Tambah Publikasi Baru"}
            </DialogTitle>
            <DialogDescription>
              Isi detail dokumen publikasi di bawah ini. Klik simpan untuk
              perubahan.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            {/* Judul */}
            <div className="space-y-2">
              <Label htmlFor="title">Judul Publikasi</Label>
              <Input
                id="title"
                name="title"
                value={formState.title}
                onChange={handleFormChange}
                placeholder="Masukkan judul publikasi"
              />
            </div>

            {/* Deskripsi */}
            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi</Label>
              <textarea
                id="description"
                name="description"
                value={formState.description || ""}
                onChange={handleFormChange}
                placeholder="Masukkan deskripsi publikasi"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            {/* Kategori */}
            <div className="space-y-2">
              <Label htmlFor="subject">Kategori</Label>
              <Select
                name="subject"
                value={formState.subject}
                onValueChange={(value) => handleSelectChange("subject", value)}
              >
                <SelectTrigger id="subject">
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {subjectOptions.map((s, i) => (
                    <SelectItem key={`${s}-${i}`} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tanggal Rilis */}
            <div className="space-y-2">
              <Label htmlFor="releaseDate">Tanggal Rilis</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formState.releaseDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formState.releaseDate ? (
                      format(formState.releaseDate, "dd LLL yyyy", {
                        locale: id,
                      })
                    ) : (
                      <span>Pilih tanggal</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formState.releaseDate}
                    onSelect={handleDateChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                name="status"
                value={formState.status}
                onValueChange={(value) => handleSelectChange("status", value)}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((s, i) => (
                    <SelectItem key={`${s}-${i}`} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* File Upload */}
            <div className="space-y-2 overflow-hidden">
              <Label htmlFor="file">Berkas (PDF)</Label>
              {/* Preview file saat ini */}
              {(editingId || formState.fileUrl) && formState.fileName && (
                <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 p-2 rounded border border-blue-100 mb-2 overflow-hidden">
                  <FileText className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate font-medium flex-1 min-w-0">
                    {formState.fileName}
                  </span>
                  <span className="text-xs text-slate-500 flex-shrink-0 whitespace-nowrap">
                    {formState.file ? "(File Baru)" : "(File Saat Ini)"}
                  </span>
                </div>
              )}
              <div className="overflow-hidden">
                <Input
                  id="file"
                  name="file"
                  type="file"
                  accept=".pdf, application/pdf"
                  onChange={handleFileChange}
                  className="cursor-pointer w-full"
                />
              </div>
              <p className="text-[10px] text-slate-500">
                Format wajib: .pdf (Maksimal 2MB)
              </p>
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Batal</Button>
            </DialogClose>
            <Button
              onClick={handleSubmit}
              className="bg-[#1C6EA4] hover:bg-[#154D71]"
            >
              Simpan
            </Button>
          </DialogFooter>
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
