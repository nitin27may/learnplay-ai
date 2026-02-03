'use client';

import React, { useState } from 'react';

interface NumberPickerQuizProps {
  question: string;
  cellRef?: { row: number; col: number };
  onNumberSelect: (num: number) => void;
  correctNumber?: number;
  showFeedback?: boolean;
}

export function NumberPickerQuiz({
  question,
  cellRef,
  onNumberSelect,
  correctNumber,
  showFeedback = true,
}: NumberPickerQuizProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);

  const handleSelect = (num: number) => {
    if (answered) return;
    setSelected(num);
    setAnswered(true);
    onNumberSelect(num);
  };

  const isCorrect = selected === correctNumber;

  return (
    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 my-2" role="region" aria-label="Number selection quiz">
      <div className="font-semibold text-emerald-800 mb-2">{question}</div>
      
      {cellRef && (
        <div className="text-sm text-gray-600 mb-3">
          For cell: <span className="font-mono bg-emerald-100 px-2 py-0.5 rounded">R{cellRef.row + 1}C{cellRef.col + 1}</span>
        </div>
      )}
      
      {/* Number grid */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
          let className = "aspect-square flex items-center justify-center text-xl font-bold rounded-lg border-2 transition cursor-pointer ";
          
          if (!answered) {
            className += "border-emerald-300 bg-white hover:bg-emerald-100 hover:border-emerald-500 text-emerald-800";
          } else if (num === correctNumber) {
            className += "border-green-500 bg-green-100 text-green-800";
          } else if (num === selected) {
            className += "border-red-500 bg-red-100 text-red-800";
          } else {
            className += "border-gray-200 bg-gray-50 text-gray-400";
          }
          
          return (
            <button
              key={num}
              onClick={() => handleSelect(num)}
              disabled={answered}
              className={className}
              aria-label={`Select number ${num}`}
            >
              {num}
              {answered && num === correctNumber && (
                <span className="ml-1 text-green-600" aria-label="correct">
                  <svg className="w-4 h-4 inline" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
              )}
            </button>
          );
        })}
      </div>
      
      {/* Feedback */}
      {answered && showFeedback && (
        <div 
          className={`p-2 rounded text-sm ${isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
          role="alert"
        >
          {isCorrect 
            ? 'Correct! Great job!' 
            : `Not quite. The correct answer is ${correctNumber}.`
          }
        </div>
      )}
    </div>
  );
}
