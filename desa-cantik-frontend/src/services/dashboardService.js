import { apiClient } from "./apiClient.js";

/**
 * Ubah respons backend dari snake_case menjadi camelCase untuk React
 */
const transformAdminDashboard = (data) => {
  return {
    summary: {
      totalVillages: data.summary?.total_villages ?? 0,
      activeVillages: data.summary?.active_villages ?? 0,
      inactiveVillages: data.summary?.inactive_villages ?? 0,
      totalUsers: data.summary?.total_users ?? 0,
      admin_count: data.summary?.admin_count ?? 0,
      village_officer_count: data.summary?.village_officer_count ?? 0,
      activeUsers: data.summary?.active_users ?? 0,
      totalStatistics: data.summary?.total_statistics ?? 0,
      totalPublications: data.summary?.total_publications ?? 0,
      totalThematicMaps: data.summary?.total_thematic_maps ?? 0,
    },
    publicationStatus: (data.publication_status || []).map((item) => ({
      status: item.status,
      count: item.count,
      color: item.color,
    })),
    publicationCategories: (data.publication_categories || []).map((item) => ({
      category: item.category,
      count: item.count,
      color: item.color,
    })),
    recentActivities: (data.recent_activities || []).map((activity) => ({
      id: activity.id,
      user: activity.user,
      action: activity.action,
      description: activity.description,
      timestamp: activity.timestamp,
    })),
    villagesStatistics: (data.villages_statistics || []).map((village) => ({
      villageName: village.village_name,
      statisticsCount: village.statistics_count,
      publicationsCount: village.publications_count,
      lastUpdated: village.last_updated,
    })),
    monthlyActivities: (data.monthly_activities || []).map((month) => ({
      month: month.month,
      statisticsCreated: month.statistics_created,
      statisticsUpdated: month.statistics_updated,
      publicationsUploaded: month.publications_uploaded,
    })),
  };
};

const transformVillageDashboard = (data) => {
  return {
    village: {
      id: data.village?.id,
      name: data.village?.name,
      code: data.village?.code,
    },
    summary: {
      totalStatistics: data.summary?.total_statistics ?? 0,
      statisticsThisYear: data.summary?.statistics_this_year ?? 0,
      totalPublications: data.summary?.total_publications ?? 0,
      publicationsThisYear: data.summary?.publications_this_year ?? 0,
      thematicMaps: data.summary?.thematic_maps ?? 0,
      mapPoints: data.summary?.map_points ?? 0,
      lastUpdate: data.summary?.last_update,
    },
    recentActivities: (data.recent_activities || []).map((activity) => ({
      id: activity.id,
      user: activity.user,
      action: activity.action,
      description: activity.description,
      timestamp: activity.timestamp,
    })),
    statisticsByCategory: (data.statistics_by_category || []).map((cat) => ({
      category: cat.category,
      count: cat.count,
    })),
    profileCompleteness: data.profile_completeness ?? 0,
  };
};

const transformPublicDashboard = (data) => {
  return {
    summary: {
      totalVillages: data.summary?.total_villages ?? 0,
      totalPublications: data.summary?.total_publications ?? 0,
      totalStatistics: data.summary?.total_statistics ?? 0,
      lastUpdate: data.summary?.last_update,
    },
    featuredVillages: (data.featured_villages || []).map((village) => ({
      id: village.id,
      name: village.name,
      description: village.description,
      statisticsCount: village.statistics_count,
      publicationsCount: village.publications_count,
    })),
    latestPublications: (data.latest_publications || []).map((pub) => ({
      id: pub.id,
      title: pub.title,
      villageName: pub.village_name,
      publishedAt: pub.published_at,
    })),
    statisticsOverview: data.statistics_overview || {},
  };
};

export const dashboardService = {
  /**
   * Dapatkan Dasbor Admin BPS
   * Memerlukan: peran bps_admin
   */
  async getAdminDashboard() {
    try {
      const response = await apiClient.get("/dashboard/admin");
      return transformAdminDashboard(response.data);
    } catch (error) {
      console.error("Gagal mengambil dasbor admin:", error);
      throw error;
    }
  },

  /**
   * Dapatkan Dasbor Desa
   * Memerlukan: peran village_officer ATAU bps_admin dengan parameter village_id
   * @param {number|null} villageId - ID desa opsional untuk admin BPS
   */
  async getVillageDashboard(villageId = null) {
    try {
      const params = villageId ? { village_id: villageId } : {};
      const response = await apiClient.get("/dashboard/village", { params });
      return transformVillageDashboard(response.data);
    } catch (error) {
      console.error("Gagal mengambil dasbor desa:", error);
      throw error;
    }
  },

  /**
   * Dapatkan Dasbor Publik (Halaman Arahan)
   * Tidak memerlukan autentikasi
   */
  async getPublicDashboard() {
    try {
      const response = await apiClient.get("/dashboard/public");
      return transformPublicDashboard(response.data);
    } catch (error) {
      console.error("Gagal mengambil dasbor publik:", error);
      throw error;
    }
  },
};
