'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { CellAnnotation } from '@/lib/sudoku/annotations';

interface AnnotationOverlayProps {
  annotations: CellAnnotation[];
  cellSize: number;
  message?: string;
}

const colorClasses = {
  blue: 'bg-blue-400/40 border-blue-600',
  green: 'bg-green-400/40 border-green-600',
  yellow: 'bg-yellow-400/40 border-yellow-600',
  red: 'bg-red-400/40 border-red-600',
  purple: 'bg-purple-400/40 border-purple-600',
};

const labelColors = {
  blue: 'bg-blue-600 text-white',
  green: 'bg-green-600 text-white',
  yellow: 'bg-yellow-600 text-white',
  red: 'bg-red-600 text-white',
  purple: 'bg-purple-600 text-white',
};

export function AnnotationOverlay({ annotations, cellSize, message }: AnnotationOverlayProps) {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <AnimatePresence>
        {annotations.map((annotation, idx) => {
          const top = annotation.row * cellSize;
          const left = annotation.col * cellSize;

          return (
            <motion.div
              key={`${annotation.row}-${annotation.col}-${idx}`}
              className={`absolute ${colorClasses[annotation.color]} border-4 rounded-lg`}
              style={{
                top: `${top}px`,
                left: `${left}px`,
                width: `${cellSize}px`,
                height: `${cellSize}px`,
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.1 }}
            >
              {annotation.type === 'circle' && (
                <div className="absolute inset-2 border-4 rounded-full" 
                     style={{ borderColor: 'currentColor' }} />
              )}
              
              {annotation.type === 'cross' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-full h-1 bg-current transform rotate-45" />
                  <div className="w-full h-1 bg-current transform -rotate-45 absolute" />
                </div>
              )}

              {annotation.label && (
                <motion.div
                  className={`absolute -top-6 left-1/2 transform -translate-x-1/2 
                            ${labelColors[annotation.color]} px-2 py-1 rounded text-xs font-bold
                            whitespace-nowrap shadow-lg`}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: idx * 0.1 + 0.2 }}
                >
                  {annotation.label}
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>

      {message && (
        <motion.div
          className="absolute -bottom-20 left-0 right-0 bg-white border-2 border-blue-500 
                     rounded-lg p-3 shadow-xl pointer-events-auto z-10 mx-2"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
        >
          <p className="text-sm font-medium text-gray-800">{message}</p>
        </motion.div>
      )}
    </div>
  );
}
