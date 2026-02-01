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
  onClick: () => void;
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
        ${isFixed ? 'text-gray-900 font-bold' : 'text-blue-600'}
        ${isSelected ? 'bg-blue-200 ring-2 ring-inset ring-blue-500 relative z-10' : ''}
        ${isError ? 'bg-red-100 text-red-600' : ''}
        ${isSameNumber && !isSelected ? 'bg-blue-50' : ''}
        ${isRelated && !isSelected && !isSameNumber ? 'bg-gray-100' : ''}
        ${!isSelected && !isError && !isSameNumber && !isRelated ? 'bg-white hover:bg-gray-50' : ''}
        border-r border-b border-gray-400
        ${isRightBorder ? 'border-r-4 border-r-gray-900' : ''}
        ${isBottomBorder ? 'border-b-4 border-b-gray-900' : ''}
        ${col === 0 ? 'border-l-4 border-l-gray-900' : ''}
        ${row === 0 ? 'border-t-4 border-t-gray-900' : ''}
        ${col === 8 ? 'border-r-4 border-r-gray-900' : ''}
        ${row === 8 ? 'border-b-4 border-b-gray-900' : ''}
      `}
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      animate={{
        scale: isSelected ? 1.05 : 1
      }}
    >
      {value && <span>{value}</span>}
    </motion.button>
  );
}
