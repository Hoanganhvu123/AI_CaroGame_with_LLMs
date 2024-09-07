import { useState, useCallback } from 'react';
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { caroGamePrompt } from './useCaroGamePrompt';
import { PromptTemplate } from "@langchain/core/prompts";

// Define types
type GameState = {
  board: string[][];
  movesHistory: { x: number; y: number }[];
};

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

type AIResponse = {
  content: {
    message: string;
    trashTalk?: string;
    next_move?: { x: number; y: number } | null;
    explanation?: string;
    evaluated_moves?: { move: { x: number; y: number }; value: number }[];
    suggestion?: string;
  };
};

type SendMessageInput = {
  type: 'chat' | 'game_move';
  content: string | { x: number; y: number };
};

// Custom hook useChatbot
export const useChatbot = () => {
  const [gameState, setGameState] = useState<GameState>({
    board: Array(10).fill(null).map(() => Array(10).fill('')),
    movesHistory: []
  });
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  // Initialize model
  const model = new ChatGoogleGenerativeAI({
    modelName: "gemini-1.5-flash",
    apiKey: 'AIzaSyDupRJujCkJENMw28K84nfTuMyRQdHJZPs',
  });

  const sendMessage = useCallback(async (input: SendMessageInput) => {
    setIsTyping(true);
    console.log("User:", input);

    try {
      // Add user message to chat history
      const newChatHistory: ChatMessage[] = [
        ...chatHistory,
        {
          role: "user",
          content: input.type === 'chat'
            ? input.content as string
            : `Move to position (${(input.content as { x: number; y: number }).x}, ${(input.content as { x: number; y: number }).y})`
        }
      ];
      setChatHistory(newChatHistory);

      const formattedPrompt = await caroGamePrompt.format({
        game_state: JSON.stringify(gameState.board),
        moves_history: JSON.stringify(gameState.movesHistory),
        chat_history: JSON.stringify(newChatHistory),
        chat_input: input.type === 'chat' ? JSON.stringify(input.content) : '',
        move_input: input.type === 'game_move' ? JSON.stringify(input.content) : ''
      });

      const result = await model.invoke(formattedPrompt);
      const aiResponse: AIResponse = JSON.parse(result.content as string);
      console.log("AI response:", JSON.stringify(aiResponse, null, 2));

      const { message, next_move, explanation, trashTalk, suggestion } = aiResponse.content;

      // Update game state if AI makes a move
      if (next_move) {
        setGameState(prevState => {
          const newBoard = prevState.board.map(row => [...row]);
          newBoard[next_move.y][next_move.x] = 'O';
          return {
            board: newBoard,
            movesHistory: [...prevState.movesHistory, next_move]
          };
        });
        console.log(`AI Move: (${next_move.x}, ${next_move.y})`);
      }

      // Log additional information
      if (explanation) console.log(`Explanation: ${explanation}`);
      if (trashTalk) console.log(`Trash talk: ${trashTalk}`);
      if (suggestion) console.log(`Suggestion: ${suggestion}`);

      // Add AI response to chat history
      setChatHistory(prev => [
        ...prev,
        {
          role: "assistant",
          content: JSON.stringify(aiResponse.content)
        }
      ]);

      return result;
    } catch (error) {
      console.error('Error:', error);
      setChatHistory(prev => [
        ...prev,
        { role: "assistant", content: JSON.stringify({ message: "Sorry, an error occurred. Please try again." }) }
      ]);
    } finally {
      setIsTyping(false);
    }
  }, [gameState, chatHistory, model]);

  return {
    gameState,
    setGameState,
    chatHistory,
    setChatHistory,
    isTyping,
    sendMessage
  };
};