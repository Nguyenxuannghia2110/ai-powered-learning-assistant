import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    // Read token from localStorage (assuming auth is shared or admin has separate login)
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      const { token, accessToken } = JSON.parse(userInfo);
      const authToken = token || accessToken;
      if (authToken) {
        config.headers.Authorization = `Bearer ${authToken}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Admin API endpoints
export const adminService = {
  // Users
  getUsers: (params) => api.get('/admin/users', { params }),
  createUser: (data) => api.post('/admin/users', data),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  updateUserStatus: (id, status) => api.patch(`/admin/users/${id}/status`, { status }),
  resetUserPassword: (id, newPassword) => api.post(`/admin/users/${id}/reset-password`, { newPassword }),
  
  // Content Management
  getDashboardStats: () => api.get('/admin/dashboard/stats'),
  getDocuments: (params) => api.get('/admin/documents', { params }),
  deleteDocument: (id) => api.delete(`/admin/documents/${id}`),
  getQuizzes: (params) => api.get('/admin/quizzes', { params }),
  deleteQuiz: (id) => api.delete(`/admin/quizzes/${id}`),
  getFlashcards: (params) => api.get('/admin/flashcards', { params }),
  deleteFlashcard: (id) => api.delete(`/admin/flashcards/${id}`),
  getTopics: (params) => api.get('/admin/topics', { params }),
  deleteTopic: (id) => api.delete(`/admin/topics/${id}`),
  getAILogs: (params) => api.get('/admin/ai-logs', { params }),
};

export default api;
