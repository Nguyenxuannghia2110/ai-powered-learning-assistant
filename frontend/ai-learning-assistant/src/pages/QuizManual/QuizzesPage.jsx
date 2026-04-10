import React, { useState } from 'react';
import QuizListPage from './QuizListPage';
import QuizDesignPage from './QuizDesignPage';
import QuizTakePage from '../Quizzes/QuizTakePage';
import QuizResultPage from '../Quizzes/QuizResultPage';
import { submitQuiz } from '../../services/quizService';

export default function QuizzesPage() {
  const [stage, setStage] = useState('list'); // 'list', 'design', 'take', 'result'
  const [activeQuiz, setActiveQuiz] = useState(null);

  const goToList = () => {
    setStage('list');
    setActiveQuiz(null);
  };

  const goToDesign = () => {
    setStage('design');
  };

  const goToTake = (quiz) => {
    setActiveQuiz(quiz);
    setStage(quiz.score === null ? 'take' : 'result');
  };

  const handleFinishTake = async (answers) => {
    try {
      if (!activeQuiz) return;
      const result = await submitQuiz(activeQuiz._id, answers);
      setActiveQuiz((prev) => ({ ...prev, ...result.data }));
      setStage('result');
    } catch (err) {
      console.error("Submit quiz failed:", err);
      alert("Failed to submit quiz.");
    }
  };

  const handleRemake = (newQuiz) => {
    setActiveQuiz(newQuiz);
    setStage('take');
  };

  return (
    <div className="w-full h-full min-h-screen bg-[#080f0c] text-white font-sans">
      {stage === 'list' && (
        <QuizListPage 
          onSelectQuiz={goToTake} 
          onCreateNew={goToDesign} 
        />
      )}

      {stage === 'design' && (
        <QuizDesignPage 
          onBack={goToList} 
          onGenerate={(newQuiz) => {
            setActiveQuiz(newQuiz);
            setStage('take');
          }} 
        />
      )}

      {stage === 'take' && activeQuiz && (
        <QuizTakePage
          key={activeQuiz._id + "-take"}
          quiz={activeQuiz}
          onFinish={handleFinishTake}
          onBack={goToList}
        />
      )}

      {stage === 'result' && activeQuiz && (
        <QuizResultPage
          quiz={activeQuiz}
          onBack={goToList}
          onRemake={handleRemake}
        />
      )}
    </div>
  );
}
