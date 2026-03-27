import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";
/* =====================================================
   AUTH SERVICE
===================================================== */

/**
 * LOGIN
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{user: object, token: string}>}
 */
const login = async (email, password) => {
  try {
    const res = await axiosInstance.post(API_PATHS.AUTH.LOGIN, {
      email,
      password,
    });

    if (!res?.data?.success) {
      throw new Error(res?.data?.error || "Login failed");
    }

    const { user, accessToken } = res.data.data;

    if (!user || !accessToken) {
      throw new Error("Invalid login response");
    }

    return { user, accessToken };
  } catch (error) {
    throw new Error(
      error?.response?.data?.error || error?.message || "Login failed",
    );
  }
};

/**
 * REGISTER
 */
const register = async (username, email, password) => {
  try {
    const res = await axiosInstance.post(API_PATHS.AUTH.REGISTER, {
      username,
      email,
      password,
    });

    if (!res?.data?.success) {
      throw new Error(res?.data?.error || "Register failed");
    }

    return res.data;
  } catch (error) {
    throw new Error(
      error?.response?.data?.error || error?.message || "Register failed",
    );
  }
};

/**
 * GET PROFILE
 */
const getProfile = async () => {
  try {
    const res = await axiosInstance.get(API_PATHS.AUTH.GET_PROFILE);

    if (!res?.data?.success) {
      throw new Error("Failed to get profile");
    }

    return res.data;
  } catch (error) {
    throw new Error(
      error?.response?.data?.error || error?.message || "Failed to get profile",
    );
  }
};

/**
 * UPDATE PROFILE
 */
const updateProfile = async (userData) => {
  try {
    const res = await axiosInstance.put(
      API_PATHS.AUTH.UPDATE_PROFILE,
      userData,
    );

    if (!res?.data?.success) {
      throw new Error("Failed to update profile");
    }

    return res.data;
  } catch (error) {
    throw new Error(
      error?.response?.data?.error ||
        error?.message ||
        "Failed to update profile",
    );
  }
};

/**
 * CHANGE PASSWORD
 */
const changePassword = async (passwords) => {
  try {
    const res = await axiosInstance.post(
      API_PATHS.AUTH.CHANGE_PASSWORD,
      passwords,
    );

    if (!res?.data?.success) {
      throw new Error("Failed to change password");
    }

    return res.data;
  } catch (error) {
    throw new Error(
      error?.response?.data?.error ||
        error?.message ||
        "Failed to change password",
    );
  }
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
};

export default authService;
