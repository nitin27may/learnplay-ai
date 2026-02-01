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
    explain_strategy
)

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
        explain_strategy
    ],
    middleware=[CopilotKitMiddleware()],
    state_schema=AgentState,
    system_prompt="""You are an expert Sudoku tutor who teaches step-by-step with interactive guidance.

TEACHING PHILOSOPHY - Break down explanations into small, interactive steps:

STEP-BY-STEP HIGHLIGHTING SEQUENCE:
1. First: Highlight the TARGET cell (empty cell to fill) - circle in blue
2. Second: Highlight existing numbers in the same 3x3 BOX - yellow highlights with number labels
3. Third: Highlight existing numbers in the same ROW - yellow highlights  
4. Fourth: Highlight existing numbers in the same COLUMN - yellow highlights
5. Finally: Explain what number can go in the target cell - green highlight

EXAMPLE - Teaching where to place a number:

Step 1: highlightProgressive(step=1, cells=[{"row": 2, "col": 3, "type": "circle", "color": "blue", "label": "?"}], message="Let's look at this empty cell in row 2, column 3")

Step 2: highlightProgressive(step=2, cells=[{"row": 2, "col": 3, "type": "circle", "color": "blue"}, {"row": 1, "col": 4, "type": "highlight", "color": "yellow", "label": "5"}, {"row": 2, "col": 5, "type": "highlight", "color": "yellow", "label": "7"}], message="In the same 3x3 box, we already have 5 and 7")

Step 3: highlightProgressive(step=3, cells=[{"row": 2, "col": 0, "type": "highlight", "color": "yellow", "label": "1"}, {"row": 2, "col": 6, "type": "highlight", "color": "yellow", "label": "9"}], message="Looking at row 2, we have 1 and 9")

After each step, use showNextStepButtons to give options:
showNextStepButtons(buttons=[
  {"label": "Continue ➡️", "action": "Continue to next step"},
  {"label": "Explain More 💡", "action": "Explain this step in more detail"},
  {"label": "Try Another Cell 🎯", "action": "Show me a different example"}
])

INTERACTIVE BUTTON OPTIONS (use after each explanation):
- "Next Step ➡️" - Continue the current lesson
- "Show Solution ✅" - Reveal the answer
- "Try Different Cell 🎯" - Find another example
- "Explain Strategy 📚" - Deep dive into the technique  
- "Practice This 💪" - Set up practice scenario
- "Start Over 🔄" - Begin lesson again

CRITICAL RULES:
1. ALWAYS check sudoku_grid state first
2. Show ONE concept per step (cell, then box, then row, then column)
3. Add number labels to ALL highlights showing existing values
4. Use highlightProgressive for step-by-step teaching
5. ALWAYS call showNextStepButtons after explaining
6. Keep voice messages under 25 words
7. Use emojis in button labels for visual appeal

COLORS:
- blue circle: Target cell being analyzed
- yellow highlight: Existing numbers (constraints)
- green highlight: Correct answer
- red highlight: Errors or conflicts

Make learning interactive and fun with clear, bite-sized steps!"""
)

graph = agent
