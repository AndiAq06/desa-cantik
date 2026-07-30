// src/pages/admin/DataStatistikAdmin.jsx
import React, { useState, useEffect, useMemo } from 'react';
import ExcelTableViewer from "@/components/shared/ExcelTableViewer";
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  CheckCircle,
  XCircle,
  FileText,
  Loader2,
  MapPin,
  Plus,
  Trash2,
  Edit,
  Check,
  X,
  FolderOpen,
  Download,
  Upload,
  BarChart3,
  Landmark,
  Calendar as CalendarIcon,
  ExternalLink,
} from 'lucide-react';
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { cn } from '@/lib/utils';
import { dataApi } from '@/services/dataApi';

const statusOptions = ["Terverifikasi", "Menunggu Validasi", "Ditolak"];

const defaultFormState = {
  title: "", // indicator_name
  subject: "", // module_id
  year: new Date().getFullYear().toString(),
  value: "",
  unit: "",
  source: "",
  status: "Terverifikasi", // Admin defaults to Verified
  updatedDate: new Date(),
  file: null,
  fileName: "",
  link: "",
};

export default function DataStatistikAdmin() {
  // Master selection states
  const [villages, setVillages] = useState([]);
  const [villagesLoading, setVillagesLoading] = useState(true);
  const [selectedVillage, setSelectedVillage] = useState(null);

  // Statistics and modules states
  const [statistics, setStatistics] = useState([]);
  const [statisticModules, setStatisticModules] = useState([]);
  const [loading, setLoading] = useState(false);

  // Selected indicator state
  const [selectedIndicator, setSelectedIndicator] = useState(null);
  const [selectedModuleId, setSelectedModuleId] = useState(null);

  // Modal and action states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState("add_data"); // 'add_indicator' | 'add_data' | 'edit_data'
  const [formState, setFormState] = useState(defaultFormState);
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reject dialog states
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectItem, setRejectItem] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  // Delete dialog states
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [statisticToDelete, setStatisticToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // CSV Import states
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importFileName, setImportFileName] = useState("");
  const [isImporting, setIsImporting] = useState(false);

  // 1. Load Villages
  useEffect(() => {
    const loadVillages = async () => {
      try {
        setVillagesLoading(true);
        const response = await dataApi.listVillages({ per_page: 100, is_active: 'all' });
        setVillages(response.items || []);
      } catch (error) {
        console.error('Gagal memuat desa:', error);
        toast.error('Gagal memuat daftar desa');
      } finally {
        setVillagesLoading(false);
      }
    };
    loadVillages();
  }, []);

  // 2. Load Statistics & Modules when Village changes
  useEffect(() => {
    if (!selectedVillage) {
      setStatistics([]);
      setStatisticModules([]);
      setSelectedIndicator(null);
      setSelectedModuleId(null);
      return;
    }
    loadData();
  }, [selectedVillage]);

  const loadData = async () => {
    if (!selectedVillage) return;
    setLoading(true);
    try {
      const [statsRes, modulesRes] = await Promise.all([
        dataApi.listAllStatistics({ per_page: 200, village_id: selectedVillage }),
        dataApi.listStatisticModules(selectedVillage)
      ]);

      const formattedStats = (statsRes.items || []).map((item) => ({
        ...item,
        title: item.indicator_name,
        updatedDate: item.updated_at ? new Date(item.updated_at) : new Date(),
      }));

      setStatistics(formattedStats);
      
      const modules = Array.isArray(modulesRes) ? modulesRes : (modulesRes.data || []);
      setStatisticModules(modules.filter(m => m.is_enabled || m.is_active));
    } catch (error) {
      console.error('Gagal memuat data statistik:', error);
      toast.error('Gagal memuat data statistik');
    } finally {
      setLoading(false);
    }
  };

  // Group statistics by module then by indicator_name
  const groupedData = useMemo(() => {
    const groups = {};
    
    // Initialize with all active modules
    statisticModules.forEach(mod => {
      const modId = mod.id.toString();
      groups[modId] = {
        id: modId,
        name: mod.name || mod.module_name,
        description: mod.description || "",
        indicators: {}
      };
    });
    
    // Add statistics
    statistics.forEach(stat => {
      const modId = stat.module_id?.toString() || "other";
      const indicatorName = stat.indicator_name || stat.title || "Lainnya";
      
      if (!groups[modId]) {
        groups[modId] = {
          id: modId,
          name: stat.module?.module_name || stat.subject || "Lainnya",
          description: "",
          indicators: {}
        };
      }
      
      if (!groups[modId].indicators[indicatorName]) {
        groups[modId].indicators[indicatorName] = [];
      }
      groups[modId].indicators[indicatorName].push(stat);
    });
    
    return groups;
  }, [statistics, statisticModules]);

  // Statistics for selected indicator
  const indicatorData = useMemo(() => {
    if (!selectedIndicator || !selectedModuleId || !groupedData[selectedModuleId]) return [];
    const rawData = groupedData[selectedModuleId].indicators[selectedIndicator] || [];
    return [...rawData].sort((a, b) => (b.year || 0) - (a.year || 0));
  }, [selectedIndicator, selectedModuleId, groupedData]);

  // Helpers badge coloring
  const getStatusVariant = (status) => {
    switch (status) {
      case 'Terverifikasi': return 'default';
      case 'Menunggu Validasi': return 'secondary';
      case 'Ditolak': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusClassName = (status) => {
    switch (status) {
      case 'Terverifikasi': return "bg-emerald-500 hover:bg-emerald-600 border-transparent text-white";
      case 'Menunggu Validasi': return "bg-amber-500 hover:bg-amber-600 border-transparent text-white";
      case 'Ditolak': return "bg-red-500 hover:bg-red-600 border-transparent text-white";
      default: return "";
    }
  };

  // --- Handlers ---
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormState(prev => {
      const newState = { ...prev, [name]: value };
      if (name === 'subject') {
        const selectedModule = statisticModules.find(m => String(m.id) === value);
        if (selectedModule) {
          newState.unit = selectedModule.unit || newState.unit;
        }
      }
      return newState;
    });
  };

  const handleDateChange = (date) => {
    if (date) setFormState(prev => ({ ...prev, updatedDate: date }));
  };

  // --- Opens Dialog ---
  const handleOpenTambahIndikator = (moduleId) => {
    setDialogMode("add_indicator");
    setFormState({
      ...defaultFormState,
      subject: moduleId,
      status: "Terverifikasi",
    });
    setEditingId(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (stat) => {
    setDialogMode("edit_data");
    setEditingId(stat.id);
    setFormState({
      ...stat,
      title: stat.indicator_name || stat.title,
      subject: stat.module_id?.toString() || stat.subject,
      link: stat.file_name || "",
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = (isOpen) => {
    if (!isOpen) {
      setFormState(defaultFormState);
      setEditingId(null);
    }
    setIsDialogOpen(isOpen);
  };

  const handleSubmit = async () => {
    if (!formState.title || !formState.subject) {
      toast.error("Mohon lengkapi Nama Indikator dan Kategori");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = new FormData();
      payload.append("module_id", formState.subject);
      payload.append("indicator_name", formState.title);
      payload.append("value", "0"); // Default dummy value
      payload.append("year", new Date().getFullYear().toString());
      payload.append("source", "BPS Kabupaten Toraja Utara");
      payload.append("status", "Terverifikasi"); // BPS Admin uploads are always verified

      const date = formState.updatedDate ? formState.updatedDate : new Date();
      payload.append("updated_at", date.toISOString());

      if (editingId) {
        await dataApi.updateStatistic(selectedVillage, editingId, payload);
        toast.success("Indikator berhasil diperbarui");
      } else {
        await dataApi.createStatistic(selectedVillage, payload);
        toast.success("Indikator baru berhasil ditambahkan");
        
        // Auto-select newly added indicator
        setSelectedIndicator(formState.title);
        setSelectedModuleId(formState.subject);
      }

      await loadData();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Gagal menyimpan data:", error);
      toast.error(error?.message || "Gagal menyimpan data");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExcelUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx')) {
      toast.error("Mohon pilih file Excel dengan format .xlsx");
      return;
    }

    try {
      const stat = indicatorData[0];
      const formData = new FormData();
      formData.append("module_id", selectedModuleId);
      formData.append("indicator_name", selectedIndicator);
      formData.append("year", stat?.year || new Date().getFullYear().toString());
      formData.append("value", "0");
      formData.append("source", stat?.source || "BPS Kabupaten Toraja Utara");
      formData.append("status", "Terverifikasi");
      formData.append("file", file);

      toast.loading("Mengunggah dan mengonversi berkas Excel...", { id: "upload-excel" });
      
      if (stat && stat.id) {
        await dataApi.updateStatistic(selectedVillage, stat.id, formData);
      } else {
        await dataApi.createStatistic(selectedVillage, formData);
      }
      
      toast.success("Excel berhasil diunggah dan dikonversi", { id: "upload-excel" });
      await loadData();
    } catch (error) {
      console.error("Gagal mengunggah excel:", error);
      toast.error(error?.message || "Gagal mengunggah excel", { id: "upload-excel" });
    }
  };

  // --- Deletion ---
  const handleDeleteClick = (stat) => {
    setStatisticToDelete(stat);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!statisticToDelete) return;
    try {
      setIsDeleting(true);
      await dataApi.deleteStatistic(selectedVillage, statisticToDelete.id);
      
      const remainingForIndicator = indicatorData.filter(d => d.id !== statisticToDelete.id);
      if (remainingForIndicator.length === 0) {
        setSelectedIndicator(null);
      }

      await loadData();
      toast.success('Data statistik berhasil dihapus');
      setDeleteConfirmOpen(false);
    } catch (error) {
      console.error('Gagal menghapus:', error);
      toast.error('Gagal menghapus data.');
    } finally {
      setIsDeleting(false);
      setStatisticToDelete(null);
    }
  };

  // --- Approval / Rejection ---
  const handleApprove = async (stat) => {
    try {
      await dataApi.approveStatistic(selectedVillage, stat.id);
      
      // Update locally
      setStatistics(prev => prev.map(p => p.id === stat.id ? { ...p, status: 'Terverifikasi' } : p));
      toast.success('Data statistik disetujui');
    } catch (error) {
      console.error('Gagal menyetujui:', error);
      toast.error('Gagal menyetujui data.');
    }
  };

  const handleOpenReject = (stat) => {
    setRejectItem(stat);
    setRejectReason('');
    setRejectDialogOpen(true);
  };

  const handleRejectConfirm = async () => {
    if (!rejectItem || !rejectReason.trim()) {
      toast.error('Alasan penolakan wajib diisi');
      return;
    }
    try {
      await dataApi.rejectStatistic(selectedVillage, rejectItem.id, rejectReason);
      
      // Update locally
      setStatistics(prev => prev.map(p => p.id === rejectItem.id ? { ...p, status: 'Ditolak', rejection_reason: rejectReason } : p));
      toast.success('Data statistik ditolak');
      setRejectDialogOpen(false);
    } catch (error) {
      console.error('Gagal menolak data:', error);
      toast.error('Gagal menolak data.');
    }
  };

  // --- CSV Import ---
  const downloadTemplate = (indicatorName, moduleName) => {
    const csvContent = "data:text/csv;charset=utf-8,"
      + "Modul,Indikator,Nilai,Satuan,Tahun,Sumber\n"
      + `"${moduleName}","${indicatorName}",0,"Satuan",${new Date().getFullYear()},"BPS Kabupaten Toraja Utara"`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `template_impor_${indicatorName.replace(/\s+/g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenImport = () => {
    setImportFile(null);
    setImportFileName("");
    setIsImportOpen(true);
  };

  const handleImportFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImportFile(file);
      setImportFileName(file.name);
    }
  };

  const handleImportSubmit = async () => {
    if (!importFile) {
      toast.error("Silakan pilih berkas Excel/CSV terlebih dahulu");
      return;
    }

    setIsImporting(true);
    try {
      const formData = new FormData();
      formData.append("file", importFile);

      const res = await dataApi.importStatistics(selectedVillage, formData);

      if (res?.success) {
        toast.success(res.message || "Data berhasil diimpor");
        if (res.data?.errors?.length > 0) {
          console.error("Import errors:", res.data.errors);
          toast.error(`Beberapa baris data gagal diimpor. Cek konsol browser.`);
        }
        setIsImportOpen(false);
        await loadData();
      } else {
        throw new Error(res?.message || "Gagal mengimpor data");
      }
    } catch (error) {
      console.error("Import failed", error);
      toast.error(error?.message || "Gagal mengimpor berkas Excel/CSV");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. SELECT VILLAGE */}
      <Card className="border-slate-200 shadow-md">
        <CardHeader className="py-4 bg-slate-50/20 border-b">
          <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-800">
            <MapPin className="h-5 w-5 text-blue-500" />
            Pilih Desa Binaan
          </CardTitle>
          <CardDescription className="text-xs">
            Pilih desa terlebih dahulu untuk melihat dan mengelola data statistik.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          {villagesLoading ? (
            <div className="flex items-center gap-3 text-slate-500 text-sm">
              <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
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

      {/* 2. MAIN CONTAINER */}
      {!selectedVillage ? (
        <div className="flex flex-col items-center justify-center h-[40vh] bg-slate-50 rounded-xl border border-dashed text-slate-400">
          <div className="p-4 bg-white rounded-full shadow-sm mb-3">
            <MapPin className="h-8 w-8 text-blue-500/60" />
          </div>
          <h3 className="text-sm font-semibold text-slate-600">
            Belum Ada Desa Dipilih
          </h3>
          <p className="text-slate-400 max-w-sm text-center mt-1 text-xs">
            Silakan pilih salah satu desa di menu dropdown untuk mulai mengelola data statistik.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT PANEL: Grouped Categories (Modules) & Indicators */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-slate-200 shadow-md">
              <CardHeader className="bg-slate-50/50 border-b py-4">
                <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-500" />
                  Kategori & Indikator
                </CardTitle>
                <CardDescription className="text-xs">
                  Kategori data aktif untuk desa binaan terpilih
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 space-y-4 max-h-[75vh] overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center py-10 text-slate-400 text-xs">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-500 mr-2" />
                    Memuat kategori...
                  </div>
                ) : statisticModules.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-sm">
                    Tidak ada kategori aktif di desa ini.
                  </div>
                ) : (
                  statisticModules.map((mod) => {
                    const modId = mod.id.toString();
                    const indicators = groupedData[modId]?.indicators || {};
                    const indicatorNames = Object.keys(indicators);

                    return (
                      <div key={modId} className="space-y-1 border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                        <h4 className="font-semibold text-slate-800 text-sm flex items-center gap-2">
                          <FolderOpen className="h-4 w-4 text-blue-500 shrink-0" />
                          {mod.name || mod.module_name}
                        </h4>
                        <div className="pl-5 space-y-0.5">
                          {indicatorNames.map((indName) => (
                            <button
                              key={indName}
                              onClick={() => {
                                setSelectedIndicator(indName);
                                setSelectedModuleId(modId);
                              }}
                              className={cn(
                                "w-full text-left text-xs py-1 px-2 rounded-md transition-all hover:bg-slate-100 hover:text-blue-600 block leading-snug",
                                selectedIndicator === indName
                                  ? "bg-blue-50 text-blue-700 font-semibold ring-1 ring-blue-700/10"
                                  : "text-slate-600"
                              )}
                            >
                              {indName}
                            </button>
                          ))}
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenTambahIndikator(modId)}
                            className="w-full justify-start text-[11px] text-blue-600 hover:text-blue-700 hover:bg-blue-50/50 mt-0.5 h-6 px-2"
                          >
                            <Plus className="h-3.5 w-3.5 mr-1" />
                            Tambah Indikator Baru
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </div>

          {/* RIGHT PANEL: Indicator Details & Data Table */}
          <div className="lg:col-span-2">
            {selectedIndicator ? (
              <div className="space-y-6">
                <Card className="border-slate-200 shadow-md">
                  <CardHeader className="bg-slate-50/50 border-b py-5">
                    <div className="flex flex-col gap-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-0 mb-2">
                            {statisticModules.find(m => m.id.toString() === selectedModuleId)?.name || 
                             statisticModules.find(m => m.id.toString() === selectedModuleId)?.module_name}
                          </Badge>
                          <CardTitle className="text-lg font-bold text-slate-800 leading-tight">
                            {selectedIndicator}
                          </CardTitle>
                        </div>
                        {/* Buka di Tab Baru removed */}
                      </div>

                      {/* Action buttons bar */}
                      <div className="flex flex-wrap gap-2 pt-2">
                        {indicatorData.length > 0 && (
                          <>
                            <Input
                              type="file"
                              accept=".xlsx"
                              id="excel-reupload-input"
                              className="hidden"
                              onChange={handleExcelUpload}
                            />
                            <Button
                              asChild
                              className="bg-blue-600 hover:bg-blue-700 text-white h-8 px-3 text-xs cursor-pointer"
                            >
                              <label htmlFor="excel-reupload-input">
                                <Upload className="mr-1.5 h-3.5 w-3.5" />
                                Ubah File Excel (.xlsx)
                              </label>
                            </Button>
                            <Button
                              onClick={() => handleDeleteClick(indicatorData[0])}
                              variant="destructive"
                              className="h-8 px-3 text-xs"
                            >
                              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                              Hapus Indikator
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    {indicatorData.length > 0 && indicatorData[0].file_name ? (
                      <ExcelTableViewer
                        fileUrl={indicatorData[0].file_name.startsWith('http') 
                          ? indicatorData[0].file_name 
                          : `${(import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api").replace(/\/api$/, "")}/storage/statistics/${indicatorData[0].file_name}`}
                        title={selectedIndicator}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 space-y-4">
                        <Upload className="w-10 h-10 text-slate-400" />
                        <div className="text-center">
                          <h5 className="font-semibold text-sm text-slate-700">Belum Ada File Excel</h5>
                          <p className="text-xs text-slate-400 mt-1 max-w-xs">
                            Silakan unggah berkas Excel (.xlsx) untuk menampilkan data tabel indikator ini.
                          </p>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                          <Input 
                            type="file" 
                            accept=".xlsx" 
                            id="excel-upload-input" 
                            className="hidden" 
                            onChange={handleExcelUpload}
                          />
                          <Button 
                            asChild 
                            className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                          >
                            <label htmlFor="excel-upload-input">
                              Pilih Berkas Excel
                            </label>
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="border-slate-200 border-dashed shadow-sm h-64 flex flex-col items-center justify-center bg-white rounded-xl text-slate-400">
                <FileText className="w-10 h-10 mb-3 opacity-30 text-slate-500" />
                <h4 className="text-sm font-semibold text-slate-600">Pilih Indikator Terlebih Dahulu</h4>
                <p className="text-xs text-slate-400 max-w-sm text-center mt-1">
                  Pilih salah satu kategori indikator pada kolom kiri untuk melakukan verifikasi, pengisian manual, atau impor.
                </p>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* DIALOG TAMBAH/EDIT DATA */}
      <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-[500px] rounded-xl bg-white">
          <DialogHeader>
            <DialogTitle className="text-slate-800 text-lg font-bold">
              {dialogMode === "add_indicator" 
                ? "Tambah Indikator & Data Baru" 
                : dialogMode === "edit_data" 
                  ? "Ubah Data Statistik" 
                  : "Tambah Angka Data Baru"}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Lengkapi detail data statistik di bawah ini. Sebagai Admin BPS, data yang ditambahkan akan langsung berstatus aktif dan terverifikasi.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-3 text-sm">
            {/* Subject (Kategori/Module) */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-600">Kategori Desa</Label>
              <Select
                name="subject"
                value={formState.subject}
                onValueChange={(val) => handleSelectChange("subject", val)}
                disabled={dialogMode !== "add_indicator"}
              >
                <SelectTrigger className="w-full bg-slate-50/50">
                  <SelectValue placeholder="Pilih Kategori" />
                </SelectTrigger>
                <SelectContent>
                  {statisticModules.map((mod) => (
                    <SelectItem key={mod.id} value={mod.id.toString()}>
                      {mod.name || mod.module_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Indicator Name */}
            <div className="space-y-1.5">
              <Label htmlFor="title" className="text-xs font-semibold text-slate-600">Nama Indikator</Label>
              <Input
                id="title"
                name="title"
                value={formState.title}
                onChange={handleFormChange}
                disabled={dialogMode !== "add_indicator"}
                placeholder="Contoh: Jumlah Aparatur Lembang di Lembang Nonongan Selatan"
                className="bg-slate-50/50"
              />
            </div>

          </div>

          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button variant="outline" size="sm" disabled={isSubmitting}>Batal</Button>
            </DialogClose>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5"
              size="sm"
            >
              {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Simpan Data
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* REJECT DATA REASON DIALOG */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-xl bg-white border border-red-100">
          <DialogHeader>
            <DialogTitle className="text-red-600 text-base font-bold flex items-center gap-2">
              <XCircle className="h-5 w-5" />
              Tolak Data Statistik
            </DialogTitle>
            <DialogDescription className="text-xs">
              Masukkan alasan penolakan data ini agar perangkat desa dapat memperbaikinya.
            </DialogDescription>
          </DialogHeader>

          <div className="py-2 space-y-2">
            <Label htmlFor="rejectReason" className="text-xs font-semibold text-slate-600">Alasan Penolakan</Label>
            <Textarea
              id="rejectReason"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Contoh: Angka penduduk tidak sesuai dengan data semester 2 Lembang."
              rows={4}
              className="text-xs"
            />
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRejectDialogOpen(false)}
            >
              Batal
            </Button>
            <Button
              onClick={handleRejectConfirm}
              disabled={!rejectReason.trim()}
              className="bg-red-600 hover:bg-red-700 text-white text-xs"
              size="sm"
            >
              Kirim Penolakan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CONFIRM DELETE DIALOG */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="max-w-sm rounded-lg border border-red-200 bg-white">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2 text-base font-bold">
              <Trash2 className="h-5 w-5" />
              Konfirmasi Hapus Data
            </DialogTitle>
          </DialogHeader>
          <div className="py-2 text-xs text-slate-600">
            Apakah Anda yakin ingin menghapus indikator <b>{statisticToDelete?.indicator_name}</b>?
            <br />
            Data yang dihapus tidak dapat dipulihkan kembali.
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

      {/* DIALOG UPLOAD/IMPORT EXCEL/CSV */}
      <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-xl bg-white">
          <DialogHeader>
            <DialogTitle className="text-slate-800 text-lg font-bold flex items-center gap-2">
              <Upload className="h-5 w-5 text-emerald-600" />
              Unggah File Excel/CSV (Admin)
            </DialogTitle>
            <DialogDescription className="text-xs">
              Unggah file data statistik sektoral untuk indikator: <br />
              <span className="font-bold text-slate-700">{selectedIndicator}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-2">
              <h5 className="font-semibold text-xs text-slate-700">Panduan Impor Data:</h5>
              <ul className="text-slate-500 text-[11px] list-disc pl-4 space-y-1">
                <li>Gunakan file dengan format **CSV** (*Comma Separated Values*).</li>
                <li>Unduh template terlebih dahulu untuk menyamakan tata letak kolom.</li>
                <li>Sebagai Admin, data hasil impor ini akan otomatis berstatus **Terverifikasi**.</li>
              </ul>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-600">Pilih Berkas CSV</Label>
              <Input
                type="file"
                accept=".csv"
                onChange={handleImportFileChange}
                className="cursor-pointer file:bg-slate-100 file:border-0 file:rounded-md file:text-xs file:font-semibold text-xs"
              />
              {importFileName && (
                <p className="text-xs text-slate-500 italic mt-1">
                  Berkas terpilih: {importFileName}
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsImportOpen(false)}
              disabled={isImporting}
            >
              Batal
            </Button>
            <Button
              onClick={handleImportSubmit}
              disabled={isImporting || !importFile}
              className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5"
              size="sm"
            >
              {isImporting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Mengimpor...
                </>
              ) : (
                "Mulai Impor"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
