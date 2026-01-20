
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SavedWord, AppState } from '../types';
import { speak } from '../services/geminiService';

const Flashcards: React.FC<{ words: SavedWord[], state: AppState }> = ({ words, state }) => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  if (words.length === 0) {
    return (
      <div className="p-6 text-center mt-20 max-w-md mx-auto">
        <div className="text-6xl mb-4">⚡</div>
        <h2 className="text-2xl font-bold text-slate-800">No Cards Ready</h2>
        <p className="text-slate-500 mb-8 font-medium">Add some words to your notebook to unlock flashcards!</p>
        <button onClick={() => navigate('/')} className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 active:scale-95 transition-transform">
          Find Words
        </button>
      </div>
    );
  }

  const currentWord = words[currentIndex];

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % words.length);
    }, 150);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + words.length) % words.length);
    }, 150);
  };

  return (
    <div className="p-6 max-w-md mx-auto min-h-screen flex flex-col items-center justify-center">
      <div className="w-full mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800">Study Mode</h1>
          <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-1">
            Card {currentIndex + 1} of {words.length}
          </p>
        </div>
        <button onClick={() => navigate('/notebook')} className="text-slate-400 font-bold hover:text-slate-600">
          <i className="fa-solid fa-xmark text-xl"></i>
        </button>
      </div>

      <div 
        className={`flashcard w-full h-[460px] cursor-pointer ${isFlipped ? 'flipped' : ''}`}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div className="flashcard-inner relative w-full h-full">
          {/* Front */}
          <div className="flashcard-front bg-white rounded-[2.5rem] shadow-2xl border-2 border-slate-100 p-8 flex flex-col items-center justify-center text-center">
            <div className="w-48 h-48 rounded-3xl overflow-hidden mb-10 shadow-lg border-4 border-slate-50">
              <img src={currentWord.imageUrl} alt={currentWord.word} className="w-full h-full object-cover" />
            </div>
            <h2 className="text-4xl font-black text-slate-800 tracking-tight mb-2">{currentWord.word}</h2>
            <div className="flex items-center gap-2 text-indigo-500 bg-indigo-50 px-4 py-2 rounded-full font-bold text-sm">
              <i className="fa-solid fa-volume-high"></i> Listen
            </div>
            <p className="absolute bottom-8 text-slate-300 font-bold text-[10px] uppercase tracking-widest">Tap to flip</p>
          </div>

          {/* Back */}
          <div className="flashcard-back bg-indigo-600 rounded-[2.5rem] shadow-2xl p-8 flex flex-col text-white">
            <div className="flex-1 overflow-y-auto no-scrollbar">
              <div className="inline-block px-3 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">Definition</div>
              <p className="text-xl font-bold leading-relaxed mb-8">{currentWord.explanation}</p>
              
              <div className="inline-block px-3 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">Example</div>
              <div className="p-4 bg-white/10 rounded-2xl border border-white/20">
                <p className="text-lg font-bold leading-tight mb-2">{currentWord.examples[0].target}</p>
                <p className="text-sm opacity-70 font-medium">{currentWord.examples[0].native}</p>
              </div>
            </div>
            <p className="text-center mt-6 text-white/50 font-bold text-[10px] uppercase tracking-widest shrink-0">Tap to see concept</p>
          </div>
        </div>
      </div>

      <div className="mt-12 flex items-center justify-center gap-6 w-full">
        <button 
          onClick={(e) => { e.stopPropagation(); handlePrev(); }}
          className="w-16 h-16 bg-white rounded-2xl shadow-lg border border-slate-100 flex items-center justify-center text-slate-400 active:scale-90 transition-transform"
        >
          <i className="fa-solid fa-arrow-left"></i>
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); speak(currentWord.word, state.targetLang.code); }}
          className="w-20 h-20 bg-indigo-600 text-white rounded-3xl shadow-xl shadow-indigo-100 flex items-center justify-center text-2xl active:scale-90 transition-transform"
        >
          <i className="fa-solid fa-volume-high"></i>
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); handleNext(); }}
          className="w-16 h-16 bg-white rounded-2xl shadow-lg border border-slate-100 flex items-center justify-center text-slate-400 active:scale-90 transition-transform"
        >
          <i className="fa-solid fa-arrow-right"></i>
        </button>
      </div>
    </div>
  );
};

export default Flashcards;
