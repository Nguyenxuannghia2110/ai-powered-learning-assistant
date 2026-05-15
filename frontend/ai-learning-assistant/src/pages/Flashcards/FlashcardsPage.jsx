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
    <div className="w-full h-full flex flex-col font-sans">
      {stage === 'list' && (
        <FlashcardListPage onSelectSet={goToStudy} onCreateNew={goToDesign} />
      )}
      
      {stage === 'design' && (
        <FlashcardDesignPage onBack={goToList} onGenerate={goToStudy} />
      )}

      {stage === 'study' && activeSet && (
        <div className="w-full max-w-5xl mx-auto flex flex-col h-full gap-6">
          <div className="flex items-center justify-between">
            <button
              onClick={goToList}
              className="inline-flex items-center gap-2 text-sm text-[#7d8187] hover:text-white transition-all"
            >
              <ArrowLeft size={16} />
              Back to Sets
            </button>
            <h2 className="text-xl font-medium tracking-tight text-white">{activeSet.title || "Study Session"}</h2>
            <div className="w-24" /> {/* Spacer to center the title */}
          </div>

          <div className="flex-1 bg-[#191919] border border-[#212327] rounded-sm p-8 flex flex-col">
            {/* Mode Selector */}
            <div className="flex justify-center mb-8">
              <div className="flex bg-[#0a0a0a] p-1 rounded-full border border-[#212327]">
                <button
                  onClick={() => setStudyMode('standard')}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs uppercase tracking-widest font-mono transition-all ${
                    studyMode === 'standard' 
                      ? 'bg-white/10 text-white' 
                      : 'text-[#7d8187] hover:text-white'
                  }`}
                >
                  <Layers size={14} />
                  <span className="hidden sm:inline">Standard</span>
                </button>
                <button
                  onClick={() => setStudyMode('dictation')}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs uppercase tracking-widest font-mono transition-all ${
                    studyMode === 'dictation' 
                      ? 'bg-white/10 text-white' 
                      : 'text-[#7d8187] hover:text-white'
                  }`}
                >
                  <Keyboard size={14} />
                  <span className="hidden sm:inline">Dictation</span>
                </button>
                <button
                  onClick={() => setStudyMode('speaking')}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs uppercase tracking-widest font-mono transition-all ${
                    studyMode === 'speaking' 
                      ? 'bg-white/10 text-white' 
                      : 'text-[#7d8187] hover:text-white'
                  }`}
                >
                  <Mic size={14} />
                  <span className="hidden sm:inline">Speaking</span>
                </button>
              </div>
            </div>

            {/* Flashcard Content */}
            <div className="flex-1 flex flex-col justify-center items-center w-full max-w-3xl mx-auto">
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

            {/* Pagination Controls */}
            <div className="flex items-center justify-between mt-8 border-t border-[#212327] pt-6">
              <button
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((i) => i - 1)}
                className="px-6 py-2 rounded-full border border-[#212327] bg-[#0a0a0a] text-white text-sm hover:bg-white/5 transition disabled:opacity-40"
              >
                Previous
              </button>

              <span className="text-xs font-mono uppercase tracking-widest text-[#7d8187]">
                {currentIndex + 1} / {activeSet.cards?.length || 0}
              </span>

              <button
                disabled={currentIndex === (activeSet.cards?.length || 1) - 1}
                onClick={() => setCurrentIndex((i) => i + 1)}
                className="px-6 py-2 rounded-full border border-[#212327] bg-[#0a0a0a] text-white text-sm hover:bg-white/5 transition disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
