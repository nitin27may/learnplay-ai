'use client';

import React from 'react';

interface ActionButton {
  id: string;
  label: string;
  variant?: 'primary' | 'secondary' | 'outline';
  icon?: 'next' | 'stop' | 'hint' | 'check' | 'refresh';
}

interface ActionButtonGroupProps {
  actions: ActionButton[];
  onAction: (actionId: string) => void;
  disabled?: boolean;
}

const variantClasses = {
  primary: 'bg-indigo-600 text-white hover:bg-indigo-700 border-indigo-600',
  secondary: 'bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-200',
  outline: 'bg-white text-indigo-600 hover:bg-indigo-50 border-indigo-300',
};

const icons: Record<string, React.ReactNode> = {
  next: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
  ),
  stop: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
    </svg>
  ),
  hint: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  ),
  check: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  refresh: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  ),
};

export function ActionButtonGroup({
  actions,
  onAction,
  disabled = false,
}: ActionButtonGroupProps) {
  return (
    <div className="flex flex-wrap gap-2 my-2" role="group" aria-label="Action buttons">
      {actions.map((action) => (
        <button
          key={action.id}
          onClick={() => onAction(action.id)}
          disabled={disabled}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg border font-medium text-sm transition
            focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
            disabled:opacity-50 disabled:cursor-not-allowed
            ${variantClasses[action.variant || 'primary']}
          `}
        >
          {action.icon && icons[action.icon]}
          {action.label}
        </button>
      ))}
    </div>
  );
}
