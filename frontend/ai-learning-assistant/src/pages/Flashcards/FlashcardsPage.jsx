import React, { useState,useEffect } from 'react';
import FlashcardListPage from './FlashcardListPage';
import FlashcardDesignPage from './FlashcardDesignPage';
import { ArrowLeft, Mic, Keyboard, Layers } from 'lucide-react';
import Flashcard from '../../components/flashcards/Flashcard';
import DictationMode from '../../components/flashcards/DictationMode';
import SpeakingMode from '../../components/flashcards/SpeakingMode';
import flashcardService from '../../services/flashcardService';

export default function FlashcardsPage() {
  const [stage, setStage] = useState('list'); // 'list', 'design', 'study'
  const [activeSet, setActiveSet] = useState(null);
  
  // For studying
  const [currentIndex, setCurrentIndex] = useState(0);
  const [studyMode, setStudyMode] = useState('standard'); // 'standard', 'dictation', 'speaking'

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

  useEffect(() => {
    if (!activeSet?.cards?.length) return;

  const currentCard = activeSet.cards[currentIndex];
  if (currentCard?._id) {
    handleReview(currentCard._id);
  }
}, [currentIndex]);

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
          <div className="w-full flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
             <button
              onClick={goToList}
              className="inline-flex items-center gap-2 text-sm font-medium text-emerald-200 hover:text-white transition-all duration-200 hover:-translate-x-0.5"
            >
              <ArrowLeft size={16} />
              Back to Sets
            </button>
            <h2 className="text-2xl font-bold text-center">{activeSet.title || "Study Session"}</h2>
            
            {/* Mode Selector */}
            <div className="flex bg-slate-800/50 p-1 rounded-xl border border-slate-700/50">
              <button
                onClick={() => setStudyMode('standard')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  studyMode === 'standard' 
                    ? 'bg-emerald-500/20 text-emerald-400 shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                }`}
              >
                <Layers size={16} />
                <span className="hidden sm:inline">Standard</span>
              </button>
              <button
                onClick={() => setStudyMode('dictation')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  studyMode === 'dictation' 
                    ? 'bg-emerald-500/20 text-emerald-400 shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                }`}
              >
                <Keyboard size={16} />
                <span className="hidden sm:inline">Dictation</span>
              </button>
              <button
                onClick={() => setStudyMode('speaking')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  studyMode === 'speaking' 
                    ? 'bg-emerald-500/20 text-emerald-400 shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                }`}
              >
                <Mic size={16} />
                <span className="hidden sm:inline">Speaking</span>
              </button>
            </div>
          </div>

          <div className="w-full flex-grow flex items-center justify-center">
            {activeSet.cards && activeSet.cards[currentIndex] && (
              <>
                {studyMode === 'standard' && (
                  <Flashcard
                    key={activeSet.cards[currentIndex]._id || currentIndex}
                    card={activeSet.cards[currentIndex]}
                    onToggleStar={handleToggleStar}
                    onReview={handleReview}
                    currentIndex={currentIndex}
                    total={activeSet.cards.length}
                    onNext={() => setCurrentIndex((i) => Math.min(i + 1, activeSet.cards.length - 1))}
                    onPrev={() => setCurrentIndex((i) => Math.max(i - 1, 0))}
                  />
                )}
                {studyMode === 'dictation' && (
                  <DictationMode
                    key={activeSet.cards[currentIndex]._id || currentIndex}
                    card={activeSet.cards[currentIndex]}
                    currentIndex={currentIndex}
                    total={activeSet.cards.length}
                    onNext={() => setCurrentIndex((i) => Math.min(i + 1, activeSet.cards.length - 1))}
                    onPrev={() => setCurrentIndex((i) => Math.max(i - 1, 0))}
                  />
                )}
                {studyMode === 'speaking' && (
                  <SpeakingMode
                    key={activeSet.cards[currentIndex]._id || currentIndex}
                    card={activeSet.cards[currentIndex]}
                    currentIndex={currentIndex}
                    total={activeSet.cards.length}
                    onNext={() => setCurrentIndex((i) => Math.min(i + 1, activeSet.cards.length - 1))}
                    onPrev={() => setCurrentIndex((i) => Math.max(i - 1, 0))}
                  />
                )}
              </>
            )}
          </div>

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
