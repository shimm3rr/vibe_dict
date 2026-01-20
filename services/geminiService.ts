
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { WordDefinition, Language, CorpusAnalysis } from "../types";

const getAi = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getWordDefinition = async (
  query: string,
  nativeLang: Language,
  targetLang: Language
): Promise<WordDefinition> => {
  const ai = getAi();
  const isNativeChinese = nativeLang.code === 'zh' || nativeLang.name.toLowerCase().includes('chinese');
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { 
      parts: [{ text: `Explain "${query}" (Target: ${targetLang.name}, Explanation Language: ${nativeLang.name}).` }]
    },
    config: {
      systemInstruction: `You are a professional dictionary. Return ONLY JSON.
      - "word": The word itself.
      - "pronunciation": Provide pronunciation. 
        If English: use IPA (e.g., /əˈmeɪzɪŋ/). 
        If Japanese: use Romaji + Pitch Accent description (e.g., sensei [seɴseː] LHH). 
        Others: standard phonetic symbols.
      - "explanation": Short definition in ${nativeLang.name}. ${isNativeChinese ? 'MUST use Chinese.' : ''}
      - "examples": 2 sentences in ${targetLang.name} + translations in ${nativeLang.name}.
      - "usageNotes": Vibe/context in ${nativeLang.name}. ${isNativeChinese ? 'MUST use Chinese.' : ''}`,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          word: { type: Type.STRING },
          pronunciation: { type: Type.STRING },
          explanation: { type: Type.STRING },
          examples: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                target: { type: Type.STRING },
                native: { type: Type.STRING }
              },
              required: ["target", "native"]
            }
          },
          usageNotes: { type: Type.STRING }
        },
        required: ["word", "pronunciation", "explanation", "examples", "usageNotes"]
      }
    }
  });

  try {
    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text);
  } catch (e) {
    console.error("Parse error:", e);
    throw new Error("Failed to parse dictionary data.");
  }
};

export const analyzeCorpus = async (text: string, nativeLangName: string): Promise<CorpusAnalysis> => {
  const ai = getAi();
  const isNativeChinese = nativeLangName.toLowerCase().includes('chinese');

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts: [{ text: `Analyze for a ${nativeLangName} speaker: "${text}"` }] },
    config: {
      systemInstruction: `Analyze text and return JSON.
      1. Detect source language.
      2. If Japanese, use 漢字[かんじ] for Kanji in 'original' strings.
      3. Translate sentences into ${nativeLangName}.
      4. Summary and explanations MUST be in ${nativeLangName}. ${isNativeChinese ? 'Use professional Chinese for everything.' : ''}
      5. Extract vocabulary/grammar. 
      6. For vocabulary "pronunciation": 
         English: IPA symbols. 
         Japanese: Romaji + Pitch Accent.
         Others: Relevant phonetics.`,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          detectedLang: { type: Type.STRING },
          summary: { type: Type.STRING },
          sentences: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                original: { type: Type.STRING },
                translated: { type: Type.STRING }
              },
              required: ["original", "translated"]
            }
          },
          vocabulary: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                term: { type: Type.STRING },
                pronunciation: { type: Type.STRING },
                explanation: { type: Type.STRING },
                examples: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["term", "pronunciation", "explanation", "examples"]
            }
          },
          grammar: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                point: { type: Type.STRING },
                explanation: { type: Type.STRING },
                examples: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["point", "explanation", "examples"]
            }
          }
        },
        required: ["detectedLang", "summary", "sentences", "vocabulary", "grammar"]
      }
    }
  });

  try {
    return JSON.parse(response.text);
  } catch (e) {
    throw new Error("Failed to analyze corpus.");
  }
};

export const generateConceptImage = async (word: string, lang: string): Promise<string> => {
  const ai = getAi();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `High-quality minimalist 3D conceptual icon for "${word}" (${lang}). White background, studio lighting.` }]
      },
      config: { imageConfig: { aspectRatio: "1:1" } }
    });
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
  } catch (err) {}
  return `https://picsum.photos/seed/${encodeURIComponent(word)}/400/400`;
};

export const speak = async (text: string, langCode: string): Promise<void> => {
  if (!text) return;
  const ai = getAi();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: { parts: [{ text }] },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
        },
      },
    });
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) return;
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const audioBuffer = await decodeAudioData(decodeBase64(base64Audio), audioContext, 24000, 1);
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    source.start();
  } catch (err) {
    console.error("Audio failed", err);
  }
};

export const generateStory = async (words: string[], nativeLang: string): Promise<string> => {
  const ai = getAi();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts: [{ text: `Story in ${nativeLang} using: ${words.join(', ')}.` }] }
  });
  return response.text;
};

export const chatAboutWord = async (word: string, history: any[], message: string): Promise<string> => {
  const ai = getAi();
  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: { systemInstruction: `Coach for "${word}".` }
  });
  const response = await chat.sendMessage({ message });
  return response.text;
};

function decodeBase64(b: string): Uint8Array {
  const s = atob(b);
  const d = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) d[i] = s.charCodeAt(i);
  return d;
}

async function decodeAudioData(d: Uint8Array, c: AudioContext, s: number, n: number): Promise<AudioBuffer> {
  const i = new Int16Array(d.buffer);
  const f = i.length / n;
  const b = c.createBuffer(n, f, s);
  for (let ch = 0; ch < n; ch++) {
    const cd = b.getChannelData(ch);
    for (let i = 0; i < f; i++) cd[i] = i[i * n + ch] / 32768.0;
  }
  return b;
}
