'use client';

interface MoveHistoryProps {
  history: string[];
  playerNames?: string[]; // Names for each move (e.g., 'Player', 'Computer', 'AI')
}

export function MoveHistory({ history, playerNames = [] }: MoveHistoryProps) {
  const movePairs: Array<{ white: string; black?: string; whiteName?: string; blackName?: string }> = [];
  
  for (let i = 0; i < history.length; i += 2) {
    movePairs.push({
      white: history[i],
      black: history[i + 1],
      whiteName: playerNames[i],
      blackName: playerNames[i + 1],
    });
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 max-h-96 overflow-y-auto">
      <h3 className="text-lg font-semibold mb-3">Move History</h3>
      {movePairs.length === 0 ? (
        <p className="text-gray-500 text-sm">No moves yet</p>
      ) : (
        <div className="space-y-2">
          {movePairs.map((pair, idx) => (
            <div key={idx} className="text-sm">
              <div className="flex gap-2 items-center">
                <span className="text-gray-500 font-mono w-8">{idx + 1}.</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold">{pair.white}</span>
                    {pair.whiteName && (
                      <span className="text-xs text-gray-500">({pair.whiteName})</span>
                    )}
                  </div>
                  {pair.black && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-mono font-semibold">{pair.black}</span>
                      {pair.blackName && (
                        <span className="text-xs text-gray-500">({pair.blackName})</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
