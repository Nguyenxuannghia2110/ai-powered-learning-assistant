import { useState, useEffect } from 'react';
import { adminService } from '../services/api';
import { motion } from 'framer-motion';
import { Search, Layers, Trash2, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import ViewModal from '../components/ViewModal';

export default function FlashcardManagement() {
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, totalPages: 1, total: 0 });
  const [viewItem, setViewItem] = useState(null);

  useEffect(() => {
    fetchFlashcards();
  }, [pagination.page]);

  const fetchFlashcards = async () => {
    try {
      setLoading(true);
      const res = await adminService.getFlashcards({ page: pagination.page, limit: pagination.limit });
      if (res.data.success) {
        setFlashcards(res.data.data.flashcards);
        setPagination(res.data.data.pagination);
      }
    } catch (err) {
      toast.error('Failed to load flashcards');
    } finally {
      setLoading(false);
    }
  };

  const handleView = (deck) => {
    setViewItem(deck);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this flashcard deck?')) return;
    try {
      const res = await adminService.deleteFlashcard(id);
      if (res.data.success) {
        toast.success('Flashcard deck deleted successfully');
        fetchFlashcards();
      }
    } catch (err) {
      toast.error('Failed to delete flashcards');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto flex flex-col h-full">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-main)] tracking-tight">Flashcard Management</h2>
          <p className="text-[var(--text-muted)] text-sm mt-1">Manage {pagination.total} flashcard decks generated or manually created.</p>
        </div>
      </div>

      <div className="glass rounded-2xl flex-1 flex flex-col overflow-hidden border border-[var(--border-subtle)] shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-hover)]/50">
                <th className="px-6 py-4 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Deck Title</th>
                <th className="px-6 py-4 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Creator</th>
                <th className="px-6 py-4 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Document</th>
                <th className="px-6 py-4 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Cards</th>
                <th className="px-6 py-4 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Created At</th>
                <th className="px-6 py-4 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-[var(--text-muted)]">
                    <div className="flex justify-center"><div className="w-6 h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div></div>
                  </td>
                </tr>
              ) : flashcards.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-[var(--text-muted)]">No flashcards found.</td>
                </tr>
              ) : (
                flashcards.map((deck) => (
                  <motion.tr 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    key={deck._id} 
                    className="border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--bg-hover)] transition-colors group"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-500 flex items-center justify-center shadow-sm">
                          <Layers size={20} />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-[var(--text-main)] max-w-xs truncate">{deck.title || 'Untitled Deck'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-[var(--text-main)]">{deck.userId?.username || 'Unknown'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-muted)] truncate max-w-[150px]">
                      {deck.documentId?.title || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[var(--text-main)]">
                      {deck.cards?.length || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-muted)]">
                      {deck.createdAt ? new Date(deck.createdAt).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleView(deck)} className="p-2 text-[var(--text-muted)] hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors" title="View">
                          <Eye size={16} />
                        </button>
                        <button onClick={() => handleDelete(deck._id)} className="p-2 text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors" title="Delete">
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
        
        {!loading && flashcards.length > 0 && (
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

      <ViewModal 
        isOpen={!!viewItem} 
        onClose={() => setViewItem(null)} 
        title="Flashcard Deck Details"
      >
        {viewItem && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-500 font-medium">Deck Title</p>
                <p className="text-slate-800 font-semibold">{viewItem.title || 'Untitled Deck'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Creator</p>
                <p className="text-slate-800 font-semibold">{viewItem.userId?.username || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Document Source</p>
                <p className="text-slate-800">{viewItem.documentId?.title || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Total Cards</p>
                <p className="text-slate-800 font-semibold text-lg">{viewItem.cards?.length || 0}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Created At</p>
                <p className="text-slate-800">{viewItem.createdAt ? new Date(viewItem.createdAt).toLocaleString() : '-'}</p>
              </div>
            </div>

            {viewItem.cards && viewItem.cards.length > 0 && (
              <div className="mt-6 pt-6 border-t border-slate-100">
                <h4 className="text-md font-bold text-slate-800 mb-4">Cards Preview</h4>
                <div className="space-y-4 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                  {viewItem.cards.map((c, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col gap-2">
                      <div>
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Front</span>
                        <p className="text-sm text-slate-800 mt-1">{c.question}</p>
                      </div>
                      <div className="pt-2 border-t border-slate-200">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Back</span>
                        <p className="text-sm text-slate-700 mt-1">{c.answer}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </ViewModal>
    </div>
  );
}
