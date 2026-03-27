import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  FileText,
  Layers,
  HelpCircle,
  User,
  Sparkles,
  Zap,
} from "lucide-react";

export default function Sidebar({ mobileOpen, onCloseMobile }) {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/documents", label: "Documents", icon: FileText },
    { path: "/flashcards", label: "Flashcards", icon: Layers },
    { path: "/quizzes", label: "Quizzes", icon: HelpCircle },
    { path: "/profile", label: "Settings", icon: User },
  ];

  return (
    <>
      {/* MOBILE OVERLAY */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      <aside
        className={`
        fixed inset-y-0 left-0 z-50 w-64
        bg-gradient-to-b
        from-[#020617]
        via-[#030712]
        to-[#020617]
        border-r border-white/5
        backdrop-blur-xl
        transition-transform duration-300
        lg:translate-x-0
        ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        {/* LOGO */}
        <div className="p-6 flex items-center gap-3 border-b border-white/5">
          <div
            className="
            w-10 h-10
            flex items-center justify-center
            rounded-xl
            bg-gradient-to-br
            from-emerald-400
            to-emerald-600
            shadow-lg shadow-emerald-500/30
          "
          >
            <Sparkles className="text-black w-5 h-5" />
          </div>

          <div>
            <h1 className="font-semibold text-white text-lg tracking-tight">
              StudyAI
            </h1>
            <p className="text-xs text-gray-500">Learning Assistant</p>
          </div>
        </div>

        {/* NAV */}
        <nav className="mt-6 px-3 space-y-1 relative">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname.startsWith(item.path);

            return (
              <motion.button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  onCloseMobile?.();
                }}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className={`
                relative
                group
                w-full
                flex items-center gap-3
                px-4 py-3
                rounded-xl
                text-sm
                transition-colors
                ${
                  active
                    ? `
                    bg-white/5
                    text-white
                    border border-white/10
                    shadow-lg shadow-emerald-500/10
                    `
                    : `
                    text-gray-400
                    hover:bg-white/5
                    hover:text-white
                    `
                }
                `}
              >
                {/* Animated ACTIVE BAR */}
                {active && (
                  <motion.div
                    layoutId="sidebar-indicator"
                    className="
                    absolute left-0 top-1/2
                    -translate-y-1/2
                    w-1 h-6
                    bg-emerald-400
                    rounded-r
                    shadow shadow-emerald-400/80
                  "
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 30,
                  }}
                  />
                )}

                {/* ICON */}
                <Icon
                  className={`w-5 h-5 ${
                    active
                      ? "text-emerald-400"
                      : "text-gray-500 group-hover:text-gray-300"
                  }`}
                />

                {/* LABEL */}
                <span>{item.label}</span>

                {/* ACTIVE DOT */}
                {active && (
                  <motion.div
                    layoutId="sidebar-dot"
                    className="ml-auto w-2 h-2 bg-emerald-400 rounded-full shadow shadow-emerald-400/80"
                  />
                )}

                {/* HOVER GLOW */}
                <div
                  className="
                  absolute inset-0
                  rounded-xl
                  opacity-0
                  group-hover:opacity-100
                  transition
                  bg-gradient-to-r
                  from-emerald-500/5
                  to-green-400/5
                  blur-lg
                "
                />
              </motion.button>
            );
          })}
        </nav>

        {/* PRO PLAN */}
        <div className="absolute bottom-6 left-4 right-4">
          <div
            className="
            p-4 rounded-2xl
            bg-gradient-to-br
            from-emerald-500/10
            to-green-400/5
            border border-emerald-500/20
            backdrop-blur-xl
          "
          >
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              <p className="text-sm font-semibold text-white">Pro Plan</p>
            </div>

            <p className="text-xs text-gray-400 mb-3">
              Unlock unlimited AI flashcards, quizzes and analytics.
            </p>

            <button
              className="
              w-full py-2 rounded-lg text-sm font-medium
              bg-gradient-to-r from-emerald-400 to-green-500
              text-black hover:scale-[1.03] transition
            "
            >
              Upgrade
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}