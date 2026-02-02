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
  isNextDisabled?: boolean;
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
  isNextDisabled = false,
}: TeachingProgressProps) {
  if (!isTeaching) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        className="fixed top-4 right-4 z-50 bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl shadow-indigo-500/10 p-5 max-w-md border border-indigo-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"></div>
              <div className="absolute inset-0 w-3 h-3 rounded-full bg-indigo-500 animate-ping opacity-75"></div>
            </div>
            <h3 className="font-semibold text-slate-800 text-sm">Teaching in Progress</h3>
          </div>
          <button
            onClick={onStop}
            className="text-slate-400 hover:text-rose-500 transition-colors p-1.5 hover:bg-rose-50 rounded-lg"
            title="Stop teaching"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-slate-500 mb-2">
            <span className="font-medium">Step {currentStepNumber} of {totalSteps}</span>
            <span className="font-semibold text-indigo-600">{Math.round((currentStepNumber / totalSteps) * 100)}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <motion.div
              className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(currentStepNumber / totalSteps) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Current Step */}
        <div className="mb-4 p-3 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
          <p className="text-sm text-slate-700 leading-relaxed">{currentStep}</p>
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          {isPaused ? (
            <button
              onClick={onResume}
              className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-sm font-medium py-2.5 px-4 rounded-xl transition-all shadow-md hover:shadow-lg"
            >
              Resume
            </button>
          ) : (
            <button
              onClick={onPause}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium py-2.5 px-4 rounded-xl transition-all border border-slate-200"
            >
              Pause
            </button>
          )}
          <button
            onClick={onNext}
            disabled={isNextDisabled}
            className={`flex-1 text-white text-sm font-medium py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 ${
              isNextDisabled 
                ? 'bg-indigo-300 cursor-not-allowed' 
                : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-md hover:shadow-lg'
            }`}
          >
            {isNextDisabled ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Loading...
              </>
            ) : (
              'Next Step'
            )}
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
