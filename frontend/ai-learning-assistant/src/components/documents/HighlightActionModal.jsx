import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { X, Loader2 } from "lucide-react";

export default function HighlightActionModal({
  isOpen,
  onClose,
  actionType, // 'flashcard' | 'quiz'
  text,
  documentId,
  documentTitle,
  onSuccess,
}) {
  const [sets, setSets] = useState([]);
  const [selectedSetId, setSelectedSetId] = useState("");
  const [newSetName, setNewSetName] = useState("");
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* =========================
     RESET STATE WHEN OPEN
  ========================= */
  useEffect(() => {
    if (isOpen) {
      setIsCreatingNew(false);
      setNewSetName("");
      setError("");
    }
  }, [isOpen]);

  /* =========================
     FETCH SETS
  ========================= */
  useEffect(() => {
    if (isOpen && documentId) {
      fetchSets();
    }
  }, [isOpen, documentId, actionType]);

  const fetchSets = async () => {
    try {
      const path =
        actionType === "flashcard"
          ? API_PATHS.FLASHCARDS.GET_FLASHCARDS_FOR_DOC(documentId)
          : API_PATHS.QUIZZES.GET_QUIZZES_FOR_DOC(documentId);

      const res = await axiosInstance.get(path);
      const data = res.data?.data || [];

      setSets(data);

      if (data.length > 0) {
        setSelectedSetId(data[0]._id);
      }
    } catch (err) {
      console.error(`Failed to fetch ${actionType} sets:`, err);
    }
  };

  /* =========================
     HANDLE SUBMIT
  ========================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      /* ===== 1. GENERATE ===== */
      const generatePath =
        actionType === "flashcard"
          ? "/api/ai/generate-flashcards-from-text"
          : "/api/ai/generate-quiz-from-text";

      const payload =
        actionType === "flashcard"
          ? { text, count: 2, documentId }
          : { text, numQuestions: 2, documentId };

      const generateRes = await axiosInstance.post(generatePath, payload);

      const generatedItems = generateRes.data.data;

      if (!generatedItems || generatedItems.length === 0) {
        setError("AI failed to generate content. Please try again.");
        return;
      }

      /* ===== 2. SAVE ===== */
      if (isCreatingNew || sets.length === 0) {
        // Create new set
        if (!newSetName.trim()) {
          setError("Please enter a name for the new set");
          return;
        }

        const createPath =
          actionType === "flashcard"
            ? "/api/flashcards/manual"
            : "/api/quizzes/manual";

        const createPayload =
          actionType === "flashcard"
            ? {
                title: newSetName,
                cards: generatedItems,
                sourceType: "manual",
                documentId,
              }
            : {
                title: newSetName,
                questions: generatedItems,
                sourceType: "manual",
                documentId,
              };

        await axiosInstance.post(createPath, createPayload);
      } else {
        // Append to existing set
        const appendPath =
          actionType === "flashcard"
            ? `/api/flashcards/${selectedSetId}/add-cards`
            : `/api/quizzes/${selectedSetId}/add-questions`;

        const appendPayload =
          actionType === "flashcard"
            ? { cards: generatedItems }
            : { questions: generatedItems };

        await axiosInstance.post(appendPath, appendPayload);
      }

      /* ===== SUCCESS ===== */
      onSuccess(actionType);
      onClose();
    } catch (err) {
      console.error(`Failed to save ${actionType}:`, err);
      setError(err.response?.data?.error || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-[#0e2a22] border border-emerald-800 rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
        
        {/* HEADER */}
        <div className="flex items-center justify-between p-4 border-b border-emerald-900 bg-[#061f18]">
          <h2 className="text-lg font-bold text-emerald-100">
            {actionType === "flashcard"
              ? "Generate Flashcards"
              : "Generate Quiz"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-emerald-400 hover:text-white hover:bg-emerald-800 rounded-lg transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          
          {error && (
            <div className="p-3 text-sm text-red-200 bg-red-900/50 rounded-lg border border-red-800">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <label className="text-sm font-semibold text-emerald-200">
              Save to:
            </label>

            {/* EXISTING SET */}
            {sets.length > 0 && (
              <div
                className={`flex items-center p-3 border rounded-lg cursor-pointer transition ${
                  !isCreatingNew
                    ? "bg-emerald-900/40 border-emerald-500"
                    : "bg-[#061f18] border-emerald-900 hover:bg-emerald-900/20"
                }`}
                onClick={() => setIsCreatingNew(false)}
              >
                <input
                  type="radio"
                  checked={!isCreatingNew}
                  onChange={() => setIsCreatingNew(false)}
                  className="mr-3 accent-emerald-500"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-emerald-100 mb-2">
                    Existing Set
                  </p>
                  {!isCreatingNew && (
                    <select
                      value={selectedSetId}
                      onChange={(e) => setSelectedSetId(e.target.value)}
                      className="w-full p-2 text-sm bg-black border border-emerald-800 rounded-lg text-emerald-100"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {sets.map((set) => (
                        <option key={set._id} value={set._id}>
                          {set.title} (
                          {actionType === "flashcard"
                            ? `${set.count} cards`
                            : `${set.totalQuestions} questions`}
                          )
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            )}

            {/* CREATE NEW */}
            <div
              className={`flex items-center p-3 border rounded-lg cursor-pointer transition ${
                isCreatingNew || sets.length === 0
                  ? "bg-emerald-900/40 border-emerald-500"
                  : "bg-[#061f18] border-emerald-900 hover:bg-emerald-900/20"
              }`}
              onClick={() => setIsCreatingNew(true)}
            >
              <input
                type="radio"
                checked={isCreatingNew || sets.length === 0}
                onChange={() => setIsCreatingNew(true)}
                className="mr-3 accent-emerald-500"
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-emerald-100">
                  Create New Set
                </p>
                {(isCreatingNew || sets.length === 0) && (
                  <input
                    type="text"
                    value={newSetName}
                    onChange={(e) => setNewSetName(e.target.value)}
                    placeholder={`${documentTitle} - ${
                      actionType === "flashcard"
                        ? "Flashcards"
                        : "Quiz"
                    }`}
                    className="w-full mt-2 p-2 text-sm bg-black border border-emerald-800 rounded-lg text-emerald-100"
                    onClick={(e) => e.stopPropagation()}
                  />
                )}
              </div>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex justify-end pt-4 space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm text-emerald-100 border border-emerald-800 rounded-lg"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center px-4 py-2 text-sm font-bold text-white bg-emerald-600 rounded-lg min-w-[100px]"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                "Generate"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}