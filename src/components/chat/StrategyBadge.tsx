'use client';

import React from 'react';

interface StrategyBadgeProps {
  name: string;
  type?: 'basic' | 'intermediate' | 'advanced';
}

const typeClasses = {
  basic: 'bg-green-100 text-green-800 border-green-300',
  intermediate: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  advanced: 'bg-purple-100 text-purple-800 border-purple-300',
};

const typeLabels = {
  basic: 'Basic',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

export function StrategyBadge({ name, type = 'basic' }: StrategyBadgeProps) {
  return (
    <span 
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded border text-sm font-medium ${typeClasses[type]}`}
      role="img"
      aria-label={`${name} strategy, ${typeLabels[type]} level`}
    >
      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
      </svg>
      <span>{name}</span>
    </span>
  );
}
