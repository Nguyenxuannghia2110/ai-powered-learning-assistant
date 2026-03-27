import axiosInstance from "../api/axiosInstance";
import { API_PATHS } from "../api/apiPaths";

const getDashboard = async () => {
  const response = await axiosInstance.get(API_PATHS.PROGRESS.GET_DASHBOARD);

  return response.data;
};

export default {
  getDashboard,
};
