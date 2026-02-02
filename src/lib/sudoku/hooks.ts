import { useState, useCallback, useEffect, useRef } from 'react';
import { GameState, Difficulty, SudokuMove, CellValue } from './types';
import { generatePuzzle, isPuzzleComplete } from './generator';
import { getHint } from './solver';

export function useSudokuGame(initialDifficulty: Difficulty = 'medium') {
  const [gameState, setGameState] = useState<GameState>(() => initializeGame(initialDifficulty));
  const [moveHistory, setMoveHistory] = useState<SudokuMove[]>([]);
  const [redoStack, setRedoStack] = useState<SudokuMove[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Timer
  useEffect(() => {
    if (!gameState.isComplete && !gameState.isPaused) {
      timerRef.current = setInterval(() => {
        setGameState(prev => ({
          ...prev,
          elapsedTime: Date.now() - prev.startTime
        }));
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState.isComplete, gameState.isPaused]);

  const selectCell = useCallback((row: number, col: number) => {
    setGameState(prev => ({
      ...prev,
      selectedCell: { row, col }
    }));
  }, []);

  const placeNumber = useCallback((value: CellValue) => {
    setGameState(prev => {
      const { selectedCell, grid, fixedCells, solution } = prev;
      
      if (!selectedCell || fixedCells[selectedCell.row][selectedCell.col]) {
        return prev;
      }

      const newGrid = grid.map(row => [...row]);
      const previousValue = newGrid[selectedCell.row][selectedCell.col];
      newGrid[selectedCell.row][selectedCell.col] = value;

      // Track move
      const move: SudokuMove = {
        row: selectedCell.row,
        col: selectedCell.col,
        value,
        previousValue,
        timestamp: Date.now()
      };

      setMoveHistory(history => [...history, move]);
      setRedoStack([]);

      // Check if move is incorrect
      let newMistakes = prev.mistakes;
      if (value !== null && value !== solution[selectedCell.row][selectedCell.col]) {
        newMistakes++;
      }

      const isComplete = isPuzzleComplete(newGrid);

      return {
        ...prev,
        grid: newGrid,
        mistakes: newMistakes,
        isComplete
      };
    });
  }, []);

  const useHint = useCallback(() => {
    setGameState(prev => {
      const hint = getHint(prev.grid, prev.solution);
      
      if (!hint) return prev;

      const newGrid = prev.grid.map(row => [...row]);
      newGrid[hint.row][hint.col] = hint.value;

      const move: SudokuMove = {
        row: hint.row,
        col: hint.col,
        value: hint.value,
        timestamp: Date.now()
      };

      setMoveHistory(history => [...history, move]);
      setRedoStack([]);

      return {
        ...prev,
        grid: newGrid,
        hintsUsed: prev.hintsUsed + 1,
        selectedCell: { row: hint.row, col: hint.col }
      };
    });
  }, []);

  const undo = useCallback(() => {
    if (moveHistory.length === 0) return;

    setGameState(prev => {
      const lastMove = moveHistory[moveHistory.length - 1];
      const newGrid = prev.grid.map(row => [...row]);
      
      // Find the previous value for this cell
      const previousMoves = moveHistory.slice(0, -1);
      const previousMove = previousMoves.reverse().find(
        m => m.row === lastMove.row && m.col === lastMove.col
      );
      
      newGrid[lastMove.row][lastMove.col] = previousMove?.value ?? null;

      setRedoStack(stack => [...stack, lastMove]);
      setMoveHistory(history => history.slice(0, -1));

      return {
        ...prev,
        grid: newGrid,
        isComplete: false
      };
    });
  }, [moveHistory]);

  const redo = useCallback(() => {
    if (redoStack.length === 0) return;

    setGameState(prev => {
      const moveToRedo = redoStack[redoStack.length - 1];
      const newGrid = prev.grid.map(row => [...row]);
      newGrid[moveToRedo.row][moveToRedo.col] = moveToRedo.value;

      setRedoStack(stack => stack.slice(0, -1));
      setMoveHistory(history => [...history, moveToRedo]);

      const isComplete = isPuzzleComplete(newGrid);

      return {
        ...prev,
        grid: newGrid,
        isComplete
      };
    });
  }, [redoStack]);

  const resetGame = useCallback(() => {
    setGameState(initializeGame(gameState.difficulty));
    setMoveHistory([]);
    setRedoStack([]);
  }, [gameState.difficulty]);

  const newGame = useCallback((difficulty: Difficulty) => {
    setGameState(initializeGame(difficulty));
    setMoveHistory([]);
    setRedoStack([]);
  }, []);

  return {
    gameState,
    selectCell,
    placeNumber,
    useHint,
    undo,
    redo,
    resetGame,
    newGame,
    moveHistory,
    canUndo: moveHistory.length > 0,
    canRedo: redoStack.length > 0
  };
}

function initializeGame(difficulty: Difficulty): GameState {
  const { puzzle, solution } = generatePuzzle(difficulty);
  
  const fixedCells = puzzle.map(row =>
    row.map(cell => cell !== null)
  );

  return {
    grid: puzzle,
    solution,
    fixedCells,
    selectedCell: null,
    mistakes: 0,
    hintsUsed: 0,
    startTime: Date.now(),
    elapsedTime: 0,
    isComplete: false,
    isPaused: false,
    difficulty
  };
}

export function useKeyboardInput(
  placeNumber: (value: CellValue) => void,
  selectCell: (row: number, col: number) => void,
  selectedCell: { row: number; col: number } | null
) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Number keys
      if (e.key >= '1' && e.key <= '9') {
        placeNumber(parseInt(e.key));
      }
      
      // Delete/Backspace to clear
      if (e.key === 'Delete' || e.key === 'Backspace') {
        placeNumber(null);
      }

      // Arrow keys for navigation
      if (selectedCell && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        let { row, col } = selectedCell;

        switch (e.key) {
          case 'ArrowUp':
            row = Math.max(0, row - 1);
            break;
          case 'ArrowDown':
            row = Math.min(8, row + 1);
            break;
          case 'ArrowLeft':
            col = Math.max(0, col - 1);
            break;
          case 'ArrowRight':
            col = Math.min(8, col + 1);
            break;
        }

        selectCell(row, col);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [placeNumber, selectCell, selectedCell]);
}
