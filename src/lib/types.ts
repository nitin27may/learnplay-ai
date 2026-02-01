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
