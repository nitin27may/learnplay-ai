"""Chess tools for position analysis and move suggestions."""
import chess
import random
from typing import Optional, Dict, List, Any


class ChessAnalyzer:
    """Analyzes chess positions and suggests moves."""
    
    def __init__(self):
        self.board = chess.Board()
    
    def load_fen(self, fen: str) -> bool:
        """Load a position from FEN notation."""
        try:
            self.board.set_fen(fen)
            return True
        except ValueError:
            return False
    
    def get_material_count(self) -> Dict[str, int]:
        """Get material count for both sides."""
        piece_values = {
            chess.PAWN: 1,
            chess.KNIGHT: 3,
            chess.BISHOP: 3,
            chess.ROOK: 5,
            chess.QUEEN: 9,
            chess.KING: 0
        }
        
        white_material = sum(
            piece_values[piece.piece_type] 
            for piece in self.board.piece_map().values() 
            if piece.color == chess.WHITE
        )
        
        black_material = sum(
            piece_values[piece.piece_type] 
            for piece in self.board.piece_map().values() 
            if piece.color == chess.BLACK
        )
        
        return {
            "white": white_material,
            "black": black_material,
            "advantage": white_material - black_material
        }
    
    def analyze_position(self, fen: str) -> Dict[str, Any]:
        """Analyze a chess position."""
        if not self.load_fen(fen):
            return {"error": "Invalid FEN"}
        
        material = self.get_material_count()
        
        analysis = {
            "fen": fen,
            "turn": "white" if self.board.turn == chess.WHITE else "black",
            "is_check": self.board.is_check(),
            "is_checkmate": self.board.is_checkmate(),
            "is_stalemate": self.board.is_stalemate(),
            "is_game_over": self.board.is_game_over(),
            "legal_moves_count": len(list(self.board.legal_moves)),
            "material": material,
            "castling_rights": {
                "white_kingside": self.board.has_kingside_castling_rights(chess.WHITE),
                "white_queenside": self.board.has_queenside_castling_rights(chess.WHITE),
                "black_kingside": self.board.has_kingside_castling_rights(chess.BLACK),
                "black_queenside": self.board.has_queenside_castling_rights(chess.BLACK),
            }
        }
        
        return analysis
    
    def suggest_move(self, fen: str, skill_level: str = "intermediate") -> Optional[str]:
        """Suggest a move based on skill level."""
        if not self.load_fen(fen):
            return None
        
        legal_moves = list(self.board.legal_moves)
        if not legal_moves:
            return None
        
        if skill_level == "beginner":
            # Random move with occasional blunders
            return random.choice(legal_moves).uci()
        
        elif skill_level == "intermediate":
            # Basic evaluation: prefer captures and avoid hanging pieces
            captures = [m for m in legal_moves if self.board.is_capture(m)]
            if captures and random.random() > 0.3:
                return random.choice(captures).uci()
            return random.choice(legal_moves).uci()
        
        elif skill_level in ["advanced", "expert"]:
            # Prefer captures and central control
            captures = [m for m in legal_moves if self.board.is_capture(m)]
            if captures:
                return random.choice(captures).uci()
            
            # Prefer center squares
            center_squares = [chess.E4, chess.E5, chess.D4, chess.D5]
            center_moves = [m for m in legal_moves if m.to_square in center_squares]
            if center_moves:
                return random.choice(center_moves).uci()
            
            return random.choice(legal_moves).uci()
        
        return random.choice(legal_moves).uci()
    
    def validate_move(self, fen: str, move_uci: str) -> Dict[str, Any]:
        """Validate if a move is legal."""
        if not self.load_fen(fen):
            return {"legal": False, "error": "Invalid FEN"}
        
        try:
            move = chess.Move.from_uci(move_uci)
            if move in self.board.legal_moves:
                return {"legal": True, "move": move_uci}
            else:
                return {"legal": False, "error": "Illegal move"}
        except ValueError:
            return {"legal": False, "error": "Invalid move notation"}
    
    def get_attacked_squares(self, fen: str, color: str) -> List[str]:
        """Get all squares attacked by a color."""
        if not self.load_fen(fen):
            return []
        
        chess_color = chess.WHITE if color == "white" else chess.BLACK
        attacked = []
        
        for square in chess.SQUARES:
            if self.board.is_attacked_by(chess_color, square):
                attacked.append(chess.square_name(square))
        
        return attacked
    
    def explain_position(self, fen: str) -> str:
        """Generate a natural language explanation of the position."""
        analysis = self.analyze_position(fen)
        if "error" in analysis:
            return analysis["error"]
        
        explanation = []
        
        # Turn
        explanation.append(f"It's {analysis['turn']}'s turn to move.")
        
        # Check/checkmate
        if analysis["is_checkmate"]:
            explanation.append("Checkmate! The game is over.")
        elif analysis["is_stalemate"]:
            explanation.append("Stalemate! The game is a draw.")
        elif analysis["is_check"]:
            explanation.append(f"{analysis['turn'].capitalize()} is in check!")
        
        # Material
        material = analysis["material"]
        if material["advantage"] > 0:
            explanation.append(f"White has a material advantage of {material['advantage']} points.")
        elif material["advantage"] < 0:
            explanation.append(f"Black has a material advantage of {abs(material['advantage'])} points.")
        else:
            explanation.append("Material is equal.")
        
        return " ".join(explanation)


# Global analyzer instance
analyzer = ChessAnalyzer()
