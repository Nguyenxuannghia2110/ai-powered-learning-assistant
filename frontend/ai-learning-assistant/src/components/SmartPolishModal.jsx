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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-indigo-900/20 backdrop-blur-sm">
      <div className="glass-card w-full max-w-3xl flex flex-col overflow-hidden max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-hairline">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-lg text-white shadow-sm">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-ink">Smart Polish</h3>
              <p className="text-sm text-body">AI-powered generation for your {type === "flashcard" ? "Flashcards" : "Quiz"}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-body hover:text-ink transition">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
          {!previewData ? (
            <div className="space-y-6">
              {/* Mode Selection */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setMode("expand")}
                  className={`p-5 rounded-xl border-2 text-left transition shadow-sm ${mode === "expand" ? 'border-purple-400 bg-white/80' : 'border-white/60 bg-white/40 hover:bg-white/60'}`}
                >
                  <h4 className={`font-bold mb-1 ${mode === "expand" ? 'text-purple-700' : 'text-ink'}`}>Mode 1: Expand</h4>
                  <p className="text-xs text-body leading-relaxed">Generate new items based on your current set. No overlapping concepts.</p>
                </button>
                <button
                  onClick={() => setMode("topic")}
                  className={`p-5 rounded-xl border-2 text-left transition shadow-sm ${mode === "topic" ? 'border-purple-400 bg-white/80' : 'border-white/60 bg-white/40 hover:bg-white/60'}`}
                >
                  <h4 className={`font-bold mb-1 ${mode === "topic" ? 'text-purple-700' : 'text-ink'}`}>Mode 2: By Topic</h4>
                  <p className="text-xs text-body leading-relaxed">Quickly create new items based on a specific topic or keyword.</p>
                </button>
              </div>

              {/* Inputs */}
              {mode === "topic" && (
                <div>
                  <label className="block text-xs font-semibold text-body mb-2 uppercase tracking-widest">Topic</label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. History of Rome, Quantum Physics..."
                    className="w-full bg-white/50 border border-white/60 rounded-xl px-4 py-3 outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 shadow-inner transition text-sm text-ink"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-body mb-2 uppercase tracking-widest">Count</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={count}
                  onChange={(e) => setCount(e.target.value)}
                  className="w-full bg-white/50 border border-white/60 rounded-xl px-4 py-3 outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 shadow-inner transition text-sm text-ink"
                />
              </div>

            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-sm font-bold text-primary uppercase tracking-widest">Preview Generated Items</h4>
                <button 
                  onClick={() => setPreviewData(null)}
                  className="text-xs font-semibold text-body hover:text-ink flex items-center gap-1.5 transition"
                >
                  <RefreshCw size={14} /> Regenerate
                </button>
              </div>
              
              <div className="space-y-4 pr-2">
                {previewData.map((item, idx) => (
                  <div key={idx} className="bg-white/50 border border-white/60 rounded-xl p-5 shadow-sm space-y-4">
                    {type === "flashcard" ? (
                      <>
                        <div>
                          <label className="text-xs text-body uppercase tracking-widest font-semibold mb-2 block">Question</label>
                          <textarea 
                            value={item.question}
                            onChange={(e) => {
                              const newData = [...previewData];
                              newData[idx].question = e.target.value;
                              setPreviewData(newData);
                            }}
                            className="w-full bg-white/60 border border-white/50 rounded-xl p-3 text-sm text-ink focus:border-purple-400 focus:ring-1 focus:ring-purple-400 outline-none resize-none shadow-inner"
                            rows={2}
                          />
                        </div>
                        <div>
                          <label className="text-xs text-body uppercase tracking-widest font-semibold mb-2 block">Answer</label>
                          <textarea 
                            value={item.answer}
                            onChange={(e) => {
                              const newData = [...previewData];
                              newData[idx].answer = e.target.value;
                              setPreviewData(newData);
                            }}
                            className="w-full bg-white/60 border border-white/50 rounded-xl p-3 text-sm text-ink focus:border-purple-400 focus:ring-1 focus:ring-purple-400 outline-none resize-none shadow-inner"
                            rows={2}
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                           <label className="text-xs text-body uppercase tracking-widest font-semibold mb-2 block">Question</label>
                           <textarea 
                            value={item.question}
                            onChange={(e) => {
                              const newData = [...previewData];
                              newData[idx].question = e.target.value;
                              setPreviewData(newData);
                            }}
                            className="w-full bg-white/60 border border-white/50 rounded-xl p-3 text-sm text-ink focus:border-purple-400 focus:ring-1 focus:ring-purple-400 outline-none resize-none shadow-inner"
                            rows={2}
                          />
                        </div>
                        <div className="space-y-3">
                          <label className="text-xs text-body uppercase tracking-widest font-semibold block">Options (Select correct)</label>
                          {(item.options || []).map((opt, oIdx) => (
                            <div key={oIdx} className="flex items-center gap-3">
                              <input 
                                type="radio" 
                                name={`correct-${idx}`}
                                checked={item.correctAnswer === oIdx}
                                onChange={() => {
                                  const newData = [...previewData];
                                  newData[idx].correctAnswer = oIdx;
                                  setPreviewData(newData);
                                }}
                                className="accent-purple-500 w-4 h-4"
                              />
                              <input 
                                value={opt}
                                onChange={(e) => {
                                  const newData = [...previewData];
                                  newData[idx].options[oIdx] = e.target.value;
                                  setPreviewData(newData);
                                }}
                                className={`flex-1 bg-white/60 border rounded-xl p-2.5 text-sm outline-none shadow-inner focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition ${item.correctAnswer === oIdx ? 'border-purple-400 text-purple-700 font-medium bg-purple-50/50' : 'border-white/50 text-ink'}`}
                              />
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-hairline flex justify-end gap-4">
          <button onClick={onClose} className="px-6 py-2.5 rounded-xl bg-white/60 border border-white/50 hover:bg-white/80 transition font-semibold text-body shadow-sm">
            Cancel
          </button>
          
          {!previewData ? (
            <button 
              onClick={handleGenerate}
              disabled={isGenerating || (mode === "topic" && !topic.trim())}
              className="px-6 py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-md transition-all bg-gradient-to-r from-purple-400 to-indigo-400 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-500/20 hover:shadow-lg disabled:opacity-50 min-w-[160px]"
            >
              {isGenerating ? <><Loader2 className="animate-spin" size={16} /> Generating...</> : <><Sparkles size={16} /> Generate Preview</>}
            </button>
          ) : (
            <button 
              onClick={handleApply}
              className="px-6 py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-md transition-all bg-gradient-to-r from-purple-400 to-indigo-400 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-500/20 hover:shadow-lg min-w-[160px]"
            >
              <Plus size={16} /> Add to Set
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
