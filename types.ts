
export interface Language {
  code: string;
  name: string;
  flag: string;
}

export interface WordDefinition {
  word: string;
  pronunciation?: string;
  explanation: string;
  examples: Array<{
    target: string;
    native: string;
  }>;
  usageNotes: string;
  imageUrl?: string;
}

export interface SavedWord extends WordDefinition {
  id: string;
  addedAt: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface CorpusAnalysis {
  detectedLang: string;
  summary: string;
  sentences: Array<{
    original: string;
    translated: string;
  }>;
  vocabulary: Array<{
    term: string;
    pronunciation?: string;
    explanation: string;
    examples: string[];
  }>;
  grammar: Array<{
    point: string;
    explanation: string;
    examples: string[];
  }>;
}

export interface CorpusItem {
  id: string;
  title: string;
  content: string;
  analysis: CorpusAnalysis;
  addedAt: number;
}

export interface AppState {
  nativeLang: Language;
  targetLang: Language;
  notebook: SavedWord[];
  corpus: CorpusItem[];
}
