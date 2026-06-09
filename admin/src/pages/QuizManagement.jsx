import { useState, useEffect } from 'react';
import { adminService } from '../services/api';
import { motion } from 'framer-motion';
import { Search, HelpCircle, Trash2, CheckCircle, ChevronLeft, ChevronRight, Eye, PlayCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import ViewModal from '../components/ViewModal';

export default function QuizManagement() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, totalPages: 1, total: 0 });
  const [viewItem, setViewItem] = useState(null);

  useEffect(() => {
    fetchQuizzes();
  }, [pagination.page]);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const res = await adminService.getQuizzes({ page: pagination.page, limit: pagination.limit });
      if (res.data.success) {
        setQuizzes(res.data.data.quizzes);
        setPagination(res.data.data.pagination);
      }
    } catch (err) {
      toast.error('Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  const handleView = (quiz) => {
    setViewItem(quiz);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this quiz?')) return;
    try {
      const res = await adminService.deleteQuiz(id);
      if (res.data.success) {
        toast.success('Quiz deleted successfully');
        fetchQuizzes();
      }
    } catch (err) {
      toast.error('Failed to delete quiz');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto flex flex-col h-full">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-main)] tracking-tight">Quiz Management</h2>
          <p className="text-[var(--text-muted)] text-sm mt-1">Manage {pagination.total} quizzes generated or manually created.</p>
        </div>
      </div>

      <div className="glass rounded-2xl flex-1 flex flex-col overflow-hidden border border-[var(--border-subtle)] shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-hover)]/50">
                <th className="px-6 py-4 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Quiz Title</th>
                <th className="px-6 py-4 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Creator</th>
                <th className="px-6 py-4 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Document</th>
                <th className="px-6 py-4 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Score</th>
                <th className="px-6 py-4 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Completed At</th>
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
              ) : quizzes.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-[var(--text-muted)]">No quizzes found.</td>
                </tr>
              ) : (
                quizzes.map((quiz) => (
                  <motion.tr 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    key={quiz._id} 
                    className="border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--bg-hover)] transition-colors group"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center shadow-sm">
                          <HelpCircle size={20} />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-[var(--text-main)] max-w-xs truncate">{quiz.title || 'Untitled Quiz'}</div>
                          <div className="text-xs text-[var(--text-muted)]">{quiz.questions?.length || 0} Questions</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-[var(--text-main)]">{quiz.userId?.username || 'Unknown'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-muted)] truncate max-w-[150px]">
                      {quiz.documentId?.title || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {quiz.score !== undefined ? (
                         <span className="font-bold text-emerald-500">{quiz.score}%</span>
                      ) : (
                         <span className="text-[var(--text-muted)] text-sm">Not Taken</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-muted)]">
                      {quiz.completedAt ? new Date(quiz.completedAt).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleView(quiz)} className="p-2 text-[var(--text-muted)] hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors" title="View">
                          <Eye size={16} />
                        </button>
                        <button onClick={() => handleDelete(quiz._id)} className="p-2 text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors" title="Delete">
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
        
        {!loading && quizzes.length > 0 && (
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
        title="Quiz Details"
      >
        {viewItem && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-500 font-medium">Title</p>
                <p className="text-slate-800 font-semibold">{viewItem.title || 'Untitled'}</p>
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
                <p className="text-sm text-slate-500 font-medium">Total Questions</p>
                <p className="text-slate-800 font-semibold text-lg">{viewItem.questions?.length || 0}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Score</p>
                <p className="text-slate-800">{viewItem.score !== undefined ? `${viewItem.score}%` : 'Not Taken'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Completed At</p>
                <p className="text-slate-800">{viewItem.completedAt ? new Date(viewItem.completedAt).toLocaleString() : '-'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Created At</p>
                <p className="text-slate-800">{viewItem.createdAt ? new Date(viewItem.createdAt).toLocaleString() : '-'}</p>
              </div>
            </div>

            {viewItem.questions && viewItem.questions.length > 0 && (
              <div className="mt-6 pt-6 border-t border-slate-100">
                <h4 className="text-md font-bold text-slate-800 mb-4">Questions Preview</h4>
                <div className="space-y-4 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                  {viewItem.questions.map((q, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <p className="font-medium text-sm text-slate-800"><span className="text-indigo-500 mr-1">Q{idx + 1}.</span> {q.question}</p>
                      <ul className="mt-2 space-y-1">
                        {q.options?.map((opt, oIdx) => (
                          <li key={oIdx} className={`text-xs p-1.5 rounded-md ${opt === q.correctAnswer ? 'bg-emerald-100 text-emerald-800 font-semibold' : 'text-slate-600'}`}>
                            {opt} {opt === q.correctAnswer && '(Correct)'}
                          </li>
                        ))}
                      </ul>
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
