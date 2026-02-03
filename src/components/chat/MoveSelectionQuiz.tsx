'use client';

import React, { useState } from 'react';

interface MoveOption {
  from: string;
  to: string;
  label: string;
}

interface MoveSelectionQuizProps {
  question: string;
  options: MoveOption[];
  correctMove: { from: string; to: string };
  onMoveSelect: (from: string, to: string) => void;
}

export function MoveSelectionQuiz({
  question,
  options,
  correctMove,
  onMoveSelect,
}: MoveSelectionQuizProps) {
  const [selected, setSelected] = useState<MoveOption | null>(null);
  const [answered, setAnswered] = useState(false);

  const handleSelect = (option: MoveOption) => {
    if (answered) return;
    setSelected(option);
    setAnswered(true);
    onMoveSelect(option.from, option.to);
  };

  const isCorrect = selected?.from === correctMove.from && selected?.to === correctMove.to;

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 my-2" role="region" aria-label="Move selection quiz">
      <div className="font-semibold text-amber-800 mb-3">{question}</div>
      
      <div className="space-y-2">
        {options.map((option, index) => {
          const isThisCorrect = option.from === correctMove.from && option.to === correctMove.to;
          const isThisSelected = selected?.from === option.from && selected?.to === option.to;
          
          let className = "w-full text-left px-4 py-3 rounded-lg border transition flex items-center justify-between ";
          
          if (!answered) {
            className += "border-amber-200 bg-white hover:border-amber-400 hover:bg-amber-50 cursor-pointer";
          } else if (isThisCorrect) {
            className += "border-green-500 bg-green-50 text-green-800";
          } else if (isThisSelected) {
            className += "border-red-500 bg-red-50 text-red-800";
          } else {
            className += "border-gray-200 bg-gray-50 opacity-50";
          }
          
          return (
            <button
              key={index}
              onClick={() => handleSelect(option)}
              disabled={answered}
              className={className}
            >
              <div className="flex items-center gap-3">
                <span className="font-mono bg-amber-100 px-2 py-1 rounded text-sm">
                  {option.from}
                </span>
                <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
                <span className="font-mono bg-amber-100 px-2 py-1 rounded text-sm">
                  {option.to}
                </span>
                <span className="text-gray-600">{option.label}</span>
              </div>
              
              {answered && isThisCorrect && (
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
              {answered && isThisSelected && !isCorrect && (
                <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
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
            ? 'Correct! Excellent chess thinking!' 
            : `Not quite. The best move is ${correctMove.from} to ${correctMove.to}.`
          }
        </div>
      )}
    </div>
  );
}
