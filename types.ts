export interface Character {
  id: string;
  name: string;
  role: string;
  description: string;
  avatar: string;
  systemInstruction: string;
  themeColor: string;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  isStreaming?: boolean;
}

export interface ChatSession {
  characterId: string;
  messages: Message[];
  lastUpdated: number;
}

export type ChatHistory = Record<string, ChatSession>;