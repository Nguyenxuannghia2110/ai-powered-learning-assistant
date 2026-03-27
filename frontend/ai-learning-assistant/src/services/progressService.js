import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";

/* =========================
   PROGRESS / DASHBOARD
========================= */

/**
 * Get dashboard statistics
 * - overview counts
 * - flashcard statistics
 * - quiz statistics
 * - recent activity
 * - study streak (simplified)
 */
export const getDashboardData = async () => {
  try {
    const response = await axiosInstance.get(
      API_PATHS.PROGRESS.GET_DASHBOARD
    );
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        message: "Failed to load dashboard data",
      }
    );
  }
};

const progressService = {
    getDashboardData,
};

export default progressService;
