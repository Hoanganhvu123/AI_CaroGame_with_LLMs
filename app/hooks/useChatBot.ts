import { useState, useCallback } from 'react';
import { ChatGroq } from "@langchain/groq";
import { caroGamePrompt } from './useCaroGamePrompt';

// Định nghĩa các types
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

  // Khởi tạo model và promptTemplate
  const model = new ChatGroq({
    model: "llama3-70b-8192",
    apiKey: "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",
    temperature: 0.1,
  });

  const chain = caroGamePrompt.pipe(model);

  const sendMessage = useCallback(async (input: SendMessageInput) => {
    setIsTyping(true);
    console.log("User:", input);

    try {
      // Thêm tin nhắn của người dùng vào chat history
      const newChatHistory: ChatMessage[] = [
        ...chatHistory,
        {
          role: "user",
          content: input.type === 'chat'
            ? input.content as string
            : `Đánh vào vị trí (${(input.content as { x: number; y: number }).x}, ${(input.content as { x: number; y: number }).y})`
        }
      ];
      setChatHistory(newChatHistory);

      const result = await chain.invoke({
        game_state: JSON.stringify(gameState.board),
        moves_history: JSON.stringify(gameState.movesHistory),
        chat_history: JSON.stringify(newChatHistory),
        chat_input: input.type === 'chat' ? JSON.stringify(input.content) : '',
        move_input: input.type === 'game_move' ? JSON.stringify(input.content) : ''
      });

      const aiResponse: AIResponse = JSON.parse(result.text);
      console.log("AI response:", JSON.stringify(aiResponse, null, 2));

      const { message, next_move, explanation, trashTalk, suggestion } = aiResponse.content;

      // Cập nhật game state nếu AI đánh
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

      // Log các thông tin bổ sung
      if (explanation) console.log(`Explanation: ${explanation}`);
      if (trashTalk) console.log(`Trash talk: ${trashTalk}`);
      if (suggestion) console.log(`Suggestion: ${suggestion}`);

      // Thêm phản hồi của AI vào chat history
      setChatHistory(prev => [
        ...prev,
        {
          role: "assistant",
          content: `${message}${trashTalk ? `\n\nTrash Talk: ${trashTalk}` : ''}${explanation ? `\n\nExplanation: ${explanation}` : ''}${suggestion ? `\n\nSuggestion: ${suggestion}` : ''}${next_move ? `\n\nAI Move: (${next_move.x}, ${next_move.y})` : ''}`
        }
      ]);

      return result;
    } catch (error) {
      console.error('Error:', error);
      setChatHistory(prev => [
        ...prev,
        { role: "assistant", content: "Xin lỗi, đã xảy ra lỗi. Vui lòng thử lại." }
      ]);
    } finally {
      setIsTyping(false);
    }
  }, [gameState, chatHistory, chain]);

  return {
    gameState,
    setGameState,
    chatHistory,
    setChatHistory,
    isTyping,
    sendMessage
  };
};