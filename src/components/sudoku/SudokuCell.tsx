'use client';

import { CellValue } from '@/lib/sudoku/types';
import { motion } from 'framer-motion';

interface SudokuCellProps {
  row: number;
  col: number;
  value: CellValue;
  isFixed: boolean;
  isSelected: boolean;
  isError: boolean;
  isSameNumber: boolean;
  isRelated: boolean;
  onClick?: () => void;
}

export function SudokuCell({
  row,
  col,
  value,
  isFixed,
  isSelected,
  isError,
  isSameNumber,
  isRelated,
  onClick
}: SudokuCellProps) {
  const isRightBorder = col === 2 || col === 5;
  const isBottomBorder = row === 2 || row === 5;

  return (
    <motion.button
      className={`
        w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center
        text-xl sm:text-2xl font-semibold transition-all duration-200
        ${isFixed ? 'text-slate-800 font-bold' : 'text-indigo-600'}
        ${isSelected ? 'bg-gradient-to-br from-indigo-200 to-purple-200 ring-2 ring-inset ring-indigo-500 relative z-10' : ''}
        ${isError ? 'bg-rose-100 text-rose-600' : ''}
        ${isSameNumber && !isSelected ? 'bg-indigo-50' : ''}
        ${isRelated && !isSelected && !isSameNumber ? 'bg-slate-50' : ''}
        ${!isSelected && !isError && !isSameNumber && !isRelated ? 'bg-white hover:bg-slate-50' : ''}
        border-r border-b border-slate-300
        ${isRightBorder ? 'border-r-[3px] border-r-slate-700' : ''}
        ${isBottomBorder ? 'border-b-[3px] border-b-slate-700' : ''}
        ${col === 0 ? 'border-l-[3px] border-l-slate-700' : ''}
        ${row === 0 ? 'border-t-[3px] border-t-slate-700' : ''}
        ${col === 8 ? 'border-r-[3px] border-r-slate-700' : ''}
        ${row === 8 ? 'border-b-[3px] border-b-slate-700' : ''}
      `}
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      animate={{
        scale: isSelected ? 1.05 : 1
      }}
    >
      {value && <span className="drop-shadow-sm">{value}</span>}
    </motion.button>
  );
}
