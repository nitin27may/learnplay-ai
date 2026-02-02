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
    <div className="flex flex-col gap-4 p-4 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50">
      <div className="grid grid-cols-3 gap-3">
        {numbers.map((num) => (
          <motion.button
            key={num}
            className={`
              w-16 h-16 rounded-xl text-2xl font-bold shadow-lg
              transition-all duration-200
              ${disabled 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-2 border-slate-200' 
                : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 hover:shadow-xl hover:shadow-indigo-500/30'}
            `}
            onClick={() => !disabled && onNumberSelect(num)}
            whileTap={disabled ? {} : { scale: 0.9 }}
            whileHover={disabled ? {} : { scale: 1.05, y: -2 }}
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
            ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-2 border-slate-200'
            : 'bg-gradient-to-r from-rose-500 to-pink-600 text-white hover:from-rose-600 hover:to-pink-700 hover:shadow-xl hover:shadow-rose-500/30'}
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
