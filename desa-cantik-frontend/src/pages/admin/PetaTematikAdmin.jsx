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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Map,
  Layers,
  Database,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Info,
  MapPin,
  Loader2,
  FileJson,
  PenTool,
  Undo,
  X,
  Check,
  Download,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { dataApi } from "@/services/dataApi";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

export default function PetaTematikAdmin() {
  const mapRef = useRef(null);
  const layerGroupRef = useRef(null);
  const pickerMapRef = useRef(null);
  const pickerLayerGroupRef = useRef(null);

  const [selectedDesa, setSelectedDesa] = useState(null);
  const [villages, setVillages] = useState([]);
  const [geospatialData, setGeospatialData] = useState([]);
  const [layerData, setLayerData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingGeo, setLoadingGeo] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [currentItem, setCurrentItem] = useState(null);

  // Delete Dialog Status
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null); // { type: 'geo'|'layer', id, name }
  const [isDeleting, setIsDeleting] = useState(false);

  // --- New State for Modal ---
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

  // Load villages list
  useEffect(() => {
    const loadVillages = async () => {
      try {
        const response = await dataApi.listVillages({
          per_page: 100,
          is_active: "all",
        });
        setVillages(response.items || []);
      } catch (error) {
        console.error("Gagal memuat desa:", error);
      } finally {
        setLoading(false);
      }
    };
    loadVillages();
  }, []);

  // Load geospatial and layer data when village is selected
  const loadMapData = useCallback(async () => {
    if (!selectedDesa) {
      setGeospatialData([]);
      setLayerData([]);
      return;
    }

    setLoadingGeo(true);
    try {
      // Load all thematic maps and filter for different tabs
      const allMaps = await dataApi.listThematicMaps(selectedDesa);

      // Data Geospatial tab: Show all data (regardless of is_active)
      setGeospatialData(allMaps || []);

      // Layer Peta tab: Only show active layers (is_active = true)
      const activeLayers = (allMaps || []).filter(
        (item) => item.is_active || item.is_visible
      );
      setLayerData(activeLayers);
    } catch (error) {
      console.error("Gagal memuat data peta:", error);
      setGeospatialData([]);
      setLayerData([]);
    } finally {
      setLoadingGeo(false);
    }
  }, [selectedDesa]);

  useEffect(() => {
    loadMapData();
  }, [loadMapData]);

  // Cleanup map when container is removed (loading or no selection)
  useEffect(() => {
    if ((!selectedDesa || loadingGeo) && mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
      layerGroupRef.current = null;
    }
  }, [selectedDesa, loadingGeo]);

  // Inisialisasi Peta (Cleanup on unmount)
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Render Peta saat desa dipilih
  useEffect(() => {
    if (!selectedDesa) {
      if (layerGroupRef.current) layerGroupRef.current.clearLayers();
      return;
    }

    const timeoutId = setTimeout(() => {
      const mapElement = document.getElementById("mapPreview");

      if (!mapRef.current && mapElement) {
        mapRef.current = L.map("mapPreview", {
          center: [-2.9739, 119.9045],
          zoom: 11,
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap contributors",
        }).addTo(mapRef.current);

        layerGroupRef.current = L.layerGroup().addTo(mapRef.current);
      }

      if (!mapRef.current || !layerGroupRef.current) return;

      layerGroupRef.current.clearLayers();

      // Render layers using embedded features directly (unified data model)
      const validLayers = [];
      // Reverse array so that first layer in table (top) is added LAST to map (renders on top)
      [...layerData].reverse().forEach((layer) => {
        // Skip hidden layers
        if (layer.is_active === false || layer.isVisible === false) return;

        // Use embedded features directly from the layer
        const featuresData = layer.features;
        if (!featuresData) return;

        try {
          const parsedGeo =
            typeof featuresData === "string"
              ? JSON.parse(featuresData)
              : featuresData;

          const layerColor =
            layer.color || layer.layer_config?.color || "#FF0000";

          const geoJsonLayer = L.geoJSON(parsedGeo, {
            style: () => ({
              color: layerColor,
              weight: 3,
              opacity: 1,
              fillOpacity: 0.3,
            }),
            pointToLayer: (feature, latlng) => {
              return L.circleMarker(latlng, {
                radius: 6,
                fillColor: layerColor,
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8,
              });
            },
          });

          geoJsonLayer.addTo(layerGroupRef.current);
          validLayers.push(geoJsonLayer);
        } catch (err) {
          console.error("Load layer failed:", layer.name, err);
        }
      });

      // Auto zoom to layers
      if (validLayers.length > 0 && mapRef.current) {
        const group = L.featureGroup(validLayers);
        if (group.getLayers().length > 0) {
          try {
            mapRef.current.fitBounds(group.getBounds(), {
              padding: [50, 50],
            });
          } catch (e) { }
        }
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [selectedDesa, layerData, geospatialData]);

  // --- Picker Map Logic ---
  const formDataTypeRef = useRef(formDataType);
  useEffect(() => {
    formDataTypeRef.current = formDataType;
  }, [formDataType]);

  useEffect(() => {
    let timeoutId;

    if (isModalOpen && pickerMode === "manual") {
      timeoutId = setTimeout(() => {
        const mapEl = document.getElementById("pickerMap");
        if (mapEl && !pickerMapRef.current) {
          const map = L.map("pickerMap", {
            center: [-2.9739, 119.9045],
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

    // Cleanup function to destroy map on unmount or dependency change
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (pickerMapRef.current) {
        pickerMapRef.current.remove();
        pickerMapRef.current = null;
        pickerLayerGroupRef.current = null;
      }
    };
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

  // --- CRUD Handlers ---
  const handleOpenModal = (type, item = null) => {
    setModalType(type);
    setCurrentItem(item);

    // Reset form state
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
          String(item.geospatial_data_id ?? item.geospatial_id ?? "")
        );
      }
    } else {
      setFormDataName("");
      setFormDataType("point");
      setFormGeoId("");
    }

    setIsModalOpen(true);
  };

  const handleDeleteClick = (type, item) => {
    setDeleteItem({ type, id: item.id, name: item.name });
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedDesa || !deleteItem) return;

    try {
      setIsDeleting(true);
      if (deleteItem.type === "geo") {
        await dataApi.deleteGeospatial(selectedDesa, deleteItem.id);
        setGeospatialData(
          geospatialData.filter((item) => item.id !== deleteItem.id)
        );
      } else {
        // For layer deletion: set inactive instead of actually deleting
        await dataApi.updateThematicMap(selectedDesa, deleteItem.id, {
          is_active: false,
          layer_name: null,
        });
        setLayerData(layerData.filter((item) => item.id !== deleteItem.id));
      }
      toast.success(
        `Berhasil menghapus ${deleteItem.type === "geo" ? "data geospatial" : "layer"
        }`
      );
      setDeleteConfirmOpen(false);
    } catch (error) {
      console.error("Gagal menghapus data:", error);
      toast.error("Gagal menghapus data.");
    } finally {
      setIsDeleting(false);
      setDeleteItem(null);
    }
  };

  // Layer ordering handler
  const handleMoveLayer = async (index, direction) => {
    if (!selectedDesa) return;

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
      await dataApi.reorderThematicMaps(selectedDesa, orders);
    } catch (error) {
      console.error("Gagal mengubah urutan layer:", error);
      toast.error("Gagal mengubah urutan layer.");
      // Revert on error
      loadMapData();
    }
  };

  // Handler for toggling layer active state
  const handleToggleLayer = async (id, checked) => {
    // Optimistic UI Update
    setLayerData((prev) =>
      prev.map((l) => (l.id === id ? { ...l, is_active: checked } : l))
    );
    try {
      const layer = layerData.find((l) => l.id === id);
      await dataApi.updateThematicMap(selectedDesa, id, {
        is_active: checked,
        layer_name: layer.layer_name || layer.name,
        layer_config: {
          color: layer.color || layer.layer_config?.color || "#FF0000",
        },
      });
    } catch (error) {
      // Revert if failed
      setLayerData((prev) =>
        prev.map((l) => (l.id === id ? { ...l, is_active: !checked } : l))
      );
      console.error("Update visibility failed:", error);
      toast.error("Gagal mengubah status layer.");
    }
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

  const handleFileUpload = async (e) => {
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

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDesa) return;

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    try {
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
            finalGeometry = currentItem.geojson_data;
          }
        } else {
          // Manual Mode
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
            const coordinates = polygonPoints.map((pt) => [pt[1], pt[0]]);
            if (formDataType === "boundary") coordinates.push(coordinates[0]);

            finalGeometry = {
              type: "FeatureCollection",
              features: [
                {
                  type: "Feature",
                  properties: { name: formDataName },
                  geometry: {
                    type:
                      formDataType === "boundary" ? "Polygon" : "LineString",
                    coordinates:
                      formDataType === "boundary" ? [coordinates] : coordinates,
                  },
                },
              ],
            };
          }
        }

        const payload = {
          name: formDataName,
          type:
            formDataType === "boundary"
              ? "Polygon"
              : formDataType === "line"
                ? "LineString"
                : "Point",
          geojson_data: finalGeometry,
          map_type: pickerMode === "upload" ? "geojson" : "manual_input",
        };

        if (modalType === "addGeo") {
          const created = await dataApi.createGeospatial(selectedDesa, payload);
          setGeospatialData([...geospatialData, created]);
        } else {
          const updated = await dataApi.updateGeospatial(
            selectedDesa,
            currentItem.id,
            payload
          );
          setGeospatialData(
            geospatialData.map((item) =>
              item.id === currentItem.id ? updated : item
            )
          );
        }
      } else if (modalType === "addLayer") {
        // In merged model, "adding a layer" means activating an existing inactive record
        const selectedGeoId = parseInt(formGeoId, 10);
        if (Number.isNaN(selectedGeoId)) {
          toast.error("Pilih data geospatial terlebih dahulu.");
          return;
        }
        // Update the existing record to set layer_name and activate it
        const payload = {
          layer_name: data.name,
          is_active: true,
          layer_config: { color: data.color || "#FF0000" },
        };
        const updated = await dataApi.updateThematicMap(
          selectedDesa,
          selectedGeoId,
          payload
        );
        // Move from geospatial to layer list
        setGeospatialData(geospatialData.filter((g) => g.id !== selectedGeoId));
        setLayerData([...layerData, updated]);
      } else if (modalType === "editLayer") {
        // Update layer name and color
        const payload = {
          layer_name: data.name,
          layer_config: { color: data.color || "#FF0000" },
        };
        const updated = await dataApi.updateThematicMap(
          selectedDesa,
          currentItem.id,
          payload
        );
        setLayerData(
          layerData.map((item) => (item.id === currentItem.id ? updated : item))
        );
      }
      setIsModalOpen(false);
      // Keep tab on layer page after layer operations
      if (modalType?.includes("Layer")) {
        setActiveMainTab("layer");
      }
      loadMapData(); // Refresh data
      toast.success("Data berhasil disimpan");
    } catch (error) {
      console.error("Gagal menyimpan data:", error);
      toast.error("Gagal menyimpan data. Pastikan data sudah benar.");
    }
  };

  useEffect(() => {
    if (isModalOpen && modalType?.includes("Layer")) {
      // In merged model, layer IS the data, so prefill with currentItem.id
      setFormGeoId(currentItem?.id ? currentItem.id.toString() : "");
    }
  }, [isModalOpen, modalType, currentItem]);

  const renderModalContent = () => {
    let title = "";
    let content = null;

    if (modalType?.includes("Geo")) {
      title =
        modalType === "addGeo"
          ? "Tambah Data Geospatial"
          : "Edit Data Geospatial";
      content = (
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

          <Tabs
            value={pickerMode}
            onValueChange={setPickerMode}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload">
                <FileJson className="mr-2 h-4 w-4" /> Upload File
              </TabsTrigger>
              <TabsTrigger value="manual">
                <MapPin className="mr-2 h-4 w-4" /> Gambar di Peta
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="pt-4 space-y-4">
              <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center bg-slate-50 hover:bg-slate-100 transition-colors">
                <Input
                  type="file"
                  accept=".geojson,.json"
                  onChange={handleFileUpload}
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

            <TabsContent value="manual" className="space-y-3 pt-2">
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
                {formDataType === "point" && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-[400] opacity-20">
                    <div className="w-4 h-4 border-l-2 border-t-2 border-black"></div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      );
    } else {
      title =
        modalType === "addLayer" ? "Tambah Layer Peta" : "Edit Layer Peta";

      // Filter to show only inactive data (not yet a layer)
      // In merged model: is_active=false means it's raw data, is_active=true means it's a layer
      const availableGeo = geospatialData.filter(
        (g) => !g.is_active && !g.is_visible
      );

      // For editing, include current layer in dropdown (it's the same record)
      const dropdownGeo =
        modalType === "editLayer" && currentItem
          ? [
            currentItem,
            ...availableGeo.filter((g) => g.id !== currentItem.id),
          ]
          : availableGeo;

      content = (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Nama Layer</Label>
            <Input name="name" defaultValue={currentItem?.name} required />
          </div>
          <div className="space-y-2">
            <Label>Nama Data</Label>
            <Select value={formGeoId} onValueChange={setFormGeoId} required>
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
            <Input type="hidden" name="geospatial_id" value={formGeoId} />
          </div>
          <div className="space-y-2">
            <Label>Warna (HEX)</Label>
            <Input
              name="color"
              defaultValue={currentItem?.color}
              placeholder="#FF0000"
              required
            />
          </div>
        </div>
      );
    }

    return (
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleFormSubmit}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          <div className="py-4">{content}</div>
          <DialogFooter>
            <DialogClose asChild>
              <Button
                className="bg-red-400 hover:bg-red-500 shadow-sm whitespace-nowrap text-white"
                variant="outline"
              >
                Batal
              </Button>
            </DialogClose>
            <Button
              className="bg-[#1C6EA4] hover:bg-[#154D71] shadow-sm whitespace-nowrap"
              type="submit"
            >
              Simpan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    );
  };

  const currentDesaName =
    villages.find((d) => String(d.id) === String(selectedDesa))?.name ||
    "Pilih Desa";

  return (
    <div className="space-y-6 w-full">
      {/* 1. PILIH DESA (Wajib) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Pilih Desa
          </CardTitle>
          <CardDescription>
            Pilih desa untuk mengelola data geospatial dan layer peta mereka.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center gap-3 text-slate-500">
              <Loader2 className="h-5 w-5 animate-spin" />
              Memuat daftar desa...
            </div>
          ) : (
            <Select onValueChange={setSelectedDesa} value={selectedDesa || ""}>
              <SelectTrigger className="w-full md:w-1/2">
                <SelectValue placeholder="Pilih desa..." />
              </SelectTrigger>
              <SelectContent>
                {villages.map((desa) => (
                  <SelectItem key={desa.id} value={String(desa.id)}>
                    {desa.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </CardContent>
      </Card>

      {/* KONTEN UTAMA - Hanya Tampil Jika Desa Dipilih */}
      {!selectedDesa ? (
        <div className="flex flex-col items-center justify-center h-[50vh] bg-slate-50 rounded-xl border border-dashed">
          <div className="p-4 bg-white rounded-full shadow-sm mb-3">
            <MapPin className="h-8 w-8 text-blue-500" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">
            Belum Ada Desa Dipilih
          </h3>
          <p className="text-slate-500 max-w-sm text-center mt-1">
            Silakan pilih desa pada menu dropdown di atas untuk mulai mengelola
            data peta.
          </p>
        </div>
      ) : loadingGeo ? (
        <div className="flex flex-col items-center justify-center h-[50vh] bg-slate-50 rounded-xl border border-dashed">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-3" />
          <p className="text-slate-500">Memuat data peta...</p>
        </div>
      ) : (
        <>
          {/* 1. Manajemen Data (CRUD) */}
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

            {/* TAB 1: DATA GEO */}
            <TabsContent value="geospatial">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Data Geospatial</CardTitle>
                    <CardDescription>
                      Sumber data mentah (GeoJSON).
                    </CardDescription>
                  </div>
                  <Button
                    size="sm"
                    className="bg-[#1C6EA4] hover:bg-[#154D71] shadow-sm whitespace-nowrap"
                    onClick={() => handleOpenModal("addGeo")}
                  >
                    <Plus className="mr-2 h-4 w-4" /> Tambah
                  </Button>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nama Data</TableHead>
                        <TableHead>Tipe</TableHead>
                        <TableHead>Sumber</TableHead>
                        <TableHead className="w-[150px] text-center">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {geospatialData.length > 0 ? (
                        geospatialData.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>
                              {item.data_name ||
                                item.map_name ||
                                `Data #${item.id}`}
                            </TableCell>
                            <TableCell>
                              <span className="uppercase text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded border">
                                {item.geometry_type || item.type || "-"}
                              </span>
                            </TableCell>
                            <TableCell className="text-xs text-gray-500">
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
                                  className="flex items-center justify-center gap-2 border border-rose-200 bg-rose-100 text-rose-700 hover:bg-rose-200 h-8 px-3 text-xs"
                                  onClick={() => handleDeleteClick("geo", item)}
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
                            className="text-center h-24 text-gray-500"
                          >
                            Belum ada data geospatial.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB 2: LAYER */}
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
                    className="bg-[#1C6EA4] hover:bg-[#154D71] shadow-sm whitespace-nowrap"
                    onClick={() => handleOpenModal("addLayer")}
                  >
                    <Plus className="mr-2 h-4 w-4" /> Buat Layer Baru
                  </Button>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[60px]">Urutan</TableHead>
                        <TableHead>Nama Layer</TableHead>
                        <TableHead>Nama Data</TableHead>
                        <TableHead>Tipe Geometri</TableHead>
                        <TableHead>Warna</TableHead>
                        <TableHead className="text-center">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {layerData.length > 0 ? (
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
                            <TableCell>
                              {item.layer_name ||
                                item.name ||
                                item.map_name ||
                                `Layer #${item.id}`}
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
                                  className="h-4 w-4 rounded-full border"
                                  style={{
                                    backgroundColor: item.color || "#FF0000",
                                  }}
                                />
                                {item.color || "#FF0000"}
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex items-center justify-center gap-3">
                                <div className="flex items-center gap-2 bg-slate-50 px-2 py-1 rounded-md border">
                                  <Switch
                                    checked={item.is_active !== false}
                                    onCheckedChange={(c) =>
                                      handleToggleLayer(item.id, c)
                                    }
                                    className="scale-75"
                                  />
                                  <span className="text-[10px] font-medium text-slate-600 uppercase">
                                    {item.is_active !== false
                                      ? "Aktif"
                                      : "Nonaktif"}
                                  </span>
                                </div>
                                <Button
                                  variant="default"
                                  size="sm"
                                  className="bg-[#1C6EA4] hover:bg-[#154D71] text-white h-8 px-3 text-xs"
                                  onClick={() =>
                                    handleOpenModal("editLayer", item)
                                  }
                                >
                                  Edit
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleDeleteClick("layer", item)
                                  }
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
                            className="text-center h-24 text-gray-500"
                          >
                            Belum ada layer peta.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* 2. Preview Peta */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Map className="h-5 w-5" />
                Preview Peta: {currentDesaName}
              </CardTitle>
              <CardDescription>
                Preview berdasarkan data di atas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                id="mapPreview"
                className="h-[400px] w-full rounded-md z-0"
              />
            </CardContent>
          </Card>
        </>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        {renderModalContent()}
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
