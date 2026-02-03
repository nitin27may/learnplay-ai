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
  function handleDrop(sourceSquare: string, targetSquare: string) {
    return onPieceDrop(sourceSquare as Square, targetSquare as Square);
  }

  const boardProps = {
    position,
    onPieceDrop: handleDrop,
    boardOrientation,
    customSquareStyles,
    boardWidth: 600,
    customBoardStyle: {
      borderRadius: '4px',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
    },
  };
  
  return (
    <div className="w-full max-w-2xl mx-auto">
      <Chessboard {...boardProps as any} />
    </div>
  );
}
