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
  const [previewData, setPreviewData] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  /* =========================
     RESET STATE WHEN OPEN
  ========================= */
  useEffect(() => {
    if (isOpen) {
      setIsCreatingNew(false);
      setNewSetName("");
      setError("");
      setPreviewData(null);
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
  const handleGenerate = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isCreatingNew && !newSetName.trim()) {
        setError("Please enter a name for the new set");
        setLoading(false);
        return;
      }

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

      let generatedItems = generateRes.data.data;

      if (!generatedItems || generatedItems.length === 0) {
        setError("AI failed to generate content. Please try again.");
        return;
      }

      if (actionType === "quiz") {
        generatedItems = generatedItems.map(q => {
          const correctText = typeof q.correctAnswer === 'string' ? q.correctAnswer.toLowerCase() : '';
          let cIndex = (q.options || []).findIndex(o => o && o.toLowerCase() === correctText);
          if (cIndex === -1) {
            if (correctText === "a") cIndex = 0;
            else if (correctText === "b") cIndex = 1;
            else if (correctText === "c") cIndex = 2;
            else if (correctText === "d") cIndex = 3;
            else cIndex = 0;
          }
          return {
            ...q,
            options: q.options || [],
            correctAnswer: cIndex
          };
        });
      }

      setPreviewData(generatedItems);
    } catch (err) {
      console.error(`Failed to generate ${actionType}:`, err);
      setError(err.response?.data?.error || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setError("");
    setIsSaving(true);

    try {
      /* ===== 2. SAVE ===== */
      let finalSetId = selectedSetId;

      if (isCreatingNew || sets.length === 0) {
        // Create new set
        const createPath =
          actionType === "flashcard"
            ? "/api/flashcards/manual"
            : "/api/quizzes/manual";

        const createPayload =
          actionType === "flashcard"
            ? {
                title: newSetName,
                cards: previewData,
                sourceType: "document",
                documentId,
              }
            : {
                title: newSetName,
                questions: previewData,
                sourceType: "document",
                documentId,
              };

        const createRes = await axiosInstance.post(createPath, createPayload);
        finalSetId = createRes.data.data._id;
      } else {
        // Append to existing set
        const appendPath =
          actionType === "flashcard"
            ? `/api/flashcards/${selectedSetId}/add-cards`
            : `/api/quizzes/${selectedSetId}/add-questions`;

        const appendPayload =
          actionType === "flashcard"
            ? { cards: previewData }
            : { questions: previewData };

        await axiosInstance.post(appendPath, appendPayload);
      }

      /* ===== SUCCESS ===== */
      onSuccess(actionType, finalSetId);
      onClose();
    } catch (err) {
      console.error(`Failed to save ${actionType}:`, err);
      setError(err.response?.data?.error || "An error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-indigo-900/20 backdrop-blur-sm">
      <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto glass-card p-6 space-y-4 text-ink flex flex-col">
        
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-ink">
            {actionType === "flashcard"
              ? "Generate Flashcards"
              : "Generate Quiz"}
          </h2>
          <button
            onClick={onClose}
            className="text-body hover:text-ink transition"
          >
            <X size={20} />
          </button>
        </div>

        <hr className="border-hairline" />

        {/* FORM OR PREVIEW */}
        {!previewData ? (
          <form onSubmit={handleGenerate} className="space-y-6">
            
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-xl border border-red-200">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <label className="text-xs uppercase tracking-widest text-body font-semibold">
                Save to
              </label>

              {/* EXISTING SET */}
              {sets.length > 0 && (
                <div
                  className={`flex items-start p-4 border-2 rounded-xl cursor-pointer transition ${
                    !isCreatingNew
                      ? "bg-white/80 border-purple-400 shadow-sm"
                      : "bg-white/40 border-white/60 hover:bg-white/60"
                  }`}
                  onClick={() => setIsCreatingNew(false)}
                >
                  <input
                    type="radio"
                    checked={!isCreatingNew}
                    onChange={() => setIsCreatingNew(false)}
                    className="mt-1 mr-3 accent-purple-500 w-4 h-4"
                  />
                  <div className="flex-1">
                    <p className={`text-sm font-semibold mb-2 ${!isCreatingNew ? 'text-purple-700' : 'text-ink'}`}>
                      Existing Set
                    </p>
                    {!isCreatingNew && (
                      <select
                        value={selectedSetId}
                        onChange={(e) => setSelectedSetId(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-white/50 border border-white/60 text-ink focus:outline-none focus:ring-2 focus:ring-purple-400/50 shadow-inner text-sm"
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
                className={`flex items-start p-4 border-2 rounded-xl cursor-pointer transition ${
                  isCreatingNew || sets.length === 0
                    ? "bg-white/80 border-purple-400 shadow-sm"
                    : "bg-white/40 border-white/60 hover:bg-white/60"
                }`}
                onClick={() => setIsCreatingNew(true)}
              >
                <input
                  type="radio"
                  checked={isCreatingNew || sets.length === 0}
                  onChange={() => setIsCreatingNew(true)}
                  className="mt-1 mr-3 accent-purple-500 w-4 h-4"
                />
                <div className="flex-1">
                  <p className={`text-sm font-semibold ${isCreatingNew || sets.length === 0 ? 'text-purple-700' : 'text-ink'}`}>
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
                      className="w-full mt-3 px-4 py-3 rounded-xl bg-white/50 border border-white/60 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400/50 shadow-inner text-sm text-ink"
                      onClick={(e) => e.stopPropagation()}
                    />
                  )}
                </div>
              </div>
            </div>

            <hr className="border-hairline" />

            {/* ACTION BUTTONS */}
            <div className="flex gap-4 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 py-3 rounded-xl bg-white/60 border border-white/50 hover:bg-white/80 transition font-semibold text-body"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-md transition-all bg-gradient-to-r from-purple-400 to-indigo-400 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-500/20 hover:shadow-lg"
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  "Generate"
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-xl border border-red-200">
                {error}
              </div>
            )}
            <div>
              <h4 className="text-sm font-bold text-primary uppercase tracking-widest">Review Generated Items</h4>
            </div>
            
            <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
              {previewData.map((item, idx) => (
                <div key={idx} className="bg-white/50 border border-white/60 rounded-xl p-5 shadow-sm space-y-4">
                  {actionType === "flashcard" ? (
                    <>
                      <div>
                        <label className="text-xs text-body uppercase tracking-widest font-semibold mb-2 block">Question</label>
                        <textarea 
                          value={item.question}
                          onChange={(e) => {
                            const newData = [...previewData];
                            newData[idx].question = e.target.value;
                            setPreviewData(newData);
                          }}
                          className="w-full bg-white/60 border border-white/50 rounded-xl p-3 text-sm text-ink focus:border-purple-400 focus:ring-1 focus:ring-purple-400 outline-none resize-none shadow-inner"
                          rows={2}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-body uppercase tracking-widest font-semibold mb-2 block">Answer</label>
                        <textarea 
                          value={item.answer}
                          onChange={(e) => {
                            const newData = [...previewData];
                            newData[idx].answer = e.target.value;
                            setPreviewData(newData);
                          }}
                          className="w-full bg-white/60 border border-white/50 rounded-xl p-3 text-sm text-ink focus:border-purple-400 focus:ring-1 focus:ring-purple-400 outline-none resize-none shadow-inner"
                          rows={2}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                         <label className="text-xs text-body uppercase tracking-widest font-semibold mb-2 block">Question</label>
                         <textarea 
                          value={item.question}
                          onChange={(e) => {
                            const newData = [...previewData];
                            newData[idx].question = e.target.value;
                            setPreviewData(newData);
                          }}
                          className="w-full bg-white/60 border border-white/50 rounded-xl p-3 text-sm text-ink focus:border-purple-400 focus:ring-1 focus:ring-purple-400 outline-none resize-none shadow-inner"
                          rows={2}
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-xs text-body uppercase tracking-widest font-semibold block">Options (Select correct)</label>
                        {(item.options || []).map((opt, oIdx) => (
                          <div key={oIdx} className="flex items-center gap-3">
                            <input 
                              type="radio" 
                              name={`h-correct-${idx}`}
                              checked={item.correctAnswer === oIdx}
                              onChange={() => {
                                const newData = [...previewData];
                                newData[idx].correctAnswer = oIdx;
                                setPreviewData(newData);
                              }}
                              className="accent-purple-500 w-4 h-4"
                            />
                            <input 
                              value={opt}
                              onChange={(e) => {
                                const newData = [...previewData];
                                newData[idx].options[oIdx] = e.target.value;
                                setPreviewData(newData);
                              }}
                              className={`flex-1 bg-white/60 border rounded-xl p-2.5 text-sm outline-none shadow-inner focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition ${item.correctAnswer === oIdx ? 'border-purple-400 text-purple-700 font-medium bg-purple-50/50' : 'border-white/50 text-ink'}`}
                            />
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            <hr className="border-hairline" />

            <div className="flex gap-4 pt-2">
              <button
                type="button"
                onClick={() => setPreviewData(null)}
                disabled={isSaving}
                className="flex-1 py-3 rounded-xl bg-white/60 border border-white/50 hover:bg-white/80 transition font-semibold text-body"
              >
                Back
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-md transition-all bg-gradient-to-r from-purple-400 to-indigo-400 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-500/20 hover:shadow-lg"
              >
                {isSaving ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  "Save to Set"
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}