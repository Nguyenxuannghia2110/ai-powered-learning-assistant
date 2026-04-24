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
    <div className="min-h-screen flex flex-col bg-[#0b110e] text-white">
      {/* Top Header */}
      <div className="max-w-4xl w-full mx-auto px-6 pt-12 pb-6">
        <div className="flex justify-between items-start mb-10">
          <div className="flex-1 max-w-xl">
             <input 
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-4xl font-black bg-transparent border-none outline-none w-full placeholder-emerald-900 text-emerald-400 truncate mb-2"
                placeholder="Name your quiz..."
             />
             <p className="text-slate-400 text-xs font-bold tracking-widest uppercase">
               COGNITIVE EVALUATION ARCHITECT / MANUAL CONFIGURATION
             </p>
          </div>

          <div className="flex items-center bg-[#151c19] rounded-full p-1 border border-[#1e2924]">
             <button className="px-6 py-2.5 rounded-full bg-emerald-400 text-emerald-950 font-bold text-xs uppercase tracking-wider transition">
               Manual Input
             </button>
             <button 
               onClick={() => setIsSpreadsheetOpen(true)}
               className="px-6 py-2.5 rounded-full text-slate-400 font-bold text-xs uppercase tracking-wider hover:text-white transition"
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
              <div key={q.id} className="relative bg-[#111714] border border-[#1e2924] rounded-2xl p-6 group">
                <div className="absolute top-6 left-0 w-1.5 h-8 bg-emerald-400 rounded-r-md"></div>
                
                <div className="flex justify-between items-center mb-6 pl-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-bold text-slate-700">{qNum}</span>
                    <span className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase">Primary Cognition Node</span>
                  </div>
                  <button 
                    onClick={() => handleRemoveQuestion(q.id)}
                    className="text-slate-500 hover:text-slate-300 transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="pl-4 space-y-6">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 tracking-widest mb-2 uppercase">Question Prompt</label>
                    <input 
                      type="text"
                      className="w-full bg-[#151c19] border border-[#1e2924] rounded-xl px-4 py-3 outline-none text-sm text-slate-200 focus:border-emerald-500/50 transition placeholder-slate-600"
                      placeholder="Enter the synthetic logic prompt..."
                      value={q.question}
                      onChange={(e) => handleChangeQuestion(q.id, e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {['A', 'B', 'C', 'D'].map((letter, optIdx) => (
                      <div key={optIdx} className="flex flex-col">
                        <label className="block text-[10px] font-bold text-slate-500 tracking-widest mb-2 uppercase pl-8">Option {letter}</label>
                        <div className="flex items-center gap-3">
                          <button 
                            className={`w-5 h-5 rounded-full border-2 flex-shrink-0 transition-colors ${q.correctAnswer === optIdx ? 'border-emerald-400 bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]' : 'border-slate-600 hover:border-slate-400 bg-transparent'}`}
                            onClick={() => handleSetCorrectAnswer(q.id, optIdx)}
                          />
                          <input 
                            type="text"
                            className="w-full bg-[#151c19] border border-[#1e2924] rounded-xl px-4 py-2.5 outline-none text-sm text-slate-300 focus:border-emerald-500/50 transition placeholder-slate-600"
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
        <div className="mt-8 flex justify-between items-center pb-32">
          <button 
            onClick={handleAddQuestion}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#1e2924] hover:bg-[#151c19] text-emerald-400 text-xs font-bold tracking-widest uppercase transition"
          >
            <div className="bg-emerald-400 text-emerald-950 rounded-full w-4 h-4 flex items-center justify-center leading-none pb-0.5">+</div>
            Add New Question
          </button>
        </div>
      </div>

      {/* Fixed Footer */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-[#1e2924] bg-[#0c110e]/95 backdrop-blur px-8 py-5 flex items-center justify-between z-40">
         <div className="flex items-center gap-6">
            <button onClick={onBack} className="text-slate-400 hover:text-white transition text-xs font-bold uppercase tracking-wider">
              Cancel
            </button>
            <div className="flex items-center gap-2 text-[10px] text-slate-500 uppercase font-bold tracking-widest border-l border-[#1e2924] pl-6">
               ITEMS: {questions.length.toString().padStart(2, '0')} / MAXIMUM: 50
            </div>
         </div>

         <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsSmartPolishOpen(true)}
              className="flex items-center gap-2 text-sm text-slate-300 font-semibold hover:text-white transition"
            >
               <Sparkles size={16} />
               Smart Polish
            </button>
            <button 
              onClick={handleGenerateManual}
              disabled={isGenerating}
              className="px-8 py-3 rounded-full bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 text-emerald-950 font-black text-sm tracking-widest uppercase transition flex items-center gap-2 shadow-[0_0_20px_rgba(52,211,153,0.3)]"
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
