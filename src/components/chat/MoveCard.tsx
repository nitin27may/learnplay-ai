'use client';

import React from 'react';

interface MoveCardProps {
  from: string;
  to: string;
  piece: string;
  pieceColor: 'white' | 'black';
  notation: string;
  evaluation?: number;
  isCapture?: boolean;
  isCheck?: boolean;
  explanation: string;
  onPlay?: () => void;
}

const pieceSymbols: Record<string, string> = {
  king: '\u2654',
  queen: '\u2655',
  rook: '\u2656',
  bishop: '\u2657',
  knight: '\u2658',
  pawn: '\u2659',
};

const pieceNames: Record<string, string> = {
  king: 'King',
  queen: 'Queen',
  rook: 'Rook',
  bishop: 'Bishop',
  knight: 'Knight',
  pawn: 'Pawn',
};

export function MoveCard({
  from,
  to,
  piece,
  pieceColor,
  notation,
  evaluation,
  isCapture,
  isCheck,
  explanation,
  onPlay,
}: MoveCardProps) {
  const evalColor = evaluation !== undefined && evaluation > 0 
    ? 'text-green-600' 
    : evaluation !== undefined && evaluation < 0 
      ? 'text-red-600' 
      : 'text-gray-600';

  const evalText = evaluation !== undefined 
    ? (evaluation > 0 ? `+${evaluation.toFixed(1)}` : evaluation.toFixed(1))
    : null;

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 my-2" role="article" aria-label="Suggested chess move">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* Piece icon */}
          <span 
            className={`text-3xl ${pieceColor === 'white' ? 'text-gray-200 drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]' : 'text-gray-800'}`}
            aria-label={`${pieceColor} ${pieceNames[piece] || piece}`}
          >
            {pieceSymbols[piece] || 'P'}
          </span>
          
          {/* Move squares */}
          <div className="flex items-center gap-1 font-mono text-lg">
            <span className="bg-amber-100 px-2 py-1 rounded border border-amber-300">{from}</span>
            <span className="text-amber-600" aria-label={isCapture ? 'captures' : 'to'}>
              {isCapture ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              )}
            </span>
            <span className="bg-amber-100 px-2 py-1 rounded border border-amber-300">{to}</span>
            {isCheck && <span className="text-red-600 font-bold ml-1">+</span>}
          </div>
        </div>
        
        {/* Evaluation */}
        {evalText && (
          <div className={`font-mono font-bold text-lg ${evalColor}`}>
            {evalText}
          </div>
        )}
      </div>
      
      {/* Notation */}
      <div className="text-center font-mono text-xl font-bold text-amber-800 mb-2 py-2 bg-amber-100 rounded">
        {notation}
      </div>
      
      {/* Explanation */}
      <p className="text-sm text-gray-600 mb-3">{explanation}</p>
      
      {/* Play button */}
      {onPlay && (
        <button
          onClick={onPlay}
          className="w-full bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700 transition font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
        >
          Play This Move
        </button>
      )}
    </div>
  );
}
