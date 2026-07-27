// src/pages/dashboard/PerangkatDesaAdmin.jsx
import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { apiClient } from "@/services/apiClient";
import { Button } from "@/components/ui/button";
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
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Loader2,
  Save,
  XCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function PerangkatDesaAdmin() {
  // --- STATE ---
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0,
  });
  const [search, setSearch] = useState("");

  // State untuk Dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState("add"); // 'add' | 'edit'
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [villages, setVillages] = useState([]); // List desa untuk dropdown
  const [villagesLoading, setVillagesLoading] = useState(true);
  const [villagesError, setVillagesError] = useState("");

  // --- FETCH DATA ---

  // 1. Fetch Daftar Desa (untuk dropdown form)
  useEffect(() => {
    const fetchVillages = async () => {
      setVillagesLoading(true);
      setVillagesError("");
      try {
        const response = await apiClient.get("/villages", {
          params: { per_page: 100 },
        });
        setVillages(response.data || []);
      } catch (error) {
        console.error("Gagal memuat daftar desa:", error);
        setVillages([]);
        // toast.error("Gagal memuat data desa"); // Optional, might be annoying on load
        setVillagesError("Gagal memuat data desa");
      } finally {
        setVillagesLoading(false);
      }
    };
    fetchVillages();
  }, []);

  // 2. Fetch Users (Perangkat Desa)
  const fetchUsers = async (page = 1, searchTerm = "") => {
    setLoading(true);
    try {
      const response = await apiClient.get("/users", {
        params: {
          role: "village_officer", // Filter khusus perangkat desa
          page: page,
          per_page: 10,
          search: searchTerm,
        },
      });

      // Backend returns { success, data: [...], meta } - data is already the array
      setUsers(response.data || []);
      setPagination({
        currentPage: response.meta?.current_page || 1,
        lastPage: response.meta?.last_page || 1,
        total: response.meta?.total || 0,
      });
    } catch (error) {
      console.error("Gagal memuat data perangkat desa:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Load data saat pertama kali render atau page berubah
  useEffect(() => {
    fetchUsers(pagination.currentPage, search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.currentPage]);

  // --- HANDLERS ---

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, currentPage: 1 })); // Reset ke halaman 1
    fetchUsers(1, search);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.lastPage) {
      setPagination((prev) => ({ ...prev, currentPage: newPage }));
    }
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    try {
      setIsDeleting(true);
      await apiClient.delete(`/users/${userToDelete.id}`);
      toast.success("Akun perangkat desa berhasil dihapus");
      fetchUsers(pagination.currentPage, search); // Refresh data
      setShowDeleteConfirm(false);
    } catch (error) {
      const msg = error.response?.data?.message || error.message || "Gagal menghapus data";
      toast.error(`Gagal menghapus data: ${msg}`);
      // Keep dialog open on error? Or close? Close is usually better unless retry logic
      setShowDeleteConfirm(false);
    } finally {
      setIsDeleting(false);
      setUserToDelete(null);
    }
  };

  const openAddDialog = () => {
    setDialogMode("add");
    setSelectedUser(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (user) => {
    setDialogMode("edit");
    setSelectedUser(user);
    setIsDialogOpen(true);
  };

  const handleDialogSuccess = () => {
    setIsDialogOpen(false);
    fetchUsers(pagination.currentPage, search); // Refresh data setelah simpan
  };

  return (
    <div className="w-full space-y-6">
      {/* HEADER & FILTER */}
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">
            Daftar Perangkat Desa
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Kelola akun dan akses untuk perangkat desa.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <form onSubmit={handleSearch} className="relative flex-1 md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
            <Input
              placeholder="Cari nama atau email..."
              className="pl-9 bg-slate-50 border-slate-200"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </form>
          <Button
            onClick={openAddDialog}
            className="bg-[#1C6EA4] hover:bg-[#154D71] shadow-sm whitespace-nowrap"
          >
            <Plus className="h-4 w-4 mr-2" />
            Tambah Akun
          </Button>
        </div>
      </header>

      {/* TABEL DATA */}
      <Card className="border-slate-200 shadow-lg w-full overflow-hidden">
        <CardContent className="p-0 overflow-x-auto">
          <Table className="min-w-[800px]">
            <TableHeader className="bg-slate-50">
              <TableRow className="border-slate-100">
                <TableHead className="w-[50px] text-center font-semibold text-slate-600">
                  No
                </TableHead>
                <TableHead className="font-semibold text-slate-600 whitespace-nowrap">
                  Nama Lengkap
                </TableHead>
                <TableHead className="font-semibold text-slate-600">
                  Username
                </TableHead>
                <TableHead className="font-semibold text-slate-600">
                  Desa
                </TableHead>
                <TableHead className="font-semibold text-slate-600 whitespace-nowrap">
                  Email
                </TableHead>

                <TableHead className="text-center font-semibold text-slate-600">
                  Aksi
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-500">
                      <Loader2 className="h-8 w-8 animate-spin mb-2" />
                      <p>Memuat data...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-32 text-center text-slate-500"
                  >
                    Belum ada data perangkat desa.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user, index) => (
                  <TableRow
                    key={user.id}
                    className="border-slate-100 hover:bg-slate-50/50"
                  >
                    <TableCell className="text-center text-slate-500">
                      {(pagination.currentPage - 1) * 10 + index + 1}
                    </TableCell>
                    <TableCell className="font-medium text-slate-900">
                      {user.full_name}
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {user.username}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                        {user.village?.name || "-"}
                      </span>
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {user.email}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-2">
                        <Button
                          variant="default"
                          size="sm"
                          className="bg-[#1C6EA4] hover:bg-[#154D71] text-white h-8 px-3 text-xs"
                          onClick={() => openEditDialog(user)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex items-center justify-center gap-2 border border-rose-200 bg-rose-100 text-rose-700 hover:bg-rose-200 h-8 px-3 text-xs"
                          onClick={() => handleDeleteClick(user)}
                        >
                          Hapus
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>

        {/* FOOTER PAGINATION (FIXED PANNING) */}
        {!loading && users.length > 0 && (
          <CardFooter className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 bg-slate-50 px-6 py-4">
            <div className="text-xs text-slate-500">
              Menampilkan {users.length} dari {pagination.total} data
            </div>
            <Pagination className="mx-0 w-auto">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    className={cn(
                      "cursor-pointer",
                      pagination.currentPage === 1 &&
                      "pointer-events-none opacity-50"
                    )}
                  />
                </PaginationItem>

                <PaginationItem>
                  <span className="px-4 text-sm font-medium">
                    Halaman {pagination.currentPage} dari {pagination.lastPage}
                  </span>
                </PaginationItem>

                <PaginationItem>
                  <PaginationNext
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    className={cn(
                      "cursor-pointer",
                      pagination.currentPage === pagination.lastPage &&
                      "pointer-events-none opacity-50"
                    )}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </CardFooter>
        )}
      </Card>

      {/* DIALOG FORM */}
      <UserFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        mode={dialogMode}
        userData={selectedUser}
        villages={villages}
        villagesLoading={villagesLoading}
        villagesError={villagesError}
        onSuccess={handleDialogSuccess}
      />

      {/* DELETE CONFIRMATION DIALOG */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="max-w-sm rounded-lg border border-red-200 bg-white">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <XCircle className="h-5 w-5" />
              Konfirmasi Hapus
            </DialogTitle>
          </DialogHeader>
          <div className="py-2 text-sm text-slate-600">
            Apakah Anda yakin ingin menghapus akun <b>{userToDelete?.full_name}</b>?
            <br />
            Tindakan ini tidak dapat dibatalkan.
          </div>
          <DialogFooter className="gap-2 sm:justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isDeleting}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleConfirmDelete}
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

// --- KOMPONEN FORM DIALOG (TERPISAH AGAR RAPI) ---
// FIX: Tambahkan default value villages = [] untuk mencegah crash jika data belum ada
function UserFormDialog({
  open,
  onOpenChange,
  mode,
  userData,
  villages = [],
  villagesLoading = false,
  villagesError = "",
  onSuccess,
}) {
  const [formData, setFormData] = useState({
    full_name: "",
    username: "",
    email: "",
    village_id: "",
    password: "",
    password_confirmation: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Reset form saat dialog dibuka/mode berubah
  useEffect(() => {
    if (open) {
      if (mode === "edit" && userData) {
        setFormData({
          full_name: userData.full_name || "",
          username: userData.username || "",
          email: userData.email || "",
          village_id: userData.village?.id?.toString() || "",
          password: "", // Password kosong saat edit (kecuali mau diubah)
          password_confirmation: "",
        });
      } else {
        setFormData({
          full_name: "",
          username: "",
          email: "",
          village_id: "",
          password: "",
          password_confirmation: "",
        });
      }
    }
  }, [open, mode, userData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value) => {
    setFormData((prev) => ({ ...prev, village_id: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        village_id: formData.village_id ? parseInt(formData.village_id) : null,
        role: "village_officer", // Role otomatis diset
      };

      // Jika edit dan password kosong, hapus field password agar tidak terupdate
      if (mode === "edit" && !payload.password) {
        delete payload.password;
        delete payload.password_confirmation;
      }

      if (mode === "add") {
        await apiClient.post("/users", payload);
      } else {
        await apiClient.put(`/users/${userData.id}`, payload);
      }

      onSuccess(); // Callback refresh data
      toast.success(mode === "add" ? "Akun berhasil dibuat" : "Akun berhasil diperbarui");
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        "Terjadi kesalahan saat menyimpan data.";
      toast.error(msg);
      // Jika ada error validasi field spesifik, idealnya ditampilkan di bawah input
      console.error(error.response?.data?.errors);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "add"
              ? "Tambah Akun Perangkat Desa"
              : "Edit Akun Perangkat Desa"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {/* Nama Lengkap */}
          <div className="space-y-2">
            <Label htmlFor="full_name">Nama Lengkap</Label>
            <Input
              id="full_name"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="Contoh: Budi Santoso"
              required
            />
          </div>

          {/* Username */}
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="username_desa"
              required
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="email@desa.go.id"
              required
            />
          </div>

          {/* Desa (Dropdown) */}
          <div className="space-y-2">
            <Label htmlFor="village_id">Desa</Label>
            {/* FIX: Tambahkan pengecekan villages sebelum map */}
            <Select
              value={formData.village_id}
              onValueChange={handleSelectChange}
              required
              disabled={villagesLoading || Boolean(villagesError)}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    villagesLoading ? "Memuat data desa..." : "Pilih Desa"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {villagesLoading ? (
                  <SelectItem value="loading" disabled>
                    Memuat data desa...
                  </SelectItem>
                ) : villagesError ? (
                  <SelectItem value="error" disabled>
                    {villagesError}
                  </SelectItem>
                ) : villages && villages.length > 0 ? (
                  villages.map((village) => (
                    <SelectItem key={village.id} value={village.id.toString()}>
                      {village.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>
                    Tidak ada data desa
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Password Fields */}
          <div className="space-y-3 pt-2 border-t">
            <div className="flex items-center justify-between">
              <Label className="font-semibold">
                {mode === "add" ? "Password Akun" : "Ubah Password (Opsional)"}
              </Label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-xs text-blue-600 hover:underline flex items-center"
              >
                {showPassword ? (
                  <>
                    <EyeOff className="w-3 h-3 mr-1" /> Sembunyi
                  </>
                ) : (
                  <>
                    <Eye className="w-3 h-3 mr-1" /> Lihat
                  </>
                )}
              </button>
            </div>

            <div className="space-y-2">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                placeholder={
                  mode === "add"
                    ? "Masukkan password"
                    : "Isi jika ingin mengubah"
                }
                required={mode === "add"} // Wajib saat tambah
                minLength={8}
              />
            </div>

            <div className="space-y-2">
              <Input
                id="password_confirmation"
                name="password_confirmation"
                type={showPassword ? "text" : "password"}
                value={formData.password_confirmation}
                onChange={handleChange}
                placeholder="Konfirmasi password"
                required={mode === "add" || formData.password.length > 0} // Wajib jika password diisi
              />
            </div>
            {mode === "add" && (
              <p className="text-[10px] text-slate-500">Minimal 8 karakter.</p>
            )}
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              className="bg-[#1C6EA4] hover:bg-[#154D71]"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {mode === "add" ? "Simpan Akun" : "Simpan Perubahan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
