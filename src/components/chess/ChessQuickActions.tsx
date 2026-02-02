'use client';

export function ChessQuickActions() {
  const quickActions = [
    { label: '📚 Learn Chess Basics', message: 'Learn chess basics' },
    { label: '💡 Suggest Move', message: 'Suggest a good move' },
    { label: '🤖 AI Opponent', message: 'Make an AI move' },
    { label: '📊 Analyze Position', message: 'Analyze position' },
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <h3 className="text-lg font-semibold mb-3">Ask the Tutor</h3>
      <div className="grid grid-cols-1 gap-2">
        {quickActions.map((action, idx) => (
          <div
            key={idx}
            className="px-4 py-2 bg-amber-50 text-amber-900 rounded-lg text-sm font-medium border border-amber-200"
          >
            {action.label}
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-500 mt-3">
        Type these in the chat sidebar →
      </p>
    </div>
  );
}
