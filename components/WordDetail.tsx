
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppState, WordDefinition, SavedWord, ChatMessage } from '../types';
import { getWordDefinition, generateConceptImage, speak, chatAboutWord } from '../services/geminiService';

const WordDetail: React.FC<{ state: AppState, onSave: (w: SavedWord) => void }> = ({ state, onSave }) => {
  const { query } = useParams<{ query: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<WordDefinition | null>(null);
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query) fetchData(query);
  }, [query]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchData = async (q: string) => {
    setLoading(true);
    setError(null);
    setData(null);
    setImgUrl(null);

    try {
      const defPromise = getWordDefinition(q, state.nativeLang, state.targetLang);
      const imgPromise = generateConceptImage(q, state.targetLang.name);

      const [def, img] = await Promise.all([defPromise, imgPromise]);
      
      setData(def);
      setImgUrl(img);
    } catch (err: any) {
      setError("AI is taking a break. Try again in a bit.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (!data) return;
    setIsSaving(true);
    onSave({ ...data, imageUrl: imgUrl || '', id: Math.random().toString(36).substr(2, 9), addedAt: Date.now() });
    setTimeout(() => setIsSaving(false), 800);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !data) return;
    const msg = input;
    setMessages(prev => [...prev, { role: 'user', text: msg }]);
    setInput('');
    setChatLoading(true);
    try {
      const reply = await chatAboutWord(data.word, messages, msg);
      setMessages(prev => [...prev, { role: 'model', text: reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'model', text: "Lost connection..." }]);
    } finally {
      setChatLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white">
        <div className="w-16 h-16 border-4 border-indigo-600/10 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs animate-pulse">Syncing Vibes...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center mt-20 max-w-md mx-auto">
        <h2 className="text-2xl font-black mb-4">Error</h2>
        <p className="text-slate-500 mb-8">{error}</p>
        <button onClick={() => navigate('/')} className="w-full bg-slate-900 text-white rounded-2xl py-4 font-bold">Back Home</button>
      </div>
    );
  }

  return (
    <div className="pb-32 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="relative h-72 w-full bg-slate-100">
        {imgUrl && <img src={imgUrl} className="w-full h-full object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/30 to-transparent"></div>
        <button onClick={() => navigate('/')} className="absolute top-6 left-6 w-10 h-10 bg-white/20 backdrop-blur rounded-full text-white z-10"><i className="fa-solid fa-arrow-left"></i></button>
        <div className="absolute bottom-8 left-6 right-6 flex items-end justify-between text-white z-10">
          <div>
            <h1 className="text-4xl font-black leading-none mb-2">{data.word}</h1>
            {data.pronunciation && (
              <p className="text-lg font-bold text-indigo-300 mb-4 tracking-wide">{data.pronunciation}</p>
            )}
            <button onClick={() => speak(data.word, state.targetLang.code)} className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-400 px-4 py-1.5 rounded-full text-xs font-black uppercase transition-colors"><i className="fa-solid fa-volume-high"></i> Listen</button>
          </div>
          <button onClick={handleSave} className={`px-5 py-3 rounded-2xl font-bold text-sm shadow-xl transition-all active:scale-95 ${isSaving ? 'bg-green-500' : 'bg-white text-slate-900 hover:bg-slate-50'}`}>{isSaving ? 'Added' : 'Save Word'}</button>
        </div>
      </div>

      <div className="p-6 space-y-8 max-w-md mx-auto">
        <section>
          <h3 className="text-[10px] font-black text-indigo-500 uppercase mb-2 tracking-widest">Definition</h3>
          <p className="text-2xl font-bold text-slate-800 leading-tight">{data.explanation}</p>
        </section>

        <section className="space-y-4">
          <h3 className="text-[10px] font-black text-pink-500 uppercase tracking-widest">In Practice</h3>
          {data.examples.map((ex, i) => (
            <div key={i} className="bg-white p-5 rounded-[2rem] border border-slate-100 flex gap-4 shadow-sm group">
              <button onClick={() => speak(ex.target, state.targetLang.code)} className="w-10 h-10 flex-shrink-0 bg-slate-50 rounded-xl text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 transition-all"><i className="fa-solid fa-play text-xs"></i></button>
              <div>
                <p className="font-bold text-slate-800 mb-1 leading-snug text-lg">{ex.target}</p>
                <p className="text-sm text-slate-400 font-semibold">{ex.native}</p>
              </div>
            </div>
          ))}
        </section>

        <section className="bg-amber-50 p-6 rounded-[2.5rem] border border-amber-100 shadow-inner">
          <h3 className="text-[10px] font-black text-amber-600 uppercase mb-3 tracking-widest">The Vibe</h3>
          <p className="text-base font-semibold text-amber-900 leading-relaxed">{data.usageNotes}</p>
        </section>

        <button onClick={() => setChatOpen(true)} className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black text-base flex items-center justify-center gap-3 shadow-2xl active:scale-95 transition-all">
          <i className="fa-solid fa-comment-dots text-xl"></i> Ask AI Coach
        </button>
      </div>

      {chatOpen && (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col animate-in slide-in-from-bottom duration-300">
          <div className="p-6 border-b flex justify-between items-center bg-slate-50">
            <div>
              <h4 className="font-black text-slate-800">Coach: {data.word}</h4>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">AI Interaction</p>
            </div>
            <button onClick={() => setChatOpen(false)} className="w-10 h-10 bg-white shadow-sm border border-slate-100 rounded-full text-slate-400 active:scale-90 transition-all"><i className="fa-solid fa-xmark"></i></button>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-5 rounded-[2rem] font-bold text-sm leading-relaxed ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none shadow-lg' : 'bg-slate-100 text-slate-700 rounded-tl-none'}`}>{m.text}</div>
              </div>
            ))}
            {chatLoading && <div className="w-16 h-8 bg-slate-100 rounded-full animate-pulse flex items-center justify-center text-[10px] font-black text-slate-300 tracking-widest">THINKING</div>}
            <div ref={chatEndRef} />
          </div>
          <form onSubmit={handleSendMessage} className="p-6 border-t flex gap-3 bg-white">
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a question..." className="flex-1 bg-slate-50 border border-slate-100 rounded-[1.5rem] px-6 py-4 focus:outline-none focus:ring-4 focus:ring-indigo-100 font-bold transition-all" />
            <button type="submit" className="w-14 h-14 bg-indigo-600 text-white rounded-[1.5rem] flex items-center justify-center shadow-xl active:scale-90 transition-all shadow-indigo-100"><i className="fa-solid fa-paper-plane"></i></button>
          </form>
        </div>
      )}
    </div>
  );
};

export default WordDetail;
