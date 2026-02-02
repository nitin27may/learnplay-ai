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
  onTryMyself: () => void;
  isNextDisabled?: boolean;
  showHintPrompt?: boolean;
  onQuickHint?: () => void;
  onDismissHintPrompt?: () => void;
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
  onTryMyself,
  isNextDisabled = false,
  showHintPrompt = false,
  onQuickHint,
  onDismissHintPrompt,
}: TeachingProgressProps) {
  // Show "Need a hint?" prompt when user chose to try themselves
  if (showHintPrompt) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        className="fixed top-4 right-4 z-50 bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl shadow-emerald-500/10 p-5 max-w-sm border border-emerald-100 max-h-[90vh] overflow-auto"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
            <span className="text-xl">🎯</span>
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 text-sm">You're on your own!</h3>
            <p className="text-xs text-slate-500">Good luck solving the puzzle</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onQuickHint}
            className="flex-1 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white text-sm font-medium py-2.5 px-4 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
            </svg>
            Need a Hint?
          </button>
          <button
            onClick={onDismissHintPrompt}
            className="bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-medium py-2.5 px-4 rounded-xl transition-all border border-slate-200"
          >
            Dismiss
          </button>
        </div>
      </motion.div>
    );
  }

  if (!isTeaching) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        className="fixed top-4 right-4 z-50 bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl shadow-indigo-500/10 p-5 max-w-md border border-indigo-100 max-h-[90vh] overflow-auto"
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
            <span className="font-medium">Step {currentStepNumber} of {totalSteps > 50 ? '∞' : totalSteps}</span>
            <span className="font-semibold text-indigo-600">{totalSteps > 50 ? `${currentStepNumber} solved` : `${Math.round((currentStepNumber / totalSteps) * 100)}%`}</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <motion.div
              className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: totalSteps > 50 ? '100%' : `${(currentStepNumber / totalSteps) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Current Step */}
        <div className="mb-4 p-3 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
          <p className="text-sm text-slate-700 leading-relaxed">{currentStep}</p>
        </div>

        {/* Controls - Two options: Show Next Step or Try Myself */}
        <div className="space-y-2">
          <button
            onClick={onNext}
            disabled={isNextDisabled}
            className={`w-full text-white text-sm font-medium py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 ${
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
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                Show Next Step
              </>
            )}
          </button>
          <button
            onClick={onTryMyself}
            disabled={isNextDisabled}
            className="w-full bg-gradient-to-r from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 text-emerald-700 text-sm font-medium py-2.5 px-4 rounded-xl transition-all border border-emerald-200 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            I'll Try Myself
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
