
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppState, CorpusItem } from '../types';
import { analyzeCorpus } from '../services/geminiService';

const Corpus: React.FC<{ state: AppState, onSave: (item: CorpusItem) => void, onRemove: (id: string) => void }> = ({ state, onSave, onRemove }) => {
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    setIsAnalyzing(true);
    try {
      const analysis = await analyzeCorpus(text, state.nativeLang.name);
      const newItem: CorpusItem = {
        id: Math.random().toString(36).substr(2, 9),
        title: text.substring(0, 30) + (text.length > 30 ? '...' : ''),
        content: text,
        analysis,
        addedAt: Date.now(),
      };
      onSave(newItem);
      setText('');
      setShowAdd(false);
      navigate(`/corpus/${newItem.id}`);
    } catch (err) {
      alert("Analysis failed. Try a shorter text.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setText(event.target?.result as string);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-md mx-auto min-h-screen page-enter">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Corpus</h1>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Language Lab</p>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="w-14 h-14 bg-indigo-600 text-white rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-indigo-100 active:scale-90 transition-all"
        >
          <i className="fa-solid fa-plus text-xl"></i>
        </button>
      </div>

      <div className="space-y-5">
        {(!state.corpus || state.corpus.length === 0) ? (
          <div className="text-center py-24 px-10">
            <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6">
              <i className="fa-solid fa-folder-open text-4xl text-slate-200"></i>
            </div>
            <h3 className="text-xl font-bold text-slate-700">Empty Lab</h3>
            <p className="text-slate-400 mt-2 font-medium">Upload text or links to start deep analysis.</p>
          </div>
        ) : (
          state.corpus.map(item => (
            <div 
              key={item.id}
              onClick={() => navigate(`/corpus/${item.id}`)}
              className="bg-white p-5 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between group active:scale-[0.98] transition-all cursor-pointer hover:shadow-md hover:border-indigo-50"
            >
              <div className="flex items-center gap-5 flex-1 min-w-0">
                <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-black text-[10px] shrink-0 ${item.analysis.detectedLang.toLowerCase().includes('ja') ? 'bg-pink-50 text-pink-600' : 'bg-indigo-50 text-indigo-600'}`}>
                   <span>{item.analysis.detectedLang.substring(0, 3).toUpperCase()}</span>
                   <div className="w-1 h-1 bg-current rounded-full mt-1"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-extrabold text-slate-800 truncate mb-0.5">{item.title}</h3>
                  <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase">
                    <i className="fa-solid fa-clock opacity-60"></i>
                    {new Date(item.addedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); onRemove(item.id); }}
                className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
              >
                <i className="fa-solid fa-trash-can text-sm"></i>
              </button>
            </div>
          ))
        )}
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-[110] bg-slate-900/60 backdrop-blur-md flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-[3rem] p-8 shadow-2xl animate-in slide-in-from-bottom duration-300 flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black text-slate-800">New Entry</h2>
              <button onClick={() => setShowAdd(false)} className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <textarea 
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste text, article or notes..."
              className="w-full h-40 bg-slate-50 border-none rounded-3xl p-6 text-slate-700 font-bold focus:ring-4 focus:ring-indigo-100 mb-6 resize-none transition-all placeholder:text-slate-300"
            />

            <div className="grid grid-cols-2 gap-4 mb-8">
              <label className="flex flex-col items-center justify-center p-6 bg-indigo-50/50 rounded-3xl border-2 border-indigo-100 border-dashed cursor-pointer hover:bg-indigo-100/50 transition-colors">
                <i className="fa-solid fa-file-arrow-up text-indigo-600 text-lg mb-2"></i>
                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-tighter">Local File</span>
                <input type="file" className="hidden" onChange={handleFileUpload} accept=".txt,.md" />
              </label>
              <button 
                onClick={() => alert("Auto-fetching coming soon! Please paste the text.")}
                className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-3xl border-2 border-slate-100 border-dashed hover:bg-slate-100 transition-colors"
              >
                <i className="fa-solid fa-link text-slate-400 text-lg mb-2"></i>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Parse URL</span>
              </button>
            </div>

            <button 
              onClick={handleAnalyze}
              disabled={isAnalyzing || !text.trim()}
              className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black text-lg shadow-2xl shadow-slate-200 disabled:opacity-50 active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              {isAnalyzing ? (
                <><i className="fa-solid fa-circle-notch animate-spin"></i> Analyzing...</>
              ) : (
                <><i className="fa-solid fa-wand-magic-sparkles"></i> Magic Extract</>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Corpus;
