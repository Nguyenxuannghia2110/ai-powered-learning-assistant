import React, { useState, useEffect, useRef } from "react";

export default function SpeakingMode({
  card,
  onNext,
  onPrev,
  currentIndex,
  total,
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  const [feedback, setFeedback] = useState(null);
  
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Reset state on new card
    setTranscript("");
    setIsChecked(false);
    setFeedback(null);
    setIsRecording(false);
    
    if (recognitionRef.current) {
        recognitionRef.current.stop();
    }
  }, [card]);

  useEffect(() => {
    // Initialize speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US'; // Default to English

      recognition.onresult = (event) => {
        let currentTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    } else {
      console.warn("Speech Recognition API not supported in this browser.");
    }
    
    return () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
    }
  }, []);

  const speakOriginal = () => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(card.question);
      utterance.lang = "en-US";
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in your browser.");
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
      // Wait a moment before checking to allow final transcript to settle
      setTimeout(handleCheck, 500);
    } else {
      setTranscript("");
      setIsChecked(false);
      setFeedback(null);
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (e) {
        console.error(e);
      }
    }
  };
  
  // Trigger check manually if stopped
  useEffect(() => {
      if (!isRecording && transcript && !isChecked) {
          // Let user see what they said before auto-checking
          const timer = setTimeout(() => {
              handleCheck();
          }, 1500);
          return () => clearTimeout(timer);
      }
  }, [isRecording, transcript, isChecked]);

  const handleCheck = () => {
    if (!transcript.trim()) return;

    // Simple check: normalize and compare
    const normalizedOriginal = card.question.trim().toLowerCase().replace(/[^\w\s]|_/g, "");
    const normalizedInput = transcript.trim().toLowerCase().replace(/[^\w\s]|_/g, "");

    // Allow some flexibility for speech recognition quirks (e.g. slight differences)
    // Here we do exact match or inclusion, but we could make it smarter
    const isCorrect = normalizedOriginal === normalizedInput || normalizedInput.includes(normalizedOriginal) || normalizedOriginal.includes(normalizedInput);

    setFeedback({
      isCorrect,
      message: isCorrect ? "Great pronunciation!" : "Not quite right. Let's try again.",
    });
    setIsChecked(true);
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4">
      <div className="bg-[#0f1714] border border-slate-800 rounded-3xl p-8 shadow-2xl flex flex-col items-center">
        
        <div className="w-full flex justify-between items-center mb-8">
          <span className="text-sm font-semibold text-slate-400 uppercase tracking-wide">
            Speaking Mode
          </span>
          <span className="text-sm text-slate-500">
            {currentIndex + 1} / {total}
          </span>
        </div>
        
        <div className="text-center mb-8">
            <p className="text-slate-400 mb-2">Read this out loud:</p>
            <h2 className="text-4xl font-bold text-white mb-4">{card.question}</h2>
            <p className="text-emerald-400 opacity-80">{card.answer}</p>
        </div>

        <div className="flex gap-4 mb-8">
            <button
            onClick={speakOriginal}
            className="w-14 h-14 bg-slate-800 text-emerald-400 rounded-full flex items-center justify-center hover:bg-slate-700 hover:scale-105 transition-all"
            title="Listen to the word"
            >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
            </svg>
            </button>

            <button
            onClick={toggleRecording}
            className={`w-14 h-14 rounded-full flex items-center justify-center hover:scale-105 transition-all ${
                isRecording 
                ? "bg-rose-500/20 text-rose-500 animate-pulse border border-rose-500" 
                : "bg-emerald-600 text-white hover:bg-emerald-500"
            }`}
            title={isRecording ? "Stop recording" : "Start recording"}
            >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
            </svg>
            </button>
        </div>

        <div className="w-full min-h-[100px] bg-[#1a2421] border border-slate-700 rounded-xl p-4 flex flex-col items-center justify-center">
            {isRecording ? (
                <p className="text-slate-400 italic flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                    Listening...
                </p>
            ) : transcript ? (
                <p className="text-white text-xl">"{transcript}"</p>
            ) : (
                <p className="text-slate-600 italic">Click the microphone and start speaking</p>
            )}
        </div>

        {isChecked && (
          <div className="mt-6 w-full text-center animate-fade-in">
            <p className={`text-lg font-medium mb-6 ${feedback.isCorrect ? "text-emerald-400" : "text-rose-400"}`}>
              {feedback.message}
            </p>
            
            <button
              onClick={() => {
                if (feedback.isCorrect) {
                  if (onNext) onNext();
                } else {
                  // Retry
                  setIsChecked(false);
                  setTranscript("");
                  setFeedback(null);
                }
              }}
              className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition-colors"
            >
              {feedback.isCorrect ? "Next Card" : "Try Again"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
