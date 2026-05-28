import React, { useState } from 'react';
import { Trash2, Plus, Sparkles } from 'lucide-react';
import flashcardService from '../../services/flashcardService';
import SpreadsheetUploadModal from './SpreadsheetUploadModal';
import ValidationModal from './ValidationModal';
import SmartPolishModal from '../../components/SmartPolishModal';

export default function FlashcardDesignPage({ onBack, onGenerate }) {
  const [title, setTitle] = useState("Fundamentals of Neural Architecture");
  const [cards, setCards] = useState([
    { id: 1, question: "Backpropagation", answer: "The primary algorithm used to train neural networks by calculating the gradient of the loss function with respect to the weights." },
    { id: 2, question: "Transformer Model", answer: "A deep learning architecture that uses self-attention mechanisms, widely used in NLP tasks." },
    { id: 3, question: "", answer: "" }
  ]);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSpreadsheetOpen, setIsSpreadsheetOpen] = useState(false);
  const [isSmartPolishOpen, setIsSmartPolishOpen] = useState(false);
  const [validationData, setValidationData] = useState(null);

  const handleAddCard = () => {
    setCards([...cards, { id: Date.now(), question: "", answer: "" }]);
  };

  const handleRemoveCard = (id) => {
    setCards(cards.filter(c => c.id !== id));
  };

  const handleChangeCard = (id, field, value) => {
    setCards(cards.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const handleGenerateManual = async () => {
    const validCards = cards.filter(c => c.question.trim() && c.answer.trim());
    if (validCards.length === 0) {
      alert("Please add at least one valid flashcard.");
      return;
    }

    try {
      setIsGenerating(true);
      const dataToSubmit = {
        title: title || "Untitled Flow",
        cards: validCards
      };
      const res = await flashcardService.createManualFlashcard(dataToSubmit);
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

  const handleValidationConfirm = (newSet) => {
    setValidationData(null);
    onGenerate(newSet);
  };

  const handleSmartPolishApply = (newCards) => {
    const cardsToAdd = newCards.map((c, i) => ({
      id: Date.now() + i,
      question: c.question,
      answer: c.answer
    }));
    
    // remove the last empty card if it is empty to keep it clean
    const filteredCards = cards.filter(c => c.question.trim() || c.answer.trim());
    setCards([...filteredCards, ...cardsToAdd, { id: Date.now() + newCards.length, question: "", answer: "" }]);
  };

  return (
    <div className="min-h-screen flex flex-col text-ink font-sans">
      {/* Top Header */}
      <div className="max-w-6xl w-full mx-auto px-6 pt-12 pb-6">
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1 max-w-xl">
             <input 
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-4xl lg:text-5xl font-black bg-transparent border-none outline-none w-full placeholder-gray-400 truncate mb-4"
                placeholder="Name your flashcard set..."
             />
             <p className="text-body text-sm leading-relaxed">
               Define the core concepts of your AI module. Use the spreadsheet interface below to manually input data or refine generated content.
             </p>
          </div>

          <div className="flex items-center bg-white/60 rounded-full p-1 border border-white/50 backdrop-blur-md shadow-sm">
             <button className="px-6 py-2.5 rounded-full bg-gradient-to-r from-purple-400 to-indigo-400 text-white font-bold text-sm transition shadow-md">
               Manual Input
             </button>
             <button 
               onClick={() => setIsSpreadsheetOpen(true)}
               className="px-6 py-2.5 rounded-full text-body font-medium text-sm hover:bg-white/40 transition"
             >
               Spreadsheet Upload
             </button>
          </div>
        </div>

        {/* Table Container */}
        <div className="glass-card rounded-xl overflow-hidden mt-8">
           {/* Table Header */}
           <div className="grid grid-cols-[60px_1fr_1.5fr_60px] gap-4 p-4 border-b border-white/40 text-[10px] font-bold text-purple-700 tracking-widest uppercase">
              <div className="text-center">#</div>
              <div>FRONT (CONCEPT)</div>
              <div>BACK (DEFINITION/DETAILS)</div>
              <div className="text-center">ACTION</div>
           </div>

           {/* Table Body */}
           <div className="divide-y divide-white/40">
             {cards.map((card, index) => {
               const num = (index + 1).toString().padStart(2, '0');
               const isLastAndEmpty = index === cards.length - 1 && !card.question && !card.answer;
               
               return (
                 <div key={card.id} className="grid grid-cols-[60px_1fr_1.5fr_60px] gap-4 p-4 items-start group transition hover:bg-white/40">
                    <div className={`text-center font-mono mt-3 ${isLastAndEmpty ? 'text-purple-500 font-bold' : 'text-body'}`}>
                      {num}
                    </div>
                    
                    <div>
                      {isLastAndEmpty ? (
                         <input 
                           type="text"
                           value={card.question}
                           onChange={(e) => handleChangeCard(card.id, 'question', e.target.value)}
                           className="w-full bg-white/50 border border-white/60 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-400/50 transition text-sm placeholder-gray-400 text-ink"
                           placeholder="Start typing front side..."
                         />
                      ) : (
                         <textarea 
                           value={card.question}
                           onChange={(e) => handleChangeCard(card.id, 'question', e.target.value)}
                           className="w-full bg-transparent border border-transparent rounded-xl px-4 py-3 outline-none focus:bg-white/50 focus:border-white/60 transition text-sm resize-none text-ink placeholder-gray-400"
                           rows={Math.max(1, card.question.split('\n').length)}
                           placeholder="Front side..."
                         />
                      )}
                    </div>

                    <div>
                       {isLastAndEmpty ? (
                         <input 
                           type="text"
                           value={card.answer}
                           onChange={(e) => handleChangeCard(card.id, 'answer', e.target.value)}
                           className="w-full bg-white/50 border border-white/60 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-400/50 transition text-sm placeholder-gray-400 text-ink"
                           placeholder="Start typing back side..."
                         />
                      ) : (
                         <textarea 
                           value={card.answer}
                           onChange={(e) => handleChangeCard(card.id, 'answer', e.target.value)}
                           className="w-full bg-transparent border border-transparent rounded-xl px-4 py-3 outline-none focus:bg-white/50 focus:border-white/60 transition text-sm resize-none text-ink placeholder-gray-400"
                           rows={Math.max(2, card.answer.split('\n').length)}
                           placeholder="Back side details..."
                         />
                      )}
                    </div>

                    <div className="flex justify-center items-start mt-3">
                       <button 
                         onClick={() => handleRemoveCard(card.id)}
                         className="text-body hover:text-red-500 transition opacity-0 group-hover:opacity-100"
                       >
                         <Trash2 size={16} />
                       </button>
                    </div>
                 </div>
               )
             })}
           </div>

           {/* Add New Card Button */}
           <div className="p-6 flex justify-center pb-12">
             <button 
               onClick={handleAddCard}
               className="flex items-center gap-2 px-6 py-2.5 rounded-full border border-dashed border-purple-400 text-purple-600 text-sm font-semibold hover:bg-purple-50 transition"
             >
               <Plus size={16} />
               + Add New Card
             </button>
           </div>
        </div>
      </div>

      {/* spacer to avoid covering content with fixed footer */}
      <div className="h-32"></div>

      {/* Fixed Footer */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-white/40 bg-white/60 backdrop-blur-md px-8 py-5 flex items-center justify-between shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
         <div className="flex items-center">
            <button onClick={onBack} className="mr-8 text-body hover:text-ink transition text-sm font-semibold">
              Cancel
            </button>
            <div className="flex flex-col border-l border-white/40 pl-6">
               <span className="text-[10px] text-purple-700 uppercase font-bold tracking-widest">ACTIVE SET</span>
               <span className="text-sm font-bold text-ink">{cards.filter(c => c.question.trim() || c.answer.trim()).length} Cards Created</span>
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

            <button className="px-6 py-3 rounded-xl border border-white/50 text-body hover:bg-white/80 font-bold transition text-sm">
               Save Draft
            </button>
            <button 
              onClick={handleGenerateManual}
              disabled={isGenerating}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-400 to-indigo-400 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-black tracking-wide transition text-sm shadow-md shadow-purple-500/20"
            >
               {isGenerating ? "GENERATING..." : "GENERATE FLASHCARDS"}
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
        type="flashcard"
        existingData={cards.filter(c => c.question.trim() && c.answer.trim())}
        onApply={handleSmartPolishApply}
      />
    </div>
  );
}
