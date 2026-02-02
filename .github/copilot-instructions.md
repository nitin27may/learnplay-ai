# LearnPlay.ai - GitHub Copilot Instructions

This document provides guidance for AI assistants working on the LearnPlay.ai project.

## Project Overview

LearnPlay.ai is an AI-powered educational gaming platform that teaches strategy games (Sudoku and Chess) through interactive tutoring. It uses:

- **Frontend**: Next.js 16 with React 19, CopilotKit, and TailwindCSS
- **Backend/Agent**: Python with LangGraph and LangChain
- **AI Communication**: CopilotKit AG-UI Protocol
- **Voice**: Eleven Labs TTS integration

## Architecture

```
Frontend (Next.js) ←→ CopilotKit ←→ LangGraph Agent (Python)
                                          ↓
                                    LLM Provider (OpenAI/Anthropic/Ollama)
```

### Key Directories

- `src/app/sudoku/page.tsx` - Main Sudoku page with frontend tools
- `src/components/sudoku/` - Sudoku game components
- `src/components/TeachingProgress.tsx` - Teaching UI overlay
- `agent/main.py` - LangGraph agent with system prompts
- `agent/sudoku_tools.py` - Sudoku analysis tools
- `agent/llm_provider.py` - Multi-LLM configuration

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
    wait_for_user()  # ❌ LLMs can't wait!
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
**Fix**: Ensure prompts specify ONE step per response

### 2. Teaching Session Gets Stuck

**Cause**: Agent didn't call `updateTeachingStep()` or `endTeaching()`
**Fix**: Check agent response includes proper tool calls

### 3. Unicode Errors on Windows

**Cause**: Emoji characters in Python print statements
**Fix**: Use ASCII-only messages or wrap stdout with UTF-8 encoding

### 4. Agent Not Responding

**Cause**: Missing API key or agent crashed
**Fix**: Check `OPENAI_API_KEY` is set in `agent/.env`

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

## Files to Review for Context

Before making changes, review these key files:
- [agent/main.py](agent/main.py) - Agent prompts and tool definitions
- [src/app/sudoku/page.tsx](src/app/sudoku/page.tsx) - Frontend tool implementations
- [docs/AI_TEACHING.md](docs/AI_TEACHING.md) - Detailed architecture documentation
