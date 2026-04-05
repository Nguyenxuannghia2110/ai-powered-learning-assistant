import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";
/* =====================================================
   AUTH SERVICE
===================================================== */

/* ================= REGISTER ================= */
const register = async (payload) => {
  const res = await axiosInstance.post(API_PATHS.AUTH.REGISTER, payload);

  if (!res?.data?.success) {
    throw new Error(res?.data?.error || "Register failed");
  }

  // ⚠️ backend thường sẽ set cookie luôn
  return true;
};

/* ================= LOGIN ================= */
const login = async (email, password) => {
  const res = await axiosInstance.post(API_PATHS.AUTH.LOGIN, {
    email,
    password,
  });

  if (!res?.data?.success) {
    throw new Error(res?.data?.error || "Login failed");
  }

  return true; // cookie đã được set
};

/* ================= REFRESH ================= */
const refreshToken = async () => {
  const res = await axiosInstance.post(
    API_PATHS.AUTH.REFRESH_TOKEN,
    {},
    { withCredentials: true }
  );

  if (!res?.data?.success) {
    throw new Error("Refresh failed");
  }

  return res.data.data; // { user, accessToken }
};

/* ================= GET PROFILE ================= */
const getProfile = async () => {
  const res = await axiosInstance.get(API_PATHS.AUTH.GET_PROFILE);

  if (!res?.data?.success) {
    throw new Error("Get profile failed");
  }

  return res.data.data;
};

/* ================= UPDATE PROFILE ================= */
const updateProfile = async (payload) => {
  const res = await axiosInstance.put(
    API_PATHS.AUTH.UPDATE_PROFILE,
    payload
  );

  if (!res?.data?.success) {
    throw new Error(res?.data?.error || "Update profile failed");
  }

  return res.data.data; // trả về user mới
};

/* ================= CHANGE PASSWORD ================= */
const changePassword = async (payload) => {
  const res = await axiosInstance.put(
    API_PATHS.AUTH.CHANGE_PASSWORD,
    payload
  );

  if (!res?.data?.success) {
    throw new Error(res?.data?.error || "Change password failed");
  }

  return true;
};

/* =====================================================
   EXPORT
===================================================== */
const authService = {
  login,
  register,
  getProfile,
  updateProfile,
  changePassword,
  refreshToken,
};

export default authService;
