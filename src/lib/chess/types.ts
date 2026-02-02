export type PieceSymbol = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
export type Color = 'w' | 'b';
export type Square = string;

export interface ChessPiece {
  type: PieceSymbol;
  color: Color;
}

export interface ChessMove {
  from: Square;
  to: Square;
  promotion?: PieceSymbol;
  san: string;
  captured?: PieceSymbol;
}

export interface GameState {
  fen: string;
  turn: Color;
  isCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
  isDraw: boolean;
  isGameOver: boolean;
  history: string[];
}

export interface HighlightAnnotation {
  square: Square;
  color: 'green' | 'blue' | 'yellow' | 'red' | 'purple';
}

export interface ArrowAnnotation {
  from: Square;
  to: Square;
  color: 'green' | 'blue' | 'yellow' | 'red';
  label?: string;
}

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';
