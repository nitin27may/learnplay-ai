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
  console.log('🎨 ChessBoard rendering with position:', position);
  console.log('🎯 areDraggablePieces:', areDraggablePieces);
  
  return (
    <div className="w-full max-w-2xl mx-auto">
      <Chessboard
        id="ChessBoard"
        position={position}
        onPieceDrop={onPieceDrop}
        boardOrientation={boardOrientation}
        customSquareStyles={customSquareStyles}
        isDraggablePiece={() => areDraggablePieces}
        boardWidth={600}
      />
    </div>
  );
}
