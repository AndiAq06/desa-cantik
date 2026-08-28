// src/pages/desa/DokumentasiDesa.jsx
import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogClose,
} from '@/components/ui/dialog';
import {
    Image as ImageIcon,
    Plus,
    Trash2,
    Loader2,
    AlertCircle
} from 'lucide-react';
import { dataApi } from '@/services/dataApi';
import { useAuth } from '@/contexts/AuthContext';

export default function DokumentasiDesa() {
    const { activeVillageId } = useAuth();

    const [docs, setDocs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Delete Dialog State
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [docToDelete, setDocToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Form State
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [description, setDescription] = useState('');

    // 1. Load Data
    useEffect(() => {
        const loadData = async () => {
            if (!activeVillageId) return;
            try {
                setLoading(true);
                const data = await dataApi.listDocumentation(activeVillageId);
                setDocs(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('Gagal memuat dokumentasi:', error);
                toast.error("Gagal memuat dokumentasi");
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [activeVillageId]);

    // 2. Handlers
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                toast.error("Ukuran file maksimal 5MB");
                return;
            }
            setSelectedFile(file);
            const objectUrl = URL.createObjectURL(file);
            setPreviewUrl(objectUrl);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!activeVillageId || !selectedFile) return;

        try {
            setIsSubmitting(true);
            const formData = new FormData();
            formData.append('image', selectedFile);
            if (description) formData.append('description', description);

            const newDoc = await dataApi.uploadDocumentation(activeVillageId, formData);
            setDocs(prev => [newDoc.data || newDoc, ...prev]); // Add to list

            // Reset form
            setSelectedFile(null);
            setPreviewUrl('');
            setDescription('');
            setIsModalOpen(false);
            toast.success("Foto berhasil diunggah");
        } catch (error) {
            console.error('Gagal upload:', error);
            toast.error('Gagal mengunggah gambar. Pastikan format sesuai (jpg/png) dan ukuran < 2MB.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteClick = (doc) => {
        setDocToDelete(doc);
        setDeleteConfirmOpen(true);
    };

    const confirmDelete = async () => {
        if (!docToDelete) return;
        try {
            setIsDeleting(true);
            await dataApi.deleteDocumentation(activeVillageId, docToDelete.id);
            setDocs(prev => prev.filter(d => d.id !== docToDelete.id));
            toast.success("Foto berhasil dihapus");
            setDeleteConfirmOpen(false);
        } catch (error) {
            console.error('Gagal menghapus:', error);
            toast.error('Gagal menghapus gambar.');
        } finally {
            setIsDeleting(false);
            setDocToDelete(null);
        }
    };

    // Cleanup preview URL
    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <ImageIcon className="h-5 w-5" />
                                Galeri Kegiatan Desa
                            </CardTitle>
                            <CardDescription>
                                Kelola foto dokumentasi kegiatan desa yang akan ditampilkan di halaman publik.
                            </CardDescription>
                        </div>
                        <Button onClick={() => setIsModalOpen(true)} className="bg-[#1C6EA4] hover:bg-[#154D71]">
                            <Plus className="mr-2 h-4 w-4" /> Tambah Foto
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-40 text-slate-500">
                            <Loader2 className="h-8 w-8 animate-spin mb-2" />
                            <p>Memuat galeri...</p>
                        </div>
                    ) : docs.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {docs.map((doc) => (
                                <div key={doc.id} className="group relative bg-slate-100 rounded-xl overflow-hidden shadow-sm border border-slate-200 aspect-[4/3]">
                                    {/* Blurred background */}
                                    <img
                                        src={doc.image_url}
                                        alt=""
                                        className="absolute inset-0 w-full h-full object-cover blur-xl opacity-40 scale-110 pointer-events-none select-none"
                                    />
                                    <div className="absolute inset-0 bg-black/10" />

                                    {/* Foreground image */}
                                    <img
                                        src={doc.image_url}
                                        alt={doc.description || 'Dokumentasi'}
                                        className="relative z-10 w-full h-full object-contain transition duration-300 group-hover:scale-102"
                                    />

                                    {/* Overlay Actions */}
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-start justify-end p-2 opacity-0 group-hover:opacity-100 z-20">
                                        <Button
                                            variant="destructive"
                                            size="icon"
                                            className="h-8 w-8 shadow-sm"
                                            onClick={() => handleDeleteClick(doc)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    {doc.description && (
                                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 z-20">
                                            <p className="text-white text-sm font-medium line-clamp-2">{doc.description}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-60 text-slate-400 border-2 border-dashed rounded-xl bg-slate-50/50">
                            <ImageIcon className="h-10 w-10 mb-3 opacity-50" />
                            <p>Belum ada dokumentasi kegiatan.</p>
                            <Button variant="link" onClick={() => setIsModalOpen(true)}>+ Tambah Foto Pertama</Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* MODAL UPLOAD */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <form onSubmit={handleSubmit}>
                        <DialogHeader>
                            <DialogTitle>Munggah Foto Kegiatan</DialogTitle>
                            <DialogDescription>
                                Pilih foto kegiatan desa untuk ditampilkan di galeri publik.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label>File Gambar (Max 5MB)</Label>
                                <Input
                                    type="file"
                                    accept="image/png, image/jpeg, image/jpg"
                                    onChange={handleFileChange}
                                    required
                                />
                            </div>

                            {previewUrl && (
                                <div className="relative aspect-video w-full rounded-md overflow-hidden border">
                                    <img src={previewUrl} alt="Preview" className="w-full h-full object-contain bg-slate-950" />
                                </div>
                            )}

                            <div className="grid gap-2">
                                <Label>Keterangan (Opsional)</Label>
                                <Input
                                    placeholder="Contoh: Musyawarah Desa 2024"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="outline">Batal</Button>
                            </DialogClose>
                            <Button type="submit" className="bg-[#1C6EA4]" disabled={!selectedFile || isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Simpan Foto
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
                        Apakah Anda yakin ingin menghapus foto dokumentasi ini?
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
