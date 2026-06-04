import { useEffect, useState, useMemo } from "react";
import Flashcard from "./Flashcard";
import flashcardService from "../../services/flashcardService";
import axiosInstance from "../../utils/axiosInstance";
import API_PATHS from "../../utils/apiPaths";
import { Trash2, Clock, Layers, Play } from "lucide-react";
import GenerateFlashcardModal from "./GenerateFlashcardModal";
import { ArrowLeft } from "lucide-react";
import EmptyState from "../common/EmptyState";

export default function FlashcardManager({ documentId, documentTitle }) {
  const [sets, setSets] = useState([]);
  const [activeSet, setActiveSet] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const [setToDelete, setSetToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [showGenerateModal, setShowGenerateModal] = useState(false);

  /* ================= DERIVED ================= */

  const sortedSets = useMemo(() => {
    return [...sets].sort((a, b) => a.count - b.count);
  }, [sets]);

  const currentCard = activeSet?.cards[currentIndex];

  /* ================= LOAD SETS ================= */

  useEffect(() => {
    if (!currentCard?._id) return;

    handleReview(currentCard._id);
  }, [currentCard?._id]);

  useEffect(() => {
    if (!documentId) return;

    loadFlashcards();

    setActiveSet(null);
    setCurrentIndex(0);
  }, [documentId]);

  const loadFlashcards = async () => {
    try {
      setLoading(true);

      const res = await flashcardService.getFlashcardsByDocument(documentId);

      setSets(res.data || []);
    } catch (err) {
      console.error("Load flashcards failed", err);
      setSets([]);
    } finally {
      setLoading(false);
    }
  };

  /* ================= GENERATE ================= */

  const handleGenerate = async (countValue) => {
    if (!documentId || !countValue) return;

    const existingSet = sets.find(
      (s) =>
        (s.documentId?._id || s.documentId) === documentId &&
        s.count === countValue,
    );

    if (existingSet) {
      setActiveSet(existingSet);
      setCurrentIndex(0);
      return;
    }

    try {
      setGenerating(true);

      const res = await axiosInstance.post(API_PATHS.AI.GENERATE_FLASHCARDS, {
        documentId,
        count: countValue,
      });

      const newSet = res.data.data;

      setSets((prev) => [newSet, ...prev]);
      setActiveSet(newSet);
      setCurrentIndex(0);
    } catch (err) {
      console.error("Generate failed", err);
    } finally {
      setGenerating(false);
    }
  };

  /* ================= DELETE SET ================= */

  const handleDeleteFlashcardSet = async () => {
    try {
      setDeleting(true);

      await flashcardService.deleteFlashcardSet(setToDelete._id);

      setSets((prev) => prev.filter((set) => set._id !== setToDelete._id));

      if (activeSet?._id === setToDelete._id) {
        setActiveSet(null);
      }

      setSetToDelete(null);
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  /* ================= CARD ACTIONS ================= */

  const handleToggleStar = async (cardId) => {
    try {
      const res = await flashcardService.toggleStar(cardId);

      const updatedSet = res.data?.data;

      if (!updatedSet) return;

      setActiveSet(updatedSet);

      setSets((prev) =>
        prev.map((set) => (set?._id === updatedSet._id ? updatedSet : set)),
      );
    } catch (err) {
      console.error("Toggle star failed", err);
    }
  };

  const handleReview = async (cardId) => {
    try {
      const res = await flashcardService.reviewFlashcard(cardId);

      const updatedSet = res.data?.data;

      if (!updatedSet) return;

      setActiveSet(updatedSet);

      setSets((prev) =>
        prev.map((set) => (set?._id === updatedSet._id ? updatedSet : set)),
      );
    } catch (err) {
      console.error("Review failed", err);
    }
  };

  if (!loading && sets.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <EmptyState
          title="No flashcard sets yet"
          description="Generate flashcards from this document"
          actionLabel="Create your first flashcard"
          onAction={() => setShowGenerateModal(true)}
          generating={generating}
        />

        <GenerateFlashcardModal
          open={showGenerateModal}
          onClose={() => setShowGenerateModal(false)}
          onGenerate={handleGenerate}
          generating={generating}
        />
      </div>
    );
  }

  /* ======================================================
     ================= FLASHCARD SET LIST =================
     ====================================================== */

  if (!activeSet) {
    return (
      <>
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-ink">
                Flashcard Sets
              </h2>
              <p className="text-sm text-body mt-1 font-medium">
                Reviewing {sets.length} generated concepts from your document
              </p>
            </div>

            <button
              onClick={() => setShowGenerateModal(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-400 to-indigo-400 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold px-5 py-2.5 rounded-xl shadow-md shadow-purple-500/20 hover:shadow-lg transition-all"
            >
              + Generate Flashcard
            </button>
          </div>

          {loading && <p className="text-slate-400">Loading...</p>}

          {!loading && sets.length === 0 && (
            <p className="text-slate-400">No flashcard sets yet</p>
          )}

          {/* Divider */}
          <div className="h-px bg-hairline mb-8"></div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {sortedSets.map((set) => {
              const progress = set.masteryProgress || 0;

              const lastReviewed = set.cards?.reduce((latest, card) => {
                if (!card.lastReviewed) return latest;

                const date = new Date(card.lastReviewed);

                return !latest || date > latest ? date : latest;
              }, null);

              const lastStudy = lastReviewed
                ? new Date(set.createdAt).toLocaleDateString()
                : "";

              return (
                <div
                  key={set._id}
                  onClick={() => {
                    setActiveSet(set);
                    setCurrentIndex(0);
                  }}
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
                    <h3 className="text-[18px] font-bold text-ink mb-2 group-hover:text-purple-600 transition-colors line-clamp-2" title={set.title || documentTitle || "Flashcard Set"}>
                      {set.title || documentTitle || "Flashcard Set"}
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
        <GenerateFlashcardModal
          open={showGenerateModal}
          onClose={() => setShowGenerateModal(false)}
          onGenerate={handleGenerate}
          generating={generating}
        />
      </>
    );
  }

  /* ======================================================
     ================= STUDY MODE =========================
     ====================================================== */

  return (
    <div className="flex flex-col items-center space-y-10">
      <div className="w-full mb-6">
        <button
          onClick={() => {
            setActiveSet(null);
            loadFlashcards();
          }}
          className="
    inline-flex items-center gap-2
    text-sm font-medium
    text-body
    hover:text-ink
    transition-all duration-200
    hover:-translate-x-0.5
  "
        >
          <ArrowLeft size={16} />
          Back to Sets
        </button>
      </div>

      {currentCard && (
        <Flashcard
          key={currentCard._id}
          card={currentCard}
          onToggleStar={handleToggleStar}
          onReview={handleReview}
        />
      )}

      <div className="flex items-center gap-8">
        <button
          disabled={currentIndex === 0}
          onClick={() => setCurrentIndex((i) => i - 1)}
          className="px-4 py-2 rounded-lg bg-canvas-card border border-hairline text-ink disabled:opacity-40 hover:bg-canvas-mid transition"
        >
          ← Previous
        </button>

        <span className="text-sm font-medium text-body">
          {currentIndex + 1} / {activeSet.cards.length}
        </span>

        <button
          disabled={currentIndex === activeSet.cards.length - 1}
          onClick={() => setCurrentIndex((i) => i + 1)}
          className="px-4 py-2 rounded-lg bg-canvas-card border border-hairline text-ink disabled:opacity-40 hover:bg-canvas-mid transition"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
