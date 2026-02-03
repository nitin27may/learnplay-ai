'use client';

import React, { useState } from 'react';

interface OpeningCardProps {
  name: string;
  moves: string[];
  description: string;
  eco?: string;
}

export function OpeningCard({
  name,
  moves,
  description,
  eco,
}: OpeningCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 my-2" role="article" aria-label={`Chess opening: ${name}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <span className="font-semibold text-slate-800">{name}</span>
        </div>
        {eco && (
          <span className="px-2 py-0.5 bg-slate-200 text-slate-700 rounded text-xs font-mono">
            {eco}
          </span>
        )}
      </div>
      
      {/* Move sequence */}
      <div className="mb-3">
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
          Move Sequence
        </div>
        <div className="flex flex-wrap gap-1">
          {moves.slice(0, expanded ? moves.length : 6).map((move, index) => (
            <span 
              key={index}
              className="px-2 py-1 bg-white border border-slate-200 rounded text-sm font-mono"
            >
              {Math.floor(index / 2) + 1}{index % 2 === 0 ? '.' : '...'} {move}
            </span>
          ))}
          {!expanded && moves.length > 6 && (
            <button
              onClick={() => setExpanded(true)}
              className="px-2 py-1 text-slate-600 text-sm hover:text-slate-800"
            >
              +{moves.length - 6} more
            </button>
          )}
        </div>
      </div>
      
      {/* Description */}
      <p className="text-sm text-gray-600">{description}</p>
      
      {expanded && (
        <button
          onClick={() => setExpanded(false)}
          className="mt-2 text-sm text-slate-600 hover:text-slate-800"
        >
          Show less
        </button>
      )}
    </div>
  );
}
