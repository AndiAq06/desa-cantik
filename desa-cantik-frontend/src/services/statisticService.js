import { apiClient } from "./apiClient.js";

export const statisticService = {
  async getStatisticsByVillage(villageId, params = {}) {
    try {
      const response = await apiClient.get(
        `/villages/${villageId}/statistics`,
        { params }
      );
      return response.data || [];
    } catch (error) {
      console.error("Failed to fetch village statistics:", error);
      return [];
    }
  },

  async getStatisticTypes() {
    try {
      const response = await apiClient.get("/statistic-types");
      return response.data || [];
    } catch (error) {
      console.error("Failed to fetch statistic types:", error);
      return [];
    }
  },
};
