import React, { useEffect, useState, useMemo } from 'react';
import flashcardService from '../../services/flashcardService';
import { Trash2, Clock, Layers, Play } from 'lucide-react';
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
          <p className="text-sm text-primary/100 mt-1 font-medium">
            Reviewing {sets.length} decks
          </p>
        </div>

        <button
          onClick={onCreateNew}
          className="px-5 py-2.5 bg-primary text-ink rounded-xl font-semibold hover:bg-emerald-600 transition"
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
              onClick={() => onSelectSet(set)}
              className="bg-canvas-card rounded-md p-6 hover:bg-canvas-mid shadow-[0_8px_8px_rgba(0,0,0,0.3)] transition-all cursor-pointer group flex flex-col h-full relative overflow-hidden"
            >
              <div className="relative z-10 flex flex-col h-full">
                {/* HEADER */}
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-primary/10 rounded-full text-primary">
                    <Layers className="w-6 h-6" />
                  </div>
                  <div className="px-3 py-1 bg-canvas-mid rounded-pill text-[12px] font-bold text-body uppercase tracking-[1.4px]">
                    {set.count || set.cards?.length || 0} CARDS
                  </div>
                </div>

                {/* TITLE */}
                <h3 className="text-[18px] font-bold text-ink mb-2 group-hover:text-primary transition-colors line-clamp-2" title={set.title || "Untitled Set"}>
                  {set.title || "Untitled Set"}
                </h3>

                {/* DETAILS (Progress) */}
                <div className="text-body text-sm mb-6 flex flex-col gap-2">
                  <div className="flex justify-between text-[12px]">
                    <span>Mastery Progress</span>
                    <span className="text-ink font-bold">{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#252525] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-ink rounded-full"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* FOOTER */}
                <div className="mt-auto space-y-4">
                  <div className="flex items-center justify-between pt-4 border-t border-hairline">
                    <div className="flex items-center gap-2 text-[12px] text-mute">
                      <Clock className="w-4 h-4" />
                      Created {lastStudy}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSetToDelete(set);
                        }}
                        className="w-8 h-8 rounded-full bg-canvas-mid flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors text-mute"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="w-8 h-8 rounded-full bg-canvas-mid flex items-center justify-center group-hover:bg-primary group-hover:text-canvas transition-colors">
                        <Play className="w-4 h-4 ml-0.5" />
                      </div>
                    </div>
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
          <div className="bg-[#111] border border-slate-800 rounded-md p-6 w-full max-w-sm space-y-4">
            <h3 className="font-bold text-lg text-ink">Delete "{setToDelete.title || "this set"}"?</h3>
            <p className="text-slate-400 text-sm">This action cannot be undone.</p>
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setSetToDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-ink hover:bg-slate-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteFlashcardSet}
                disabled={deleting}
                className="px-4 py-2 rounded-xl bg-red-600 text-ink hover:bg-red-700 transition"
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
