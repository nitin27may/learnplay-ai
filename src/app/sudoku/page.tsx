'use client';

import { SudokuGame } from '@/components/sudoku/SudokuGame';
import { CopilotSidebar } from '@copilotkit/react-ui';
import { useCoAgent, useFrontendTool, useCopilotChatSuggestions } from '@copilotkit/react-core';
import { AgentState } from '@/lib/types';
import { useState, useEffect, useRef } from 'react';
import { GameMode } from '@/lib/sudoku/types';
import { useVoiceMode } from '@/lib/hooks/useVoiceMode';
import { VoiceControls } from '@/components/VoiceControls';
import { CellAnnotation } from '@/lib/sudoku/annotations';
import { TeachingControls } from '@/components/TeachingControls';

export default function SudokuPage() {
  const [gameMode, setGameMode] = useState<GameMode>('play');
  const voice = useVoiceMode();
  const lastMessageRef = useRef<string>('');
  const [annotations, setAnnotations] = useState<CellAnnotation[]>([]);
  const [annotationMessage, setAnnotationMessage] = useState<string>('');
  const [currentGrid, setCurrentGrid] = useState<(number | null)[][]>([]);
  const [teachingStep, setTeachingStep] = useState(0);

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
    }
  }, [currentGrid]);

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
      return { grid: currentGrid };
    },
  });

  // Frontend tool for AI to show interactive follow-up actions
  useFrontendTool({
    name: 'showNextStepButtons',
    description: 'Show interactive buttons for the user to continue learning without typing',
    parameters: [
      {
        name: 'buttons',
        description: 'Array of button objects with label and action',
        type: 'object',
        required: true,
      },
    ],
    handler({ buttons }) {
      console.log('🔘 Showing next step buttons:', buttons);
      // These will appear as suggestions in CopilotKit
      return { success: true, buttons };
    },
  });

  // Frontend tool for progressive highlighting
  useFrontendTool({
    name: 'highlightProgressive',
    description: 'Highlight cells progressively - first target cell, then related cells step by step',
    parameters: [
      {
        name: 'step',
        description: 'Current teaching step number',
        type: 'number',
        required: true,
      },
      {
        name: 'cells',
        description: 'Cells to highlight in this step',
        type: 'object',
        required: true,
      },
      {
        name: 'message',
        description: 'What to explain in this step',
        type: 'string',
        required: true,
      },
      {
        name: 'duration',
        description: 'How long to show (default 15000ms)',
        type: 'number',
        required: false,
      },
    ],
    handler({ step, cells, message, duration = 15000 }) {
      console.log(`📚 Teaching Step ${step}:`, message);
      setTeachingStep(step);
      setAnnotations(cells);
      setAnnotationMessage(`Step ${step}: ${message}`);
      
      if (message) {
        voice.speak(message);
      }
      
      setTimeout(() => {
        setAnnotations([]);
        setAnnotationMessage('');
      }, duration);
    },
  });

  // Frontend tool for AI to highlight cells
  useFrontendTool({
    name: 'highlightCells',
    description: 'Highlight specific cells on the Sudoku board to visually explain a concept. ALWAYS call this when explaining strategies or showing examples.',
    parameters: [
      {
        name: 'cells',
        description: 'Array of cell objects with: row (0-8), col (0-8), type ("highlight"/"circle"/"cross"), color ("blue"/"green"/"yellow"/"red"/"purple"), and optional label (string)',
        type: 'object',
        required: true,
      },
      {
        name: 'message',
        description: 'Explanation message to show with the highlights AND speak aloud',
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
    handler({ cells, message, duration = 15000 }) {
      console.log('🎨 Highlighting cells:', cells, 'Message:', message);
      
      // Show visual highlights
      setAnnotations(cells);
      setAnnotationMessage(message);
      
      // Speak the explanation simultaneously
      if (message) {
        console.log('🔊 Speaking explanation:', message);
        voice.speak(message);
      }
      
      // Auto-clear after duration
      setTimeout(() => {
        console.log('🧹 Clearing highlights');
        setAnnotations([]);
        setAnnotationMessage('');
      }, duration);
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
    },
  });

  // Voice transcript is displayed - user can copy/paste or it can be shown in the UI
  // For now, the transcript is just displayed and users can type it into the chat
  // CopilotKit doesn't expose a direct sendMessage API in the current version

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <CopilotSidebar
        clickOutsideToClose={false}
        defaultOpen={false}
        labels={{
          title: 'Sudoku AI Tutor',
          initial: "Hello! I'm your multi-modal Sudoku tutor. I'll show you strategies by highlighting cells on the board while explaining them with voice. Try asking me to 'show you' something!",
        }}
        suggestions={[
          {
            title: 'Teach Me Step-by-Step',
            message: 'Find an empty cell and teach me step by step what number goes there',
          },
          {
            title: 'Show Next Move',
            message: 'Show me the next move I should make with progressive highlighting',
          },
          {
            title: 'Explain Strategy',
            message: 'Teach me a Sudoku strategy using step-by-step visual examples',
          },
        ]}
        defaultOpen={false}
      >
        <div className="p-8">
          {/* Mode Selector */}
          <div className="max-w-7xl mx-auto mb-6">
            <div className="bg-white p-4 rounded-lg shadow-md flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-800">Teaching Mode</h2>
                <p className="text-sm text-gray-600">
                  {gameMode === 'play' && 'Play independently, ask for help anytime'}
                  {gameMode === 'teach' && 'AI will guide you through each move'}
                  {gameMode === 'practice' && 'Practice specific strategies'}
                </p>
              </div>
              <div className="flex gap-2">
                {(['play', 'teach', 'practice'] as GameMode[]).map((mode) => (
                  <button
                    key={mode}
                    className={`
                      px-4 py-2 rounded-lg font-semibold capitalize transition-colors
                      ${gameMode === mode
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}
                    `}
                    onClick={() => {
                      setGameMode(mode);
                      setState({ ...state, teaching_mode: mode });
                    }}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Voice Mode Controls */}
          <div className="max-w-7xl mx-auto mb-6">
            <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">Voice Interaction</h3>
                  <p className="text-sm text-gray-600">
                    Speak your questions and receive voice responses from your AI tutor
                  </p>
                </div>
                <VoiceControls
                  isListening={voice.isListening}
                  isSpeaking={voice.isSpeaking}
                  isSupported={voice.isSupported}
                  onStartListening={voice.startListening}
                  onStopListening={voice.stopListening}
                  onStopSpeaking={voice.stopSpeaking}
                />
              </div>
              {voice.transcript && (
                <div className="mt-3 p-3 bg-gray-50 rounded border border-gray-200">
                  <p className="text-xs font-medium text-gray-600 mb-1">Transcript:</p>
                  <p className="text-sm text-gray-800">{voice.transcript}</p>
                </div>
              )}
            </div>
          </div>

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

        <TeachingControls 
          step={teachingStep}
          onAction={(action) => {
            console.log('🎮 User clicked:', action);
            // This will trigger the agent to respond to the action
            setState({ ...state, last_action: action });
          }}
        />
      </CopilotSidebar>
    </main>
  );
}