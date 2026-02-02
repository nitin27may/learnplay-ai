'use client';

interface ChessTeachingProgressProps {
  isTeaching: boolean;
  currentStep: number;
  totalSteps: number;
  currentStepDescription: string;
  onNextStep: () => void;
  onEndLesson: () => void;
}

export function ChessTeachingProgress({
  isTeaching,
  currentStep,
  totalSteps,
  currentStepDescription,
  onNextStep,
  onEndLesson,
}: ChessTeachingProgressProps) {
  if (!isTeaching) return null;

  return (
    <div className="fixed top-4 right-4 bg-white rounded-lg shadow-2xl p-6 max-w-md z-50 border-2 border-amber-500">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-amber-900">Chess Lesson</h3>
        <button
          onClick={onEndLesson}
          className="text-gray-500 hover:text-gray-700 text-xl leading-none"
          aria-label="Close lesson"
        >
          ×
        </button>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Step {currentStep} of {totalSteps}</span>
          <span>{Math.round((currentStep / totalSteps) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-amber-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      <p className="text-gray-700 mb-4 text-sm">
        {currentStepDescription}
      </p>

      <button
        onClick={onNextStep}
        disabled={currentStep >= totalSteps}
        className="w-full px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
      >
        {currentStep >= totalSteps ? 'Lesson Complete' : 'Next Step →'}
      </button>
    </div>
  );
}
