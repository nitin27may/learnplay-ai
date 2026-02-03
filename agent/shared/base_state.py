"""Base state schema for all teaching agents."""

from typing import Optional, List
from copilotkit import CopilotKitState


class BaseTeachingState(CopilotKitState):
    """Base state for all teaching agents."""
    
    # Teaching session tracking
    teaching_active: bool = False
    teaching_topic: str = ""
    teaching_current_step: int = 0
    teaching_total_steps: int = 0
    next_step_requested: bool = False
    
    # Player info
    player_level: str = "beginner"  # beginner, intermediate, advanced
    
    # Proverbs (for home page compatibility)
    proverbs: List[str] = []
