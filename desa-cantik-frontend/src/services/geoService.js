import { apiClient } from "./apiClient.js";

/**
 * Geo Service - Unified service for all map-related data
 * Note: geospatial_data has been merged into thematic_maps
 */
export const geoService = {
  /**
   * Get all map layers for a village (includes both thematic and geospatial types)
   */
  async getLayersByVillage(villageId) {
    try {
      const response = await apiClient.get(
        `/villages/${villageId}/thematic-maps`
      );
      return response.data || [];
    } catch (error) {
      console.error("Failed to fetch thematic maps:", error);
      return [];
    }
  },

  /**
   * @deprecated Use getLayersByVillage instead
   * Kept for backwards compatibility - returns data from thematic-maps endpoint
   */
  async getGeospatialByVillage(villageId) {
    console.warn(
      "geoService.getGeospatialByVillage is deprecated. Use getLayersByVillage instead."
    );
    return this.getLayersByVillage(villageId);
  },

  /**
   * Add a new map layer (thematic or geospatial)
   * @param {object} data - { name, map_type, geometry_type, features, color, ... }
   */
  async addLayer(villageId, data) {
    const response = await apiClient.post(
      `/villages/${villageId}/thematic-maps`,
      data
    );
    return response.data;
  },

  /**
   * @deprecated Use addLayer with map_type='geospatial' instead
   */
  async addGeospatial(villageId, data) {
    console.warn(
      'geoService.addGeospatial is deprecated. Use addLayer with map_type="geospatial" instead.'
    );
    return this.addLayer(villageId, {
      ...data,
      map_type: "geospatial",
      geometry_type: data.type || data.geometry_type,
      features: data.geojson_data || data.geometry,
    });
  },

  /**
   * Update an existing map layer
   */
  async updateLayer(villageId, mapId, updates) {
    const response = await apiClient.put(
      `/villages/${villageId}/thematic-maps/${mapId}`,
      updates
    );
    return response.data;
  },

  /**
   * Delete a map layer
   */
  async deleteLayer(villageId, mapId) {
    return await apiClient.delete(
      `/villages/${villageId}/thematic-maps/${mapId}`
    );
  },

  /**
   * @deprecated Use deleteLayer instead
   */
  async deleteGeospatial(villageId, geoId) {
    console.warn(
      "geoService.deleteGeospatial is deprecated. Use deleteLayer instead."
    );
    return this.deleteLayer(villageId, geoId);
  },
};
