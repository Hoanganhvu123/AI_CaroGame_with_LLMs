'use client';

import React from 'react';
import { useBoard } from '../hooks/useBoard';

interface BoardProps {
  boardSize: number;
}

const Board: React.FC<BoardProps> = ({ boardSize }) => {
  const {
    gameState,
    isPlayerTurn,
    winner,
    winningCells,
    isTyping,
    handleCellClick,
    resetGame,
    currentTurn,
  } = useBoard(boardSize);

  const cellSize = Math.floor(600 / boardSize);

  return (
    <div className="board-wrapper flex flex-col justify-center items-center h-full" style={{ width: '600px' }}>
      <div className="mb-4">
        {winner ? (
          <div className="text-2xl font-bold">{winner} wins!</div>
        ) : (
          <div className="text-xl font-semibold">
            {currentTurn === 'User' ? (
              <span className="text-blue-600">Your turn</span>
            ) : (
              <span className="text-red-600">AI's turn</span>
            )}
          </div>
        )}
      </div>
      <div className="board border-2 border-black" style={{ width: `${cellSize * boardSize}px`, height: `${cellSize * boardSize}px` }}>
        {gameState.board.map((row, rowIndex) => (
          <div key={rowIndex} className="flex">
            {row.map((cell, colIndex) => (
              <div
                key={colIndex}
                onClick={() => handleCellClick(rowIndex, colIndex)}
                className={`cell flex justify-center items-center ${
                  winningCells.some(([r, c]) => r === rowIndex && c === colIndex) ? 'bg-yellow-200' : ''
                }`}
                style={{
                  width: `${cellSize}px`,
                  height: `${cellSize}px`,
                  border: '1px solid black',
                  cursor: currentTurn === 'User' && !cell && !winner ? 'pointer' : 'default',
                }}
              >
                {cell && (
                  <span className={`text-3xl font-bold ${cell === 'X' ? 'text-blue-500' : 'text-red-500'}`}>
                    {cell}
                  </span>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
      {(winner || isTyping) && (
        <div className="mt-4">
          {winner && <button onClick={resetGame} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">Play Again</button>}
          {isTyping && <div className="text-xl font-semibold text-gray-600">AI is thinking...</div>}
        </div>
      )}
    </div>
  );
};

export default Board;