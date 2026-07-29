// src/pages/desa/ProfilUmumDesa.jsx
import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { dataApi } from "@/services/dataApi";
import { Edit, Save, X, MapPin, Users, Upload, Trash2 } from "lucide-react";

export default function ProfilUmumDesa() {
  const { activeVillageId } = useAuth();
  const [profile, setProfile] = useState({
    name: "",
    description: "",
    photoUrl: "",
    population: 0,
    district: "",
    regency: "",
    area: 0,
    villageCode: "",
  });
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editFormData, setEditFormData] = useState({
    description: "",
    population: 0,
    district: "",
    regency: "",
    area: 0,
    villageCode: "",
  });
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // ── Load profile ────────────────────────────────────────
  useEffect(() => {
    if (!activeVillageId) return;
    const load = async () => {
      setLoading(true);
      try {
        const data = await dataApi.getVillage(activeVillageId);
        const profileData = {
          name: data.name ?? "",
          description: data.description ?? "",
          photoUrl: data.photo_url ?? "",
          population: data.population ?? 0,
          district: data.district ?? "",
          regency: data.regency ?? "",
          area: data.area ?? 0,
          villageCode: data.code ?? data.village_code ?? "",
        };
        setProfile(profileData);
        setEditFormData({
          description: data.description ?? "",
          population: data.population ?? 0,
          district: data.district ?? "",
          regency: data.regency ?? "",
          area: data.area ?? 0,
          villageCode: data.code ?? data.village_code ?? "",
        });
      } catch (e) {
        console.error("Gagal memuat profil:", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [activeVillageId]);

  // ── Handlers ───────────────────────────────────────────
  const handleEdit = () => setEditMode(true);

  const handleCancel = () => {
    setEditMode(false);
    setEditFormData({
      description: profile.description,
      population: profile.population,
      district: profile.district,
      regency: profile.regency,
      area: profile.area,
      villageCode: profile.villageCode,
    });
    setUploadedImage(null);
    setImagePreview(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({ ...editFormData, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ukuran gambar terlalu besar. Maksimal 2MB.");
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("File harus berupa gambar (JPEG, PNG, atau WebP).");
      return;
    }

    setUploadedImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setUploadedImage(null);
    setImagePreview(null);
  };

  const handleSave = async () => {
    if (!activeVillageId) return;
    setSaving(true);
    try {
      let payload;

      // Sanitize numeric inputs (allow null for blank values)
      const populationInput = editFormData.population?.toString().trim();
      const sanitizedPopulation = populationInput ? (parseInt(populationInput.replace(/[^\d]/g, ""), 10) || 0) : null;

      const areaInput = editFormData.area?.toString().trim();
      const sanitizedArea = areaInput ? (parseFloat(areaInput.replace(",", ".")) || 0) : null;

      // If image is uploaded, use FormData
      if (uploadedImage) {
        payload = new FormData();
        payload.append("_method", "PUT"); // Required for Laravel to recognize PUT with file uploads
        payload.append("logo", uploadedImage);
        payload.append("description", editFormData.description || "");
        if (sanitizedPopulation !== null) {
          payload.append("population", sanitizedPopulation.toString());
        }
        payload.append("district", editFormData.district || "");
        payload.append("regency", editFormData.regency || "");
        if (sanitizedArea !== null) {
          payload.append("area", sanitizedArea.toString());
        }
        payload.append("code", editFormData.villageCode || "");
      } else {
        // Otherwise use regular JSON
        payload = {
          description: editFormData.description || null,
          population: sanitizedPopulation,
          district: editFormData.district || null,
          regency: editFormData.regency || null,
          area: sanitizedArea,
          code: editFormData.villageCode || null,
        };
      }

      await dataApi.updateVillageProfile(activeVillageId, payload);

      // Reload fresh data from API to ensure correct values
      const freshData = await dataApi.getVillage(activeVillageId);
      setProfile({
        name: freshData.name ?? "",
        description: freshData.description ?? "",
        photoUrl: freshData.photo_url ?? "",
        population: freshData.population ?? 0,
        district: freshData.district ?? "",
        regency: freshData.regency ?? "",
        area: freshData.area ?? 0,
        villageCode: freshData.code ?? freshData.village_code ?? "",
      });

      setEditMode(false);
      setUploadedImage(null);
      setImagePreview(null);
      toast.success("Profil desa berhasil diperbarui!");
    } catch (e) {
      console.error("Gagal menyimpan profil:", e);
      const errorMsg = e.response?.data?.message || e.response?.data?.error || "Gagal menyimpan profil. Silakan coba lagi.";
      toast.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  // ── Helper Functions ───────────────────────────────────
  const formatPopulation = (num) => {
    return num > 0 ? `${num.toLocaleString("id-ID")} jiwa` : "-";
  };

  const formatLocation = (district, regency) => {
    if (district && regency) return `${district}, ${regency}`;
    if (district) return district;
    if (regency) return regency;
    return "-";
  };

  // ── Render ─────────────────────────────────────────────
  if (loading)
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="text-center text-gray-500">Memuat profil…</div>
      </div>
    );

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Profil Desa</h1>
          <p className="text-sm text-gray-500">
            Informasi umum tentang desa Anda
          </p>
        </div>
        {!editMode && (
          <Button
            onClick={handleEdit}
            className="bg-[#1C6EA4] hover:bg-[#154D71]"
          >
            <Edit className="mr-2 h-4 w-4" /> Edit Profil
          </Button>
        )}
      </div>

      <Card className="shadow-sm border">
        <CardContent className="pt-6">
          {!editMode ? (
            // Display mode
            <div className="space-y-6">
              {/* Photo */}
              <div className="flex flex-col items-center gap-4 pb-6 border-b">
                {profile.photoUrl ? (
                  <img
                    src={profile.photoUrl}
                    alt="Foto Profil Desa"
                    className="w-40 h-40 object-cover rounded-full border-4 border-gray-200 shadow-md"
                  />
                ) : (
                  <div className="w-40 h-40 rounded-full border-4 border-gray-200 bg-gray-100 flex items-center justify-center">
                    <MapPin className="w-16 h-16 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Name */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-600 uppercase tracking-wide">
                  Nama Desa
                </label>
                <p className="text-2xl font-bold text-gray-800">
                  {profile.name || "-"}
                </p>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-600 uppercase tracking-wide">
                  Lokasi
                </label>
                <p className="text-lg text-gray-700 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  {formatLocation(profile.district, profile.regency)}
                </p>
              </div>

              {/* Population */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-600 uppercase tracking-wide">
                  Jumlah Penduduk
                </label>
                <p className="text-lg text-gray-700 flex items-center gap-2">
                  <Users className="w-5 h-5 text-green-600" />
                  {formatPopulation(profile.population)}
                </p>
              </div>

              {/* Area */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-600 uppercase tracking-wide">
                  Luas Wilayah
                </label>
                <p className="text-lg text-gray-700">
                  {profile.area > 0 ? `${profile.area.toFixed(2)} km²` : "-"}
                </p>
              </div>

              {/* Village Code */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-600 uppercase tracking-wide">
                  Kode Wilayah
                </label>
                <p className="text-lg text-gray-700">
                  {profile.villageCode || "-"}
                </p>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-600 uppercase tracking-wide">
                  Deskripsi
                </label>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {profile.description || "Belum ada deskripsi"}
                </p>
              </div>
            </div>
          ) : (
            // Edit mode
            <div className="space-y-6">
              {/* Image Upload */}
              <div className="flex flex-col items-center gap-4 pb-6 border-b">
                <div className="w-40 h-40 rounded-full border-4 border-[#1C6EA4] bg-gray-100 flex items-center justify-center overflow-hidden">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : profile.photoUrl ? (
                    <img
                      src={profile.photoUrl}
                      alt="Foto Profil Desa"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <MapPin className="w-16 h-16 text-gray-400" />
                  )}
                </div>
                <div className="flex gap-2">
                  <label htmlFor="image-upload">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        document.getElementById("image-upload").click()
                      }
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      {uploadedImage || profile.photoUrl
                        ? "Ganti Gambar"
                        : "Upload Gambar"}
                    </Button>
                  </label>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  {(imagePreview || uploadedImage) && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={handleRemoveImage}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  Format: JPEG, PNG, WebP. Maksimal 2MB
                </p>
              </div>

              {/* Location - District and Regency */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Kecamatan
                  </label>
                  <Input
                    name="district"
                    value={editFormData.district}
                    onChange={handleChange}
                    placeholder="Contoh: Rantepao"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Kabupaten
                  </label>
                  <Input
                    name="regency"
                    value={editFormData.regency}
                    onChange={handleChange}
                    placeholder="Contoh: Toraja Utara"
                  />
                </div>
              </div>

              {/* Population */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Jumlah Penduduk (Jiwa)
                </label>
                <Input
                  type="number"
                  name="population"
                  value={editFormData.population}
                  onChange={handleChange}
                  min="0"
                  placeholder="Contoh: 6234"
                />
              </div>

              {/* Area */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Luas Wilayah (km²)
                </label>
                <Input
                  type="number"
                  name="area"
                  value={editFormData.area}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder="Contoh: 45.50"
                />
              </div>

              {/* Village Code */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Kode Wilayah
                </label>
                <Input
                  type="text"
                  name="villageCode"
                  value={editFormData.villageCode}
                  onChange={handleChange}
                  placeholder="Contoh: 7301012001"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Deskripsi
                </label>
                <Textarea
                  name="description"
                  value={editFormData.description}
                  onChange={handleChange}
                  rows={6}
                  placeholder="Tuliskan deskripsi singkat tentang desa Anda..."
                  className="resize-none"
                />
              </div>

              {/* Action buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  <X className="mr-2 h-4 w-4" /> Batal
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-[#1C6EA4] hover:bg-[#154D71]"
                >
                  {saving ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span> Menyimpan…
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" /> Simpan Perubahan
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
