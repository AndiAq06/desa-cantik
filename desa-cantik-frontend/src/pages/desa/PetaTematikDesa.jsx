import React, { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "react-hot-toast";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogDescription, // Import DialogDescription
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
import { Switch } from "@/components/ui/switch";
import {
  Map as MapIcon,
  Layers,
  Database,
  Plus,
  MoreHorizontal,
  Trash2,
  FileJson,
  MapPin,
  PenTool,
  Undo,
  X,
  Eye,
  EyeOff,
  Edit,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

// --- REAL IMPORTS (MENGGUNAKAN API ASLI) ---
import { useAuth } from "@/contexts/AuthContext";
// Pastikan path import ini benar. Jika masih error, coba import default atau named export.
// Jika dataApi di export sebagai default: import dataApi from '@/services/dataApi';
// Jika dataApi di export sebagai named: import { dataApi } from '@/services/dataApi';
import { dataApi } from "@/services/dataApi";

const TORU_CENTER = [-2.9739, 119.9045]; // Default center Toraja Utara

// Fix Leaflet default icon paths for bundled setup
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

export default function PetaTematikDesa() {
  // Refs untuk Map Instances
  const mapRef = useRef(null);
  const layerGroupRef = useRef(null);
  const pickerMapRef = useRef(null);
  const pickerLayerGroupRef = useRef(null);

  // Data States
  const { user, activeVillageId } = useAuth();
  const [geospatialData, setGeospatialData] = useState([]);
  const [layerData, setLayerData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMap, setShowMap] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null); // 'addGeo', 'addLayer'
  const [currentItem, setCurrentItem] = useState(null);

  // Delete Dialog State
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null); // { type, id, name }
  const [isDeleting, setIsDeleting] = useState(false);

  // Form States
  const [formDataName, setFormDataName] = useState("");
  const [formDataType, setFormDataType] = useState("point");
  const [pickerMode, setPickerMode] = useState("upload");
  const [uploadedGeoJson, setUploadedGeoJson] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [manualLat, setManualLat] = useState("");
  const [manualLng, setManualLng] = useState("");
  const [polygonPoints, setPolygonPoints] = useState([]);
  const [formGeoId, setFormGeoId] = useState("");
  const [activeMainTab, setActiveMainTab] = useState("geospatial");

  // --- 2. LOAD DATA (REAL API) ---
  const loadData = useCallback(async () => {
    if (!activeVillageId) return;

    // Guard clause: Pastikan dataApi tersedia dan memiliki method yang dibutuhkan
    if (!dataApi) {
      console.error("dataApi is undefined. Check your imports.");
      return;
    }

    try {
      setLoading(true);

      let geoList = [];
      let allMaps = [];

      try {
        // Use single API call and filter for different tabs
        const getMapsFn = dataApi.listThematicMaps || dataApi.getThematicMaps;
        if (typeof getMapsFn === "function") {
          const result = await getMapsFn(activeVillageId);
          allMaps = Array.isArray(result) ? result : result?.data || [];
        } else {
          console.error(
            "dataApi.listThematicMaps or dataApi.getThematicMaps is not a function"
          );
        }
      } catch (err) {
        console.error("Error fetching thematic maps:", err);
      }

      // Data Geospatial tab: Show all data (regardless of is_active)
      setGeospatialData(allMaps);

      // Layer Peta tab: Only show active layers (is_active = true)
      const activeLayers = allMaps.filter((l) => l.is_active || l.is_visible);
      const formattedLayers = activeLayers.map((l) => ({
        id: l.id,
        name:
          l.layer_name ||
          l.map_name ||
          l.theme_name ||
          l.name ||
          "Layer Tanpa Nama",
        data_name: l.data_name || l.map_name,
        geoId: l.geospatial_data_id,
        geometry_type: l.geometry_type,
        map_type: l.map_type,
        // Ambil warna dari layer_config, default biru jika tidak ada
        color: l.layer_config?.color || l.color || "#3388ff",
        isVisible: l.is_active !== undefined ? Boolean(l.is_active) : true,
        features: l.features,
      }));
      setLayerData(formattedLayers);
    } catch (error) {
      console.error("Gagal memuat data peta:", error);
      toast.error("Gagal memuat data peta");
    } finally {
      setLoading(false);
    }
  }, [activeVillageId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // --- 3. MAP VISUALIZATION EFFECT ---
  useEffect(() => {
    // Hanya render peta jika toggle showMap aktif dan library sudah load
    if (showMap) {
      // Setup Map Instance jika belum ada
      if (!mapRef.current) {
        const mapElement = document.getElementById("mapPreview");
        if (mapElement) {
          mapRef.current = L.map("mapPreview", {
            center: TORU_CENTER,
            zoom: 11,
          });
          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "&copy; OpenStreetMap",
          }).addTo(mapRef.current);
          layerGroupRef.current = L.layerGroup().addTo(mapRef.current);

          const resizeObserver = new ResizeObserver(() => {
            if (mapRef.current) {
              mapRef.current.invalidateSize();
            }
          });
          resizeObserver.observe(mapElement);
        }
      }

      // Render Layers ke Peta - using embedded features directly (unified data model)
      if (layerGroupRef.current) {
        layerGroupRef.current.clearLayers();
        const validLayers = [];

        // Reverse array so that first layer in table (top) is added LAST to map (renders on top)
        [...layerData].reverse().forEach((layer) => {
          // Skip hidden layers
          if (layer.isVisible === false || layer.is_active === false) return;

          // Use embedded features directly from the layer
          const featuresData = layer.features;
          if (!featuresData) return;

          try {
            const parsedGeo =
              typeof featuresData === "string"
                ? JSON.parse(featuresData)
                : featuresData;

            const layerColor =
              layer.color || layer.layer_config?.color || "#3388ff";

            const geoJsonLayer = L.geoJSON(parsedGeo, {
              style: () => ({
                color: layerColor,
                weight: 3,
                opacity: 1,
                fillOpacity: 0.3,
              }),
              pointToLayer: (feature, latlng) => {
                return L.circleMarker(latlng, {
                  radius: 8,
                  fillColor: layerColor,
                  color: "#fff",
                  weight: 2,
                  opacity: 1,
                  fillOpacity: 0.8,
                });
              },
              onEachFeature: (feature, l) => {
                l.bindPopup(`
                    <div class="text-sm">
                      <h3 class="font-bold mb-1">${
                        layer.name || layer.map_name || "Layer"
                      }</h3>
                      <p>${layer.description || "Tidak ada deskripsi"}</p>
                    </div>
                  `);
              },
            });

            geoJsonLayer.addTo(layerGroupRef.current);
            validLayers.push(geoJsonLayer);
          } catch (e) {
            console.error("Error parsing GeoJSON for layer:", layer.name, e);
          }
        });

        // Auto-fit bounds if there are valid layers
        if (validLayers.length > 0 && mapRef.current) {
          const group = L.featureGroup(validLayers);
          if (group.getLayers().length > 0) {
            try {
              mapRef.current.fitBounds(group.getBounds(), {
                padding: [50, 50],
              });
            } catch (e) {
              console.warn("Could not fit bounds", e);
            }
          }
        }
      }
    } else {
      // Bersihkan instance map saat disembunyikan untuk hemat memori
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        layerGroupRef.current = null;
      }
    }
  }, [showMap, layerData, geospatialData]);

  // --- 4. RENDER PICKER MAP (MODAL) ---
  const formDataTypeRef = useRef(formDataType);
  useEffect(() => {
    formDataTypeRef.current = formDataType;
  }, [formDataType]);

  useEffect(() => {
    if (isModalOpen && pickerMode === "manual") {
      // Delay sedikit agar DOM modal siap
      setTimeout(() => {
        const mapEl = document.getElementById("pickerMap");
        if (mapEl && !pickerMapRef.current) {
          const map = L.map("pickerMap", {
            center: TORU_CENTER,
            zoom: 13,
          });
          L.tileLayer(
            "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          ).addTo(map);
          const layerGroup = L.layerGroup().addTo(map);

          pickerMapRef.current = map;
          pickerLayerGroupRef.current = layerGroup;

          map.on("click", (e) => {
            const { lat, lng } = e.latlng;
            if (formDataTypeRef.current === "point") {
              setManualLat(lat.toFixed(6));
              setManualLng(lng.toFixed(6));
              layerGroup.clearLayers();
              L.marker([lat, lng]).addTo(layerGroup);
            } else {
              setPolygonPoints((prev) => [...prev, [lat, lng]]);
            }
          });
        }
      }, 100);
    }

    if (!isModalOpen && pickerMapRef.current) {
      pickerMapRef.current.remove();
      pickerMapRef.current = null;
      pickerLayerGroupRef.current = null;

      // CRITICAL FIX: Cleanup memory when modal closes to prevent memory leaks
      setUploadedGeoJson(null);
      setUploadedFileName("");
      setManualLat("");
      setManualLng("");
      setPolygonPoints([]);
      setFormDataName("");
    }
  }, [isModalOpen, pickerMode]);

  // Visualisasi Gambar Polygon saat input manual di Modal
  useEffect(() => {
    if (!pickerLayerGroupRef.current) return;
    const lg = pickerLayerGroupRef.current;

    if (formDataType !== "point") {
      lg.clearLayers();
      polygonPoints.forEach((pt) =>
        L.circleMarker(pt, {
          radius: 4,
          color: "blue",
          fillOpacity: 0.8,
        }).addTo(lg)
      );
      if (polygonPoints.length > 1) {
        if (formDataType === "boundary")
          L.polygon(polygonPoints, { color: "blue" }).addTo(lg);
        else L.polyline(polygonPoints, { color: "blue" }).addTo(lg);
      }
    }
  }, [polygonPoints, formDataType]);

  // --- 5. HANDLERS ---
  const handleOpenModal = (type, item = null) => {
    setModalType(type);
    setCurrentItem(item);
    setPickerMode("upload");
    setUploadedGeoJson(null);
    setUploadedFileName("");
    setManualLat("");
    setManualLng("");
    setPolygonPoints([]);

    if (item) {
      setFormDataName(item.name || item.map_name || "");
      // Map backend geometry_type to frontend form values
      const geoType = (
        item.geometry_type ||
        item.type ||
        "point"
      ).toLowerCase();
      const mappedType =
        geoType === "polygon"
          ? "boundary"
          : geoType === "linestring"
          ? "line"
          : "point";
      setFormDataType(mappedType);

      // Issue 3: Set formGeoId for layer edit
      if (type.includes("Layer")) {
        setFormGeoId(
          String(
            item.geoId ?? item.geospatial_data_id ?? item.geospatial_id ?? ""
          )
        );
      }
    } else {
      setFormDataName("");
      setFormDataType("point");
      setFormGeoId("");
    }
    setIsModalOpen(true);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      setUploadedGeoJson(json);
      setUploadedFileName(file.name);
    } catch (err) {
      toast.error("File tidak valid. Pastikan format .geojson atau .json");
    }
  };

  const handleResetPolygon = () => setPolygonPoints([]);
  const handleUndoPolygon = () => setPolygonPoints((prev) => prev.slice(0, -1));

  const handleDeleteClick = (type, item) => {
    setDeleteItem({ type, id: item.id, name: item.name || "Item" });
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteItem) return;

    try {
      setIsDeleting(true);
      if (deleteItem.type === "geo") {
        await dataApi.deleteGeospatial(activeVillageId, deleteItem.id);
      } else if (deleteItem.type === "layer") {
        // For layer deletion: set inactive instead of actually deleting
        await dataApi.updateThematicMap(activeVillageId, deleteItem.id, {
          is_active: false,
          layer_name: null,
        });
      }
      await loadData();
      toast.success("Berhasil menghapus data");
      setDeleteConfirmOpen(false);
    } catch (error) {
      console.error(error);
      toast.error(
        "Gagal menghapus data: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setIsDeleting(false);
      setDeleteItem(null);
    }
  };

  // Layer ordering handler
  const handleMoveLayer = async (index, direction) => {
    if (!activeVillageId) return;

    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= layerData.length) return;

    // Swap the items in state
    const newLayerData = [...layerData];
    [newLayerData[index], newLayerData[newIndex]] = [
      newLayerData[newIndex],
      newLayerData[index],
    ];

    // Update layer_order values
    const orders = newLayerData.map((layer, idx) => ({
      id: layer.id,
      layer_order: idx,
    }));

    // Optimistic update
    setLayerData(newLayerData);

    try {
      await dataApi.reorderThematicMaps(activeVillageId, orders);
    } catch (error) {
      console.error("Gagal mengubah urutan layer:", error);
      toast.error("Gagal mengubah urutan layer.");
      // Revert on error
      loadData();
    }
  };

  const handleToggleLayer = async (id, checked) => {
    // Optimistic UI Update
    setLayerData((prev) =>
      prev.map((l) => (l.id === id ? { ...l, isVisible: checked } : l))
    );
    try {
      const layer = layerData.find((l) => l.id === id);

      // Kirim update ke backend
      // PERBAIKAN: Sesuaikan parameter updateThematicMap
      await dataApi.updateThematicMap(activeVillageId, id, {
        is_active: checked,
        map_name: layer.name,
        map_type: "Custom",
        layer_config: { color: layer.color },
      });
    } catch (error) {
      // Revert jika gagal
      setLayerData((prev) =>
        prev.map((l) => (l.id === id ? { ...l, isVisible: !checked } : l))
      );
      console.error("Update visibility gagal:", error);
    }
  };

  // Helper untuk mendeteksi tipe geometri dari GeoJSON
  const getGeometryType = (geoItem) => {
    if (geoItem.geometry_type) return geoItem.geometry_type;

    try {
      // Check multiple possible field names for geometry data
      const jsonData =
        geoItem.features || geoItem.geojson || geoItem.geojson_data;
      const json =
        typeof jsonData === "string" ? JSON.parse(jsonData) : jsonData;

      if (!json) return "-";

      if (json.type === "FeatureCollection" && json.features?.length > 0) {
        return json.features[0].geometry?.type || "Mixed";
      }
      return json.type || "-";
    } catch (e) {
      return "-";
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    if (modalType === "addGeo" || modalType === "editGeo") {
      let finalGeometry = null;
      let sourceName = "Manual Input";

      if (pickerMode === "upload") {
        if (!uploadedGeoJson && modalType === "addGeo") {
          toast.error("Silakan upload file GeoJSON terlebih dahulu!");
          return;
        }
        if (uploadedGeoJson) {
          finalGeometry = uploadedGeoJson;
          sourceName = uploadedFileName;
        } else if (modalType === "editGeo") {
          // Keep existing geometry when editing without new upload
          finalGeometry = currentItem.geojson_data || currentItem.features;
        }
      } else {
        if (formDataType === "point") {
          if (!manualLat || !manualLng) {
            toast.error("Koordinat belum lengkap!");
            return;
          }
          finalGeometry = {
            type: "FeatureCollection",
            features: [
              {
                type: "Feature",
                properties: { name: formDataName },
                geometry: {
                  type: "Point",
                  coordinates: [parseFloat(manualLng), parseFloat(manualLat)],
                },
              },
            ],
          };
        } else {
          if (polygonPoints.length < 3) {
            toast.error("Minimal 3 titik untuk area/garis!");
            return;
          }
          // Leaflet pakai [lat, lng], GeoJSON pakai [lng, lat] -> perlu di-swap
          const coordinates = polygonPoints.map((pt) => [pt[1], pt[0]]);

          // Polygon harus ditutup (titik akhir = titik awal)
          if (formDataType === "boundary") coordinates.push(coordinates[0]);

          finalGeometry = {
            type: "FeatureCollection",
            features: [
              {
                type: "Feature",
                properties: { name: formDataName },
                geometry: {
                  type: formDataType === "boundary" ? "Polygon" : "LineString",
                  coordinates:
                    formDataType === "boundary" ? [coordinates] : coordinates,
                },
              },
            ],
          };
        }
      }

      const payload = {
        type:
          formDataType === "boundary"
            ? "Polygon"
            : formDataType === "line"
            ? "LineString"
            : "Point",
        name: formDataName || "Unnamed",
        map_type: pickerMode === "upload" ? "geojson" : "manual_input",
        geojson_data: finalGeometry,
        description: formDataName || "Unnamed",
        properties: {
          name: formDataName || "Unnamed",
          source: sourceName || "Unknown",
        },
      };

      try {
        if (modalType === "addGeo") {
          const response = await dataApi.createGeospatial(
            activeVillageId,
            payload
          );
          console.log("Berhasil:", response.data);
          toast.success("Data geospatial berhasil ditambahkan");
        } else {
          // editGeo
          await dataApi.updateGeospatial(
            activeVillageId,
            currentItem.id,
            payload
          );
          toast.success("Data geospatial berhasil diperbarui");
        }
        setIsModalOpen(false);
        loadData();
      } catch (error) {
        console.error("Error:", error.response?.data || error.message);
        toast.error("Gagal menyimpan data geospatial");
      }
    } else if (modalType === "addLayer" || modalType === "editLayer") {
      // CRITICAL FIX: Validate required fields before creating payload
      if (!data.name || !data.geoId || !data.color) {
        const missing = [];
        if (!data.name) missing.push("Nama Layer");
        if (!data.geoId) missing.push("Sumber Data Geospatial");
        if (!data.color) missing.push("Warna");
        toast.error(`Mohon lengkapi field berikut: ${missing.join(", ")}`);
        return;
      }

      const geoId = parseInt(data.geoId);
      if (isNaN(geoId)) {
        toast.error(
          "ID Geospatial tidak valid. Pastikan sudah memilih data geospatial."
        );
        return;
      }

      // In merged model, "adding a layer" means activating an existing inactive record
      const payload = {
        layer_name: data.name,
        is_active: true,
        layer_config: { color: data.color || "#FF0000" },
      };

      try {
        console.log("Updating thematic map to create/edit layer:", payload);
        await dataApi.updateThematicMap(activeVillageId, geoId, payload);
        loadData();
        setIsModalOpen(false);
        setActiveMainTab("layer"); // Keep tab on layer page
        toast.success(
          modalType === "addLayer"
            ? "Layer peta berhasil dibuat"
            : "Layer peta berhasil diperbarui"
        );
      } catch (error) {
        console.error("Create/Edit Layer Error:", error);
        const errorMsg =
          error.response?.data?.message || error.message || "Unknown error";
        toast.error(`Gagal menyimpan layer peta: ${errorMsg}`);
      }
    }
  };

  // --- RENDER UI COMPONENTS ---
  const renderModalContent = () => {
    if (modalType === "addGeo" || modalType === "editGeo") {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nama Data</Label>
              <Input
                value={formDataName}
                onChange={(e) => setFormDataName(e.target.value)}
                placeholder="Contoh: Kantor Desa / Batas RT 01"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Tipe Geometri</Label>
              <Select
                value={formDataType}
                onValueChange={setFormDataType}
                disabled={modalType === "editGeo"}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="point">Titik Lokasi (Point)</SelectItem>
                  <SelectItem value="boundary">
                    Area / Wilayah (Polygon)
                  </SelectItem>
                  <SelectItem value="line">Jalur / Jalan (Line)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {(modalType === "addGeo" || modalType === "editGeo") && (
            <Tabs
              value={pickerMode}
              onValueChange={setPickerMode}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upload">
                  <FileJson className="w-4 h-4 mr-2" /> Upload File
                </TabsTrigger>
                <TabsTrigger value="manual">
                  <MapPin className="w-4 h-4 mr-2" /> Gambar di Peta
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upload" className="pt-4 space-y-4">
                <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center bg-slate-50 hover:bg-slate-100 transition-colors">
                  <Input
                    type="file"
                    accept=".geojson,.json"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                  />
                  <Label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center w-full"
                  >
                    <div className="bg-blue-100 p-3 rounded-full mb-2">
                      <FileJson className="h-6 w-6 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium text-slate-700">
                      Klik untuk upload file .geojson / .json
                    </span>
                    <span className="text-xs text-slate-500 mt-1">
                      {uploadedFileName || "Belum ada file dipilih"}
                    </span>
                  </Label>
                </div>
              </TabsContent>

              <TabsContent value="manual" className="pt-2 space-y-4">
                <div className="bg-blue-50 p-3 rounded-md text-xs text-blue-800 flex items-start gap-2">
                  <PenTool className="w-4 h-4 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    {formDataType === "point"
                      ? "Klik peta untuk menentukan titik koordinat."
                      : "Klik peta berulang kali untuk membentuk area polygon."}
                  </div>
                </div>

                {formDataType === "point" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-xs">Latitude</Label>
                      <Input
                        value={manualLat}
                        onChange={(e) => setManualLat(e.target.value)}
                        placeholder="-2.xxxxx"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Longitude</Label>
                      <Input
                        value={manualLng}
                        onChange={(e) => setManualLng(e.target.value)}
                        placeholder="119.xxxxx"
                      />
                    </div>
                  </div>
                )}

                {formDataType !== "point" && (
                  <div className="flex gap-2 items-center justify-between">
                    <span className="text-xs text-slate-500 font-medium">
                      {polygonPoints.length} Titik Terbentuk
                    </span>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={handleUndoPolygon}
                        disabled={polygonPoints.length === 0}
                      >
                        <Undo className="w-3 h-3 mr-1" /> Undo
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        onClick={handleResetPolygon}
                        disabled={polygonPoints.length === 0}
                      >
                        <X className="w-3 h-3 mr-1" /> Reset
                      </Button>
                    </div>
                  </div>
                )}

                <div className="h-[300px] w-full rounded-md border overflow-hidden relative">
                  <div
                    id="pickerMap"
                    className="h-full w-full z-0 bg-slate-100 flex items-center justify-center text-slate-400"
                  >
                    Memuat Peta...
                  </div>
                  {/* Crosshair untuk membantu titik tengah */}
                  {formDataType === "point" && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-[400] opacity-20">
                      <div className="w-4 h-4 border-l-2 border-t-2 border-black"></div>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      );
    } else if (modalType?.includes("Layer")) {
      // Issue 5: Filter to only show available geospatial data (1:1 validation)
      const usedGeoIds = new Set(
        layerData
          .filter((l) =>
            modalType === "editLayer" ? l.id !== currentItem?.id : true
          )
          .map((l) => l.geoId ?? l.geospatial_data_id ?? l.geospatial_id)
          .filter(Boolean)
      );
      const availableGeo = geospatialData.filter((g) => !usedGeoIds.has(g.id));
      // If editing, include current item's geo in the list
      const currentGeoId =
        currentItem?.geoId ??
        currentItem?.geospatial_data_id ??
        currentItem?.geospatial_id;
      const dropdownGeo =
        modalType === "editLayer" && currentGeoId
          ? [
              ...availableGeo,
              ...geospatialData.filter((g) => g.id === currentGeoId),
            ].filter((g, i, arr) => arr.findIndex((x) => x.id === g.id) === i)
          : availableGeo;

      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Nama Layer</Label>
            <Input
              name="name"
              defaultValue={currentItem?.name}
              required
              placeholder="Contoh: Persebaran Sekolah"
            />
          </div>
          <div className="space-y-2">
            <Label>Nama Data</Label>
            <Select value={formGeoId} onValueChange={setFormGeoId}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih Data Geospatial" />
              </SelectTrigger>
              <SelectContent>
                {dropdownGeo.length === 0 ? (
                  <SelectItem value="no-data" disabled>
                    Semua data sudah memiliki layer
                  </SelectItem>
                ) : (
                  dropdownGeo.map((geo) => (
                    <SelectItem key={geo.id} value={geo.id.toString()}>
                      {geo.name ||
                        geo.map_name ||
                        geo.description ||
                        `Data #${geo.id}`}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <Input type="hidden" name="geoId" value={formGeoId} />
            <p className="text-[10px] text-slate-500">
              Data geospatial harus diupload terlebih dahulu di tab "Data
              Geospatial"
            </p>
          </div>
          <div className="space-y-2">
            <Label>Warna Visualisasi</Label>
            <div className="flex gap-2 items-center">
              <Input
                name="color"
                defaultValue={currentItem?.color || "#3388ff"}
                type="color"
                className="w-12 h-10 p-1 cursor-pointer"
                required
              />
              <Input
                name="color_text"
                defaultValue={currentItem?.color || "#3388ff"}
                className="flex-1"
                readOnly
              />
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="w-full space-y-6 p-6">
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">
            Peta Tematik Desa
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Kelola data spasial dan visualisasi peta desa Anda.
          </p>
        </div>
      </header>

      <Tabs
        value={activeMainTab}
        onValueChange={setActiveMainTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="geospatial">
            <Database className="mr-2 h-4 w-4" /> Data Geospatial (Master)
          </TabsTrigger>
          <TabsTrigger value="layer">
            <Layers className="mr-2 h-4 w-4" /> Layer Peta Tematik (Visual)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="geospatial">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Tabel Data Geospatial</CardTitle>
                <CardDescription>
                  Data geometri mentah (GeoJSON) yang tersimpan.
                </CardDescription>
              </div>
              <Button
                size="sm"
                onClick={() => handleOpenModal("addGeo")}
                className="bg-[#1C6EA4] hover:bg-[#154D71]"
              >
                <Plus className="mr-2 h-4 w-4" /> Tambah Data Baru
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama / Deskripsi</TableHead>
                      <TableHead>Tipe Geometri</TableHead>
                      <TableHead>Sumber</TableHead>
                      <TableHead className="text-center font-semibold text-slate-600 w-[150px]">
                        Aksi
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="text-center text-slate-500 py-8 animate-pulse"
                        >
                          Memuat data...
                        </TableCell>
                      </TableRow>
                    ) : geospatialData.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="text-center text-slate-500 py-8"
                        >
                          Belum ada data geospatial.
                        </TableCell>
                      </TableRow>
                    ) : (
                      geospatialData.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">
                            {item.data_name ||
                              item.map_name ||
                              `Item #${item.id}`}
                          </TableCell>
                          <TableCell>
                            <span className="uppercase text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded border">
                              {getGeometryType(item)}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm text-slate-500">
                            {item.map_type === "manual_input"
                              ? "Input Manual"
                              : item.map_type === "geojson"
                              ? "GeoJSON"
                              : item.features
                              ? "GeoJSON"
                              : "-"}
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                variant="default"
                                size="sm"
                                className="bg-[#1C6EA4] hover:bg-[#154D71] text-white h-8 px-3 text-xs"
                                onClick={() => handleOpenModal("editGeo", item)}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="flex items-center justify-center gap-2 rounded-full border border-rose-200 bg-rose-100 text-rose-700 hover:bg-rose-200 h-8 px-3 text-xs"
                                onClick={() => handleDeleteClick("geo", item)}
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
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="layer">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Konfigurasi Layer Peta</CardTitle>
                <CardDescription>
                  Atur tampilan visualisasi data di peta publik.
                </CardDescription>
              </div>
              <Button
                size="sm"
                onClick={() => handleOpenModal("addLayer")}
                className="bg-[#1C6EA4] hover:bg-[#154D71]"
              >
                <Plus className="mr-2 h-4 w-4" /> Buat Layer Baru
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[60px]">Urutan</TableHead>
                      <TableHead>Nama Layer</TableHead>
                      <TableHead>Nama Data</TableHead>
                      <TableHead>Tipe Geometri</TableHead>
                      <TableHead>Warna</TableHead>
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
                          className="text-center text-slate-500 py-8 animate-pulse"
                        >
                          Memuat layer...
                        </TableCell>
                      </TableRow>
                    ) : layerData.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="text-center text-slate-500 py-8"
                        >
                          Belum ada layer peta yang dibuat.
                        </TableCell>
                      </TableRow>
                    ) : (
                      layerData.map((item, index) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => handleMoveLayer(index, "up")}
                                disabled={index === 0}
                              >
                                <ChevronUp className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => handleMoveLayer(index, "down")}
                                disabled={index === layerData.length - 1}
                              >
                                <ChevronDown className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            {item.layer_name ||
                              item.name ||
                              item.map_name ||
                              "Layer Tanpa Nama"}
                          </TableCell>
                          <TableCell className="text-sm text-slate-600">
                            {item.data_name || item.map_name || "-"}
                          </TableCell>
                          <TableCell>
                            <span className="uppercase text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded border">
                              {item.geometry_type || item.map_type || "-"}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-4 h-4 rounded-full shadow-sm border"
                                style={{ backgroundColor: item.color }}
                              ></div>
                              <span className="text-xs mono">{item.color}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-3">
                              <div className="flex items-center gap-2 bg-slate-50 px-2 py-1 rounded-md border">
                                <Switch
                                  checked={item.isVisible}
                                  onCheckedChange={(c) =>
                                    handleToggleLayer(item.id, c)
                                  }
                                  className="scale-75"
                                />
                                <span className="text-[10px] font-medium text-slate-600 uppercase">
                                  {item.isVisible ? "Aktif" : "Nonaktif"}
                                </span>
                              </div>
                              <Button
                                variant="default"
                                size="sm"
                                className="bg-[#1C6EA4] hover:bg-[#154D71] text-white h-8 px-3 text-xs"
                                onClick={() => handleOpenModal("editLayer", item)}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteClick("layer", item)}
                                className="flex items-center justify-center gap-2 border border-rose-200 bg-rose-100 text-rose-700 hover:bg-rose-200 h-8 px-3 text-xs"
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
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapIcon className="h-5 w-5" /> Preview Peta
          </CardTitle>
          <CardDescription>
            Pratinjau tampilan peta desa dengan layer yang aktif.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <Button
            variant={showMap ? "outline" : "default"}
            className={`w-full mb-4 ${
              !showMap ? "bg-[#1C6EA4] hover:bg-[#154D71]" : ""
            }`}
            onClick={() => setShowMap(!showMap)}
          >
            {showMap ? (
              <>
                <EyeOff className="mr-2 h-4 w-4" /> Sembunyikan Peta
              </>
            ) : (
              <>
                <Eye className="mr-2 h-4 w-4" /> Tampilkan Peta
              </>
            )}
          </Button>

          <div
            className={`transition-all duration-500 ease-in-out ${
              showMap
                ? "h-[500px] opacity-100"
                : "h-0 opacity-0 overflow-hidden"
            }`}
          >
            <div
              id="mapPreview"
              className="h-full w-full rounded-lg border shadow-inner bg-slate-100 relative z-0"
            />
          </div>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {modalType?.includes("add") ? "Tambah" : "Edit"} Data
            </DialogTitle>
            <DialogDescription>
              {modalType === "addGeo"
                ? "Upload file GeoJSON atau gambar area langsung di peta."
                : "Buat layer visualisasi baru berdasarkan data geospatial."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleFormSubmit}>
            <div className="py-4">{renderModalContent()}</div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Batal
                </Button>
              </DialogClose>
              <Button type="submit" className="bg-[#1C6EA4] hover:bg-[#154D71]">
                Simpan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DELETE DIALOG */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="max-w-sm rounded-lg border border-red-200 bg-white">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Konfirmasi Hapus
            </DialogTitle>
          </DialogHeader>
          <div className="py-2 text-sm text-slate-600">
            Apakah Anda yakin ingin menghapus{" "}
            {deleteItem?.type === "geo" ? "data geospatial" : "layer"}{" "}
            <b>{deleteItem?.name}</b>?
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
