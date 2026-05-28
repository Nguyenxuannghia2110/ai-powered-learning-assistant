import { useState } from "react";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { useEffect } from "react";
import quizService from "../../services/quizService";

const QuizTakePage = ({ quiz, onFinish, onBack }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timeSpent, setTimeSpent] = useState(0);
  const [startedAt, setStartedAt] = useState(null);

  if (!quiz || !quiz.questions?.length) {
    return (
      <div className="text-center py-20 text-body">
        No quiz data available
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentIndex];
  const totalQuestions = quiz.questions.length;
  const progress = ((currentIndex + 1) / totalQuestions) * 100;
  const allAnswered = answers.length === totalQuestions;

  const currentSelection = answers.find(
    (a) => a.questionIndex === currentIndex,
  )?.selectedAnswer;

  /* ================= HANDLE ANSWER ================= */
  const handleSelectOption = (optionIndex) => {
    setAnswers((prev) => {
      const filtered = prev.filter((a) => a.questionIndex !== currentIndex);
      return [
        ...filtered,
        { questionIndex: currentIndex, selectedAnswer: optionIndex },
      ];
    });
  };

  const findFirstUnanswered = () => {
    for (let i = 0; i < totalQuestions; i++) {
      if (!answers.some((a) => a.questionIndex === i)) return i;
    }
    return -1;
  };

  const handleNext = () => {
    if (quiz?.completedAt) return; // 🔥 chặn submit lại nếu đã hoàn tất

    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
      return;
    }

    if (!allAnswered) {
      const firstUnanswered = findFirstUnanswered();
      if (firstUnanswered !== -1) setCurrentIndex(firstUnanswered);
      return;
    }

    onFinish(answers);
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex((prev) => prev - 1);
  };

  /* ================= PAGINATION ================= */
  const generatePageNumbers = () => {
    const pages = [];
    const maxVisible = 2;
    const start = Math.max(0, currentIndex - maxVisible);
    const end = Math.min(totalQuestions - 1, currentIndex + maxVisible);

    if (start > 0) {
      pages.push(0);
      if (start > 1) pages.push("ellipsis-start");
    }

    for (let i = start; i <= end; i++) pages.push(i);

    if (end < totalQuestions - 1) {
      if (end < totalQuestions - 2) pages.push("ellipsis-end");
      pages.push(totalQuestions - 1);
    }

    return pages;
  };

  /* ================= EFFECTS ================= */

  // Reset khi quiz thay đổi
  useEffect(() => {
    setAnswers([]);
    setCurrentIndex(0);
    setTimeSpent(0);
    setStartedAt(null);
  }, [quiz?._id]);

  // 🔥 START QUIZ (QUAN TRỌNG NHẤT)
  useEffect(() => {
    let isMounted = true;

    const start = async () => {
      try {
        let startTime;

        if (!quiz?.startedAt) {
          const res = await quizService.startQuiz(quiz._id);

          if (!res?.success) {
            throw new Error("Start quiz failed");
          }

          startTime = new Date(res.data.startedAt).getTime();
        } else {
          startTime = new Date(quiz.startedAt).getTime();
        }

        if (isMounted) {
          setStartedAt(startTime);
        }
      } catch (err) {
        console.error("Start quiz failed:", err);
      }
    };

    start();

    return () => {
      isMounted = false;
    };
  }, [quiz._id]);

  // 🔥 TIMER (dùng startedAt state, KHÔNG dùng quiz)
  useEffect(() => {
    if (!startedAt) return;

    const interval = setInterval(() => {
      const diff = Math.floor((Date.now() - startedAt) / 1000);
      setTimeSpent(diff);
    }, 1000);

    return () => clearInterval(interval);
  }, [startedAt]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };
  /* ================= RENDER ================= */
  return (
    <div className="min-h-screen font-sans text-ink">
      <div className="w-full max-w-[1200px] mx-auto px-6 py-10 space-y-8">
        {/* HEADER */}
        <div className="flex justify-between items-center glass-card px-6 py-4 rounded-xl border border-white/50 shadow-sm">
          <div className="text-sm text-body font-bold">
            Question {currentIndex + 1} / {totalQuestions}
          </div>

          <div className="text-sm text-purple-700 font-bold">
            {answers.length} / {totalQuestions} answered
          </div>

          <div className="flex gap-4 items-center">
            <button
              onClick={onBack}
              className="px-4 py-2 rounded-xl border border-white/50 hover:bg-white/80 text-body bg-white/60 shadow-sm font-semibold transition"
            >
              Cancel
            </button>
            <div className="text-sm text-purple-600 font-bold px-3 py-1.5 bg-purple-50 rounded-lg border border-purple-100 shadow-sm">
              ⏱ {formatTime(timeSpent)}
            </div>
          </div>
        </div>

        {/* PROGRESS BAR */}
        <div className="w-full h-3 bg-white/40 border border-white/50 rounded-full overflow-hidden shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-purple-400 to-indigo-400 transition-all duration-500 shadow-md"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* QUESTION CARD */}
        <div className="glass-card border border-white/50 rounded-2xl p-8 lg:p-12 space-y-8 shadow-md">
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold leading-relaxed text-ink">
            {currentQuestion.question}
          </h2>

          <div className="space-y-4">
            {currentQuestion.options.map((option, idx) => {
              const isSelected = currentSelection === idx;

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  className={`w-full flex items-center justify-between px-6 py-4 rounded-xl border transition-all text-left
                ${
                  isSelected
                    ? "border-purple-400 bg-purple-50 shadow-sm"
                    : "border-white/60 hover:bg-white/40 bg-white/50"
                }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors
                    ${
                      isSelected
                        ? "bg-purple-500 border-purple-500 text-white shadow-sm"
                        : "border-gray-300 bg-white"
                    }`}
                    >
                      {isSelected && <Check size={14} />}
                    </div>

                    <span className={`font-medium ${isSelected ? 'text-purple-900' : 'text-ink'}`}>{option}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* NAVIGATION */}
        <div className="flex items-center justify-between pt-4">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="flex items-center gap-2 px-6 py-3 rounded-xl border border-white/50 text-body font-semibold hover:bg-white/80 bg-white/60 shadow-sm disabled:opacity-30 transition"
          >
            <ChevronLeft size={18} />
            Previous
          </button>

          {/* PAGINATION */}
          <div className="flex gap-2 flex-wrap justify-center">
            {generatePageNumbers().map((item, idx) => {
              if (typeof item === "string") {
                return (
                  <span key={idx} className="px-2 text-purple-300 font-bold flex items-center">
                    ...
                  </span>
                );
              }

              const isActive = item === currentIndex;
              const isAnswered = answers.some((a) => a.questionIndex === item);

              return (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(item)}
                  className={`w-10 h-10 rounded-xl text-sm font-bold transition shadow-sm
                ${
                  isActive
                    ? "bg-gradient-to-r from-purple-400 to-indigo-400 text-white scale-110 shadow-md"
                    : isAnswered
                      ? "bg-purple-100 border border-purple-300 text-purple-700"
                      : "bg-white/60 text-body hover:bg-white/80 border border-white/50"
                }`}
                >
                  {item + 1}
                </button>
              );
            })}
          </div>

          <button
            onClick={handleNext}
            disabled={quiz?.completedAt}
            className="flex items-center gap-2 px-8 py-3 rounded-xl 
          bg-gradient-to-r from-purple-400 to-indigo-400 hover:from-purple-500 hover:to-indigo-500 text-white font-bold shadow-md shadow-purple-500/20 transition disabled:opacity-50"
          >
            {currentIndex === totalQuestions - 1 ? "Finish" : "Next"}
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizTakePage;
