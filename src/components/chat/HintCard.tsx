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
  const displayExplanation = expanded ? explanation : `${explanation.slice(0, 100)}${explanation.length > 100 ? '...' : ''}`;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 my-2" role="article" aria-label="Hint suggestion">
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold text-blue-800">{strategy}</span>
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
            onClick={onApply}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Apply to Board
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
