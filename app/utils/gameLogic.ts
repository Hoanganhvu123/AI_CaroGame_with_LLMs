import { Board, CellValue } from '@/app/types';
import { BOARD_SIZE} from '../constants';

export const getSplitArr = <T>(arr: T[] | undefined, size: number): T[][] => {
  if (!arr) return [];
  return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size)
  );
};

export const createEmptyBoard = (size: number = BOARD_SIZE): Board => {
  return Array(size).fill(null).map(() => Array(size).fill(null));
};

export const checkWinner = (board: Board, row: number, col: number, player: CellValue): boolean => {
  const directions = [
    [1, 0], [0, 1], [1, 1], [1, -1]
  ];

  for (const [dx, dy] of directions) {
    let count = 1;
    for (let i = 1; i < 5; i++) {
      const newRow = row + i * dx;
      const newCol = col + i * dy;
      if (newRow < 0 || newRow >= board.length || newCol < 0 || newCol >= board[0].length || board[newRow][newCol] !== player) {
        break;
      }
      count++;
    }
    for (let i = 1; i < 5; i++) {
      const newRow = row - i * dx;
      const newCol = col - i * dy;
      if (newRow < 0 || newRow >= board.length || newCol < 0 || newCol >= board[0].length || board[newRow][newCol] !== player) {
        break;
      }
      count++;
    }
    if (count >= 5) {
      return true;
    }
  }
  return false;
};

export const getWinnerRow = (board: Board, boardSize: number, marksToWin: number): number[] | null => {
  for (let i = 0; i < boardSize; i++) {
    for (let j = 0; j < boardSize; j++) {
      if (board[i][j] && checkWinner(board, i, j, board[i][j])) {
        // Return the winning row
        return Array.from({ length: 5 }, (_, k) => i * boardSize + j + k);
      }
    }
  }
  return null;
};

export const fireConfetti = (particleCount: number, origin: { x: number; y: number }) => {
  // Implement confetti effect here
  console.log('Confetti fired!', particleCount, origin);
};