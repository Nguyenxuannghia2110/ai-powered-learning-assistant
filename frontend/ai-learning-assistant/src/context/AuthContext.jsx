import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import authService from "../services/authService";
import axiosInstance from "../utils/axiosInstance";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  /* ================= LOGOUT ================= */
  const logout = useCallback(() => {
    delete axiosInstance.defaults.headers.common["Authorization"];

    setUser(null);
    setIsAuthenticated(false);
  }, []);

  /* ================= CHECK AUTH ================= */
  const checkAuthStatus = useCallback(async () => {
    setLoading(true);

    try {
      // 🔥 gọi refresh để lấy accessToken
      const { user, accessToken } = await authService.refreshToken();

      // lưu token vào axios (memory)
      axiosInstance.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${accessToken}`;

      setUser(user);
      setIsAuthenticated(true);
    } catch (err) {
      console.error("Auth check failed:", err);
      logout();
    } finally {
      setLoading(false);
    }
  }, [logout]);

  /* ================= INIT ================= */
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  /* ================= LOGIN ================= */
  const login = (userData, accessToken) => {
    axiosInstance.defaults.headers.common[
      "Authorization"
    ] = `Bearer ${accessToken}`;

    setUser(userData);
    setIsAuthenticated(true);
  };

  /* ================= UPDATE USER ================= */
  const updateUser = (updateData) => {
    setUser((prev) => ({
      ...prev,
      ...updateData,
    }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        login,
        logout,
        updateUser,
        checkAuthStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);