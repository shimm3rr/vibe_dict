
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppState, Language } from '../types';
import { LANGUAGES } from '../constants';

const Home: React.FC<{ state: AppState, onUpdateState: (newState: AppState) => void }> = ({ state, onUpdateState }) => {
  const [query, setQuery] = useState('');
  const [pickingFor, setPickingFor] = useState<'native' | 'target' | null>(null);
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/word/${encodeURIComponent(query.trim())}`);
    }
  };

  const selectLanguage = (l: Language) => {
    const nextState = { ...state };
    if (pickingFor === 'native') nextState.nativeLang = l;
    else if (pickingFor === 'target') nextState.targetLang = l;
    
    onUpdateState(nextState);
    setPickingFor(null);
  };

  const swapLangs = () => {
    onUpdateState({ 
      ...state, 
      nativeLang: state.targetLang, 
      targetLang: state.nativeLang 
    });
  };

  return (
    <div className="p-5 sm:p-8 max-w-md mx-auto min-h-screen flex flex-col pt-8 sm:pt-12 page-enter">
      <div className="text-center mb-10">
        <div className="inline-block px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-extrabold uppercase tracking-widest mb-4">
          <i className="fa-solid fa-sparkles mr-2"></i> Next-Gen Learning
        </div>
        <h1 className="text-4xl font-black text-slate-800 tracking-tight sm:text-5xl">VibeDict</h1>
        <p className="text-slate-400 font-semibold mt-1">Language with a personality.</p>
      </div>

      <div className="glass p-2 rounded-[2.5rem] shadow-2xl shadow-indigo-100/50 mb-10 flex items-center justify-between gap-1">
        <button 
          onClick={() => setPickingFor('native')}
          className="flex-1 p-4 rounded-[2rem] hover:bg-white transition-all text-center group active:scale-95"
        >
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter block mb-1">Native</span>
          <div className="flex items-center justify-center gap-2">
            <span className="text-xl">{state.nativeLang.flag}</span>
            <span className="font-black text-slate-700">{state.nativeLang.code.toUpperCase()}</span>
          </div>
        </button>

        <button 
          onClick={swapLangs}
          className="w-12 h-12 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-lg active:rotate-180 transition-transform duration-500 z-10 shrink-0"
        >
          <i className="fa-solid fa-right-left text-xs"></i>
        </button>

        <button 
          onClick={() => setPickingFor('target')}
          className="flex-1 p-4 rounded-[2rem] hover:bg-white transition-all text-center group active:scale-95"
        >
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter block mb-1">Target</span>
          <div className="flex items-center justify-center gap-2">
            <span className="text-xl">{state.targetLang.flag}</span>
            <span className="font-black text-indigo-600">{state.targetLang.code.toUpperCase()}</span>
          </div>
        </button>
      </div>

      <form onSubmit={handleSearch} className="relative group mb-12">
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-[2.5rem] blur opacity-20 group-focus-within:opacity-40 transition-opacity duration-500"></div>
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search word or vibe..."
            className="w-full p-6 pr-20 bg-white border border-slate-100 rounded-[2.5rem] text-xl font-bold shadow-sm focus:outline-none focus:ring-4 focus:ring-indigo-100 transition-all placeholder:text-slate-300"
          />
          <button 
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 w-14 h-14 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-xl hover:bg-indigo-600 active:scale-90 transition-all"
          >
            <i className="fa-solid fa-bolt-lightning text-lg"></i>
          </button>
        </div>
      </form>

      <div className="flex-1">
        <div className="flex items-center justify-between mb-6 px-2">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Trending Vibes</h3>
          <div className="h-px bg-slate-100 flex-1 ml-4"></div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {[
            { word: 'G.O.A.T', tag: 'Slang' },
            { word: '木漏れ日', tag: 'Deep' },
            { word: 'Resilience', tag: 'Core' },
            { word: 'Cringe', tag: 'Vibe' }
          ].map(item => (
            <button 
              key={item.word}
              onClick={() => navigate(`/word/${encodeURIComponent(item.word)}`)}
              className="p-5 bg-white rounded-[2rem] border border-slate-50 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all text-left group active:scale-95"
            >
              <span className="text-[9px] font-black text-indigo-400 uppercase block mb-1">{item.tag}</span>
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-slate-700">{item.word}</span>
                <i className="fa-solid fa-chevron-right text-[10px] text-slate-300 group-hover:text-indigo-500 transition-colors"></i>
              </div>
            </button>
          ))}
        </div>
      </div>

      {pickingFor && (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-md flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-[3rem] p-8 shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-slate-800">
                {pickingFor === 'native' ? 'My Language' : 'I want to learn'}
              </h2>
              <button onClick={() => setPickingFor(null)} className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-3 overflow-y-auto no-scrollbar pb-4">
              {LANGUAGES.map(l => (
                <button 
                  key={l.code}
                  onClick={() => selectLanguage(l)}
                  className={`p-4 rounded-3xl border-2 transition-all flex items-center gap-3 active:scale-95 ${
                    (pickingFor === 'native' ? state.nativeLang.code : state.targetLang.code) === l.code
                    ? 'border-indigo-600 bg-indigo-50 shadow-inner'
                    : 'border-slate-50 bg-slate-50 hover:bg-white hover:border-slate-200'
                  }`}
                >
                  <span className="text-xl">{l.flag}</span>
                  <span className="font-bold text-slate-700">{l.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
