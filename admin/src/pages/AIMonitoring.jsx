import { useState, useEffect } from 'react';
import { adminService } from '../services/api';
import { motion } from 'framer-motion';
import { Cpu, Zap, XCircle, Clock, Search, ChevronLeft, ChevronRight, Activity } from 'lucide-react';
import toast from 'react-hot-toast';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';

export default function AIMonitoring() {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({ totalRequests: 0, failedRequests: 0, totalTokens: 0 });
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, totalPages: 1, total: 0 });

  useEffect(() => {
    fetchLogs();
  }, [pagination.page]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await adminService.getAILogs({ page: pagination.page, limit: pagination.limit });
      if (res.data.success) {
        setLogs(res.data.data.logs);
        setStats(res.data.data.stats);
        setPagination(res.data.data.pagination);
      }
    } catch (err) {
      toast.error('Failed to load AI logs');
    } finally {
      setLoading(false);
    }
  };

  const chartData = [
    { name: 'Mon', tokens: 12000 },
    { name: 'Tue', tokens: 18000 },
    { name: 'Wed', tokens: 15000 },
    { name: 'Thu', tokens: 22000 },
    { name: 'Fri', tokens: 30000 },
    { name: 'Sat', tokens: 28000 },
    { name: 'Sun', tokens: 25000 },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto flex flex-col h-full">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-main)] tracking-tight">AI Monitoring</h2>
          <p className="text-[var(--text-muted)] text-sm mt-1">Track AI usage, token consumption, and response times.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass rounded-2xl p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500"><Cpu size={24} /></div>
          </div>
          <h3 className="text-3xl font-bold text-[var(--text-main)] mb-1">{stats.totalRequests.toLocaleString()}</h3>
          <p className="text-sm font-medium text-[var(--text-muted)]">Total AI Requests</p>
        </div>
        <div className="glass rounded-2xl p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500"><Zap size={24} /></div>
          </div>
          <h3 className="text-3xl font-bold text-[var(--text-main)] mb-1">{stats.totalTokens.toLocaleString()}</h3>
          <p className="text-sm font-medium text-[var(--text-muted)]">Tokens Consumed</p>
        </div>
        <div className="glass rounded-2xl p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500"><Activity size={24} /></div>
          </div>
          <h3 className="text-3xl font-bold text-[var(--text-main)] mb-1">99.8%</h3>
          <p className="text-sm font-medium text-[var(--text-muted)]">Success Rate</p>
        </div>
      </div>

      <div className="glass rounded-2xl p-6 mb-8">
        <h3 className="text-lg font-bold text-[var(--text-main)] mb-6">Token Usage Trends</h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTokens" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--text-muted)', fontSize: 12}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--text-muted)', fontSize: 12}} />
              <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)', borderRadius: '8px' }} />
              <Area type="monotone" dataKey="tokens" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorTokens)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass rounded-2xl flex-1 flex flex-col overflow-hidden border border-[var(--border-subtle)] shadow-sm">
        <div className="px-6 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-card)]">
          <h3 className="text-lg font-bold text-[var(--text-main)]">Recent AI Requests</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-hover)]/50">
                <th className="px-6 py-4 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Model/Provider</th>
                <th className="px-6 py-4 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Tokens (P+C)</th>
                <th className="px-6 py-4 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Time</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-[var(--text-muted)]">
                    <div className="flex justify-center"><div className="w-6 h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div></div>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-[var(--text-muted)]">No logs found.</td>
                </tr>
              ) : (
                logs.map((log) => (
                  <motion.tr 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    key={log._id} 
                    className="border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--bg-hover)] transition-colors group"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                          GEMINI
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-[var(--text-main)]">gemini-1.5-pro</div>
                          <div className="text-xs text-[var(--text-muted)]">Status: <span className="text-emerald-500">200 OK</span></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-[var(--text-main)] font-medium">{(log.promptTokens || 0) + (log.completionTokens || 0)}</div>
                      <div className="text-xs text-[var(--text-muted)]">{log.promptTokens} in / {log.completionTokens} out</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-muted)]">
                      {log.prompt?.substring(0, 30) || 'Unknown Request'}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-muted)]">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {!loading && logs.length > 0 && (
          <div className="px-6 py-4 border-t border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-card)]">
            <span className="text-sm text-[var(--text-muted)]">
              Page <span className="font-medium text-[var(--text-main)]">{pagination.page}</span> of <span className="font-medium text-[var(--text-main)]">{pagination.totalPages}</span>
            </span>
            <div className="flex items-center gap-2">
              <button onClick={() => setPagination(prev => ({...prev, page: prev.page - 1}))} disabled={pagination.page === 1} className="p-1.5 rounded-lg border border-[var(--border-subtle)] text-[var(--text-main)] hover:bg-[var(--bg-hover)] disabled:opacity-50 disabled:cursor-not-allowed">
                <ChevronLeft size={18} />
              </button>
              <button onClick={() => setPagination(prev => ({...prev, page: prev.page + 1}))} disabled={pagination.page === pagination.totalPages} className="p-1.5 rounded-lg border border-[var(--border-subtle)] text-[var(--text-main)] hover:bg-[var(--bg-hover)] disabled:opacity-50 disabled:cursor-not-allowed">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
