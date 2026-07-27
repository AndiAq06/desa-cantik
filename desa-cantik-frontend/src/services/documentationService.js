import { apiClient } from './apiClient';

export const documentationService = {
  async getVillageDocumentation(villageId) {
    const response = await apiClient.get(`/villages/${villageId}/documentation`);
    return response.data;
  },
};
