import apiClient, { handleApiError } from "./api.config";

export const fetchDashboardSummary = async (params = {}) => {
  try {
    const response = await apiClient.get("/dashboard/summary", { params });
    return response.data;
  } catch (error) {
    throw handleApiError(error, "fetchDashboardSummary");
  }
};

export const fetchDashboardActivity = async (params = {}) => {
  try {
    const response = await apiClient.get("/dashboard/activity", { params });
    return response.data;
  } catch (error) {
    throw handleApiError(error, "fetchDashboardActivity");
  }
};
