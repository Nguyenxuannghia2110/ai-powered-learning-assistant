import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  Users,
  Files,
  Settings,
  LogOut,
  ShieldAlert
} from "lucide-react";

export default function AdminSidebar() {
  const { logout, user } = useAuth();
  const location = useLocation();

  const navItems = [
    { name: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Users", path: "/admin/users", icon: Users },
    { name: "Content Moderation", path: "/admin/content", icon: Files },
    { name: "Settings", path: "/admin/settings", icon: Settings },
  ];

  return (
    <aside className="w-64 h-full border-r border-hairline flex flex-col shrink-0">
      {/* BRANDING */}
      <div className="h-20 flex items-center px-8 border-b border-hairline shrink-0">
        <Link to="/admin/dashboard" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-red-500/20 border border-red-500 flex items-center justify-center">
            <ShieldAlert className="w-4 h-4 text-red-500" />
          </div>
          <span className="font-display font-semibold text-lg tracking-tight">
            StudyAI <span className="text-red-500">Admin</span>
          </span>
        </Link>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${
                isActive
                  ? "bg-canvas-soft text-ink font-medium"
                  : "text-mute hover:bg-canvas-soft hover:text-ink"
              }`}
            >
              <item.icon
                className={`w-5 h-5 ${isActive ? "text-primary" : "opacity-70"}`}
              />
              <span className="text-sm">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* USER PROFILE & LOGOUT */}
      <div className="p-4 border-t border-hairline shrink-0">
        <div className="flex items-center gap-3 px-4 py-3 mb-2 rounded-md bg-canvas-soft border border-hairline">
          <div className="w-8 h-8 rounded-full bg-red-500/20 border border-red-500/50 flex items-center justify-center shrink-0">
            <span className="text-xs font-medium text-red-500">
              {user?.username?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.username}</p>
            <p className="text-xs text-mute truncate uppercase tracking-widest">{user?.role}</p>
          </div>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-mute hover:text-white hover:bg-canvas-soft rounded-md transition-colors"
        >
          <span className="flex items-center gap-2">
            <LogOut className="w-4 h-4 opacity-70" /> Logout
          </span>
        </button>
      </div>
    </aside>
  );
}
