import React, { useState, useEffect } from 'react';
import { CHARACTERS } from './constants';
import { Character, ChatHistory, Message } from './types';
import CharacterCard from './components/CharacterCard';
import ChatWindow from './components/ChatWindow';

// Helper to save/load from local storage to persist chats across refreshes
const STORAGE_KEY = 'persona_chat_history';

function App() {
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatHistory>({});

  // Load history on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setChatHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse chat history", e);
      }
    }
  }, []);

  // Save history on change
  useEffect(() => {
    if (Object.keys(chatHistory).length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(chatHistory));
    }
  }, [chatHistory]);

  const handleCharacterSelect = (char: Character) => {
    setSelectedCharacter(char);
  };

  const handleBackToMenu = () => {
    setSelectedCharacter(null);
  };

  const updateCharacterHistory = (charId: string, messages: Message[]) => {
    setChatHistory((prev) => ({
      ...prev,
      [charId]: {
        characterId: charId,
        messages: messages,
        lastUpdated: Date.now(),
      },
    }));
  };

  // Determine current view: Desktop (Split) or Mobile (Switch)
  // We use Tailwind classes for responsive layout, but for logic we just render conditional based on state

  return (
    <div className="flex h-screen bg-gray-950 text-white font-sans overflow-hidden">
      
      {/* Sidebar / Character List (Visible on mobile if no char selected, always on desktop) */}
      <div 
        className={`
          flex-col w-full md:w-80 lg:w-96 border-r border-gray-800 bg-gray-900/50 flex-shrink-0 transition-all duration-300
          ${selectedCharacter ? 'hidden md:flex' : 'flex'}
        `}
      >
        <div className="p-6 border-b border-gray-800 flex flex-col gap-2">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            PersonaChat
          </h1>
          <p className="text-sm text-gray-500">Pick a character to start chatting</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {CHARACTERS.map((char) => (
            <CharacterCard 
              key={char.id} 
              character={char} 
              onClick={handleCharacterSelect}
              isSelected={selectedCharacter?.id === char.id}
            />
          ))}
        </div>
        
        <div className="p-4 border-t border-gray-800 text-xs text-center text-gray-600">
          Powered by Gemini 2.5 Flash
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative bg-gray-950">
        {selectedCharacter ? (
          <ChatWindow 
            character={selectedCharacter}
            history={chatHistory[selectedCharacter.id]?.messages || []}
            onHistoryUpdate={updateCharacterHistory}
            onBack={handleBackToMenu}
          />
        ) : (
          /* Empty State for Desktop when no character selected */
          <div className="hidden md:flex flex-col items-center justify-center h-full text-center p-8">
            <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mb-6 animate-pulse">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-gray-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.18.063-2.33.155-3.456.279-.505.055-1.008.114-1.511.177a2.052 2.052 0 00-1.806 1.944c-.06 1.055-.06 2.115 0 3.171a2.052 2.052 0 001.806 1.944c1.12.124 2.246.216 3.376.279.793.044 1.58.081 2.362.112M12 2.25a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM6.166 5.106a.75.75 0 01.956.342l.85 1.7a.75.75 0 01-1.341.671l-.85-1.7a.75.75 0 01.385-1.013zM17.834 5.106a.75.75 0 00-.956.342l-.85 1.7a.75.75 0 001.341.671l.85-1.7a.75.75 0 00-.385-1.013z" />
                </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-300 mb-2">Welcome to PersonaChat</h2>
            <p className="text-gray-500 max-w-md">
              Select a character from the sidebar to begin a unique real-time conversation powered by AI.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;