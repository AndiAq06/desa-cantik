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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Save, Loader2, XCircle, Trash2, Plus, MapPin } from 'lucide-react';
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
import { dataApi } from '@/services/dataApi';

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

const ModulDesaAdmin = () => {
  const [villages, setVillages] = React.useState([]);
  const [villagesLoading, setVillagesLoading] = React.useState(true);
  const [modules, setModules] = React.useState([]);
  const [modulesLoading, setModulesLoading] = React.useState(false);
  const [selectedVillage, setSelectedVillage] = React.useState('');
  const [togglingModuleId, setTogglingModuleId] = React.useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false);
  const [moduleToDelete, setModuleToDelete] = React.useState(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const loadModules = useCallback(async () => {
    if (!selectedVillage) {
      setModules([]);
      return;
    }
    setModulesLoading(true);
    try {
      const response = await apiClient.get(`/villages/${selectedVillage}/modules`);
      setModules(response.data || []);
    } catch (error) {
      console.error('Gagal memuat modul desa:', error);
      setModules([]);
    } finally {
      setModulesLoading(false);
    }
  }, [selectedVillage]);

  const handleDeleteClick = (module) => {
    setModuleToDelete(module);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!moduleToDelete) return;
    setIsDeleting(true);
    try {
      await apiClient.delete(`/villages/${selectedVillage}/modules/${moduleToDelete.id}`);
      setModules((prev) => prev.filter((m) => m.id !== moduleToDelete.id));
      toast.success('Modul berhasil dihapus');
      setDeleteConfirmOpen(false);
    } catch (error) {
      console.error('Gagal menghapus modul:', error);
      const msg = error.response?.data?.message || 'Gagal menghapus modul.';
      toast.error(msg);
    } finally {
      setIsDeleting(false);
      setModuleToDelete(null);
    }
  };

  const handleToggleModule = async (module, isEnabled) => {
    if (!module?.id) return;
    try {
      setTogglingModuleId(module.id);
      await apiClient.put(`/villages/${selectedVillage}/modules/${module.id}/toggle`, {
        is_enabled: isEnabled,
      });
      setModules((prev) => prev.map((m) => m.id === module.id ? { ...m, is_enabled: isEnabled } : m));
      toast.success(`Modul ${isEnabled ? 'diaktifkan' : 'dinonaktifkan'}`);
    } catch (error) {
      console.error('Gagal mengganti status modul:', error);
      const msg = error.response?.data?.message || 'Gagal mengganti status modul.';
      toast.error(msg);
    } finally {
      setTogglingModuleId(null);
    }
  };

  useEffect(() => {
    const listVillages = async () => {
      setVillagesLoading(true);
      try {
        const response = await dataApi.listVillages({ limit: 1000, is_active: 'true' });
        setVillages(response.items || []);
        // Removed auto-select village logic
      } catch (error) {
        console.error('Gagal memuat desa:', error);
        toast.error('Gagal memuat data desa.');
      } finally {
        setVillagesLoading(false);
      }
    };
    listVillages();
  }, []);

  useEffect(() => {
    loadModules();
  }, [loadModules]);

  return (
    <div className="w-full space-y-6">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">

        {/* 1. PILIH DESA */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Pilih Desa
            </CardTitle>
            <div className="text-sm text-slate-500">
              Pilih desa terlebih dahulu untuk melihat dan mengelola kategori desa.
            </div>
          </CardHeader>
          <CardContent>
            {villagesLoading ? (
              <div className="flex items-center gap-3 text-slate-500">
                <Loader2 className="h-5 w-5 animate-spin" />
                Memuat daftar desa...
              </div>
            ) : (
              <Select onValueChange={setSelectedVillage} value={selectedVillage || ''}>
                <SelectTrigger className="w-full md:w-1/2">
                  <SelectValue placeholder="Pilih desa..." />
                </SelectTrigger>
                <SelectContent>
                  {villages.map(v => (
                    <SelectItem key={v.id} value={String(v.id)}>{v.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </CardContent>
        </Card>

        {/* 2. KONTEN UTAMA */}
        {!selectedVillage ? (
          <div className="flex flex-col items-center justify-center h-[50vh] bg-slate-50 rounded-xl border border-dashed text-center p-8">
            <div className="p-4 bg-white rounded-full shadow-sm mb-3">
              <MapPin className="h-8 w-8 text-blue-500" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">
              Belum Ada Desa Dipilih
            </h3>
            <p className="text-slate-500 max-w-sm text-center mt-1">
              Silakan pilih desa pada menu dropdown di atas untuk mulai mengelola
              kategori desa.
            </p>
          </div>
        ) : (
          <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-2xl font-semibold text-slate-900">Edit Kategori Desa - {villages.find(v => String(v.id) === selectedVillage)?.name}</h3>
              </div>
              <ModuleDialog
                mode="add"
                selectedVillage={selectedVillage}
                disabled={modulesLoading || villagesLoading || !selectedVillage}
                onSuccess={loadModules}
              />
            </div>

            <Card className="border-slate-200 shadow-lg w-full overflow-hidden">
              <CardHeader className="sr-only">
                <CardTitle>Edit Kategori Desa</CardTitle>
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
                            Nama Kategori
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
                              Modul belum tersedia untuk desa ini.
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
                                  selectedVillage={selectedVillage}
                                  disabled={modulesLoading || villagesLoading}
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
                                onChange={(isEnabled) => handleToggleModule(module, isEnabled)}
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
        )}
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

export default ModulDesaAdmin;

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

  const title = mode === 'add' ? 'Tambah Kategori Desa' : 'Edit Kategori Desa';

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
      } else {
        alert('ID modul tidak valid.');
        return;
      }

      await onSuccess?.();
      setOpen(false);
      toast.success(mode === 'add' ? 'Kategori berhasil ditambahkan' : 'Kategori berhasil diperbarui');
    } catch (error) {
      console.error('Gagal menyimpan kategori:', error);
      const msg = error.response?.data?.message || error.message || 'Gagal menyimpan kategori.';
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
      toast.success('Kategori berhasil dihapus');
    } catch (error) {
      console.error('Gagal menghapus kategori:', error);
      const msg = error.response?.data?.message || error.message || 'Gagal menghapus kategori.';
      toast.error(msg);
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
              placeholder="Masukkan nama kategori"
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
              placeholder="Masukkan deskripsi kategori"
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
            {/* Internal Delete Button Removed - Moved to Table */}
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

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <DialogContent className="max-w-sm rounded-lg border border-red-200 bg-white">
            <DialogHeader>
              <DialogTitle className="text-red-600 flex items-center gap-2">
                <Trash2 className="h-5 w-5" />
                Konfirmasi Hapus
              </DialogTitle>
            </DialogHeader>
            <div className="py-2 text-sm text-slate-600">
              Apakah Anda yakin ingin menghapus kategori <b>{formValues.name}</b>?
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
