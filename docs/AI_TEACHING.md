# AI Teaching System: Architecture and Design

## Overview

The AI Teaching System is the core innovation of the Game Learning Platform. It transforms traditional game AI from just an opponent into an intelligent tutor that explains concepts, demonstrates strategies, and guides learning through interactive visual and voice feedback.

## System Architecture

### Three-Layer Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Frontend (React)                   │
│  ┌────────────┐  ┌─────────────┐  ┌──────────────┐ │
│  │   Game UI  │  │  Teaching   │  │  CopilotKit  │ │
│  │ Components │◄─┤  Progress   │◄─┤   Sidebar    │ │
│  └────────────┘  └─────────────┘  └──────────────┘ │
└──────────────────────┬──────────────────────────────┘
                       │ Frontend Tools
                       │ State Updates
┌──────────────────────▼──────────────────────────────┐
│              CopilotKit AG-UI Protocol               │
│           (WebSocket + HTTP Communication)           │
└──────────────────────┬──────────────────────────────┘
                       │ Agent Messages
                       │ Tool Calls
┌──────────────────────▼──────────────────────────────┐
│              Agent (Python + LangGraph)              │
│  ┌────────────┐  ┌─────────────┐  ┌──────────────┐ │
│  │    LLM     │  │ Game Tools  │  │   Teaching   │ │
│  │  Provider  │◄─┤ (Analysis)  │◄─┤    Logic     │ │
│  └────────────┘  └─────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────┘
```

### Component Responsibilities

**Frontend Layer**:
- Renders game UI and manages game state
- Displays visual annotations (highlights, arrows, labels)
- Plays voice audio through browser
- Provides frontend tools for agent to control UI
- Manages teaching progress display
- Handles user interactions (clicks, keyboard)

**CopilotKit Layer**:
- Maintains WebSocket connection between frontend and agent
- Routes tool calls from agent to frontend
- Synchronizes state between both sides
- Provides chat interface for natural language interaction
- Handles message streaming and typing indicators

**Agent Layer**:
- Runs LangGraph workflow for teaching logic
- Calls game analysis tools to understand state
- Generates natural language explanations
- Orchestrates teaching sessions with structured steps
- Adapts responses based on user skill level
- Manages conversation context and history

## Teaching Workflow

### 1. User Initiates Learning

**User Action**: Types message or clicks suggestion
```
User: "Explain Sudoku basics"
```

**Frontend → Agent**:
```json
{
  "role": "user",
  "content": "Explain Sudoku basics",
  "context": {
    "sudoku_grid": [[5,3,null,...], ...],
    "timestamp": 1234567890
  }
}
```

### 2. Agent Plans Teaching Session

**Agent Process**:
1. Parses user intent (basic explanation requested)
2. Determines appropriate teaching structure
3. Counts total steps needed (4 for basic rules)
4. Formulates first teaching step

**Agent → Frontend (Tool Call)**:
```json
{
  "tool": "startTeaching",
  "parameters": {
    "totalSteps": 4,
    "topic": "Sudoku Rules"
  }
}
```

### 3. Frontend Prepares UI

**Frontend Execution**:
```typescript
useFrontendTool({
  name: 'startTeaching',
  handler({ totalSteps, topic }) {
    setIsTeaching(true);
    setTotalSteps(totalSteps);
    setCurrentStep(`Starting: ${topic}`);
    // Shows teaching progress UI
    return `Teaching session started: ${topic}`;
  }
});
```

**UI Updates**:
- Teaching progress overlay appears in top-right
- Shows "Step 0 of 4"
- Displays topic: "Sudoku Rules"

### 4. Agent Delivers First Step

**Agent → Frontend (Multiple Tool Calls)**:
```json
// Step 1: Update step counter
{
  "tool": "updateTeachingStep",
  "parameters": {
    "stepNumber": 1,
    "stepDescription": "Understanding 3×3 boxes"
  }
}

// Step 2: Get cells to highlight
{
  "tool": "explain_sudoku_basics",
  "parameters": {
    "step": "box"
  }
}
// Returns: {cells: [{row: 0, col: 0, ...}, ...]}

// Step 3: Highlight and speak
{
  "tool": "highlightCells",
  "parameters": {
    "cells": [...],
    "message": "Each 3×3 box must contain digits 1-9 with no repeats",
    "duration": 15000
  }
}
```

**Frontend Execution**:
```typescript
// Update step
setCurrentStepNumber(1);
setCurrentStep("Understanding 3×3 boxes");

// Highlight cells
setAnnotations([
  {row: 0, col: 0, type: 'highlight', color: 'blue'},
  {row: 0, col: 1, type: 'highlight', color: 'blue'},
  // ... all cells in first box
]);

// Generate and play voice
const response = await fetch('/api/tts', {
  method: 'POST',
  body: JSON.stringify({
    text: "Each 3×3 box must contain digits 1-9 with no repeats"
  })
});
const audioBlob = await response.blob();
const audio = new Audio(URL.createObjectURL(audioBlob));
audio.play();
```

**User Experience**:
- Progress updates to "Step 1 of 4 (25%)"
- Top-left 3×3 box highlights in blue
- Voice speaks: "Each 3×3 box must contain digits 1-9 with no repeats"
- Message appears below board
- "Next Step" button is enabled

### 5. User Continues Learning

**User Action**: Clicks "Next Step" button

**Frontend → Agent**:
```typescript
onNext={() => {
  setState({
    ...state,
    next_step_requested: true,
    timestamp: Date.now()
  });
}}
```

**Agent Detection**:
```python
# Agent checks state for next_step_requested flag
if state.get('next_step_requested'):
    # Proceed to step 2
    update_teaching_step(2, "Understanding rows")
    # ... continue teaching
```

### 6. Repeat Until Complete

**Agent Logic**:
```python
for step_num in range(2, total_steps + 1):
    # Wait for user confirmation
    if not state.get('next_step_requested'):
        return  # Pause here
    
    # Update step
    update_teaching_step(step_num, step_descriptions[step_num])
    
    # Get content for this step
    content = get_step_content(step_num)
    
    # Highlight and explain
    highlight_cells(content.cells, content.message)
    
    # Reset flag, wait for next confirmation
    state['next_step_requested'] = False
```

### 7. Session Complete

**Agent → Frontend**:
```json
{
  "tool": "updateTeachingStep",
  "parameters": {
    "stepNumber": 4,
    "stepDescription": "Summary and practice"
  }
}

// Then end teaching
{
  "tool": "endTeaching"
}

// Finally, return message to chat
{
  "role": "assistant",
  "content": "Great! You've learned the basic rules of Sudoku. Try placing some numbers and ask me for hints if you get stuck!"
}
```

**Frontend Cleanup**:
```typescript
useFrontendTool({
  name: 'endTeaching',
  handler() {
    setIsTeaching(false);
    setAnnotations([]);
    setAnnotationMessage('');
    return 'Teaching session ended';
  }
});
```

**User Experience**:
- Teaching progress UI fades out
- All highlights are cleared
- Chat message appears with encouragement
- User can now play independently or ask for more help

## Teaching Patterns

### Pattern 1: Rule Explanation

**Structure**: Multi-step lesson with visual examples

```python
def explain_rules(game: str):
    # Determine steps needed
    steps = get_rule_steps(game)
    
    # Start session
    start_teaching(len(steps), f"{game} Rules")
    
    # For each rule
    for i, step in enumerate(steps, 1):
        # Update progress
        update_teaching_step(i, step.title)
        
        # Get visual example
        cells = get_example_cells(step.concept)
        
        # Show and explain
        highlight_cells(cells, step.explanation)
        
        # Wait for user
        wait_for_next_step()
    
    # Complete
    end_teaching()
    return "Rules explained! Ready to try?"
```

**Use Cases**:
- Sudoku rules (boxes, rows, columns)
- Chess piece movements
- Game objective and win conditions

### Pattern 2: Strategy Teaching

**Structure**: Concept + Examples + Practice

```python
def teach_strategy(strategy_name: str, examples: List):
    # Start with concept
    start_teaching(len(examples) + 2, f"Learning: {strategy_name}")
    
    # Step 1: Explain concept
    update_teaching_step(1, "Concept explanation")
    explanation = get_strategy_explanation(strategy_name)
    send_message(explanation)
    wait_for_next_step()
    
    # Steps 2-N: Show examples
    for i, example in enumerate(examples, 2):
        update_teaching_step(i, f"Example {i-1}")
        load_position(example.position)
        highlight_cells(example.key_cells, example.explanation)
        wait_for_next_step()
    
    # Final step: Practice prompt
    update_teaching_step(len(examples) + 2, "Your turn")
    send_message("Now try to find this pattern in the current puzzle!")
    end_teaching()
```

**Use Cases**:
- Sudoku naked singles/pairs
- Chess tactical motifs (forks, pins, skewers)
- Opening principles

### Pattern 3: Step-by-Step Solution

**Structure**: Solve one move at a time with explanation

```python
def solve_step_by_step(current_state):
    # Count moves needed
    moves = get_solution_moves(current_state)
    
    start_teaching(len(moves), "Step-by-Step Solution")
    
    # For each move
    for i, move in enumerate(moves, 1):
        update_teaching_step(i, f"Move {i}: {move.notation}")
        
        # Analyze why this move
        reasoning = analyze_move(move, current_state)
        
        # Highlight target cell/square
        highlight_cells(
            [move.target_cell],
            reasoning,
            label=move.value
        )
        
        # Wait before showing next
        wait_for_next_step()
        
        # Update state
        current_state = apply_move(current_state, move)
    
    end_teaching()
    return "Puzzle solved! Want to try another?"
```

**Use Cases**:
- Complete Sudoku puzzle solution
- Chess game analysis move-by-move
- Endgame technique demonstration

### Pattern 4: Contextual Hint

**Structure**: Single action without teaching session

```python
def give_hint(current_state):
    # Analyze position
    best_move = find_best_move(current_state)
    strategy = identify_strategy(best_move)
    
    # Highlight without teaching session
    highlight_cells(
        [best_move.cell],
        f"Try placing {best_move.value} here. This uses the {strategy} technique.",
        color='green',
        label=best_move.value
    )
    
    return f"Hint: Look at {best_move.cell}. {get_brief_explanation(best_move)}"
```

**Use Cases**:
- Quick hints during gameplay
- Error correction
- Nudge in right direction without full explanation

## Voice Integration

### Text-to-Speech Pipeline

```
Teaching Message
      ↓
Frontend Tool Call
      ↓
highlightCells(message)
      ↓
POST /api/tts
      ↓
{
  "text": message,
  "voice_id": "JBFqnCBsd6RMkjVDRZzb",
  "model_id": "eleven_multilingual_v2"
}
      ↓
Eleven Labs API
      ↓
MP3 Audio (44.1kHz, 128kbps)
      ↓
Audio Blob
      ↓
Browser Audio Element
      ↓
Playback
```

### Voice Message Guidelines

**Length**: Keep under 30 words for highlights
- ✅ "This cell must be 5 because row 2 already has 1 through 4 and 6 through 9"
- ❌ "Looking at this particular cell in the second row and analyzing all the possibilities, we can determine that the only valid number that can be placed here is 5, and the reason for this is that if we look at row 2, we see that it already contains..."

**Clarity**: Use specific references
- ✅ "The knight on f3 can fork the king and rook"
- ❌ "That piece there can do a thing to those other pieces"

**Tone**: Encouraging and educational
- ✅ "Great! This move shows you understand naked singles"
- ❌ "You got it right this time"

**Pacing**: Natural speech patterns
- ✅ "Each 3×3 box must contain digits 1 through 9 with no repeats"
- ❌ "Each3by3boxmustcontain1through9withnorepeat"

### Fallback Strategy

```typescript
async function speak(message: string) {
  try {
    // Try Eleven Labs first
    const response = await fetch('/api/tts', {
      method: 'POST',
      body: JSON.stringify({ text: message })
    });
    
    if (response.ok) {
      const audio = await response.blob();
      return playAudio(audio);
    }
  } catch (error) {
    console.warn('Eleven Labs failed, using browser TTS');
  }
  
  // Fallback to browser Web Speech API
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  }
}
```

## Visual Feedback System

### Annotation Types

**Highlights**: Fill cell background with color
```typescript
{
  row: 0,
  col: 0,
  type: 'highlight',
  color: 'blue'  // or green, yellow, red, purple
}
```

**Circles**: Ring around cell
```typescript
{
  row: 0,
  col: 0,
  type: 'circle',
  color: 'green'
}
```

**Crosses**: X mark over cell
```typescript
{
  row: 0,
  col: 0,
  type: 'cross',
  color: 'red'
}
```

**Labels**: Text/number overlay
```typescript
{
  row: 0,
  col: 0,
  type: 'highlight',
  color: 'green',
  label: '5'  // Shows number suggestion
}
```

### Color Semantics

**Universal Meanings**:
- 🔵 **Blue**: Information, explanation, general reference
- 🟢 **Green**: Correct, suggested, good move
- 🟡 **Yellow**: Warning, attention needed, constraint
- 🔴 **Red**: Error, wrong move, threat
- 🟣 **Purple**: Advanced concept, special case

**Game-Specific Usage**:

*Sudoku*:
- Blue: Show rule areas (box/row/column)
- Green: Suggested number placement
- Yellow: Cells to consider
- Red: Invalid placement or conflict
- Purple: Advanced technique pattern

*Chess*:
- Blue: Piece influence, controlled squares
- Green: Best moves, good squares
- Yellow: Attacked pieces, weak points
- Red: Hanging pieces, blunders
- Purple: Special moves (castling, en passant)

### Animation Timing

```typescript
// Highlight appears
{
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.3 }
}

// Highlight persists
duration: 15000  // 15 seconds default

// Highlight fades
{
  exit: { opacity: 0, scale: 0.95 },
  transition: { duration: 0.2 }
}
```

## Adaptive Learning

### Skill Level Detection

**Indicators**:
- Completion time for puzzles
- Hint usage frequency
- Strategy sophistication (which techniques used)
- Error rate and recovery
- Question types asked

**Levels**:
```typescript
type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

function detectSkillLevel(metrics: UserMetrics): SkillLevel {
  if (metrics.hintsPerPuzzle > 5 || metrics.completionTime > 30min) {
    return 'beginner';
  }
  if (metrics.strategiesUsed.includes('advanced') === false) {
    return 'intermediate';
  }
  if (metrics.errorRate < 0.1 && metrics.completionTime < 10min) {
    return 'expert';
  }
  return 'advanced';
}
```

### Teaching Adaptation

**Beginner Mode**:
- Explain every concept thoroughly
- Use simple language
- Provide more examples
- Offer hints proactively
- Celebrate small wins

**Intermediate Mode**:
- Assume basic knowledge
- Focus on strategy
- Provide hints on request
- Introduce advanced concepts gradually

**Advanced Mode**:
- Minimal explanation
- Focus on optimization
- Challenge with complex positions
- Discuss multiple approaches

**Expert Mode**:
- Analysis-focused
- Discuss subtle nuances
- Compare alternative strategies
- Emphasize rare patterns

## State Management

### Frontend State

```typescript
interface TeachingState {
  isTeaching: boolean;          // Teaching session active?
  isPaused: boolean;             // User paused session?
  currentStep: string;           // Current step description
  totalSteps: number;            // Total steps in session
  currentStepNumber: number;     // Current step index (1-based)
  annotations: CellAnnotation[]; // Visual highlights
  annotationMessage: string;     // Message below board
}
```

### Agent State

```python
class AgentState(CopilotKitState):
    # Game state
    sudoku_grid: Optional[List[List[Optional[int]]]]
    chess_fen: Optional[str]
    
    # User context
    player_level: str = "beginner"
    teaching_mode: str = "play"
    
    # Interaction tracking
    last_move: Optional[Dict[str, Any]]
    hint_count: int = 0
    error_count: int = 0
    
    # Teaching session
    current_lesson: Optional[str]
    lesson_progress: int = 0
```

### Synchronization

```typescript
// Frontend → Agent: Every grid change
useEffect(() => {
  if (currentGrid.length > 0) {
    setState({
      ...state,
      sudoku_grid: currentGrid,
      timestamp: Date.now()
    });
  }
}, [currentGrid]);

// Agent → Frontend: Via tool calls
useFrontendTool({
  name: 'highlightCells',
  handler({ cells, message }) {
    setAnnotations(cells);
    setAnnotationMessage(message);
    speak(message);  // Also triggers voice
    return 'Highlights applied';
  }
});
```

## Error Handling

### Network Errors
```typescript
try {
  await fetch('/api/tts', { ... });
} catch (error) {
  console.error('TTS failed:', error);
  // Fallback to browser speech
  useBrowserTTS(message);
}
```

### Agent Timeout
```typescript
const timeout = setTimeout(() => {
  showMessage("The AI tutor is thinking...");
}, 3000);

agent.onResponse(() => {
  clearTimeout(timeout);
});
```

### Invalid Tool Calls
```python
@tool
def highlightCells(cells: List, message: str):
    try:
        validate_cells(cells)
        return {"success": True}
    except ValidationError as e:
        logger.error(f"Invalid cells: {e}")
        return {"success": False, "error": str(e)}
```

## Performance Optimization

### Debouncing State Updates
```typescript
const debouncedGridUpdate = useMemo(
  () => debounce((grid) => {
    setState({ ...state, sudoku_grid: grid });
  }, 500),
  [state]
);
```

### Lazy Loading Voice
```typescript
// Preload TTS for common phrases
const voiceCache = new Map<string, Blob>();

async function speak(message: string) {
  if (voiceCache.has(message)) {
    playAudio(voiceCache.get(message));
  } else {
    const audio = await generateTTS(message);
    voiceCache.set(message, audio);
    playAudio(audio);
  }
}
```

### Efficient Highlighting
```typescript
// Only re-render when annotations change
const MemoizedAnnotationOverlay = memo(
  AnnotationOverlay,
  (prev, next) => {
    return JSON.stringify(prev.annotations) === 
           JSON.stringify(next.annotations);
  }
);
```

---

**The AI Teaching System represents the core innovation of this platform, transforming passive gameplay into active, guided learning experiences.**
