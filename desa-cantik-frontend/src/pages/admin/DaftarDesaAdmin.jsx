import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, XCircle, Plus } from "lucide-react";
import { dataApi } from "@/services/dataApi";
import { Switch } from "@/components/ui/switch";

const VisibilityToggle = ({ value, onChange, disabled = false }) => {
  return (
    <div className="flex items-center rounded-full border border-slate-200 bg-white p-1 shadow-sm">
      {["show", "hide"].map((state) => (
        <button
          key={state}
          type="button"
          onClick={() => !disabled && onChange?.(state === "show")}
          className={cn(
            "px-4 py-1 text-xs font-semibold rounded-full transition-colors",
            state === value
              ? "bg-sky-200 text-slate-900 shadow-sm"
              : "text-slate-400",
            disabled && "opacity-60 cursor-not-allowed"
          )}
          disabled={disabled}
        >
          {state === "show" ? "Tampil" : "Sembunyi"}
        </button>
      ))}
    </div>
  );
};

const DaftarDesaAdmin = () => {
  const [villages, setVillages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [villageToDelete, setVillageToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage: 10,
  });

  const loadVillages = async (page = 1) => {
    try {
      setLoading(true);
      const response = await dataApi.listVillages({
        page: page,
        per_page: pagination.perPage,
        is_active: "all",
      });
      if (response.meta) {
        const lastPage = response.meta.last_page || 1;
        const targetPage = Math.max(1, Math.min(page, lastPage));
        setPagination((prev) => ({
          ...prev,
          currentPage: targetPage,
          lastPage,
          total: response.meta.total || 0,
        }));
        // If current page becomes higher than last page (after delete), refetch on last page
        if (page !== targetPage) {
          await loadVillages(targetPage);
          return;
        }
      }
      setVillages(response.items || []);
    } catch (error) {
      console.error("Gagal memuat daftar desa:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (village) => {
    setVillageToDelete(village);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!villageToDelete) return;
    setIsDeleting(true);
    try {
      await dataApi.deleteVillage(villageToDelete.id);
      await loadVillages(pagination.currentPage);
      toast.success('Desa berhasil dihapus');
      setDeleteConfirmOpen(false);
    } catch (error) {
      console.error('Gagal menghapus desa:', error);
      toast.error('Gagal menghapus desa.');
    } finally {
      setIsDeleting(false);
      setVillageToDelete(null);
    }
  };

  useEffect(() => {
    loadVillages(pagination.currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.currentPage]);

  return (
    <div className="w-full space-y-6">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <header className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">
              Daftar Desa
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Kelola daftar desa yang terdaftar.
            </p>
          </div>
          <VillageDialog
            mode="add"
            onSuccess={() => loadVillages(pagination.currentPage)}
          />
        </header>



        <Card className="border-slate-200 shadow-lg w-full overflow-hidden">
          <CardHeader className="sr-only">
            <CardTitle>Daftar Desa</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow className="border-slate-100">
                  <TableHead className="w-[50px] text-center font-semibold text-slate-600">
                    No
                  </TableHead>
                  <TableHead className="font-semibold text-slate-600">
                    Nama Desa
                  </TableHead>
                  <TableHead className="text-center font-semibold text-slate-600 align-middle">
                    Visibilitas
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
                      colSpan={4}
                      className="text-center text-gray-500"
                    >
                      Memuat data desa...
                    </TableCell>
                  </TableRow>
                ) : villages.length > 0 ? (
                  villages.map((village, index) => (
                    <TableRow
                      key={village.id}
                      className={cn(
                        "text-sm border-slate-100 hover:bg-slate-50/50",
                        village.id === 1
                          ? "bg-sky-100/80 font-semibold text-slate-900"
                          : "text-slate-700"
                      )}
                    >
                      <TableCell className="text-center text-slate-500">
                        {(pagination.currentPage - 1) * pagination.perPage + index + 1}
                      </TableCell>
                      <TableCell className="font-medium text-slate-900">
                        {village.name}
                      </TableCell>
                      <TableCell className="text-center align-middle">
                        <div className="flex justify-center">
                          <VisibilityToggle
                            value={
                              village.is_active === true ||
                                village.is_active === 1
                                ? "show"
                                : "hide"
                            }
                            disabled={togglingId === village.id}
                            onChange={async (newStatus) => {
                              try {
                                setTogglingId(village.id);
                                await dataApi.toggleVillageStatus(
                                  village.id,
                                  newStatus
                                );
                                // Optimistically update while waiting for refetch
                                setVillages((prev) =>
                                  prev.map((v) =>
                                    v.id === village.id
                                      ? { ...v, is_active: newStatus }
                                      : v
                                  )
                                );
                                await loadVillages(pagination.currentPage);
                              } catch (error) {
                                console.error(
                                  "Gagal mengubah status desa:",
                                  error
                                );
                                const msg = error?.response?.data?.message || error?.message || "Terjadi kesalahan";
                                toast.error(`Gagal mengubah status desa: ${msg}`);
                              } finally {
                                setTogglingId(null);
                              }
                            }}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <VillageDialog
                            mode="edit"
                            village={village}
                            onSuccess={() => loadVillages(pagination.currentPage)}
                            triggerAsText={true}
                          />
                          <Button
                            onClick={() => {
                              // We need to lift the delete logic or expose it.
                              // Since VillageDialog has delete logic internally, we should ideally refactor.
                              // For now, I'll assume we refactor the delete logic to the parent as done in other files.
                              handleDeleteClick(village);
                            }}
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
                      colSpan={4}
                      className="text-center text-gray-500"
                    >
                      Tidak ada data desa.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 bg-slate-50 px-6 py-4">
            <div className="text-xs text-slate-500">
              Menampilkan {villages.length} dari {pagination.total} desa
            </div>
            <Pagination className="mx-0">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => {
                      if (pagination.currentPage > 1) {
                        setPagination((prev) => ({
                          ...prev,
                          currentPage: prev.currentPage - 1,
                        }));
                      }
                    }}
                    className={cn(
                      "cursor-pointer",
                      pagination.currentPage === 1 &&
                      "pointer-events-none opacity-50"
                    )}
                  />
                </PaginationItem>

                {Array.from(
                  { length: Math.min(5, pagination.lastPage) },
                  (_, i) => {
                    let pageNum;
                    if (pagination.lastPage <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (
                      pagination.currentPage >=
                      pagination.lastPage - 2
                    ) {
                      pageNum = pagination.lastPage - 4 + i;
                    } else {
                      pageNum = pagination.currentPage - 2 + i;
                    }

                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          onClick={(e) => {
                            e.preventDefault();
                            setPagination((prev) => ({
                              ...prev,
                              currentPage: pageNum,
                            }));
                          }}
                          isActive={pageNum === pagination.currentPage}
                          className={cn(
                            "rounded-full px-3 cursor-pointer",
                            pageNum === pagination.currentPage
                              ? "border border-slate-300 bg-slate-200 text-slate-900"
                              : "text-slate-500"
                          )}
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  }
                )}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => {
                      if (pagination.currentPage < pagination.lastPage) {
                        setPagination((prev) => ({
                          ...prev,
                          currentPage: prev.currentPage + 1,
                        }));
                      }
                    }}
                    className={cn(
                      "cursor-pointer",
                      pagination.currentPage === pagination.lastPage &&
                      "pointer-events-none opacity-50"
                    )}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
            <div className="text-xs text-slate-500">
              Halaman {pagination.currentPage} dari {pagination.lastPage}
            </div>
          </CardFooter>
        </Card>
      </div>

      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="max-w-sm rounded-lg border border-red-200 bg-white">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <XCircle className="h-5 w-5" />
              Konfirmasi Hapus
            </DialogTitle>
          </DialogHeader>
          <div className="py-2 text-sm text-slate-600">
            Apakah Anda yakin ingin menghapus desa <b>{villageToDelete?.name}</b>?
            <br />
            Data yang dihapus tidak dapat dikembalikan.
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
              {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div >
  );
};

export default DaftarDesaAdmin;



const VillageDialog = ({ mode, village, onSuccess, triggerAsText = false }) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(village?.name || "");
  const [hasLayananOnline, setHasLayananOnline] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  React.useEffect(() => {
    if (open && village) {
      setName(village.name);
      setHasLayananOnline(village.has_layanan_online || false);
    } else if (open && mode === "add") {
      setName("");
      setHasLayananOnline(false);
    }
  }, [open, village, mode]);

  const title = mode === "add" ? "Tambah Daftar Desa" : "Edit Daftar Desa";

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const payload = {
        name,
        code: `${name
          .toLowerCase()
          .replace(/\s+/g, "-")
          .slice(0, 15)}-${Date.now()}`.slice(0, 20),
        district: village?.district || "Toraja Utara",
        deskripsi: village?.deskripsi || "-",
        has_layanan_online: hasLayananOnline,
      };

      console.log("Submitting Village Payload:", payload);

      if (mode === "add") {
        await dataApi.createVillage(payload);
      } else if (village?.id) {
        await dataApi.updateVillage(village.id, payload);
      }

      // Refresh data setelah simpan
      onSuccess?.();
      toast.success(mode === "add" ? "Desa berhasil ditambahkan" : "Desa berhasil diperbarui");
    } catch (error) {
      console.error("Gagal menyimpan desa:", error);
      const msg = error?.response?.data?.message || error?.message || "Terjadi kesalahan";
      toast.error(`Gagal menyimpan desa: ${msg}`);
    } finally {
      setSubmitting(false);
      setOpen(false);
    }
  };

  const trigger =
    mode === "add" ? (
      <Button
        className="bg-[#1C6EA4] hover:bg-[#154D71] shadow-sm whitespace-nowrap"
      >
        <Plus className="mr-2 h-4 w-4" />
        Tambah
      </Button>
    ) : triggerAsText ? (
      <Button
        className={cn(
          buttonVariants({ variant: "default", size: "sm" }),
          "bg-[#1C6EA4] hover:bg-[#154D71] text-white h-8 px-3 text-xs"
        )}
      >
        Edit
      </Button>
    ) : (
      <Button
        className={cn(
          buttonVariants({ variant: "default", size: "sm" }),
          "rounded-full bg-sky-200 text-slate-800 hover:bg-sky-300"
        )}
      >
        Edit
      </Button>
    );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-md rounded-2xl border border-slate-200 bg-white">
        <DialogHeader className="text-center">
          <DialogTitle className="text-lg font-semibold text-slate-800">
            {title}
          </DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-1">
            <Label className="text-sm font-semibold text-slate-700">
              Nama Desa
            </Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-xl border-slate-300 focus-visible:ring-slate-300"
              placeholder="Masukkan nama desa"
              required
            />
          </div>
          
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex flex-col gap-0.5">
              <Label className="text-sm font-semibold text-slate-700 cursor-pointer" htmlFor="layanan-online-toggle">
                Layanan Online
              </Label>
              <span className="text-xs text-slate-500">
                Tampilkan menu layanan online untuk desa ini
              </span>
            </div>
            <Switch
              id="layanan-online-toggle"
              checked={hasLayananOnline}
              onCheckedChange={setHasLayananOnline}
              className="data-[state=checked]:bg-[#1C6EA4]"
            />
          </div>
          <DialogFooter className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button
              type="submit"
              className="flex min-w-[120px] items-center justify-center gap-2 rounded-full bg-[#1C6EA4] hover:bg-[#154D71] shadow-sm whitespace-nowrap"
              disabled={submitting}
            >
              <Save className="h-4 w-4" />
              {submitting ? "Menyimpan..." : "Simpan"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex min-w-[120px] items-center justify-center gap-2 rounded-full border border-rose-200 bg-rose-100 text-rose-700 hover:bg-rose-200"
            >
              <XCircle className="h-4 w-4" />
              Kembali
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
