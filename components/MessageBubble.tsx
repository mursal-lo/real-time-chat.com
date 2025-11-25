import React from 'react';
import { Message, Character } from '../types';

interface MessageBubbleProps {
  message: Message;
  character: Character;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, character }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex w-full mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[85%] md:max-w-[70%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>
        
        {/* Avatar */}
        <div className="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden border border-gray-700 bg-gray-800">
          {isUser ? (
             <div className="w-full h-full bg-indigo-600 flex items-center justify-center text-xs font-bold">ME</div>
          ) : (
             <img src={character.avatar} alt={character.name} className="w-full h-full object-cover" />
          )}
        </div>

        {/* Bubble */}
        <div 
          className={`relative px-4 py-3 rounded-2xl text-sm md:text-base leading-relaxed shadow-md
            ${isUser 
              ? 'bg-indigo-600 text-white rounded-br-none' 
              : 'bg-gray-800 text-gray-100 rounded-bl-none border border-gray-700'
            }
          `}
        >
          {/* Render text with basic line breaks preservation */}
          <div className="whitespace-pre-wrap">{message.text}</div>
          
          {message.isStreaming && (
            <span className="inline-block w-2 h-4 ml-1 align-middle bg-gray-400 animate-pulse"></span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;