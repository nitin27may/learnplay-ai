'use client';

interface GameControlsProps {
  onNewGame: () => void;
  onUndo: () => void;
  onFlipBoard: () => void;
  canUndo: boolean;
  orientation: 'white' | 'black';
}

export function GameControls({
  onNewGame,
  onUndo,
  onFlipBoard,
  canUndo,
  orientation,
}: GameControlsProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <h3 className="text-lg font-semibold mb-3">Game Controls</h3>
      <div className="flex flex-col gap-2">
        <button
          onClick={onNewGame}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          New Game
        </button>
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Undo Move
        </button>
        <button
          onClick={onFlipBoard}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Flip Board ({orientation})
        </button>
      </div>
    </div>
  );
}
