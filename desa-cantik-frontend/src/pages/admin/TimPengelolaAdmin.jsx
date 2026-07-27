import { useState, useEffect } from "react";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash, Plus, User as UserIcon, XCircle, Trash2 } from "lucide-react";
import { teamApi } from "@/services/teamApi";

const defaultFormState = {
    name: "",
    role: "",
    email: "",
    phone: "",
    photo: null,
    display_order: 0,
    is_active: true,
};

export default function TimPengelolaAdmin() {
    const [members, setMembers] = useState([]);
    const [formState, setFormState] = useState(defaultFormState);
    const [loading, setLoading] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [ShowDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [memberToDelete, setMemberToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await teamApi.listTeamMembers({ include_inactive: true });
            setMembers(data);
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.message || error.message || "Gagal memuat data tim pengelola";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleFormChange = (e) => {
        const { name, value, type, checked, files } = e.target;
        if (type === "file") {
            setFormState((prev) => ({
                ...prev,
                [name]: files[0] || null,
            }));
        } else {
            setFormState((prev) => ({
                ...prev,
                [name]: type === "checkbox" ? checked : value,
            }));
        }
    };

    const handleOpenTambah = () => {
        setFormState(defaultFormState);
        setEditingId(null);
        setIsDialogOpen(true);
    };

    const handleOpenEdit = (member) => {
        setEditingId(member.id);
        setFormState({
            name: member.name || "",
            role: member.role || "",
            email: member.email || "",
            phone: member.phone || "",
            photo: null,
            display_order: member.displayOrder || member.display_order || 0,
            is_active: member.isActive ?? member.is_active ?? true,
        });
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setFormState(defaultFormState);
        setEditingId(null);
    };

    const handleDeleteClick = (member) => {
        setMemberToDelete(member);
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        if (!memberToDelete) return;

        try {
            setDeleting(true);
            await teamApi.deleteTeamMember(memberToDelete.id);
            await loadData();
            toast.success("Anggota tim berhasil dihapus");
            setShowDeleteConfirm(false);
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.message || error.message || "Gagal menghapus anggota tim";
            toast.error(msg);
            setShowDeleteConfirm(false);
        } finally {
            setDeleting(false);
            setMemberToDelete(null);
        }
    };

    const handleSubmit = async () => {
        try {
            if (!formState.name || !formState.role) {
                toast.error("Mohon lengkapi Nama dan Jabatan");
                return;
            }

            const formData = new FormData();
            formData.append('name', formState.name.trim());
            formData.append('role', formState.role.trim());
            if (formState.email?.trim()) formData.append('email', formState.email.trim());
            if (formState.phone?.trim()) formData.append('phone', formState.phone.trim());
            if (formState.photo) formData.append('photo', formState.photo);
            formData.append('display_order', parseInt(formState.display_order) || 0);
            formData.append('is_active', formState.is_active ? '1' : '0');

            if (editingId) {
                await teamApi.updateTeamMember(editingId, formData);
            } else {
                await teamApi.createTeamMember(formData);
            }

            await loadData();
            handleCloseDialog();
            toast.success(editingId ? "Anggota tim berhasil diperbarui" : "Anggota tim berhasil ditambahkan");
            toast.success(editingId ? "Anggota tim berhasil diperbarui" : "Anggota tim berhasil ditambahkan");
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.message || error.message || "Gagal menyimpan anggota tim";
            toast.error(msg);
        }
    };

    return (
        <div className="p-8 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">
                        Tim Pengelola Program
                    </h1>
                    <p className="text-slate-600 mt-1">
                        Kelola anggota tim pengelola Desa Cantik yang akan ditampilkan di halaman publik
                    </p>
                </div>
                <Button
                    onClick={handleOpenTambah}
                    className="bg-[#1C6EA4] hover:bg-[#154D71]"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Tambah Anggota Tim
                </Button>
            </div>

            <Card className="shadow-lg border-0 rounded-xl overflow-hidden">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-slate-50">
                            <TableRow>
                                <TableHead className="w-[50px] font-semibold text-slate-600">
                                    No.
                                </TableHead>
                                <TableHead className="font-semibold text-slate-600">
                                    Nama
                                </TableHead>
                                <TableHead className="font-semibold text-slate-600">
                                    Jabatan
                                </TableHead>
                                <TableHead className="font-semibold text-slate-600">
                                    Email
                                </TableHead>
                                <TableHead className="font-semibold text-slate-600">
                                    Telepon
                                </TableHead>
                                <TableHead className="font-semibold text-slate-600">
                                    Urutan
                                </TableHead>
                                <TableHead className="font-semibold text-slate-600">
                                    Status
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
                                        colSpan={8}
                                        className="h-24 text-center text-slate-500"
                                    >
                                        Memuat data...
                                    </TableCell>
                                </TableRow>
                            ) : members.length > 0 ? (
                                members.map((member, index) => (
                                    <TableRow
                                        key={member.id}
                                        className="hover:bg-slate-50/50 transition-colors"
                                    >
                                        <TableCell className="text-slate-500">
                                            {index + 1}
                                        </TableCell>
                                        <TableCell className="font-medium text-slate-800">
                                            <div className="flex items-center gap-2">
                                                {member.photoUrl || member.photo_url ? (
                                                    <img
                                                        src={member.photoUrl || member.photo_url}
                                                        alt={member.name}
                                                        className="w-8 h-8 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                                        <UserIcon className="h-4 w-4 text-blue-600" />
                                                    </div>
                                                )}
                                                {member.name}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-slate-600">
                                            {member.role}
                                        </TableCell>
                                        <TableCell className="text-slate-600">
                                            {member.email || "-"}
                                        </TableCell>
                                        <TableCell className="text-slate-600">
                                            {member.phone || "-"}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="font-mono">
                                                {member.displayOrder ?? member.display_order ?? 0}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    member.isActive ?? member.is_active
                                                        ? "default"
                                                        : "secondary"
                                                }
                                                className={
                                                    member.isActive ?? member.is_active
                                                        ? "bg-emerald-500 hover:bg-emerald-600"
                                                        : "bg-slate-400 hover:bg-slate-500"
                                                }
                                            >
                                                {member.isActive ?? member.is_active
                                                    ? "Aktif"
                                                    : "Nonaktif"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <Button
                                                    onClick={() => handleOpenEdit(member)}
                                                    className="bg-[#1C6EA4] hover:bg-[#154D71] text-white h-8 px-3 text-xs"
                                                >
                                                    Edit
                                                </Button>
                                                <Button
                                                    onClick={() => handleDeleteClick(member)}
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
                                        colSpan={8}
                                        className="h-24 text-center text-slate-500"
                                    >
                                        Belum ada anggota tim yang terdaftar
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
                <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editingId ? "Edit Anggota Tim" : "Tambah Anggota Tim Baru"}
                        </DialogTitle>
                        <DialogDescription>
                            Isi data anggota tim pengelola program Desa Cantik
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-6 py-4">
                        {/* Nama */}
                        <div className="space-y-2">
                            <Label htmlFor="name">
                                Nama Lengkap <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="name"
                                name="name"
                                value={formState.name}
                                onChange={handleFormChange}
                                placeholder="Contoh: Dr. Ahmad Subagja"
                            />
                        </div>

                        {/* Jabatan */}
                        <div className="space-y-2">
                            <Label htmlFor="role">
                                Jabatan <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="role"
                                name="role"
                                value={formState.role}
                                onChange={handleFormChange}
                                placeholder="Contoh: Koordinator Program"
                            />
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                value={formState.email}
                                onChange={handleFormChange}
                                placeholder="email@example.com"
                            />
                        </div>

                        {/* Telepon */}
                        <div className="space-y-2">
                            <Label htmlFor="phone">Nomor Telepon</Label>
                            <Input
                                id="phone"
                                name="phone"
                                value={formState.phone}
                                onChange={handleFormChange}
                                placeholder="08xxxxxxxxxx"
                            />
                        </div>

                        {/* Photo Upload */}
                        <div className="space-y-2">
                            <Label htmlFor="photo">Foto (png, jpg, pdf)</Label>
                            <Input
                                id="photo"
                                name="photo"
                                type="file"
                                accept="image/png, image/jpeg, application/pdf"
                                onChange={handleFormChange}
                            />
                            <p className="text-xs text-slate-500">
                                Unggah foto profil anggota tim (maks 2 MB)
                            </p>
                        </div>

                        {/* Display Order */}
                        <div className="space-y-2">
                            <Label htmlFor="display_order">Urutan Tampilan</Label>
                            <Input
                                id="display_order"
                                name="display_order"
                                type="number"
                                min="1"
                                value={formState.display_order}
                                onChange={handleFormChange}
                            />
                            <p className="text-xs text-slate-500">
                                Angka yang lebih kecil akan ditampilkan lebih dulu
                            </p>
                        </div>

                        {/* Status Aktif */}
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="is_active"
                                name="is_active"
                                checked={formState.is_active}
                                onChange={handleFormChange}
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <Label htmlFor="is_active" className="cursor-pointer">
                                Aktif (tampilkan di halaman publik)
                            </Label>
                        </div>
                    </div>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button className="bg-red-400 hover:bg-red-500 shadow-sm whitespace-nowrap text-white" variant="outline">Batal</Button>
                        </DialogClose>
                        <Button
                            onClick={handleSubmit}
                            className="bg-[#1C6EA4] hover:bg-[#154D71] shadow-sm whitespace-nowrap"
                        >
                            Simpan
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* DELETE CONFIRM DIALOG */}
            <Dialog open={ShowDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                <DialogContent className="max-w-sm rounded-lg border border-red-200 bg-white">
                    <DialogHeader>
                        <DialogTitle className="text-red-600 flex items-center gap-2">
                            <Trash2 className="h-5 w-5" />
                            Konfirmasi Hapus
                        </DialogTitle>
                    </DialogHeader>
                    <div className="py-2 text-sm text-slate-600">
                        Apakah Anda yakin ingin menghapus anggota <b>{memberToDelete?.name}</b>?
                        <br />
                        Tindakan ini tidak dapat dibatalkan.
                    </div>
                    <DialogFooter className="gap-2 sm:justify-end">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowDeleteConfirm(false)}
                            disabled={deleting}
                        >
                            Batal
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={confirmDelete}
                            disabled={deleting}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            {deleting ? "Menghapus..." : "Ya, Hapus"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
