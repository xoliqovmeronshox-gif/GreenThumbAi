export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  isError?: boolean;
}

export enum AppView {
  CHAT = 'CHAT',
  ANALYZE = 'ANALYZE'
}

export interface AnalysisResult {
  plantName: string;
  careInstructions: string;
  confidence: string;
  rawText: string;
}
