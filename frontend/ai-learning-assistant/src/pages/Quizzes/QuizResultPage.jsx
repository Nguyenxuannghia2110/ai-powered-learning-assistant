import React, { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import quizService from "../../services/quizService";

/* ================= Accordion Section ================= */
const Section = ({ title, count, color, children }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-white/10 rounded-xl overflow-hidden">
      <div
        onClick={() => setOpen(!open)}
        className="flex justify-between items-center px-5 py-4 cursor-pointer hover:bg-white/5 transition"
      >
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${color}`} />
          <span className="font-medium">{title}</span>
          <span className="text-sm text-gray-400">{count} Questions</span>
        </div>

        <span className="text-gray-400 text-sm">{open ? "▲" : "▼"}</span>
      </div>

      {open && <div className="px-5 pb-5 space-y-4">{children}</div>}
    </div>
  );
};

/* ================= MAIN ================= */
const QuizResultPage = ({ quiz, onBack, onRemake }) => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [animatedScore, setAnimatedScore] = useState(0);
  const [loadingRemake, setLoadingRemake] = useState(false);

  /* ================= Load Quiz Result ================= */
  const loadResult = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/api/quizzes/${quiz._id}/results`);
      setResult(res.data.data);
    } catch (err) {
      console.error("Load quiz result failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (quiz?._id) loadResult();
  }, [quiz._id]);

  /* ===== Animate Score ===== */
  useEffect(() => {
    if (!result) return;

    const total = result.quiz.totalQuestions;
    const correct = result.results.filter((r) => r.isCorrect).length;
    const percent = Math.round((correct / total) * 100);

    let current = 0;
    const step = () => {
      current += 1;
      if (current <= percent) {
        setAnimatedScore(current);
        requestAnimationFrame(step);
      }
    };
    step();
  }, [result]);

  const handleRemake = async () => {
    setLoadingRemake(true);

    try {
      const res = await quizService.restartQuiz(quiz._id);

      console.log("Remake response:", res);

      // ✅ đúng format
      if (!res?.success) {
        throw new Error(res?.error || "Remake API failed");
      }

      const newQuiz = res.data;

      if (!newQuiz?._id) {
        throw new Error("Invalid quiz data returned");
      }

      // 🔥 đảm bảo quiz mới sạch (quan trọng)
      const normalizedQuiz = {
        ...newQuiz,
        startedAt: null,
        completedAt: null,
        score: null,
        userAnswers: [],
      };

      onRemake?.(normalizedQuiz);
    } catch (err) {
      console.error("Failed to remake quiz:", err);
    } finally {
      setLoadingRemake(false);
    }
  };

  {
    /*------------------------loadinggg------------------*/
  }
  if (loading)
    return <div className="text-center py-20 text-white">Loading...</div>;
  if (!result)
    return <div className="text-center py-20 text-white">No result</div>;

  const { quiz: quizInfo, results } = result;

  const total = quizInfo.totalQuestions;
  const correctCount = results.filter((r) => r.isCorrect).length;
  const incorrectCount = results.filter(
    (r) => !r.isCorrect && r.selectedAnswerIndex != null,
  ).length;
  const unansweredCount = results.filter(
    (r) => r.selectedAnswerIndex == null,
  ).length;

  const scorePercent = Math.round((correctCount / total) * 100);

  // format thời gian
  const formatDuration = (seconds) => {
    if (!seconds) return "00:00";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Thời gian hiển thị
  const timeSpent = result.quiz?.timeSpent ?? 0;
  const score = result.quiz?.score;

  const timeSpentDisplay =
    timeSpent > 0
      ? formatDuration(timeSpent)
      : score == null
        ? "Not started"
        : "00:00";
        
  return (
    <div className="max-w-5xl mx-auto px-6 py-10 text-white space-y-8">
      {/* HEADER */}
      <div className="bg-gradient-to-br from-[#06281f] via-[#063328] to-[#041c15] border border-emerald-800/40 rounded-2xl p-10 text-center space-y-6">
        {/* SCORE */}
        <div className="relative w-44 h-44 mx-auto">
          <svg className="w-full h-full -rotate-90">
            <circle
              cx="88"
              cy="88"
              r="70"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="12"
              fill="none"
            />
            <circle
              cx="88"
              cy="88"
              r="70"
              stroke="#34d399"
              strokeWidth="12"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 70}
              strokeDashoffset={2 * Math.PI * 70 * (1 - animatedScore / 100)}
              style={{ transition: "all 0.8s ease" }}
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-extrabold">{animatedScore}%</span>
            <span className="text-sm text-emerald-300">FINAL SCORE</span>
          </div>
        </div>

        {/* TITLE */}
        <div>
          <h2 className="text-3xl font-bold">
            {scorePercent >= 80
              ? "Excellent Progress!"
              : scorePercent >= 50
                ? "Good Job!"
                : "Keep Trying!"}
          </h2>

          <p className="text-base text-emerald-200 mt-2">
            {scorePercent >= 80
              ? "You've mastered most of the concepts."
              : "Keep practicing to improve."}
          </p>
        </div>

        {/* TIME */}
        <div className="max-w-sm mx-auto bg-white/5 border border-white/10 rounded-xl p-5 flex justify-between items-center">
          <div>
            <div className="text-sm text-emerald-300">Time Spent</div>
            <div className="text-2xl font-semibold">{timeSpentDisplay}</div>
          </div>
          <div className="text-xs text-gray-400">Avg ~30s/question</div>
        </div>
      </div>

      {/* BREAKDOWN */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-emerald-300">
          Performance Breakdown
        </h3>

        {/* CORRECT */}
        <Section
          title="Correct Answers"
          count={correctCount}
          color="bg-emerald-500"
        >
          {results
            .filter((q) => q.isCorrect)
            .map((q, idx) => (
              <div key={idx} className="space-y-3 border-b border-white/5 pb-4">
                <p className="font-medium">
                  Question{q.questionIndex + 1}. {q.question}
                </p>

                <div className="space-y-2">
                  {q.options.map((opt, i) => {
                    const isCorrect = i === q.correctAnswerIndex;
                    const isUser = i === q.selectedAnswerIndex;

                    let style = "border-white/10";
                    let label = "";

                    if (isCorrect && isUser) {
                      style = "border-emerald-500 bg-emerald-500/10";
                      label = "✓ Your answer";
                    } else if (isCorrect) {
                      style = "border-emerald-500";
                      label = "✓ Correct";
                    }

                    return (
                      <div
                        key={i}
                        className={`px-3 py-2 rounded-lg border text-sm flex justify-between ${style}`}
                      >
                        <span>{opt}</span>
                        {label && <span className="text-xs">{label}</span>}
                      </div>
                    );
                  })}
                </div>

                {q.explanation && (
                  <p className="text-sm text-gray-400">💡 {q.explanation}</p>
                )}
              </div>
            ))}
        </Section>

        {/* INCORRECT */}
        <Section
          title="Incorrect Answers"
          count={incorrectCount}
          color="bg-red-500"
        >
          {results
            .filter((q) => !q.isCorrect && q.selectedAnswerIndex != null)
            .map((q, idx) => (
              <div key={idx} className="space-y-3 border-b border-white/5 pb-4">
                <p className="font-medium">
                  Question{idx + 1}. {q.question}
                </p>

                <div className="space-y-2">
                  {q.options.map((opt, i) => {
                    const isCorrect = i === q.correctAnswerIndex;
                    const isUser = i === q.selectedAnswerIndex;

                    let style = "border-white/10";
                    let label = "";

                    if (isCorrect) {
                      style = "border-emerald-500 bg-emerald-500/10";
                      label = "✓ Correct answer";
                    } else if (isUser) {
                      style = "border-red-500 bg-red-500/10";
                      label = "✕ Your answer";
                    }

                    return (
                      <div
                        key={i}
                        className={`px-3 py-2 rounded-lg border text-sm flex justify-between ${style}`}
                      >
                        <span>{opt}</span>
                        {label && <span className="text-xs">{label}</span>}
                      </div>
                    );
                  })}
                </div>

                {q.explanation && (
                  <p className="text-sm text-gray-400">💡 {q.explanation}</p>
                )}
              </div>
            ))}
        </Section>

        {/* UNANSWERED */}
        <Section title="Unanswered" count={unansweredCount} color="bg-gray-500">
          {results
            .filter((q) => q.selectedAnswerIndex == null)
            .map((q, idx) => (
              <div key={idx} className="space-y-3 border-b border-white/5 pb-4">
                <p className="font-medium">
                  Question{idx + 1}. {q.question}
                </p>

                <div className="space-y-2">
                  {q.options.map((opt, i) => {
                    const isCorrect = i === q.correctAnswerIndex;

                    return (
                      <div
                        key={i}
                        className={`px-3 py-2 rounded-lg border text-sm flex justify-between ${
                          isCorrect
                            ? "border-emerald-500 bg-emerald-500/10"
                            : "border-white/10"
                        }`}
                      >
                        <span>{opt}</span>
                        {isCorrect && (
                          <span className="text-xs">✓ Correct</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {q.explanation && (
                  <p className="text-sm text-gray-400">💡 {q.explanation}</p>
                )}
              </div>
            ))}
        </Section>
      </div>

      {/* ACTIONS */}
      <div className="flex justify-between items-center mt-6 gap-4">
        {/* REMAKE QUIZ */}
        <button
          onClick={handleRemake}
          disabled={loadingRemake}
          className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl 
          bg-emerald-500 text-black font-semibold hover:bg-emerald-400 transition"
        >
          {loadingRemake ? "Remaking..." : "🔄 Remake Quiz"}
        </button>

        {/* BACK */}
        <button
          onClick={onBack}
          className="flex-1 px-5 py-3 rounded-xl 
          bg-white/10 border border-white/10 text-white hover:bg-white/20 transition"
        >
          ← Back to Library
        </button>
      </div>
    </div>
  );
};

export default QuizResultPage;
