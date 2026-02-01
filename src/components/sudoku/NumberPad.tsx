'use client';

import { CellValue } from '@/lib/sudoku/types';
import { motion } from 'framer-motion';

interface NumberPadProps {
  onNumberSelect: (value: CellValue) => void;
  disabled?: boolean;
}

export function NumberPad({ onNumberSelect, disabled }: NumberPadProps) {
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-3">
        {numbers.map((num) => (
          <motion.button
            key={num}
            className={`
              w-16 h-16 rounded-xl text-2xl font-bold shadow-lg
              transition-all duration-200
              ${disabled 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50' 
                : 'bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700 hover:shadow-xl'}
            `}
            onClick={() => !disabled && onNumberSelect(num)}
            whileTap={disabled ? {} : { scale: 0.9 }}
            whileHover={disabled ? {} : { scale: 1.05 }}
            disabled={disabled}
          >
            {num}
          </motion.button>
        ))}
      </div>
      
      <motion.button
        className={`
          w-full py-4 rounded-xl text-lg font-bold shadow-lg
          transition-all duration-200
          ${disabled
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50'
            : 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700 hover:shadow-xl'}
        `}
        onClick={() => !disabled && onNumberSelect(null)}
        whileTap={disabled ? {} : { scale: 0.95 }}
        whileHover={disabled ? {} : { scale: 1.02 }}
        disabled={disabled}
      >
        Clear
      </motion.button>
    </div>
  );
}
