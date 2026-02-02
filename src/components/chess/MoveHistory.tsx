'use client';

interface MoveHistoryProps {
  history: string[];
}

export function MoveHistory({ history }: MoveHistoryProps) {
  const movePairs: Array<{ white: string; black?: string }> = [];
  
  for (let i = 0; i < history.length; i += 2) {
    movePairs.push({
      white: history[i],
      black: history[i + 1],
    });
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 max-h-96 overflow-y-auto">
      <h3 className="text-lg font-semibold mb-3">Move History</h3>
      {movePairs.length === 0 ? (
        <p className="text-gray-500 text-sm">No moves yet</p>
      ) : (
        <div className="space-y-1">
          {movePairs.map((pair, idx) => (
            <div key={idx} className="flex gap-4 text-sm font-mono">
              <span className="text-gray-500 w-8">{idx + 1}.</span>
              <span className="w-16">{pair.white}</span>
              <span className="w-16">{pair.black || ''}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
