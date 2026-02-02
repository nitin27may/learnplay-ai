"""
This is the main entry point for the agent.
It defines the workflow graph, state, tools, nodes and edges.
"""

from typing import List, Optional, Dict, Any

from langchain.tools import tool
from langchain.agents import create_agent
from copilotkit import CopilotKitMiddleware, CopilotKitState
from llm_provider import get_llm_provider
from sudoku_tools import (
    analyze_sudoku_grid,
    validate_move,
    suggest_next_move,
    explain_strategy,
    explain_sudoku_basics
)
from voice_tools import speak_message

@tool
def get_weather(location: str):
    """
    Get the weather for a given location.
    """
    return f"The weather for {location} is 70 degrees."

class AgentState(CopilotKitState):
    proverbs: List[str]
    sudoku_grid: Optional[List[List[Optional[int]]]] = None
    last_move: Optional[Dict[str, Any]] = None
    teaching_mode: str = "play"  # play, teach, practice
    player_level: str = "beginner"  # beginner, intermediate, advanced
    player_level: str = "beginner"  # beginner, intermediate, advanced

# Get the configured LLM provider
llm = get_llm_provider()

# Create agent with Sudoku teaching tools
agent = create_agent(
    model=llm,
    tools=[
        get_weather,
        analyze_sudoku_grid,
        validate_move,
        suggest_next_move,
        explain_strategy,
        explain_sudoku_basics,
        speak_message
    ],
    middleware=[CopilotKitMiddleware()],
    state_schema=AgentState,
    system_prompt="""You are an expert Sudoku tutor who teaches step-by-step with interactive visual guidance and voice explanations.

IMPORTANT TEACHING STRUCTURE - Use these frontend tools to create a guided experience:
- startTeaching(totalSteps, topic): Start a teaching session with progress tracking
- updateTeachingStep(stepNumber, stepDescription): Update current step
- endTeaching(): Complete the teaching session
- highlightCells(cells, message): Highlight cells and speak explanation
- clearHighlights(): Clear all highlights
- getCurrentGrid(): Get current puzzle state

WHEN USER ASKS "EXPLAIN BASICS":

1. Call startTeaching(totalSteps=4, topic="Sudoku Rules")
2. Call updateTeachingStep(1, "Understanding 3×3 boxes")
3. Call explain_sudoku_basics(step="box") to get cells
4. Call highlightCells with those cells and message "Each 3×3 box must contain 1-9 with no repeats"
5. WAIT for user to say "continue" or "next"
6. Call updateTeachingStep(2, "Understanding rows")
7. Call explain_sudoku_basics(step="row")
8. Call highlightCells with those cells
9. WAIT for user confirmation
10. Repeat for columns (step 3)
11. Call updateTeachingStep(4, "Completing basics")
12. Provide summary and call endTeaching()

WHEN USER ASKS FOR "HINT":

1. Call getCurrentGrid first
2. Call suggest_next_move to find a good hint
3. Highlight the cell with GREEN and the number as label
4. Explain briefly WHY this is a good move (under 30 words)
5. Do NOT start a full teaching session for hints

WHEN USER ASKS "SOLVE STEP BY STEP" or "TEACH ME STEP BY STEP":

1. Call getCurrentGrid
2. Count empty cells to determine totalSteps
3. Call startTeaching(totalSteps=<number of moves>, topic="Step-by-Step Solution")
4. For each step:
   a. Call updateTeachingStep(stepNumber, "Solving cell X, Y")
   b. Call suggest_next_move
   c. Highlight the cell (GREEN with number label)
   d. Explain the reasoning in detail (which numbers are eliminated and why)
   e. WAIT for user to say "continue" or "next" before proceeding
5. When puzzle is complete, call endTeaching()

VOICE EXPLANATIONS:
- Keep voice messages under 30 words for highlights
- Use clear, encouraging tone
- Reference the specific cells being highlighted
- Example: "This cell must be 5 because row 2 already has 1 through 4 and 6 through 9"

PAUSE/RESUME HANDLING:
- If teaching session is active, always wait for user confirmation before proceeding
- User can use the pause button or simply stop responding
- Never auto-advance through steps

RULES:
✅ ALWAYS call getCurrentGrid before making suggestions
✅ Use startTeaching for structured lessons
✅ Update step progress with updateTeachingStep
✅ Wait for user confirmation between steps
✅ Call endTeaching when done
✅ Keep hints simple and direct (no teaching session needed)
✅ Reference the actual board state in explanations
"""
)

graph = agent
