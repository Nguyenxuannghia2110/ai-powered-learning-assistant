import React, { useEffect, useState, useMemo } from 'react';
import flashcardService from '../../services/flashcardService';
import { Trash2, Clock } from 'lucide-react';
import EmptyState from '../../components/common/EmptyState';

export default function FlashcardListPage({ onSelectSet, onCreateNew }) {
  const [sets, setSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [setToDelete, setSetToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadFlashcards();
  }, []);

  const loadFlashcards = async () => {
    try {
      setLoading(true);
      const res = await flashcardService.getAllFlashcardSets();
      setSets(res.data || []);
    } catch (err) {
      console.error("Load flashcards failed", err);
      setSets([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFlashcardSet = async () => {
    try {
      setDeleting(true);
      await flashcardService.deleteFlashcardSet(setToDelete._id);
      setSets((prev) => prev.filter((set) => set._id !== setToDelete._id));
      setSetToDelete(null);
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  if (!loading && sets.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <EmptyState
          title="No flashcard sets yet"
          description="Create a manual dataset or upload from a spreadsheet"
          actionLabel="Create New Set"
          onAction={onCreateNew}
        />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto pt-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-100">
            Flashcard Sets
          </h2>
          <p className="text-sm text-emerald-300/100 mt-1 font-medium">
            Reviewing {sets.length} decks
          </p>
        </div>

        <button
          onClick={onCreateNew}
          className="px-5 py-2.5 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600 transition"
        >
          + Create New Set
        </button>
      </div>

      {loading && <p className="text-slate-400">Loading...</p>}

      {/* Divider */}
      <div className="h-px bg-slate-800 mb-8 w-full block"></div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {sets.map((set) => {
          const progress = set.masteryProgress || 0;
          
          let lastStudy = new Date(set.createdAt).toLocaleDateString();
          const lastReviewed = set.cards?.reduce((latest, card) => {
            if (!card.lastReviewed) return latest;
            const date = new Date(card.lastReviewed);
            return !latest || date > latest ? date : latest;
          }, null);

          if (lastReviewed) {
             lastStudy = lastReviewed.toLocaleDateString();
          }

          return (
            <div
              key={set._id}
              className="relative aspect-[8/5] flex flex-col rounded-2xl p-5 bg-gradient-to-br from-[#06281f] via-[#063328] to-[#041c15] text-white border border-emerald-800/40 shadow-lg hover:border-emerald-400 hover:-translate-y-1 hover:shadow-xl transition-all cursor-pointer group"
              onClick={() => onSelectSet(set)}
            >
              {/* DELETE */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSetToDelete(set);
                }}
                className="absolute top-4 right-4 text-red-300 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-400 z-10"
              >
                <Trash2 size={16} />
              </button>

              <div className="flex flex-col h-full w-full text-left justify-between">
                {/* TOP CONTENT */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold truncate pr-6" title={set.title}>{set.title || "Untitled Set"}</h3>

                  <div className="text-xs text-emerald-300/70 uppercase tracking-widest flex items-center gap-1.5">
                    <Clock size={12} />
                    <span>Created {lastStudy}</span>
                  </div>

                  <div className="inline-block w-fit px-3 py-1 bg-emerald-900/40 text-emerald-200 rounded-xl text-sm font-semibold">
                    {set.count || set.cards?.length || 0} cards
                  </div>
                </div>

                {/* BOTTOM CONTENT */}
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs text-emerald-200 space-y-1 mt-3">
                      <span>MASTERY PROGRESS</span>
                      <span>{Math.round(progress)}%</span>
                    </div>

                    <div className="w-full h-2 bg-emerald-950 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-400 transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="w-full py-2 bg-emerald-600/20 group-hover:bg-emerald-500 rounded-xl text-center text-sm font-medium transition text-emerald-400 group-hover:text-white">
                    Study Now
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* DELETE MODAL */}
      {setToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100]">
          <div className="bg-[#111] border border-slate-800 rounded-2xl p-6 w-full max-w-sm space-y-4">
            <h3 className="font-bold text-lg text-white">Delete "{setToDelete.title || "this set"}"?</h3>
            <p className="text-slate-400 text-sm">This action cannot be undone.</p>
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setSetToDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-white hover:bg-slate-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteFlashcardSet}
                disabled={deleting}
                className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 transition"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
