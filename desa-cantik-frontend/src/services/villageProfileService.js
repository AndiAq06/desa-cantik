import { apiClient } from "./apiClient";

export const villageProfileService = {
  async getProfile(villageId) {
    const response = await apiClient.get(`/villages/${villageId}/profile`);
    return response.data;
  },

  async updateProfile(villageId, formData) {
    formData.append("_method", "PUT");
    const response = await apiClient.post(
      `/villages/${villageId}/profile`,
      formData
    );
    return response.data;
  },
};
