'use client';

import { useSudokuGame, useKeyboardInput } from '@/lib/sudoku/hooks';
import { SudokuBoard } from './SudokuBoard';
import { NumberPad } from './NumberPad';
import { GameControls } from './GameControls';
import { Difficulty } from '@/lib/sudoku/types';
import { CellAnnotation } from '@/lib/sudoku/annotations';
import { useEffect, useState, useRef } from 'react';

interface ExternalCellUpdate {
  row: number;
  col: number;
  value: number | null;
  timestamp: number; // Used to detect new updates
}

interface SudokuGameProps {
  initialDifficulty?: Difficulty;
  annotations?: CellAnnotation[];
  annotationMessage?: string;
  onGridChange?: (grid: (number | null)[][]) => void;
  externalCellUpdate?: ExternalCellUpdate | null;
}

export function SudokuGame({ initialDifficulty = 'medium', annotations = [], annotationMessage, onGridChange, externalCellUpdate }: SudokuGameProps) {
  const [mounted, setMounted] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameIsPaused, setGameIsPaused] = useState(false);
  const lastExternalUpdateRef = useRef<number>(0);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    gameState,
    selectCell,
    placeNumber,
    placeNumberAt,
    useHint,
    undo,
    redo,
    resetGame,
    newGame,
    canUndo,
    canRedo
  } = useSudokuGame(initialDifficulty);

  useKeyboardInput(placeNumber, selectCell, gameState.selectedCell);

  // Handle external cell updates from AI
  useEffect(() => {
    if (externalCellUpdate && externalCellUpdate.timestamp > lastExternalUpdateRef.current) {
      console.log('[AI] Placing number:', externalCellUpdate);
      lastExternalUpdateRef.current = externalCellUpdate.timestamp;
      placeNumberAt(externalCellUpdate.row, externalCellUpdate.col, externalCellUpdate.value);
    }
  }, [externalCellUpdate, placeNumberAt]);

  // Notify parent when grid changes
  useEffect(() => {
    if (mounted && onGridChange) {
      onGridChange(gameState.grid);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState.grid, mounted]);

  const isDisabled = gameState.isComplete || 
    !gameState.selectedCell || 
    gameState.fixedCells[gameState.selectedCell.row][gameState.selectedCell.col];

  if (!mounted) {
    return (
      <div className="w-full min-h-screen py-8 px-4 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
              Sudoku Master
            </h1>
            <p className="text-slate-600 text-lg">
              Train your logic with AI-powered teaching
            </p>
          </div>
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600 mx-auto mb-4"></div>
                <div className="absolute inset-0 rounded-full blur-xl bg-indigo-400/30 animate-pulse"></div>
              </div>
              <p className="text-slate-600 font-medium">Loading puzzle...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen py-6 px-4 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
            Sudoku Master
          </h1>
          <p className="text-slate-600 text-lg">
            Train your logic with AI-powered teaching
          </p>
        </div>

        {!gameStarted ? (
          <div className="flex flex-col items-center justify-center gap-8 py-16">
            <div className="text-center">
              <h2 className="text-3xl font-semibold text-slate-700 mb-3">Ready to Play?</h2>
              <p className="text-slate-500 text-lg mb-8">Choose a difficulty level to begin</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl w-full px-4">
              {(['easy', 'medium', 'hard', 'expert'] as Difficulty[]).map((diff, index) => {
                const gradients = [
                  'from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700',
                  'from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700',
                  'from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700',
                  'from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700',
                ];
                const labels = ['Easy', 'Medium', 'Hard', 'Expert'];
                const icons = ['😊', '🙂', '😐', '😤'];
                return (
                  <button
                    key={diff}
                    className={`py-8 px-6 rounded-2xl font-bold text-xl bg-gradient-to-br ${gradients[index]} text-white transition-all shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 flex flex-col items-center gap-2`}
                    onClick={() => {
                      setGameStarted(true);
                      newGame(diff);
                    }}
                  >
                    <span className="text-3xl">{icons[index]}</span>
                    <span>{labels[index]}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6">
            {/* Game Board with integrated controls */}
            <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-6 border border-white/50">
              <div className="flex flex-col items-center gap-6">
                {/* Board */}
                <SudokuBoard
                  gameState={gameState}
                  onCellSelect={gameIsPaused ? () => {} : selectCell}
                  annotations={annotations}
                  annotationMessage={annotationMessage}
                  disabled={gameIsPaused}
                />

                {/* Number Pad - centered below board */}
                <NumberPad
                  onNumberSelect={placeNumber}
                  disabled={isDisabled || gameIsPaused}
                />
              </div>
            </div>

            {/* Compact Controls Panel */}
            <div className="w-full max-w-2xl">
              <GameControls
                gameState={gameState}
                onNewGame={newGame}
                onReset={resetGame}
                onUndo={undo}
                onRedo={redo}
                onHint={useHint}
                canUndo={canUndo}
                canRedo={canRedo}
                isPaused={gameIsPaused}
                onPauseResume={() => setGameIsPaused(!gameIsPaused)}
                onStop={() => {
                  setGameStarted(false);
                  setGameIsPaused(false);
                }}
              />
            </div>

            {/* Instructions - Compact */}
            <div className="w-full max-w-3xl bg-white/70 backdrop-blur-sm p-5 rounded-2xl shadow-lg border border-white/40">
              <h2 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                <span className="text-xl">?</span> How to Play
              </h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-slate-600">
                <li className="flex items-start">
                  <span className="text-indigo-500 mr-2 font-bold">•</span>
                  <span>Click a cell to select it, then use the number pad or keyboard (1-9) to place numbers</span>
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-500 mr-2 font-bold">•</span>
                  <span>Use arrow keys to navigate between cells</span>
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-500 mr-2 font-bold">•</span>
                  <span>Press Delete or Backspace to clear a cell</span>
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-500 mr-2 font-bold">•</span>
                  <span>Each row, column, and 3x3 box must contain digits 1-9 without repetition</span>
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-500 mr-2 font-bold">•</span>
                  <span>Click Hint if you need help, but use sparingly for the best score!</span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
