'use client';

import { Chessboard } from 'react-chessboard';
import type { Square } from '@/lib/chess/types';

interface ChessBoardProps {
  position: string;
  onPieceDrop: (sourceSquare: Square, targetSquare: Square) => boolean;
  boardOrientation?: 'white' | 'black';
  customSquareStyles?: Record<string, React.CSSProperties>;
  areDraggablePieces?: boolean;
}

export function ChessBoard({
  position,
  onPieceDrop,
  boardOrientation = 'white',
  customSquareStyles = {},
  areDraggablePieces = true,
}: ChessBoardProps) {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <Chessboard
        {...({
          position,
          onPieceDrop,
          boardOrientation,
          customSquareStyles,
          areDraggablePieces,
        } as any)}
      />
    </div>
  );
}
