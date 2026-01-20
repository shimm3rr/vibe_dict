
import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Language, AppState, SavedWord, CorpusItem } from './types';
import { LANGUAGES } from './constants';
import Home from './components/Home';
import WordDetail from './components/WordDetail';
import Notebook from './components/Notebook';
import Flashcards from './components/Flashcards';
import Corpus from './components/Corpus';
import CorpusDetail from './components/CorpusDetail';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(() => {
    try {
      const saved = localStorage.getItem('vibedict_state');
      if (saved) return JSON.parse(saved);
    } catch (e) { console.error("Load state error", e); }
    return {
      nativeLang: LANGUAGES[0],
      targetLang: LANGUAGES[1],
      notebook: [],
      corpus: []
    };
  });

  const [hasSelectedLangs, setHasSelectedLangs] = useState(() => {
    return localStorage.getItem('vibedict_setup') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('vibedict_state', JSON.stringify(state));
  }, [state]);

  const saveWord = useCallback((word: SavedWord) => {
    setState(prev => ({
      ...prev,
      notebook: [word, ...prev.notebook.filter(w => w.word !== word.word)]
    }));
  }, []);

  const removeWord = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      notebook: prev.notebook.filter(w => w.id !== id)
    }));
  }, []);

  const saveCorpusItem = useCallback((item: CorpusItem) => {
    setState(prev => ({
      ...prev,
      corpus: [item, ...(prev.corpus || [])]
    }));
  }, []);

  const removeCorpusItem = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      corpus: (prev.corpus || []).filter(item => item.id !== id)
    }));
  }, []);

  const updateStateManually = useCallback((next: AppState) => {
    setState(next);
  }, []);

  const finishSetup = useCallback((native: Language, target: Language) => {
    setState(prev => ({ ...prev, nativeLang: native, targetLang: target }));
    setHasSelectedLangs(true);
    localStorage.setItem('vibedict_setup', 'true');
  }, []);

  if (!hasSelectedLangs) {
    return <SetupScreen onComplete={finishSetup} currentNative={state.nativeLang} currentTarget={state.targetLang} />;
  }

  return (
    <HashRouter>
      <div className="min-h-screen bg-slate-100 flex justify-center items-start sm:items-center p-0 sm:p-4 md:p-8">
        <div className="w-full max-w-md min-h-screen sm:min-h-[750px] sm:max-h-[90vh] bg-white sm:rounded-[3rem] shadow-2xl relative overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto no-scrollbar pb-24">
            <Routes>
              <Route path="/" element={<Home state={state} onUpdateState={updateStateManually} />} />
              <Route path="/word/:query" element={<WordDetail state={state} onSave={saveWord} />} />
              <Route path="/notebook" element={<Notebook state={state} onRemove={removeWord} />} />
              <Route path="/flashcards" element={<Flashcards words={state.notebook} state={state} />} />
              <Route path="/corpus" element={<Corpus state={state} onSave={saveCorpusItem} onRemove={removeCorpusItem} />} />
              <Route path="/corpus/:id" element={<CorpusDetail state={state} />} />
            </Routes>
          </div>
          <Navigation />
        </div>
      </div>
    </HashRouter>
  );
};

const SetupScreen: React.FC<{ 
  onComplete: (n: Language, t: Language) => void,
  currentNative: Language,
  currentTarget: Language
}> = ({ onComplete, currentNative, currentTarget }) => {
  const [native, setNative] = useState(currentNative);
  const [target, setTarget] = useState(currentTarget);
  const [picking, setPicking] = useState<'native' | 'target' | null>(null);

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-white overflow-hidden relative">
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-indigo-600 rounded-full blur-[140px] opacity-30"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-pink-600 rounded-full blur-[140px] opacity-20"></div>

      <div className="w-full max-w-sm glass rounded-[3.5rem] p-10 shadow-2xl relative z-10 animate-in zoom-in-95 duration-500">
        <div className="text-center mb-10">
          <div className="w-24 h-24 bg-indigo-600 rounded-[2rem] mx-auto mb-6 flex items-center justify-center shadow-xl shadow-indigo-900/40">
            <i className="fa-solid fa-wand-magic-sparkles text-4xl text-white"></i>
          </div>
          <h1 className="text-4xl font-black mb-2">VibeDict</h1>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Your AI Study Mentor</p>
        </div>
        
        <div className="space-y-4">
          <button 
            onClick={() => setPicking('native')}
            className="w-full p-6 bg-white/5 border border-white/10 rounded-[2.5rem] hover:bg-white/10 transition-all text-left flex items-center justify-between"
          >
            <div>
              <span className="block text-[10px] font-black text-slate-500 uppercase mb-1">My Native Language</span>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{native.flag}</span>
                <span className="text-lg font-black">{native.name}</span>
              </div>
            </div>
            <i className="fa-solid fa-chevron-right text-slate-600"></i>
          </button>

          <button 
            onClick={() => setPicking('target')}
            className="w-full p-6 bg-white/5 border border-white/10 rounded-[2.5rem] hover:bg-white/10 transition-all text-left flex items-center justify-between"
          >
            <div>
              <span className="block text-[10px] font-black text-slate-500 uppercase mb-1">I Want To Learn</span>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{target.flag}</span>
                <span className="text-lg font-black text-indigo-400">{target.name}</span>
              </div>
            </div>
            <i className="fa-solid fa-chevron-right text-slate-600"></i>
          </button>

          <button 
            onClick={() => onComplete(native, target)}
            className="w-full bg-white text-slate-900 font-black py-6 rounded-[2.5rem] transition-all shadow-xl mt-6 active:scale-95 text-lg"
          >
            Start Learning
          </button>
        </div>
      </div>

      {picking && (
        <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-xl flex items-end justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[3rem] p-8 shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black text-slate-900">Select Language</h2>
              <button onClick={() => setPicking(null)} className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 overflow-y-auto no-scrollbar pb-6">
              {LANGUAGES.map(l => (
                <button 
                  key={l.code}
                  onClick={() => {
                    if (picking === 'native') setNative(l);
                    else setTarget(l);
                    setPicking(null);
                  }}
                  className={`p-5 rounded-3xl border-2 transition-all flex flex-col items-center gap-2 ${
                    (picking === 'native' ? native.code : target.code) === l.code
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-slate-50 bg-slate-50 hover:border-slate-200'
                  }`}
                >
                  <span className="text-3xl">{l.flag}</span>
                  <span className="font-black text-slate-800 text-sm">{l.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const NavItem = ({ path, icon, label }: { path: string, icon: string, label: string }) => {
    const isActive = (path === '/' && currentPath === '/') || (path !== '/' && currentPath.startsWith(path));
    return (
      <button 
        onClick={() => navigate(path)} 
        className={`flex flex-col items-center gap-1.5 transition-all relative px-3 ${isActive ? 'text-slate-900 scale-110' : 'text-slate-400 hover:text-slate-600'}`}
      >
        <i className={`fa-solid ${icon} ${isActive ? 'text-xl' : 'text-lg'}`}></i>
        <span className={`text-[9px] font-black uppercase tracking-tighter ${isActive ? 'opacity-100' : 'opacity-60'}`}>{label}</span>
        {isActive && <div className="absolute -bottom-2 w-1.5 h-1.5 bg-indigo-600 rounded-full"></div>}
      </button>
    );
  };

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[340px] glass p-4 rounded-[2.5rem] flex justify-around items-center shadow-2xl z-50 border border-white/50">
      <NavItem path="/" icon="fa-magnifying-glass" label="Explore" />
      <NavItem path="/corpus" icon="fa-rectangle-list" label="Corpus" />
      <NavItem path="/notebook" icon="fa-bookmark" label="Saved" />
      <NavItem path="/flashcards" icon="fa-bolt" label="Study" />
    </div>
  );
};

export default App;
