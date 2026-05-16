import axiosInstance from "../utils/axiosInstance";

const adminService = {
  getStats: async () => {
    const response = await axiosInstance.get("/api/admin/stats");
    return response.data;
  },

  getUsers: async (page = 1, limit = 10, search = "") => {
    const response = await axiosInstance.get(
      `/api/admin/users?page=${page}&limit=${limit}&search=${search}`
    );
    return response.data;
  },

  getUserById: async (id) => {
    const response = await axiosInstance.get(`/api/admin/users/${id}`);
    return response.data;
  },

  updateUserStatus: async (id, status) => {
    const response = await axiosInstance.put(`/api/admin/users/${id}/status`, { status });
    return response.data;
  },

  updateUserRole: async (id, role) => {
    const response = await axiosInstance.put(`/api/admin/users/${id}/role`, { role });
    return response.data;
  },

  getRecentContent: async (limit = 10) => {
    const response = await axiosInstance.get(`/api/admin/content?limit=${limit}`);
    return response.data;
  },

  deleteContent: async (type, id) => {
    const response = await axiosInstance.delete(`/api/admin/content/${type}/${id}`);
    return response.data;
  }
};

export default adminService;
