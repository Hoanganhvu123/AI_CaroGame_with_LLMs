import { useState } from 'react';
import { useChatbot } from './useChatBot';

export const useBoard = (boardSize: number) => {
  const { gameState, setGameState, sendMessage, isTyping, setChatHistory } = useChatbot();
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [winner, setWinner] = useState<string | null>(null);
  const [winningCells, setWinningCells] = useState<[number, number][]>([]);
  const [currentTurn, setCurrentTurn] = useState<'User' | 'AI'>('User');

  const checkWinner = (board: string[][], row: number, col: number): [boolean, [number, number][]] => {
    const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];
    const player = board[row][col];
    let winningLine: [number, number][] = [];

    for (const [dx, dy] of directions) {
      let count = 1;
      let line: [number, number][] = [[row, col]];

      for (let i = 1; i < 5; i++) {
        const newRow = row + i * dx;
        const newCol = col + i * dy;
        if (newRow < 0 || newRow >= boardSize || newCol < 0 || newCol >= boardSize || board[newRow][newCol] !== player) break;
        count++;
        line.push([newRow, newCol]);
      }
      for (let i = 1; i < 5; i++) {
        const newRow = row - i * dx;
        const newCol = col - i * dy;
        if (newRow < 0 || newRow >= boardSize || newCol < 0 || newCol >= boardSize || board[newRow][newCol] !== player) break;
        count++;
        line.unshift([newRow, newCol]);
      }
      if (count >= 5) {
        winningLine = line.slice(0, 5);
        return [true, winningLine];
      }
    }
    return [false, []];
  };

  const handleCellClick = async (row: number, col: number) => {
    if (!isPlayerTurn || gameState.board[row][col] || winner) return;
  
    // Player's move
    const newBoard = gameState.board.map(r => [...r]);
    newBoard[row][col] = 'X';
  
    const [isWinner, winningLine] = checkWinner(newBoard, row, col);
  
    setGameState(prevState => ({
      ...prevState,
      board: newBoard,
      movesHistory: [...prevState.movesHistory, { x: col, y: row }]
    }));
  
    if (isWinner) {
      setWinner('Player');
      setWinningCells(winningLine);
      return;
    }
  
    setIsPlayerTurn(false);
    setCurrentTurn('AI');
  
    try {
      const response = await sendMessage({ type: 'game_move', content: { x: col, y: row } });
      
      if (response && response.text) {
        const aiResponse = JSON.parse(response.text).content;
  
        // Update chat history with AI information
        setChatHistory(prev => [...prev, {
          role: 'assistant',
          content: `${aiResponse.message}\n\nTrash Talk: ${aiResponse.trashTalk}\n\nExplanation: ${aiResponse.explanation}\n\nSuggestion: ${aiResponse.suggestion}`
        }]);
  
        if (aiResponse.next_move) {
          const { x, y } = aiResponse.next_move;
          const aiBoard = newBoard.map(r => [...r]);
          aiBoard[y][x] = 'O';
  
          const [isAIWinner, aiWinningLine] = checkWinner(aiBoard, y, x);
  
          setGameState(prevState => ({
            ...prevState,
            board: aiBoard,
            movesHistory: [...prevState.movesHistory, { x, y }]
          }));
  
          if (isAIWinner) {
            setWinner('AI');
            setWinningCells(aiWinningLine);
          } else {
            setIsPlayerTurn(true);
            setCurrentTurn('User');
          }
        }
      } else {
        throw new Error('Invalid response from AI');
      }
    } catch (error) {
      console.error('Error getting AI move:', error);
      setIsPlayerTurn(true);
      setCurrentTurn('User');
      setChatHistory(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, an error occurred while processing the AI move. Please try again.'
      }]);
    }
  };
  const resetGame = () => {
    setGameState({
      board: Array(boardSize).fill(null).map(() => Array(boardSize).fill('')),
      movesHistory: []
    });
    setIsPlayerTurn(true);
    setWinner(null);
    setWinningCells([]);
    setCurrentTurn('User');
  };

  return {
    gameState,
    isPlayerTurn,
    winner,
    winningCells,
    isTyping,
    handleCellClick,
    resetGame,
    currentTurn,
  };
};