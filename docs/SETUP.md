# Complete Setup & Configuration Guide

> **Quick Start**: For basic installation, see [main README](../README.md). This guide covers **detailed configuration options**, **gameplay features**, and **troubleshooting**.

---

## Table of Contents

1. [LLM Provider Configuration](#llm-provider-configuration)
2. [Voice Configuration](#voice-configuration)
3. [Using the Sudoku Game](#using-the-sudoku-game)
4. [AI Tutor Features](#ai-tutor-features)
5. [Advanced Configuration](#advanced-configuration)
6. [Troubleshooting](#troubleshooting)

---

## LLM Provider Configuration

### OpenAI (Default)

```env
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-proj-your-key-here
OPENAI_MODEL=gpt-4o-mini
```

**Available Models:**
- `gpt-4o` - Most capable, best for complex teaching
- `gpt-4o-mini` - Faster and cheaper (recommended)
- `gpt-4-turbo` - Good balance
- `gpt-3.5-turbo` - Fastest but less capable

**Get API Key**: [platform.openai.com/api-keys](https://platform.openai.com/api-keys)

### Anthropic Claude

```env
LLM_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-your-key-here
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
```

**Available Models:**
- `claude-3-5-sonnet-20241022` - Best quality (recommended)
- `claude-3-opus-20240229` - Most capable but slower
- `claude-3-haiku-20240307` - Fastest and cheapest

**Get API Key**: [console.anthropic.com](https://console.anthropic.com)

### Azure OpenAI

```env
LLM_PROVIDER=azure-openai
AZURE_OPENAI_API_KEY=your-azure-key
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT=gpt-4o
AZURE_OPENAI_API_VERSION=2024-02-15-preview
```

**Setup Steps:**
1. Create Azure OpenAI resource in Azure Portal
2. Deploy a model (gpt-4o or gpt-4o-mini)
3. Copy endpoint URL and API key
4. Use deployment name (not model name)

**Documentation**: [learn.microsoft.com/azure/ai-services/openai](https://learn.microsoft.com/azure/ai-services/openai)

### Ollama (Local/Free)

```env
LLM_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1:8b
```

**Setup Ollama:**

1. **Install Ollama**:
   - **macOS**: `brew install ollama`
   - **Linux**: `curl -fsSL https://ollama.com/install.sh | sh`
   - **Windows**: Download from [ollama.com](https://ollama.com)

2. **Start Ollama**:
   ```bash
   ollama serve
   ```

3. **Pull a Model**:
   ```bash
   ollama pull llama3.1:8b      # 4.7GB - Good balance
   ollama pull llama3.1:70b     # 40GB - Best quality
   ollama pull mistral:7b       # 4.1GB - Fast
   ```

**Recommended Models:**
- `llama3.1:8b` - Best balance of speed and quality
- `mistral:7b` - Fast inference
- `qwen2.5:14b` - Better reasoning

**Note**: Local models are free but require significant RAM (8GB+ for 8B models, 32GB+ for 70B).

---

## Voice Configuration

LearnPlay.ai uses **ElevenLabs** for natural voice explanations during teaching.

### Setup ElevenLabs

1. **Sign up** at [elevenlabs.io](https://elevenlabs.io) (free tier: 10,000 characters/month)
2. **Get API Key** from [elevenlabs.io/speech-synthesis](https://elevenlabs.io/speech-synthesis)
3. **Add to `agent/.env`**:

```env
ELEVENLABS_API_KEY=your-elevenlabs-api-key
ELEVENLABS_VOICE_ID=JBFqnCBsd6RMkjVDRZzb  # Optional, defaults to "George"
```

### Voice Options

| Voice ID | Name | Gender | Style |
|----------|------|--------|-------|
| `JBFqnCBsd6RMkjVDRZzb` | George | Male | Clear, educational (default) |
| `21m00Tcm4TlvDq8ikWAM` | Rachel | Female | Warm, friendly |
| `AZnzlk1XvdvUeBnXmlld` | Domi | Female | Energetic |
| `EXAVITQu4vr4xnSDxMaL` | Bella | Female | Soft, gentle |
| `ErXwobaYiN019PkySvjV` | Antoni | Male | Well-rounded |

**Browse more voices**: [elevenlabs.io/voice-library](https://elevenlabs.io/voice-library)

### Fallback Behavior

If ElevenLabs is not configured or unavailable:
- App continues working normally
- Falls back to browser's built-in TTS (less natural)
- [INFO] Message shown: "Voice unavailable, using browser TTS"

---

## Using the Sudoku Game

### Gameplay Basics

1. **Start a Game**:
   - Navigate to [localhost:3000/sudoku](http://localhost:3000/sudoku)
   - Select difficulty: Easy, Medium, Hard, or Expert
   - Click "Start Game"

2. **Making Moves**:
   - **Mouse**: Click empty cell → Click number from pad
   - **Keyboard**: Click cell → Press 1-9 → Press Enter/Delete
   - **Navigation**: Use arrow keys to move between cells

3. **Game Controls**:
   - **Hint** - Reveals one correct number (limited per game)
   - **Undo/Redo** - Navigate through move history
   - **Reset** - Start current puzzle over
   - **New Game** - Generate fresh puzzle with same/different difficulty

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `1-9` | Place number in selected cell |
| `Delete` / `Backspace` | Clear cell |
| `↑` `↓` `←` `→` | Navigate between cells |
| `Ctrl/Cmd + Z` | Undo last move |
| `Ctrl/Cmd + Shift + Z` | Redo move |
| `Esc` | Deselect cell |

---

## AI Tutor Features

### Opening the AI Tutor

Click the **chat icon** in the bottom-right corner to open the AI tutor sidebar.

### Quick Teaching Actions

Use the **teaching buttons** for instant lessons:
- **"Learn Sudoku Basics"** - 4-step guided introduction
- **"Analyze Grid"** - Get strategic insights on current puzzle
- **"Suggest Move"** - Get hint with explanation
- **"Explain Technique"** - Learn specific strategy

### Chat with AI

Ask questions naturally:

**Learning Strategies:**
```
"Explain the naked single technique"
"What are the basic Sudoku strategies?"
"Teach me about hidden singles"
"How does the X-Wing pattern work?"
```

**Getting Help:**
```
"Give me a hint for this puzzle"
"What's the next best move?"
"Analyze my current grid"
"Show me all naked singles"
```

**Move Validation:**
```
"Was my last move correct?"
"Why can't I put a 5 here?"
"What strategy should I use next?"
```

### Teaching Progress

When in a teaching session:
- **Progress Bar** shows current step (e.g., "Step 2 of 4")
- **Current Step** displays what you're learning
- **Next Step Button** advances to next lesson
- **Stop Teaching** exits the session
- **Pause/Resume** temporarily pause learning

### Visual Highlights

During teaching, the AI highlights cells with colors:
- **Green** - Focus cells for current step
- **Blue** - Related cells to observe
- **Yellow** - Cells to compare
- **Red** - Conflict or error cells
- **Purple** - Advanced pattern highlights

---

## Advanced Configuration

### Environment Variables Reference

Complete list of available environment variables in `agent/.env`:

```env
# === LLM Provider (Required) ===
LLM_PROVIDER=openai                    # openai, anthropic, azure-openai, ollama
OPENAI_API_KEY=sk-proj-...             # Your OpenAI API key
OPENAI_MODEL=gpt-4o-mini               # Model to use

# === LLM Settings (Optional) ===
LLM_TEMPERATURE=0.3                     # 0.0-1.0, lower = more focused
LLM_MAX_TOKENS=1000                     # Max tokens per response
LLM_STREAMING=true                      # Enable streaming responses

# === Voice/TTS (Optional) ===
ELEVENLABS_API_KEY=...                  # ElevenLabs API key
ELEVENLABS_VOICE_ID=JBFqnCBsd6RMkjVDRZzb  # Voice to use

# === Anthropic (If using Claude) ===
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022

# === Azure OpenAI (If using Azure) ===
AZURE_OPENAI_API_KEY=...
AZURE_OPENAI_ENDPOINT=https://...
AZURE_OPENAI_DEPLOYMENT=gpt-4o
AZURE_OPENAI_API_VERSION=2024-02-15-preview

# === Ollama (If using local models) ===
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1:8b
```

### Performance Tuning

**For faster responses** (less detailed):
```env
LLM_TEMPERATURE=0.1
LLM_MAX_TOKENS=500
OPENAI_MODEL=gpt-4o-mini
```

**For better teaching quality** (more detailed):
```env
LLM_TEMPERATURE=0.5
LLM_MAX_TOKENS=1500
OPENAI_MODEL=gpt-4o
```

**For cost optimization**:
```env
OPENAI_MODEL=gpt-4o-mini               # Cheapest
LLM_MAX_TOKENS=800                     # Limit response length
# Or use Ollama for completely free local inference
```

---

## Troubleshooting

### Installation Issues

**Error**: `Agent dependencies failed to install`

**Fix**:
```bash
cd agent
uv sync --reinstall
cd ..
npm run dev
```

**Error**: `node_modules not found`

**Fix**:
```bash
npm install --force
```

### Agent Won't Start

**Error**: `OPENAI_API_KEY is not set`

**Fix**: Create `agent/.env` with your API key:
```env
OPENAI_API_KEY=sk-proj-your-actual-key-here
```

**Error**: `Invalid API key`

**Fix**: Verify your API key:
- OpenAI keys start with `sk-proj-` or `sk-`
- Anthropic keys start with `sk-ant-`
- No spaces or quotes around the key in `.env`

**Error**: `Module not found: langchain`

**Fix**:
```bash
cd agent
uv sync --reinstall
```

### Frontend Issues

**Error**: `Failed to connect to agent server`

**Fix**:
1. Verify agent is running on port 8123
2. Check no firewall blocking localhost
3. Restart both services: `npm run dev`

**Error**: Page won't load or blank screen

**Fix**: Clear Next.js cache
```bash
rm -rf .next
npm run dev
```

### Voice/TTS Issues

**Issue**: No voice during teaching

**Causes & Fixes**:
1. **ElevenLabs key not set**: Add `ELEVENLABS_API_KEY` to `agent/.env`
2. **Browser blocks audio**: Click anywhere on page first (browser autoplay policy)
3. **ElevenLabs quota exceeded**: Check usage at [elevenlabs.io](https://elevenlabs.io)
4. **Fallback TTS**: App uses browser TTS if ElevenLabs unavailable

### Port Conflicts

**Error**: `Port 3000 already in use`

**Fix**:
```bash
# Kill process on port 3000
npx kill-port 3000
npm run dev
```

**Error**: `Port 8123 already in use`

**Fix**:
```bash
# Windows
netstat -ano | findstr :8123
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:8123 | xargs kill -9
```

### Agent Errors

**Error**: Wrong agent responding (Sudoku getting Chess responses)

**Fix**: Verify page uses correct agent:
```typescript
// src/app/sudoku/page.tsx
useCoAgent({ name: 'sudoku_agent' })  // Must match langgraph.json
```

**Error**: Teaching session stuck

**Fix**:
1. Click "Stop Teaching" button
2. Refresh page
3. Start teaching session again

### Performance Issues

**Issue**: Slow responses from agent

**Solutions**:
1. Use faster model: `gpt-4o-mini` instead of `gpt-4o`
2. Reduce max tokens: `LLM_MAX_TOKENS=500`
3. Use local Ollama for instant responses (no API calls)
4. Check your internet connection

**Issue**: High API costs

**Solutions**:
1. Switch to `gpt-4o-mini` (95% cheaper than `gpt-4o`)
2. Set `LLM_MAX_TOKENS=800` to limit response length
3. Use Ollama for completely free local inference
4. Monitor usage at [platform.openai.com/usage](https://platform.openai.com/usage)

---

## Additional Resources

### Documentation
- **[Quick Start](QUICKSTART.md)** - Multi-agent testing and development
- **[Architecture](AGENT_ARCHITECTURE_RECOMMENDATIONS.md)** - System design
- **[AI Teaching](AI_TEACHING.md)** - Teaching patterns
- **[Security](SECURITY_AUDIT.md)** - Security considerations
- **[Sudoku Guide](SUDOKU_GUIDE.md)** - Game strategies

### External Links
- **[CopilotKit Docs](https://docs.copilotkit.ai)** - AI framework documentation
- **[LangGraph Docs](https://langchain-ai.github.io/langgraph/)** - Agent orchestration
- **[OpenAI API](https://platform.openai.com/docs)** - LLM provider docs
- **[ElevenLabs](https://elevenlabs.io/docs)** - Voice synthesis docs

---

## Need More Help?

1. **Check logs**: Look at terminal output for error messages
2. **Browser console**: Open DevTools (F12) and check Console tab
3. **GitHub Issues**: [github.com/nitin27may/learnplay-ai/issues](https://github.com/nitin27may/learnplay-ai/issues)
4. **Documentation**: Browse [docs/](.) folder for detailed guides

---

**Happy learning!**
