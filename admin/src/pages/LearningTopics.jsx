import { useState, useEffect, useCallback } from 'react';
import { adminService } from '../services/api';
import { motion } from 'framer-motion';
import { Search, FolderOpen, Trash2, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LearningTopics() {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, totalPages: 1, total: 0 });
  const [search, setSearch] = useState('');

  const fetchTopics = useCallback(async () => {
    try {
      const res = await adminService.getTopics({ page: pagination.page, limit: pagination.limit, search });
      if (res.data.success) {
        setTopics(res.data.data.topics);
        setPagination(res.data.data.pagination);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load learning topics');
    } finally {
      setLoading(false);
    }
  }, [pagination.limit, pagination.page, search]);

  useEffect(() => {
    const timer = setTimeout(fetchTopics, 0);
    return () => clearTimeout(timer);
  }, [fetchTopics]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleDelete = async (topic) => {
    if (!window.confirm(`Delete "${topic.topic || 'Untitled'}"?`)) return;

    try {
      await adminService.deleteTopic(topic._id);
      toast.success('Learning topic deleted');
      fetchTopics();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete learning topic');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto flex flex-col h-full">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-main)] tracking-tight">Learning Topics (Workspaces)</h2>
          <p className="text-[var(--text-muted)] text-sm mt-1">Manage {pagination.total} learning spaces created by users.</p>
        </div>
      </div>

      <div className="glass rounded-2xl p-4 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input 
            type="text" 
            placeholder="Search topic name..." 
            value={search}
            onChange={handleSearchChange}
            className="w-full bg-[var(--bg-hover)] border border-[var(--border-subtle)] focus:border-[var(--primary)] text-sm rounded-xl py-2.5 pl-10 pr-4 outline-none transition-all text-[var(--text-main)]"
          />
        </div>
      </div>

      <div className="glass rounded-2xl flex-1 flex flex-col overflow-hidden border border-[var(--border-subtle)] shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-hover)]/50">
                <th className="px-6 py-4 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Topic / Workspace</th>
                <th className="px-6 py-4 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Owner</th>
                <th className="px-6 py-4 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Level</th>
                <th className="px-6 py-4 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Created At</th>
                <th className="px-6 py-4 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-[var(--text-muted)]">
                    <div className="flex justify-center"><div className="w-6 h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div></div>
                  </td>
                </tr>
              ) : topics.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-[var(--text-muted)]">No topics found.</td>
                </tr>
              ) : (
                topics.map((topic) => (
                  <motion.tr 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    key={topic._id} 
                    className="border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--bg-hover)] transition-colors group"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shadow-sm">
                          <FolderOpen size={20} />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-[var(--text-main)] max-w-xs truncate">{topic.topic || 'Untitled'}</div>
                          <div className="text-xs text-[var(--text-muted)]">{topic.description || 'No description'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-[var(--text-main)]">{topic.userId?.username || 'Unknown'}</div>
                      <div className="text-xs text-[var(--text-muted)]">{topic.userId?.email || ''}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-500 capitalize">
                        {topic.level || 'beginner'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-muted)]">
                      {topic.createdAt ? new Date(topic.createdAt).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 text-[var(--text-muted)] hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors" title={`Progress: ${topic.progress ?? 0}%`}>
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(topic)}
                          className="p-2 text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {!loading && topics.length > 0 && (
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
