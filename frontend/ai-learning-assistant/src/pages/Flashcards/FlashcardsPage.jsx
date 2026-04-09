import React, { useState } from 'react';
import FlashcardListPage from './FlashcardListPage';
import FlashcardDesignPage from './FlashcardDesignPage';
import FlashcardManager from '../../components/flashcards/FlashcardManager'; // For studying or we can build a new Study Page wrapper
import { ArrowLeft } from 'lucide-react';
import Flashcard from '../../components/flashcards/Flashcard';
import flashcardService from '../../services/flashcardService';

export default function FlashcardsPage() {
  const [stage, setStage] = useState('list'); // 'list', 'design', 'study'
  const [activeSet, setActiveSet] = useState(null);
  
  // For studying
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToList = () => setStage('list');
  
  const goToDesign = () => setStage('design');
  
  const goToStudy = (set) => {
    setActiveSet(set);
    setCurrentIndex(0);
    setStage('study');
  };

  const handleReview = async (cardId) => {
    try {
      const res = await flashcardService.reviewFlashcard(cardId);
      const updatedSet = res.data?.data || res.data;
      if (!updatedSet) return;
      setActiveSet(updatedSet);
    } catch (err) {
      console.error("Review failed", err);
    }
  };

  const handleToggleStar = async (cardId) => {
    try {
      const res = await flashcardService.toggleStar(cardId);
      const updatedSet = res.data?.data || res.data;
      if (!updatedSet) return;
      setActiveSet(updatedSet);
    } catch (err) {
      console.error("Toggle star failed", err);
    }
  };

  return (
    <div className="w-full h-full bg-[#080f0c] min-h-screen text-slate-100 font-sans">
      {stage === 'list' && (
        <FlashcardListPage onSelectSet={goToStudy} onCreateNew={goToDesign} />
      )}
      
      {stage === 'design' && (
        <FlashcardDesignPage onBack={goToList} onGenerate={goToStudy} />
      )}

      {stage === 'study' && activeSet && (
        <div className="p-6 flex flex-col items-center space-y-10 max-w-7xl mx-auto">
          <div className="w-full mb-6">
             <button
              onClick={goToList}
              className="inline-flex items-center gap-2 text-sm font-medium text-emerald-200 hover:text-white transition-all duration-200 hover:-translate-x-0.5"
            >
              <ArrowLeft size={16} />
              Back to Sets
            </button>
            <h2 className="text-2xl font-bold text-center mt-4">{activeSet.title || "Study Session"}</h2>
          </div>

          {activeSet.cards && activeSet.cards[currentIndex] && (
            <Flashcard
              key={activeSet.cards[currentIndex]._id || currentIndex}
              card={activeSet.cards[currentIndex]}
              onToggleStar={handleToggleStar}
              onReview={handleReview}
            />
          )}

          <div className="flex items-center gap-8">
            <button
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((i) => i - 1)}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40"
            >
              ← Previous
            </button>

            <span className="text-sm font-medium text-slate-400">
              {currentIndex + 1} / {activeSet.cards?.length || 0}
            </span>

            <button
              disabled={currentIndex === (activeSet.cards?.length || 1) - 1}
              onClick={() => {
                // If it's the last card, we can either stay disabled or let them complete.
                // Currently just using disabled.
                setCurrentIndex((i) => i + 1);
              }}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
