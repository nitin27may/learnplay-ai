'use client';

import React, { useState } from 'react';

interface CellSelectionQuizProps {
  question: string;
  hint?: string;
  correctCell: { row: number; col: number };
  grid?: (number | null)[][];
  onCellSelect: (row: number, col: number) => void;
}

export function CellSelectionQuiz({
  question,
  hint,
  correctCell,
  grid,
  onCellSelect,
}: CellSelectionQuizProps) {
  const [selected, setSelected] = useState<{ row: number; col: number } | null>(null);
  const [answered, setAnswered] = useState(false);

  const handleSelect = (row: number, col: number) => {
    if (answered) return;
    setSelected({ row, col });
    setAnswered(true);
    onCellSelect(row, col);
  };

  const isCorrect = selected?.row === correctCell.row && selected?.col === correctCell.col;

  // Create a simple 9x9 grid representation
  const renderGrid = () => {
    const rows = [];
    for (let r = 0; r < 9; r++) {
      const cells = [];
      for (let c = 0; c < 9; c++) {
        const isSelected = selected?.row === r && selected?.col === c;
        const isCorrectCell = correctCell.row === r && correctCell.col === c;
        const value = grid?.[r]?.[c];
        const isEmpty = value === null || value === undefined || value === 0;
        
        let className = "w-7 h-7 text-xs font-mono flex items-center justify-center border transition ";
        
        // Add thicker borders for 3x3 boxes
        if (c % 3 === 0) className += "border-l-2 ";
        if (c === 8) className += "border-r-2 ";
        if (r % 3 === 0) className += "border-t-2 ";
        if (r === 8) className += "border-b-2 ";
        
        if (!answered) {
          if (isEmpty) {
            className += "bg-white hover:bg-blue-100 cursor-pointer border-gray-300";
          } else {
            className += "bg-gray-100 text-gray-600 border-gray-300";
          }
        } else if (isCorrectCell) {
          className += "bg-green-200 border-green-500 text-green-800";
        } else if (isSelected && !isCorrect) {
          className += "bg-red-200 border-red-500 text-red-800";
        } else {
          className += "bg-gray-50 border-gray-200 text-gray-400";
        }
        
        cells.push(
          <button
            key={`${r}-${c}`}
            onClick={() => isEmpty && handleSelect(r, c)}
            disabled={answered || !isEmpty}
            className={className}
            aria-label={`Row ${r + 1}, Column ${c + 1}${value ? `, value ${value}` : ', empty'}`}
          >
            {value || ''}
          </button>
        );
      }
      rows.push(
        <div key={r} className="flex">
          {cells}
        </div>
      );
    }
    return rows;
  };

  return (
    <div className="bg-sky-50 border border-sky-200 rounded-lg p-4 my-2" role="region" aria-label="Cell selection quiz">
      <div className="font-semibold text-sky-800 mb-2">{question}</div>
      
      {hint && (
        <div className="text-sm text-gray-600 mb-3 italic">{hint}</div>
      )}
      
      {/* Mini grid */}
      <div className="flex justify-center mb-3">
        <div className="inline-block border-2 border-gray-800 rounded">
          {renderGrid()}
        </div>
      </div>
      
      {/* Feedback */}
      {answered && (
        <div 
          className={`p-2 rounded text-sm ${isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
          role="alert"
        >
          {isCorrect 
            ? 'Correct! Great job!' 
            : `Not quite. The correct cell is R${correctCell.row + 1}C${correctCell.col + 1}.`
          }
        </div>
      )}
    </div>
  );
}
