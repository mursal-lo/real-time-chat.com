import React from 'react';
import { Character } from '../types';

interface CharacterCardProps {
  character: Character;
  onClick: (character: Character) => void;
  isSelected?: boolean;
}

const CharacterCard: React.FC<CharacterCardProps> = ({ character, onClick, isSelected }) => {
  return (
    <button
      onClick={() => onClick(character)}
      className={`group relative flex flex-col items-center p-4 rounded-xl transition-all duration-300 border 
        ${isSelected 
          ? `bg-gray-800 border-${character.themeColor}-500 shadow-[0_0_15px_rgba(var(--color-${character.themeColor}),0.3)]` 
          : 'bg-gray-800/50 border-gray-700 hover:bg-gray-700 hover:border-gray-500 hover:-translate-y-1'
        }
        text-left w-full h-full overflow-hidden`}
    >
      <div className="relative mb-3">
        <img 
          src={character.avatar} 
          alt={character.name} 
          className={`w-20 h-20 rounded-full object-cover border-2 
            ${isSelected ? `border-${character.themeColor}-500` : 'border-gray-600 group-hover:border-gray-400'}`}
        />
        <div className={`absolute bottom-0 right-0 w-5 h-5 rounded-full border-4 border-gray-800 
          ${isSelected ? 'bg-green-500' : 'bg-gray-500 group-hover:bg-green-400'}`}></div>
      </div>
      
      <div className="text-center w-full">
        <h3 className="font-bold text-lg text-white group-hover:text-white mb-1">{character.name}</h3>
        <p className={`text-xs font-semibold uppercase tracking-wider mb-2 text-${character.themeColor}-400`}>
            {character.role}
        </p>
        <p className="text-sm text-gray-400 line-clamp-2">{character.description}</p>
      </div>
    </button>
  );
};

export default CharacterCard;