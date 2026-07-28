// src/pages/desa/DataStatistikDesa.jsx
import React, { useState, useMemo, useEffect } from "react";
import ExcelTableViewer from "@/components/shared/ExcelTableViewer";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Edit,
  Trash,
  Plus,
  Calendar as CalendarIcon,
  FileText,
  ChevronLeft,
  ChevronRight,
  Loader2,
  XCircle,
  Trash2,
  FolderOpen,
  Download,
  Upload,
  BarChart3,
  Landmark,
  ExternalLink,
  Eye,
  EyeOff,
} from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { dataApi } from "@/services/dataApi";

const statusOptions = ["Terverifikasi", "Menunggu Validasi", "Ditolak"];

const defaultFormState = {
  title: "", // indicator_name
  subject: "", // module_id
  year: new Date().getFullYear().toString(),
  value: "",
  unit: "",
  source: "",
  updatedDate: new Date(),
  status: "Menunggu Validasi",
  file: null,
  fileName: "",
  link: "",
};

export default function DataStatistikDesa() {
  const { activeVillageId } = useAuth();
  const [statistics, setStatistics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statisticModules, setStatisticModules] = useState([]);
  
  // Navigation states
  const [selectedIndicator, setSelectedIndicator] = useState(null);
  const [selectedModuleId, setSelectedModuleId] = useState(null);

  // Dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState("add_data"); // 'add_indicator' | 'add_data' | 'edit_data'
  const [formState, setFormState] = useState(defaultFormState);
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importFileName, setImportFileName] = useState("");
  const [isImporting, setIsImporting] = useState(false);

  // Delete state
  const [deletingId, setDeletingId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [statisticToDelete, setStatisticToDelete] = useState(null);
  const [isTogglingPublish, setIsTogglingPublish] = useState(false);

  useEffect(() => {
    if (activeVillageId) {
      loadData();
    }
  }, [activeVillageId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, modulesData] = await Promise.all([
        dataApi.listStatistics(activeVillageId, { per_page: 200 }),
        dataApi.listStatisticModules(activeVillageId),
      ]);

      const formattedStats = statsData.items.map((item) => ({
        ...item,
        title: item.indicator_name,
        updatedDate: item.updated_at ? new Date(item.updated_at) : new Date(),
      }));

      setStatistics(formattedStats);

      const modules = Array.isArray(modulesData) ? modulesData : [];
      setStatisticModules(modules.filter(m => m.is_enabled || m.is_active));
    } catch (error) {
      console.error("Failed to load data", error);
      setStatisticModules([]);
      toast.error("Gagal memuat data statistik");
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
    // Sort by year descending
    return [...rawData].sort((a, b) => (b.year || 0) - (a.year || 0));
  }, [selectedIndicator, selectedModuleId, groupedData]);

  // UI status badge coloring
  const getStatusVariant = (status) => {
    switch (status) {
      case "Terverifikasi":
        return "default";
      case "Menunggu Validasi":
        return "secondary";
      case "Ditolak":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getStatusClassName = (status) => {
    switch (status) {
      case "Terverifikasi":
        return "bg-emerald-500 hover:bg-emerald-600 border-transparent text-white";
      case "Menunggu Validasi":
        return "bg-amber-500 hover:bg-amber-600 border-transparent text-white";
      case "Ditolak":
        return "bg-red-500 hover:bg-red-600 border-transparent text-white";
      default:
        return "";
    }
  };

  // --- Handlers Form ---
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormState((prev) => {
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
    if (date) setFormState((prev) => ({ ...prev, updatedDate: date }));
  };

  // --- Opens Dialog ---
  const handleOpenTambahIndikator = (moduleId) => {
    setDialogMode("add_indicator");
    setFormState({
      ...defaultFormState,
      subject: moduleId,
      status: "Menunggu Validasi",
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
      const formData = new FormData();
      formData.append("module_id", formState.subject);
      formData.append("indicator_name", formState.title);
      formData.append("value", "0"); // Default dummy value
      formData.append("year", new Date().getFullYear().toString());
      formData.append("source", "Kantor Lembang");
      formData.append("status", "Terverifikasi"); // Automatically verified

      const date = formState.updatedDate ? formState.updatedDate : new Date();
      formData.append("updated_at", date.toISOString());

      if (editingId) {
        await dataApi.updateStatistic(activeVillageId, editingId, formData);
        toast.success("Indikator berhasil diperbarui");
      } else {
        await dataApi.createStatistic(activeVillageId, formData);
        toast.success("Indikator baru berhasil ditambahkan");
        
        // Auto-select the newly added indicator
        setSelectedIndicator(formState.title);
        setSelectedModuleId(formState.subject);
      }

      await loadData();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Failed to save data", error);
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
      formData.append("source", stat?.source || "Kantor Lembang");
      formData.append("status", "Terverifikasi");
      formData.append("file", file);

      toast.loading("Mengunggah dan mengonversi berkas Excel...", { id: "upload-excel" });
      
      if (stat && stat.id) {
        await dataApi.updateStatistic(activeVillageId, stat.id, formData);
      } else {
        await dataApi.createStatistic(activeVillageId, formData);
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
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!statisticToDelete) return;

    try {
      setDeletingId(statisticToDelete.id);
      await dataApi.deleteStatistic(activeVillageId, Number(statisticToDelete.id));
      toast.success("Data statistik berhasil dihapus");
      
      // If we delete the last item under the selected indicator, clear indicator selection
      const remainingForIndicator = indicatorData.filter(d => d.id !== statisticToDelete.id);
      if (remainingForIndicator.length === 0) {
        setSelectedIndicator(null);
      }

      await loadData();
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error("Failed to delete", error);
      toast.error("Gagal menghapus data");
    } finally {
      setDeletingId(null);
      setStatisticToDelete(null);
    }
  };

  const handleTogglePublish = async () => {
    const stat = indicatorData[0];
    if (!stat || !stat.id) return;

    setIsTogglingPublish(true);
    const newPublishState = !stat.is_published;

    try {
      await dataApi.updateStatistic(activeVillageId, stat.id, {
        is_published: newPublishState
      });
      toast.success(newPublishState ? "Data berhasil dipublikasikan ke portal utama" : "Data disembunyikan sebagai draf");
      await loadData();
    } catch (error) {
      console.error("Gagal mengubah status publikasi:", error);
      toast.error(error?.message || "Gagal mengubah status publikasi");
    } finally {
      setIsTogglingPublish(false);
    }
  };

  // --- Import / Export excel/csv ---
  const downloadTemplate = (indicatorName, moduleName) => {
    // Generate clean template prefilled with the module and indicator name
    const csvContent = "data:text/csv;charset=utf-8,"
      + "Modul,Indikator,Nilai,Satuan,Tahun,Sumber\n"
      + `"${moduleName}","${indicatorName}",0,"Satuan",${new Date().getFullYear()},"Kantor Lembang"`;

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

      const res = await dataApi.importStatistics(activeVillageId, formData);

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
    <div className="p-1 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Kelola Data Statistik</h2>
          <p className="text-sm text-slate-500">Kelompokkan indikator dan kelola data deret waktu (time-series) desa binaan.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
          <Loader2 className="h-10 w-10 animate-spin text-blue-500 mb-4" />
          <p className="text-sm font-medium">Memuat struktur data statistik...</p>
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
                  Grup kategori yang aktif untuk desa binaan
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 space-y-4 max-h-[75vh] overflow-y-auto">
                {statisticModules.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-sm">
                    Tidak ada kategori statistik yang aktif. Silakan hubungi admin atau aktifkan di menu kategori desa.
                  </div>
                ) : (
                  statisticModules.map((mod) => {
                    const modId = mod.id.toString();
                    const indicators = groupedData[modId]?.indicators || {};
                    const indicatorNames = Object.keys(indicators);

                    return (
                      <div key={modId} className="space-y-2 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                        <h4 className="font-semibold text-slate-800 text-sm flex items-center gap-2">
                          <FolderOpen className="h-4 w-4 text-blue-500 shrink-0" />
                          {mod.name || mod.module_name}
                        </h4>
                        <div className="pl-6 space-y-1.5">
                          {indicatorNames.map((indName) => {
                            const isPub = indicators[indName]?.[0]?.is_published !== false;
                            return (
                              <button
                                key={indName}
                                onClick={() => {
                                  setSelectedIndicator(indName);
                                  setSelectedModuleId(modId);
                                }}
                                className={cn(
                                  "w-full text-left text-xs py-1.5 px-2.5 rounded-md transition-all hover:bg-slate-100 hover:text-blue-600 flex items-center justify-between gap-2 leading-snug",
                                  selectedIndicator === indName
                                    ? "bg-blue-50 text-blue-700 font-semibold ring-1 ring-blue-700/10"
                                    : "text-slate-600"
                                )}
                              >
                                <span className="truncate">{indName}</span>
                                {!isPub && (
                                  <Badge className="bg-slate-100 text-slate-500 hover:bg-slate-200 border-0 text-[9px] px-1 py-0 h-4 shrink-0 font-medium">
                                    Draf
                                  </Badge>
                                )}
                              </button>
                            );
                          })}
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenTambahIndikator(modId)}
                            className="w-full justify-start text-[11px] text-blue-600 hover:text-blue-700 hover:bg-blue-50/50 mt-1 h-7 px-2"
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
                        leftActions={
                          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 shrink-0">
                            {indicatorData[0]?.is_published ? (
                              <Eye className="h-4 w-4 text-green-600 animate-pulse" />
                            ) : (
                              <EyeOff className="h-4 w-4 text-slate-400" />
                            )}
                            <div className="flex flex-col text-left">
                              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider leading-none">
                                Status Publikasi
                              </span>
                              <span className={cn(
                                "text-xs font-bold leading-tight mt-0.5",
                                indicatorData[0]?.is_published ? "text-green-600" : "text-slate-500"
                              )}>
                                {indicatorData[0]?.is_published ? "Publik" : "Draf (Privat)"}
                              </span>
                            </div>
                            <Switch
                              checked={!!indicatorData[0]?.is_published}
                              onCheckedChange={handleTogglePublish}
                              disabled={isTogglingPublish}
                              className="ml-1 data-[state=checked]:bg-green-600"
                            />
                          </div>
                        }
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
                <FileText className="w-10 h-10 mb-3 opacity-30 text-slate-500 animate-pulse" />
                <h4 className="text-sm font-semibold text-slate-600">Pilih Indikator Terlebih Dahulu</h4>
                <p className="text-xs text-slate-400 max-w-sm text-center mt-1">
                  Pilih salah satu kategori indikator pada kolom kiri untuk melihat rincian tabel data, mengunduh template, atau mengunggah data baru.
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
              Isi data di bawah ini dengan lengkap. Data yang ditambahkan perangkat desa akan berstatus "Menunggu Validasi" dari BPS.
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
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsDialogOpen(false)} 
              disabled={isSubmitting}
            >
              Batal
            </Button>
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

      {/* DIALOG UPLOAD/IMPORT EXCEL/CSV */}
      <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-xl bg-white">
          <DialogHeader>
            <DialogTitle className="text-slate-800 text-lg font-bold flex items-center gap-2">
              <Upload className="h-5 w-5 text-emerald-600" />
              Unggah File Excel/CSV
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
                <li>Pastikan nilai kolom **Modul** dan **Indikator** sama persis dengan modul & indikator terpilih.</li>
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

      {/* CONFIRM DELETE DIALOG */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
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
              onClick={() => setShowDeleteConfirm(false)}
              disabled={deletingId !== null}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleConfirmDelete}
              disabled={deletingId !== null}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deletingId !== null ? "Menghapus..." : "Ya, Hapus"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
