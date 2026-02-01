'use client';

import { useSudokuGame, useKeyboardInput } from '@/lib/sudoku/hooks';
import { SudokuBoard } from './SudokuBoard';
import { NumberPad } from './NumberPad';
import { GameControls } from './GameControls';
import { Difficulty } from '@/lib/sudoku/types';
import { CellAnnotation } from '@/lib/sudoku/annotations';
import { useEffect, useState } from 'react';

interface SudokuGameProps {
  initialDifficulty?: Difficulty;
  annotations?: CellAnnotation[];
  annotationMessage?: string;
  onGridChange?: (grid: (number | null)[][]) => void;
}

export function SudokuGame({ initialDifficulty = 'medium', annotations = [], annotationMessage, onGridChange }: SudokuGameProps) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    gameState,
    selectCell,
    placeNumber,
    useHint,
    undo,
    redo,
    resetGame,
    newGame,
    canUndo,
    canRedo
  } = useSudokuGame(initialDifficulty);

  useKeyboardInput(placeNumber, selectCell, gameState.selectedCell);

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
      <div className="w-full py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">
              Sudoku Master
            </h1>
            <p className="text-gray-600">
              Train your logic with AI-powered teaching
            </p>
          </div>
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading puzzle...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">
            Sudoku Master
          </h1>
          <p className="text-gray-600">
            Train your logic with AI-powered teaching
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-start justify-center">
          {/* Game Board */}
          <div className="flex justify-center">
            <SudokuBoard
              gameState={gameState}
              onCellSelect={selectCell}
              annotations={annotations}
              annotationMessage={annotationMessage}
            />
          </div>

          {/* Number Pad */}
          <div className="flex justify-center lg:justify-start">
            <NumberPad
              onNumberSelect={placeNumber}
              disabled={isDisabled}
            />
          </div>

          {/* Controls */}
          <div className="flex justify-center lg:justify-start">
            <GameControls
              gameState={gameState}
              onNewGame={newGame}
              onReset={resetGame}
              onUndo={undo}
              onRedo={redo}
              onHint={useHint}
              canUndo={canUndo}
              canRedo={canRedo}
            />
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold text-gray-800 mb-3">How to Play</h2>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">▸</span>
              <span>Click a cell to select it, then use the number pad or keyboard (1-9) to place numbers</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">▸</span>
              <span>Use arrow keys to navigate between cells</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">▸</span>
              <span>Press Delete or Backspace to clear a cell</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">▸</span>
              <span>Each row, column, and 3x3 box must contain digits 1-9 without repetition</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">▸</span>
              <span>Click Hint if you need help, but use sparingly for the best score!</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
