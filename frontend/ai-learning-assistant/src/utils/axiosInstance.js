import axios from "axios";

/* ================= CREATE INSTANCE ================= */
const axiosInstance = axios.create({
  baseURL: "http://localhost:8000/",
  withCredentials: true,
});

/* ================= REQUEST ================= */
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

/* ================= REFRESH LOGIC ================= */
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });

  failedQueue = [];
};

/* ================= RESPONSE ================= */
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // ❌ Network error
    if (!error.response) {
      console.error("❌ Network error");
      return Promise.reject({
        message: "Không thể kết nối server",
      });
    }

    const { status, data } = error.response;

    /* ================= 401: TOKEN EXPIRED ================= */
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axiosInstance(originalRequest);
        });
      }

      isRefreshing = true;

      try {
        const res = await axios.post(
          "http://localhost:8000/api/auth/refresh-token",
          {},
          { withCredentials: true },
        );

        const newAccessToken = res.data.data.accessToken;

        localStorage.setItem("accessToken", newAccessToken);

        axiosInstance.defaults.headers.common["Authorization"] =
          `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return axiosInstance(originalRequest);
      } catch (err) {
        processQueue(err, null);

        localStorage.clear();
        window.location.href = "/login";

        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    /* ================= OTHER ERRORS ================= */
    switch (status) {
      case 400:
        return Promise.reject({
          message: data?.message || "Dữ liệu không hợp lệ",
        });

      case 403:
        return Promise.reject({
          message: "Bạn không có quyền truy cập",
        });

      case 404:
        return Promise.reject({
          message: "API không tồn tại",
        });

      case 500:
        return Promise.reject({
          message: "Lỗi server, thử lại sau",
        });

      default:
        return Promise.reject({
          message: data?.message || "Có lỗi xảy ra",
        });
    }
  },
);

/* ================= EXPORT ================= */
export default axiosInstance;
