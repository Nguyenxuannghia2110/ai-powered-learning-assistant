import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Cpu,
  HelpCircle,
  Layers,
  FileText,
  BookOpen,
  LineChart,
  CreditCard,
  Bell,
  MessageSquareWarning,
  Settings,
  Activity,
  ShieldCheck,
  UserCircle,
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import clsx from 'clsx';

const menuItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { name: 'User Management', icon: Users, path: '/users' },
  { name: 'AI Monitoring', icon: Cpu, path: '/ai-monitoring' },
  { name: 'Quiz Management', icon: HelpCircle, path: '/quizzes' },
  { name: 'Flashcards', icon: Layers, path: '/flashcards' },
  { name: 'Documents', icon: FileText, path: '/documents' },
  { name: 'Learning Topics', icon: BookOpen, path: '/topics' },
  { name: 'Analytics', icon: LineChart, path: '/analytics' },
  { name: 'Settings', icon: Settings, path: '/settings' },
];

export default function Sidebar({ collapsed, setCollapsed }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 280 }}
      className="h-screen bg-[var(--bg-sidebar)] border-r border-[var(--border-subtle)] flex flex-col relative z-20 shrink-0 transition-colors duration-300 shadow-sm"
    >
      {/* Logo Area */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-[var(--border-subtle)]">
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 overflow-hidden whitespace-nowrap"
          >
            <div className="w-8 h-8 rounded-lg bg-[var(--primary)] flex items-center justify-center text-white font-bold text-lg shrink-0">
              A
            </div>
            <span className="font-bold text-lg tracking-tight text-[var(--text-main)]">Admin</span>
          </motion.div>
        )}
        {collapsed && (
          <div className="w-full flex justify-center">
            <div className="w-8 h-8 rounded-lg bg-[var(--primary)] flex items-center justify-center text-white font-bold text-lg">
              A
            </div>
          </div>
        )}
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3.5 top-20 w-7 h-7 rounded-full bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-sm flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors z-50"
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {/* Menu List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar py-4 px-3 space-y-1">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              to={item.path}
              title={collapsed ? item.name : undefined}
              className={clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group overflow-hidden whitespace-nowrap",
                isActive
                  ? "bg-[var(--primary)]/10 text-[var(--primary)] font-medium"
                  : "text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-main)]"
              )}
            >
              <Icon size={20} className="shrink-0" />
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="truncate"
                >
                  {item.name}
                </motion.span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Logout button at bottom */}
      <div className="p-4 border-t border-[var(--border-subtle)]">
        <button
          onClick={handleLogout}
          title={collapsed ? "Logout" : undefined}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors overflow-hidden whitespace-nowrap group"
        >
          <LogOut size={20} className="shrink-0 group-hover:-translate-x-1 transition-transform" />
          {!collapsed && <span className="font-medium truncate">Logout</span>}
        </button>
      </div>
    </motion.aside>
  );
}
