'use client';

import React, { useState } from 'react';

interface StrategyQuizProps {
  question: string;
  options: { id: string; label: string; description?: string }[];
  correctId: string;
  onAnswer: (selectedId: string, isCorrect: boolean) => void;
}

export function StrategyQuiz({
  question,
  options,
  correctId,
  onAnswer,
}: StrategyQuizProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);

  const handleSelect = (id: string) => {
    if (answered) return;
    setSelected(id);
    setAnswered(true);
    onAnswer(id, id === correctId);
  };

  const isCorrect = selected === correctId;

  return (
    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 my-2" role="region" aria-label="Strategy quiz">
      <div className="font-semibold text-purple-800 mb-3">{question}</div>
      
      <div className="space-y-2">
        {options.map((option) => {
          let className = "w-full text-left px-4 py-3 rounded-lg border transition ";
          
          if (!answered) {
            className += "border-gray-200 bg-white hover:border-purple-400 hover:bg-purple-50 cursor-pointer";
          } else if (option.id === correctId) {
            className += "border-green-500 bg-green-50 text-green-800";
          } else if (option.id === selected) {
            className += "border-red-500 bg-red-50 text-red-800";
          } else {
            className += "border-gray-200 bg-gray-50 opacity-50";
          }
          
          return (
            <button
              key={option.id}
              onClick={() => handleSelect(option.id)}
              disabled={answered}
              className={className}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{option.label}</span>
                {answered && option.id === correctId && (
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
                {answered && option.id === selected && option.id !== correctId && (
                  <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              {option.description && (
                <div className="text-sm text-gray-500 mt-1">{option.description}</div>
              )}
            </button>
          );
        })}
      </div>
      
      {answered && (
        <div 
          className={`mt-3 p-2 rounded text-sm ${isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
          role="alert"
        >
          {isCorrect 
            ? 'Correct! Great job!' 
            : `Not quite. The correct answer is "${options.find(o => o.id === correctId)?.label}".`
          }
        </div>
      )}
    </div>
  );
}
