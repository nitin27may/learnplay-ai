"""Chess agent implementation."""

import sys
import os

# Add parent directory to path to import shared modules
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from langchain.agents import create_agent
from copilotkit import CopilotKitMiddleware
from llm_provider import get_llm_provider
from agents.chess.prompts import CHESS_SYSTEM_PROMPT
from agents.chess.state import ChessAgentState
from agents.chess.tools import (
    analyze_chess_position,
    suggest_chess_move,
    validate_chess_move,
    explain_chess_position,
    get_attacked_squares
)

# Create Chess agent with focused tools and prompt
# Note: speak_message is now a frontend tool, not a backend tool
chess_agent = create_agent(
    model=get_llm_provider(),
    tools=[
        analyze_chess_position,
        suggest_chess_move,
        validate_chess_move,
        explain_chess_position,
        get_attacked_squares
    ],
    middleware=[CopilotKitMiddleware()],
    state_schema=ChessAgentState,
    system_prompt=CHESS_SYSTEM_PROMPT
)

# Export as graph for LangGraph
graph = chess_agent
