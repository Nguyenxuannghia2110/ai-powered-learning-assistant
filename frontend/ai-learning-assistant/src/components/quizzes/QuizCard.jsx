import React from "react";
import { Play, Eye, Trash2, Award, Clock } from "lucide-react";

const QuizCard = ({ quiz, onStart, onDelete }) => {
  return (
    <div
      onClick={() => onStart(quiz)}
      className="bg-canvas-card rounded-md p-6 hover:bg-canvas-mid shadow-[0_8px_8px_rgba(0,0,0,0.3)] transition-all cursor-pointer group flex flex-col h-full relative overflow-hidden"
    >
      <div className="relative z-10 flex flex-col h-full">
        {/* HEADER */}
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 bg-primary/10 rounded-full text-primary">
            <Award className="w-6 h-6" />
          </div>
          <div className="px-3 py-1 bg-canvas-mid rounded-pill text-[12px] font-bold text-body uppercase tracking-[1.4px]">
            Score: {quiz.score ?? 0}
          </div>
        </div>

        {/* TITLE */}
        <h3 className="text-[18px] font-bold text-ink mb-2 group-hover:text-primary transition-colors line-clamp-2" title={quiz.title}>
          {quiz.title}
        </h3>

        {/* DETAILS */}
        <p className="text-body text-sm mb-6 flex items-start gap-2 line-clamp-2">
          {quiz.totalQuestions} Questions
        </p>

        {/* FOOTER */}
        <div className="mt-auto space-y-4">
          <div className="flex items-center justify-between pt-4 border-t border-hairline">
            <div className="flex items-center gap-2 text-[12px] text-mute">
              <Clock className="w-4 h-4" />
              Created {new Date(quiz.createdAt).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(quiz);
                }}
                className="w-8 h-8 rounded-full bg-canvas-mid flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors text-mute"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <div className="w-8 h-8 rounded-full bg-canvas-mid flex items-center justify-center group-hover:bg-primary group-hover:text-canvas transition-colors">
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
