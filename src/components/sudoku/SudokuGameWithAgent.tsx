'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useFrontendTool, useCopilotChat, useCopilotReadable, useCoAgentStateRender, useCopilotChatSuggestions, useRenderToolCall } from '@copilotkit/react-core';
import { CopilotSidebar } from '@copilotkit/react-ui';
import { MessageRole, TextMessage } from '@copilotkit/runtime-client-gql';
import { SudokuGame } from '@/components/sudoku/SudokuGame';
import { TeachingProgress } from '@/components/TeachingProgress';
import { useVoiceMode } from '@/lib/hooks/useVoiceMode';
import { analyzeStrategies, findConflicts } from '@/lib/sudoku/solver';
import type { SudokuGrid } from '@/lib/sudoku/types';
import type { CellAnnotation } from '@/lib/sudoku/annotations';
import type { SudokuAgentState } from '@/lib/types';
import { 
  CellBadge, 
  StrategyBadge, 
  HintCard, 
  AnalysisCard,
  InlineTeachingProgress,
  ThinkingIndicator,
  InfoCard,
  ActionButtonGroup,
} from '@/components/chat';

type GameMode = 'play' | 'teach' | 'practice';

interface ExternalCellUpdate {
  row: number;
  col: number;
  value: number;
  timestamp: number;
}

export default function SudokuGameWithAgent() {
  const voice = useVoiceMode();
  const [gameMode, setGameMode] = useState<GameMode>('play');
  const [annotations, setAnnotations] = useState<CellAnnotation[]>([]);
  const [annotationMessage, setAnnotationMessage] = useState<string>('');
  const [currentGrid, setCurrentGrid] = useState<(number | null)[][]>([]);
  const prevGridRef = useRef<string>('');
  
  // State for AI-controlled cell placement
  const [externalCellUpdate, setExternalCellUpdate] = useState<ExternalCellUpdate | null>(null);
  
  // Track if agent has been initialized
  const agentInitialized = useRef(false);
  
  // Teaching state
  const [isTeaching, setIsTeaching] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentStep, setCurrentStep] = useState('');
  const [totalSteps, setTotalSteps] = useState(0);
  const [currentStepNumber, setCurrentStepNumber] = useState(0);
  
  // Track user's last move for wrong-move analysis
  const [lastUserMove, setLastUserMove] = useState<{row: number, col: number, value: number | null} | null>(null);
  
  // Show "Need a hint?" prompt after user chooses to try themselves
  const [showHintPrompt, setShowHintPrompt] = useState(false);

  // CopilotKit chat hook for programmatic messaging
  const { appendMessage, isLoading } = useCopilotChat();

  // Provide readable context about the current page
  useCopilotReadable({
    description: 'Current page information for agent routing',
    value: {
      page: 'sudoku',
      url: '/sudoku',
      context: 'User is on the Sudoku game page. Use sudoku_agent for all interactions.',
      agent: 'sudoku_agent',
    },
  });

  // Provide the current grid state to the agent
  useCopilotReadable({
    description: 'Current state of the Sudoku grid',
    value: currentGrid.length > 0 ? {
      grid: currentGrid,
      hasGrid: true,
      gridSize: '9x9'
    } : {
      hasGrid: false,
      message: 'No grid loaded yet'
    },
  });

  // Render agent state changes in chat (for teaching progress)
  useCoAgentStateRender<SudokuAgentState>({
    name: 'sudoku_agent',
    render: ({ state }) => {
      if (!state?.teaching_active) return undefined;
      return (
        <InlineTeachingProgress
          currentStep={state.teaching_current_step || 1}
          totalSteps={state.teaching_total_steps || 1}
          stepTitle={state.teaching_topic || 'Teaching'}
          topic={state.teaching_topic || 'Sudoku'}
          onNext={handleNextStep}
          onStop={() => {
            setIsTeaching(false);
            setAnnotations([]);
            setAnnotationMessage('');
          }}
        />
      );
    },
  });

  // Dynamic context-aware chat suggestions
  const emptyCellCount = useMemo(() => {
    return currentGrid.flat().filter((cell: number | null) => cell === null || cell === 0).length;
  }, [currentGrid]);

  useCopilotChatSuggestions({
    instructions: `Based on the current game state:
      - Empty cells: ${emptyCellCount}
      - Is teaching: ${isTeaching}
      - Current step: ${currentStepNumber}/${totalSteps}
      Suggest 2-3 helpful next actions for a Sudoku player.`,
    minSuggestions: 2,
    maxSuggestions: 3,
  });

  // Custom markdown tag renderers for rich inline content
  const markdownTagRenderers = {
    'cell': ({ row, col, value, color }: { row?: string; col?: string; value?: string; color?: string; children?: React.ReactNode }) => (
      <CellBadge 
        row={parseInt(row || '0')} 
        col={parseInt(col || '0')} 
        value={value ? parseInt(value) : undefined}
        color={(color as 'green' | 'blue' | 'red' | 'yellow' | 'gray') || 'blue'}
      />
    ),
    'strategy': ({ name, type }: { name?: string; type?: string; children?: React.ReactNode }) => (
      <StrategyBadge 
        name={name || 'Strategy'} 
        type={(type as 'basic' | 'intermediate' | 'advanced') || 'basic'}
      />
    ),
  };

  // Log initialization
  useEffect(() => {
    console.log('[Agent] Sudoku page initialized with agent: sudoku_agent');
  }, []);

  // Initialize agent (mark as initialized after first render)
  useEffect(() => {
    if (!agentInitialized.current) {
      console.log('[Agent] Sudoku agent initialized with page context');
      agentInitialized.current = true;
    }
  }, []);

  // Sync grid to agent state whenever it changes
  useEffect(() => {
    if (currentGrid.length > 0) {
      const gridString = JSON.stringify(currentGrid);
      if (gridString !== prevGridRef.current) {
        console.log('Syncing grid to agent');
        prevGridRef.current = gridString;
      }
    }
  }, [currentGrid]);

  // Handle grid changes - update agent state and track user moves
  const handleGridChange = useCallback((newGrid: (number | null)[][]) => {
    // Detect what cell changed (for wrong-move analysis)
    if (currentGrid.length > 0) {
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (newGrid[r][c] !== currentGrid[r][c] && newGrid[r][c] !== null) {
            console.log('[User] Placed:', newGrid[r][c], 'at', r, c);
            setLastUserMove({ row: r, col: c, value: newGrid[r][c] });
            break;
          }
        }
      }
    }
    
    setCurrentGrid(newGrid);
    // Clear annotations when user makes a move
    if (annotations.length > 0) {
      setAnnotations([]);
      setAnnotationMessage('');
    }
  }, [annotations.length, currentGrid]);

  // Frontend tool for managing teaching state
  useFrontendTool({
    name: 'startTeaching',
    description: 'Start a structured teaching session with multiple steps',
    parameters: [
      {
        name: 'totalSteps',
        description: 'Total number of steps in this teaching session',
        type: 'number',
        required: true,
      },
      {
        name: 'topic',
        description: 'The topic being taught (e.g., "Sudoku Basics", "Step-by-step Solution")',
        type: 'string',
        required: true,
      },
    ],
    handler({ totalSteps, topic }) {
      console.log('[Teaching] Starting teaching session:', topic);
      setIsTeaching(true);
      setIsPaused(false);
      setTotalSteps(totalSteps);
      setCurrentStepNumber(0);
      setCurrentStep(`Starting: ${topic}`);
      return `Teaching session started: ${topic} with ${totalSteps} steps`;
    },
  });

  useFrontendTool({
    name: 'updateTeachingStep',
    description: 'Update the current teaching step',
    parameters: [
      {
        name: 'stepNumber',
        description: 'Current step number',
        type: 'number',
        required: true,
      },
      {
        name: 'stepDescription',
        description: 'Description of the current step',
        type: 'string',
        required: true,
      },
    ],
    handler({ stepNumber, stepDescription }) {
      setCurrentStepNumber(stepNumber);
      setCurrentStep(stepDescription);
      return `Updated to step ${stepNumber}: ${stepDescription}`;
    },
  });

  useFrontendTool({
    name: 'endTeaching',
    description: 'End the current teaching session',
    parameters: [],
    handler() {
      console.log('[Teaching] Ending teaching session');
      setIsTeaching(false);
      setIsPaused(false);
      setCurrentStep('');
      setAnnotations([]);
      setAnnotationMessage('');
      return 'Teaching session ended';
    },
  });

  // Frontend tool for updating game mode
  useFrontendTool({
    name: 'setTeachingMode',
    description: 'Set the teaching mode for the Sudoku game',
    parameters: [
      {
        name: 'mode',
        description: 'The teaching mode: play, teach, or practice',
        type: 'string',
        required: true,
      },
    ],
    handler({ mode }) {
      setGameMode(mode as GameMode);
      return `Teaching mode set to ${mode}`;
    },
  });

  // Frontend tool for analyzing player's move
  useFrontendTool({
    name: 'recordMove',
    description: 'Record and analyze a player move in the Sudoku game',
    parameters: [
      {
        name: 'row',
        description: 'Row index (0-8)',
        type: 'number',
        required: true,
      },
      {
        name: 'col',
        description: 'Column index (0-8)',
        type: 'number',
        required: true,
      },
      {
        name: 'value',
        description: 'The value placed (1-9)',
        type: 'number',
        required: true,
      },
    ],
    handler({ row, col, value }) {
      console.log(`Move recorded: placed ${value} at row ${row}, col ${col}`);
      return `Move recorded: placed ${value} at row ${row}, col ${col}`;
    },
  });

  // Frontend tool for updating grid state
  useFrontendTool({
    name: 'getCurrentGrid',
    description: 'Get the current state of the Sudoku grid',
    parameters: [],
    handler() {
      console.log('[Grid] Sending current grid to agent:', currentGrid);
      return JSON.stringify({ grid: currentGrid });
    },
  });

  // Frontend tool to get the next solving move (combines grid retrieval + analysis)
  useFrontendTool({
    name: 'getNextSolvingMove',
    description: 'Analyze the current grid and return the next best cell to fill with explanation. Returns row, col, value, and explanation. Use this for step-by-step solving - much simpler than calling getCurrentGrid then suggest_next_move.',
    parameters: [],
    handler() {
      console.log('[Solver] Analyzing grid for next move:', currentGrid);
      
      if (currentGrid.length === 0) {
        return JSON.stringify({
          has_suggestion: false,
          message: 'No grid loaded yet. Please start a game first.'
        });
      }
      
      const strategies = analyzeStrategies(currentGrid as SudokuGrid);
      
      if (strategies.length === 0) {
        return JSON.stringify({
          has_suggestion: false,
          message: 'No obvious moves found. The puzzle may need advanced techniques.'
        });
      }
      
      // Get the best strategy (first one found - naked singles are prioritized)
      const bestMove = strategies[0];
      const cell = bestMove.cells[0];
      
      // Generate explanation based on strategy type
      let explanation = bestMove.description;
      if (bestMove.strategy === 'naked_single') {
        explanation = `This cell can only be ${bestMove.value} because all other numbers are already in its row, column, or box.`;
      } else if (bestMove.strategy.includes('hidden_single')) {
        explanation = `The number ${bestMove.value} can only go in this cell within its ${bestMove.strategy.includes('row') ? 'row' : bestMove.strategy.includes('col') ? 'column' : 'box'}.`;
      }
      
      console.log('[Solver] Found move:', { row: cell.row, col: cell.col, value: bestMove.value, strategy: bestMove.strategy });
      
      // Create highlights for ALL cells in row, column, and box to show constraints
      const highlights: CellAnnotation[] = [];
      
      // Add row highlights (light yellow) - ALL cells in the row
      for (let c = 0; c < 9; c++) {
        if (c !== cell.col) {
          highlights.push({
            row: cell.row,
            col: c,
            type: 'highlight',
            color: 'yellow',
          });
        }
      }
      
      // Add column highlights (light yellow) - ALL cells in the column
      for (let r = 0; r < 9; r++) {
        if (r !== cell.row) {
          highlights.push({
            row: r,
            col: cell.col,
            type: 'highlight',
            color: 'yellow',
          });
        }
      }
      
      // Add box highlights (light yellow) - ALL cells in the 3x3 box
      const boxStartRow = Math.floor(cell.row / 3) * 3;
      const boxStartCol = Math.floor(cell.col / 3) * 3;
      for (let r = boxStartRow; r < boxStartRow + 3; r++) {
        for (let c = boxStartCol; c < boxStartCol + 3; c++) {
          if (r !== cell.row || c !== cell.col) {
            // Check if not already highlighted (row/col intersection)
            const alreadyHighlighted = highlights.some(h => h.row === r && h.col === c);
            if (!alreadyHighlighted) {
              highlights.push({
                row: r,
                col: c,
                type: 'highlight',
                color: 'yellow',
              });
            }
          }
        }
      }
      
      // Add target cell LAST so it appears on top with green highlight and value label
      highlights.push({
        row: cell.row,
        col: cell.col,
        type: 'highlight',
        color: 'green',
        label: String(bestMove.value)
      });
      
      return JSON.stringify({
        has_suggestion: true,
        row: cell.row,
        col: cell.col,
        value: bestMove.value,
        strategy: bestMove.strategy,
        explanation: explanation,
        // Pre-formatted cells for highlightCells with constraints highlighted
        highlightCells: highlights
      });
    },
    render: ({ result, status }) => {
      // Show loading indicator while executing
      if (status === 'executing') {
        return <ThinkingIndicator message="Finding best move..." />;
      }
      
      if (!result) {
        return <div className="text-sm text-gray-500 italic">No suggestion available</div>;
      }
      
      try {
        const data = typeof result === 'string' ? JSON.parse(result) : result;
        
        if (data.has_suggestion) {
          // Apply visual highlights to the board
          if (data.highlightCells && data.highlightCells.length > 0) {
            setAnnotations(data.highlightCells);
            setAnnotationMessage(data.explanation || '');
          }
          
          return (
            <HintCard
              cell={{ row: data.row, col: data.col }}
              value={data.value}
              strategy={data.strategy || 'Suggestion'}
              explanation={data.explanation || 'Try this move'}
              confidence="high"
              onApply={() => {
                console.log('[HintCard] Applying hint:', data);
                setExternalCellUpdate({
                  row: data.row,
                  col: data.col,
                  value: data.value,
                  timestamp: Date.now()
                });
              }}
            />
          );
        }
        return <div className="text-sm text-gray-500 italic">No moves available</div>;
      } catch (e) {
        console.error('Failed to render getNextSolvingMove:', e);
        return <div className="text-sm text-red-500 italic">Error loading suggestion</div>;
      }
    },
  });

  // Frontend tool for AI to place a number in a cell (for step-by-step solving)
  useFrontendTool({
    name: 'fillCell',
    description: 'Place a number in a specific cell. Use this after explaining a move during step-by-step solving to actually fill in the cell so the solver can find the next move.',
    parameters: [
      {
        name: 'row',
        description: 'Row index (0-8)',
        type: 'number',
        required: true,
      },
      {
        name: 'col',
        description: 'Column index (0-8)',
        type: 'number',
        required: true,
      },
      {
        name: 'value',
        description: 'The value to place (1-9)',
        type: 'number',
        required: true,
      },
    ],
    handler({ row, col, value }) {
      console.log('[AI] Filling cell:', { row, col, value });
      setExternalCellUpdate({
        row,
        col,
        value,
        timestamp: Date.now()
      });
      return `Placed ${value} at row ${row}, column ${col}`;
    },
  });
  // Frontend tool for analyzing if user made a wrong move
  useFrontendTool({
    name: 'analyzeWrongMove',
    description: 'Check if the user recently made a wrong move and explain why it conflicts. Call this BEFORE giving hints to provide better feedback. Returns conflicting cells with yellow (user cell) and red (conflict) highlights.',
    parameters: [],
    handler() {
      console.log('[Analyzer] Analyzing for wrong moves, lastUserMove:', lastUserMove);
      
      if (!lastUserMove || lastUserMove.value === null) {
        return JSON.stringify({
          hasWrongMove: false,
          message: 'No recent user move to analyze'
        });
      }
      
      const conflicts = findConflicts(
        currentGrid as SudokuGrid,
        lastUserMove.row,
        lastUserMove.col,
        lastUserMove.value
      );
      
      if (conflicts.length > 0) {
        console.log('[Analyzer] Found conflicts:', conflicts);
        
        // Build highlight cells: user's cell in yellow, conflicting cells in red
        const highlightCells = [
          {
            row: lastUserMove.row,
            col: lastUserMove.col,
            type: 'highlight',
            color: 'yellow',
            label: String(lastUserMove.value)
          },
          ...conflicts.map(c => ({
            row: c.conflictingCell.row,
            col: c.conflictingCell.col,
            type: 'highlight',
            color: 'red',
            label: String(lastUserMove.value)
          }))
        ];
        
        return JSON.stringify({
          hasWrongMove: true,
          row: lastUserMove.row,
          col: lastUserMove.col,
          value: lastUserMove.value,
          conflicts: conflicts,
          conflictType: conflicts[0].type,
          explanation: conflicts[0].message,
          highlightCells: highlightCells
        });
      }
      
      return JSON.stringify({
        hasWrongMove: false,
        message: 'The last move has no conflicts'
      });
    },
  });
  // Frontend tool for AI to highlight cells (visual only - agent handles voice via speak_message)
  useFrontendTool({
    name: 'highlightCells',
    description: 'Highlight cells on the board with persistent highlighting. Highlights remain visible until user places a number or clears them. Use for teaching suggestions. NOTE: This is VISUAL ONLY - always call speak_message separately for voice output.',

    parameters: [
      {
        name: 'cells',
        description: 'Array of cell objects with: row (0-8), col (0-8), type ("highlight"/"circle"/"cross"), color ("blue"/"green"/"yellow"/"red"/"purple"), and optional label (string)',
        type: 'object',
        required: true,
      },
      {
        name: 'message',
        description: 'Explanation message to show with the highlights (displayed as text)',
        type: 'string',
        required: true,
      },
      {
        name: 'duration',
        description: 'How long to show highlights in milliseconds (default: 15000)',
        type: 'number',
        required: false,
      },
    ],
    handler({ cells, message, duration: _duration }) {
      console.log('Highlighting cells:', cells, 'Message:', message);
      
      // Validate and handle cells parameter
      if (!cells) {
        console.error('[Error] No cells provided to highlightCells');
        return 'Error: No cells provided';
      }
      
      // Handle both array and object format for cells
      let cellsArray;
      try {
        cellsArray = Array.isArray(cells) ? cells : [cells];
        console.log('[Highlight] Processed cells array:', cellsArray);
      } catch (err) {
        console.error('[Error] Error processing cells:', err);
        return 'Error: Invalid cells format';
      }
      
      // Show visual highlights (visual only - no voice)
      setAnnotations(cellsArray);
      setAnnotationMessage(message || '');
      
      return `Highlighted ${cellsArray.length} cells: ${message}`;
    },
  });

  // Frontend tool for clearing highlights
  useFrontendTool({
    name: 'clearHighlights',
    description: 'Clear all current highlights from the board',
    parameters: [],
    handler() {
      console.log('[Highlight] Manually clearing highlights');
      setAnnotations([]);
      setAnnotationMessage('');
      return 'Highlights cleared';
    },
  });

  // Frontend tool for voice output (calls backend TTS, plays audio)
  useFrontendTool({
    name: 'speak_message',
    description: 'Speak a message using ElevenLabs TTS. Use this for all voice output during teaching.',
    parameters: [
      {
        name: 'message',
        description: 'The text message to speak (keep under 25 words for quick playback)',
        type: 'string',
        required: true,
      },
    ],
    handler({ message }) {
      console.log('[Voice] Speaking message:', message);
      
      if (!message || message.trim().length === 0) {
        return 'Error: Empty message';
      }
      
      // Fire-and-forget async audio playback
      (async () => {
        try {
          // Call backend TTS API
          const response = await fetch('/api/tts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: message }),
          });
          
          const contentType = response.headers.get('content-type');
          
          // Check if response is JSON (error) or audio
          if (contentType?.includes('application/json')) {
            console.log('[Warning] TTS not configured, falling back to browser TTS');
            
            // Fallback to browser TTS
            if ('speechSynthesis' in window) {
              const utterance = new SpeechSynthesisUtterance(message);
              utterance.rate = 0.9;
              utterance.pitch = 1.0;
              window.speechSynthesis.speak(utterance);
            }
            return;
          }
          
          // Play audio from ElevenLabs
          const audioBlob = await response.blob();
          const audioUrl = URL.createObjectURL(audioBlob);
          const audioElement = new Audio(audioUrl);
          
          audioElement.onended = () => {
            URL.revokeObjectURL(audioUrl);
          };
          
          await audioElement.play();
        } catch (error) {
          console.error('Failed to speak message:', error);
          
          // Fallback to browser TTS on error
          if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(message);
            utterance.rate = 0.9;
            utterance.pitch = 1.0;
            window.speechSynthesis.speak(utterance);
          }
        }
      })();
      
      // Return immediately (synchronous) while audio plays in background
      return `Speaking: "${message}"`;
    },
  });

  // Note: useHumanInTheLoop tools (askNumber, askStrategy, askCellSelection) are available 
  // but removed due to React 19 type compatibility issues. They can be re-enabled 
  // once CopilotKit provides updated types for React 19.

  // Render backend tool calls with custom UI components
  useRenderToolCall({
    name: 'explain_sudoku_basics',
    render: ({ status, result }) => {
      if (status === 'executing') {
        return <ThinkingIndicator message="Preparing explanation..." />;
      }
      
      if (status === 'complete' && result) {
        try {
          const data = typeof result === 'string' ? JSON.parse(result) : result;
          const stepTitles: Record<string, string> = {
            'box': '3×3 Box Rule',
            'row': 'Row Rule',
            'column': 'Column Rule',
            'all': 'Summary'
          };
          const stepIcons: Record<string, string> = {
            'box': '▦',
            'row': '⬌',
            'column': '⬍',
            'all': '✓'
          };
          
          return (
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 my-2">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">{stepIcons[data.step] || '📚'}</span>
                <h3 className="font-bold text-indigo-900">
                  {stepTitles[data.step] || 'Sudoku Basics'}
                </h3>
              </div>
              <p className="text-sm text-indigo-900 mb-3">{data.message || data.explanation}</p>
              {data.example_cells && data.example_cells.length > 0 && (
                <div className="mt-2 p-2 bg-indigo-100 rounded">
                  <p className="text-xs text-indigo-700">
                    Watch the highlighted cells on the board to see this rule in action!
                  </p>
                </div>
              )}
            </div>
          );
        } catch (e) {
          console.error('Failed to parse explain_sudoku_basics result:', e);
        }
      }
      return null;
    }
  });

  useRenderToolCall({
    name: 'suggest_next_move',
    render: ({ status, args, result }) => {
      if (status === 'executing') {
        return <ThinkingIndicator message="Analyzing puzzle..." />;
      }
      
      if (status === 'complete' && result) {
        try {
          const data = typeof result === 'string' ? JSON.parse(result) : result;
          if (data.has_suggestion) {
            return (
              <HintCard
                cell={{ row: data.row, col: data.col }}
                value={data.value}
                strategy={data.strategy || 'Suggestion'}
                explanation={data.explanation || 'Try this move'}
                confidence="high"
                onApply={() => {
                  setExternalCellUpdate({
                    row: data.row,
                    col: data.col,
                    value: data.value,
                    timestamp: Date.now()
                  });
                }}
              />
            );
          }
        } catch (e) {
          console.error('Failed to parse suggest_next_move result:', e);
        }
      }
      return null;
    }
  });

  useRenderToolCall({
    name: 'analyze_sudoku_grid',
    render: ({ status, result }) => {
      if (status === 'executing') {
        return <ThinkingIndicator message="Analyzing grid..." />;
      }
      
      if (status === 'complete' && result) {
        try {
          const data = typeof result === 'string' ? JSON.parse(result) : result;
          if (data.strategies && Array.isArray(data.strategies)) {
            return (
              <AnalysisCard
                title="Grid Analysis"
                items={data.strategies.map((s: any) => ({
                  label: s.strategy || 'Strategy',
                  value: s.description || '',
                  color: s.difficulty === 'easy' ? 'green' : 
                         s.difficulty === 'medium' ? 'yellow' : 'red'
                }))}
              />
            );
          }
        } catch (e) {
          console.error('Failed to parse analyze_sudoku_grid result:', e);
        }
      }
      return null;
    }
  });

  useRenderToolCall({
    name: 'explain_strategy',
    render: ({ status, result }) => {
      if (status === 'executing') {
        return <ThinkingIndicator message="Explaining strategy..." />;
      }
      
      if (status === 'complete' && result) {
        try {
          const data = typeof result === 'string' ? JSON.parse(result) : result;
          return (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 my-2">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
                <h3 className="font-bold text-purple-900">
                  {data.strategy_name || 'Strategy Explanation'}
                </h3>
              </div>
              <div className="space-y-2 text-sm text-purple-900">
                <p className="font-medium">{data.description || data.explanation}</p>
                {data.when_to_use && (
                  <div className="mt-2 p-2 bg-purple-100 rounded">
                    <p className="text-xs font-semibold mb-1">When to use:</p>
                    <p className="text-xs">{data.when_to_use}</p>
                  </div>
                )}
              </div>
            </div>
          );
        } catch (e) {
          console.error('Failed to parse explain_strategy result:', e);
        }
      }
      return null;
    }
  });

  useRenderToolCall({
    name: 'validate_move',
    render: ({ status, args, result }) => {
      if (status === 'executing') {
        return <ThinkingIndicator message="Validating move..." />;
      }
      
      if (status === 'complete' && result) {
        try {
          const data = typeof result === 'string' ? JSON.parse(result) : result;
          const isValid = data.is_valid || data.valid;
          return (
            <div className={`rounded-lg p-3 ${isValid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <div className="flex items-center gap-2">
                <span className="text-lg">{isValid ? '✓' : '✗'}</span>
                <span className={`font-semibold ${isValid ? 'text-green-800' : 'text-red-800'}`}>
                  {isValid ? 'Valid move!' : 'Invalid move'}
                </span>
              </div>
              {data.message && (
                <p className={`mt-1 text-sm ${isValid ? 'text-green-700' : 'text-red-700'}`}>
                  {data.message}
                </p>
              )}
            </div>
          );
        } catch (e) {
          console.error('Failed to parse validate_move result:', e);
        }
      }
      return null;
    }
  });

  // Handler for Next Step button - sends continuation message to agent
  const handleNextStep = useCallback(async () => {
    if (isLoading) return; // Don't send if already processing
    
    setIsPaused(false);
    // Clear previous annotations before next step
    setAnnotations([]);
    setAnnotationMessage('');
    
    console.log('[Chat] Sending continuation message to agent');
    try {
      await appendMessage(
        new TextMessage({
          role: MessageRole.User,
          content: 'Continue to the next step',
        })
      );
    } catch (error) {
      console.error('Failed to send continuation message:', error);
    }
  }, [appendMessage, isLoading]);

  // Handler for "I'll Try Myself" button - ends teaching but shows hint prompt
  const handleTryMyself = useCallback(() => {
    console.log('[User] User wants to try themselves');
    setIsTeaching(false);
    setIsPaused(false);
    setAnnotations([]);
    setAnnotationMessage('');
    setShowHintPrompt(true); // Show the "Need a hint?" prompt
  }, []);

  // Handler for quick hint from the hint prompt
  const handleQuickHint = useCallback(async () => {
    console.log('[User] User requested quick hint');
    setShowHintPrompt(false);
    try {
      await appendMessage(
        new TextMessage({
          role: MessageRole.User,
          content: 'Give me a hint for my next move',
        })
      );
    } catch (error) {
      console.error('Failed to send hint request:', error);
    }
  }, [appendMessage]);

  // Handler to dismiss the hint prompt
  const handleDismissHintPrompt = useCallback(() => {
    setShowHintPrompt(false);
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Back to Home Button */}
      <div className="fixed top-4 left-4 z-50">
        <a
          href="/"
          className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 text-gray-700 hover:text-indigo-600"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          <span className="font-medium">Back to Games</span>
        </a>
      </div>
      
      <TeachingProgress
        isTeaching={isTeaching}
        isPaused={isPaused}
        currentStep={currentStep}
        totalSteps={totalSteps}
        currentStepNumber={currentStepNumber}
        onPause={() => setIsPaused(true)}
        onResume={() => setIsPaused(false)}
        onStop={() => {
          setIsTeaching(false);
          setIsPaused(false);
          setAnnotations([]);
          setAnnotationMessage('');
          setShowHintPrompt(false);
        }}
        onNext={handleNextStep}
        isNextDisabled={isLoading}
        onTryMyself={handleTryMyself}
        showHintPrompt={showHintPrompt}
        onQuickHint={handleQuickHint}
        onDismissHintPrompt={handleDismissHintPrompt}
      />
      <CopilotSidebar
        clickOutsideToClose={false}
        defaultOpen={false}
        labels={{
          title: 'Sudoku AI Tutor',
          initial: "I can see your Sudoku board! Ready to help with:\n - Step-by-step basics (with voice)\n - Hints when you're stuck\n - Solving strategies\n\nClick a suggestion below to get started!",
        }}
        markdownTagRenderers={markdownTagRenderers}
        suggestions={[
          {
            title: 'Learn Sudoku Basics',
            message: 'Explain the basic rules of Sudoku using this board as an example',
          },
          {
            title: 'Get a Hint',
            message: 'Give me a hint for the next move',
          },
          {
            title: 'Solve Step-by-Step',
            message: 'Solve this puzzle step by step. Show me ONE cell at a time with green highlight and the number to place. Start now.',
          },
          {
            title: 'Continue',
            message: 'Continue to the next step',
          },
          {
            title: 'Explain This Strategy',
            message: 'Explain the strategy you just used in more detail',
          },
        ]}
      >
        <div className="p-8">
          <SudokuGame 
            initialDifficulty="medium" 
            annotations={annotations}
            annotationMessage={annotationMessage}
            onGridChange={handleGridChange}
            externalCellUpdate={externalCellUpdate}
          />
        </div>
      </CopilotSidebar>
    </main>
  );
}
