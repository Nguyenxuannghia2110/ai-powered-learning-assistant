import React, { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import QuizCard from "./QuizCard";
import EmptyState from "../../components/common/EmptyState";
import QuizResultPage from "../../pages/Quizzes/QuizResultPage";
import QuizTakePage from "../../pages/Quizzes/QuizTakePage";
import { submitQuiz } from "../../services/quizService";
import GenerateQuizModal from "./GenerateQuizModal";
const QuizManager = ({ documentId }) => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState(null);
  const [mode, setMode] = useState("list"); // list | take | result
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  /* ================= LOAD QUIZZES ================= */

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(
        `/api/quizzes/document/${documentId}`,
      );
      setQuizzes(res.data.data || []);
    } catch (err) {
      console.error("Failed to load quizzes", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (documentId) loadQuizzes();
  }, [documentId]);

  /* ================= GENERATE ================= */

  const handleGenerate = async (config) => {
    try {
      setGenerating(true);

      await axiosInstance.post(`/api/ai/generate-quiz`, {
        documentId,
        numQuestions: config.count,
        title: config.title,
      });

      await loadQuizzes();
    } catch (err) {
      console.error("Failed to generate quiz", err);
    } finally {
      setGenerating(false);
    }
  };

  /* ================= DELETE ================= */

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/api/quizzes/${id}`);
      setQuizzes((prev) => prev.filter((q) => q._id !== id));
    } catch (err) {
      console.error("Failed to delete quiz", err);
    }
  };

  /* ================= OPEN QUIZ (auto-start) ================= */
  const handleOpenQuiz = (quiz) => {
    setActiveQuiz(quiz);
    setMode(quiz.score === null ? "take" : "result");
  };

  /* ================= TAKE MODE ================= */

  if (mode === "take" && activeQuiz) {
    return (
      <QuizTakePage
        key={activeQuiz._id + "-take"}
        quiz={activeQuiz}
        onFinish={async (answers) => {
          try {
            await submitQuiz(activeQuiz._id, answers);
            await loadQuizzes();
            const updated = quizzes.find((q) => q._id === activeQuiz._id);
            setActiveQuiz(updated || activeQuiz);
            setMode("result");
          } catch (err) {
            console.error("Submit quiz failed:", err);
          }
        }}
        onBack={() => {
          setMode("list");
          setActiveQuiz(null);
        }}
      />
    );
  }

  /* ================= RESULT MODE ================= */

  if (mode === "result" && activeQuiz) {
    return (
      <QuizResultPage
        quiz={activeQuiz}
        onBack={() => {
          setMode("list");
          setActiveQuiz(null);
        }}
        onRemake={(newQuiz) => {
          // Cập nhật danh sách quizzes
          setQuizzes((prev) => {
            const exists = prev.find((q) => q._id === newQuiz._id);
            if (exists) {
              return prev.map((q) => (q._id === newQuiz._id ? newQuiz : q));
            } else {
              return [newQuiz, ...prev];
            }
          });

          // Mở chế độ Take cho quiz vừa remake
          setActiveQuiz(newQuiz);
          setMode("take");
        }}
      />
    );
  }

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <div className="text-center py-20 text-slate-400">Loading quizzes...</div>
    );
  }

  /* ================= EMPTY ================= */

  if (quizzes.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <EmptyState
          title="No quizzes yet"
          description="Generate quizzes from this document"
          actionLabel="Create your first quiz"
          onAction={() => setShowGenerateModal(true)}
          loading={generating}
        />
        {/* 👇 THÊM MODAL VÀO ĐÂY */}
        <GenerateQuizModal
          open={showGenerateModal}
          generating={generating}
          onClose={() => setShowGenerateModal(false)}
          onGenerate={async (config) => {
            await handleGenerate(config);
            setShowGenerateModal(false);
          }}
        />
      </div>
    );
  }

  /* ================= MAIN VIEW ================= */

  return (
    <div className="px-6 py-6">
      <div className="w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-100">My Quizzes</h2>
            <p className="text-sm text-emerald-300/100 mt-1 font-medium">
              Generate and manage your quizzes effortlessly
            </p>
          </div>

          <button
            onClick={() => setShowGenerateModal(true)}
            disabled={generating}
            className="
            px-5 py-2.5 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600
          "
          >
            {generating ? "Generating..." : "+ Generate Quiz"}
          </button>
        </div>

        {/* Divider */}
        <div className="h-px bg-slate-700 mb-8"></div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {quizzes.map((quiz) => (
            <QuizCard
              key={quiz._id}
              quiz={quiz}
              onStart={() => handleOpenQuiz(quiz)}
              onDelete={() => setQuizToDelete(quiz)}
            />
          ))}
        </div>

        <GenerateQuizModal
          open={showGenerateModal}
          generating={generating}
          onClose={() => setShowGenerateModal(false)}
          onGenerate={async (config) => {
            await handleGenerate(config);
            setShowGenerateModal(false);
          }}
        />
      </div>
      {/* Delete Modal */}
      {quizToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setQuizToDelete(null)}
          />

          <div className="relative bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <h3 className="text-lg font-bold text-slate-800 mb-2">
              Delete Quiz
            </h3>

            <p className="text-slate-600 mb-6">
              Are you sure you want to delete{" "}
              <span className="font-semibold">{quizToDelete.title}</span>?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setQuizToDelete(null)}
                className="px-4 py-2 rounded-lg font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>

              <button
                onClick={async () => {
                  await handleDelete(quizToDelete._id);
                  setQuizToDelete(null);
                }}
                className="px-5 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizManager;
