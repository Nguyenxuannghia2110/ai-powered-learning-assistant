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
    const [docs, quizzes, workspaces, flashcards] = await Promise.all([
      axiosInstance.get(`/api/admin/documents?limit=${limit}`),
      axiosInstance.get(`/api/admin/quizzes?limit=${limit}`),
      axiosInstance.get(`/api/admin/topics?limit=${limit}`),
      axiosInstance.get(`/api/admin/flashcards?limit=${limit}`)
    ]);

    return {
      success: true,
      data: {
        documents: docs.data?.data?.documents || [],
        quizzes: quizzes.data?.data?.quizzes || [],
        workspaces: workspaces.data?.data?.topics || [],
        flashcards: flashcards.data?.data?.flashcards || []
      }
    };
  },

  deleteContent: async (type, id) => {
    const typeMap = {
      document: 'documents',
      quiz: 'quizzes',
      flashcard: 'flashcards',
      workspace: 'topics',
      topic: 'topics'
    };
    
    const route = typeMap[type] || type;
    const response = await axiosInstance.delete(`/api/admin/${route}/${id}`);
    return response.data;
  }
};

export default adminService;
