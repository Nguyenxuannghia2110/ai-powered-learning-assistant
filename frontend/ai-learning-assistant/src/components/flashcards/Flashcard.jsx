import { useState, useEffect } from "react";

const difficultyColors = {
  easy: "bg-canvas-mid text-ink border border-hairline",
  medium: "bg-canvas-mid text-ink border border-hairline",
  hard: "bg-canvas-mid text-ink border border-hairline",
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
    <div className="w-full max-w-4xl mx-auto px-4">
      {/* ================= FLASHCARD ================= */}

      <div
        className="relative w-full h-[400px] md:h-[460px] perspective-1000 cursor-pointer group"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div
          className={`relative w-full h-full transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] preserve-3d ${
            isFlipped ? "rotate-y-180" : ""
          }`}
        >
          {/* ================= FRONT ================= */}

          <div
            className="absolute inset-0 backface-hidden rounded-2xl glass-card overflow-hidden shadow-lg"
          >
            {/* Header */}
            <div className="absolute top-6 left-6 right-6 flex items-center justify-between">
              <span
                className={`text-[10px] font-bold px-3 py-1 rounded-sm uppercase tracking-widest bg-white/60 text-purple-700 border border-purple-200`}
              >
                {card.difficulty || "Standard"}
              </span>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleStar(card._id);
                }}
                className={`transition ${
                  card.isStarred
                    ? "text-yellow-500 opacity-100"
                    : "text-body hover:text-yellow-500"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill={card.isStarred ? "currentColor" : "none"}
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
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
              <p className="text-[11px] font-bold uppercase tracking-widest mb-6 text-purple-500">
                Question
              </p>

              <h3 className="text-2xl md:text-3xl font-medium leading-snug text-ink tracking-tight">
                {card.question}
              </h3>
            </div>

            {/* Footer */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-body text-xs font-bold uppercase tracking-widest flex items-center gap-2 opacity-60">
              <span>Press SPACE to reveal</span>
            </div>
          </div>

          {/* ================= BACK ================= */}

          <div
            className="absolute inset-0 backface-hidden rotate-y-180 rounded-2xl glass-card overflow-hidden shadow-lg border-purple-200/50"
          >
            {/* Header */}
            <div className="absolute top-6 left-6">
              <span className="text-[10px] font-bold px-3 py-1 rounded-sm uppercase tracking-widest bg-purple-100 text-purple-700 border border-purple-200">
                Answer
              </span>
            </div>

            {/* Content */}
            <div className="h-full flex flex-col items-center justify-center px-12 md:px-24 text-center">
              <p className="text-[11px] font-bold uppercase tracking-widest mb-6 text-purple-500">
                Explanation
              </p>

              <p className="text-xl md:text-2xl font-normal leading-relaxed whitespace-pre-line text-body tracking-tight">
                {card.answer}
              </p>
            </div>

            {/* Footer */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-body text-xs font-bold uppercase tracking-widest flex items-center gap-4 opacity-60">
              <span>SPACE Flip</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
