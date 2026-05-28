import React, { useState } from 'react';
import { Check, X } from 'lucide-react';
import quizService from '../../services/quizService';

export default function ValidationModal({ isOpen, onClose, previewData, onConfirm, providedTitle }) {
  const [isConfirming, setIsConfirming] = useState(false);

  if (!isOpen || !previewData) return null;

  const validQuestions = previewData.preview.filter(q => q.valid);

  const handleConfirm = async () => {
    try {
      setIsConfirming(true);
      const dataToSubmit = {
        title: providedTitle || "Uploaded Quiz",
        questions: validQuestions // Backend will filter inside again if needed
      };
      const res = await quizService.confirmQuizFromSheet(dataToSubmit);
      onConfirm(res.data);
    } catch (err) {
      console.error(err);
      alert(err.error || "Confirm failed");
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-indigo-900/20 backdrop-blur-sm px-4 py-8">
      <div className="relative w-full max-w-5xl h-full max-h-[90vh] glass-card border border-white/50 rounded-xl shadow-2xl flex flex-col pt-0 pb-0 text-ink">
        
        {/* Header */}
        <div className="px-10 py-6 shrink-0 relative border-b border-white/40 bg-white/40 z-10 rounded-t-xl">
          <button 
            onClick={onClose}
            className="absolute top-6 right-10 text-body hover:text-ink transition"
          >
            <X size={24} />
          </button>
          
          <h2 className="text-4xl font-black text-ink tracking-tight mb-2">Neural Architectures</h2>
          <p className="text-body text-sm max-w-2xl">
            Review your AI-generated quiz questions. Adjust accuracy markers or edit strings before finalizing the deployment.
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-10 py-8 scrollbar-thin scrollbar-thumb-purple-200 scrollbar-track-transparent bg-white/10">
          <div className="space-y-8 pb-28">
            {previewData.preview.map((q, idx) => {
              const qNum = (idx + 1).toString().padStart(3, '0');
              const isValid = q.valid;

              return (
                <div key={idx} className="bg-white/60 border border-white/50 rounded-xl p-6 relative group shadow-sm">
                  <div className="absolute top-6 right-6 text-[10px] font-bold text-purple-700 tracking-wider">
                    Q-{qNum}
                  </div>
                  
                  <h3 className="text-xl font-bold text-ink mb-6 pr-12">
                    {q.question || "Empty Question Prompt"}
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    {q.options.map((opt, oIdx) => {
                      const isCorrect = q.correctAnswer === oIdx;
                      const letter = String.fromCharCode(65 + oIdx);

                      return (
                         <div 
                           key={oIdx}
                           className={`relative rounded-xl p-4 flex items-start gap-4 border transition-colors ${
                              isCorrect 
                                ? 'bg-purple-100 border-purple-400 shadow-sm' 
                                : 'bg-white/50 border-white/60'
                           }`}
                         >
                            <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-black ${
                              isCorrect ? 'bg-purple-500 text-white shadow-[0_0_10px_rgba(168,85,247,0.5)]' : 'bg-gray-200 text-gray-500'
                            }`}>
                              {letter}
                            </div>
                            <div className="flex-1 pt-0.5">
                              <p className={`text-sm leading-relaxed ${isCorrect ? 'text-purple-900 font-medium' : 'text-ink'}`}>
                                {opt}
                              </p>
                            </div>
                            {isCorrect && (
                              <div className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center text-white shadow-sm">
                                <Check size={12} strokeWidth={4} />
                              </div>
                            )}
                         </div>
                      );
                    })}
                  </div>

                  {!isValid && (
                    <div className="mt-4 text-orange-500 font-bold text-sm flex items-center gap-2">
                       <X size={16} /> Data Error: Missing required fields or invalid format for this question. This will be excluded.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 px-10 bg-white/60 backdrop-blur-md border-t border-white/40 shrink-0 flex items-center justify-between rounded-b-xl shrink-0 absolute bottom-0 w-full z-10 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
           <div className="flex items-center">
             {/* Decorative avatars representing reviewers/collaborators as per mockup */}
             <div className="flex -space-x-2">
               <div className="w-8 h-8 rounded-full border-2 border-white shadow-sm bg-gradient-to-br from-blue-400 to-indigo-400" />
               <div className="w-8 h-8 rounded-full border-2 border-white shadow-sm bg-gradient-to-br from-purple-400 to-pink-400" />
               <div className="w-8 h-8 rounded-full border-2 border-white shadow-sm bg-gradient-to-br from-emerald-400 to-teal-400" />
             </div>
           </div>

           <div className="flex items-center gap-4">
              <button 
                onClick={onClose}
                className="w-12 h-12 rounded-full border border-white/50 bg-white/40 hover:bg-white/80 transition flex items-center justify-center text-body hover:text-ink shadow-sm"
              >
                <X size={20} />
              </button>
              
              <button 
                onClick={handleConfirm}
                disabled={isConfirming || validQuestions.length === 0}
                className="px-8 py-3.5 rounded-full bg-gradient-to-r from-purple-400 to-indigo-400 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-black tracking-wide transition text-sm shadow-md shadow-purple-500/20 whitespace-nowrap"
              >
                {isConfirming ? "SAVING..." : "Confirm & Save"}
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
