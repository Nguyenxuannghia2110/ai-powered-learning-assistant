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
  Compass,
} from "lucide-react";

export default function Sidebar({ mobileOpen, onCloseMobile }) {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/workspaces", label: "Workspaces", icon: Compass },
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
        fixed inset-y-0 left-0 z-50 w-[260px]
        bg-canvas
        transition-transform duration-300
        lg:translate-x-0
        ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        {/* LOGO */}
        <div className="p-6 flex items-center gap-3">
          <div
            className="
            w-8 h-8
            flex items-center justify-center
            rounded-full
            bg-primary
          "
          >
            <div className="w-3 h-3 bg-canvas rounded-full"></div>
          </div>

          <h1 className="font-bold text-ink text-xl tracking-tight">
            AiLearn
          </h1>
        </div>

        {/* NAV */}
        <nav className="mt-2 px-4 space-y-1 relative">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname.startsWith(item.path);

            return (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  onCloseMobile?.();
                }}
                className={`
                w-full
                flex items-center gap-4
                px-4 py-3
                rounded-md
                text-sm transition-colors
                ${
                  active
                    ? "font-bold text-ink"
                    : "font-normal text-body hover:text-ink"
                }
                `}
              >
                <Icon
                  className={`w-6 h-6 ${
                    active ? "text-ink" : "text-body"
                  }`}
                  strokeWidth={active ? 2.5 : 2}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* PRO PLAN */}
        <div className="absolute bottom-6 left-4 right-4">
          <div
            className="
            p-5 rounded-lg
            bg-canvas-card
            text-ink
            relative
            overflow-hidden
            shadow-[0_8px_8px_rgba(0,0,0,0.3)]
          "
          >
            <p className="font-bold text-base mb-1 relative z-10">Premium Account</p>
            <p className="text-xs text-body mb-4 relative z-10">
              Upgrade to premium.
            </p>

            <button
              className="
              w-max px-6 py-2 rounded-pill text-sm font-bold uppercase tracking-[1.4px]
              bg-ink text-canvas hover:bg-white hover:scale-105 transition-transform
              flex items-center gap-2 relative z-10
            "
            >
              Get now
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}