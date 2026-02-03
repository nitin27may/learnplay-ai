"""Sudoku agent implementation."""

import sys
import os

# Add parent directory to path to import shared modules
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from langchain.agents import create_agent
from copilotkit import CopilotKitMiddleware
from llm_provider import get_llm_provider
from agents.sudoku.prompts import SUDOKU_SYSTEM_PROMPT
from agents.sudoku.state import SudokuAgentState
from agents.sudoku.tools import (
    analyze_sudoku_grid,
    validate_move,
    suggest_next_move,
    explain_strategy,
    explain_sudoku_basics
)

# Create Sudoku agent with focused tools and prompt
# Note: speak_message is now a frontend tool, not a backend tool
sudoku_agent = create_agent(
    model=get_llm_provider(),
    tools=[
        analyze_sudoku_grid,
        validate_move,
        suggest_next_move,
        explain_strategy,
        explain_sudoku_basics
    ],
    middleware=[CopilotKitMiddleware()],
    state_schema=SudokuAgentState,
    system_prompt=SUDOKU_SYSTEM_PROMPT
)

# Export as graph for LangGraph
graph = sudoku_agent
