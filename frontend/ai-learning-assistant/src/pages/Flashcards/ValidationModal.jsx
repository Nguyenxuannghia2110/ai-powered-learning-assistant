import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import flashcardService from '../../services/flashcardService';

export default function ValidationModal({ isOpen, onClose, previewData, onConfirm, providedTitle }) {
  const [isConfirming, setIsConfirming] = useState(false);

  if (!isOpen || !previewData) return null;

  const validCards = previewData.preview.filter(c => c.valid);
  const errorCards = previewData.preview.filter(c => !c.valid);
  const hasErrors = errorCards.length > 0;

  const handleConfirm = async () => {
    try {
      setIsConfirming(true);
      const dataToSubmit = {
        title: providedTitle || "Uploaded Dataset",
        cards: previewData.preview // backend filters valid inside
      };
      const res = await flashcardService.confirmFlashcardFromSheet(dataToSubmit);
      onConfirm(res.data); // Return the newly created set
    } catch (err) {
      console.error(err);
      alert(err.error || "Confirm failed");
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#080f0c]/90 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-5xl bg-[#131715] border border-[#1e2924] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-8 pb-6 shrink-0 relative">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 text-slate-400 hover:text-white transition"
          >
            <X size={20} />
          </button>
          
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-3">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            STRUCTURAL VALIDATION REQUIRED
          </div>
          <h2 className="text-3xl font-black text-white mb-2">Review & Validate</h2>
          <p className="text-slate-400 text-sm">
            The neural engine has synthesized {validCards.length + errorCards.length} new core concepts. Please verify the structural integrity before finalizing the deployment.
          </p>

          {hasErrors && (
            <div className="mt-6 border border-rose-500/20 bg-rose-500/5 rounded-xl p-4 flex items-center justify-between">
               <div className="flex items-center gap-3">
                <div className="text-rose-400"><AlertCircle size={20} /></div>
                <div>
                  <h4 className="text-rose-400 text-sm font-bold">Neural Synthesis Errors Detected</h4>
                  <p className="text-rose-400/80 text-xs mt-0.5">Some nodes contain empty semantic maps or invalid logic gates. These will be ignored.</p>
                </div>
               </div>
               <div className="text-rose-400 text-xs font-bold uppercase tracking-wider bg-rose-500/10 px-3 py-1.5 rounded-md border border-rose-500/20">
                  {errorCards.length} CRITICAL FLAWS
               </div>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto bg-[#131715] px-8 pb-4 scrollbar-thin scrollbar-thumb-slate-700">
           <div className="w-full text-left bg-[#1a1e1c] rounded-xl overflow-hidden border border-[#26312d]">
              <div className="grid grid-cols-[1fr_2fr_150px] gap-4 p-4 text-[10px] uppercase font-bold text-slate-500 tracking-wider border-b border-[#26312d]">
                 <div>FRONT (CONCEPT)</div>
                 <div>BACK (DEFINITION)</div>
                 <div className="text-right pr-2">SYSTEM STATUS</div>
              </div>

              <div className="divide-y divide-[#26312d]">
                 {previewData.preview.map((card, idx) => {
                    const isValid = card.valid;
                    const isQuestionEmpty = !card.question;
                    const isAnswerEmpty = !card.answer;
                    
                    return (
                      <div key={idx} className="grid grid-cols-[1fr_2fr_150px] gap-4 p-4 hover:bg-[#1f2522] transition items-center text-sm">
                         <div>
                            {isValid || !isQuestionEmpty ? (
                              <span className="text-white font-medium">{card.question}</span>
                            ) : (
                              <div className="inline-block border border-rose-400/50 rounded-full px-4 py-2 text-slate-400 relative">
                                Undefined cognitive node...
                                <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-rose-500 rounded-full text-white text-[10px] flex items-center justify-center font-bold">!</div>
                              </div>
                            )}
                         </div>

                         <div>
                            {isValid || !isAnswerEmpty ? (
                              <span className="text-slate-300 leading-relaxed block pr-4">{card.answer}</span>
                            ) : (
                              <div className="inline-block border border-rose-400/50 rounded-full px-4 py-2 text-slate-400 relative">
                                Empty semantic map...
                                <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-rose-500 rounded-full text-white text-[10px] flex items-center justify-center font-bold">!</div>
                              </div>
                            )}
                         </div>

                         <div className="flex justify-end pr-2">
                            {isValid ? (
                               <div className="bg-emerald-500/10 text-emerald-400 font-bold text-[10px] uppercase tracking-wider px-3 py-1 rounded-md border border-emerald-500/20">
                                VALIDATED
                               </div>
                            ) : (
                               <div className="flex flex-col items-end gap-1">
                                  <div className="bg-rose-500/10 text-rose-400 font-bold text-[10px] uppercase tracking-wider px-3 py-1 rounded-md border border-rose-500/20">
                                   NODE EMPTY
                                  </div>
                                  <span className="text-[9px] text-slate-500">Manual Input Required</span>
                               </div>
                            )}
                         </div>
                      </div>
                    )
                 })}
              </div>
           </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-[#0f1311] border-t border-[#1e2924] shrink-0 flex items-center justify-between">
           <div className="flex items-center gap-3 bg-[#131715] px-4 py-2 rounded-full border border-[#1e2924]">
              <div className="text-emerald-400">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
              </div>
              <span className="text-slate-400 text-xs italic">Waiting for manual override on {errorCards.length} conflict nodes...</span>
           </div>

           <div className="flex gap-4">
              <button 
                onClick={onClose}
                className="px-6 py-3 rounded-xl border border-[#2a3630] text-slate-300 font-bold hover:bg-[#1f2824] transition text-sm"
              >
                DISCARD DRAFT
              </button>
              
              <button 
                onClick={handleConfirm}
                disabled={isConfirming || validCards.length === 0}
                className="px-6 py-3 rounded-xl bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 text-emerald-950 font-black flex items-center gap-2 transition text-sm shadow-[0_0_15px_rgba(52,211,153,0.3)]"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M5 13l4 4L19 7" /></svg>
                {isConfirming ? "GENERATING..." : "CONFIRM & GENERATE"}
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
