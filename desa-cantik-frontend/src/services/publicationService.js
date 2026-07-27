import { apiClient } from "./apiClient.js";

export const publicationService = {
  async getPublications(villageId, params = {}) {
    const response = await apiClient.get(
      `/villages/${villageId}/publications`,
      { params }
    );
    return response.data;
  },

  async getPublicationById(publicationId) {
    const response = await apiClient.get(`/publications/${publicationId}`);
    return response.data;
  },

  async createPublication(villageId, formData) {
    const response = await apiClient.post(
      `/villages/${villageId}/publications`,
      formData
    );
    return response.data;
  },

  async updatePublication(villageId, publicationId, data) {
    const response = await apiClient.put(
      `/villages/${villageId}/publications/${publicationId}`,
      data
    );
    return response.data;
  },

  // Hapus
  async deletePublication(villageId, publicationId) {
    return await apiClient.delete(
      `/villages/${villageId}/publications/${publicationId}`
    );
  },

  // Unduh File
  async downloadPublication(publicationId) {
    // Gunakan URL langsung untuk memicu unduhan browser
    const baseUrl =
      import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";
    const downloadUrl = `${baseUrl}/publications/${publicationId}/download`;

    // Buka di tab baru untuk memicu unduhan
    window.open(downloadUrl, "_blank");
  },
};
