export type CellValue = number | null;
export type SudokuGrid = CellValue[][];

export interface Cell {
  row: number;
  col: number;
  value: CellValue;
  isFixed: boolean;
  isError: boolean;
  isPencilMark?: boolean;
}

export interface GameState {
  grid: SudokuGrid;
  solution: SudokuGrid;
  fixedCells: boolean[][];
  selectedCell: { row: number; col: number } | null;
  mistakes: number;
  hintsUsed: number;
  startTime: number;
  elapsedTime: number;
  isComplete: boolean;
  difficulty: Difficulty;
}

export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

export type GameMode = 'play' | 'teach' | 'practice';

export interface SudokuMove {
  row: number;
  col: number;
  value: CellValue;
  timestamp: number;
}

export interface TeachingState {
  mode: GameMode;
  lastMove: SudokuMove | null;
  suggestedStrategies: string[];
  currentExplanation: string | null;
  playerLevel: 'beginner' | 'intermediate' | 'advanced';
}
