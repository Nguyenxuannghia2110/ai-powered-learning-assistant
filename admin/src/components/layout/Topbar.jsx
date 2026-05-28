import { useState, useEffect } from 'react';
import { Search, Bell, Moon, Sun, MonitorDot } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export default function Topbar() {
  const [theme, setTheme] = useState('light');
  const location = useLocation();

  useEffect(() => {
    // Basic theme toggle logic
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  // Convert path to breadcrumb
  const pathParts = location.pathname.split('/').filter(Boolean);
  const title = pathParts.length > 0 
    ? pathParts[0].charAt(0).toUpperCase() + pathParts[0].slice(1).replace('-', ' ') 
    : 'Dashboard';

  return (
    <header className="h-16 bg-[var(--bg-card)] border-b border-[var(--border-subtle)] flex items-center justify-between px-6 shrink-0 transition-colors duration-300 shadow-sm z-10 relative">
      
      {/* Left section: Breadcrumbs / Title */}
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold text-[var(--text-main)] capitalize tracking-tight">
          {title}
        </h1>
        
        {/* Real-time server status indicator */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold ml-4">
          <MonitorDot size={14} className="animate-pulse" />
          <span>System Healthy</span>
        </div>
      </div>

      {/* Right section: Search & Actions */}
      <div className="flex items-center gap-4">
        
        {/* Global Search */}
        <div className="relative hidden md:block">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input 
            type="text" 
            placeholder="Search everywhere (⌘K)" 
            className="w-64 bg-[var(--bg-hover)] border border-transparent focus:border-[var(--primary)]/50 focus:bg-[var(--bg-base)] text-sm rounded-full py-1.5 pl-9 pr-4 outline-none transition-all text-[var(--text-main)] placeholder-[var(--text-muted)]"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 border-l border-[var(--border-subtle)] pl-4 ml-2">
          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme}
            className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-main)] transition-colors"
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>

          {/* Notifications */}
          <button className="relative w-9 h-9 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-main)] transition-colors">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[var(--bg-card)]"></span>
          </button>

          {/* Profile Dropdown Trigger */}
          <button className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold ml-2 shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 border-2 border-[var(--bg-card)]">
            D
          </button>
        </div>
      </div>
    </header>
  );
}
