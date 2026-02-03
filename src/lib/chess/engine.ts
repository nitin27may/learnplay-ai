import { Chess, Square as ChessJSSquare } from 'chess.js';
import type { ChessMove, GameState, Square } from './types';

export class ChessEngine {
  private game: Chess;

  constructor(fen?: string) {
    this.game = new Chess(fen);
  }

  move(from: Square, to: Square, promotion?: string): ChessMove | null {
    try {
      const result = this.game.move({ from: from as ChessJSSquare, to: to as ChessJSSquare, promotion });
      if (!result) return null;
      
      return {
        from: result.from,
        to: result.to,
        promotion: result.promotion as any,
        san: result.san,
        captured: result.captured as any,
      };
    } catch {
      return null;
    }
  }

  getLegalMoves(square?: Square): Square[] {
    const moves = this.game.moves({ square: square as ChessJSSquare | undefined, verbose: true });
    return moves.map(m => m.to);
  }

  getAllLegalMoves(): Array<{ from: string; to: string; san: string }> {
    const moves = this.game.moves({ verbose: true });
    return moves.map(m => ({ from: m.from, to: m.to, san: m.san }));
  }

  isGameOver(): boolean {
    return this.game.isGameOver();
  }

  isLegalMove(from: Square, to: Square): boolean {
    const moves = this.getLegalMoves(from);
    return moves.includes(to);
  }

  undo(): ChessMove | null {
    const move = this.game.undo();
    if (!move) return null;
    
    return {
      from: move.from,
      to: move.to,
      promotion: move.promotion as any,
      san: move.san,
      captured: move.captured as any,
    };
  }

  getState(): GameState {
    return {
      fen: this.game.fen(),
      turn: this.game.turn(),
      isCheck: this.game.isCheck(),
      isCheckmate: this.game.isCheckmate(),
      isStalemate: this.game.isStalemate(),
      isDraw: this.game.isDraw(),
      isGameOver: this.game.isGameOver(),
      history: this.game.history(),
    };
  }

  loadFEN(fen: string): boolean {
    try {
      this.game.load(fen);
      return true;
    } catch {
      return false;
    }
  }

  reset(): void {
    this.game.reset();
  }

  getPGN(): string {
    return this.game.pgn();
  }

  loadPGN(pgn: string): boolean {
    try {
      this.game.loadPgn(pgn);
      return true;
    } catch {
      return false;
    }
  }

  getBoard() {
    return this.game.board();
  }

  get(square: Square) {
    return this.game.get(square as ChessJSSquare);
  }
}
