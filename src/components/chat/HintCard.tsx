'use client';

import React, { useState } from 'react';

interface HintCardProps {
  cell: { row: number; col: number };
  value: number;
  strategy: string;
  explanation: string;
  confidence?: 'high' | 'medium' | 'low';
  onApply?: () => void;
  onExplainMore?: () => void;
}

const confidenceColors = {
  high: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-orange-100 text-orange-800',
};

// Convert technical strategy names to user-friendly labels
const formatStrategyName = (strategy: string): string => {
  const strategyMap: Record<string, string> = {
    'naked_single': 'Naked Single',
    'hidden_single_row': 'Hidden Single (Row)',
    'hidden_single_col': 'Hidden Single (Column)',
    'hidden_single_box': 'Hidden Single (Box)',
    'naked_pair': 'Naked Pair',
    'hidden_pair': 'Hidden Pair',
    'pointing_pair': 'Pointing Pair',
    'box_line_reduction': 'Box-Line Reduction',
  };
  return strategyMap[strategy] || strategy.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export function HintCard({
  cell,
  value,
  strategy,
  explanation,
  confidence = 'high',
  onApply,
  onExplainMore,
}: HintCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [applied, setApplied] = useState(false);
  const displayExplanation = expanded ? explanation : `${explanation.slice(0, 100)}${explanation.length > 100 ? '...' : ''}`;

  const handleApply = () => {
    if (onApply && !applied) {
      onApply();
      setApplied(true);
    }
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 my-2" role="article" aria-label="Hint suggestion">
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold text-blue-800">{formatStrategyName(strategy)}</span>
        <span className={`px-2 py-1 text-xs rounded-full ${confidenceColors[confidence]}`}>
          {confidence} confidence
        </span>
      </div>
      
      <div className="flex items-center gap-4 mb-3">
        <div className="bg-white border-2 border-blue-300 rounded-lg p-3 text-center">
          <div className="text-xs text-gray-500">Cell</div>
          <div className="font-mono text-lg">R{cell.row + 1}C{cell.col + 1}</div>
        </div>
        <div className="text-2xl text-gray-400" aria-hidden="true">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </div>
        <div className="bg-blue-600 text-white rounded-lg p-3 text-center min-w-[60px]">
          <div className="text-xs opacity-75">Value</div>
          <div className="text-2xl font-bold">{value}</div>
        </div>
      </div>
      
      <div className="text-sm text-gray-600 mb-3">
        {displayExplanation}
        {explanation.length > 100 && (
          <button 
            onClick={() => setExpanded(!expanded)}
            className="text-blue-600 ml-1 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
          >
            {expanded ? 'Show less' : 'Show more'}
          </button>
        )}
      </div>
      
      <div className="flex gap-2">
        {onApply && (
          <button
            onClick={handleApply}
            disabled={applied}
            className={`flex-1 px-4 py-2 rounded-md transition font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center justify-center gap-2 ${
              applied
                ? 'bg-green-600 text-white cursor-default focus:ring-green-500'
                : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
            }`}
          >
            {applied ? (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Applied
              </>
            ) : (
              'Apply to Board'
            )}
          </button>
        )}
        {onExplainMore && (
          <button
            onClick={onExplainMore}
            className="px-4 py-2 border border-blue-300 text-blue-600 rounded-md hover:bg-blue-50 transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Explain More
          </button>
        )}
      </div>
    </div>
  );
}
