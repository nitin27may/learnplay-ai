# Game Learning Platform 🎮

An educational games platform with AI-powered teaching capabilities. Built with Next.js, CopilotKit, and LangGraph.

## 🎯 Features

### Sudoku Game
- ✅ Full Sudoku implementation with puzzle generation
- ✅ Multiple difficulty levels (Easy, Medium, Hard, Expert)
- ✅ Interactive UI with smooth animations (Framer Motion)
- ✅ Keyboard shortcuts and number pad
- ✅ Undo/Redo functionality
- ✅ Hint system
- ✅ Timer and mistake tracking
- ✅ AI tutor integration

### AI Teaching System
- ✅ **Multi-LLM Support**: OpenAI, Azure OpenAI, Anthropic Claude, Ollama
- ✅ **Teaching Modes**: 
  - Play Mode: Independent play with on-demand help
  - Teach Mode: Proactive guidance after each move
  - Practice Mode: Targeted strategy practice
- ✅ **Strategy Teaching**: Naked singles, hidden singles, naked pairs, and more
- ✅ **Adaptive Learning**: AI adjusts to player skill level
- ✅ **Move Analysis**: Real-time feedback and explanations

### Coming Soon
- 🔜 Chess game with AI teaching
- 🔜 Voice mode (speech-to-text and text-to-speech)
- 🔜 Progress tracking and analytics
- 🔜 Practice scenarios

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Python 3.12+
- OpenAI API key (or other LLM provider)

### Installation

1. **Clone and install dependencies:**
```bash
cd gameleraning
npm install
```

2. **Configure LLM Provider:**

Edit `agent/.env` and add your API key:
```env
LLM_PROVIDER=openai
OPENAI_API_KEY=your-key-here
OPENAI_MODEL=gpt-4o-mini
```

For other providers, see [LLM Configuration](#llm-configuration) below.

3. **Start the development servers:**
```bash
npm run dev
```

This starts both:
- Frontend (Next.js): http://localhost:3000
- Agent (LangGraph): http://localhost:8123

4. **Open the app:**
Navigate to http://localhost:3000 and start playing!

## 🎮 How to Play Sudoku

1. Click any cell to select it
2. Use number pad or keyboard (1-9) to place numbers
3. Press Delete/Backspace to clear a cell
4. Use arrow keys to navigate
5. Click "Hint" if you need help
6. Chat with the AI tutor for strategy explanations!

## 🤖 LLM Configuration

### OpenAI (Default)
```env
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
```

### Azure OpenAI
```env
LLM_PROVIDER=azure-openai
AZURE_OPENAI_API_KEY=your-key
AZURE_OPENAI_ENDPOINT=https://your-endpoint.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT=gpt-4o
```

### Anthropic Claude
```env
LLM_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
```

### Ollama (Local)
```env
LLM_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1:8b
```

## 🏗️ Architecture

### Frontend (Next.js + React)
```
src/
├── app/
│   ├── page.tsx              # Home page with game selector
│   └── sudoku/
│       └── page.tsx          # Sudoku game with CopilotKit
├── components/
│   └── sudoku/
│       ├── SudokuGame.tsx    # Main game component
│       ├── SudokuBoard.tsx   # Game board
│       ├── SudokuCell.tsx    # Individual cells
│       ├── NumberPad.tsx     # Number input
│       └── GameControls.tsx  # Controls & stats
└── lib/
    └── sudoku/
        ├── types.ts          # TypeScript types
        ├── generator.ts      # Puzzle generation
        ├── solver.ts         # Solving algorithms
        └── hooks.ts          # Game logic hooks
```

### Backend (Python + LangGraph)
```
agent/
├── main.py               # Main agent entry point
├── llm_provider.py       # Multi-LLM abstraction
├── sudoku_tools.py       # Sudoku analysis tools
└── pyproject.toml        # Python dependencies
```

## 🛠️ Technology Stack

- **Frontend**: React 19, Next.js 16, TypeScript 5
- **UI/Animations**: Tailwind CSS 4, Framer Motion
- **AI Integration**: CopilotKit 1.51 (AG-UI protocol)
- **Agent Framework**: LangGraph 1.0, LangChain 1.2
- **LLM Providers**: OpenAI, Azure OpenAI, Anthropic, Ollama

## 📚 AI Teaching Strategies

The AI tutor teaches these Sudoku techniques:

### Beginner Level
- **Naked Single**: Only one number can go in a cell
- **Hidden Single**: A number can only go in one cell within a row/column/box

### Intermediate Level
- **Naked Pair**: Two cells with same two candidates
- **Pointing Pair**: Candidates pointing to eliminate others

### Advanced Level
- **X-Wing**: Advanced elimination pattern
- **Swordfish**: Complex pattern recognition
- **XY-Wing**: Chain-based technique

## 🧪 Development

### Run in debug mode:
```bash
npm run dev:debug
```

### Build for production:
```bash
npm run build
npm start
```

### Lint code:
```bash
npm run lint
```

## 📝 Scripts

- `npm run dev` - Start both frontend and agent
- `npm run dev:ui` - Start frontend only
- `npm run dev:agent` - Start agent only
- `npm run build` - Build for production
- `npm run lint` - Lint code

## 🎯 Roadmap

### Phase 1: Sudoku MVP ✅
- [x] Basic Sudoku game
- [x] LangGraph agent
- [x] CopilotKit integration
- [x] Multi-LLM support

### Phase 2: Enhanced Teaching 🚧
- [x] Teaching modes
- [x] Strategy analysis
- [ ] Generative UI for explanations
- [ ] Progress tracking

### Phase 3: Chess Implementation 📅
- [ ] Chess game engine
- [ ] Move validation
- [ ] AI opponent
- [ ] Chess teaching agent

### Phase 4: Advanced Features 📅
- [ ] Voice mode
- [ ] User accounts
- [ ] Leaderboards
- [ ] Mobile app

## 🤝 Contributing

This is a learning project! Contributions welcome.

## 📄 License

MIT

## 🙏 Acknowledgments

- CopilotKit for the amazing AI framework
- LangChain/LangGraph for agent orchestration
- The Sudoku and Chess communities for strategy documentation

---

Built with ❤️ using CopilotKit and LangGraph
