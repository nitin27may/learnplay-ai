"""
Sudoku teaching tools for the AI agent.
"""

from typing import List, Dict, Any, Optional
from langchain.tools import tool

@tool
def analyze_sudoku_grid(grid: List[List[Optional[int]]]) -> Dict[str, Any]:
    """
    Analyze a Sudoku grid and identify teaching strategies.
    
    Args:
        grid: 9x9 Sudoku grid where None represents empty cells
        
    Returns:
        Dictionary with analysis including strategies found
    """
    strategies_found = []
    
    # Find naked singles
    for row in range(9):
        for col in range(9):
            if grid[row][col] is None:
                possible = get_possible_values(grid, row, col)
                if len(possible) == 1:
                    strategies_found.append({
                        "type": "naked_single",
                        "row": row,
                        "col": col,
                        "value": possible[0],
                        "description": f"Cell ({row+1},{col+1}) can only be {possible[0]}"
                    })
    
    # Find hidden singles in rows
    for row in range(9):
        for value in range(1, 10):
            possible_cols = []
            for col in range(9):
                if grid[row][col] is None and value in get_possible_values(grid, row, col):
                    possible_cols.append(col)
            
            if len(possible_cols) == 1:
                col = possible_cols[0]
                strategies_found.append({
                    "type": "hidden_single_row",
                    "row": row,
                    "col": col,
                    "value": value,
                    "description": f"In row {row+1}, only cell ({row+1},{col+1}) can be {value}"
                })
    
    return {
        "strategies_found": strategies_found,
        "total_strategies": len(strategies_found),
        "next_best_strategy": strategies_found[0] if strategies_found else None
    }

@tool
def validate_move(grid: List[List[Optional[int]]], row: int, col: int, value: int) -> Dict[str, Any]:
    """
    Validate if a move is correct and provide explanation.
    
    Args:
        grid: Current Sudoku grid
        row: Row index (0-8)
        col: Column index (0-8)
        value: Value to place (1-9)
        
    Returns:
        Validation result with explanation
    """
    # Check if value already exists in row
    for c in range(9):
        if c != col and grid[row][c] == value:
            return {
                "valid": False,
                "error": "row_conflict",
                "message": f"The number {value} already appears in row {row+1} at column {c+1}"
            }
    
    # Check if value already exists in column
    for r in range(9):
        if r != row and grid[r][col] == value:
            return {
                "valid": False,
                "error": "column_conflict",
                "message": f"The number {value} already appears in column {col+1} at row {r+1}"
            }
    
    # Check if value already exists in 3x3 box
    box_row = (row // 3) * 3
    box_col = (col // 3) * 3
    
    for r in range(box_row, box_row + 3):
        for c in range(box_col, box_col + 3):
            if (r != row or c != col) and grid[r][c] == value:
                return {
                    "valid": False,
                    "error": "box_conflict",
                    "message": f"The number {value} already appears in this 3x3 box at ({r+1},{c+1})"
                }
    
    return {
        "valid": True,
        "message": f"Placing {value} at ({row+1},{col+1}) is a valid move!"
    }

@tool
def suggest_next_move(grid: List[List[Optional[int]]]) -> Dict[str, Any]:
    """
    Suggest the next best move with teaching explanation.
    
    Args:
        grid: Current Sudoku grid
        
    Returns:
        Suggested move with educational explanation
    """
    analysis = analyze_sudoku_grid.invoke({"grid": grid})
    
    if not analysis["strategies_found"]:
        return {
            "has_suggestion": False,
            "message": "No obvious moves found. Try looking for more advanced patterns."
        }
    
    best_strategy = analysis["next_best_strategy"]
    
    explanation = ""
    if best_strategy["type"] == "naked_single":
        explanation = (
            f"This is a 'Naked Single' - the easiest Sudoku technique. "
            f"Cell ({best_strategy['row']+1},{best_strategy['col']+1}) can only contain "
            f"the number {best_strategy['value']} because all other numbers (1-9) are "
            f"already present in its row, column, or 3x3 box."
        )
    elif best_strategy["type"].startswith("hidden_single"):
        explanation = (
            f"This is a 'Hidden Single'. While other numbers might seem possible in "
            f"cell ({best_strategy['row']+1},{best_strategy['col']+1}), the number "
            f"{best_strategy['value']} can only go in this cell within its "
            f"{'row' if 'row' in best_strategy['type'] else 'column' if 'column' in best_strategy['type'] else 'box'}."
        )
    
    return {
        "has_suggestion": True,
        "row": best_strategy["row"],
        "col": best_strategy["col"],
        "value": best_strategy["value"],
        "strategy": best_strategy["type"],
        "explanation": explanation
    }

@tool
def explain_strategy(strategy_name: str) -> str:
    """
    Explain a Sudoku solving strategy in detail.
    
    Args:
        strategy_name: Name of the strategy (naked_single, hidden_single, etc.)
        
    Returns:
        Detailed explanation of the strategy
    """
    strategies = {
        "naked_single": (
            "**Naked Single** is the most basic Sudoku technique. A cell is a naked single "
            "when it can only contain one possible number. This happens when all other numbers "
            "from 1-9 already appear in the same row, column, or 3x3 box.\n\n"
            "How to find them:\n"
            "1. Look at an empty cell\n"
            "2. Check which numbers 1-9 are already in its row\n"
            "3. Check which numbers are already in its column\n"
            "4. Check which numbers are already in its 3x3 box\n"
            "5. If only one number is missing from all three checks, you found a naked single!"
        ),
        "hidden_single": (
            "**Hidden Single** is slightly more advanced than naked singles. A cell contains a "
            "hidden single when a particular number can only go in that one cell within a row, "
            "column, or box, even though the cell might have other candidate numbers.\n\n"
            "How to find them:\n"
            "1. Pick a number (let's say 5)\n"
            "2. Look at a row, column, or box\n"
            "3. Find all empty cells where 5 could go\n"
            "4. If there's only ONE cell where 5 can go, that's a hidden single!\n"
            "5. Place the number there, even if other numbers seem possible"
        ),
        "naked_pair": (
            "**Naked Pair** is an elimination technique. When two cells in the same row, column, "
            "or box can only contain the same two numbers, those numbers can be eliminated from "
            "all other cells in that unit.\n\n"
            "Example: If cells A and B both can only be 3 or 7, then no other cell in their "
            "row/column/box can be 3 or 7."
        ),
        "pointing_pair": (
            "**Pointing Pair** (or Pointing Triple) occurs when a candidate number in a box is "
            "restricted to a single row or column. This means that number can be eliminated from "
            "the rest of that row or column outside the box."
        )
    }
    
    return strategies.get(strategy_name.lower(), 
                         f"Strategy '{strategy_name}' explanation not available yet.")

def get_possible_values(grid: List[List[Optional[int]]], row: int, col: int) -> List[int]:
    """
    Helper function to get possible values for a cell.
    """
    if grid[row][col] is not None:
        return []
    
    possible = set(range(1, 10))
    
    # Remove values in same row
    for c in range(9):
        if grid[row][c] is not None:
            possible.discard(grid[row][c])
    
    # Remove values in same column
    for r in range(9):
        if grid[r][col] is not None:
            possible.discard(grid[r][col])
    
    # Remove values in same 3x3 box
    box_row = (row // 3) * 3
    box_col = (col // 3) * 3
    for r in range(box_row, box_row + 3):
        for c in range(box_col, box_col + 3):
            if grid[r][c] is not None:
                possible.discard(grid[r][c])
    
    return sorted(list(possible))
