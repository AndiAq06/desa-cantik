import { apiClient } from "./apiClient";

/**
 * Layanan API Anggota Tim
 */
const teamApi = {
  /**
   * Dapatkan semua anggota tim
   * @param {Object} params - Parameter pertanyaan
   * @param {boolean} params.include_inactive - Sertakan anggota tidak aktif (hanya admin)
   * @returns {Promise<Array>} Array anggota tim
   */
  async listTeamMembers(params = {}) {
    const response = await apiClient.get("/team-members", { params });
    return response.data || [];
  },

  /**
   * Dapatkan anggota tim tunggal
   * @param {number} id - ID anggota tim
   * @returns {Promise<Object>} Data anggota tim
   */
  async getTeamMember(id) {
    const response = await apiClient.get(`/team-members/${id}`);
    return response.data;
  },

  /**
   * Buat anggota tim baru
   * @param {Object} data - Data anggota tim
   * @param {string} data.name - Nama anggota
   * @param {string} data.role - Peran anggota
   * @param {string} [data.email] - Alamat email
   * @param {string} [data.phone] - Nomor telepon
   * @param {string} [data.photo_url] - URL foto
   * @param {number} [data.display_order] - Urutan tampilan
   * @param {boolean} [data.is_active] - Status aktif
   * @returns {Promise<Object>} Anggota tim yang dibuat
   */
  async createTeamMember(data) {
    const response = await apiClient.post("/team-members", data);
    return response.data;
  },

  /**
   * Perbarui anggota tim
   * @param {number} id - ID anggota tim
   * @param {Object} data - Data yang diperbarui
   * @returns {Promise<Object>} Anggota tim yang diperbarui
   */
  async updateTeamMember(id, data) {
    if (data instanceof FormData) {
      data.append("_method", "PUT");
      const response = await apiClient.post(`/team-members/${id}`, data);
      return response.data;
    }
    const response = await apiClient.put(`/team-members/${id}`, data);
    return response.data;
  },

  /**
   * Hapus anggota tim
   * @param {number} id - ID anggota tim
   * @returns {Promise<void>}
   */
  async deleteTeamMember(id) {
    const response = await apiClient.delete(`/team-members/${id}`);
    return response.data;
  },
};

export { teamApi };
export default teamApi;
