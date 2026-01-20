
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppState } from '../types';
import { generateStory } from '../services/geminiService';

const Notebook: React.FC<{ state: AppState, onRemove: (id: string) => void }> = ({ state, onRemove }) => {
  const navigate = useNavigate();
  const [story, setStory] = useState<string | null>(null);
  const [loadingStory, setLoadingStory] = useState(false);

  const handleGenerateStory = async () => {
    if (state.notebook.length < 2) return;
    setLoadingStory(true);
    try {
      const words = state.notebook.slice(0, 5).map(w => w.word);
      const res = await generateStory(words, state.nativeLang.name);
      setStory(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingStory(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-extrabold text-slate-800">Notebook</h1>
        <span className="bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest">
          {state.notebook.length} Words
        </span>
      </div>

      {state.notebook.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-xl font-bold text-slate-700">Empty!</h3>
          <p className="text-slate-500 mb-6">Your notebook is waiting for words to learn.</p>
          <button onClick={() => navigate('/')} className="px-6 py-2 bg-indigo-600 text-white rounded-full font-bold">Start Searching</button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-pink-500 to-rose-600 p-6 rounded-[2.5rem] text-white shadow-xl shadow-pink-100 relative overflow-hidden group">
            <div className="relative z-10">
              <h3 className="text-lg font-bold mb-2">Create a Story</h3>
              <p className="text-sm opacity-90 mb-4 font-medium">Connect your saved words into a fun AI-generated story.</p>
              <button 
                onClick={handleGenerateStory}
                disabled={loadingStory || state.notebook.length < 2}
                className="bg-white text-pink-600 px-6 py-3 rounded-2xl font-bold text-sm shadow-lg active:scale-95 disabled:opacity-50 transition-all flex items-center gap-2"
              >
                {loadingStory ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className="fa-solid fa-wand-magic-sparkles"></i>}
                {loadingStory ? 'Cooking...' : 'Spark Story'}
              </button>
              {state.notebook.length < 2 && (
                <p className="text-[10px] mt-2 font-bold uppercase opacity-80">Add at least 2 words</p>
              )}
            </div>
            <div className="absolute top-0 right-0 p-4 opacity-10 -rotate-12 transform scale-150 transition-transform group-hover:rotate-0">
              <i className="fa-solid fa-book-open text-9xl"></i>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {state.notebook.map(word => (
              <div 
                key={word.id} 
                onClick={() => navigate(`/word/${word.word}`)}
                className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 active:scale-[0.98] transition-all cursor-pointer group"
              >
                <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 bg-slate-100">
                  <img src={word.imageUrl} alt={word.word} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-extrabold text-slate-800 text-lg truncate">{word.word}</h4>
                  <p className="text-xs text-slate-500 truncate font-medium">{word.explanation}</p>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(word.id);
                  }}
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  <i className="fa-solid fa-trash-can text-sm"></i>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {story && (
        <div className="fixed inset-0 z-[110] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b flex justify-between items-center bg-pink-50 rounded-t-[2.5rem]">
              <h3 className="text-xl font-black text-pink-600 flex items-center gap-2">
                <i className="fa-solid fa-wand-magic-sparkles"></i> Your Story
              </h3>
              <button onClick={() => setStory(null)} className="w-8 h-8 rounded-full bg-pink-200 text-pink-600 flex items-center justify-center">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="p-8 overflow-y-auto prose prose-pink text-slate-700 font-medium italic leading-relaxed">
              {story.split('\n').map((para, i) => <p key={i}>{para}</p>)}
            </div>
            <div className="p-6 text-center border-t">
              <button 
                onClick={() => setStory(null)}
                className="w-full bg-pink-600 text-white font-bold py-4 rounded-2xl shadow-lg active:scale-95 transition-transform"
              >
                Cool, thanks!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notebook;
