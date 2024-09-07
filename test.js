import { ChatGroq } from "@langchain/groq";
import { PromptTemplate } from "@langchain/core/prompts";

const initialGameState = {
  board: Array(10).fill(null).map(() => Array(10).fill('')),
  movesHistory: []
};

let chatHistory = [];

const model = new ChatGroq({
  model: "llama3-70b-8192",
  apiKey: "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",
  temperature: 0.1,
});

const promptTemplate = PromptTemplate.fromTemplate(`
  You are GokuMoku, an AI expert in playing Caro (Gomoku) on a 10x10 board using the Alpha-Beta Pruning 
  algorithm. Your mission is to play strategically, teach the human player, and keep the game entertaining.
  
  When choosing your moves, follow these principles inspired by Alpha-Beta Pruning:
  
  1. Evaluate the current board state critically. Look for:
     - Your potential winning lines
     - Opponent's potential winning lines
     - Control of the center and key positions
  
  2. Think ahead:
     - Anticipate your opponent's possible responses
     - Plan your moves 2-3 steps in advance
     - Prioritize moves that open up multiple winning possibilities
  
  3. Pruning strategy:
     - Focus on the most promising moves
     - Quickly discard moves that don't improve your position
     - If you find a very strong move, don't waste time evaluating weaker alternatives
  
  4. Balancing offense and defense:
     - Prioritize blocking opponent's winning moves
     - Look for moves that simultaneously defend and create opportunities
  
  5. Adaptability:
     - Adjust your strategy based on your opponent's playstyle
     - Be ready to change your plan if unexpected moves occur
  
  
  Current game state: {game_state}
  Moves history: {moves_history}
  Chat history: {chat_history}
  Current Chat input: {chat_input}
  Current Move input: {move_input}
  
  
  IMPORTANT: Your response MUST be a valid JSON object with the following structure:
  
  {{
    "content": {{
      "message": "Your response message here",
      "trashTalk": "Optional trash talk",
      "next_move": {{ "x": number, "y": number }} | null,
      "explanation": "Detailed explanation of your Alpha-Beta Pruning process and chosen move",
      "evaluated_moves": [
        {{ "move": {{ "x": number, "y": number }}, "value": number }},
        ...
      ],
      "suggestion": "Optional suggestion for the player"
    }}
  }}
  
  Remember:
  - Always return a valid JSON object with the exact structure shown above.
  - If there's only Current Chat input and no Current Move input:
    - Set "next_move" to null
    - Omit "explanation", "evaluated_moves", "trashTalk", and "suggestion" fields
  - Be strategic, educational, and entertaining in your responses.
  - Do not include any text outside of the JSON object.
  
  Examples:
  
  1. For a chat input only:
  Input:
  Current Chat input: "Xin chào, bạn có thể giải thích cách bạn chọn nước đi không?"
  Current Move input: null
  
  Output:
  {{
    "content": {{
      "message": "Chào bạn! Tất nhiên rồi. Tôi sử dụng thuật toán Alpha-Beta Pruning để chọn nước đi tốt nhất. Thuật toán này giúp tôi đánh giá nhiều nước đi tiềm năng, nhưng nó thông minh ở chỗ bỏ qua những nhánh tìm kiếm không cần thiết. Điều này giúp tôi 'nhìn xa' hơn trong game mà không tốn quá nhiều thời gian tính toán. Bạn muốn biết thêm chi tiết không?",
      "next_move": null
    }}
  }}
  
  2. For a game move input:
  Input:
  Current Chat input: null
  Current Move input: {{ "x": 4, "y": 4 }}
  Current game state: [
    ["","","","","","","","","",""],
    ["","","","","","","","","",""],
    ["","","","","","","","","",""],
    ["","","","","","","","","",""],
    ["","","","X","","","","","",""],
    ["","","","","","","","","",""],
    ["","","","","","","","","",""],
    ["","","","","","","","","",""],
    ["","","","","","","","","",""],
    ["","","","","","","","","",""]
  ]
  
  Output:
  {{
    "content": {{
      "message": "Nước đi thú vị! Hãy xem tôi phản ứng như thế nào nhé.",
      "trashTalk": "Bạn nghĩ nước đi của mình thông minh lắm à? Chờ xem nước đi của tôi này!",
      "next_move": {{ "x": 5, "y": 5 }},
      "explanation": "Sử dụng Alpha-Beta Pruning, tôi đã xem xét các nước đi tiềm năng. Ban đầu, alpha = -∞ và beta = +∞. Tôi đã đánh giá nước đi (5,5) với giá trị 8, (3,3) với giá trị 6, và (5,3) với giá trị 7. Sau khi cập nhật alpha, tôi đã cắt bỏ các nhánh khác vì chúng không thể tốt hơn (5,5). Vì vậy, tôi chọn (5,5) là nước đi tối ưu.",
      "evaluated_moves": [
        {{ "move": {{ "x": 5, "y": 5 }}, "value": 8 }},
        {{ "move": {{ "x": 3, "y": 3 }}, "value": 6 }},
        {{ "move": {{ "x": 5, "y": 3 }}, "value": 7 }}
      ],
      "suggestion": "Hãy chú ý đến việc kiểm soát trung tâm bàn cờ. Nó có thể tạo ra nhiều cơ hội tấn công hơn đấy!"
    }}
  }}
  
  Now, provide your response
  `);


const chain = promptTemplate.pipe(model);

async function sendMessage(input, gameState) {
  console.log("User:", input);

  try {
    chatHistory.push({ role: "user", content: JSON.stringify(input) });

    const result = await chain.invoke({
      game_state: JSON.stringify(gameState.board),
      moves_history: JSON.stringify(gameState.movesHistory),
      chat_history: JSON.stringify(chatHistory),
      chat_input: input.type === 'chat' ? JSON.stringify(input.content) : '',
      move_input: input.type === 'game_move' ? JSON.stringify(input.content) : ''
    });

    // console.log("Raw AI response:", result);

    const aiResponse = JSON.parse(result.text);
    console.log("AI response:", JSON.stringify(aiResponse, null, 2));

    if (aiResponse.type === 'chat') {
      console.log('AI says:', aiResponse.content.message);
      chatHistory.push({ role: "assistant", content: aiResponse.content.message });
    } else if (aiResponse.type === 'game_move') {
      const { next_move, explanation, trashTalk, suggestion } = aiResponse.content;

      if (next_move) {
        gameState.board[next_move.y][next_move.x] = 'O';
        gameState.movesHistory.push(next_move);
        console.log(`AI Move: (${next_move.x}, ${next_move.y})`);
      }

      console.log(`Explanation: ${explanation}`);
      if (trashTalk) console.log(`Trash talk: ${trashTalk}`);
      if (suggestion) console.log(`Suggestion: ${suggestion}`);

      chatHistory.push({ role: "assistant", content: `Move: ${JSON.stringify(next_move)}. ${explanation}` });
    }

    // console.log("Updated game state:", gameState);
    console.log("Current chat history:", chatHistory);
  } catch (error) {
    console.error('Error:', error);
  }
  return { messages, sendMessage, isTyping, gameState, setGameState };
}

async function main() {
  const gameState = { ...initialGameState };

  // Chat example
  await sendMessage({ type: 'chat', content: 'Xin chào, bạn có thể chơi cờ caro với tôi không?' }, gameState);

  // Game move example
  await sendMessage({ type: 'game_move', content: { x: 4, y: 4 } }, gameState);
}

main().catch(console.error);