'use client';

import React from 'react';

interface AnalysisCardProps {
  isLoading?: boolean;
  strategies?: string[];
  difficulty?: 'easy' | 'medium' | 'hard' | 'expert';
  emptyCount?: number;
  message?: string;
}

const difficultyColors = {
  easy: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  hard: 'bg-orange-100 text-orange-800',
  expert: 'bg-red-100 text-red-800',
};

export function AnalysisCard({
  isLoading = false,
  strategies = [],
  difficulty,
  emptyCount,
  message,
}: AnalysisCardProps) {
  if (isLoading) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 my-2">
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            <span className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <span className="text-sm text-gray-600">Analyzing puzzle...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 my-2" role="article" aria-label="Puzzle analysis">
      <div className="flex items-center justify-between mb-3">
        <span className="font-semibold text-indigo-800 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Puzzle Analysis
        </span>
        {difficulty && (
          <span className={`px-2 py-1 text-xs rounded-full font-medium ${difficultyColors[difficulty]}`}>
            {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
          </span>
        )}
      </div>

      {emptyCount !== undefined && (
        <div className="mb-3 text-sm text-gray-600">
          <span className="font-medium">{emptyCount}</span> cells remaining to solve
        </div>
      )}

      {message && (
        <p className="text-sm text-gray-700 mb-3">{message}</p>
      )}

      {strategies.length > 0 && (
        <div>
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
            Applicable Strategies
          </div>
          <div className="flex flex-wrap gap-2">
            {strategies.map((strategy, index) => (
              <span 
                key={index}
                className="px-2 py-1 bg-white border border-indigo-200 rounded text-sm text-indigo-700"
              >
                {strategy}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
