import { useEffect, useRef, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import MarkdownRenderer from "../../components/common/MarkdownRenderer";
import { Send } from "lucide-react";
export default function ChatInterface({ document }) {
  const documentId = document;

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatHistoryId, setChatHistoryId] = useState(null);

  const scrollRef = useRef(null);

  /* ================= AUTO SCROLL ================= */
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  /* ================= LOAD CHAT HISTORY (ONCE) ================= */
  useEffect(() => {
    if (!document) return;

    const loadHistory = async () => {
      try {
        const res = await axiosInstance.get(`/api/ai/chat-history/${document}`);

        const { chatHistoryId, messages } = res.data.data;

        if (chatHistoryId) {
          setChatHistoryId(chatHistoryId);
        }

        // ✅ NORMALIZE MESSAGE Ở ĐÂY
        const normalizedMessages = (messages || []).map((m) => ({
          id: m._id || crypto.randomUUID(),
          role: m.role,
          content: m.content || m.text || "",
          timestamp: m.timestamp ? new Date(m.timestamp) : new Date(),
        }));

        setMessages(normalizedMessages);
      } catch (err) {
        console.error("Load chat history failed", err);
      }
    };

    loadHistory();
  }, [document]);

  /* ================= SEND MESSAGE ================= */
  const sendMessage = async () => {
    if (!input.trim() || !documentId || loading) return;

    const question = input;

    // 1️⃣ Add user message immediately
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        role: "user",
        content: question,
        timestamp: new Date().toISOString(),
      },
    ]);

    setInput("");
    setLoading(true);

    try {
      // 2️⃣ Call backend
      const res = await axiosInstance.post("/api/ai/chat", {
        documentId,
        question,
        chatHistoryId,
      });

      if (!res.data?.success) {
        throw new Error("AI response failed");
      }

      const { answer, chatHistoryId: newChatHistoryId } = res.data.data;
      const cached = res.data.cached === true;

      if (newChatHistoryId) {
        setChatHistoryId(newChatHistoryId);
      }

      // 3️⃣ Add assistant message
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + "_ai",
          role: "assistant",
          content: answer || "Not found in provided context.",
          cached,
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch (error) {
      console.error("Chat error:", error);

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + "_error",
          role: "assistant",
          content: "⚠️ Unable to get response from AI.",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */
  return (
    <div className="flex flex-col h-full bg-white/40 backdrop-blur-xl rounded-2xl overflow-hidden shadow-sm border border-white/50">
      {/* MESSAGE LIST */}
      <div
        ref={scrollRef}
        className="custom-scrollbar flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-white/60 to-white/30"
      >
        {messages.length === 0 && (
          <div className="text-center text-purple-900/40 font-medium text-sm mt-24">
            Ask a question about this document
          </div>
        )}

        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${
              m.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-md px-4 py-3 text-sm leading-relaxed
            ${
              m.role === "user"
                ? "bg-gradient-to-r from-purple-400 to-indigo-400 text-white shadow-lg shadow-purple-500/20"
                : "bg-white/60 border border-white/50 text-ink shadow-sm"
            }`}
            >
              {m.role === "assistant" ? (
                <MarkdownRenderer content={m.content} />
              ) : (
                <span>{m.content}</span>
              )}

              <div className={`text-[10px] mt-2 flex gap-2 ${m.role === "user" ? "text-purple-100/70" : "text-body/60"}`}>
                <span>
                  {m.timestamp &&
                    new Date(m.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                </span>

                {m.role === "assistant" && m.cached !== undefined && (
                  <span>{m.cached ? "⚡ cache" : "🧠 AI"}</span>
                )}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white/60 border border-white/50 rounded-xl px-4 py-2 text-xs text-purple-600 font-medium shadow-sm">
              AI is thinking…
            </div>
          </div>
        )}
      </div>

      {/* INPUT */}
      <div className="border-t border-white/40 bg-white/40 p-4">
        <div className="flex gap-3 items-end">
          <textarea
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Ask about this document..."
            className="
          flex-1
          resize-none
          rounded-xl
          bg-white/60
          border border-white/50
          px-4 py-3
          text-sm
          text-ink
          placeholder:text-body/50
          focus:outline-none
          focus:ring-2
          focus:ring-purple-400/50
          "
          />

          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className="
          flex items-center justify-center
          w-11 h-11
          rounded-xl
          bg-gradient-to-r from-purple-400 to-indigo-400
          text-white
          shadow-lg shadow-purple-500/20
          hover:scale-105
          transition
          disabled:opacity-40
          "
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
