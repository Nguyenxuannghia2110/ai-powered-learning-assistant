import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";

import ChatInterface from "../../components/chat/ChatInterface";
import Tabs from "../../components/common/Tabs";
import AiActions from "../../components/ai/AiActions";
import FlashcardManager from "../../components/flashcards/FlashcardManager";
import QuizManager from "../../components/quizzes/QuizManager";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { MessageSquare } from "lucide-react";

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
  //////////////////////
  const ContentTab = ({ document }) => {
    const [showText, setShowText] = useState(false);

    if (!document?.filePath) {
      return (
        <div className="flex items-center justify-center h-[400px] text-gray-400">
          No document file
        </div>
      );
    }

    const hasExtractedText =
      document.extractedText && document.extractedText.trim().length > 50;

    return (
      <div className="p-4 space-y-4">
        {/* PDF VIEWER */}
        <div className="w-full h-[70vh] rounded-xl overflow-hidden border border-emerald-900">
          <iframe
            src={document.filePath}
            title={document.title}
            className="w-full h-full bg-black"
          />
        </div>
        <div className="flex items-center justify-between">
          {/* TOGGLE BUTTON */}
          {hasExtractedText && (
            <button
              onClick={() => setShowText((v) => !v)}
              className="text-sm font-semibold text-emerald-400 hover:text-emerald-300"
            >
              {showText ? "Hide extracted text" : "Show extracted text"}
            </button>
          )}
          {/* CHAT BUTTON */}
          <button
            onClick={() => setShowChatPanel((v) => !v)}
            className="
      flex items-center gap-2
        px-4 py-2
        rounded-lg
        bg-emerald-500/10
        text-emerald-400
        hover:bg-emerald-500/20
        transition
    "
          >
            Chat
            <MessageSquare size={20} />
          </button>
        </div>
        {/* EXTRACTED TEXT */}
        {hasExtractedText && showText && (
          <div className="bg-[#0e2a22] border border-emerald-900 rounded-xl p-4 max-h-[300px] overflow-auto">
            <h3 className="font-semibold mb-2 text-sm text-emerald-200">
              Extracted Text (for AI processing)
            </h3>

            <pre className="text-xs text-emerald-100 whitespace-pre-wrap leading-relaxed">
              {document.extractedText}
            </pre>
          </div>
        )}
      </div>
    );
  };
  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      {/* BACK BUTTON */}
      <button
        onClick={() => navigate("/documents")}
        className="
    inline-flex items-center gap-2
    text-sm text-emerald-200
    hover:text-white
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
    text-white
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
  rounded-2xl
  border border-emerald-900
  bg-gradient-to-b
  from-[#061f18]
  to-[#031712]
  min-h-[700px]
  overflow-hidden
"
        >
          {activeTab === "content" && <ContentTab document={document} />}

          {activeTab === "chat" && document?._id && (
            <ChatInterface document={document._id} />
          )}

          {activeTab === "ai" && <AiActions documentId={document._id} />}

          {activeTab === "flashcards" && (
            <FlashcardManager documentId={document._id} />
          )}

          {activeTab === "quizzes" && <QuizManager documentId={document._id} />}
        </div>
        {showChatPanel && activeTab === "content" && (
          <div
            className="
    rounded-2xl
border border-emerald-900
bg-gradient-to-b
from-[#061f18]
to-[#031712]
overflow-hidden
h-[80vh]
    "
          >
            <ChatInterface document={document._id} />
          </div>
        )}
      </div>
    </div>
  );
}

/* =======================
   TAB SECTIONS
======================= */

function Placeholder({ label }) {
  return (
    <div className="flex items-center justify-center h-[400px] text-gray-400">
      {label}
    </div>
  );
}
