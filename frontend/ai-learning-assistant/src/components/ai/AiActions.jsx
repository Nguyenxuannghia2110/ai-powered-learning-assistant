import { useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import ReactMarkdown from "react-markdown";

export default function AiActions({ documentId }) {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState("");
  const [error, setError] = useState("");

  const handleSummary = async () => {
    if (!documentId) {
      console.error("❌ documentId missing");
      return;
    }
    setLoading(true);
    setSummary("");
    setError("");
    try {
      const res = await axiosInstance.post("/api/ai/generate-summary", {
        documentId,
      });
      setSummary(res.data?.data?.summary || "");
    } catch {
      setError("Failed to generate summary.");
      console.log("📄 documentId:", documentId);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="bg-canvas-card border border-hairline rounded-md p-6 shadow-sm flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-ink">Document Summary</h3>
          <p className="text-sm text-body mt-1">
            Get a concise AI-generated summary of the entire document.
          </p>
        </div>

        <button
          onClick={handleSummary}
          disabled={loading}
          className="bg-primary hover:bg-emerald-600 text-black font-semibold px-5 py-2.5 rounded-xl transition disabled:opacity-50"
        >
          {loading ? "Summarizing..." : summary ? "Regenerate" : "Summarize"}
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl">
          {error}
        </div>
      )}

      {summary && (
        <div className="bg-canvas-card border border-hairline rounded-md p-6 text-gray-200">
          <div className="prose prose-invert max-w-none">
            <ReactMarkdown>{summary}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}
