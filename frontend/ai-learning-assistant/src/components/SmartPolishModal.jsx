import React, { useState } from 'react';
import { X, Sparkles, Loader2, Plus, RefreshCw } from 'lucide-react';
import axiosInstance from '../utils/axiosInstance'; // Assuming axiosInstance is configured
import apiPaths from '../utils/apiPaths'; // Assuming we can use or just hardcode for now

export default function SmartPolishModal({ isOpen, onClose, type = "flashcard", existingData = [], onApply }) {
  const [mode, setMode] = useState("expand"); // "expand" | "topic"
  const [topic, setTopic] = useState("");
  const [count, setCount] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (mode === "topic" && !topic.trim()) {
      alert("Please enter a topic.");
      return;
    }
    
    setIsGenerating(true);
    setPreviewData(null);
    try {
      const endpoint = type === "flashcard" ? "/api/ai/smart-polish-flashcard" : "/api/ai/smart-polish-quiz";
      
      const payload = {
        mode,
        count: parseInt(count, 10),
      };

      if (mode === "expand") {
        payload.existingCards = type === "flashcard" ? existingData : undefined;
        payload.existingQuestions = type === "quiz" ? existingData : undefined;
        payload.topic = ""; // optional
      } else {
        payload.topic = topic;
      }

      // Hardcode or use axiosInstance
      const response = await axiosInstance.post(endpoint, payload);
      if (response.data?.success) {
        let finalData = response.data.data;
        if (type === "quiz") {
          finalData = finalData.map(q => {
            const correctText = typeof q.correctAnswer === 'string' ? q.correctAnswer.toLowerCase() : '';
            let cIndex = q.options.findIndex(o => o.toLowerCase() === correctText);
            if (cIndex === -1) cIndex = 0;
            return {
              ...q,
              correctAnswer: cIndex
            };
          });
        }
        setPreviewData(finalData);
      } else {
        alert("Failed to generate.");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred during generation.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApply = () => {
    if (previewData) {
      onApply(previewData);
      setPreviewData(null);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#0b110e] border border-[#1e2924] rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col overflow-hidden max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-[#1e2924]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <Sparkles className="text-emerald-400" size={20} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Smart Polish</h3>
              <p className="text-sm text-slate-400">AI-powered generation for your {type === "flashcard" ? "Flashcards" : "Quiz"}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto">
          {!previewData ? (
            <div className="space-y-6">
              {/* Mode Selection */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setMode("expand")}
                  className={`p-4 rounded-xl border text-left transition ${mode === "expand" ? 'border-emerald-500 bg-emerald-500/10' : 'border-[#1e2924] bg-[#111714] hover:border-slate-600'}`}
                >
                  <h4 className={`font-bold mb-1 ${mode === "expand" ? 'text-emerald-400' : 'text-slate-300'}`}>Mode 1: Expand</h4>
                  <p className="text-xs text-slate-500">Generate new items based on your current set. No overlapping concepts.</p>
                </button>
                <button
                  onClick={() => setMode("topic")}
                  className={`p-4 rounded-xl border text-left transition ${mode === "topic" ? 'border-emerald-500 bg-emerald-500/10' : 'border-[#1e2924] bg-[#111714] hover:border-slate-600'}`}
                >
                  <h4 className={`font-bold mb-1 ${mode === "topic" ? 'text-emerald-400' : 'text-slate-300'}`}>Mode 2: By Topic</h4>
                  <p className="text-xs text-slate-500">Quickly create new items based on a specific topic or keyword.</p>
                </button>
              </div>

              {/* Inputs */}
              {mode === "topic" && (
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Topic</label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. History of Rome, Quantum Physics..."
                    className="w-full bg-[#111714] border border-[#1e2924] rounded-xl px-4 py-3 outline-none focus:border-emerald-500/50 transition text-sm text-white"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Count</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={count}
                  onChange={(e) => setCount(e.target.value)}
                  className="w-full bg-[#111714] border border-[#1e2924] rounded-xl px-4 py-3 outline-none focus:border-emerald-500/50 transition text-sm text-white"
                />
              </div>

            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-sm font-bold text-emerald-400 uppercase tracking-widest">Preview Generated Items</h4>
                <button 
                  onClick={() => setPreviewData(null)}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                >
                  <RefreshCw size={12} /> Regenerate
                </button>
              </div>
              
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {previewData.map((item, idx) => (
                  <div key={idx} className="bg-[#111714] border border-[#1e2924] rounded-xl p-4">
                    <p className="text-sm font-bold text-slate-300 mb-2">
                      <span className="text-emerald-500 mr-2">Q:</span>
                      {item.question}
                    </p>
                    {type === "flashcard" ? (
                      <p className="text-sm text-slate-400">
                        <span className="text-slate-500 mr-2">A:</span>
                        {item.answer}
                      </p>
                    ) : (
                      <div className="mt-2 space-y-1">
                        {item.options.map((opt, oIdx) => (
                          <div key={oIdx} className={`text-xs px-2 py-1 rounded ${item.correctAnswer === oIdx ? 'bg-emerald-500/20 text-emerald-400 font-semibold' : 'text-slate-500'}`}>
                            {['A', 'B', 'C', 'D'][oIdx]}: {opt}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[#1e2924] flex justify-end gap-4 bg-[#0d120f]">
          <button onClick={onClose} className="px-6 py-2.5 rounded-full text-slate-300 font-semibold text-sm hover:text-white transition">
            Cancel
          </button>
          
          {!previewData ? (
            <button 
              onClick={handleGenerate}
              disabled={isGenerating || (mode === "topic" && !topic.trim())}
              className="px-6 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-emerald-950 font-bold text-sm flex items-center gap-2 transition"
            >
              {isGenerating ? <><Loader2 className="animate-spin" size={16} /> Generating...</> : <><Sparkles size={16} /> Generate Preview</>}
            </button>
          ) : (
            <button 
              onClick={handleApply}
              className="px-6 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold text-sm flex items-center gap-2 transition"
            >
              <Plus size={16} /> Add to Set
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
