"""Chess agent state schema."""

from typing import Optional
from shared.base_state import BaseTeachingState


class ChessAgentState(BaseTeachingState):
    """State specific to Chess agent."""
    
    # Chess-specific state
    chess_fen: Optional[str] = None
    chess_game_mode: str = "practice"  # practice, vs_ai, learn
