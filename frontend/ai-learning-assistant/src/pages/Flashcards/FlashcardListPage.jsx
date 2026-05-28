import React, { useEffect, useState, useMemo } from 'react';
import flashcardService from '../../services/flashcardService';
import { Trash2, Clock, Layers, Play, Search, Grid, List } from 'lucide-react';
import EmptyState from '../../components/common/EmptyState';

export default function FlashcardListPage({ onSelectSet, onCreateNew }) {
  const [sets, setSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [setToDelete, setSetToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [search, setSearch] = useState("");
  const [view, setView] = useState("grid");

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

  const filteredSets = useMemo(() => {
    return sets.filter((set) =>
      set.title?.toLowerCase().includes(search.toLowerCase())
    );
  }, [sets, search]);

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
    <div className="p-8 max-w-7xl mx-auto space-y-8 text-ink">
      {/* HEADER CONTAINER */}
      <div className="space-y-6">
        {/* ROW 1 */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-3xl font-bold text-ink">
              Flashcard Sets
            </h2>
            <p className="text-sm text-body mt-1">
              Reviewing {sets.length} decks
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
            + Create New Set
          </button>
        </div>

        {/* ROW 2: Filters */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* LEFT TABS */}
          <div className="flex gap-3">
            <button className="px-4 py-2 rounded-xl bg-white/60 text-purple-700 border border-purple-200 shadow-sm font-semibold">
              All Sets
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
                placeholder="Search flashcards"
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

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
        </div>
      ) : filteredSets.length === 0 ? (
        <div className="text-center py-20 text-body">
          No flashcard sets found
        </div>
      ) : (
        <div className={
          view === "grid"
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            : "space-y-4"
        }>
          {filteredSets.map((set) => {
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
                className="glass-card p-6 hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-500/20 transition-all cursor-pointer group flex flex-col h-full relative overflow-hidden"
              >
                <div className="relative z-10 flex flex-col h-full">
                  {/* HEADER */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-purple-100 rounded-xl text-purple-600 shadow-sm">
                      <Layers className="w-6 h-6" />
                    </div>
                    <div className="px-3 py-1 bg-white/60 shadow-sm rounded-full text-[12px] font-bold text-purple-700 uppercase tracking-[1.4px] border border-white/40">
                      {set.count || set.cards?.length || 0} CARDS
                    </div>
                  </div>

                  {/* TITLE */}
                  <h3 className="text-[18px] font-bold text-ink mb-2 group-hover:text-purple-600 transition-colors line-clamp-2" title={set.title || "Untitled Set"}>
                    {set.title || "Untitled Set"}
                  </h3>

                  {/* DETAILS (Progress) */}
                  <div className="text-body text-sm mb-6 flex flex-col gap-2">
                    <div className="flex justify-between text-[12px]">
                      <span>Mastery Progress</span>
                      <span className="text-purple-600 font-semibold">{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full h-2 bg-black/5 rounded-full overflow-hidden shadow-inner">
                      <div
                        className="h-full bg-gradient-to-r from-purple-400 to-indigo-400 rounded-full"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* FOOTER */}
                  <div className="mt-auto space-y-4">
                    <div className="flex items-center justify-between pt-4 border-t border-hairline">
                      <div className="flex items-center gap-2 text-[12px] text-mute font-medium">
                        <Clock className="w-4 h-4" />
                        Created {lastStudy}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSetToDelete(set);
                          }}
                          className="w-8 h-8 rounded-full bg-white/60 border border-white/40 flex items-center justify-center hover:bg-red-500 hover:text-white hover:border-red-500 transition-colors text-mute"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <div className="w-8 h-8 rounded-full bg-white/60 border border-white/40 shadow-sm flex items-center justify-center group-hover:bg-purple-500 group-hover:text-white transition-colors">
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
      )}

      {/* DELETE MODAL */}
      {setToDelete && (
        <div className="fixed inset-0 bg-indigo-900/20 backdrop-blur-sm flex items-center justify-center z-[100]">
          <div className="glass-card p-6 w-full max-w-sm space-y-4 text-ink">
            <h3 className="font-bold text-lg text-ink">Delete "{setToDelete.title || "this set"}"?</h3>
            <p className="text-body text-sm">This action cannot be undone.</p>
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setSetToDelete(null)}
                className="px-4 py-2 rounded-xl bg-white/60 border border-white/50 hover:bg-white/80 transition text-body font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteFlashcardSet}
                disabled={deleting}
                className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white flex items-center gap-2 shadow-md shadow-red-500/20 transition-all font-semibold"
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
