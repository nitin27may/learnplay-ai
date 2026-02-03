# LearnPlay.ai - GitHub Copilot Instructions

This document provides guidance for AI assistants working on the LearnPlay.ai project.

## Project Overview

LearnPlay.ai is an AI-powered educational gaming platform that teaches strategy games (Sudoku and Chess) through interactive tutoring using a **Multi-Agent Architecture**.

- **Frontend**: Next.js 16 with React 19, CopilotKit, and TailwindCSS
- **Backend/Agents**: Python with LangGraph and LangChain
- **AI Communication**: CopilotKit AG-UI Protocol
- **Voice**: Eleven Labs TTS integration

## Multi-Agent Architecture

```
Frontend (Next.js) ←→ CopilotKit Runtime ←→ Specialized Agents (Python)
                                                  ↓
                                    Router Agent (General queries)
                                    Sudoku Agent (Sudoku specialist)
                                    Chess Agent (Chess specialist)
                                                  ↓
                                    LLM Provider (OpenAI/Anthropic/Ollama)
```

### Key Directories

**Frontend:**
- `src/app/sudoku/page.tsx` - Sudoku page with frontend tools (uses `sudoku_agent`)
- `src/app/chess/page.tsx` - Chess page (uses `chess_agent`)
- `src/app/page.tsx` - Home page (uses `router_agent`)
- `src/components/sudoku/` - Sudoku game components
- `src/components/chess/` - Chess game components
- `src/components/TeachingProgress.tsx` - Teaching UI overlay

**Backend (Multi-Agent):**
- `agent/main.py` - Legacy entry point (backward compatibility)
- `agent/langgraph.json` - Multi-agent configuration
- `agent/shared/` - Shared tools (voice, TTS, base state)
- `agent/agents/router_agent.py` - General assistant
- `agent/agents/sudoku/` - Sudoku specialist agent
- `agent/agents/chess/` - Chess specialist agent

## Agent Responsibilities

### Router Agent (`router_agent.py`)
- **Purpose**: Handle general platform questions, greetings, game comparisons
- **Used by**: Home page (`/`)
- **Tools**: Basic utilities (weather)
- **System Prompt**: ~50 lines, focused on navigation and encouragement
- **State**: Minimal (proverbs, current_game)

### Sudoku Agent (`agents/sudoku/agent.py`)
- **Purpose**: Teach Sudoku rules, strategies, and solve puzzles
- **Used by**: Sudoku page (`/sudoku`)
- **Tools**: analyze_grid, validate_move, suggest_move, explain_basics, speak_message
- **System Prompt**: ~80 lines, Sudoku-specific teaching patterns
- **State**: sudoku_grid, teaching_active, teaching_current_step, etc.

### Chess Agent (`agents/chess/agent.py`)
- **Purpose**: Teach Chess rules, tactics, and provide move suggestions
- **Used by**: Chess page (`/chess`)
- **Tools**: analyze_position, suggest_move, validate_move, get_attacked_squares, speak_message
- **System Prompt**: ~80 lines, Chess-specific teaching patterns
- **State**: chess_fen, chess_game_mode, teaching_active, etc.

## Agent File Structure

```
agent/agents/sudoku/
  ├── __init__.py          # Package exports
  ├── agent.py             # Agent definition + graph export
  ├── prompts.py           # System prompts (SUDOKU_SYSTEM_PROMPT)
  ├── state.py             # State schema (SudokuAgentState)
  └── tools.py             # Sudoku-specific tools

agent/agents/chess/
  ├── __init__.py
  ├── agent.py
  ├── prompts.py           # Chess system prompts
  ├── state.py             # ChessAgentState
  └── tools.py             # Chess tools

agent/shared/
  ├── __init__.py
  ├── base_state.py        # BaseTeachingState (inherited by all)
  ├── voice_tools.py       # speak_message tool
  ├── tts_service.py       # ElevenLabs integration
  └── teaching_tools.py    # Common utilities
```

## Important Patterns

### Frontend Tools (CopilotKit)

Frontend tools are defined using `useFrontendTool()` and allow the agent to control the UI:

```typescript
useFrontendTool({
  name: 'highlightCells',
  description: 'Highlight cells on the board',
  parameters: [...],
  handler({ cells, message }) {
    // Update React state
    setAnnotations(cells);
    // Trigger TTS
    voice.speak(message);
    return 'Done';
  }
});
```

### Single-Step Teaching Pattern

**CRITICAL**: LLMs are stateless. The agent CANNOT "wait" between steps.

For multi-step teaching (e.g., "Explain basics"):
1. Each user message triggers ONE step
2. Agent delivers one step and stops
3. User clicks "Next Step" which sends "Continue to the next step"
4. Agent delivers next step based on conversation history

**Wrong approach** (doesn't work):
```python
for step in steps:
    teach_step(step)
    wait_for_user()  # [ERROR] LLMs can't wait!
```

**Correct approach** (one step per request):
```python
# User message 1: "Explain basics"
→ startTeaching(4) + deliver step 1 + STOP

# User message 2: "Continue"  
→ deliver step 2 + STOP

# Repeat until done
```

### Teaching State

The `TeachingProgress` component tracks:
- `isTeaching` - Whether a session is active
- `currentStepNumber` - Current step (1-based)
- `totalSteps` - Total steps in session
- `currentStep` - Description of current step

### Agent State Schema

```python
class AgentState(CopilotKitState):
    sudoku_grid: Optional[List[List[Optional[int]]]]
    teaching_active: bool
    teaching_current_step: int
    teaching_total_steps: int
    teaching_topic: str
```

## Common Issues & Solutions

### 1. "Next Step" Button Not Working

**Cause**: Agent tried to deliver all steps at once
**Fix**: Ensure agent prompts specify ONE step per response. Each agent has focused prompts.

### 2. Teaching Session Gets Stuck

**Cause**: Agent didn't call `updateTeachingStep()` or `endTeaching()`
**Fix**: Check agent response includes proper tool calls. Review agent-specific prompts.

### 3. Wrong Agent Responding

**Cause**: Frontend page using wrong agent name
**Fix**: Verify `useCoAgent({ name: 'sudoku_agent' })` matches the page context

### 4. Unicode Errors on Windows

**Cause**: Emoji characters in Python print statements
**Fix**: Use ASCII-only messages or wrap stdout with UTF-8 encoding (already handled in tts_service.py)

### 5. Agent Not Responding

**Cause**: Missing API key or agent crashed
**Fix**: Check `OPENAI_API_KEY` is set in `agent/.env`

### 6. Shared Module Import Errors

**Cause**: Python path not configured correctly in agents
**Fix**: Agents use `sys.path.insert()` to add parent directory to path

## Modifying Agents

### Adding a New Sudoku Tool

1. Add tool function to `agent/agents/sudoku/tools.py`
2. Import and add to tools list in `agent/agents/sudoku/agent.py`
3. Update `SUDOKU_SYSTEM_PROMPT` in `prompts.py` to document the tool
4. Test on Sudoku page

### Updating Agent Prompts

**DO:**
- Edit the specific agent's `prompts.py` file
- Test only the affected game page
- Keep prompts focused on single game domain

**DON'T:**
- Edit `main.py` system prompt (deprecated)
- Mix game logic across agents
- Update one agent without testing its specific page

### Adding a New Game Agent

Follow the pattern in `AGENT_ARCHITECTURE_RECOMMENDATIONS.md`:

1. Create `agent/agents/newgame/` directory
2. Create `agent.py`, `prompts.py`, `state.py`, `tools.py`
3. Register in `langgraph.json` graphs section
4. Add to CopilotKit runtime in `src/app/api/copilotkit/route.ts`
5. Create frontend page with `useCoAgent({ name: 'newgame_agent' })`

## Testing Multi-Agent Architecture

### Testing Individual Agents

```bash
# Start the agent server
cd agent
langgraph dev

# Test Sudoku agent
curl http://localhost:8123/sudoku_agent/invoke -d '{"input": {"message": "explain basics"}}'

# Test Chess agent  
curl http://localhost:8123/chess_agent/invoke -d '{"input": {"message": "suggest a move"}}'
```

### Frontend Testing

1. **Sudoku**: Navigate to `/sudoku` → Should use `sudoku_agent`
2. **Chess**: Navigate to `/chess` → Should use `chess_agent`
3. **Home**: Navigate to `/` → Should use `router_agent`

Check browser console for agent routing:
```
[CopilotKit] Using agent: sudoku_agent
```

## Development Commands

```bash
# Start both UI and agent
npm run dev

# Start only UI
npm run dev:ui

# Start only agent
npm run dev:agent

# With Doppler secrets
npm run dev:doppler
```

## Environment Variables

Required in `agent/.env`:
```
OPENAI_API_KEY=sk-...
LLM_PROVIDER=openai
OPENAI_MODEL=gpt-4o-mini
```

Optional:
```
ELEVENLABS_API_KEY=...
LLM_TEMPERATURE=0.3
LLM_MAX_TOKENS=1000
```

## Testing

The project uses Playwright MCP for browser testing. To test:

1. Start the dev server: `npm run dev`
2. Use Playwright MCP tools to interact with `http://localhost:3000/sudoku`
3. Test teaching flow: Click "Learn Sudoku Basics" and verify progression

## Best Practices

1. **Always use frontend tools** for visual updates (don't just describe)
2. **Keep voice messages under 25 words** for quick TTS
3. **Track teaching state** using startTeaching/updateTeachingStep/endTeaching
4. **Test changes** with Playwright MCP after modifications
5. **Handle errors gracefully** - teaching should degrade without voice/highlights
6. **Never use emojis** in code, documentation, comments, or any project files - use descriptive text instead

## Files to Review for Context

Before making changes, review these key files:
- [agent/main.py](agent/main.py) - Agent prompts and tool definitions
- [src/app/sudoku/page.tsx](src/app/sudoku/page.tsx) - Frontend tool implementations
- [docs/AI_TEACHING.md](docs/AI_TEACHING.md) - Detailed architecture documentation
