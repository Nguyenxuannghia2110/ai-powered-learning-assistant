import React, { useState } from 'react';
import { Trash2, Sparkles } from 'lucide-react';
import quizService from '../../services/quizService';
import SpreadsheetUploadModal from './SpreadsheetUploadModal';
import ValidationModal from './ValidationModal';
import SmartPolishModal from '../../components/SmartPolishModal';

export default function QuizDesignPage({ onBack, onGenerate }) {
  const [title, setTitle] = useState("Evaluation Matrix Alpha");
  const [questions, setQuestions] = useState([
    {
      id: 1,
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0
    }
  ]);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isSpreadsheetOpen, setIsSpreadsheetOpen] = useState(false);
  const [isSmartPolishOpen, setIsSmartPolishOpen] = useState(false);
  const [validationData, setValidationData] = useState(null);

  const handleAddQuestion = () => {
    if (questions.length >= 50) return;
    setQuestions([...questions, { id: Date.now(), question: "", options: ["", "", "", ""], correctAnswer: 0 }]);
  };

  const handleRemoveQuestion = (id) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const handleChangeQuestion = (id, value) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, question: value } : q));
  };

  const handleChangeOption = (qId, oIdx, value) => {
    setQuestions(questions.map(q => {
      if (q.id === qId) {
        const newOptions = [...q.options];
        newOptions[oIdx] = value;
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };

  const handleSetCorrectAnswer = (qId, oIdx) => {
    setQuestions(questions.map(q => q.id === qId ? { ...q, correctAnswer: oIdx } : q));
  };

  const handleGenerateManual = async () => {
    const validQuestions = questions.filter(q => 
      q.question.trim() && 
      q.options.every(o => o.trim()) &&
      [0, 1, 2, 3].includes(q.correctAnswer)
    );
    
    if (validQuestions.length === 0) {
      alert("Please add at least one valid question with all 4 options filled.");
      return;
    }

    try {
      setIsGenerating(true);
      const dataToSubmit = {
        title: title || "Untitled Quiz",
        questions: validQuestions
      };
      const res = await quizService.createManualQuiz(dataToSubmit);
      onGenerate(res.data);
    } catch (err) {
      console.error(err);
      alert(err.error || "Generate failed");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUploadSuccess = (data, uploadedFilename) => {
    setValidationData(data);
  };

  const handleValidationConfirm = (newQuiz) => {
    setValidationData(null);
    onGenerate(newQuiz);
  };

  const handleSmartPolishApply = (newQuestions) => {
    const questionsToAdd = newQuestions.map((q, i) => ({
      id: Date.now() + i,
      question: q.question,
      options: q.options || ["", "", "", ""],
      correctAnswer: q.correctAnswer ?? 0
    }));
    
    // filter out initial empty question if any
    const validCurrent = questions.filter(q => q.question.trim());
    setQuestions([...validCurrent, ...questionsToAdd]);
  };

  return (
    <div className="min-h-screen flex flex-col text-ink font-sans">
      {/* Top Header */}
      <div className="max-w-4xl w-full mx-auto px-6 pt-12 pb-6">
        <div className="flex justify-between items-start mb-10">
          <div className="flex-1 max-w-xl">
             <input 
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-4xl lg:text-5xl font-black bg-transparent border-none outline-none w-full placeholder-gray-400 truncate mb-4"
                placeholder="Name your quiz..."
             />
             <p className="text-purple-700 text-xs font-bold tracking-widest uppercase">
               COGNITIVE EVALUATION ARCHITECT / MANUAL CONFIGURATION
             </p>
          </div>

          <div className="flex items-center bg-white/60 rounded-full p-1 border border-white/50 backdrop-blur-md shadow-sm">
             <button className="px-6 py-2.5 rounded-full bg-gradient-to-r from-purple-400 to-indigo-400 text-white font-bold text-xs uppercase tracking-wider transition shadow-md">
               Manual Input
             </button>
             <button 
               onClick={() => setIsSpreadsheetOpen(true)}
               className="px-6 py-2.5 rounded-full text-body font-bold text-xs uppercase tracking-wider hover:bg-white/40 transition"
             >
               Spreadsheet Upload
             </button>
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-6">
          {questions.map((q, qIndex) => {
            const qNum = (qIndex + 1).toString().padStart(2, '0');
            return (
              <div key={q.id} className="relative glass-card border border-white/50 rounded-xl p-6 group shadow-sm">
                <div className="absolute top-6 left-0 w-1.5 h-8 bg-gradient-to-b from-purple-400 to-indigo-400 rounded-r-md"></div>
                
                <div className="flex justify-between items-center mb-6 pl-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-bold text-purple-700">{qNum}</span>
                    <span className="text-[10px] font-bold tracking-widest text-body uppercase">Primary Cognition Node</span>
                  </div>
                  <button 
                    onClick={() => handleRemoveQuestion(q.id)}
                    className="text-body hover:text-red-500 transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="pl-4 space-y-6">
                  <div>
                    <label className="block text-[10px] font-bold text-purple-700 tracking-widest mb-2 uppercase">Question Prompt</label>
                    <input 
                      type="text"
                      className="w-full bg-white/50 border border-white/60 rounded-xl px-4 py-3 outline-none text-sm text-ink focus:ring-2 focus:ring-purple-400/50 transition placeholder-gray-400"
                      placeholder="Enter the synthetic logic prompt..."
                      value={q.question}
                      onChange={(e) => handleChangeQuestion(q.id, e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {['A', 'B', 'C', 'D'].map((letter, optIdx) => (
                      <div key={optIdx} className="flex flex-col">
                        <label className="block text-[10px] font-bold text-purple-700 tracking-widest mb-2 uppercase pl-8">Option {letter}</label>
                        <div className="flex items-center gap-3">
                          <button 
                            className={`w-5 h-5 rounded-full border-2 flex-shrink-0 transition-colors ${q.correctAnswer === optIdx ? 'border-purple-400 bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]' : 'border-gray-400 hover:border-purple-300 bg-transparent'}`}
                            onClick={() => handleSetCorrectAnswer(q.id, optIdx)}
                          />
                          <input 
                            type="text"
                            className="w-full bg-white/50 border border-white/60 rounded-xl px-4 py-2.5 outline-none text-sm text-ink focus:ring-2 focus:ring-purple-400/50 transition placeholder-gray-400"
                            placeholder="Response parameters..."
                            value={q.options[optIdx]}
                            onChange={(e) => handleChangeOption(q.id, optIdx, e.target.value)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add Question line */}
        <div className="mt-8 flex justify-center pb-32">
          <button 
            onClick={handleAddQuestion}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full border border-dashed border-purple-400 text-purple-600 text-sm font-semibold hover:bg-purple-50 transition"
          >
            + Add New Question
          </button>
        </div>
      </div>

      {/* Fixed Footer */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-white/40 bg-white/60 backdrop-blur-md px-8 py-5 flex items-center justify-between shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-40">
         <div className="flex items-center gap-6">
            <button onClick={onBack} className="text-body hover:text-ink transition text-xs font-bold uppercase tracking-wider">
              Cancel
            </button>
            <div className="flex items-center gap-2 text-[10px] text-purple-700 uppercase font-bold tracking-widest border-l border-white/40 pl-6">
               ITEMS: {questions.length.toString().padStart(2, '0')} / MAXIMUM: 50
            </div>
         </div>

         <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsSmartPolishOpen(true)}
              className="flex items-center gap-2 text-sm text-body font-semibold hover:text-ink transition"
            >
               <Sparkles size={16} />
               Smart Polish
            </button>
            <button 
              onClick={handleGenerateManual}
              disabled={isGenerating}
              className="px-8 py-3 rounded-full bg-gradient-to-r from-purple-400 to-indigo-400 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-black text-sm tracking-widest uppercase transition flex items-center gap-2 shadow-md shadow-purple-500/20"
            >
               {isGenerating ? "GENERATING..." : "GENERATE QUIZ ⚡"}
            </button>
         </div>
      </div>

      <SpreadsheetUploadModal 
        isOpen={isSpreadsheetOpen} 
        onClose={() => setIsSpreadsheetOpen(false)} 
        onUploadSuccess={handleUploadSuccess}
      />

      <ValidationModal 
        isOpen={!!validationData} 
        onClose={() => setValidationData(null)} 
        previewData={validationData} 
        providedTitle={title}
        onConfirm={handleValidationConfirm} 
      />

      <SmartPolishModal 
        isOpen={isSmartPolishOpen}
        onClose={() => setIsSmartPolishOpen(false)}
        type="quiz"
        existingData={questions.filter(q => q.question.trim())}
        onApply={handleSmartPolishApply}
      />
    </div>
  );
}
