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
    <div className="min-h-screen bg-[#070b09] text-ink">
      <div className="w-full max-w-[1200px] mx-auto px-6 py-10 space-y-8">
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div className="text-sm text-body">
            Question {currentIndex + 1} / {totalQuestions}
          </div>

          <div className="text-sm text-mute">
            {answers.length} / {totalQuestions} answered
          </div>

          <button
            onClick={onBack}
            className="px-4 py-2 rounded-xl border border-hairline hover:border-hairline text-body"
          >
            Cancel
          </button>
          <div className="text-sm text-primary">
            ⏱ {formatTime(timeSpent)}
          </div>
        </div>

        {/* PROGRESS BAR */}
        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* QUESTION CARD */}
        <div className="bg-canvas-card border border-hairline rounded-md p-8 lg:p-10 space-y-6">
          <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold leading-relaxed">
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
                    ? "border-primary bg-primary/10"
                    : "border-hairline hover:border-hairline"
                }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-6 h-6 rounded-full border flex items-center justify-center
                    ${
                      isSelected
                        ? "bg-primary border-primary"
                        : "border-hairline"
                    }`}
                    >
                      {isSelected && <Check size={14} />}
                    </div>

                    <span className="text-gray-200">{option}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* NAVIGATION */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="flex items-center gap-2 px-6 py-3 rounded-xl border border-hairline text-body hover:bg-canvas-card disabled:opacity-30"
          >
            <ChevronLeft size={18} />
            Previous
          </button>

          {/* PAGINATION */}
          <div className="flex gap-2 flex-wrap justify-center">
            {generatePageNumbers().map((item, idx) => {
              if (typeof item === "string") {
                return (
                  <span key={idx} className="px-2 text-mute">
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
                  className={`w-10 h-10 rounded-xl text-sm font-semibold transition
                ${
                  isActive
                    ? "bg-primary text-black scale-110"
                    : isAnswered
                      ? "bg-primary/10 border border-primary/30 text-primary"
                      : "bg-canvas-card text-body hover:bg-white/10"
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
          bg-primary text-black font-semibold hover:bg-emerald-400"
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
