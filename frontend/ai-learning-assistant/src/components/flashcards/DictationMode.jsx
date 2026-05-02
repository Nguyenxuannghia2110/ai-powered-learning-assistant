import React, { useState, useEffect, useRef } from "react";

export default function DictationMode({
  card,
  onNext,
  onPrev,
  currentIndex,
  total,
}) {
  const [userInput, setUserInput] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  const [feedback, setFeedback] = useState(null); // { isCorrect: boolean, diff: array }

  const inputRef = useRef(null);

  // Auto-focus input when card changes
  useEffect(() => {
    setUserInput("");
    setIsChecked(false);
    setFeedback(null);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [card]);

  const speakOriginal = () => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(card.question);
      utterance.lang = "en-US"; // Assuming English for now, could be dynamic
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Text-to-speech is not supported in your browser.");
    }
  };

  const handleCheck = () => {
    if (!userInput.trim()) return;

    // Simple check: normalize and compare against card.answer
    const normalizedOriginal = card.answer.trim().toLowerCase().replace(/[^\w\s]|_/g, "");
    const normalizedInput = userInput.trim().toLowerCase().replace(/[^\w\s]|_/g, "");

    const isCorrect = normalizedOriginal === normalizedInput;

    setFeedback({
      isCorrect,
      message: isCorrect ? "Excellent!" : "Not quite right. Try again or check the answer.",
    });
    setIsChecked(true);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      if (!isChecked) {
        handleCheck();
      } else {
        if (onNext) onNext();
      }
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4">
      <div className="bg-[#0f1714] border border-slate-800 rounded-3xl p-8 shadow-2xl flex flex-col items-center">
        
        <div className="w-full flex justify-between items-center mb-8">
          <span className="text-sm font-semibold text-slate-400 uppercase tracking-wide">
            Dictation Mode
          </span>
          <span className="text-sm text-slate-500">
            {currentIndex + 1} / {total}
          </span>
        </div>

        <button
          onClick={speakOriginal}
          className="mb-8 w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center hover:bg-emerald-500/30 hover:scale-105 transition-all"
          title="Listen to the word"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-10 h-10">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
          </svg>
        </button>

        <p className="text-slate-400 mb-6 text-center">Type the meaning / answer for what you hear:</p>

        <input
          ref={inputRef}
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isChecked && feedback?.isCorrect}
          className={`w-full bg-[#1a2421] border-2 rounded-xl px-6 py-4 text-xl text-white outline-none focus:border-emerald-500 transition-colors ${
            isChecked 
              ? feedback?.isCorrect 
                ? "border-emerald-500 text-emerald-400" 
                : "border-rose-500 text-rose-400"
              : "border-slate-700"
          }`}
          placeholder="Listen and type..."
        />

        {isChecked && (
          <div className="mt-6 w-full text-center">
            <p className={`text-lg font-medium mb-4 ${feedback.isCorrect ? "text-emerald-400" : "text-rose-400"}`}>
              {feedback.message}
            </p>
            {!feedback.isCorrect && (
              <div className="bg-slate-800/50 rounded-lg p-4 mb-4">
                <p className="text-sm text-slate-400 mb-1">Correct Answer:</p>
                <p className="text-xl text-white font-semibold">{card.answer}</p>
                <p className="text-sm text-emerald-400 mt-2">Word: {card.question}</p>
              </div>
            )}
            
            <button
              onClick={() => {
                if (feedback.isCorrect) {
                  if (onNext) onNext();
                } else {
                  // Retry
                  setIsChecked(false);
                  setUserInput("");
                  setFeedback(null);
                  if (inputRef.current) inputRef.current.focus();
                }
              }}
              className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition-colors"
            >
              {feedback.isCorrect ? "Next Card" : "Try Again"}
            </button>
          </div>
        )}

        {!isChecked && (
          <button
            onClick={handleCheck}
            disabled={!userInput.trim()}
            className="mt-6 px-8 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:hover:bg-emerald-600 text-white font-semibold rounded-xl transition-colors"
          >
            Check Answer
          </button>
        )}
      </div>
    </div>
  );
}
