// State of the agent, make sure this aligns with your agent's state.
export type AgentState = {
  proverbs: string[];
  sudoku_grid?: number[][] | null;
  last_move?: {
    row: number;
    col: number;
    value: number;
    timestamp: number;
  } | null;
  teaching_mode?: string;
  player_level?: string;
};

// Chat component state for tracking quizzes and hints
export interface ChatComponentState {
  activeQuiz: {
    type: 'cell' | 'number' | 'strategy' | 'move';
    question: string;
    answered: boolean;
    correct?: boolean;
  } | null;
  pendingHint: {
    cell: { row: number; col: number };
    value: number;
    applied: boolean;
  } | null;
}

// Sudoku agent state for CopilotKit integration
export interface SudokuAgentState {
  sudoku_grid: (number | null)[][];
  teaching_active: boolean;
  teaching_current_step: number;
  teaching_total_steps: number;
  teaching_topic: string;
  last_hint?: {
    row: number;
    col: number;
    value: number;
    strategy: string;
  };
}

// Chess agent state for CopilotKit integration
export interface ChessAgentState {
  chess_fen: string;
  chess_turn: 'white' | 'black';
  teaching_active: boolean;
  teaching_current_step: number;
  teaching_total_steps: number;
  teaching_topic: string;
  suggested_move?: {
    from: string;
    to: string;
    evaluation: number;
  };
}

// Markdown tag renderer props
export interface CellTagProps {
  row: number;
  col: number;
  value?: number;
  color?: 'green' | 'blue' | 'red' | 'yellow' | 'gray';
}

export interface SquareTagProps {
  square: string;
  piece?: string;
  color?: 'light' | 'dark' | 'highlight';
}

export interface StrategyTagProps {
  name: string;
  type?: 'basic' | 'intermediate' | 'advanced';
}

export interface OpeningTagProps {
  name: string;
  eco?: string;
}
