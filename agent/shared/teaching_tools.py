"""Common teaching utilities shared across agents."""

from typing import Dict, Any


def format_step_message(step_number: int, total_steps: int, description: str) -> str:
    """
    Format a teaching step message with progress indication.
    
    Args:
        step_number: Current step number (1-based)
        total_steps: Total number of steps
        description: Description of the current step
        
    Returns:
        Formatted message string
    """
    return f"Step {step_number}/{total_steps}: {description}"


def should_end_session(step_number: int, total_steps: int) -> bool:
    """
    Determine if teaching session should end.
    
    Args:
        step_number: Current step number
        total_steps: Total steps in session
        
    Returns:
        True if session should end
    """
    return step_number >= total_steps


def validate_level(level: str) -> str:
    """
    Validate and normalize player level.
    
    Args:
        level: Player level string
        
    Returns:
        Normalized level string
    """
    valid_levels = ["beginner", "intermediate", "advanced"]
    level_lower = level.lower()
    
    if level_lower in valid_levels:
        return level_lower
    
    return "beginner"  # Default to beginner


def format_progress_percentage(current: int, total: int) -> float:
    """
    Calculate progress percentage.
    
    Args:
        current: Current step/progress value
        total: Total steps/maximum value
        
    Returns:
        Progress as percentage (0-100)
    """
    if total == 0:
        return 0.0
    
    return min(100.0, (current / total) * 100.0)
