'use client';

import { useState, useCallback, useEffect } from 'react';
import { useFrontendTool, useCopilotChat, useCopilotReadable } from '@copilotkit/react-core';
import { CopilotSidebar } from '@copilotkit/react-ui';
import { MessageRole, TextMessage } from '@copilotkit/runtime-client-gql';
import { ChessBoard } from './ChessBoard';
import { MoveHistory } from './MoveHistory';
import { GameControls } from './GameControls';
import { ChessTeachingProgress } from './ChessTeachingProgress';
import { ChessEngine } from '@/lib/chess/engine';
import type { Square } from '@/lib/chess/types';

export function ChessGameWithAgent() {
  const [engine] = useState(() => {
    const eng = new ChessEngine();
    console.log('🎮 Chess engine initialized with FEN:', eng.getState().fen);
    return eng;
  });
  const [position, setPosition] = useState(() => {
    const initialFen = engine.getState().fen;
    console.log('♟️ Initial position set to:', initialFen);
    return initialFen;
  });
  const [history, setHistory] = useState<string[]>([]);
  const [orientation, setOrientation] = useState<'white' | 'black'>('white');
  const [gameStatus, setGameStatus] = useState('');
  const [highlightSquares, setHighlightSquares] = useState<Record<string, React.CSSProperties>>({});
  
  // Teaching state
  const [isTeaching, setIsTeaching] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [currentStepDescription, setCurrentStepDescription] = useState('');
  const [isPaused, setIsPaused] = useState(false);

  const { appendMessage, isLoading } = useCopilotChat();

  // Debug: Log when position changes
  useEffect(() => {
    console.log('📊 Position updated to:', position);
  }, [position]);

  // Provide readable context
  useCopilotReadable({
    description: 'Current page information for agent routing',
    value: {
      page: 'chess',
      url: '/chess',
      context: 'User is on the Chess game page. Use chess_agent for all interactions.',
      agent: 'chess_agent',
    },
  });

  useCopilotReadable({
    description: 'Current chess position and game state',
    value: {
      fen: position,
      history,
      orientation,
      gameStatus,
      isTeaching,
    },
  });

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
    console.log('♟️ Attempting move:', sourceSquare, '->', targetSquare);
    const move = engine.move(sourceSquare, targetSquare);
    if (move) {
      console.log('✅ Move successful:', move);
      updateGameState();
      return true;
    }
    console.log('❌ Move failed or illegal');
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

  // Frontend tool: Start teaching session
  useFrontendTool({
    name: 'startTeaching',
    description: 'Start a teaching session with progress tracking',
    parameters: [
      { name: 'totalSteps', type: 'number', description: 'Total steps in lesson', required: true },
      { name: 'topic', type: 'string', description: 'Lesson topic', required: true },
    ],
    handler({ totalSteps, topic }) {
      console.log(`📚 Starting lesson: ${topic} with ${totalSteps} steps`);
      setIsTeaching(true);
      setTotalSteps(totalSteps);
      setCurrentStep(1);
      setCurrentStepDescription(topic);
      setIsPaused(false);
      return `Started teaching: ${topic}`;
    },
  });

  // Frontend tool: Update teaching step
  useFrontendTool({
    name: 'updateTeachingStep',
    description: 'Update current teaching step',
    parameters: [
      { name: 'stepNumber', type: 'number', description: 'Step number', required: true },
      { name: 'stepDescription', type: 'string', description: 'Step description', required: true },
    ],
    handler({ stepNumber, stepDescription }) {
      console.log(`📖 Step ${stepNumber}: ${stepDescription}`);
      setCurrentStep(stepNumber);
      setCurrentStepDescription(stepDescription);
      return `Updated to step ${stepNumber}`;
    },
  });

  // Frontend tool: End teaching
  useFrontendTool({
    name: 'endTeaching',
    description: 'End the teaching session',
    parameters: [],
    handler() {
      console.log('✅ Ending teaching session');
      setIsTeaching(false);
      setCurrentStep(0);
      setTotalSteps(0);
      setHighlightSquares({});
      return 'Teaching ended';
    },
  });

  // Frontend tool: Highlight squares
  useFrontendTool({
    name: 'highlightSquares',
    description: 'Highlight squares on the board (visual only)',
    parameters: [
      { name: 'squares', type: 'object', description: 'Array of {square, color}', required: true },
      { name: 'message', type: 'string', description: 'Message text', required: true },
    ],
    handler({ squares, message }) {
      console.log('Highlighting squares:', squares);
      const squaresArray = Array.isArray(squares) ? squares : [squares];
      const styles: Record<string, React.CSSProperties> = {};
      
      squaresArray.forEach((sq: any) => {
        const color = sq.color === 'green' ? 'rgba(0, 255, 0, 0.4)' :
                     sq.color === 'blue' ? 'rgba(0, 0, 255, 0.4)' :
                     sq.color === 'yellow' ? 'rgba(255, 255, 0, 0.4)' :
                     sq.color === 'red' ? 'rgba(255, 0, 0, 0.4)' :
                     'rgba(128, 0, 128, 0.4)';
        styles[sq.square] = { backgroundColor: color };
      });
      
      setHighlightSquares(styles);
      return `Highlighted ${squaresArray.length} squares: ${message}`;
    },
  });

  // Frontend tool: Clear highlights
  useFrontendTool({
    name: 'clearHighlights',
    description: 'Clear all square highlights',
    parameters: [],
    handler() {
      setHighlightSquares({});
      return 'Highlights cleared';
    },
  });

  // Frontend tool: Make move
  useFrontendTool({
    name: 'makeMove',
    description: 'Execute a chess move',
    parameters: [
      { name: 'move', type: 'string', description: 'Move in UCI format (e.g., e2e4)', required: true },
    ],
    handler({ move }) {
      const from = move.substring(0, 2);
      const to = move.substring(2, 4);
      const promotion = move.length > 4 ? move[4] : undefined;
      
      const result = engine.move(from, to, promotion);
      if (result) {
        updateGameState();
        return `Played: ${result.san}`;
      }
      return 'Invalid move';
    },
  });

  // Frontend tool: Voice output
  useFrontendTool({
    name: 'speak_message',
    description: 'Speak a message using voice output',
    parameters: [
      { name: 'message', type: 'string', description: 'Text to speak', required: true },
    ],
    handler({ message }) {
      console.log('🔊 Speaking:', message);
      
      // Fire-and-forget async audio
      (async () => {
        try {
          const response = await fetch('/api/tts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: message }),
          });
          
          const contentType = response.headers.get('content-type');
          
          if (contentType?.includes('application/json')) {
            // Fallback to browser TTS
            if ('speechSynthesis' in window) {
              const utterance = new SpeechSynthesisUtterance(message);
              utterance.rate = 0.9;
              window.speechSynthesis.speak(utterance);
            }
            return;
          }
          
          const audioBlob = await response.blob();
          const audioUrl = URL.createObjectURL(audioBlob);
          const audio = new Audio(audioUrl);
          audio.onended = () => URL.revokeObjectURL(audioUrl);
          await audio.play();
        } catch (error) {
          console.error('TTS error:', error);
          if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(message);
            window.speechSynthesis.speak(utterance);
          }
        }
      })();
      
      return `Speaking: "${message}"`;
    },
  });

  const handleNextStep = useCallback(async () => {
    if (isLoading) return;
    setIsPaused(false);
    setHighlightSquares({});
    
    await appendMessage(
      new TextMessage({
        role: MessageRole.User,
        content: 'Continue to the next step',
      })
    );
  }, [isLoading, appendMessage]);

  const handleEndLesson = useCallback(() => {
    setIsTeaching(false);
    setCurrentStep(0);
    setTotalSteps(0);
    setHighlightSquares({});
  }, []);

  return (
    <CopilotSidebar
      defaultOpen={true}
      labels={{
        title: 'Chess Tutor',
        initial: 'Hi! I\'m your chess tutor. Click a button below or ask me anything:',
      }}
      clickOutsideToClose={false}
      suggestions={[
        {
          title: '📚 Learn Chess Basics',
          message: 'Learn chess basics',
        },
        {
          title: '💡 Suggest Move',
          message: 'Suggest a good move for me',
        },
        {
          title: '🤖 AI Opponent',
          message: 'Make an AI move as my opponent',
        },
        {
          title: '📊 Analyze Position',
          message: 'Analyze the current position',
        },
        {
          title: '➡️ Continue',
          message: 'Continue to the next step',
        },
      ]}
    >
      <main className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
        <div className="container mx-auto py-8">
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
                areDraggablePieces={true}
              />
              {gameStatus && (
                <div className="mt-4 p-4 bg-blue-100 border border-blue-300 rounded-lg text-center">
                  <p className="text-lg font-semibold text-blue-900">{gameStatus}</p>
                </div>
              )}
            </div>
            
            <div className="space-y-4">
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
        </div>
      </main>
    </CopilotSidebar>
  );
}
