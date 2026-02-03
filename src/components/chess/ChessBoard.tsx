'use client';

import { Chessboard } from 'react-chessboard';
import type { Square } from '@/lib/chess/types';
import { useCallback } from 'react';

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
  console.log('🎨 ChessBoard rendering');
  console.log('📍 Position:', position);
  console.log('🎯 Draggable:', areDraggablePieces);
  
  const handlePieceDrop = useCallback((sourceSquare: string, targetSquare: string) => {
    console.log('🎯 DROP EVENT!', sourceSquare, '->', targetSquare);
    try {
      const result = onPieceDrop(sourceSquare as Square, targetSquare as Square);
      console.log('✅ Drop result:', result);
      return result;
    } catch (error) {
      console.error('❌ Drop error:', error);
      return false;
    }
  }, [onPieceDrop]);
  
  const handleIsDraggable = useCallback(() => {
    console.log('🤚 IS_DRAGGABLE CHECK - returning true');
    return true; // Always return true for testing
  }, []);
  
  console.log('🔧 Setting up Chessboard with handlers');
  
  const chessboardProps = {
    position,
    onPieceDrop: handlePieceDrop,
    boardOrientation,
    customSquareStyles,
    isDraggablePiece: handleIsDraggable,
    customBoardStyle: {
      borderRadius: '4px',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
    },
  };
  
  return (
    <div className="w-full max-w-2xl mx-auto">
      <Chessboard {...chessboardProps as any} />
    </div>
  );
}
