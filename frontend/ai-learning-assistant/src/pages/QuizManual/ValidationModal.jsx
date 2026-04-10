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
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#080f0c]/90 backdrop-blur-sm px-4 py-8">
      <div className="relative w-full max-w-5xl h-full max-h-[90vh] bg-[#0b110e] border border-[#1e2924] rounded-3xl shadow-2xl flex flex-col pt-8 pb-0">
        
        {/* Header */}
        <div className="px-10 pb-6 shrink-0 relative border-b border-[#1e2924] bg-[#0b110e] z-10">
          <button 
            onClick={onClose}
            className="absolute top-0 right-10 text-slate-500 hover:text-white transition"
          >
            <X size={24} />
          </button>
          
          <h2 className="text-4xl font-black text-white tracking-tight mb-2">Neural Architectures</h2>
          <p className="text-slate-400 text-sm max-w-2xl">
            Review your AI-generated quiz questions. Adjust accuracy markers or edit strings before finalizing the deployment.
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-10 py-8 scrollbar-thin scrollbar-thumb-emerald-900 scrollbar-track-transparent">
          <div className="space-y-8">
            {previewData.preview.map((q, idx) => {
              const qNum = (idx + 1).toString().padStart(3, '0');
              const isValid = q.valid;

              return (
                <div key={idx} className="bg-[#131715] border border-[#1e2924] rounded-2xl p-6 relative group">
                  <div className="absolute top-6 right-6 text-[10px] font-bold text-slate-500 tracking-wider">
                    Q-{qNum}
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-6 pr-12">
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
                                ? 'bg-[#0f1d16] border-emerald-500/50' 
                                : 'bg-[#181c1a] border-[#222a27]'
                           }`}
                         >
                            <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-black ${
                              isCorrect ? 'bg-emerald-400 text-emerald-950' : 'bg-[#2a332f] text-slate-400'
                            }`}>
                              {letter}
                            </div>
                            <div className="flex-1 pt-0.5">
                              <p className={`text-sm leading-relaxed ${isCorrect ? 'text-white' : 'text-slate-300'}`}>
                                {opt}
                              </p>
                            </div>
                            {isCorrect && (
                              <div className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-emerald-950">
                                <Check size={12} strokeWidth={4} />
                              </div>
                            )}
                         </div>
                      );
                    })}
                  </div>

                  {!isValid && (
                    <div className="mt-4 text-rose-400 text-sm flex items-center gap-2">
                       <X size={16} /> Data Error: Missing required fields or invalid format for this question. This will be excluded.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 px-10 bg-[#0f1311]/95 backdrop-blur-md border-t border-[#1e2924] shrink-0 flex items-center justify-between rounded-b-3xl shrink-0 absolute bottom-0 w-full z-10">
           <div className="flex items-center">
             {/* Decorative avatars representing reviewers/collaborators as per mockup */}
             <div className="flex -space-x-2">
               <div className="w-8 h-8 rounded-full border border-black bg-slate-800" />
               <div className="w-8 h-8 rounded-full border border-black bg-slate-700" />
               <div className="w-8 h-8 rounded-full border border-black bg-slate-600" />
             </div>
           </div>

           <div className="flex items-center gap-4">
              <button 
                onClick={onClose}
                className="w-12 h-12 rounded-full border border-[#2a3630] hover:bg-[#1f2824] transition flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X size={20} />
              </button>
              
              <button 
                onClick={handleConfirm}
                disabled={isConfirming || validQuestions.length === 0}
                className="px-8 py-3.5 rounded-full bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 text-emerald-950 font-black tracking-wide transition text-sm shadow-[0_0_20px_rgba(52,211,153,0.25)] whitespace-nowrap"
              >
                {isConfirming ? "SAVING..." : "Confirm & Save"}
              </button>
           </div>
        </div>
        {/* Spacer for footer */}
        <div className="h-28 bg-[#0b110e] shrink-0 w-full rounded-b-3xl"></div>
      </div>
    </div>
  );
}
