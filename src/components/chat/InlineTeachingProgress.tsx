'use client';

import React from 'react';

interface InlineTeachingProgressProps {
  currentStep: number;
  totalSteps: number;
  stepTitle?: string;
  topic: string;
  onNext?: () => void;
  onStop?: () => void;
}

export function InlineTeachingProgress({
  currentStep,
  totalSteps,
  stepTitle,
  topic,
  onNext,
  onStop,
}: InlineTeachingProgressProps) {
  const progressPercent = (currentStep / totalSteps) * 100;
  const isLastStep = currentStep >= totalSteps;

  return (
    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 my-2" role="region" aria-label="Teaching progress">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-indigo-600 uppercase tracking-wide">
          {topic}
        </span>
        <span className="text-sm font-medium text-indigo-800">
          Step {currentStep} of {totalSteps}
        </span>
      </div>
      
      {/* Progress bar */}
      <div className="w-full bg-indigo-100 rounded-full h-2 mb-2" role="progressbar" aria-valuenow={currentStep} aria-valuemin={1} aria-valuemax={totalSteps}>
        <div 
          className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      
      {/* Step title */}
      {stepTitle && (
        <div className="text-sm text-gray-700 mb-3">{stepTitle}</div>
      )}
      
      {/* Action buttons - only show if handlers provided */}
      {(onNext || onStop) && (
        <div className="flex gap-2">
          {onNext && (
            <button
              onClick={onNext}
              className="flex-1 bg-indigo-600 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-indigo-700 transition focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              {isLastStep ? 'Finish' : 'Next Step'}
            </button>
          )}
          {onStop && (
            <button
              onClick={onStop}
              className="px-3 py-1.5 border border-indigo-300 text-indigo-600 rounded text-sm font-medium hover:bg-indigo-50 transition focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Stop
            </button>
          )}
        </div>
      )}
    </div>
  );
}
