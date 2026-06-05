import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useParams } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";

import ChatInterface from "../../components/chat/ChatInterface";
import Tabs from "../../components/common/Tabs";
import AiActions from "../../components/ai/AiActions";
import FlashcardManager from "../../components/flashcards/FlashcardManager";
import QuizManager from "../../components/quizzes/QuizManager";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MessageSquare, Zap, Target, BookOpen, MoreHorizontal } from "lucide-react";
import AiResultModal from "../../components/common/AiResultModal";
import HighlightActionModal from "../../components/documents/HighlightActionModal";
import toast from "react-hot-toast";

const DOCUMENT_TABS = [
  { key: "content", label: "Content" },
  { key: "chat", label: "Chat" },
  { key: "ai", label: "AI Actions" },
  { key: "flashcards", label: "Flashcards" },
  { key: "quizzes", label: "Quizzes" },
];

export default function DocumentDetailPage() {
  const { id } = useParams();
  const [chatHistoryId, setChatHistoryId] = useState(null);
  const [document, setDocument] = useState(null);
  const [activeTab, setActiveTab] = useState("content");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [showChatPanel, setShowChatPanel] = useState(false);
  const [showExtractedText, setShowExtractedText] = useState(false);

  // States for text highlighting
  const [highlightRect, setHighlightRect] = useState(null);
  const [highlightedText, setHighlightedText] = useState("");

  // States for Explain Modal
  const [explainOpen, setExplainOpen] = useState(false);
  const [explainLoading, setExplainLoading] = useState(false);
  const [explainTitle, setExplainTitle] = useState("");
  const [explainResult, setExplainResult] = useState("");
  const [explainCached, setExplainCached] = useState(false);

  // States for Action Modal (Flashcard / Quiz)
  const [modalOpen, setModalOpen] = useState(false);
  const [modalActionType, setModalActionType] = useState("flashcard");
  
  // Track selected set ID so subsequent highlights auto-append
  const [selectedFlashcardSetId, setSelectedFlashcardSetId] = useState(null);
  const [selectedQuizSetId, setSelectedQuizSetId] = useState(null);

  const clearHighlight = () => {
    setHighlightRect(null);
    setHighlightedText("");
    window.getSelection()?.removeAllRanges();
  };

  useEffect(() => {
    window.addEventListener("scroll", clearHighlight);
    return () => window.removeEventListener("scroll", clearHighlight);
  }, []);

  useEffect(() => {
    if (activeTab !== "content") {
      setShowChatPanel(false);
    }
  }, [activeTab]);

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const res = await axiosInstance.get(
          API_PATHS.DOCUMENTS.GET_DOCUMENT_BY_ID(id),
        );
        setDocument(res.data.data);
      } catch (err) {
        console.error("Failed to fetch document", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [id]);

  if (loading) {
    return <div className="p-6">Loading document...</div>;
  }

  if (!document) {
    return <div className="p-6">Document not found</div>;
  }
  

  /* =======================
     TEXT HIGHLIGHT LOGIC
     ======================= */
  const handleMouseUp = () => {
    const selection = window.getSelection();
    if (!selection) return;

    const text = selection.toString().trim();
    if (text.length === 0) {
      setHighlightRect(null);
      return;
    }

    if (activeTab === "content" && text.length > 5) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      setHighlightedText(text);
      setHighlightRect({
        top: rect.top + window.scrollY - 10,
        left: rect.left + window.scrollX + rect.width / 2,
      });
    }
  };



  const handleExplain = async () => {
    setHighlightRect(null);
    setExplainTitle(`Explain: ${highlightedText.substring(0, 30)}...`);
    setExplainOpen(true);
    setExplainLoading(true);
    setExplainResult("");
    
    try {
      const res = await axiosInstance.post("/api/ai/explain-concept", {
        documentId: document?._id,
        concept: highlightedText,
      });
      setExplainResult(res.data?.data?.explanation || "");
      setExplainCached(res.data?.cached === true);
    } catch {
      setExplainResult("Failed to explain concept.");
    } finally {
      setExplainLoading(false);
    }
  };

  const handleQuickAdd = async (type) => {
    setHighlightRect(null);

    const toastId = toast.loading(`Generating ${type}...`);

    try {
      const preferredSetId =
        type === "flashcard" ? selectedFlashcardSetId : selectedQuizSetId;

      const getSetPath =
        type === "flashcard"
          ? API_PATHS.FLASHCARDS.GET_FLASHCARDS_FOR_DOC(document._id)
          : API_PATHS.QUIZZES.GET_QUIZZES_FOR_DOC(document._id);

      const setsRes = await axiosInstance.get(getSetPath);
      const sets = setsRes.data?.data || [];

      let targetSet = null;
      if (preferredSetId) {
        targetSet = sets.find((s) => s._id === preferredSetId);
      }

      if (!targetSet) {
        toast.dismiss(toastId);
        setModalActionType(type);
        setModalOpen(true);
        return;
      }

      const generatePath =
        type === "flashcard"
          ? "/api/ai/generate-flashcards-from-text"
          : "/api/ai/generate-quiz-from-text";

      const payload =
        type === "flashcard"
          ? { text: highlightedText, count: 1, documentId: document._id }
          : { text: highlightedText, numQuestions: 1, documentId: document._id };

      const genRes = await axiosInstance.post(generatePath, payload);

      let generatedItems = genRes.data.data;

      if (!generatedItems || generatedItems.length === 0) {
        toast.error(`Failed to generate ${type}`, { id: toastId });
        return;
      }

      if (type === "quiz") {
        generatedItems = generatedItems.map(q => {
          if (typeof q.correctAnswer === 'number') return q;
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

      const appendPath =
        type === "flashcard"
          ? `/api/flashcards/${targetSet._id}/add-cards`
          : `/api/quizzes/${targetSet._id}/add-questions`;

      const appendPayload =
        type === "flashcard"
          ? { cards: generatedItems }
          : { questions: generatedItems };

      await axiosInstance.post(appendPath, appendPayload);

      toast.success(
        `${generatedItems.length} ${type}(s) added to "${targetSet.title}"`,
        { id: toastId }
      );

      clearHighlight();
      setActiveTab(type === "flashcard" ? "flashcards" : "quizzes");
    } catch (err) {
      console.error("Quick add error:", err);
      toast.error("Failed to quick add", { id: toastId });
    }
  };

  const openActionModal = (type) => {
    clearHighlight();
    setModalActionType(type);
    setModalOpen(true);
  };

  //////////////////////
  //////////////////////
  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      {/* BACK BUTTON */}
      <button
        onClick={() => navigate("/documents")}
        className="
    inline-flex items-center gap-2
    text-sm text-body
    hover:text-ink
    transition font-medium
    "
      >
        <ArrowLeft size={16} />
        Back to Documents
      </button>

      {/* TITLE */}
      <h1
        className="
    text-4xl
    font-extrabold
    text-ink
    tracking-tight
    "
      >
        {document.title}
      </h1>

      {/* TABS */}
      <Tabs
        tabs={DOCUMENT_TABS}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* TAB CONTENT */}
      <div
        className={`
  grid
  transition-all duration-300
  ${showChatPanel && activeTab === "content" ? "grid-cols-[1fr_420px]" : "grid-cols-1"}
  gap-4
`}
      >
        <div
          className="
  rounded-md
  border border-hairline
  bg-canvas-card
  min-h-[700px]
  overflow-hidden
"
        >
          {activeTab === "content" && (
            <div className="p-4 space-y-4">
              {!document?.filePath ? (
                <div className="flex items-center justify-center h-[400px] text-body">
                  No document file
                </div>
              ) : (
                <>
                  <div className="w-full h-[70vh] rounded-xl overflow-hidden border border-hairline bg-black">
                    <iframe
                      src={document.filePath}
                      title={document.title}
                      className="w-full h-full bg-white rounded-lg"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    {document.extractedText && document.extractedText.trim().length > 50 ? (
                      <button
                        onClick={() => setShowExtractedText((v) => !v)}
                        className="text-sm font-semibold text-primary hover:text-primary transition"
                      >
                        {showExtractedText ? "Hide extracted text" : "Show extracted text"}
                      </button>
                    ) : <div />}
                    <button
                      onClick={() => setShowChatPanel((v) => !v)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition"
                    >
                      Chat
                      <MessageSquare size={20} />
                    </button>
                  </div>
                  {document.extractedText && document.extractedText.trim().length > 50 && showExtractedText && (
                      <div className="text-[15px] text-body font-sans text-justify space-y-6 bg-canvas-mid p-4 rounded-xl border border-hairline shadow-inner max-h-[600px] overflow-auto cursor-text relative" onMouseUp={handleMouseUp} onScroll={clearHighlight}>
                        <h3 className="font-semibold mb-4 text-sm text-primary uppercase tracking-wider sticky top-0 bg-canvas-mid z-10 pb-2 border-b border-hairline">
                          Document Text
                        </h3>
                        <div className="space-y-8">
                          {(document.extractedText.includes('\f') ? document.extractedText.split('\f') : document.extractedText.split('\n'))
                            .filter(p => p.trim().length > 0)
                            .map((pageText, idx) => (
                            <div key={idx} className="relative bg-white text-gray-800 p-8 md:p-12 max-w-4xl mx-auto rounded-md shadow-[0_2px_10px_rgba(0,0,0,0.08)] border border-gray-200">
                              <span className="absolute top-3 right-5 text-xs font-bold text-gray-400 select-none">
                                PAGE {idx + 1}
                              </span>
                              <p className="whitespace-pre-wrap leading-relaxed text-[15px] font-sans mt-4 text-justify">
                                {pageText}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                  )}
                </>
              )}
            </div>
          )}

          {activeTab === "chat" && document?._id && (
            <ChatInterface document={document._id} />
          )}

          {activeTab === "ai" && <AiActions documentId={document._id} />}

          {activeTab === "flashcards" && (
            <FlashcardManager documentId={document._id} documentTitle={document.title} />
          )}

          {activeTab === "quizzes" && <QuizManager documentId={document._id} />}
        </div>
        {showChatPanel && activeTab === "content" && (
          <div
            className="
    rounded-md
border border-hairline
bg-canvas-card
overflow-hidden
h-[80vh]
    "
          >
            <ChatInterface document={document._id} />
          </div>
        )}
      </div>

      {/* FLOATING HIGHLIGHT MENU */}
      {highlightRect && window.document.body && createPortal(
        <div
          className="absolute z-[9999] flex items-center bg-canvas-card text-ink shadow-xl rounded-lg overflow-hidden border border-hairline animate-in fade-in zoom-in duration-200"
          style={{
            top: highlightRect.top,
            left: highlightRect.left,
            transform: "translate(-50%, -100%)",
          }}
        >
          <button
            onClick={handleExplain}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium hover:bg-canvas-mid transition text-amber-200 border-r border-hairline"
            title="Giải thích khái niệm"
          >
            <BookOpen size={16} className="text-amber-400" />
            Explain
          </button>
          
          <button
            onClick={() => handleQuickAdd("flashcard")}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium hover:bg-canvas-mid transition text-primary border-r border-hairline"
            title="Thêm nhanh Flashcard"
          >
            <Zap size={16} className="text-primary" />
            Flashcard
          </button>
          
          <button
            onClick={() => handleQuickAdd("quiz")}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium hover:bg-canvas-mid transition text-blue-200 border-r border-hairline"
            title="Thêm nhanh Quiz"
          >
            <Target size={16} className="text-blue-400" />
            Quiz
          </button>

          <div className="relative group">
            <button
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium hover:bg-canvas-mid transition text-body"
              title="Tuỳ chọn lưu..."
            >
              <MoreHorizontal size={16} />
            </button>
            <div className="absolute right-0 top-full mt-1 hidden group-hover:block w-48 bg-canvas-card rounded-lg shadow-xl border border-hairline py-1">
               <button
                 onClick={() => openActionModal("flashcard")}
                 className="w-full text-left px-4 py-2 text-sm text-primary hover:bg-canvas-mid"
               >
                 Tạo Flashcard (Tùy chọn)
               </button>
               <button
                 onClick={() => openActionModal("quiz")}
                 className="w-full text-left px-4 py-2 text-sm text-blue-200 hover:bg-canvas-mid"
               >
                 Tạo Quiz (Tùy chọn)
               </button>
            </div>
          </div>
        </div>,
        window.document.body
      )}

      {/* EXPLAIN MODAL */}
      <AiResultModal
        open={explainOpen}
        title={explainTitle}
        loading={explainLoading}
        content={explainResult}
        cached={explainCached}
        onClose={() => setExplainOpen(false)}
      />

      {/* ACTION MODAL FOR FLASHCARD / QUIZ */}
      <HighlightActionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        actionType={modalActionType}
        text={highlightedText}
        documentId={document?._id}
        documentTitle={document?.title}
        onSuccess={(type, setId) => {
           toast.success(`${type} generated and saved correctly!`);
           if (type === "flashcard") setSelectedFlashcardSetId(setId);
           else setSelectedQuizSetId(setId);
           clearHighlight();
           setActiveTab(type === "flashcard" ? "flashcards" : "quizzes");
        }}
      />
    </div>
  );


/* =======================
   TAB SECTIONS
======================= */

function Placeholder({ label }) {
  return (
    <div className="flex items-center justify-center h-[400px] text-body">
      {label}
    </div>
  );
}
;}