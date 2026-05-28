import React, { useEffect, useState, useMemo } from 'react';
import quizService from '../../services/quizService';
import QuizCard from '../../components/quizzes/QuizCard';
import EmptyState from '../../components/common/EmptyState';
import { Search, Grid, List } from 'lucide-react';

export default function QuizListPage({ onSelectQuiz, onCreateNew }) {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quizToDelete, setQuizToDelete] = useState(null);

  const [search, setSearch] = useState("");
  const [view, setView] = useState("grid");

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

  const filteredQuizzes = useMemo(() => {
    return quizzes.filter((quiz) =>
      quiz.title?.toLowerCase().includes(search.toLowerCase())
    );
  }, [quizzes, search]);

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
    <div className="p-8 max-w-7xl mx-auto space-y-8 text-ink">
      {/* HEADER CONTAINER */}
      <div className="space-y-6">
        {/* ROW 1 */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-ink">My Quizzes</h2>
            <p className="text-sm text-body mt-1 font-medium">
              Manage your evaluation assessments
            </p>
          </div>

          <button
            onClick={onCreateNew}
            className="flex items-center gap-2
              bg-gradient-to-r from-purple-400 to-indigo-400 hover:from-purple-500 hover:to-indigo-500
              text-white font-semibold
              px-6 py-3 rounded-xl
              shadow-md shadow-purple-500/20 hover:shadow-lg transition-all"
          >
            + Create New Quiz
          </button>
        </div>

        {/* ROW 2: Filters */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* LEFT TABS */}
          <div className="flex gap-3">
            <button className="px-4 py-2 rounded-xl bg-white/60 text-purple-700 border border-purple-200 shadow-sm font-semibold">
              All Quizzes
            </button>
            <button className="px-4 py-2 rounded-xl bg-white/40 text-body border border-white/40 hover:bg-white/60 transition shadow-sm">
              Recently Added
            </button>
          </div>

          {/* RIGHT CONTROLS */}
          <div className="flex items-center gap-3">
            {/* SEARCH */}
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-body"
              />
              <input
                type="text"
                placeholder="Search quizzes"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 w-56
                  rounded-xl
                  bg-white/60 backdrop-blur-md
                  border border-white/50
                  text-sm text-ink
                  placeholder-gray-400
                  focus:outline-none
                  focus:ring-2
                  focus:ring-purple-400/50 shadow-sm"
              />
            </div>

            {/* SORT */}
            <select
              className="px-3 py-2 rounded-xl
                bg-white/60 backdrop-blur-md
                border border-white/50
                text-sm text-ink
                focus:outline-none shadow-sm"
            >
              <option>Sort by</option>
              <option>Name</option>
              <option>Date</option>
            </select>

            {/* GRID / LIST */}
            <button
              onClick={() => setView("grid")}
              className={`p-2 rounded-xl border border-white/50 shadow-sm transition-colors
                ${view === "grid" ? "bg-white/80 text-purple-600" : "bg-white/40 text-body hover:bg-white/60"}
              `}
            >
              <Grid size={18} />
            </button>

            <button
              onClick={() => setView("list")}
              className={`p-2 rounded-xl border border-white/50 shadow-sm transition-colors
                ${view === "list" ? "bg-white/80 text-purple-600" : "bg-white/40 text-body hover:bg-white/60"}
              `}
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="h-px bg-hairline mb-8 w-full block"></div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
        </div>
      ) : filteredQuizzes.length === 0 ? (
        <div className="text-center py-20 text-body">
          No quizzes found
        </div>
      ) : (
        <div className={
          view === "grid"
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            : "space-y-4"
        }>
          {filteredQuizzes.map((quiz) => (
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
          <div className="absolute inset-0 bg-indigo-900/20 backdrop-blur-sm" onClick={() => setQuizToDelete(null)} />
          <div className="relative glass-card p-6 w-full max-w-sm space-y-4 text-ink">
            <h3 className="font-bold text-lg text-ink mb-2">Delete Quiz</h3>
            <p className="text-body text-sm mb-6">
              Are you sure you want to delete <span className="font-semibold text-ink">{quizToDelete.title}</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setQuizToDelete(null)}
                className="px-4 py-2 rounded-xl bg-white/60 border border-white/50 hover:bg-white/80 transition text-body font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(quizToDelete._id)}
                className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white flex items-center gap-2 shadow-md shadow-red-500/20 transition-all font-semibold"
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
