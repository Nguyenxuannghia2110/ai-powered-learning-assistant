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
        rounded-2xl
        bg-[#0b0f0e]
        border border-white/10
        shadow-2xl
        p-8
        space-y-6
        text-white
        "
      >
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-emerald-400">
             AI Flashcard Generator
          </h2>

          <button
            onClick={onClose}
            disabled={generating}
            className="text-gray-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <hr className="border-white/10" />

        {/* COUNT */}
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-widest text-gray-400">
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
                    ? "bg-emerald-500 text-black border-emerald-500"
                    : "bg-black/40 border-white/10 hover:border-emerald-400"
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
          <div className="flex items-center gap-2 text-emerald-400 text-sm">
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
          bg-emerald-500
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