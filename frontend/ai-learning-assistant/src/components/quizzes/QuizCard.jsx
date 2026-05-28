import React from "react";
import { Play, Eye, Trash2, Award, Clock } from "lucide-react";

const QuizCard = ({ quiz, onStart, onDelete }) => {
  return (
    <div
      onClick={() => onStart(quiz)}
      className="glass-card p-6 hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-500/20 transition-all cursor-pointer group flex flex-col h-full relative overflow-hidden"
    >
      <div className="relative z-10 flex flex-col h-full">
        {/* HEADER */}
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 bg-purple-100 rounded-xl text-purple-600 shadow-sm">
            <Award className="w-6 h-6" />
          </div>
          <div className="px-3 py-1 bg-white/60 shadow-sm border border-white/40 rounded-full text-[12px] font-bold text-purple-700 uppercase tracking-[1.4px]">
            Score: {quiz.score ?? 0}
          </div>
        </div>

        {/* TITLE */}
        <h3 className="text-[18px] font-bold text-ink mb-2 group-hover:text-purple-600 transition-colors line-clamp-2" title={quiz.title}>
          {quiz.title}
        </h3>

        {/* DETAILS */}
        <p className="text-body text-sm mb-6 flex items-start gap-2 line-clamp-2">
          {quiz.totalQuestions} Questions
        </p>

        {/* FOOTER */}
        <div className="mt-auto space-y-4">
          <div className="flex items-center justify-between pt-4 border-t border-hairline">
            <div className="flex items-center gap-2 text-[12px] text-mute font-medium">
              <Clock className="w-4 h-4" />
              Created {new Date(quiz.createdAt).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(quiz);
                }}
                className="w-8 h-8 rounded-full bg-white/60 border border-white/40 flex items-center justify-center hover:bg-red-500 hover:text-white hover:border-red-500 transition-colors text-mute"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <div className="w-8 h-8 rounded-full bg-white/60 border border-white/40 shadow-sm flex items-center justify-center group-hover:bg-purple-500 group-hover:text-white transition-colors">
                {quiz.score === null ? <Play className="w-4 h-4 ml-0.5" /> : <Eye className="w-4 h-4" />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizCard;
