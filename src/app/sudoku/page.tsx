'use client';

import { SudokuGame } from '@/components/sudoku/SudokuGame';
import { CopilotSidebar } from '@copilotkit/react-ui';
import { useCoAgent, useFrontendTool, useCopilotChatSuggestions } from '@copilotkit/react-core';
import { AgentState } from '@/lib/types';
import { useState, useEffect, useRef } from 'react';
import { GameMode } from '@/lib/sudoku/types';
import { useVoiceMode } from '@/lib/hooks/useVoiceMode';
import { TeachingProgress } from '@/components/TeachingProgress';
import { CellAnnotation } from '@/lib/sudoku/annotations';

export default function SudokuPage() {
  const [gameMode, setGameMode] = useState<GameMode>('play');
  const voice = useVoiceMode();
  const lastMessageRef = useRef<string>('');
  const [annotations, setAnnotations] = useState<CellAnnotation[]>([]);
  const [annotationMessage, setAnnotationMessage] = useState<string>('');
  const [currentGrid, setCurrentGrid] = useState<(number | null)[][]>([]);
  
  // Teaching state
  const [isTeaching, setIsTeaching] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [gameIsPaused, setGameIsPaused] = useState(false);
  const [currentStep, setCurrentStep] = useState('');
  const [totalSteps, setTotalSteps] = useState(0);
  const [currentStepNumber, setCurrentStepNumber] = useState(0);

  // Connect to the Sudoku teaching agent
  const { state, setState } = useCoAgent({
    name: 'sample_agent',
  });

  // Sync grid to agent state whenever it changes
  useEffect(() => {
    if (currentGrid.length > 0) {
      console.log('📊 Syncing grid to agent:', currentGrid);
      setState({
        ...state,
        sudoku_grid: currentGrid,
      });
      
      // Clear highlights when user makes a move
      if (annotations.length > 0) {
        console.log('✅ User made a move, clearing highlights');
        setAnnotations([]);
        setAnnotationMessage('');
      }
    }
  }, [currentGrid]);

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
    handler({ cells, message, duration }) {
      console.log('🎨 Highlighting cells:', cells, 'Message:', message);
      
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
  // For now, the transcript is just displayed and users can type it into the chat
  // CopilotKit doesn't expose a direct sendMessage API in the current version

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
        onNext={() => {
          setIsPaused(false);
          // Trigger agent continuation by updating state
          setState({
            ...state,
            next_step_requested: true,
            timestamp: Date.now(),
          });
        }}
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
            message: 'Teach me how to solve this puzzle step by step',
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
            onGridChange={(grid) => {
              console.log('🎮 Grid updated:', grid);
              setCurrentGrid(grid);
            }}
          />
        </div>
      </CopilotSidebar>
    </main>
  );
}