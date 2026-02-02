# LearnPlay.ai - Setup & Usage Guide

## Quick Setup

### 1. Install Dependencies
```bash
npm install
```

The postinstall script will automatically set up the Python agent environment.

### 2. Configure Your API Key

Open `agent/.env` and add your OpenAI API key (already configured):
```env
LLM_PROVIDER=openai
OPENAI_API_KEY=your-actual-key-here
OPENAI_MODEL=gpt-4o-mini
```

### 3. Configure Voice (Optional)

For natural voice explanations during teaching, add ElevenLabs credentials:
```env
ELEVENLABS_API_KEY=your-elevenlabs-api-key
ELEVENLABS_VOICE_ID=JBFqnCBsd6RMkjVDRZzb  # Optional, defaults to "George"
```

> **Note**: Get a free API key at [elevenlabs.io](https://elevenlabs.io). If not configured, the app falls back to browser TTS.

### 4. Start Development
```bash
npm run dev
```

This command starts:
- **Frontend** at http://localhost:3000
- **Agent** at http://localhost:8123

## Using the Sudoku Game

### Basic Gameplay

1. **Navigate to Sudoku**: 
   - Open http://localhost:3000
   - Click on the Sudoku card

2. **Playing the Game**:
   - Click any empty cell to select it
   - Use the number pad on screen OR press 1-9 on keyboard
   - Press Delete/Backspace to clear a cell
   - Use arrow keys to move between cells

3. **Game Features**:
   - **Hint**: Reveals one correct number
   - **Undo/Redo**: Navigate through your moves
   - **Reset**: Start the current puzzle over
   - **New Game**: Generate a new puzzle with selected difficulty

### AI Tutor Integration

#### Opening the AI Chat
Click the chat icon in the bottom-right corner to open the AI tutor sidebar.

#### Teaching Modes

**Play Mode** (Default)
- Play independently
- Ask questions when you need help
- AI responds only when you initiate

**Teach Mode**
- AI actively observes your moves
- Provides guidance and explanations proactively
- Best for learning new strategies

**Practice Mode**
- AI can set up specific scenarios
- Focus on particular techniques
- Guided practice with feedback

#### Example Prompts

**Learning Strategies:**
```
"Explain the naked single technique"
"What are the basic Sudoku strategies I should know?"
"Teach me about hidden singles"
```

**Getting Help:**
```
"Can you give me a hint?"
"What's the next best move?"
"Analyze my current puzzle"
```

**Move Analysis:**
```
"Was my last move correct?"
"What strategy should I use here?"
"Why doesn't this number work?"
```

**Changing Modes:**
```
"Switch to teach mode"
"I want to practice naked pairs"
"Put me in play mode"
```

## Advanced Features

### Multi-LLM Support

You can switch between different AI providers by editing `agent/.env`:

**Use Azure OpenAI:**
```env
LLM_PROVIDER=azure-openai
AZURE_OPENAI_API_KEY=your-key
AZURE_OPENAI_ENDPOINT=https://your-endpoint.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT=gpt-4o
```

**Use Anthropic Claude:**
```env
LLM_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-your-key
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
```

**Use Ollama (Local):**
```env
LLM_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1:8b
```

After changing providers, restart the dev server:
```bash
# Stop with Ctrl+C, then:
npm run dev
```

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| 1-9 | Place number |
| Delete/Backspace | Clear cell |
| Arrow Keys | Navigate cells |
| Cmd/Ctrl + Z | Undo |
| Cmd/Ctrl + Shift + Z | Redo |

## Troubleshooting

### Agent Won't Start

**Error: "no such file or directory, open '.env'"**
- Make sure `agent/.env` exists with your API key

**Error: "Invalid API key"**
- Check that your OpenAI API key is correct in `agent/.env`
- Ensure the key starts with `sk-proj-` or `sk-`

### Frontend Issues

**Page won't load:**
```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

**Type errors:**
```bash
# Regenerate types
npm run build
```

### Python Dependencies

**If agent dependencies fail to install:**
```bash
cd agent
python3 -m pip install -e .
cd ..
npm run dev:agent
```

## Development Tips

### Running Separately

**Frontend only:**
```bash
npm run dev:ui
```

**Agent only:**
```bash
npm run dev:agent
```

### Debug Mode

For more detailed logs:
```bash
npm run dev:debug
```

### Testing Changes

1. Make changes to files
2. Both frontend and agent auto-reload
3. Refresh browser if needed
4. Check console for errors

## What's Implemented

**Complete Features:**
- Full Sudoku game with 4 difficulty levels
- Multi-LLM support (OpenAI, Azure, Anthropic, Ollama)
- Teaching modes (Play, Teach, Practice)
- Strategy analysis tools
- CopilotKit integration
- Keyboard shortcuts
- Undo/Redo
- Hints
- Timer and stats
- Voice mode (ElevenLabs TTS)

**In Progress:**
- More advanced Sudoku techniques
- Progress tracking

**Planned:**
- Chess game
- User accounts
- Leaderboards
- Mobile app

## Next Steps

1. **Play and Learn**: Try different difficulty levels
2. **Experiment with AI**: Test different teaching modes
3. **Try Different Models**: Switch between LLM providers
4. **Customize**: Modify the code to add your own features
5. **Build Chess**: Follow the same pattern to add chess game

## Need Help?

- Check the main [README.md](README.md) for architecture details
- Review code comments for implementation details
- Open the browser console for debugging
- Check agent logs in the terminal

Happy coding!
