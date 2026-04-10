import React, { useEffect, useState } from 'react';
import quizService from '../../services/quizService';
import QuizCard from '../../components/quizzes/QuizCard';
import EmptyState from '../../components/common/EmptyState';

export default function QuizListPage({ onSelectQuiz, onCreateNew }) {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quizToDelete, setQuizToDelete] = useState(null);

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      const res = await quizService.getAllQuizzes();
      setQuizzes(res.data || []);
    } catch (err) {
      console.error("Failed to load quizzes", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await quizService.deleteQuiz(id);
      setQuizzes((prev) => prev.filter((q) => q._id !== id));
      setQuizToDelete(null);
    } catch (err) {
      console.error("Failed to delete quiz", err);
    }
  };

  if (!loading && quizzes.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <EmptyState
          title="No quizzes yet"
          description="Create manual quizzes or upload a spreadsheet"
          actionLabel="Create New Quiz"
          onAction={onCreateNew}
        />
      </div>
    );
  }

  return (
    <div className="px-6 py-10 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-100">My Quizzes</h2>
          <p className="text-sm text-emerald-300/100 mt-1 font-medium">
            Manage your evaluation assessments
          </p>
        </div>

        <button
          onClick={onCreateNew}
          className="px-5 py-2.5 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600 transition"
        >
          + Create New Quiz
        </button>
      </div>

      <div className="h-px bg-slate-800 mb-8 w-full block"></div>

      {loading ? (
        <div className="text-center py-20 text-slate-400">Loading quizzes...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {quizzes.map((quiz) => (
            <QuizCard
              key={quiz._id}
              quiz={quiz}
              onStart={onSelectQuiz}
              onDelete={() => setQuizToDelete(quiz)}
            />
          ))}
        </div>
      )}

      {/* Delete Modal */}
      {quizToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setQuizToDelete(null)} />
          <div className="relative bg-[#111] border border-slate-800 rounded-2xl w-full max-w-sm p-6 shadow-xl">
            <h3 className="font-bold text-lg text-white mb-2">Delete Quiz</h3>
            <p className="text-slate-400 text-sm mb-6">
              Are you sure you want to delete <span className="font-semibold text-slate-200">{quizToDelete.title}</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setQuizToDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-white hover:bg-slate-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(quizToDelete._id)}
                className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
