'use client';

import React from 'react';

interface SquareBadgeProps {
  square: string;
  piece?: string;
  color?: 'light' | 'dark' | 'highlight';
}

const colorClasses = {
  light: 'bg-amber-100 text-amber-800 border-amber-300',
  dark: 'bg-amber-700 text-amber-100 border-amber-800',
  highlight: 'bg-green-100 text-green-800 border-green-300',
};

export function SquareBadge({ square, piece, color = 'light' }: SquareBadgeProps) {
  return (
    <span 
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-sm font-mono ${colorClasses[color]}`}
      role="img"
      aria-label={`Square ${square}${piece ? ` with ${piece}` : ''}`}
    >
      <span className="font-bold">{square}</span>
      {piece && (
        <span className="opacity-75">({piece})</span>
      )}
    </span>
  );
}
