# Fix Plan: LearnPlay.ai Sudoku Teaching Issues

## Executive Summary

The application has several issues preventing the teaching flow from working correctly:
1. The "Next Step" button appears disabled because the LLM tries to execute all steps at once
2. Teaching sessions fail because the agent doesn't actually "wait" between steps (LLMs are stateless)
3. Duplicate API calls occur because the same operations are requested multiple times
4. Prompts need optimization for better response quality and lower latency


## Phase 7: Chess Academy Implementation (Priority: Major Feature)

> **Timeline**: 14 weeks total | **Status**: PLANNED  
> **Dependency**: Sudoku teaching flow must be stable before starting

### Overview

Chess Academy is the second game in the LearnPlay.ai platform. It features a complete chess game with an intelligent AI tutor that teaches chess concepts, openings, tactics, and strategy through interactive visual guidance.

### Architecture

```
Frontend (Next.js)          Backend (Python Agent)
├── src/app/chess/          ├── agent/chess_tools.py
├── src/components/chess/   ├── agent/opening_database.py
├── src/lib/chess/          ├── agent/tactics_trainer.py
                            └── agent/endgame_tools.py
```

### Sub-Phase 7.1: Core Chess Game (4 weeks)

#### 7.1.1 Project Setup
- [ ] Create `src/app/chess/page.tsx` - Main Chess page
- [ ] Create `src/components/chess/` directory structure
- [ ] Create `src/lib/chess/` for game logic
- [ ] Install frontend dependencies: `chess.js`, `react-chessboard`
- [ ] Add Chess link to home page navigation

#### 7.1.2 Board & Pieces
- [ ] Create `ChessBoard.tsx` - 8×8 board component
- [ ] Create `ChessSquare.tsx` - Individual square with proper colors
- [ ] Create `ChessPiece.tsx` - Piece rendering (SVG/Unicode)
- [ ] Implement drag-and-drop piece movement
- [ ] Implement click-to-move alternative input
- [ ] Add board orientation toggle (white/black perspective)

#### 7.1.3 Move Validation & Rules
- [ ] Create `src/lib/chess/engine.ts` - Chess logic wrapper
- [ ] Implement legal move highlighting for selected piece
- [ ] Add check detection with king highlight
- [ ] Add checkmate/stalemate detection
- [ ] Implement special moves:
  - [ ] Castling (kingside/queenside)
  - [ ] En passant capture
  - [ ] Pawn promotion dialog

#### 7.1.4 Game State Management
- [ ] Create `src/lib/chess/types.ts` - TypeScript types
- [ ] Create `ChessGame.tsx` - Game container with state
- [ ] Implement move history (PGN format)
- [ ] Create `MoveHistory.tsx` - Move list display
- [ ] Add undo/redo functionality
- [ ] Create `GameControls.tsx` - New game, resign, draw buttons

### Sub-Phase 7.2: AI Opponent (2 weeks)

#### 7.2.1 Stockfish Integration
- [ ] Create `src/lib/chess/stockfish.ts` - Engine wrapper
- [ ] Integrate `stockfish.js` for browser-side analysis
- [ ] Install backend dependencies: `python-chess`, `stockfish`
- [ ] Create `agent/chess_engine.py` - Server-side Stockfish

#### 7.2.2 Difficulty Levels
- [ ] Implement Beginner mode (depth 1-3, random mistakes)
- [ ] Implement Intermediate mode (depth 5-8, basic tactics)
- [ ] Implement Advanced mode (depth 10-15, positional play)
- [ ] Implement Expert mode (depth 20+, near-perfect)
- [ ] Add difficulty selector UI

#### 7.2.3 Position Evaluation
- [ ] Create `EvaluationBar.tsx` - Visual position strength
- [ ] Implement real-time evaluation display
- [ ] Add best move suggestions (optional hints)
- [ ] Show principal variation (PV) line

### Sub-Phase 7.3: Teaching System (4 weeks)

#### 7.3.1 Chess Teaching Agent
- [ ] Create `agent/chess_tools.py` with tools:
  - [ ] `analyze_chess_position(fen)` - Position analysis
  - [ ] `get_opening_name(moves)` - Opening identification
  - [ ] `explain_tactical_pattern(pattern, fen)` - Tactics explanation
  - [ ] `suggest_chess_move(fen, skill_level)` - Move suggestion
  - [ ] `validate_chess_move(fen, move)` - Move validation
  - [ ] `get_endgame_tablebase(fen)` - Endgame lookup
- [ ] Add chess system prompt to `agent/main.py`
- [ ] Implement single-step teaching pattern (same as Sudoku)

#### 7.3.2 Frontend Teaching Tools
- [ ] `startChessLesson(totalSteps, topic, position?)` - Begin lesson
- [ ] `updateChessStep(stepNumber, description, move?)` - Progress step
- [ ] `highlightSquares(squares, arrows, message)` - Visual highlights
- [ ] `showBestMoves(moves, evaluation)` - Show alternatives
- [ ] `loadPosition(fen, orientation)` - Set up position
- [ ] `endChessLesson()` - Complete lesson

#### 7.3.3 Visual Highlighting System
- [ ] Create `HighlightOverlay.tsx` for chess board
- [ ] Implement square highlighting (green/blue/yellow/red/purple)
- [ ] Add arrow annotations (from → to with labels)
- [ ] Add circle annotations for important squares
- [ ] Show attacked/defended piece indicators
- [ ] Animate move sequences

#### 7.3.4 Teaching Lessons
- [ ] **Learn Chess Basics** (8 steps):
  - Step 1: The Chessboard (ranks, files, diagonals)
  - Step 2: Pawn Movement
  - Step 3: Knight Movement (L-shape)
  - Step 4: Bishop Movement (diagonals)
  - Step 5: Rook Movement (straight lines)
  - Step 6: Queen Movement (rook + bishop)
  - Step 7: King Movement & Castling
  - Step 8: Check and Checkmate
- [ ] Create `ChessTeachingProgress.tsx` - Teaching UI overlay
- [ ] Integrate voice explanations (Eleven Labs TTS)

#### 7.3.5 Tactical Puzzles
- [ ] Create `agent/tactics_trainer.py`
- [ ] Implement puzzle database (mate-in-1, forks, pins, skewers)
- [ ] Create puzzle UI with solution validation
- [ ] Add progressive difficulty
- [ ] Track puzzle solve rate

### Sub-Phase 7.4: Opening Theory (2 weeks)

#### 7.4.1 Opening Database
- [ ] Create `agent/opening_database.py`
- [ ] Add ECO (Encyclopedia of Chess Openings) data
- [ ] Implement opening name lookup from moves
- [ ] Create opening explorer UI

#### 7.4.2 Opening Lessons
- [ ] Italian Opening (Giuoco Piano) - 12 steps
- [ ] Sicilian Defense overview - 10 steps
- [ ] Queen's Gambit basics - 10 steps
- [ ] French Defense - 8 steps
- [ ] Caro-Kann Defense - 8 steps

#### 7.4.3 Opening Teaching Integration
- [ ] Move-by-move explanations with highlights
- [ ] Show typical plans for both sides
- [ ] Highlight key squares and piece placement
- [ ] Alternative variations branching

### Sub-Phase 7.5: Polish & Features (2 weeks)

#### 7.5.1 Game Features
- [ ] PGN import functionality
- [ ] PGN export functionality
- [ ] Game review mode (step through moves)
- [ ] Move annotations (!, ?, !!, ??, !?, ?!)
- [ ] Copy FEN/PGN to clipboard

#### 7.5.2 UI/UX Polish
- [ ] Chess piece theme selector
- [ ] Board color theme selector
- [ ] Sound effects (move, capture, check)
- [ ] Mobile responsiveness for chess board
- [ ] Keyboard navigation support

#### 7.5.3 Testing
- [ ] Add Playwright E2E tests for chess game
- [ ] Test teaching flow (basics lesson)
- [ ] Test AI opponent at all difficulty levels
- [ ] Test puzzle solving
- [ ] Performance testing (Stockfish analysis speed)

### Technical Dependencies

#### Frontend (package.json)
```json
{
  "chess.js": "^1.0.0",
  "react-chessboard": "^4.0.0"
}
```

#### Backend (pyproject.toml)
```toml
[dependencies]
python-chess = "^1.10.0"
stockfish = "^3.28.0"
```

### File Structure

```
src/
├── app/chess/
│   └── page.tsx                    # Main Chess page
├── components/chess/
│   ├── ChessGame.tsx               # Game container
│   ├── ChessBoard.tsx              # 8×8 board
│   ├── ChessSquare.tsx             # Individual square
│   ├── ChessPiece.tsx              # Piece component
│   ├── MoveHistory.tsx             # Move list
│   ├── GameControls.tsx            # Controls & settings
│   ├── EvaluationBar.tsx           # Position evaluation
│   ├── HighlightOverlay.tsx        # Visual highlights
│   └── ChessTeachingProgress.tsx   # Teaching UI
└── lib/chess/
    ├── types.ts                    # TypeScript types
    ├── engine.ts                   # Chess logic (chess.js)
    ├── stockfish.ts                # Stockfish integration
    ├── openings.ts                 # Opening database
    └── pgn.ts                      # PGN import/export

agent/
├── chess_tools.py                  # Chess analysis tools
├── chess_engine.py                 # Stockfish wrapper
├── opening_database.py             # Opening theory
├── tactics_trainer.py              # Tactical puzzles
└── endgame_tools.py                # Endgame lessons
```

### Success Criteria for Chess Academy

1. User can play a complete chess game vs AI at all difficulty levels
2. All chess rules work correctly (castling, en passant, promotion)
3. "Learn Chess Basics" teaching session completes all 8 steps
4. Visual highlights and arrows display correctly
5. Voice explanations work during teaching
6. Opening identification works ("What opening is this?")
7. Tactical puzzles can be solved with feedback
8. PGN import/export works
9. Mobile responsive chess board
10. Response time < 3 seconds for AI moves (Intermediate)

---

## Phase 8: Platform Enhancements (Future)

### 8.1 User System
- [ ] User accounts and authentication
- [ ] Progress tracking across games
- [ ] Achievement system
- [ ] Leaderboards

### 8.2 Advanced Features
- [ ] Puzzle of the day (Sudoku & Chess)
- [ ] Time-based challenges
- [ ] Custom puzzle import
- [ ] Multiplayer teaching mode

### 8.3 Analytics
- [ ] Learning analytics dashboard
- [ ] Weakness identification
- [ ] Personalized lesson recommendations
- [ ] Spaced repetition for openings

---

## Summary Timeline

| Phase | Description | Duration | Status |
|-------|-------------|----------|--------|
| 1-6 | Sudoku Teaching Flow | Completed | ✅ |
| 7.1 | Chess Core Game | 4 weeks | 📋 Planned |
| 7.2 | Chess AI Opponent | 2 weeks | 📋 Planned |
| 7.3 | Chess Teaching System | 4 weeks | 📋 Planned |
| 7.4 | Chess Opening Theory | 2 weeks | 📋 Planned |
| 7.5 | Chess Polish & Testing | 2 weeks | 📋 Planned |
| 8 | Platform Enhancements | TBD | 📅 Future |

**Total Chess Implementation: ~14 weeks**
