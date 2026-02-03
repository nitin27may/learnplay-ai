"""Sudoku agent state schema."""

from typing import List, Optional, Dict, Any
from shared.base_state import BaseTeachingState


class SudokuAgentState(BaseTeachingState):
    """State specific to Sudoku agent."""
    
    # Page context
    current_page: Optional[str] = None
    page_ready: bool = False
    
    # Sudoku-specific state
    sudoku_grid: Optional[List[List[Optional[int]]]] = None
    last_move: Optional[Dict[str, Any]] = None
    teaching_mode: str = "play"  # play, teach, practice
