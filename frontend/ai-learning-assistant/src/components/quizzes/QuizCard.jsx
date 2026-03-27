import React from "react";
import { Play, Eye, Trash2, Award, Clock } from "lucide-react";

const QuizCard = ({ quiz, onStart, onDelete }) => {
  return (
    <div
      className="
        group
        relative
aspect-[8/5]
flex
flex-col
justify-between
rounded-2xl
p-5
bg-gradient-to-br
from-[#06281f]
via-[#063328]
to-[#041c15]
text-white
border
border-emerald-800/40
shadow-lg
hover:border-emerald-400
hover:-translate-y-1
hover:shadow-xl
transition-all
      "
    >
      {/* Top */}
      <div>
        <div className="flex justify-between items-start mb-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-200 rounded-lg text-xs font-bold uppercase tracking-wider">
            <Award size={14} />
            Score: {quiz.score ?? 0}
          </span>

          <button
            onClick={() => onDelete(quiz)}
            className="p-2 text-emerald-300/70 hover:text-red-400 transition-colors"
          >
            <Trash2 size={18} />
          </button>
        </div>

        <h3 className="text-lg font-bold text-white mb-1 line-clamp-1">
          {quiz.title}
        </h3>

        <p className="text-xs text-emerald-300/70 uppercase tracking-widest flex items-center gap-1.5">
          <Clock size={12} />
          CREATED {new Date(quiz.createdAt).toLocaleDateString()}
        </p>
      </div>

      {/* Bottom */}
      <div className="mt-6 space-y-4">
        <div className="inline-block px-4 py-2 bg-emerald-900/40 text-emerald-200 rounded-xl text-sm font-semibold">
          {quiz.totalQuestions} Questions
        </div>

        <button
          onClick={() => onStart(quiz)}
          className="
          w-full
          py-3
          rounded-xl
          font-semibold
          bg-emerald-500
          text-white
          hover:bg-emerald-400
          transition
          flex
          items-center
          justify-center
          gap-2
          "
        >
          {quiz.score === null ? (
            <>
              <Play size={18} fill="currentColor" />
              Start Quiz
            </>
          ) : (
            <>
              <Eye size={18} />
              View Results
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default QuizCard;
