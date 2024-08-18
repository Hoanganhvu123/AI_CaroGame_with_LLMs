export type CellValue = 'X' | 'O' | null;
export type WinnerSign = CellValue | 'draw';
export type Board = CellValue[][];

export interface Message {
  isAI: boolean;
  text: string;
}

export interface GameState {
  board: Board;
  messages: Message[];
}

export interface AIResponse {
  ai_move: string;
  message: string;
  support_info: string | null;
  emotion: string;
  gameOver?: boolean;
}