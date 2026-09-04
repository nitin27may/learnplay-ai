# CLAUDE.md

Guidance for Claude Code working in this repository. `README.md` covers what the
app is and how to install it; `docs/` holds the long-form material
(`PROJECT_OVERVIEW.md`, `SETUP.md`, `AI_TEACHING.md`, the two game guides).
This file only carries what a change has to respect.

## Shape of the thing

Two processes, always both. Next.js (UI, port 3000) and a LangGraph dev server
(the tutors, port 8123). `npm run dev` starts both under `concurrently` with
`--kill-others`, so one crashing takes down the other — that is deliberate, and
it means a stack trace from either side ends the whole session.

The UI reaches the agents through one catch-all route,
`src/app/api/copilotkit/[[...slug]]/route.ts`, which constructs a
`LangGraphAgent` per `graphId` against `LANGGRAPH_DEPLOYMENT_URL`
(default `http://127.0.0.1:8123`). Adding a tutor means registering a graph, not
adding a route.

```
Browser -> Next.js :3000 -> /api/copilotkit/<agent> -> LangGraph :8123
                                                          |
                                    Ollama / OpenAI / Anthropic / Azure OpenAI
```

## Commands

```bash
npm run dev            # UI + agent together (this is the one you want)
npm run dev:ui         # Next.js only, --turbopack
npm run dev:agent      # LangGraph CLI only, port 8123
npm run dev:debug      # same as dev, LOG_LEVEL=debug
npm run dev:doppler    # dev, with secrets injected by Doppler

npm run typecheck      # tsc --noEmit
npm run lint           # eslint .
npm run build
```

There is **no test script on this branch** — `typecheck`, `lint` and `build` are
the whole gate. Do not claim a change is verified on the strength of a passing
build alone; say which of the three you ran.

**`postinstall` runs `install:agent`.** Every `npm install` re-runs
`scripts/setup-agent.sh`, which provisions the Python side with `uv`. If npm
install fails at the end, look there before suspecting the Node deps.

## Agents (`agent/`)

Graphs are registered in `agent/langgraph.json` — a graph that is not in that
map does not exist as far as the UI is concerned:

| Graph id | Module |
|---|---|
| `router_agent` | `agents/router_agent.py:graph` |
| `sudoku_agent` | `agents/sudoku/agent.py:graph` |
| `chess_agent` | `agents/chess/agent.py:graph` |
| `sample_agent` | `main.py:graph` |

Shared code is `agent/shared/`: `base_state.py` (the state every tutor extends),
`teaching_tools.py` (the highlight/speak tools the tutors emit), plus
`tts_service.py` and `voice_tools.py`. A new tutor composes those — do not fork
them per game.

**Python is `uv` only** (`agent/pyproject.toml`, `requires-python = ">=3.12"`,
ruff at line-length 100). No pip, no poetry.

## LLM providers

`agent/llm_provider.py` selects on `LLM_PROVIDER` — `openai` (default),
`azure-openai`, `anthropic`, `ollama`. Every call goes through
`get_llm_provider()`; never construct a chat model at a call site, or the
provider switch stops being a switch.

## Things that look like bugs and are not

- **A local tutor turn takes seconds.** Roughly 3-10s for a hint and 30-60s for
  an AI chess move on a 14B model at ~20 tok/s. That is the model thinking.
- **The first request after an idle gap is slow.** Ollama unloads the model
  after `OLLAMA_KEEP_ALIVE`; the next turn pays a reload of ~15s.
- **`GET /api/copilotkit/<agent>/info` returns 405.** A CopilotKit capability
  probe. The v1 endpoint helper runs single-route and rejects non-POST before
  routing. Harmless; fixing it means moving to the v2 endpoint API.

A real one worth knowing before you touch prompts: **local models skip
`speak_message` on long answers** — a 14B model will quote the rule back when
asked and then ignore it, while cloud models obey it. Do not try to fix this by
rewording the prompt again; the fix belongs in the frontend (speak the first
sentence when a turn produces text and no speech).

## Do not

- Deploy this publicly as-is. See `docs/SECURITY_AUDIT.md`.
- Add a per-agent API route. Register the graph in `agent/langgraph.json`.
- Construct a chat model outside `get_llm_provider()`.
- Use pip or poetry for the Python side, or yarn/pnpm for the Node side.
