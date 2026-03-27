import { useState } from "react";
import AiResultModal from "../../components/common/AiResultModal";
import axiosInstance from "../../utils/axiosInstance";

export default function AiActions({ documentId }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [result, setResult] = useState("");
  const [concept, setConcept] = useState("");
  const [cached, setCached] = useState(false);

  /* ===================== SUMMARY ===================== */
  const handleSummary = async () => {
    if (!documentId) {
      console.error("❌ documentId missing");
      return;
    }
    setTitle("Document Summary");
    setOpen(true);
    setLoading(true);
    setResult("");
    try {
      const res = await axiosInstance.post("/api/ai/generate-summary", {
        documentId,
      });
      setResult(res.data?.data?.summary || "");
      setCached(res.data?.cached === true);
    } catch {
      setResult("Failed to generate summary.");
      console.log("📄 documentId:", documentId);
    } finally {
      setLoading(false);
    }
  };

  /* ===================== CONCEPT ===================== */
  const handleConcept = async () => {
    if (!concept.trim()) return;

    if (!documentId) {
      console.error("❌ documentId missing");
      return;
    }

    setTitle(`Explain: ${concept}`);
    setOpen(true);
    setLoading(true);
    setResult("");

    try {
      const res = await axiosInstance.post("/api/ai/explain-concept", {
        documentId,
        concept,
      });

      setResult(res.data?.data?.explanation || "");
      setCached(res.data?.cached === true);
    } catch (err) {
      console.error("❌ Explain concept error:", err.response?.data);
      setResult("Failed to explain concept.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ================= SUMMARY ================= */}
      <div className="bg-white rounded-xl p-5 shadow-sm flex justify-between items-center mb-4">
        <div>
          <h3 className="font-semibold">Generate Summary</h3>
          <p className="text-sm text-gray-500">
            Get a concise summary of the entire document.
          </p>
        </div>

        <button
          onClick={handleSummary}
          className="bg-emerald-500 text-white px-4 py-2 rounded-lg"
        >
          Summarize
        </button>
      </div>

      {/* ================= CONCEPT ================= */}
      <div className="bg-white rounded-xl p-5 shadow-sm">
        <h3 className="font-semibold mb-2">Explain a Concept</h3>
        <p className="text-sm text-gray-500 mb-4">
          Enter a topic or concept from the document.
        </p>

        <div className="flex gap-2">
          <input
            value={concept}
            onChange={(e) => setConcept(e.target.value)}
            placeholder="e.g. React Hooks"
            className="flex-1 border rounded-lg px-3 py-2 text-sm"
          />
          <button
            onClick={handleConcept}
            className="bg-emerald-500 text-white px-4 rounded-lg"
          >
            Explain
          </button>
        </div>
      </div>

      {/* ================= MODAL ================= */}
      <AiResultModal
        open={open}
        title={title}
        loading={loading}
        content={result}
        cached={cached}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
