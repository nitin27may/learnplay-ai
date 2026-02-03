# LearnPlay.ai - Interactive Chat UI Enhancement Plan

> Transform the plain-text CopilotKit chat into an engaging, interactive learning experience with Generative UI components, in-chat quizzes, visual cards, and human-in-the-loop interactions.

---

## Implementation Checklist

### Phase 1: Chat UI Component Library (Foundation)

- [x] Create `src/components/chat/index.ts` - Barrel export
- [x] Create `src/components/chat/ThinkingIndicator.tsx` - Loading animation
- [x] Create `src/components/chat/CellBadge.tsx` - Inline Sudoku cell reference
- [x] Create `src/components/chat/SquareBadge.tsx` - Inline chess square reference
- [x] Create `src/components/chat/StrategyBadge.tsx` - Strategy name badge
- [x] Create `src/components/chat/HintCard.tsx` - Rich hint display
- [x] Create `src/components/chat/AnalysisCard.tsx` - Analysis results card
- [x] Create `src/components/chat/MoveCard.tsx` - Chess move visualization
- [x] Create `src/components/chat/InlineTeachingProgress.tsx` - In-chat progress

### Phase 2: Interactive Quiz Components

- [x] Create `src/components/chat/NumberPickerQuiz.tsx` - Number input quiz
- [x] Create `src/components/chat/StrategyQuiz.tsx` - Strategy MCQ
- [x] Create `src/components/chat/CellSelectionQuiz.tsx` - Cell picker quiz
- [x] Create `src/components/chat/MoveSelectionQuiz.tsx` - Chess move quiz
- [x] Create `src/components/chat/OpeningCard.tsx` - Opening info card
- [x] Create `src/components/chat/ActionButtonGroup.tsx` - Button group

### Phase 3: Add Types

- [x] Update `src/lib/types.ts` - Add ChatComponentState, SudokuAgentState, ChessAgentState

### Phase 4: Integrate with Sudoku Page

- [x] Add `markdownTagRenderers` to `SudokuGameWithAgent.tsx`
- [x] Add `render` property to frontend tools in `SudokuGameWithAgent.tsx`
- [x] Add `useCoAgentStateRender` for teaching progress
- [x] Add HITL quiz tools with `useHumanInTheLoop` (askNumber, askStrategy, askCellSelection)

### Phase 5: Integrate with Chess Page

- [x] Add `markdownTagRenderers` to `ChessGameWithAgent.tsx`
- [x] Add `render` property to frontend tools in `ChessGameWithAgent.tsx`
- [x] Add `useCoAgentStateRender` for teaching progress
- [x] Add HITL quiz tools with `useHumanInTheLoop` (askMoveSelection, showOpening)

### Phase 6: Update Agent Prompts

- [x] Update `agent/agents/sudoku/prompts.py` - Use custom tags
- [x] Update `agent/agents/chess/prompts.py` - Use custom tags

### Phase 7: Dynamic Suggestions

- [x] Add `useCopilotChatSuggestions` to Sudoku page
- [x] Add `useCopilotChatSuggestions` to Chess page

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current State Analysis](#current-state-analysis)
3. [CopilotKit Generative UI Capabilities](#copilotkit-generative-ui-capabilities)
4. [Proposed Components](#proposed-components)
5. [Sudoku-Specific Features](#sudoku-specific-features)
6. [Chess-Specific Features](#chess-specific-features)
7. [Implementation Steps](#implementation-steps)
8. [Technical Specifications](#technical-specifications)
9. [File Changes Required](#file-changes-required)
10. [Priority Roadmap](#priority-roadmap)

---

## Executive Summary

The current LearnPlay.ai chat interface uses basic `<CopilotSidebar>` with static text responses and external overlays. CopilotKit provides powerful **Generative UI** capabilities that remain completely unexploited:

- `useRenderToolCall` - Render custom UI when backend tools execute
- `renderAndWaitForResponse` - Human-in-the-loop interactive components
- `useCoAgentStateRender` - Real-time agent state visualization
- Custom markdown tag renderers - Inline interactive elements

This plan details how to leverage these capabilities to create an immersive, interactive learning experience.

---

## Current State Analysis

### What We Have Now

#### Chat Components Used

**Sudoku Page (`src/app/sudoku/page.tsx`):**
```tsx
<CopilotSidebar
  clickOutsideToClose={false}
  defaultOpen={false}
  labels={{
    title: 'Sudoku AI Tutor',
    initial: "I can see your Sudoku board!...",
  }}
  suggestions={[
    { title: 'Learn Sudoku Basics', message: 'Explain the basic rules...' },
    { title: 'Get a Hint', message: 'Give me a hint...' },
    // ... static suggestions
  ]}
>
```

**Chess Page (`src/app/chess/page.tsx`):**
```tsx
<CopilotSidebar
  defaultOpen={true}
  labels={{
    title: 'Chess Tutor',
    initial: "Hi! I'm your chess tutor...",
  }}
  suggestions={[
    { title: 'Learn Chess Basics', message: 'Learn chess basics' },
    { title: 'Suggest Move', message: 'Suggest a good move for me' },
    // ... static suggestions
  ]}
>
```

### Current Frontend Tools

| Game | Tool Name | Purpose |
|------|-----------|---------|
| Sudoku | `highlightCells` | Visual cell highlighting |
| Sudoku | `fillCell` | Place number in cell |
| Sudoku | `startTeaching` | Initialize teaching session |
| Sudoku | `updateTeachingStep` | Update progress |
| Sudoku | `endTeaching` | Complete session |
| Chess | `highlightSquares` | Board square highlighting |
| Chess | `makeAIMove` | Execute AI opponent move |
| Both | `speak_message` | TTS voice output |

### Current Problems

| Issue | Description |
|-------|-------------|
| Plain text responses | All agent messages are unformatted text |
| External overlays | `TeachingProgress` component is outside chat |
| No interactive elements | Users can't click/interact within chat |
| Static suggestions | Same 5 suggestions regardless of context |
| Invisible tool calls | No visual feedback when tools execute |
| Passive learning | No quizzes or knowledge validation |
| No visual previews | Highlighted cells only visible on game board |

---

## CopilotKit Generative UI Capabilities

### 1. Backend Tool Rendering (`useRenderToolCall`)

Render custom UI components when backend tools are called:

```tsx
import { useRenderToolCall } from "@copilotkit/react-core";

useRenderToolCall({
  name: "analyze_sudoku_grid",
  render: ({ status, args, result }) => (
    <div className="analysis-card">
      {status !== "complete" && <Spinner />}
      {status === "complete" && (
        <AnalysisResultCard 
          grid={args.grid}
          suggestions={result.strategies}
        />
      )}
    </div>
  ),
});
```

**Use Cases:**
- Render analysis cards when `analyze_sudoku_grid` or `analyze_position` are called
- Show loading spinners during tool execution
- Display structured results (strategy cards, move evaluations)

### 2. Frontend Tool Rendering with `render` Property

Frontend tools can include a `render` function to display custom UI in chat:

```tsx
useFrontendTool({
  name: "showQuiz",
  description: "Present a quiz question to the user",
  parameters: [...],
  handler({ question, options }) {
    return { answered: false };
  },
  render: ({ args, status }) => (
    <QuizCard 
      question={args.question}
      options={args.options}
      status={status}
    />
  ),
});
```

### 3. Human-in-the-Loop (`renderAndWaitForResponse`)

Interactive components that wait for user input:

```tsx
useFrontendTool({
  name: "askMultipleChoice",
  parameters: [...],
  renderAndWaitForResponse: ({ args, status, respond }) => (
    <MultipleChoiceQuiz
      question={args.question}
      options={args.options}
      onSelect={(answer) => respond({ selectedAnswer: answer })}
    />
  ),
});
```

**Use Cases:**
- Quiz questions where user must click an answer
- Move confirmation dialogs
- Strategy selection panels

### 4. Agent State Rendering (`useCoAgentStateRender`)

Render agent state changes in real-time within the chat:

```tsx
import { useCoAgentStateRender } from "@copilotkit/react-core";

useCoAgentStateRender<SudokuAgentState>({
  name: "sudoku_agent",
  render: ({ state, status }) => (
    <TeachingProgressCard
      isTeaching={state.teaching_active}
      step={state.teaching_current_step}
      status={status}
    />
  ),
});
```

### 5. Custom Markdown Tag Renderers

Create custom HTML-like tags that render as React components:

```tsx
const markdownTagRenderers = {
  "sudoku-cell": ({ row, col, value, color }) => (
    <SudokuCellBadge row={row} col={col} value={value} color={color} />
  ),
  "strategy-card": ({ name, description }) => (
    <StrategyCard name={name} description={description} />
  ),
};

<CopilotSidebar markdownTagRenderers={markdownTagRenderers}>
```

Agent responses can then include:
```
Try placing <sudoku-cell row="2" col="5" value="7" color="green">7</sudoku-cell> here.
<strategy-card name="Naked Single" description="Only one number fits">Learn more</strategy-card>
```

### 6. Dynamic Suggestions (`useCopilotChatSuggestions`)

Context-aware suggestions based on game state:

```tsx
useCopilotChatSuggestions({
  instructions: "Suggest actions based on current game state",
  dependencies: [isTeaching, gamePhase, errorCount],
});
```

---

## Proposed Components

### New Component Library: `src/components/chat/`

| Component | Description | CopilotKit Pattern |
|-----------|-------------|-------------------|
| `HintCard.tsx` | Expandable hint with cell badge, strategy, "Apply" button | `useRenderToolCall` |
| `StrategyQuiz.tsx` | Multiple-choice quiz with immediate feedback | `renderAndWaitForResponse` |
| `MoveCard.tsx` | Chess move visualization with eval bar | `useRenderToolCall` |
| `AnalysisCard.tsx` | Position/grid analysis results | `useRenderToolCall` |
| `InlineTeachingProgress.tsx` | Compact progress bar in chat | `useCoAgentStateRender` |
| `CellBadge.tsx` | Inline Sudoku cell reference | Markdown tag renderer |
| `SquareBadge.tsx` | Inline chess square reference | Markdown tag renderer |
| `ActionButtonGroup.tsx` | Reusable in-chat action buttons | Frontend tool `render` |
| `DifficultySelector.tsx` | Choose puzzle difficulty | Frontend tool `render` |
| `ThinkingIndicator.tsx` | Custom loading animation | Tool status rendering |

### Component Specifications

#### HintCard

```tsx
interface HintCardProps {
  cell: { row: number; col: number };
  value: number;
  strategy: string;
  explanation: string;
  confidence: 'high' | 'medium' | 'low';
  onApply?: () => void;
  onExplainMore?: () => void;
}
```

**Visual Design:**
- Header: Strategy name with colored badge
- Body: Cell location (e.g., "Row 3, Column 5") with visual indicator
- Value: Large number display
- Explanation: Collapsible text
- Actions: "Apply to Board" and "Explain More" buttons

#### StrategyQuiz

```tsx
interface StrategyQuizProps {
  question: string;
  options: { id: string; label: string; description?: string }[];
  correctId: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  onAnswer: (selectedId: string, isCorrect: boolean) => void;
}
```

**Visual Design:**
- Question header with difficulty badge
- Option buttons with hover effects
- Immediate feedback (green check / red X)
- Explanation reveal on answer
- "Try Another" button

#### MoveCard (Chess)

```tsx
interface MoveCardProps {
  from: string;        // e.g., "e2"
  to: string;          // e.g., "e4"
  piece: string;       // e.g., "pawn"
  pieceColor: 'white' | 'black';
  notation: string;    // e.g., "e4"
  evaluation?: number; // e.g., +0.5
  isCapture?: boolean;
  isCheck?: boolean;
  explanation: string;
  onPlay?: () => void;
}
```

**Visual Design:**
- Piece icon with arrow (from -> to)
- Algebraic notation display
- Evaluation bar (-3 to +3 scale)
- Special move indicators (capture, check, castle)
- "Play This Move" button

#### InlineTeachingProgress

```tsx
interface InlineTeachingProgressProps {
  currentStep: number;
  totalSteps: number;
  stepTitle: string;
  stepDescription: string;
  topic: string;
  onNext: () => void;
  onStop: () => void;
  onRepeat?: () => void;
}
```

**Visual Design:**
- Compact progress bar with step counter
- Current step title
- Three buttons: "Next Step", "Repeat", "Stop"
- Subtle animation on step change

---

## Sudoku-Specific Features

### Interactive Components

| Feature | Description | User Interaction |
|---------|-------------|------------------|
| Cell Selector Quiz | Mini 9x9 grid to click correct cell | Click cell to answer |
| Number Picker | In-chat 1-9 pad for answering | Click number |
| Strategy Quiz | Identify the solving technique | Multiple choice |
| Conflict Visualizer | Show conflicting cells inline | Hover to highlight |
| Hint Card | Rich hint display | "Apply" button |
| Progress Tracker | Teaching steps in chat | "Next" button |
| Difficulty Selector | Choose Easy/Medium/Hard | Button group |

### New Frontend Tools for Sudoku

```tsx
// Cell Selection Quiz
useFrontendTool({
  name: 'askCellSelection',
  description: 'Ask user to identify a specific cell',
  parameters: [
    { name: 'question', type: 'string', required: true },
    { name: 'correctCell', type: 'object', required: true },
    { name: 'hint', type: 'string' },
  ],
  renderAndWaitForResponse: ({ args, respond }) => (
    <CellSelectionQuiz
      question={args.question}
      hint={args.hint}
      onCellSelect={(row, col) => {
        const correct = row === args.correctCell.row && col === args.correctCell.col;
        respond({ correct, selected: { row, col } });
      }}
    />
  ),
});

// Strategy Quiz
useFrontendTool({
  name: 'showStrategyQuiz',
  description: 'Test user knowledge of Sudoku strategies',
  parameters: [
    { name: 'scenario', type: 'string', required: true },
    { name: 'options', type: 'array', required: true },
    { name: 'correctIndex', type: 'number', required: true },
  ],
  renderAndWaitForResponse: ({ args, respond }) => (
    <StrategyQuiz
      scenario={args.scenario}
      options={args.options}
      onSelect={(index) => {
        respond({ 
          correct: index === args.correctIndex,
          selectedIndex: index 
        });
      }}
    />
  ),
});

// Number Answer
useFrontendTool({
  name: 'askNumber',
  description: 'Ask user what number goes in a cell',
  parameters: [
    { name: 'question', type: 'string', required: true },
    { name: 'correctNumber', type: 'number', required: true },
    { name: 'cellReference', type: 'object', required: true },
  ],
  renderAndWaitForResponse: ({ args, respond }) => (
    <NumberPickerQuiz
      question={args.question}
      cellRef={args.cellReference}
      onNumberSelect={(num) => {
        respond({ 
          correct: num === args.correctNumber,
          selected: num 
        });
      }}
    />
  ),
});
```

### Sudoku Teaching Flow with Interactive UI

```
1. User: "Teach me Naked Singles"
   
2. Agent calls startTeaching(4)
   -> InlineTeachingProgress renders in chat (Step 1/4)
   
3. Agent explains concept with <strategy-card>
   -> StrategyCard component renders inline
   
4. Agent calls askCellSelection for practice
   -> CellSelectionQuiz renders, waits for click
   
5. User clicks a cell
   -> Quiz validates, shows feedback
   -> Agent receives response, continues
   
6. Agent calls askNumber for the cell
   -> NumberPickerQuiz renders
   
7. User selects number
   -> Feedback shown, step completes
   
8. Agent calls updateTeachingStep(2)
   -> Progress updates to Step 2/4
   
9. Repeat until endTeaching()
```

---

## Chess-Specific Features

### Interactive Components

| Feature | Description | User Interaction |
|---------|-------------|------------------|
| Move Card | Suggested move with eval | "Play Move" button |
| Tactic Quiz | Find the best move | Click square or select option |
| Mini Board | Position thumbnail | Hover to enlarge |
| Opening Card | Opening name + moves | Expandable move list |
| Eval Bar | Position evaluation visual | Hover for details |
| Piece Movement Demo | Animated piece paths | Play animation |
| Game Mode Switcher | PvP / PvAI / Learn | Button group |

### New Frontend Tools for Chess

```tsx
// Move Selection Quiz
useFrontendTool({
  name: 'askMoveSelection',
  description: 'Ask user to find the best move',
  parameters: [
    { name: 'question', type: 'string', required: true },
    { name: 'position', type: 'string', required: true }, // FEN
    { name: 'correctMove', type: 'object', required: true },
    { name: 'options', type: 'array' }, // Optional multiple choice
  ],
  renderAndWaitForResponse: ({ args, respond }) => (
    <MoveSelectionQuiz
      question={args.question}
      fen={args.position}
      options={args.options}
      onMoveSelect={(from, to) => {
        const correct = from === args.correctMove.from && to === args.correctMove.to;
        respond({ correct, move: { from, to } });
      }}
    />
  ),
});

// Piece Quiz
useFrontendTool({
  name: 'askPieceIdentification',
  description: 'Quiz about piece movements or values',
  parameters: [
    { name: 'question', type: 'string', required: true },
    { name: 'options', type: 'array', required: true },
    { name: 'correctIndex', type: 'number', required: true },
  ],
  renderAndWaitForResponse: ({ args, respond }) => (
    <PieceQuiz
      question={args.question}
      options={args.options}
      onSelect={(index) => {
        respond({ 
          correct: index === args.correctIndex,
          selectedIndex: index 
        });
      }}
    />
  ),
});

// Opening Explorer
useFrontendTool({
  name: 'showOpening',
  description: 'Display chess opening information',
  parameters: [
    { name: 'name', type: 'string', required: true },
    { name: 'moves', type: 'array', required: true },
    { name: 'description', type: 'string', required: true },
  ],
  render: ({ args }) => (
    <OpeningCard
      name={args.name}
      moves={args.moves}
      description={args.description}
    />
  ),
});
```

### Chess Teaching Flow with Interactive UI

```
1. User: "Teach me about forks"
   
2. Agent calls startTeaching(5)
   -> InlineTeachingProgress renders (Step 1/5)
   
3. Agent explains fork concept
   -> Text with <square> tags for inline references
   
4. Agent calls showOpening or position setup
   -> Board diagram renders in chat
   
5. Agent calls askMoveSelection
   -> MoveSelectionQuiz with mini board renders
   
6. User clicks squares or selects move
   -> Feedback shown with move visualization
   
7. Agent shows MoveCard with evaluation
   -> "Play This Move" button available
   
8. User clicks "Play This Move"
   -> Move executes on main board
   
9. Continue through teaching steps...
```

---

## Implementation Steps

### Phase 1: Backend Tool Rendering (Week 1)

Add `useRenderToolCall` for existing backend tools:

**Files to modify:**
- `src/components/sudoku/SudokuGameWithAgent.tsx`
- `src/components/chess/ChessGameWithAgent.tsx`

```tsx
// Example for Sudoku
useRenderToolCall({
  name: "suggest_next_move",
  render: ({ status, args, result }) => {
    if (status === "inProgress") {
      return <ThinkingIndicator message="Analyzing puzzle..." />;
    }
    return (
      <HintCard
        cell={{ row: result.row, col: result.col }}
        value={result.value}
        strategy={result.strategy}
        explanation={result.explanation}
        onApply={() => fillCell(result.row, result.col, result.value)}
      />
    );
  },
});

useRenderToolCall({
  name: "analyze_sudoku_grid",
  render: ({ status, result }) => (
    <AnalysisCard
      isLoading={status !== "complete"}
      strategies={result?.strategies}
      difficulty={result?.difficulty}
      emptyCount={result?.empty_cells}
    />
  ),
});
```

### Phase 2: Chat UI Component Library (Week 1-2)

Create new components in `src/components/chat/`:

1. `ThinkingIndicator.tsx` - Loading animation
2. `HintCard.tsx` - Rich hint display
3. `AnalysisCard.tsx` - Analysis results
4. `MoveCard.tsx` - Chess move display
5. `CellBadge.tsx` - Inline cell reference
6. `SquareBadge.tsx` - Inline square reference

### Phase 3: Inline Teaching Progress (Week 2)

Replace external overlay with in-chat component:

```tsx
// In SudokuGameWithAgent.tsx
useCoAgentStateRender<SudokuAgentState>({
  name: "sudoku_agent",
  render: ({ state }) => {
    if (!state.teaching_active) return null;
    return (
      <InlineTeachingProgress
        currentStep={state.teaching_current_step}
        totalSteps={state.teaching_total_steps}
        topic={state.teaching_topic}
        onNext={() => sendMessage("Continue to the next step")}
        onStop={() => sendMessage("Stop the teaching session")}
      />
    );
  },
});
```

### Phase 4: Custom Markdown Tags (Week 2)

Add renderers to CopilotSidebar:

```tsx
const markdownTagRenderers = {
  "cell": ({ row, col, value, color }) => (
    <CellBadge row={row} col={col} value={value} color={color} />
  ),
  "square": ({ square, piece, color }) => (
    <SquareBadge square={square} piece={piece} color={color} />
  ),
  "strategy": ({ name, type }) => (
    <StrategyBadge name={name} type={type} />
  ),
  "opening": ({ name }) => (
    <OpeningBadge name={name} />
  ),
};

<CopilotSidebar markdownTagRenderers={markdownTagRenderers}>
```

Update agent prompts to use tags:
```python
# In agent/agents/sudoku/prompts.py
"""
When referencing cells, use inline tags:
- <cell row="2" col="5" value="7" color="green">R3C6=7</cell>

When mentioning strategies:
- <strategy name="Naked Single" type="basic">Naked Single</strategy>
"""
```

### Phase 5: Interactive Quiz Tools (Week 3)

Add HITL tools with `renderAndWaitForResponse`:

1. `askCellSelection` - Sudoku cell quiz
2. `askNumber` - Number input quiz
3. `showStrategyQuiz` - Strategy identification
4. `askMoveSelection` - Chess move quiz
5. `askPieceIdentification` - Piece knowledge quiz

### Phase 6: Dynamic Suggestions (Week 3)

Replace static suggestions with context-aware:

```tsx
useCopilotChatSuggestions({
  instructions: `
    Based on the current state, suggest relevant actions:
    - If teaching is active, suggest "Next Step" or "Stop Teaching"
    - If user made an error, suggest "Explain My Mistake"
    - If board is stuck, suggest "Get a Hint"
    - After explanations, suggest "Quiz Me" or "Practice This"
  `,
  dependencies: [isTeaching, lastMoveValid, emptyCellCount],
});
```

---

## Technical Specifications

### State Types to Add

```typescript
// src/lib/types.ts

interface ChatComponentState {
  activeQuiz: {
    type: 'cell' | 'number' | 'strategy' | 'move';
    question: string;
    answered: boolean;
    correct?: boolean;
  } | null;
  pendingHint: {
    cell: { row: number; col: number };
    value: number;
    applied: boolean;
  } | null;
}

interface SudokuAgentState {
  sudoku_grid: (number | null)[][];
  teaching_active: boolean;
  teaching_current_step: number;
  teaching_total_steps: number;
  teaching_topic: string;
  last_hint?: {
    row: number;
    col: number;
    value: number;
    strategy: string;
  };
}

interface ChessAgentState {
  chess_fen: string;
  chess_turn: 'white' | 'black';
  teaching_active: boolean;
  teaching_current_step: number;
  teaching_total_steps: number;
  teaching_topic: string;
  suggested_move?: {
    from: string;
    to: string;
    evaluation: number;
  };
}
```

### Styling Guidelines

Use Tailwind CSS with these design tokens:

```tsx
// Component color scheme
const colors = {
  hint: 'bg-blue-50 border-blue-200',
  success: 'bg-green-50 border-green-200',
  error: 'bg-red-50 border-red-200',
  warning: 'bg-yellow-50 border-yellow-200',
  info: 'bg-gray-50 border-gray-200',
  primary: 'bg-indigo-600 text-white',
};

// Component sizing
const sizes = {
  badge: 'px-2 py-1 text-xs rounded-full',
  card: 'p-4 rounded-lg border shadow-sm',
  button: 'px-4 py-2 rounded-md font-medium',
};
```

---

## File Changes Required

### New Files to Create

| File | Description |
|------|-------------|
| `src/components/chat/index.ts` | Barrel export for chat components |
| `src/components/chat/ThinkingIndicator.tsx` | Loading animation |
| `src/components/chat/HintCard.tsx` | Hint display card |
| `src/components/chat/AnalysisCard.tsx` | Analysis results |
| `src/components/chat/MoveCard.tsx` | Chess move card |
| `src/components/chat/CellBadge.tsx` | Inline cell reference |
| `src/components/chat/SquareBadge.tsx` | Inline square reference |
| `src/components/chat/StrategyBadge.tsx` | Strategy name badge |
| `src/components/chat/InlineTeachingProgress.tsx` | In-chat progress |
| `src/components/chat/CellSelectionQuiz.tsx` | Cell picker quiz |
| `src/components/chat/NumberPickerQuiz.tsx` | Number input quiz |
| `src/components/chat/StrategyQuiz.tsx` | Strategy MCQ |
| `src/components/chat/MoveSelectionQuiz.tsx` | Chess move quiz |
| `src/components/chat/OpeningCard.tsx` | Opening info card |
| `src/components/chat/ActionButtonGroup.tsx` | Button group |

### Files to Modify

| File | Changes |
|------|---------|
| `src/components/sudoku/SudokuGameWithAgent.tsx` | Add `useRenderToolCall`, `useCoAgentStateRender`, new HITL tools, markdown renderers |
| `src/components/chess/ChessGameWithAgent.tsx` | Same as above for chess |
| `src/app/sudoku/page.tsx` | Add `markdownTagRenderers` to CopilotSidebar |
| `src/app/chess/page.tsx` | Same as above |
| `agent/agents/sudoku/prompts.py` | Update prompts to use custom tags and new tools |
| `agent/agents/chess/prompts.py` | Same as above |
| `agent/agents/sudoku/tools.py` | Add tool definitions for quizzes |
| `agent/agents/chess/tools.py` | Same as above |
| `src/lib/types.ts` | Add new type definitions |

---

## Priority Roadmap

| Priority | Feature | Impact | Effort | Week |
|----------|---------|--------|--------|------|
| 1 | Backend tool rendering (`useRenderToolCall`) | High | Low | 1 |
| 2 | HintCard component | High | Low | 1 |
| 3 | AnalysisCard component | High | Low | 1 |
| 4 | MoveCard component (Chess) | High | Low | 1 |
| 5 | ThinkingIndicator | Medium | Low | 1 |
| 6 | Inline teaching progress | High | Medium | 2 |
| 7 | Custom markdown tags (CellBadge, SquareBadge) | Medium | Low | 2 |
| 8 | CellSelectionQuiz | High | Medium | 2-3 |
| 9 | StrategyQuiz | High | Medium | 3 |
| 10 | NumberPickerQuiz | Medium | Medium | 3 |
| 11 | MoveSelectionQuiz | High | Medium | 3 |
| 12 | Dynamic suggestions | Medium | Medium | 3 |
| 13 | OpeningCard | Medium | Low | 3 |
| 14 | Agent prompt updates | High | Low | 3 |

---

## CopilotKit Hooks Reference

| Hook | Purpose | Currently Used | To Implement |
|------|---------|----------------|--------------|
| `useFrontendTool` | Frontend tools | Yes (basic) | Add `render` property |
| `useCopilotReadable` | Provide context | Yes | No changes |
| `useCopilotAction` | Programmatic messaging | Yes | No changes |
| `useRenderToolCall` | Render backend tools | **No** | **Yes** |
| `useCoAgentStateRender` | Render agent state | **No** | **Yes** |
| `useCopilotChatSuggestions` | Dynamic suggestions | **No** | **Yes** |
| `renderAndWaitForResponse` | HITL interactions | **No** | **Yes** |

---

## Design Considerations

### 1. Teaching Flow Redesign
**Question:** Should quizzes be mandatory between teaching steps?  
**Recommendation:** Optional with encouragement. Agent should offer "Want to test your understanding?" after explanations.

### 2. Voice + UI Sync
**Question:** When TTS reads a hint, should the HintCard highlight?  
**Recommendation:** Yes, via shared state. Add `isSpeaking` state that triggers visual emphasis on active component.

### 3. Mobile Responsiveness
**Question:** Separate mobile components or responsive CSS?  
**Recommendation:** Responsive CSS with Tailwind breakpoints. Components should stack vertically on mobile with touch-friendly button sizes.

### 4. Error Handling
**Question:** What if quiz component fails to render?  
**Recommendation:** Graceful fallback to text-based interaction. Always provide text alternative.

### 5. Accessibility
**Requirement:** All interactive components must be keyboard navigable and screen-reader friendly.
- Use proper ARIA labels
- Support Tab navigation
- Announce quiz results to screen readers

---

## Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Interactive elements in chat | 0 | 10+ component types |
| Quiz completion rate | N/A | Track and aim for 70%+ |
| Teaching session completion | ~50% | 80%+ |
| User engagement (messages/session) | Low | 2x increase |
| Time to first hint action | N/A | <2 seconds after render |

---

## Appendix: Example Component Code

### HintCard.tsx

```tsx
import React, { useState } from 'react';

interface HintCardProps {
  cell: { row: number; col: number };
  value: number;
  strategy: string;
  explanation: string;
  confidence: 'high' | 'medium' | 'low';
  onApply?: () => void;
  onExplainMore?: () => void;
}

export function HintCard({
  cell,
  value,
  strategy,
  explanation,
  confidence,
  onApply,
  onExplainMore,
}: HintCardProps) {
  const [expanded, setExpanded] = useState(false);
  
  const confidenceColors = {
    high: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-orange-100 text-orange-800',
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 my-2">
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold text-blue-800">{strategy}</span>
        <span className={`px-2 py-1 text-xs rounded-full ${confidenceColors[confidence]}`}>
          {confidence} confidence
        </span>
      </div>
      
      <div className="flex items-center gap-4 mb-3">
        <div className="bg-white border-2 border-blue-300 rounded-lg p-3 text-center">
          <div className="text-xs text-gray-500">Cell</div>
          <div className="font-mono text-lg">R{cell.row + 1}C{cell.col + 1}</div>
        </div>
        <div className="text-2xl text-gray-400">-></div>
        <div className="bg-blue-600 text-white rounded-lg p-3 text-center min-w-[60px]">
          <div className="text-xs opacity-75">Value</div>
          <div className="text-2xl font-bold">{value}</div>
        </div>
      </div>
      
      <div 
        className="text-sm text-gray-600 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? explanation : `${explanation.slice(0, 100)}...`}
        <button className="text-blue-600 ml-1">
          {expanded ? 'Show less' : 'Show more'}
        </button>
      </div>
      
      <div className="flex gap-2 mt-3">
        {onApply && (
          <button
            onClick={onApply}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
          >
            Apply to Board
          </button>
        )}
        {onExplainMore && (
          <button
            onClick={onExplainMore}
            className="px-4 py-2 border border-blue-300 text-blue-600 rounded-md hover:bg-blue-50 transition"
          >
            Explain More
          </button>
        )}
      </div>
    </div>
  );
}
```

### StrategyQuiz.tsx

```tsx
import React, { useState } from 'react';

interface StrategyQuizProps {
  question: string;
  options: { id: string; label: string }[];
  correctId: string;
  onAnswer: (selectedId: string, isCorrect: boolean) => void;
}

export function StrategyQuiz({
  question,
  options,
  correctId,
  onAnswer,
}: StrategyQuizProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);

  const handleSelect = (id: string) => {
    if (answered) return;
    setSelected(id);
    setAnswered(true);
    onAnswer(id, id === correctId);
  };

  return (
    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 my-2">
      <div className="font-semibold text-purple-800 mb-3">{question}</div>
      
      <div className="space-y-2">
        {options.map((option) => {
          let className = "w-full text-left px-4 py-3 rounded-lg border transition ";
          
          if (!answered) {
            className += "border-gray-200 hover:border-purple-400 hover:bg-purple-50";
          } else if (option.id === correctId) {
            className += "border-green-500 bg-green-50 text-green-800";
          } else if (option.id === selected) {
            className += "border-red-500 bg-red-50 text-red-800";
          } else {
            className += "border-gray-200 opacity-50";
          }
          
          return (
            <button
              key={option.id}
              onClick={() => handleSelect(option.id)}
              disabled={answered}
              className={className}
            >
              {option.label}
              {answered && option.id === correctId && (
                <span className="ml-2">[Correct]</span>
              )}
              {answered && option.id === selected && option.id !== correctId && (
                <span className="ml-2">[Incorrect]</span>
              )}
            </button>
          );
        })}
      </div>
      
      {answered && (
        <div className={`mt-3 p-2 rounded text-sm ${
          selected === correctId ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {selected === correctId 
            ? 'Correct! Great job!' 
            : `Not quite. The correct answer is "${options.find(o => o.id === correctId)?.label}".`
          }
        </div>
      )}
    </div>
  );
}
```

### MoveCard.tsx (Chess)

```tsx
import React from 'react';

interface MoveCardProps {
  from: string;
  to: string;
  piece: string;
  pieceColor: 'white' | 'black';
  notation: string;
  evaluation?: number;
  isCapture?: boolean;
  isCheck?: boolean;
  explanation: string;
  onPlay?: () => void;
}

const pieceIcons: Record<string, string> = {
  king: 'K',
  queen: 'Q',
  rook: 'R',
  bishop: 'B',
  knight: 'N',
  pawn: 'P',
};

export function MoveCard({
  from,
  to,
  piece,
  pieceColor,
  notation,
  evaluation,
  isCapture,
  isCheck,
  explanation,
  onPlay,
}: MoveCardProps) {
  const evalColor = evaluation && evaluation > 0 
    ? 'text-green-600' 
    : evaluation && evaluation < 0 
      ? 'text-red-600' 
      : 'text-gray-600';

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 my-2">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`text-2xl font-bold ${pieceColor === 'white' ? 'text-gray-200 bg-gray-800' : 'text-gray-800 bg-gray-200'} w-10 h-10 flex items-center justify-center rounded`}>
            {pieceIcons[piece] || 'P'}
          </span>
          <div className="flex items-center gap-1 font-mono text-lg">
            <span className="bg-gray-100 px-2 py-1 rounded">{from}</span>
            <span className="text-gray-400">{isCapture ? 'x' : '->'}</span>
            <span className="bg-gray-100 px-2 py-1 rounded">{to}</span>
          </div>
          {isCheck && <span className="text-red-600 font-bold">+</span>}
        </div>
        
        {evaluation !== undefined && (
          <div className={`font-mono font-bold ${evalColor}`}>
            {evaluation > 0 ? '+' : ''}{evaluation.toFixed(1)}
          </div>
        )}
      </div>
      
      <div className="text-center font-mono text-xl font-bold text-amber-800 mb-2">
        {notation}
      </div>
      
      <p className="text-sm text-gray-600 mb-3">{explanation}</p>
      
      {onPlay && (
        <button
          onClick={onPlay}
          className="w-full bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700 transition font-medium"
        >
          Play This Move
        </button>
      )}
    </div>
  );
}
```

### InlineTeachingProgress.tsx

```tsx
import React from 'react';

interface InlineTeachingProgressProps {
  currentStep: number;
  totalSteps: number;
  stepTitle: string;
  topic: string;
  onNext: () => void;
  onStop: () => void;
}

export function InlineTeachingProgress({
  currentStep,
  totalSteps,
  stepTitle,
  topic,
  onNext,
  onStop,
}: InlineTeachingProgressProps) {
  const progressPercent = (currentStep / totalSteps) * 100;

  return (
    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 my-2">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-indigo-600 uppercase tracking-wide">
          {topic}
        </span>
        <span className="text-sm font-medium text-indigo-800">
          Step {currentStep} of {totalSteps}
        </span>
      </div>
      
      <div className="w-full bg-indigo-100 rounded-full h-2 mb-2">
        <div 
          className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      
      <div className="text-sm text-gray-700 mb-3">{stepTitle}</div>
      
      <div className="flex gap-2">
        <button
          onClick={onNext}
          className="flex-1 bg-indigo-600 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-indigo-700 transition"
        >
          {currentStep < totalSteps ? 'Next Step' : 'Finish'}
        </button>
        <button
          onClick={onStop}
          className="px-3 py-1.5 border border-indigo-300 text-indigo-600 rounded text-sm font-medium hover:bg-indigo-50 transition"
        >
          Stop
        </button>
      </div>
    </div>
  );
}
```

### CellBadge.tsx

```tsx
import React from 'react';

interface CellBadgeProps {
  row: number;
  col: number;
  value?: number;
  color?: 'green' | 'blue' | 'red' | 'yellow' | 'gray';
}

const colorClasses = {
  green: 'bg-green-100 text-green-800 border-green-300',
  blue: 'bg-blue-100 text-blue-800 border-blue-300',
  red: 'bg-red-100 text-red-800 border-red-300',
  yellow: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  gray: 'bg-gray-100 text-gray-800 border-gray-300',
};

export function CellBadge({ row, col, value, color = 'blue' }: CellBadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-sm font-mono ${colorClasses[color]}`}>
      <span className="opacity-60">R{row + 1}C{col + 1}</span>
      {value !== undefined && (
        <>
          <span className="opacity-40">=</span>
          <span className="font-bold">{value}</span>
        </>
      )}
    </span>
  );
}
```

### SquareBadge.tsx

```tsx
import React from 'react';

interface SquareBadgeProps {
  square: string;
  piece?: string;
  color?: 'light' | 'dark' | 'highlight';
}

const colorClasses = {
  light: 'bg-amber-100 text-amber-800 border-amber-300',
  dark: 'bg-amber-700 text-amber-100 border-amber-800',
  highlight: 'bg-green-100 text-green-800 border-green-300',
};

export function SquareBadge({ square, piece, color = 'light' }: SquareBadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-sm font-mono ${colorClasses[color]}`}>
      <span className="font-bold">{square}</span>
      {piece && (
        <span className="opacity-75">({piece})</span>
      )}
    </span>
  );
}
```

---

## Next Steps

1. Review this plan with the team
2. Set up component storybook for isolated development
3. Begin Phase 1 implementation
4. Create unit tests for each component
5. Conduct user testing after each phase

---

*Document created: February 2026*
*Last updated: February 2026*
