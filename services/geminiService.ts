import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { Character, Message } from "../types";

// Initialize the API client
// Ideally, in a real production app, you might proxy this through a backend to protect the key,
// or require the user to input their key. For this demo structure, we use process.env.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// We keep a cache of active chat instances to maintain history context within the SDK
// Key: characterId, Value: Chat instance
const activeChats: Map<string, Chat> = new Map();

/**
 * Gets or creates a Gemini Chat instance for a specific character.
 * It pre-loads the history if a new chat instance is created.
 */
const getChatSession = (character: Character, historyMessages: Message[]): Chat => {
  if (!activeChats.has(character.id)) {
    // Transform app messages to SDK history format if needed.
    // However, the SDK's `history` config in `chats.create` is the best way to restore context.
    const history = historyMessages.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.text }]
    }));

    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: character.systemInstruction,
      },
      history: history
    });

    activeChats.set(character.id, chat);
  }
  
  // Note: If the user refreshes the page, `activeChats` is cleared (memory), 
  // but we will rebuild it from the passed `historyMessages` state in App.tsx.
  // If the map is empty but we have historyMessages, we recreate the chat with history.
  // The logic above handles this "rehydration".
  
  return activeChats.get(character.id)!;
};

/**
 * Sends a message to the character and yields chunks of text for real-time streaming.
 * @param character The character to chat with
 * @param userMessage The raw message from the user
 * @param currentHistory The full chat history
 * @param language Optional target language for the response
 */
export async function* sendMessageToCharacter(
  character: Character, 
  userMessage: string, 
  currentHistory: Message[],
  language: string = 'Auto'
): AsyncGenerator<string, void, unknown> {
  
  const chat = getChatSession(character, currentHistory);

  // If a specific language is requested (and it's not Auto), prepend an instruction.
  // This is a "soft" system instruction update per turn.
  let finalMessage = userMessage;
  if (language && language !== 'Auto') {
    finalMessage = `(System Instruction: Please respond in ${language}. If the user's message is in a different language, translate your understanding but keep the response in ${language}.) ${userMessage}`;
  }

  try {
    const resultStream = await chat.sendMessageStream({ message: finalMessage });

    for await (const chunk of resultStream) {
        const responseChunk = chunk as GenerateContentResponse;
        if (responseChunk.text) {
            yield responseChunk.text;
        }
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    yield " [Connection Error: Unable to reach the character. Please try again.]";
  }
}

/**
 * Resets a chat session (useful if user clears conversation).
 */
export const resetChatSession = (characterId: string) => {
  activeChats.delete(characterId);
};