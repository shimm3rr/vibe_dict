
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppState } from '../types';

const CorpusDetail: React.FC<{ state: AppState }> = ({ state }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const item = state.corpus?.find(i => i.id === id);
  const [activeKnowledge, setActiveKnowledge] = useState<{title: string, pronunciation?: string, desc: string, examples: string[], type: string} | null>(null);

  if (!item) return <div className="p-8 text-center mt-20 font-bold">Entry not found</div>;

  const renderFurigana = (text: string) => {
    const parts = text.split(/(\[.*?\])/g);
    const result: React.ReactNode[] = [];
    
    for (let i = 0; i < parts.length; i++) {
      if (parts[i].startsWith('[') && parts[i].endsWith(']') && i > 0) {
        const kanji = result.pop() as string;
        const furigana = parts[i].slice(1, -1);
        result.push(<ruby key={i}>{kanji}<rt className="text-[10px] text-slate-400 font-normal">{furigana}</rt></ruby>);
      } else {
        result.push(parts[i]);
      }
    }
    return result;
  };

  const renderOriginalWithHighlights = (text: string) => {
    const highlights = [
      ...item.analysis.vocabulary.map(v => ({ term: v.term, pronunciation: v.pronunciation, explanation: v.explanation, examples: v.examples, type: 'vocab' })),
      ...item.analysis.grammar.map(g => ({ term: g.point, pronunciation: '', explanation: g.explanation, examples: g.examples, type: 'grammar' }))
    ].sort((a, b) => b.term.length - a.term.length);

    const escapeRegExp = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const highlightPattern = highlights.map(h => escapeRegExp(h.term)).join('|');
    
    if (!highlightPattern) return <span>{renderFurigana(text)}</span>;

    const parts = text.split(new RegExp(`(${highlightPattern})`, 'g'));

    return (
      <>
        {parts.map((part, i) => {
          const highlight = highlights.find(h => h.term === part);
          if (highlight) {
            return (
              <span 
                key={i} 
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveKnowledge({ 
                    title: highlight.term, 
                    pronunciation: highlight.pronunciation,
                    desc: highlight.explanation, 
                    examples: highlight.examples,
                    type: highlight.type
                  });
                }}
                className={`cursor-pointer border-b-2 decoration-skip-ink font-bold transition-all ${highlight.type === 'vocab' ? 'border-pink-400 text-pink-600 hover:bg-pink-50' : 'border-amber-400 text-amber-700 hover:bg-amber-50'}`}
              >
                {renderFurigana(part)}
              </span>
            );
          }
          return <span key={i}>{renderFurigana(part)}</span>;
        })}
      </>
    );
  };

  return (
    <div className="pb-32 bg-slate-50 min-h-screen relative page-enter">
      <div className="bg-white p-6 pt-12 rounded-b-[3rem] shadow-sm border-b border-slate-200">
        <button onClick={() => navigate('/corpus')} className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 mb-6 active:scale-90 transition-transform">
          <i className="fa-solid fa-arrow-left"></i>
        </button>
        <div className="flex items-center gap-3 mb-2">
          <span className="bg-slate-900 text-white text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-widest">
            {item.analysis.detectedLang}
          </span>
          <h1 className="text-2xl font-black text-slate-800 leading-tight">Insight Analysis</h1>
        </div>
        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Bilingual Insight & Lab Notes</p>
      </div>

      <div className="p-6 max-w-md mx-auto space-y-8">
        <section className="space-y-6">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Line-by-Line Lab</h3>
          <div className="space-y-10">
            {item.analysis.sentences.map((s, i) => (
              <div key={i} className="group">
                <div className="text-xl sm:text-2xl font-medium text-slate-800 leading-[2.2] whitespace-pre-wrap">
                  {renderOriginalWithHighlights(s.original)}
                </div>
                <div className="mt-3 text-sm font-bold text-indigo-500/80 italic border-l-4 border-indigo-100 pl-4 py-2 bg-indigo-50/30 rounded-r-2xl">
                  {s.translated}
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="pt-10 border-t border-slate-200">
           <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8 px-2">Key Insights</h3>
           
           <div className="space-y-8">
              <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white shadow-2xl shadow-slate-200 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 -rotate-12 group-hover:rotate-0 transition-transform">
                  <i className="fa-solid fa-bolt text-7xl"></i>
                </div>
                <h4 className="text-[10px] font-black uppercase tracking-widest mb-3 opacity-60">The Gist</h4>
                <p className="text-xl font-bold leading-relaxed relative z-10">{item.analysis.summary}</p>
              </div>

              <section className="space-y-4">
                <h4 className="text-xs font-black text-pink-500 uppercase flex items-center gap-2 px-2">
                  <i className="fa-solid fa-sparkles"></i> Essential Vocabulary
                </h4>
                <div className="grid grid-cols-1 gap-3">
                  {item.analysis.vocabulary.map((v, i) => (
                    <div 
                      key={i} 
                      onClick={() => setActiveKnowledge({ title: v.term, pronunciation: v.pronunciation, desc: v.explanation, examples: v.examples, type: 'vocab' })}
                      className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:border-pink-200 cursor-pointer active:scale-95 transition-all"
                    >
                      <h5 className="font-black text-slate-800 text-lg mb-1">{renderFurigana(v.term)}</h5>
                      {v.pronunciation && <p className="text-[10px] font-black text-indigo-400 uppercase tracking-wide mb-1">{v.pronunciation}</p>}
                      <p className="text-sm font-medium text-slate-500 leading-relaxed truncate">{v.explanation}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="space-y-4">
                <h4 className="text-xs font-black text-amber-500 uppercase flex items-center gap-2 px-2">
                  <i className="fa-solid fa-scroll"></i> Grammar Lab
                </h4>
                <div className="space-y-4">
                  {item.analysis.grammar.map((g, i) => (
                    <div 
                      key={i} 
                      onClick={() => setActiveKnowledge({ title: g.point, desc: g.explanation, examples: g.examples, type: 'grammar' })}
                      className="bg-white p-6 rounded-[2rem] border border-amber-50 shadow-sm hover:border-amber-200 cursor-pointer active:scale-95 transition-all"
                    >
                      <h5 className="font-black text-amber-900 mb-2">{renderFurigana(g.point)}</h5>
                      <p className="text-sm font-medium text-slate-600 leading-relaxed truncate">{g.explanation}</p>
                    </div>
                  ))}
                </div>
              </section>
           </div>
        </div>
      </div>

      {activeKnowledge && (
        <div 
          className="fixed inset-0 z-[120] bg-slate-900/50 backdrop-blur-md flex items-end justify-center p-4 animate-in fade-in duration-300"
          onClick={() => setActiveKnowledge(null)}
        >
          <div 
            className="bg-white w-full max-w-sm rounded-[3rem] p-10 shadow-2xl animate-in slide-in-from-bottom duration-400 max-h-[85vh] overflow-y-auto no-scrollbar"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-12 h-1.5 bg-slate-100 rounded-full mx-auto mb-8" />
            
            <div className="flex items-center gap-2 mb-2">
               <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest ${activeKnowledge.type === 'vocab' ? 'bg-pink-100 text-pink-600' : 'bg-amber-100 text-amber-700'}`}>
                 {activeKnowledge.type === 'vocab' ? 'Vocabulary' : 'Grammar'}
               </span>
            </div>
            
            <h4 className="text-4xl font-black text-slate-800 mb-1 tracking-tight">{renderFurigana(activeKnowledge.title)}</h4>
            {activeKnowledge.pronunciation && (
              <p className="text-lg font-bold text-indigo-400 mb-6">{activeKnowledge.pronunciation}</p>
            )}
            
            <div className="prose prose-slate text-slate-600 font-semibold leading-relaxed mb-10 text-lg border-l-4 border-slate-50 pl-6 py-2">
              {activeKnowledge.desc}
            </div>

            {activeKnowledge.examples && activeKnowledge.examples.length > 0 && (
              <div className="space-y-6 mb-10">
                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Example Sentences</h5>
                {activeKnowledge.examples.map((ex, i) => (
                  <div key={i} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 text-sm font-bold text-slate-700 italic leading-relaxed">
                    <i className="fa-solid fa-quote-left opacity-20 mr-2"></i>
                    {ex}
                  </div>
                ))}
              </div>
            )}

            <button 
              onClick={() => setActiveKnowledge(null)}
              className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black text-lg shadow-2xl shadow-slate-200 active:scale-95 transition-all"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CorpusDetail;
