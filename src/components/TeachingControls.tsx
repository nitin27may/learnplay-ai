'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface InteractiveButton {
  label: string;
  action: string;
  icon?: string;
}

interface TeachingControlsProps {
  step: number;
  onAction: (action: string) => void;
}

export function TeachingControls({ step, onAction }: TeachingControlsProps) {
  const buttons: InteractiveButton[] = [
    { label: 'Next Step', action: 'Continue to next step', icon: '➡️' },
    { label: 'Explain More', action: 'Explain this step in more detail', icon: '💡' },
    { label: 'Try Another', action: 'Show me a different example', icon: '🎯' },
    { label: 'Show Solution', action: 'Show me the solution', icon: '✅' },
  ];

  if (step === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed bottom-24 right-8 bg-white rounded-lg shadow-2xl p-4 border-2 border-blue-500"
      >
        <p className="text-sm font-semibold text-gray-700 mb-3">
          Step {step} - What would you like to do?
        </p>
        <div className="grid grid-cols-2 gap-2">
          {buttons.map((button) => (
            <motion.button
              key={button.label}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
              onClick={() => onAction(button.action)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {button.icon && <span>{button.icon}</span>}
              {button.label}
            </motion.button>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
