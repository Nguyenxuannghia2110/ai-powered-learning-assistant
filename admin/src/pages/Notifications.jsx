import { Bell, Send, CheckCircle, Clock } from 'lucide-react';
import { useState } from 'react';

export default function Notifications() {
  const [activeTab, setActiveTab] = useState('compose');

  const history = [
    { id: 1, title: 'System Maintenance', target: 'All Users', status: 'Sent', date: '2026-05-24 10:00 AM' },
    { id: 2, title: 'New Feature: AI Quizzes', target: 'Pro Users', status: 'Scheduled', date: '2026-05-26 09:00 AM' },
    { id: 3, title: 'Payment Failed Reminder', target: 'Specific Users', status: 'Sent', date: '2026-05-20 14:30 PM' },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto flex flex-col h-full overflow-y-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[var(--text-main)] tracking-tight">Notification Center</h2>
        <p className="text-[var(--text-muted)] text-sm mt-1">Send announcements and manage system notifications.</p>
      </div>

      <div className="flex gap-4 mb-6 border-b border-[var(--border-subtle)] pb-4">
        <button 
          onClick={() => setActiveTab('compose')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${activeTab === 'compose' ? 'bg-[var(--primary)] text-white' : 'text-[var(--text-muted)] hover:bg-[var(--bg-hover)]'}`}
        >
          Compose Message
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${activeTab === 'history' ? 'bg-[var(--primary)] text-white' : 'text-[var(--text-muted)] hover:bg-[var(--bg-hover)]'}`}
        >
          History & Scheduled
        </button>
      </div>

      {activeTab === 'compose' && (
        <div className="glass rounded-2xl p-6 border border-[var(--border-subtle)] shadow-sm max-w-3xl">
          <form className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Target Audience</label>
              <select className="w-full bg-[var(--bg-hover)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-main)] outline-none focus:border-[var(--primary)]">
                <option>All Users</option>
                <option>Free Users Only</option>
                <option>Premium Subscribers</option>
                <option>Specific User IDs</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Notification Title</label>
              <input type="text" placeholder="e.g. Scheduled Maintenance Notice" className="w-full bg-[var(--bg-hover)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-main)] outline-none focus:border-[var(--primary)]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Message Body</label>
              <textarea rows={5} placeholder="Write your announcement here..." className="w-full bg-[var(--bg-hover)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-main)] outline-none focus:border-[var(--primary)] resize-none" />
            </div>
            <div className="pt-4 flex gap-3 justify-end border-t border-[var(--border-subtle)]">
              <button type="button" className="px-6 py-2 rounded-xl text-sm font-medium text-[var(--text-main)] border border-[var(--border-subtle)] hover:bg-[var(--bg-hover)] transition-colors flex items-center gap-2">
                <Clock size={16} /> Schedule
              </button>
              <button type="button" className="bg-[var(--primary)] text-white px-6 py-2 rounded-xl text-sm font-semibold hover:bg-[var(--primary)]/90 transition-colors flex items-center gap-2">
                <Send size={16} /> Send Now
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="glass rounded-2xl flex-1 flex flex-col overflow-hidden border border-[var(--border-subtle)] shadow-sm max-w-4xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-hover)]/50">
                  <th className="px-6 py-4 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Title</th>
                  <th className="px-6 py-4 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Target</th>
                  <th className="px-6 py-4 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => (
                  <tr key={item.id} className="border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--bg-hover)] transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shadow-sm">
                          <Bell size={18} />
                        </div>
                        <div className="text-sm font-semibold text-[var(--text-main)]">{item.title}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-muted)]">{item.target}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.status === 'Sent' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                      }`}>
                        {item.status === 'Sent' ? <CheckCircle size={12}/> : <Clock size={12}/>}
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-muted)]">{item.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
