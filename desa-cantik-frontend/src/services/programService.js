import { apiClient } from './apiClient';

export const programService = {
  async getContent() {
    const response = await apiClient.get('/program/content');
    return response.data;
  },
};
