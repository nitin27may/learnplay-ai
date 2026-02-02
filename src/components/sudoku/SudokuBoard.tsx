'use client';

import { GameState } from '@/lib/sudoku/types';
import { SudokuCell } from './SudokuCell';
import { AnnotationOverlay } from './AnnotationOverlay';
import { CellAnnotation } from '@/lib/sudoku/annotations';

interface SudokuBoardProps {
  gameState: GameState;
  onCellSelect: (row: number, col: number) => void;
  annotations?: CellAnnotation[];
  annotationMessage?: string;
  disabled?: boolean;
}

export function SudokuBoard({ gameState, onCellSelect, annotations = [], annotationMessage, disabled = false }: SudokuBoardProps) {
  const { grid, fixedCells, selectedCell, solution } = gameState;
  const cellSize = 64; // Should match w-16 (4rem = 64px)

  const isCellError = (row: number, col: number): boolean => {
    const value = grid[row][col];
    if (!value) return false;
    return value !== solution[row][col];
  };

  const isCellRelated = (row: number, col: number): boolean => {
    if (!selectedCell) return false;
    
    const sameRow = row === selectedCell.row;
    const sameCol = col === selectedCell.col;
    const sameBox = 
      Math.floor(row / 3) === Math.floor(selectedCell.row / 3) &&
      Math.floor(col / 3) === Math.floor(selectedCell.col / 3);

    return sameRow || sameCol || sameBox;
  };

  const isSameNumber = (row: number, col: number): boolean => {
    if (!selectedCell) return false;
    const selectedValue = grid[selectedCell.row][selectedCell.col];
    if (!selectedValue) return false;
    return grid[row][col] === selectedValue;
  };

  return (
    <div className="inline-block bg-gradient-to-br from-slate-700 to-slate-900 p-1.5 rounded-2xl shadow-2xl shadow-slate-900/30 relative">
      <div className="grid grid-cols-9 gap-0 bg-white rounded-xl overflow-hidden">
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <SudokuCell
              key={`${rowIndex}-${colIndex}`}
              row={rowIndex}
              col={colIndex}
              value={cell}
              isFixed={fixedCells[rowIndex][colIndex]}
              isSelected={
                selectedCell?.row === rowIndex && selectedCell?.col === colIndex
              }
              isError={isCellError(rowIndex, colIndex)}
              isSameNumber={isSameNumber(rowIndex, colIndex)}
              isRelated={isCellRelated(rowIndex, colIndex)}
              onClick={disabled ? undefined : () => onCellSelect(rowIndex, colIndex)}
            />
          ))
        )}
      </div>
      
      {annotations.length > 0 && (
        <AnnotationOverlay
          annotations={annotations}
          cellSize={cellSize}
          message={annotationMessage}
        />
      )}
    </div>
  );
}
