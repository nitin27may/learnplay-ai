'use client';

import { motion } from 'framer-motion';

interface VoiceControlsProps {
  isListening: boolean;
  isSpeaking: boolean;
  isSupported: boolean;
  onStartListening: () => void;
  onStopListening: () => void;
  onStopSpeaking: () => void;
}

export function VoiceControls({
  isListening,
  isSpeaking,
  isSupported,
  onStartListening,
  onStopListening,
  onStopSpeaking,
}: VoiceControlsProps) {
  if (!isSupported) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
        Voice mode is not supported in your browser. Try Chrome or Edge.
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      {/* Microphone Button */}
      <motion.button
        className={`
          relative w-12 h-12 rounded-full flex items-center justify-center shadow-md
          transition-all duration-300
          ${isListening 
            ? 'bg-red-500 hover:bg-red-600 ring-4 ring-red-200' 
            : 'bg-blue-500 hover:bg-blue-600'}
          ${isSpeaking ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onClick={isListening ? onStopListening : onStartListening}
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.05 }}
        disabled={isSpeaking}
        title={isListening ? 'Stop recording' : 'Start recording'}
      >
        {isListening ? (
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
            <rect x="7" y="6" width="6" height="8" rx="1" />
          </svg>
        ) : (
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M7 4a3 3 0 016 0v6a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" />
          </svg>
        )}
      </motion.button>

      {/* Speaker Button */}
      {isSpeaking && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-12 h-12 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center shadow-md"
          onClick={onStopSpeaking}
          whileTap={{ scale: 0.9 }}
          title="Stop playback"
        >
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
            <rect x="6" y="6" width="8" height="8" rx="1" />
          </svg>
        </motion.button>
      )}

      {/* Status Text */}
      <div className="text-sm min-w-[100px]">
        {isListening && (
          <p className="text-red-600 font-medium">Recording...</p>
        )}
        {isSpeaking && (
          <p className="text-green-600 font-medium">Playing...</p>
        )}
        {!isListening && !isSpeaking && (
          <p className="text-gray-500">Ready</p>
        )}
      </div>
    </div>
  );
}
