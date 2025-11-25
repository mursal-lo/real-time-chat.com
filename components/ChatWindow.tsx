import React, { useState, useRef, useEffect } from 'react';
import { Character, Message } from '../types';
import MessageBubble from './MessageBubble';
import { sendMessageToCharacter } from '../services/geminiService';

interface ChatWindowProps {
  character: Character;
  history: Message[];
  onHistoryUpdate: (characterId: string, newMessages: Message[]) => void;
  onBack: () => void;
}

const LANGUAGES = ['Auto', 'English', 'Hindi', 'Urdu', 'Arabic', 'Spanish', 'French', 'German', 'Japanese', 'Mandarin'];

const ChatWindow: React.FC<ChatWindowProps> = ({ character, history, onHistoryUpdate, onBack }) => {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('Auto');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, [character.id]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userText = input.trim();
    setInput('');
    setIsTyping(true);

    const newUserMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: userText,
      timestamp: Date.now(),
    };

    // Optimistic update
    const updatedHistory = [...history, newUserMsg];
    onHistoryUpdate(character.id, updatedHistory);

    // Prepare placeholder for AI response
    const aiMsgId = (Date.now() + 1).toString();
    const aiMsgPlaceholder: Message = {
      id: aiMsgId,
      role: 'model',
      text: '', // Start empty
      timestamp: Date.now(),
      isStreaming: true
    };
    
    let currentAiText = '';
    // Add placeholder to state so it renders immediately
    onHistoryUpdate(character.id, [...updatedHistory, aiMsgPlaceholder]);

    try {
      const stream = sendMessageToCharacter(character, userText, updatedHistory, selectedLanguage);
      
      for await (const chunk of stream) {
        currentAiText += chunk;
        
        // Update the last message (the AI placeholder) with accumulated text
        onHistoryUpdate(character.id, [
          ...updatedHistory,
          { ...aiMsgPlaceholder, text: currentAiText }
        ]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsTyping(false);
      // Final update to remove isStreaming flag
      onHistoryUpdate(character.id, [
        ...updatedHistory,
        { ...aiMsgPlaceholder, text: currentAiText, isStreaming: false }
      ]);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 relative">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-800/80 backdrop-blur-md border-b border-gray-700 z-10 sticky top-0">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack} 
            className="mr-1 p-2 rounded-full hover:bg-gray-700 text-gray-400 hover:text-white transition-colors md:hidden"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </button>
          
          <div className="relative">
             <img src={character.avatar} alt={character.name} className="w-10 h-10 rounded-full border border-gray-600" />
             <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-gray-800 rounded-full"></div>
          </div>
          <div>
            <h2 className="text-white font-semibold leading-tight">{character.name}</h2>
            <p className="text-xs text-gray-400">{character.role}</p>
          </div>
        </div>

        {/* Language Selector */}
        <div className="flex items-center gap-2">
           <div className="relative group">
              <select 
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="appearance-none bg-gray-900 border border-gray-700 text-gray-300 text-xs md:text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2 pr-8 cursor-pointer hover:bg-gray-800 transition-colors"
              >
                {LANGUAGES.map(lang => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
           </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-2">
        {history.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 opacity-60">
                <img src={character.avatar} alt="logo" className="w-24 h-24 rounded-full mb-4 grayscale opacity-50" />
                <p>Start a conversation with {character.name}...</p>
                <p className="text-xs mt-2">Try switching languages in the header!</p>
            </div>
        )}
        
        {history.map((msg) => (
          <MessageBubble key={msg.id} message={msg} character={character} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-gray-900 border-t border-gray-800">
        <form 
          onSubmit={handleSend}
          className="relative max-w-4xl mx-auto flex items-end gap-2 bg-gray-800 border border-gray-700 rounded-3xl p-2 focus-within:ring-2 focus-within:ring-indigo-500/50 transition-all shadow-lg"
        >
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent text-white placeholder-gray-500 px-4 py-3 outline-none"
            placeholder={`Message ${character.name}...`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isTyping}
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className={`p-3 rounded-full transition-all duration-200 
              ${!input.trim() || isTyping 
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/30'
              }`}
          >
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
            </svg>
          </button>
        </form>
        <div className="text-center mt-2">
            <p className="text-[10px] text-gray-600">
                AI can make mistakes. Please check important info.
            </p>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;