# Quick Start Guide - Multi-Agent Testing

> **Note**: For basic installation and running, see [main README](../README.md). This guide focuses on **testing the multi-agent architecture** and **advanced development workflows**.

## Prerequisites

Before starting, ensure you have completed the basic setup from the [README](../README.md):
- ✅ Dependencies installed (`pnpm install`)
- ✅ API keys configured in `agent/.env`
- ✅ Application running with `pnpm run dev`

---

## Testing the Multi-Agent System

### 1. Verify Agent Registration

After starting with `pnpm run dev`, check that all agents are registered:

```
✓ router_agent registered
✓ sudoku_agent registered
✓ chess_agent registered
```

If you see errors, check:
- Python dependencies are installed (`cd agent && uv sync`)
- `agent/.env` file exists with `OPENAI_API_KEY`
- Port 8123 is not in use

### 2. Test Individual Agents via API

Test each agent endpoint directly using curl:

**Router Agent (General Queries):**
```bash
curl http://localhost:8123/router_agent/invoke \
  -H "Content-Type: application/json" \
  -d '{"input": {"message": "What games can I learn here?"}}'
```

**Sudoku Agent:**
```bash
curl http://localhost:8123/sudoku_agent/invoke \
  -H "Content-Type: application/json" \
  -d '{"input": {"message": "Explain the basics of Sudoku"}}'
```

**Chess Agent:**
```bash
curl http://localhost:8123/chess_agent/invoke \
  -H "Content-Type: application/json" \
  -d '{"input": {"message": "What is the best opening move?"}}'
```

### 3. Test Frontend Agent Routing

Open your browser and verify agent routing:

1. **Home Page** (`http://localhost:3000/`)
   - Opens browser DevTools Console (F12)
   - Should show: `[CopilotKit] Using agent: router_agent`
   - Ask: "What games can I learn here?"

2. **Sudoku Page** (`http://localhost:3000/sudoku`)
   - Should show: `[CopilotKit] Using agent: sudoku_agent`
   - Click "Learn Sudoku Basics" or ask "Explain the rules"

3. **Chess Page** (`http://localhost:3000/chess`)
   - Should show: `[CopilotKit] Using agent: chess_agent`
   - Ask: "Teach me chess basics"

---

## Advanced Development

### Running Agents Separately

For development, you might want to run frontend and backend separately:

**Terminal 1 - Agent Server (LangGraph):**
```bash
cd agent
langgraph dev
# Agent server starts on http://localhost:8123
```

**Terminal 2 - Frontend (Next.js):**
```bash
pnpm run dev:ui
# Frontend starts on http://localhost:3000
```

### Adding a New Tool to Sudoku Agent

1. **Create the tool** in `agent/agents/sudoku/tools.py`:
```python
@tool
def my_new_tool(param: str) -> str:
    """Tool description for the LLM."""
    # Implementation
    return result
```

2. **Register the tool** in `agent/agents/sudoku/agent.py`:
```python
from .tools import analyze_grid, validate_move, my_new_tool

tools = [
    analyze_grid,
    validate_move,
    my_new_tool,  # Add here
    # ...
]
```

3. **Document in prompt** `agent/agents/sudoku/prompts.py`:
```python
SUDOKU_SYSTEM_PROMPT = """...
Available tools:
- my_new_tool: Description of when to use it
...
"""
```

4. **Test**: Restart agent server and test on Sudoku page

### Updating Agent Prompts

To improve teaching quality, edit the agent-specific prompt:

```bash
# Edit the prompt
code agent/agents/sudoku/prompts.py

# Restart agent server
cd agent
langgraph dev
```

**No need to touch other agents!** Each agent is independent.

### Adding a New Game Agent

See [docs/AGENT_ARCHITECTURE_RECOMMENDATIONS.md](AGENT_ARCHITECTURE_RECOMMENDATIONS.md) for complete guide.

Quick overview:
1. Create `agent/agents/newgame/` directory
2. Create `agent.py`, `prompts.py`, `state.py`, `tools.py`
3. Register in `langgraph.json`
4. Add frontend page with `useCoAgent({ name: 'newgame_agent' })`

---

## Troubleshooting

### Agent Not Starting

**Error**: `Module not found: shared`

**Fix**: Agents use `sys.path.insert()` to import shared modules. Ensure you're running from correct directory:
```bash
cd agent
langgraph dev
```

### Frontend Not Connecting

**Error**: `Failed to connect to agent server`

**Fix**:
1. Ensure agent server is running on port 8123
2. Check no other service is using port 8123
3. Verify `LANGGRAPH_DEPLOYMENT_URL` (default: `http://127.0.0.1:8123`)

### Wrong Agent Responding

**Issue**: Sudoku page getting Chess responses

**Fix**: Verify page uses correct agent name:
```typescript
// src/app/sudoku/page.tsx
const { state, setState } = useCoAgent({
  name: 'sudoku_agent',  // Must match agent name in langgraph.json
  initialState: { ... }
});
```

### Voice Not Working

**Issue**: No audio playback during teaching

**Fix**:
1. Verify `ELEVENLABS_API_KEY` is set in `agent/.env`
2. Check browser allows autoplay (some browsers block it)
3. Check browser console for errors
4. App falls back to browser TTS if ElevenLabs unavailable

### Agent Crashes on Startup

**Error**: `ImportError: No module named 'langchain'`

**Fix**: Reinstall Python dependencies:
```bash
cd agent
uv sync --reinstall
```

### Port Already in Use

**Error**: `EADDRINUSE: address already in use :::8123`

**Fix**: Kill existing process:
```bash
# Windows
netstat -ano | findstr :8123
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:8123 | xargs kill -9
```

---

## Project Structure

```
learnplay-ai/
├── src/                        # Frontend (Next.js + React)
│   ├── app/
│   │   ├── page.tsx           # Home → router_agent
│   │   ├── sudoku/page.tsx    # Sudoku → sudoku_agent
│   │   ├── chess/page.tsx     # Chess → chess_agent
│   │   └── api/
│   │       └── copilotkit/    # CopilotKit runtime
│   ├── components/            # UI components
│   └── lib/                   # Game logic
│
└── agent/                      # Backend (Python + LangGraph)
    ├── langgraph.json         # Agent configuration
    ├── shared/                # Shared utilities
    │   ├── voice_tools.py
    │   ├── tts_service.py
    │   └── base_state.py
    └── agents/                # Specialized agents
        ├── router_agent.py    # General queries
        ├── sudoku/            # Sudoku specialist
        │   ├── agent.py
        │   ├── prompts.py     # ~80 line focused prompt
        │   ├── state.py       # Sudoku-specific state
        │   └── tools.py       # Sudoku tools
        └── chess/             # Chess specialist
            ├── agent.py
            ├── prompts.py
            ├── state.py
            └── tools.py
```

---

## Development Commands

```bash
# Start both frontend and agent
pnpm run dev

# Start separately
pnpm run dev:ui        # Frontend only (port 3000)
pnpm run dev:agent     # Agent only (port 8123)

# Build for production
pnpm run build

# Run linter
pnpm run lint

# Type checking
pnpm run typecheck
```

---

## Additional Resources

- **[Architecture Guide](AGENT_ARCHITECTURE_RECOMMENDATIONS.md)** - Multi-agent design patterns
- **[AI Teaching System](AI_TEACHING.md)** - Teaching flow and patterns
- **[Setup Guide](SETUP.md)** - Complete configuration options
- **[Development Plan](../PLAN.md)** - Task tracking and roadmap

---

## Next Steps

1. ✅ Verify all agents are working
2. 📖 Read [docs/AI_TEACHING.md](AI_TEACHING.md) to understand teaching patterns
3. 🎮 Try teaching sessions on Sudoku page
4. 🔧 Experiment with modifying agent prompts
5. 🏗️ Review architecture in [docs/AGENT_ARCHITECTURE_RECOMMENDATIONS.md](AGENT_ARCHITECTURE_RECOMMENDATIONS.md)

---

**Happy coding!** 🚀
