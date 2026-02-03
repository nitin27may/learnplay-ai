'use client';

import React from 'react';

interface CellBadgeProps {
  row: number;
  col: number;
  value?: number;
  color?: 'green' | 'blue' | 'red' | 'yellow' | 'gray';
}

const colorClasses = {
  green: 'bg-green-100 text-green-800 border-green-300',
  blue: 'bg-blue-100 text-blue-800 border-blue-300',
  red: 'bg-red-100 text-red-800 border-red-300',
  yellow: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  gray: 'bg-gray-100 text-gray-800 border-gray-300',
};

export function CellBadge({ row, col, value, color = 'blue' }: CellBadgeProps) {
  return (
    <span 
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-sm font-mono ${colorClasses[color]}`}
      role="img"
      aria-label={`Cell at row ${row + 1}, column ${col + 1}${value !== undefined ? `, value ${value}` : ''}`}
    >
      <span className="opacity-60">R{row + 1}C{col + 1}</span>
      {value !== undefined && (
        <>
          <span className="opacity-40">=</span>
          <span className="font-bold">{value}</span>
        </>
      )}
    </span>
  );
}
