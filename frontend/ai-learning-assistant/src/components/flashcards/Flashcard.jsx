import { useState, useEffect } from "react";

const difficultyColors = {
  easy: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  medium: "bg-amber-100 text-amber-700 border border-amber-200",
  hard: "bg-rose-100 text-rose-700 border border-rose-200",
};

export default function Flashcard({
  card,
  onToggleStar,
  currentIndex = 0,
  total = 1,
  onNext,
  onPrev,
}) {
  const [isFlipped, setIsFlipped] = useState(false);

  const progress = ((currentIndex + 1) / total) * 100;

  const theme = {
    background: "#080f0c",
    surface: "rgba(255,255,255,0.05)",
    border: "rgba(255,255,255,0.1)",
    text: "rgba(255,255,255,0.9)",
    subtext: "rgba(255,255,255,0.45)",
    accent: "#10b981",
  };

  /* ================= KEYBOARD CONTROL ================= */

  useEffect(() => {
    const handleKey = (e) => {
      if (e.code === "Space") {
        e.preventDefault();
        setIsFlipped((f) => !f);
      }

      if (e.code === "ArrowRight" && onNext) {
        setIsFlipped(false);
        onNext();
      }

      if (e.code === "ArrowLeft" && onPrev) {
        setIsFlipped(false);
        onPrev();
      }
    };

    window.addEventListener("keydown", handleKey);

    return () => window.removeEventListener("keydown", handleKey);
  }, [onNext, onPrev]);

  return (
    <div className="w-full max-w-5xl mx-auto px-4">
      {/* ================= FLASHCARD ================= */}

      <div
        className="relative w-full h-[480px] md:h-[520px] perspective-1000 cursor-pointer group"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div
          className={`relative w-full h-full transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] preserve-3d ${
            isFlipped ? "rotate-y-180" : ""
          }`}
        >
          {/* ================= FRONT ================= */}

          <div
            className="absolute inset-0 backface-hidden rounded-3xl border backdrop-blur-xl shadow-xl group-hover:shadow-2xl transition-all overflow-hidden"
            style={{
              background: theme.surface,
              borderColor: theme.border,
            }}
          >
            {/* Glow */}
            <div className="absolute -top-24 -left-16 w-64 h-64 bg-emerald-400/20 blur-2xl rounded-full"></div>
            <div className="absolute -bottom-24 -right-16 w-64 h-64 bg-indigo-400/20 blur-2xl rounded-full"></div>

            {/* Header */}
            <div className="absolute top-8 left-8 right-8 flex items-center justify-between">
              <span
                className={`text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wide backdrop-blur-sm ${difficultyColors[card.difficulty]}`}
              >
                {card.difficulty}
              </span>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleStar(card._id);
                }}
                className={`transition transform hover:scale-110 ${
                  card.isStarred
                    ? "text-amber-400"
                    : "text-slate-300 hover:text-amber-400"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill={card.isStarred ? "currentColor" : "none"}
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-7 h-7"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.821.596l-4.712-2.907a.563.563 0 00-.54 0l-4.712 2.907a.562.562 0 01-.821-.596l1.285-5.385a.563.563 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345l2.125-5.111z"
                  />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="h-full flex flex-col items-center justify-center px-10 md:px-20 text-center">
              <p
                className="text-xs uppercase tracking-widest mb-4 font-medium"
                style={{ color: theme.subtext }}
              >
                Question
              </p>

              <h3
                className="text-2xl md:text-3xl lg:text-4xl font-bold leading-snug"
                style={{ color: theme.text }}
              >
                {card.question}
              </h3>
            </div>

            {/* Footer */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-slate-400 text-sm flex items-center gap-2">
              <span>Click or press SPACE to reveal</span>
            </div>
          </div>

          {/* ================= BACK ================= */}

          <div
            className="absolute inset-0 backface-hidden rotate-y-180 rounded-3xl border backdrop-blur-xl shadow-xl overflow-hidden"
            style={{
              background: theme.surface,
              borderColor: theme.border,
            }}
          >
            <div className="absolute -bottom-24 -right-16 w-64 h-64 bg-emerald-500/30 blur-3xl rounded-full"></div>

            {/* Header */}
            <div className="absolute top-6 left-6">
              <span className="text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wide bg-emerald-100 text-emerald-700 border border-emerald-200">
                Answer
              </span>
            </div>

            {/* Content */}
            <div className="h-full flex flex-col items-center justify-center px-16 text-center">
              <p className="text-xs text-emerald-600 uppercase tracking-widest mb-4 font-medium">
                Explanation
              </p>

              <p
                className="text-xl md:text-2xl lg:text-3xl font-semibold leading-relaxed whitespace-pre-line"
                style={{ color: theme.text }}
              >
                {card.answer}
              </p>
            </div>

            {/* Footer */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-slate-400 text-sm flex items-center gap-4">
              <span>SPACE Flip</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
