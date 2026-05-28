import { Settings as SettingsIcon, Shield, Bell, Database, Globe, Key } from 'lucide-react';

export default function Settings() {
  return (
    <div className="p-8 max-w-7xl mx-auto flex flex-col h-full overflow-y-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[var(--text-main)] tracking-tight">System Settings</h2>
        <p className="text-[var(--text-muted)] text-sm mt-1">Configure global application parameters and integrations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-1 space-y-2">
          <button className="w-full text-left px-4 py-3 rounded-xl bg-[var(--primary)] text-white font-medium flex items-center gap-3">
            <SettingsIcon size={18} /> General
          </button>
          <button className="w-full text-left px-4 py-3 rounded-xl text-[var(--text-muted)] hover:bg-[var(--bg-hover)] font-medium flex items-center gap-3 transition-colors">
            <Globe size={18} /> Localization
          </button>
          <button className="w-full text-left px-4 py-3 rounded-xl text-[var(--text-muted)] hover:bg-[var(--bg-hover)] font-medium flex items-center gap-3 transition-colors">
            <Key size={18} /> API Keys
          </button>
          <button className="w-full text-left px-4 py-3 rounded-xl text-[var(--text-muted)] hover:bg-[var(--bg-hover)] font-medium flex items-center gap-3 transition-colors">
            <Database size={18} /> Backups
          </button>
          <button className="w-full text-left px-4 py-3 rounded-xl text-[var(--text-muted)] hover:bg-[var(--bg-hover)] font-medium flex items-center gap-3 transition-colors">
            <Shield size={18} /> Security
          </button>
          <button className="w-full text-left px-4 py-3 rounded-xl text-[var(--text-muted)] hover:bg-[var(--bg-hover)] font-medium flex items-center gap-3 transition-colors">
            <Bell size={18} /> Notifications
          </button>
        </div>

        <div className="md:col-span-3 space-y-6">
          <div className="glass rounded-2xl p-6 border border-[var(--border-subtle)] shadow-sm">
            <h3 className="text-lg font-bold text-[var(--text-main)] mb-4">General Configuration</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Platform Name</label>
                <input type="text" defaultValue="Lumina Learning" className="w-full bg-[var(--bg-hover)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-main)] outline-none focus:border-[var(--primary)]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Support Email</label>
                <input type="email" defaultValue="support@lumina.com" className="w-full bg-[var(--bg-hover)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-main)] outline-none focus:border-[var(--primary)]" />
              </div>
              <div className="flex items-center justify-between py-2 border-t border-[var(--border-subtle)] mt-4">
                <div>
                  <h4 className="text-sm font-bold text-[var(--text-main)]">Maintenance Mode</h4>
                  <p className="text-xs text-[var(--text-muted)] mt-1">Temporarily disable access to the platform for all users except admins.</p>
                </div>
                <div className="w-12 h-6 bg-[var(--bg-hover)] rounded-full border border-[var(--border-subtle)] relative cursor-pointer">
                  <div className="w-5 h-5 bg-[var(--text-muted)] rounded-full absolute top-0.5 left-0.5 transition-all"></div>
                </div>
              </div>
              <div className="flex items-center justify-between py-2 border-t border-[var(--border-subtle)] mt-2">
                <div>
                  <h4 className="text-sm font-bold text-[var(--text-main)]">Public Registration</h4>
                  <p className="text-xs text-[var(--text-muted)] mt-1">Allow new users to create accounts organically.</p>
                </div>
                <div className="w-12 h-6 bg-[var(--primary)] rounded-full relative cursor-pointer">
                  <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5 transition-all"></div>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button className="bg-[var(--primary)] text-white px-6 py-2 rounded-xl text-sm font-semibold hover:bg-[var(--primary)]/90 transition-colors">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
