'use client';

import { GameState, Difficulty } from '@/lib/sudoku/types';
import { motion } from 'framer-motion';

interface GameControlsProps {
  gameState: GameState;
  onNewGame: (difficulty: Difficulty) => void;
  onReset: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onHint: () => void;
  canUndo: boolean;
  canRedo: boolean;
  isPaused: boolean;
  onPauseResume: () => void;
  onStop: () => void;
}

export function GameControls({
  gameState,
  onNewGame,
  onReset,
  onUndo,
  onRedo,
  onHint,
  canUndo,
  canRedo,
  isPaused,
  onPauseResume,
  onStop,
}: GameControlsProps) {
  const formatTime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const difficulties: Difficulty[] = ['easy', 'medium', 'hard', 'expert'];

  return (
    <div className="flex flex-col gap-4 p-6 bg-white rounded-lg shadow-lg">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 text-center">
        <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200">
          <div className="text-xs text-gray-600 font-semibold uppercase tracking-wide">Time</div>
          <div className="text-3xl font-bold text-blue-600 mt-1">
            {formatTime(gameState.elapsedTime)}
          </div>
        </div>
        <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border-2 border-purple-200">
          <div className="text-xs text-gray-600 font-semibold uppercase tracking-wide">Mistakes</div>
          <div className="text-3xl font-bold text-purple-600 mt-1">
            {gameState.mistakes}
          </div>
        </div>
        <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border-2 border-green-200">
          <div className="text-xs text-gray-600 font-semibold uppercase tracking-wide">Hints Used</div>
          <div className="text-3xl font-bold text-green-600 mt-1">
            {gameState.hintsUsed}
          </div>
        </div>
        <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border-2 border-orange-200">
          <div className="text-xs text-gray-600 font-semibold uppercase tracking-wide">Difficulty</div>
          <div className="text-2xl font-bold text-orange-600 mt-1 capitalize">
            {gameState.difficulty}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <ControlButton
          onClick={onUndo}
          disabled={!canUndo || isPaused}
          label="Undo"
        />
        <ControlButton
          onClick={onRedo}
          disabled={!canRedo || isPaused}
          label="Redo"
        />
        <ControlButton
          onClick={onHint}
          disabled={gameState.isComplete || isPaused}
          label="Hint"
          variant="accent"
        />
      </div>

      {/* Game Control Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <ControlButton
          onClick={onPauseResume}
          disabled={gameState.isComplete}
          label={isPaused ? "Resume" : "Pause"}
          variant="secondary"
        />
        <ControlButton
          onClick={onStop}
          disabled={gameState.isComplete}
          label="Stop"
          variant="secondary"
        />
      </div>

      <ControlButton
        onClick={onReset}
        disabled={gameState.isComplete || isPaused}
        label="Reset"
        variant="secondary"
      />

      {/* Difficulty Selector */}
      <div className="border-t pt-4">
        <div className="text-sm font-semibold text-gray-700 mb-2">New Game</div>
        <div className="grid grid-cols-2 gap-2">
          {difficulties.map((diff) => (
            <motion.button
              key={diff}
              className={`
                py-2 px-3 rounded-lg font-medium text-sm
                ${gameState.difficulty === diff
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                transition-colors capitalize
              `}
              onClick={() => onNewGame(diff)}
              whileTap={{ scale: 0.95 }}
            >
              {diff}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Completion Message */}
      {gameState.isComplete && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="p-4 bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-lg text-center"
        >
          <div className="text-xl font-bold mb-1">Congratulations!</div>
          <div className="text-sm">
            Completed in {formatTime(gameState.elapsedTime)}
          </div>
        </motion.div>
      )}
    </div>
  );
}

interface ControlButtonProps {
  onClick: () => void;
  disabled?: boolean;
  label: string;
  variant?: 'primary' | 'secondary' | 'accent';
}

function ControlButton({
  onClick,
  disabled,
  label,
  variant = 'primary'
}: ControlButtonProps) {
  return (
    <motion.button
      className={`
        flex-1 py-2.5 rounded-lg font-medium text-sm
        ${disabled
          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
          : variant === 'primary'
          ? 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
          : variant === 'accent'
          ? 'bg-blue-500 text-white hover:bg-blue-600'
          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}
        transition-colors
      `}
      onClick={onClick}
      disabled={disabled}
      whileTap={disabled ? {} : { scale: 0.95 }}
    >
      {label}
    </motion.button>
  );
}
