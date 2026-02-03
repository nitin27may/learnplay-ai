"""
This is the main entry point for the multi-agent architecture.

DEPRECATED: This monolithic agent is kept for backward compatibility.
For new deployments, use the specialized agents:
- agents/router_agent.py - Routes general queries
- agents/sudoku/agent.py - Sudoku teaching specialist
- agents/chess/agent.py - Chess teaching specialist

To use the new architecture, update langgraph.json and frontend routing.
"""

# Import the router agent as the default
from agents.router_agent import graph

# For backward compatibility, export the router as the main graph
# This allows existing deployments to continue working
__all__ = ["graph"]
