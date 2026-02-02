'use client';

import { useState, useCallback, useMemo } from 'react';
import { CopilotKit, useCopilotAction } from '@copilotkit/react-core';
import { CopilotSidebar } from '@copilotkit/react-ui';
import '@copilotkit/react-ui/styles.css';
import { ChessBoard } from './ChessBoard';
import { MoveHistory } from './MoveHistory';
import { GameControls } from './GameControls';
import { ChessTeachingProgress } from './ChessTeachingProgress';
import { ChessQuickActions } from './ChessQuickActions';
import { ChessEngine } from '@/lib/chess/engine';
import type { Square } from '@/lib/chess/types';

export function ChessGame() {
  const [engine] = useState(() => new ChessEngine());
  const [position, setPosition] = useState(engine.getState().fen);
  const [history, setHistory] = useState<string[]>([]);
  const [orientation, setOrientation] = useState<'white' | 'black'>('white');
  const [gameStatus, setGameStatus] = useState('');
  const [highlightSquares, setHighlightSquares] = useState<Record<string, React.CSSProperties>>({});
  
  // Teaching state
  const [isTeaching, setIsTeaching] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [currentStepDescription, setCurrentStepDescription] = useState('');

  const updateGameState = useCallback(() => {
    const state = engine.getState();
    setPosition(state.fen);
    setHistory(state.history);

    if (state.isCheckmate) {
      setGameStatus(`Checkmate! ${state.turn === 'w' ? 'Black' : 'White'} wins!`);
    } else if (state.isStalemate) {
      setGameStatus('Stalemate! Game is a draw.');
    } else if (state.isDraw) {
      setGameStatus('Draw!');
    } else if (state.isCheck) {
      setGameStatus('Check!');
    } else {
      setGameStatus('');
    }
  }, [engine]);

  const onPieceDrop = useCallback((sourceSquare: Square, targetSquare: Square): boolean => {
    const move = engine.move(sourceSquare, targetSquare);
    if (move) {
      updateGameState();
      return true;
    }
    return false;
  }, [engine, updateGameState]);

  const handleNewGame = useCallback(() => {
    engine.reset();
    updateGameState();
    setHighlightSquares({});
  }, [engine, updateGameState]);

  const handleUndo = useCallback(() => {
    engine.undo();
    updateGameState();
  }, [engine, updateGameState]);

  const handleFlipBoard = useCallback(() => {
    setOrientation(prev => prev === 'white' ? 'black' : 'white');
  }, []);

  // CopilotKit Actions
  useCopilotAction({
    name: 'startChessLesson',
    description: 'Start a chess teaching lesson with progress tracking',
    parameters: [
      { name: 'totalSteps', type: 'number', description: 'Total number of steps in lesson' },
      { name: 'topic', type: 'string', description: 'Lesson topic name' },
      { name: 'position', type: 'string', description: 'Optional FEN to load', required: false },
    ],
    handler: ({ totalSteps, topic, position: fen }) => {
      setIsTeaching(true);
      setTotalSteps(totalSteps);
      setCurrentStep(0);
      setCurrentStepDescription(topic);
      if (fen) {
        engine.loadFEN(fen);
        updateGameState();
      }
      return `Started lesson: ${topic}`;
    },
  });

  useCopilotAction({
    name: 'updateChessStep',
    description: 'Update current step in teaching session',
    parameters: [
      { name: 'stepNumber', type: 'number', description: 'Current step number' },
      { name: 'description', type: 'string', description: 'Step description' },
      { name: 'move', type: 'string', description: 'Optional move UCI', required: false },
    ],
    handler: ({ stepNumber, description, move }) => {
      setCurrentStep(stepNumber);
      setCurrentStepDescription(description);
      if (move) {
        const [from, to] = [move.substring(0, 2), move.substring(2, 4)];
        engine.move(from, to);
        updateGameState();
      }
      return `Step ${stepNumber}: ${description}`;
    },
  });

  useCopilotAction({
    name: 'highlightSquares',
    description: 'Highlight squares on the chess board with optional arrows',
    parameters: [
      { name: 'squares', type: 'object[]', description: 'Array of {square, color} objects' },
      { name: 'arrows', type: 'object[]', description: 'Array of {from, to} arrows', required: false },
      { name: 'message', type: 'string', description: 'Message to speak' },
    ],
    handler: ({ squares, message }) => {
      const styles: Record<string, React.CSSProperties> = {};
      squares.forEach((sq: any) => {
        const color = sq.color === 'green' ? 'rgba(0, 255, 0, 0.4)' :
                     sq.color === 'blue' ? 'rgba(0, 0, 255, 0.4)' :
                     sq.color === 'yellow' ? 'rgba(255, 255, 0, 0.4)' :
                     sq.color === 'red' ? 'rgba(255, 0, 0, 0.4)' :
                     'rgba(128, 0, 128, 0.4)';
        styles[sq.square] = { backgroundColor: color };
      });
      setHighlightSquares(styles);
      return `Highlighted ${squares.length} squares`;
    },
  });

  useCopilotAction({
    name: 'loadPosition',
    description: 'Load a specific chess position from FEN',
    parameters: [
      { name: 'fen', type: 'string', description: 'FEN notation' },
      { name: 'orientation', type: 'string', description: 'Board orientation (white/black)', required: false },
    ],
    handler: ({ fen, orientation: orient }) => {
      if (engine.loadFEN(fen)) {
        updateGameState();
        if (orient) setOrientation(orient as 'white' | 'black');
        return `Loaded position: ${fen}`;
      }
      return 'Failed to load position';
    },
  });

  useCopilotAction({
    name: 'endChessLesson',
    description: 'End the current teaching lesson',
    parameters: [],
    handler: () => {
      setIsTeaching(false);
      setCurrentStep(0);
      setTotalSteps(0);
      setHighlightSquares({});
      return 'Lesson ended';
    },
  });

  useCopilotAction({
    name: 'makeAIMove',
    description: 'Execute an AI move on the board',
    parameters: [
      { name: 'move_uci', type: 'string', description: 'Move in UCI format (e.g., e2e4)' },
    ],
    handler: ({ move_uci }) => {
      const from = move_uci.substring(0, 2);
      const to = move_uci.substring(2, 4);
      const promotion = move_uci.length > 4 ? move_uci[4] : undefined;
      
      const move = engine.move(from, to, promotion);
      if (move) {
        updateGameState();
        return `AI played: ${move.san}`;
      }
      return 'Invalid move';
    },
  });

  useCopilotAction({
    name: 'getCurrentPosition',
    description: 'Get the current chess position as FEN',
    parameters: [],
    handler: () => {
      return { fen: position, history };
    },
  });

  const handleNextStep = useCallback(() => {
    // User will say "continue" to agent
  }, []);

  const handleEndLesson = useCallback(() => {
    setIsTeaching(false);
    setCurrentStep(0);
    setTotalSteps(0);
    setHighlightSquares({});
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
      <ChessTeachingProgress
        isTeaching={isTeaching}
        currentStep={currentStep}
        totalSteps={totalSteps}
        currentStepDescription={currentStepDescription}
        onNextStep={handleNextStep}
        onEndLesson={handleEndLesson}
      />
      
      <div className="lg:col-span-2">
        <ChessBoard
          position={position}
          onPieceDrop={onPieceDrop}
          boardOrientation={orientation}
          customSquareStyles={highlightSquares}
        />
        {gameStatus && (
          <div className="mt-4 p-4 bg-blue-100 border border-blue-300 rounded-lg text-center">
            <p className="text-lg font-semibold text-blue-900">{gameStatus}</p>
          </div>
        )}
      </div>
      
      <div className="space-y-4">
        <ChessQuickActions />
        <GameControls
          onNewGame={handleNewGame}
          onUndo={handleUndo}
          onFlipBoard={handleFlipBoard}
          canUndo={history.length > 0}
          orientation={orientation}
        />
        <MoveHistory history={history} />
      </div>
    </div>
  );
}
