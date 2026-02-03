'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useFrontendTool, useCopilotChat, useCopilotReadable, useCoAgentStateRender, useCopilotChatSuggestions, useRenderToolCall } from '@copilotkit/react-core';
import { CopilotSidebar } from '@copilotkit/react-ui';
import { MessageRole, TextMessage } from '@copilotkit/runtime-client-gql';
import { ChessBoard } from './ChessBoard';
import { MoveHistory } from './MoveHistory';
import { GameControls } from './GameControls';
import { ChessTeachingProgress } from './ChessTeachingProgress';
import { ChessEngine } from '@/lib/chess/engine';
import type { Square } from '@/lib/chess/types';
import type { ChessAgentState } from '@/lib/types';
import {
  SquareBadge,
  StrategyBadge,
  MoveCard,
  InlineTeachingProgress,
  ThinkingIndicator,
  MoveSelectionQuiz,
  OpeningCard,
  ActionButtonGroup,
} from '@/components/chat';

export function ChessGameWithAgent() {
  const [engine] = useState(() => new ChessEngine());
  const [position, setPosition] = useState(() => engine.getState().fen);
  const [history, setHistory] = useState<string[]>([]);
  const [playerNames, setPlayerNames] = useState<string[]>([]); // Track who made each move
  const [orientation, setOrientation] = useState<'white' | 'black'>('white');
  const [gameStatus, setGameStatus] = useState('');
  const [highlightSquares, setHighlightSquares] = useState<Record<string, React.CSSProperties>>({});
  const [gameMode, setGameMode] = useState<'pvp' | 'pvc' | 'ai'>('pvc'); // Default to Player vs Computer
  
  // Teaching state
  const [isTeaching, setIsTeaching] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [currentStepDescription, setCurrentStepDescription] = useState('');
  const [isPaused, setIsPaused] = useState(false);

  const { appendMessage, isLoading } = useCopilotChat();

  // Handler for Next Step button - defined early for use in markdownTagRenderers
  const handleNextStep = useCallback(async () => {
    if (isLoading) return;
    
    setIsPaused(false);
    setHighlightSquares({});
    
    console.log('[Chess] Sending continuation message');
    try {
      await appendMessage(
        new TextMessage({
          role: MessageRole.User,
          content: 'Continue to the next step',
        })
      );
    } catch (error) {
      console.error('Failed to continue:', error);
    }
  }, [appendMessage, isLoading]);

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
      gameMode,
      gameStatus,
      isTeaching,
    },
  });

  // Render teaching progress inline in chat when teaching is active
  useCoAgentStateRender<ChessAgentState>({
    name: 'chess_agent',
    render: ({ state }) => {
      if (state?.teaching_active && state?.teaching_total_steps > 0) {
        return (
          <InlineTeachingProgress
            topic={state.teaching_topic || 'Chess lesson'}
            currentStep={state.teaching_current_step}
            totalSteps={state.teaching_total_steps}
          />
        );
      }
      return undefined;
    },
  });

  // Markdown tag renderers for rich inline content
  const markdownTagRenderers = useMemo(() => ({
    square: (props: { children?: React.ReactNode }) => {
      const square = String(props.children || '');
      return <SquareBadge square={square} />;
    },
    strategy: (props: { children?: React.ReactNode }) => {
      const strategy = String(props.children || '');
      return <StrategyBadge name={strategy} />;
    },
    // Custom paragraph renderer to make "Next Step" text actionable
    p: ({ children }: { children?: React.ReactNode }) => {
      const text = children?.toString() || '';
      // Check if text mentions next step or continuing
      if (text.toLowerCase().includes('next step') || (text.toLowerCase().includes('click') && text.toLowerCase().includes('continue'))) {
        return (
          <div className="my-3">
            <p className="text-sm text-gray-700 mb-3">{children}</p>
            <ActionButtonGroup
              actions={[
                {
                  id: 'next',
                  label: 'Next Step',
                  variant: 'primary',
                  icon: 'next'
                }
              ]}
              onAction={handleNextStep}
            />
          </div>
        );
      }
      return <p className="text-sm text-gray-700 my-2">{children}</p>;
    },
  }), [handleNextStep]);

  // Dynamic context-aware chat suggestions
  useCopilotChatSuggestions({
    instructions: `Based on the current chess game state:
      - Move count: ${history.length}
      - Game mode: ${gameMode}
      - Game status: ${gameStatus || 'In progress'}
      - Is teaching: ${isTeaching}
      - Current step: ${currentStep}/${totalSteps}
      Suggest 2-3 helpful next actions for a chess player.`,
    minSuggestions: 2,
    maxSuggestions: 3,
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
    const move = engine.move(sourceSquare, targetSquare);
    if (move) {
      // Track who made this move based on game mode
      const playerLabel = gameMode === 'pvp' 
        ? (playerNames.length % 2 === 0 ? 'White' : 'Black')
        : 'Player';
      setPlayerNames(prev => [...prev, playerLabel]);
      updateGameState();
      
      // If playing against computer or AI, make their move after a short delay
      if ((gameMode === 'pvc' || gameMode === 'ai') && !engine.isGameOver()) {
        setTimeout(() => {
          if (gameMode === 'pvc') {
            // Computer makes a random legal move
            const moves = engine.getAllLegalMoves();
            if (moves.length > 0) {
              const randomMove = moves[Math.floor(Math.random() * moves.length)];
              engine.move(randomMove.from as Square, randomMove.to as Square);
              setPlayerNames(prev => [...prev, 'Computer']);
              updateGameState();
            }
          } else if (gameMode === 'ai') {
            // Ask AI agent to make a move
            appendMessage(new TextMessage({
              content: 'Make your move as my opponent',
              role: MessageRole.User,
            }));
          }
        }, 500);
      }
      return true;
    }
    return false;
  }, [engine, updateGameState, gameMode, appendMessage, playerNames.length]);

  const handleNewGame = useCallback(() => {
    engine.reset();
    updateGameState();
    setHighlightSquares({});
    setPlayerNames([]);
  }, [engine, updateGameState]);

  const handleUndo = useCallback(() => {
    engine.undo();
    setPlayerNames(prev => prev.slice(0, -1));
    updateGameState();
  }, [engine, updateGameState]);

  const handleFlipBoard = useCallback(() => {
    setOrientation(prev => prev === 'white' ? 'black' : 'white');
  }, []);

  // Handler for ending lesson
  const handleEndLesson = useCallback(() => {
    setIsTeaching(false);
    setIsPaused(false);
    setCurrentStep(0);
    setTotalSteps(0);
    setHighlightSquares({});
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
      console.log(`[Teaching] Starting lesson: ${topic} with ${totalSteps} steps`);
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
      console.log(`[Teaching] Step ${stepNumber}: ${stepDescription}`);
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
      console.log('[Teaching] Ending teaching session');
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
    description: 'Highlight squares on the board. CRITICAL: You MUST immediately call speak_message after this to explain what you highlighted. Never highlight without speaking.',
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
      return `Highlighted ${squaresArray.length} squares. REMEMBER: You must call speak_message now to explain this highlight.`;
    },
    render: ({ args }) => {
      const squaresArray = Array.isArray(args?.squares) ? args.squares : [];
      const squareNames = squaresArray.map((sq: { square: string }) => sq.square).join(', ');
      return (
        <MoveCard
          from={squaresArray[0]?.square || ''}
          to={squaresArray[1]?.square || ''}
          piece="piece"
          pieceColor="white"
          notation={squareNames || '?'}
          explanation={args?.message || `Highlighted: ${squareNames}`}
        />
      );
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

  // Frontend tool: Make AI move (when AI is opponent)
  useFrontendTool({
    name: 'makeAIMove',
    description: 'Execute a chess move as the AI opponent. Use when in AI opponent mode.',
    parameters: [
      { name: 'move', type: 'string', description: 'Move in UCI format (e.g., e2e4)', required: true },
    ],
    handler({ move }) {
      const from = move.substring(0, 2) as Square;
      const to = move.substring(2, 4) as Square;
      const promotion = move.length > 4 ? move[4] : undefined;
      
      const result = engine.move(from, to, promotion);
      if (result) {
        setPlayerNames(prev => [...prev, 'AI']);
        updateGameState();
        return `AI played: ${result.san}`;
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
      console.log('[Voice] Speaking:', message);
      
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

  // Note: useHumanInTheLoop tools (askMoveSelection, showOpening) are available 
  // but removed due to React 19 type compatibility issues. They can be re-enabled 
  // once CopilotKit provides updated types for React 19.

  // Render backend tool calls with custom UI components
  useRenderToolCall({
    name: 'suggest_chess_move',
    render: ({ status, result }) => {
      if (status === 'executing') {
        return <ThinkingIndicator message="Analyzing position..." />;
      }
      
      if (!result) {
        return <div className="text-sm text-gray-500 italic">No move suggestion available</div>;
      }
      
      try {
        const data = typeof result === 'string' ? JSON.parse(result) : result;
        return (
          <MoveCard
            from={data.from || ''}
            to={data.to || ''}
            piece={data.piece || 'piece'}
            pieceColor={data.color || 'white'}
            notation={data.san || data.uci || ''}
            explanation={data.explanation || data.reason || 'Suggested move'}
          />
        );
      } catch (e) {
        console.error('Failed to render suggest_chess_move:', e);
        return <div className="text-sm text-red-500 italic">Error loading move suggestion</div>;
      }
    }
  });

  useRenderToolCall({
    name: 'analyze_chess_position',
    render: ({ status, result }) => {
      if (status === 'executing') {
        return <ThinkingIndicator message="Analyzing position..." />;
      }
      
      if (!result) {
        return <div className="text-sm text-gray-500 italic">No analysis available</div>;
      }
      
      try {
        const data = typeof result === 'string' ? JSON.parse(result) : result;
        return (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 my-2">
            <h3 className="font-bold text-blue-900 mb-2">Position Analysis</h3>
            <div className="space-y-1 text-sm text-blue-800">
              {data.evaluation && <p>Evaluation: {data.evaluation}</p>}
              {data.material && <p>Material: {data.material}</p>}
              {data.threats && <p>Threats: {data.threats}</p>}
              {data.suggestions && <p>Suggestions: {data.suggestions}</p>}
            </div>
          </div>
        );
      } catch (e) {
        console.error('Failed to render analyze_chess_position:', e);
        return <div className="text-sm text-red-500 italic">Error loading analysis</div>;
      }
    }
  });

  useRenderToolCall({
    name: 'explain_chess_position',
    render: ({ status, result }) => {
      if (status === 'executing') {
        return <ThinkingIndicator message="Analyzing position..." />;
      }
      
      if (!result) {
        return <div className="text-sm text-gray-500 italic">No explanation available</div>;
      }
      
      try {
        const data = typeof result === 'string' ? JSON.parse(result) : result;
        return (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 my-2">
            <h3 className="font-bold text-purple-900 mb-2">Position Explanation</h3>
            <p className="text-sm text-purple-800">{data.explanation || data.description || String(result)}</p>
          </div>
        );
      } catch (e) {
        console.error('Failed to render explain_chess_position:', e);
        return <div className="text-sm text-red-500 italic">Error loading explanation</div>;
      }
    }
  });

  useRenderToolCall({
    name: 'validate_chess_move',
    render: ({ status, result }) => {
      if (status === 'executing') {
        return <ThinkingIndicator message="Validating move..." />;
      }
      
      if (!result) {
        return <div className="text-sm text-gray-500 italic">Unable to validate move</div>;
      }
      
      try {
        const data = typeof result === 'string' ? JSON.parse(result) : result;
        const isValid = data.is_valid || data.valid || false;
        return (
          <div className={`rounded-lg p-3 ${isValid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <div className="flex items-center gap-2">
              <span className="text-lg">{isValid ? '✓' : '✗'}</span>
              <span className={`font-semibold ${isValid ? 'text-green-800' : 'text-red-800'}`}>
                {isValid ? 'Valid move!' : 'Invalid move'}
              </span>
            </div>
            {data.reason && (
              <p className={`mt-1 text-sm ${isValid ? 'text-green-700' : 'text-red-700'}`}>
                {data.reason}
              </p>
            )}
          </div>
        );
      } catch (e) {
        console.error('Failed to render validate_chess_move:', e);
        return <div className="text-sm text-red-500 italic">Error validating move</div>;
      }
    }
  });

  return (
    <CopilotSidebar
      defaultOpen={true}
      labels={{
        title: 'Chess Tutor',
        initial: 'Hi! I\'m your chess tutor. Click a button below or ask me anything:',
      }}
      clickOutsideToClose={false}
      markdownTagRenderers={markdownTagRenderers}
      suggestions={[
        {
          title: 'Learn Chess Basics',
          message: 'Learn chess basics',
        },
        {
          title: 'Suggest Move',
          message: 'Suggest a good move for me',
        },
        {
          title: 'AI Opponent',
          message: 'Make an AI move as my opponent',
        },
        {
          title: 'Analyze Position',
          message: 'Analyze the current position',
        },
        {
          title: 'Continue',
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
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Game Mode
                </label>
                <select
                  value={gameMode}
                  onChange={(e) => setGameMode(e.target.value as 'pvp' | 'pvc' | 'ai')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pvp">Player vs Player</option>
                  <option value="pvc">Player vs Computer</option>
                  <option value="ai">Player vs AI Agent</option>
                </select>
                <p className="mt-2 text-xs text-gray-500">
                  {gameMode === 'pvp' && 'Play against another human'}
                  {gameMode === 'pvc' && 'Computer makes random moves'}
                  {gameMode === 'ai' && 'AI agent plays as your opponent'}
                </p>
              </div>
              
              <GameControls
                onNewGame={handleNewGame}
                onUndo={handleUndo}
                onFlipBoard={handleFlipBoard}
                canUndo={history.length > 0}
                orientation={orientation}
              />
              <MoveHistory history={history} playerNames={playerNames} />
            </div>
          </div>
        </div>
      </main>
    </CopilotSidebar>
  );
}
