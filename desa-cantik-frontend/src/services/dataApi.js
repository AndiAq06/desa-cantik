import { apiClient } from "./apiClient";

const handleResponse = (response) => response?.data ?? null;
const handleListResponse = (response) => ({
  items: response?.data ?? [],
  meta: response?.meta ?? null,
});

export const dataApi = {
  // --- Villages ---
  async listVillages(params = {}) {
    const res = await apiClient.get("/villages", { params });
    return handleListResponse(res);
  },

  async createVillage(payload) {
    const res = await apiClient.post("/villages", payload);
    return handleResponse(res);
  },

  async updateVillage(id, payload) {
    const res = await apiClient.put(`/villages/${id}`, payload);
    return handleResponse(res);
  },

  async toggleVillageStatus(id, isActive) {
    const res = await apiClient.put(`/villages/${id}/toggle-status`, {
      is_active: isActive,
    });
    return handleResponse(res);
  },

  async deleteVillage(id) {
    return apiClient.delete(`/villages/${id}`);
  },

  async getVillage(id) {
    const res = await apiClient.get(`/villages/${id}`);
    return handleResponse(res);
  },

  async updateVillageProfile(id, payload) {
    const isFormData = payload instanceof FormData;

    if (isFormData) {
      const res = await apiClient.post(`/villages/${id}/profile`, payload);
      return handleResponse(res);
    } else {
      const res = await apiClient.put(`/villages/${id}/profile`, payload);
      return handleResponse(res);
    }
  },

  // --- Publications ---
  async getPublications(villageId) {
    const res = await apiClient.get(`/villages/${villageId}/publications`);
    return handleResponse(res);
  },

  async listPublications(villageId, params = {}) {
    const res = await apiClient.get(`/villages/${villageId}/publications`, {
      params,
    });
    return handleListResponse(res);
  },

  async createPublication(villageId, payload) {
    const res = await apiClient.post(
      `/villages/${villageId}/publications`,
      payload
    );
    return handleResponse(res);
  },

  async updatePublication(villageId, publicationId, payload) {
    const res = await apiClient.put(
      `/villages/${villageId}/publications/${publicationId}`,
      payload
    );
    return handleResponse(res);
  },

  async replacePublicationFile(villageId, publicationId, file) {
    const formData = new FormData();
    formData.append("file", file);
    const res = await apiClient.post(
      `/villages/${villageId}/publications/${publicationId}/replace-file`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return handleResponse(res);
  },

  async deletePublication(villageId, publicationId) {
    const res = await apiClient.delete(
      `/villages/${villageId}/publications/${publicationId}`
    );
    return handleResponse(res);
  },

  // --- Statistics ---
  async listStatistics(villageId, params = {}) {
    const res = await apiClient.get(`/villages/${villageId}/statistics`, {
      params,
    });
    return handleListResponse(res);
  },

  async createStatistic(villageId, payload) {
    const res = await apiClient.post(
      `/villages/${villageId}/statistics`,
      payload
    );
    return handleResponse(res);
  },

  async updateStatistic(villageId, statisticId, payload) {
    let method = "put";
    let data = payload;
    const url = `/villages/${villageId}/statistics/${statisticId}`;

    if (payload instanceof FormData) {
      method = "post";
      payload.append("_method", "PUT");
      data = payload;
    }

    const res = await apiClient.request(method, url, { data });
    return handleResponse(res);
  },

  async deleteStatistic(villageId, statisticId) {
    const res = await apiClient.delete(
      `/villages/${villageId}/statistics/${statisticId}`
    );
    return handleResponse(res);
  },

  async approveStatistic(villageId, statisticId) {
    const res = await apiClient.put(
      `/villages/${villageId}/statistics/${statisticId}/approve`
    );
    return handleResponse(res);
  },

  async rejectStatistic(villageId, statisticId, reason = "") {
    const res = await apiClient.put(
      `/villages/${villageId}/statistics/${statisticId}/reject`,
      { reason }
    );
    return handleResponse(res);
  },

  async listAllStatistics(params = {}) {
    const res = await apiClient.get("/statistics", { params });
    return handleListResponse(res);
  },

  async importStatistics(villageId, payload) {
    const res = await apiClient.post(
      `/villages/${villageId}/statistics/import`,
      payload,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return handleResponse(res);
  },

  // Get active statistic modules for a specific village (for Subject dropdown)
  async listStatisticModules(villageId) {
    const res = await apiClient.get(`/villages/${villageId}/statistic-modules`);
    return handleResponse(res) ?? [];
  },

  // --- Geospatial ---
  // NOTE: geospatial_data has been merged into thematic_maps
  // These methods now redirect to thematic-maps endpoint

  /**
   * @deprecated Use listThematicMaps instead
   */
  async listGeospatial(villageId) {
    console.warn(
      "dataApi.listGeospatial is deprecated. Use listThematicMaps instead."
    );
    // Return thematic maps that have map_type='geospatial' or have features
    const res = await apiClient.get(`/villages/${villageId}/thematic-maps`);
    const data = handleResponse(res) ?? [];
    // Filter to only geospatial type for backwards compatibility
    return data.filter(
      (item) => item.map_type === "geospatial" || item.geometry_type
    );
  },

  /**
   * @deprecated Use getThematicMap instead
   */
  async getGeospatial(villageId, geoId) {
    console.warn(
      "dataApi.getGeospatial is deprecated. Use getThematicMap instead."
    );
    const res = await apiClient.get(`/thematic-maps/${geoId}`);
    return handleResponse(res);
  },

  /**
   * @deprecated Use createThematicMap with map_type='geospatial' instead
   */
  async createGeospatial(villageId, payload) {
    console.warn(
      "dataApi.createGeospatial is deprecated. Use createThematicMap instead."
    );
    // Transform payload to thematic-maps format
    // Set is_active: false so new geospatial data doesn't automatically show as layer
    const transformedPayload = {
      name: payload.name || payload.description || "Data Geospatial",
      description: payload.description || payload.name,
      map_type:
        payload.map_type ||
        (payload.data_source === "manual_draw" ? "manual_input" : "geojson"),
      geometry_type: payload.type || payload.geometry_type,
      features: payload.geojson_data || payload.geometry || payload.features,
      is_active: false, // New geospatial data is inactive until user creates a layer
    };
    const res = await apiClient.post(
      `/villages/${villageId}/thematic-maps`,
      transformedPayload
    );
    return handleResponse(res);
  },

  /**
   * @deprecated Use updateThematicMap instead
   */
  async updateGeospatial(villageId, geoId, payload) {
    console.warn(
      "dataApi.updateGeospatial is deprecated. Use updateThematicMap instead."
    );
    const transformedPayload = {
      name: payload.name || payload.description,
      description: payload.description || payload.name,
      geometry_type: payload.type || payload.geometry_type,
      map_type:
        payload.map_type ||
        (payload.data_source === "manual_draw" ? "manual_input" : "geojson"),
      features: payload.geojson_data || payload.geometry || payload.features,
    };
    const res = await apiClient.put(
      `/villages/${villageId}/thematic-maps/${geoId}`,
      transformedPayload
    );
    return handleResponse(res);
  },

  /**
   * @deprecated Use deleteThematicMap instead
   */
  async deleteGeospatial(villageId, geoId) {
    console.warn(
      "dataApi.deleteGeospatial is deprecated. Use deleteThematicMap instead."
    );
    const res = await apiClient.delete(
      `/villages/${villageId}/thematic-maps/${geoId}`
    );
    return handleResponse(res);
  },

  // --- Thematic Maps ---
  async listThematicMaps(villageId) {
    const res = await apiClient.get(`/villages/${villageId}/thematic-maps`);
    return handleResponse(res) ?? [];
  },

  async getThematicMaps(villageId) {
    const res = await apiClient.get(`/villages/${villageId}/thematic-maps`);
    return handleResponse(res) ?? [];
  },

  async getThematicMap(mapId) {
    const res = await apiClient.get(`/thematic-maps/${mapId}`);
    return handleResponse(res);
  },

  async createThematicMap(villageId, payload) {
    const res = await apiClient.post(
      `/villages/${villageId}/thematic-maps`,
      payload
    );
    return handleResponse(res);
  },

  async updateThematicMap(villageId, mapId, payload) {
    const res = await apiClient.put(
      `/villages/${villageId}/thematic-maps/${mapId}`,
      payload
    );
    return handleResponse(res);
  },

  async deleteThematicMap(villageId, mapId) {
    const res = await apiClient.delete(
      `/villages/${villageId}/thematic-maps/${mapId}`
    );
    return handleResponse(res);
  },

  async reorderThematicMaps(villageId, orders) {
    const res = await apiClient.patch(
      `/villages/${villageId}/thematic-maps/reorder`,
      { orders }
    );
    return handleResponse(res);
  },

  // --- Dashboard ---
  async dashboardAdmin() {
    const res = await apiClient.get("/dashboard/admin");
    return handleResponse(res);
  },

  async dashboardVillage(villageId) {
    const res = await apiClient.get("/dashboard/village", {
      params: { village_id: villageId },
    });
    return handleResponse(res);
  },

  // --- User / Password ---
  async updatePassword(currentPassword, newPassword) {
    const res = await apiClient.put("/auth/password", {
      current_password: currentPassword,
      new_password: newPassword,
      new_password_confirmation: newPassword,
    });
    return handleResponse(res);
  },

  async resetUserPassword(userId, newPassword) {
    const res = await apiClient.put(`/users/${userId}/reset-password`, {
      password: newPassword,
      password_confirmation: newPassword,
    });
    return handleResponse(res);
  },

  async updateStatistic(villageId, statisticId, payload) {
    let method = "put";
    let data = payload;
    const url = `/villages/${villageId}/statistics/${statisticId}`;

    if (payload instanceof FormData) {
      method = "post";
      payload.append("_method", "PUT");
      data = payload;
    }

    const res = await apiClient.request(method, url, { data });
    return handleResponse(res);
  },

  // --- Documentation ---
  async listDocumentation(villageId) {
    const res = await apiClient.get(`/villages/${villageId}/documentation`);
    return handleResponse(res) ?? [];
  },

  async uploadDocumentation(villageId, payload) {
    const res = await apiClient.post(
      `/villages/${villageId}/documentation`,
      payload
    );
    return handleResponse(res);
  },

  async deleteDocumentation(villageId, docId) {
    const res = await apiClient.delete(
      `/villages/${villageId}/documentation/${docId}`
    );
    return handleResponse(res);
  },

  async listUsers(params = {}) {
    const res = await apiClient.get("/users", { params });
    return handleListResponse(res);
  },

  // --- Layanan Online (Public) ---
  async createSuratPengantar(villageId, payload) {
    const res = await apiClient.post(`/villages/${villageId}/layanan-online/surat-pengantar`, payload);
    return handleResponse(res);
  },

  async checkSuratStatus(villageId, nik) {
    const res = await apiClient.get(`/villages/${villageId}/layanan-online/status-pengantar`, {
      params: { nik },
    });
    return handleResponse(res);
  },

  async createPengaduan(villageId, payload) {
    const isFormData = payload instanceof FormData;
    const headers = isFormData ? {} : { "Content-Type": "application/json" };
    const res = await apiClient.post(`/villages/${villageId}/layanan-online/pengaduan`, payload, { headers });
    return handleResponse(res);
  },

  async checkPengaduanStatus(villageId, email) {
    const res = await apiClient.get(`/villages/${villageId}/layanan-online/status-pengaduan`, {
      params: { email },
    });
    return handleResponse(res);
  },

  async createBukuTamu(villageId, payload) {
    const res = await apiClient.post(`/villages/${villageId}/layanan-online/buku-tamu`, payload);
    return handleResponse(res);
  },

  async getBukuTamu(villageId) {
    const res = await apiClient.get(`/villages/${villageId}/layanan-online/buku-tamu`);
    return handleResponse(res);
  },

  // --- Layanan Online (Admin/Village Officer) ---
  async adminGetSuratPengantar(villageId, params = {}) {
    const res = await apiClient.get(`/villages/${villageId}/layanan-online/admin/surat-pengantar`, { params });
    return handleListResponse(res);
  },

  async adminUpdateSuratPengantar(villageId, id, payload) {
    const res = await apiClient.put(`/villages/${villageId}/layanan-online/admin/surat-pengantar/${id}`, payload);
    return handleResponse(res);
  },

  async adminGetPengaduan(villageId, params = {}) {
    const res = await apiClient.get(`/villages/${villageId}/layanan-online/admin/pengaduan`, { params });
    return handleListResponse(res);
  },

  async adminUpdatePengaduan(villageId, id, payload) {
    const res = await apiClient.put(`/villages/${villageId}/layanan-online/admin/pengaduan/${id}`, payload);
    return handleResponse(res);
  },

  async adminGetBukuTamu(villageId) {
    const res = await apiClient.get(`/villages/${villageId}/layanan-online/admin/buku-tamu`);
    return handleResponse(res);
  },
};
