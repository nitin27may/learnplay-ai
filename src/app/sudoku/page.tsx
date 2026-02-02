'use client';

import { SudokuGame } from '@/components/sudoku/SudokuGame';
import { CopilotSidebar } from '@copilotkit/react-ui';
import { useCoAgent, useFrontendTool, useCopilotChat } from '@copilotkit/react-core';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useVoiceMode } from '@/lib/hooks/useVoiceMode';
import { TeachingProgress } from '@/components/TeachingProgress';
import { CellAnnotation } from '@/lib/sudoku/annotations';
import { GameMode, SudokuGrid } from '@/lib/sudoku/types';
import { TextMessage, MessageRole } from '@copilotkit/runtime-client-gql';
import { analyzeStrategies } from '@/lib/sudoku/solver';

// Type for external cell updates
interface ExternalCellUpdate {
  row: number;
  col: number;
  value: number | null;
  timestamp: number;
}

export default function SudokuPage() {
  const voice = useVoiceMode();
  const [gameMode, setGameMode] = useState<GameMode>('play');
  const [annotations, setAnnotations] = useState<CellAnnotation[]>([]);
  const [annotationMessage, setAnnotationMessage] = useState<string>('');
  const [currentGrid, setCurrentGrid] = useState<(number | null)[][]>([]);
  const prevGridRef = useRef<string>('');
  
  // State for AI-controlled cell placement
  const [externalCellUpdate, setExternalCellUpdate] = useState<ExternalCellUpdate | null>(null);
  
  // Teaching state
  const [isTeaching, setIsTeaching] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentStep, setCurrentStep] = useState('');
  const [totalSteps, setTotalSteps] = useState(0);
  const [currentStepNumber, setCurrentStepNumber] = useState(0);

  // CopilotKit chat hook for programmatic messaging
  const { appendMessage, isLoading } = useCopilotChat();

  // Connect to the Sudoku teaching agent
  const { state, setState } = useCoAgent({
    name: 'sample_agent',
  });

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

  // Handle grid changes - update agent state  
  const handleGridChange = useCallback((newGrid: (number | null)[][]) => {
    setCurrentGrid(newGrid);
    setState((prev: Record<string, unknown>) => ({
      ...prev,
      sudoku_grid: newGrid,
    }));
    // Clear annotations when user makes a move
    if (annotations.length > 0) {
      setAnnotations([]);
      setAnnotationMessage('');
    }
  }, [setState, annotations.length]);

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
      console.log('📚 Starting teaching session:', topic);
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
      console.log('✅ Ending teaching session');
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
      setState({
        ...state,
        teaching_mode: mode,
      });
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
      setState({
        ...state,
        last_move: { row, col, value, timestamp: Date.now() },
      });
      return `Move recorded: placed ${value} at row ${row}, col ${col}`;
    },
  });

  // Frontend tool for updating grid state
  useFrontendTool({
    name: 'getCurrentGrid',
    description: 'Get the current state of the Sudoku grid',
    parameters: [],
    handler() {
      console.log('📊 Sending current grid to agent:', currentGrid);
      setState({
        ...state,
        sudoku_grid: currentGrid,
      });
      return JSON.stringify({ grid: currentGrid });
    },
  });

  // Frontend tool to get the next solving move (combines grid retrieval + analysis)
  useFrontendTool({
    name: 'getNextSolvingMove',
    description: 'Analyze the current grid and return the next best cell to fill with explanation. Returns row, col, value, and explanation. Use this for step-by-step solving - much simpler than calling getCurrentGrid then suggest_next_move.',
    parameters: [],
    handler() {
      console.log('🎯 Analyzing grid for next move:', currentGrid);
      
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
      
      console.log('✅ Found move:', { row: cell.row, col: cell.col, value: bestMove.value, strategy: bestMove.strategy });
      
      return JSON.stringify({
        has_suggestion: true,
        row: cell.row,
        col: cell.col,
        value: bestMove.value,
        strategy: bestMove.strategy,
        explanation: explanation,
        // Pre-formatted cells for highlightCells
        highlightCells: [{
          row: cell.row,
          col: cell.col,
          type: 'highlight',
          color: 'green',
          label: String(bestMove.value)
        }]
      });
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
      console.log('🤖 AI filling cell:', { row, col, value });
      setExternalCellUpdate({
        row,
        col,
        value,
        timestamp: Date.now()
      });
      return `Placed ${value} at row ${row}, column ${col}`;
    },
  });

  // Frontend tool for AI to highlight cells
  useFrontendTool({
    name: 'highlightCells',
    description: 'Highlight cells on the board with persistent highlighting and speak the message using Eleven Labs TTS. Highlights remain visible until user places a number or clears them. Use for teaching suggestions.',

    parameters: [
      {
        name: 'cells',
        description: 'Array of cell objects with: row (0-8), col (0-8), type ("highlight"/"circle"/"cross"), color ("blue"/"green"/"yellow"/"red"/"purple"), and optional label (string)',
        type: 'object',
        required: true,
      },
      {
        name: 'message',
        description: 'Explanation message to show with the highlights AND speak aloud using Eleven Labs',
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
        console.error('❌ No cells provided to highlightCells');
        return 'Error: No cells provided';
      }
      
      // Handle both array and object format for cells
      let cellsArray;
      try {
        cellsArray = Array.isArray(cells) ? cells : [cells];
        console.log('✅ Processed cells array:', cellsArray);
      } catch (err) {
        console.error('❌ Error processing cells:', err);
        return 'Error: Invalid cells format';
      }
      
      // Show visual highlights
      setAnnotations(cellsArray);
      setAnnotationMessage(message || '');
      
      // Speak the message using Eleven Labs TTS (fire and forget)
      if (message) {
        console.log('🔊 Speaking explanation with Eleven Labs:', message);
        // Don't await - let it run in background
        voice.speak(message).catch((err) => {
          console.warn('⚠️ TTS failed, continuing without voice:', err);
        });
      }
      
      // Return immediately - don't wait for voice
      return `Highlighted ${cellsArray.length} cells with voice: ${message}`;
    },
  });

  // Frontend tool for clearing highlights
  useFrontendTool({
    name: 'clearHighlights',
    description: 'Clear all current highlights from the board',
    parameters: [],
    handler() {
      console.log('🧹 Manually clearing highlights');
      setAnnotations([]);
      setAnnotationMessage('');
      return 'Highlights cleared';
    },
  });

  // Frontend tool for playing audio from agent
  useFrontendTool({
    name: 'playAgentAudio',
    description: 'Play audio generated by the agent (base64 encoded MP3)',
    parameters: [
      {
        name: 'audio',
        description: 'Base64 encoded audio data',
        type: 'string',
        required: true,
      },
      {
        name: 'message',
        description: 'The text message being spoken',
        type: 'string',
        required: false,
      },
    ],
    handler({ audio, message }) {
      console.log('🔊 Playing agent-generated audio:', message);
      
      try {
        // Decode base64 audio
        const binaryString = atob(audio);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        // Create blob and play
        const blob = new Blob([bytes], { type: 'audio/mpeg' });
        const audioUrl = URL.createObjectURL(blob);
        const audioElement = new Audio(audioUrl);
        
        audioElement.onended = () => {
          URL.revokeObjectURL(audioUrl);
        };
        
        audioElement.play();
        
        return 'Audio playback started';
      } catch (error) {
        console.error('Failed to play audio:', error);
        return 'Audio playback failed';
      }
    },
  });

  // Voice transcript is displayed - user can copy/paste or it can be shown in the UI
  // Using useCopilotChat's appendMessage to programmatically continue teaching

  // Handler for Next Step button - sends continuation message to agent
  const handleNextStep = useCallback(async () => {
    if (isLoading) return; // Don't send if already processing
    
    setIsPaused(false);
    // Clear previous annotations before next step
    setAnnotations([]);
    setAnnotationMessage('');
    
    console.log('📤 Sending continuation message to agent');
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

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
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
        }}
        onNext={handleNextStep}
        isNextDisabled={isLoading}
      />
      <CopilotSidebar
        clickOutsideToClose={false}
        defaultOpen={false}
        labels={{
          title: 'Sudoku AI Tutor',
          initial: "Hello! I'm your interactive Sudoku tutor with voice and visual guidance. Ask me to explain the basics, give hints, or solve step-by-step!",
        }}
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