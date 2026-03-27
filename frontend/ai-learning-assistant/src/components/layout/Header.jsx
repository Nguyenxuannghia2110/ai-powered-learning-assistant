import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Bell,
  Search,
  Sparkles,
  LogOut,
  User,
  Activity,
  Settings,
  Moon,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/* ================= THEME ================= */

const applyTheme = (mode) => {
  const root = document.documentElement;

  if (mode === "system") {
    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    root.classList.toggle("dark", isDark);
  } else {
    root.classList.toggle("dark", mode === "dark");
  }

  localStorage.setItem("theme", mode);
};

const initTheme = () => {
  const saved = localStorage.getItem("theme") || "system";
  applyTheme(saved);
  return saved;
};

/* ================= COMPONENT ================= */

const Header = () => {
  const { user, logout } = useAuth();

  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState("system");

  const dropdownRef = useRef();
  const navigate = useNavigate();
  const location = useLocation();

  /* ===== INIT THEME + LISTEN SYSTEM ===== */
  useEffect(() => {
    const saved = initTheme();
    setTheme(saved);

    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = () => {
      if (saved === "system") {
        applyTheme("system");
      }
    };

    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, []);

  /* ===== CLICK OUTSIDE ===== */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!dropdownRef.current?.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ===== HANDLERS ===== */
  const handleNavigate = useCallback(
    (path) => {
      navigate(path);
      setOpen(false);
    },
    [navigate],
  );

  const handleLogout = useCallback(() => {
    logout();
    setOpen(false);
  }, [logout]);

  /* ================= UI ================= */

  return (
    <header className="fixed top-0 left-[260px] right-0 h-[70px] z-40 backdrop-blur-xl bg-black/30 border-b border-white/10 flex items-center justify-between px-8">
      {/* SEARCH */}
      <div className="relative w-[400px]">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          size={16}
        />
        <input
          placeholder="Search..."
          className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white/5 border border-white/10 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/30"
        />
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-6">
        {/* AI */}
        <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-400/10 px-3 py-1.5 rounded-full border border-emerald-400/20">
          <Sparkles size={14} />
          AI Active
        </div>

        {/* NOTI */}
        <div className="relative cursor-pointer">
          <Bell className="text-gray-300 hover:text-white" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
        </div>

        {/* USER */}
        <div ref={dropdownRef} className="relative">
          <div
            onClick={() => setOpen(!open)}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <img
              src={user?.profileImage || "https://i.pravatar.cc/40"}
              className="w-9 h-9 rounded-full border border-white/10 group-hover:border-emerald-400"
            />

          </div>

          {/* DROPDOWN */}
          {open && (
            <div className="absolute right-0 mt-4 w-80 rounded-2xl shadow-2xl border border-white/10 bg-[#0b0f0e]">
              {/* PROFILE */}
              <div className="p-5 flex items-center gap-4 border-b border-white/10">
                <img
                  src={user?.profileImage || "https://i.pravatar.cc/100"}
                  className="w-12 h-12 rounded-full border border-white/10"
                />
                <div>
                  <p className="text-white font-medium">
                    {user?.username || "Guest"}
                  </p>
                  <p className="text-xs text-gray-400">
                    {user?.email || "no-email"}
                  </p>
                </div>
              </div>

              {/* MENU */}
              <div className="p-2 space-y-1">
                <MenuItem
                  icon={<User size={20} />}
                  label="View Profile"
                  onClick={() => handleNavigate("/profile")}
                />

                <MenuItem
                  icon={<Settings size={20} />}
                  label="Settings"
                  onClick={() => handleNavigate("/profile")}
                />

                <MenuItem
                  icon={<Activity size={20} />}
                  label="Learning Progress"
                  onClick={() => setOpen(false)}
                />

                {/* DARK MODE INLINE */}
                <MenuItem
                  icon={<Moon size={20} />}
                  label="Dark Mode"
                  right={
                    <div
                      className={`w-10 h-5 flex items-center rounded-full p-1 transition ${
                        theme === "dark" ? "bg-emerald-400" : "bg-gray-600"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 bg-white rounded-full transition ${
                          theme === "dark" ? "translate-x-5" : ""
                        }`}
                      />
                    </div>
                  }
                  onClick={() => {
                    const newTheme = theme === "dark" ? "light" : "dark";
                    setTheme(newTheme);
                    applyTheme(newTheme);
                  }}
                />

                {/* LOGOUT SAME STYLE */}
                <MenuItem
                  icon={<LogOut size={20} />}
                  label="Logout"
                  danger
                  onClick={handleLogout}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

/* ================= SUB COMPONENTS ================= */

const MenuItem = ({ icon, label, onClick, danger, active, right }) => (
  <button
    onClick={onClick}
    className={`
      w-full flex items-center justify-between
      px-3 py-2 rounded-lg text-sm transition
      ${
        danger
          ? "text-red-400 hover:bg-red-500/10"
          : active
            ? "bg-white/10 text-white"
            : "text-gray-300 hover:bg-white/10"
      }
    `}
  >
    {/* LEFT */}
    <div className="flex items-center gap-3">
      {icon}
      {label}
    </div>

    {/* RIGHT (optional) */}
    {right && <div onClick={(e) => e.stopPropagation()}>{right}</div>}
  </button>
);
