import { dataApi } from './dataApi';

export const villageService = {
  async getAllVillages(params) {
    const response = await dataApi.listVillages(params);
    return response.items;
  },

  async getVillageById(id) {
    return dataApi.getVillage(id);
  },
};
