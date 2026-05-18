import { useState } from "react";
import { X, Loader2, Zap } from "lucide-react";

export default function GenerateFlashcardModal({
  open,
  onClose,
  onGenerate,
  generating,
}) {
  const [count, setCount] = useState(10);

  const counts = [5, 10, 20, 30];

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="
        w-full max-w-lg
        rounded-md
        bg-canvas-card
        border border-hairline
        shadow-2xl
        p-8
        space-y-6
        text-ink
        "
      >
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-primary">
             AI Flashcard Generator
          </h2>

          <button
            onClick={onClose}
            disabled={generating}
            className="text-body hover:text-ink"
          >
            <X size={20} />
          </button>
        </div>

        <hr className="border-hairline" />

        {/* COUNT */}
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-widest text-body">
            Number of Flashcards (max 30)
          </label>

          <div className="grid grid-cols-4 gap-3">
            {counts.map((num) => (
              <button
                key={num}
                disabled={generating}
                onClick={() => setCount(num)}
                className={`
                py-3 rounded-xl border font-semibold text-sm transition
                ${
                  count === num
                    ? "bg-primary text-black border-primary"
                    : "bg-black/40 border-hairline hover:border-primary"
                }
                `}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        {/* STATUS */}
        {generating && (
          <div className="flex items-center gap-2 text-primary text-sm">
            <Loader2 className="animate-spin" size={16} />
            AI is generating flashcards...
          </div>
        )}

        {/* ACTION */}
        <button
          onClick={() => onGenerate(Math.min(count, 30))}
          disabled={generating}
          className="
          w-full
          flex items-center justify-center gap-2
          py-3
          rounded-xl
          bg-primary
          text-black
          font-semibold
          hover:bg-emerald-400
          disabled:opacity-60
          "
        >
          {generating ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <Zap size={18} />
          )}

          {generating ? "Generating Flashcards..." : "Generate Flashcards"}
        </button>
      </div>
    </div>
  );
}