'use client';

import { useState, useCallback, useEffect } from 'react';
import { ChessBoard } from './ChessBoard';
import { MoveHistory } from './MoveHistory';
import { GameControls } from './GameControls';
import { ChessEngine } from '@/lib/chess/engine';
import type { Square } from '@/lib/chess/types';

export function ChessGame() {
  const [engine] = useState(() => new ChessEngine());
  const [position, setPosition] = useState(engine.getState().fen);
  const [history, setHistory] = useState<string[]>([]);
  const [orientation, setOrientation] = useState<'white' | 'black'>('white');
  const [gameStatus, setGameStatus] = useState('');

  const updateGameState = useCallback(() => {
    const state = engine.getState();
    setPosition(state.fen);
    setHistory(state.history);

    if (state.isCheckmate) {
      setGameStatus(`Checkmate! ${state.turn === 'w' ? 'Black' : 'White'} wins!`);
    } else if (state.isStalemate) {
      setGameStatus('Stalemate! Game is a draw.');
    } else if (state.isDraw) {
      setGameStatus('Draw!');
    } else if (state.isCheck) {
      setGameStatus('Check!');
    } else {
      setGameStatus('');
    }
  }, [engine]);

  const onPieceDrop = useCallback((sourceSquare: Square, targetSquare: Square): boolean => {
    const move = engine.move(sourceSquare, targetSquare);
    if (move) {
      updateGameState();
      return true;
    }
    return false;
  }, [engine, updateGameState]);

  const handleNewGame = useCallback(() => {
    engine.reset();
    updateGameState();
  }, [engine, updateGameState]);

  const handleUndo = useCallback(() => {
    engine.undo();
    updateGameState();
  }, [engine, updateGameState]);

  const handleFlipBoard = useCallback(() => {
    setOrientation(prev => prev === 'white' ? 'black' : 'white');
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
      <div className="lg:col-span-2">
        <ChessBoard
          position={position}
          onPieceDrop={onPieceDrop}
          boardOrientation={orientation}
        />
        {gameStatus && (
          <div className="mt-4 p-4 bg-blue-100 border border-blue-300 rounded-lg text-center">
            <p className="text-lg font-semibold text-blue-900">{gameStatus}</p>
          </div>
        )}
      </div>
      
      <div className="space-y-4">
        <GameControls
          onNewGame={handleNewGame}
          onUndo={handleUndo}
          onFlipBoard={handleFlipBoard}
          canUndo={history.length > 0}
          orientation={orientation}
        />
        <MoveHistory history={history} />
      </div>
    </div>
  );
}
