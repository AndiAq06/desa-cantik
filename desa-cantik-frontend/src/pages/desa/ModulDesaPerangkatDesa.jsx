import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { Button, buttonVariants } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { Save, Loader2, XCircle, Trash2, Plus } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { apiClient } from '@/services/apiClient';
import { useAuth } from '@/contexts/AuthContext';

const StatusToggle = ({ value, onChange, loading }) => (
    <div className="relative flex w-full items-center justify-center gap-3">
        {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/60">
                <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
            </div>
        )}
        {['show', 'hide'].map((state) => (
            <button
                key={state}
                type="button"
                onClick={() => onChange?.(state === 'show')}
                disabled={loading}
                className={cn(
                    'w-16 rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold transition-all',
                    state === value
                        ? 'bg-slate-200 text-slate-900 shadow-sm'
                        : 'bg-white text-slate-400',
                    loading && 'opacity-60 pointer-events-none'
                )}
            >
                {state === 'show' ? 'Tampil' : 'Tidak'}
            </button>
        ))}
    </div>
);

const ModulDesaPerangkatDesa = () => {
    const { activeVillageId } = useAuth();
    const [modules, setModules] = useState([]);
    const [modulesLoading, setModulesLoading] = useState(false);
    const [togglingModuleId, setTogglingModuleId] = useState(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [moduleToDelete, setModuleToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const loadModules = useCallback(async () => {
        if (!activeVillageId) return;
        setModulesLoading(true);
        try {
            const response = await apiClient.get(`/villages/${activeVillageId}/modules`);
            setModules(response.data || []);
        } catch (error) {
            console.error('Gagal memuat modul desa:', error);
            setModules([]);
        } finally {
            setModulesLoading(false);
        }
    }, [activeVillageId]);

    const handleDeleteClick = (module) => {
        setModuleToDelete(module);
        setDeleteConfirmOpen(true);
    };

    const confirmDelete = async () => {
        if (!moduleToDelete) return;
        setIsDeleting(true);
        try {
            await apiClient.delete(`/villages/${activeVillageId}/modules/${moduleToDelete.id}`);
            setModules((prev) => prev.filter((m) => m.id !== moduleToDelete.id));
            toast.success('Modul berhasil dihapus');
            setDeleteConfirmOpen(false);
        } catch (error) {
            console.error('Gagal menghapus modul:', error);
            toast.error('Gagal menghapus modul.');
        } finally {
            setIsDeleting(false);
            setModuleToDelete(null);
        }
    };

    useEffect(() => {
        loadModules();
    }, [loadModules]);

    return (
        <div className="w-full space-y-6">
            <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
                <section className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <h3 className="text-2xl font-semibold text-slate-900">Kelola Modul Desa</h3>
                            <p className="text-sm text-slate-500">Kelola daftar modul yang tampil di profil desa Anda.</p>
                        </div>
                        <ModuleDialog
                            mode="add"
                            selectedVillage={activeVillageId}
                            disabled={modulesLoading || !activeVillageId}
                            onSuccess={loadModules}
                        />
                    </div>

                    <Card className="border-slate-200 shadow-lg w-full overflow-hidden">
                        <CardHeader className="sr-only">
                            <CardTitle>Kelola Modul Desa</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <div className="min-w-[600px] text-sm md:text-base">
                                    <Table>
                                        <TableHeader className="bg-slate-50">
                                            <TableRow className="border-slate-100">
                                                <TableHead className="w-[50px] text-center font-semibold text-slate-600">
                                                    No
                                                </TableHead>
                                                <TableHead className="font-semibold text-slate-600">
                                                    Nama Modul
                                                </TableHead>
                                                <TableHead className="font-semibold text-slate-600">
                                                    Deskripsi
                                                </TableHead>
                                                <TableHead className="font-semibold text-slate-600">
                                                    Satuan
                                                </TableHead>
                                                <TableHead className="text-center font-semibold text-slate-600">
                                                    Aksi
                                                </TableHead>
                                                <TableHead className="text-center font-semibold text-slate-600">
                                                    Status
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {modulesLoading ? (
                                                <TableRow>
                                                    <TableCell colSpan={6} className="h-24 text-center">
                                                        <div className="flex flex-col items-center justify-center text-slate-500">
                                                            <Loader2 className="h-8 w-8 animate-spin mb-2" />
                                                            <p>Memuat modul...</p>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ) : modules.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                                                        Modul belum tersedia.
                                                    </TableCell>
                                                </TableRow>
                                            ) : modules.map((module, index) => (
                                                <TableRow
                                                    key={module.id}
                                                    className={cn(
                                                        'text-sm border-slate-100 hover:bg-slate-50/50',
                                                        module.id === 1 ? 'font-semibold text-slate-900' : 'text-slate-700'
                                                    )}
                                                >
                                                    <TableCell className="text-center text-slate-500">
                                                        {index + 1}
                                                    </TableCell>
                                                    <TableCell className="font-medium text-slate-900">
                                                        {module.name}
                                                    </TableCell>
                                                    <TableCell>{module.description}</TableCell>
                                                    <TableCell>{module.unit || '-'}</TableCell>
                                                    <TableCell className="text-center">

                                                        <div className="flex items-center justify-center gap-2">
                                                            <ModuleDialog
                                                                mode="edit"
                                                                module={module}
                                                                selectedVillage={activeVillageId}
                                                                disabled={modulesLoading}
                                                                onSuccess={loadModules}
                                                                triggerAsText={true}
                                                            />
                                                            <Button
                                                                onClick={() => handleDeleteClick(module)}
                                                                className="flex items-center justify-center gap-2 border border-rose-200 bg-rose-100 text-rose-700 hover:bg-rose-200 h-8 px-3 text-xs"
                                                            >
                                                                Hapus
                                                            </Button>
                                                        </div>
                                                    </TableCell>


                                                    <TableCell className="text-center">
                                                        <StatusToggle
                                                            value={module.is_enabled ? 'show' : 'hide'}
                                                            loading={togglingModuleId === module.id}
                                                            onChange={async (isEnabled) => {
                                                                try {
                                                                    setTogglingModuleId(module.id);
                                                                    await apiClient.put(`/villages/${activeVillageId}/modules/${module.id}/toggle`, {
                                                                        is_enabled: isEnabled,
                                                                    });
                                                                    setModules((prev) => prev.map((m) => m.id === module.id ? { ...m, is_enabled: isEnabled } : m));
                                                                    toast.success(`Modul ${isEnabled ? 'diaktifkan' : 'dinonaktifkan'}`);
                                                                } catch (error) {
                                                                    console.error('Gagal mengganti status modul:', error);
                                                                    toast.error('Gagal mengganti status modul.');
                                                                } finally {
                                                                    setTogglingModuleId(null);
                                                                }
                                                            }}
                                                        />
                                                    </TableCell>

                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </section>
            </div>


            {/* Global Delete Confirmation */}
            <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                <DialogContent className="max-w-sm rounded-lg border border-red-200 bg-white">
                    <DialogHeader>
                        <DialogTitle className="text-red-600 flex items-center gap-2">
                            <Trash2 className="h-5 w-5" />
                            Konfirmasi Hapus
                        </DialogTitle>
                    </DialogHeader>
                    <div className="py-2 text-sm text-slate-600">
                        Apakah Anda yakin ingin menghapus modul <b>{moduleToDelete?.name}</b>?
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
                            {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div >
    );
};

const ModuleDialog = ({ mode, module, selectedVillage, disabled = false, onSuccess, triggerAsText = false }) => {
    const [open, setOpen] = useState(false);
    const [formValues, setFormValues] = useState({
        name: module?.name || '',
        description: module?.description || '',
        unit: module?.unit || '',
    });
    const [submitting, setSubmitting] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        if (open) {
            setFormValues({
                name: module?.name || '',
                description: module?.description || '',
                unit: module?.unit || '',
            });
        }
    }, [open, module]);

    const title = mode === 'add' ? 'Tambah Modul Desa' : 'Edit Modul Desa';

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormValues((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = {
                name: formValues.name,
                description: formValues.description,
                unit: formValues.unit,
            };

            if (mode === 'add') {
                await apiClient.post(`/villages/${selectedVillage}/modules`, payload);
            } else if (module?.id) {
                await apiClient.put(`/villages/${selectedVillage}/modules/${module.id}`, payload);
            }

            await onSuccess?.();
            setOpen(false);
            toast.success(mode === 'add' ? 'Modul berhasil ditambahkan' : 'Modul berhasil diperbarui');
        } catch (error) {
            console.error('Gagal menyimpan modul:', error);
            const msg = error.response?.data?.message || 'Gagal menyimpan modul.';
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteClick = () => {
        setShowDeleteConfirm(true);
    };

    const executeDelete = async () => {
        if (!module?.id) return;

        setDeleting(true);
        try {
            await apiClient.delete(`/villages/${selectedVillage}/modules/${module.id}`);
            await onSuccess?.();
            setOpen(false);
            setShowDeleteConfirm(false);
            toast.success('Modul berhasil dihapus');
        } catch (error) {
            console.error('Gagal menghapus modul:', error);
            toast.error('Gagal menghapus modul.');
            setShowDeleteConfirm(false);
        } finally {
            setDeleting(false);
        }
    };

    const trigger =
        mode === 'add' ? (
            <Button
                className="bg-[#1C6EA4] hover:bg-[#154D71] shadow-sm whitespace-nowrap"
                disabled={disabled}
            >
                <Plus className="mr-2 h-4 w-4" />
                Tambah
            </Button>

        ) : (
            <Button
                className={cn(
                    buttonVariants({ variant: 'default', size: 'sm' }),
                    'bg-[#1C6EA4] hover:bg-[#154D71] text-white h-8 px-3 text-xs'
                )}
                disabled={disabled}
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
                        <label className="text-sm font-semibold text-slate-700">Nama</label>
                        <Input
                            name="name"
                            value={formValues.name}
                            onChange={handleChange}
                            className="rounded-xl border-slate-300 focus-visible:ring-slate-300"
                            placeholder="Masukkan nama modul"
                            required
                        />
                    </div>
                    <div className="grid gap-1">
                        <label className="text-sm font-semibold text-slate-700">
                            Deskripsi
                        </label>
                        <Textarea
                            name="description"
                            value={formValues.description}
                            onChange={handleChange}
                            className="rounded-xl border-slate-300 focus-visible:ring-slate-300"
                            placeholder="Masukkan deskripsi modul"
                            rows={3}
                            required
                        />
                    </div>
                    <div className="grid gap-1">
                        <label className="text-sm font-semibold text-slate-700">Satuan (Unit)</label>
                        <Input
                            name="unit"
                            value={formValues.unit}
                            onChange={handleChange}
                            className="rounded-xl border-slate-300 focus-visible:ring-slate-300"
                            placeholder="Contoh: Jiwa, KK, Ton"
                        />
                    </div>
                    <DialogFooter className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                        <Button
                            type="submit"
                            className="flex min-w-[120px] items-center justify-center gap-2 rounded-full bg-[#1C6EA4] hover:bg-[#154D71] shadow-sm whitespace-nowrap"
                            disabled={submitting}
                        >
                            <Save className="h-4 w-4" />
                            {submitting ? 'Menyimpan...' : 'Simpan'}
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

                <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                    <DialogContent className="max-w-sm rounded-lg border border-red-200 bg-white">
                        <DialogHeader>
                            <DialogTitle className="text-red-600 flex items-center gap-2">
                                <Trash2 className="h-5 w-5" />
                                Konfirmasi Hapus
                            </DialogTitle>
                        </DialogHeader>
                        <div className="py-2 text-sm text-slate-600">
                            Apakah Anda yakin ingin menghapus modul <b>{formValues.name}</b>?
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
                                onClick={executeDelete}
                                disabled={deleting}
                                className="bg-red-600 hover:bg-red-700 text-white"
                            >
                                {deleting ? 'Menghapus...' : 'Ya, Hapus'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </DialogContent>
        </Dialog>
    );
};

export default ModulDesaPerangkatDesa;
