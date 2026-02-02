'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface TeachingProgressProps {
  isTeaching: boolean;
  isPaused: boolean;
  currentStep: string;
  totalSteps: number;
  currentStepNumber: number;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onNext: () => void;
}

export function TeachingProgress({
  isTeaching,
  isPaused,
  currentStep,
  totalSteps,
  currentStepNumber,
  onPause,
  onResume,
  onStop,
  onNext,
}: TeachingProgressProps) {
  if (!isTeaching) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-4 right-4 z-50 bg-white rounded-lg shadow-lg p-5 max-w-md border border-gray-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></div>
            <h3 className="font-semibold text-gray-900 text-sm">Teaching in Progress</h3>
          </div>
          <button
            onClick={onStop}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            title="Stop teaching"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-500 mb-2">
            <span className="font-medium">Step {currentStepNumber} of {totalSteps}</span>
            <span>{Math.round((currentStepNumber / totalSteps) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <motion.div
              className="bg-blue-500 h-1.5 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(currentStepNumber / totalSteps) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Current Step */}
        <div className="mb-4 p-3 bg-blue-50 rounded border border-blue-100">
          <p className="text-sm text-gray-700 leading-relaxed">{currentStep}</p>
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          {isPaused ? (
            <button
              onClick={onResume}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white text-sm font-medium py-2.5 px-4 rounded transition-colors"
            >
              Resume
            </button>
          ) : (
            <button
              onClick={onPause}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium py-2.5 px-4 rounded transition-colors"
            >
              Pause
            </button>
          )}
          <button
            onClick={onNext}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium py-2.5 px-4 rounded transition-colors"
          >
            Next Step
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
