import { useEffect, useState, useMemo } from "react";
import Flashcard from "./Flashcard";
import flashcardService from "../../services/flashcardService";
import axiosInstance from "../../utils/axiosInstance";
import API_PATHS from "../../utils/apiPaths";
import { Trash2, Clock } from "lucide-react";
import GenerateFlashcardModal from "./GenerateFlashcardModal";
import { ArrowLeft } from "lucide-react";
import EmptyState from "../common/EmptyState";

export default function FlashcardManager({ documentId }) {
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
              <h2 className="text-3xl font-bold text-slate-100">
                Flashcard Sets
              </h2>
              <p className="text-sm text-emerald-300/100 mt-1 font-medium">
                Reviewing {sets.length} generated concepts from your document
              </p>
            </div>

            <button
              onClick={() => setShowGenerateModal(true)}
              className="px-5 py-2.5 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600"
            >
              + Generate Flashcard
            </button>
          </div>

          {loading && <p className="text-slate-400">Loading...</p>}

          {!loading && sets.length === 0 && (
            <p className="text-slate-400">No flashcard sets yet</p>
          )}

          {/* Divider */}
          <div className="h-px bg-slate-700 mb-8"></div>

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
                  className="
    relative
    aspect-[8/5]
    flex
    flex-col
    rounded-2xl
    p-5
    bg-gradient-to-br
    from-[#06281f]
    via-[#063328]
    to-[#041c15]
    text-white
    border
    border-emerald-800/40
    shadow-lg
    hover:border-emerald-400
    hover:-translate-y-1
    hover:shadow-xl
    transition-all
  "
                >
                  {/* DELETE */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSetToDelete(set);
                    }}
                    className="absolute top-4 right-4 text-red-300 hover:text-red-400"
                  >
                    <Trash2 size={16} />
                  </button>

                  <button
                    onClick={() => {
                      setActiveSet(set);
                      setCurrentIndex(0);
                    }}
                    className="flex flex-col h-full w-full text-left justify-between"
                  >
                    {/* TOP CONTENT */}
                    <div className="space-y-3">
                      {/* TITLE */}
                      <h3 className="text-lg font-semibold">Flashcard Sets</h3>

                      {/* CREATED */}
                      <div className="text-xs text-emerald-300/70 uppercase tracking-widest flex items-center gap-1.5">
                        <Clock size={12} />
                        <span>Created {lastStudy}</span>
                      </div>

                      {/* CARD COUNT */}
                      <div className="inline-block w-fit px-5 py-2 bg-emerald-900/40 text-emerald-200 rounded-xl text-sm font-semibold">
                        {set.count} cards
                      </div>
                    </div>

                    {/* BOTTOM CONTENT */}
                    <div className="space-y-5">
                      {/* PROGRESS */}
                      <div>
                        <div className="flex justify-between text-xs text-emerald-200 space-y-1 mt-3">
                          <span>MASTERY PROGRESS</span>
                          <span>{progress}%</span>
                        </div>

                        <div className="w-full h-2 bg-emerald-950 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-400 transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      {/* STUDY BUTTON */}
                      <div className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-center font-medium transition">
                        Study Now
                      </div>
                    </div>
                  </button>
                </div>
              );
            })}
          </div>

          {/* DELETE MODAL */}
          {setToDelete && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl p-6 w-full max-w-sm space-y-4">
                <h3 className="font-bold text-lg">Delete flashcard set?</h3>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setSetToDelete(null)}
                    className="px-4 py-2 rounded-xl border"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleDeleteFlashcardSet}
                    disabled={deleting}
                    className="px-4 py-2 rounded-xl bg-red-600 text-white"
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
    text-emerald-200
    hover:text-white
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
          className="px-4 py-2 rounded-lg bg-slate-100 disabled:opacity-40"
        >
          ← Previous
        </button>

        <span className="text-sm font-medium text-slate-600">
          {currentIndex + 1} / {activeSet.cards.length}
        </span>

        <button
          disabled={currentIndex === activeSet.cards.length - 1}
          onClick={() => setCurrentIndex((i) => i + 1)}
          className="px-4 py-2 rounded-lg bg-slate-100 disabled:opacity-40"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
