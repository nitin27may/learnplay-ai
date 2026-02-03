# Development Plan: LearnPlay.ai

**Project Status**: Sudoku MVP Complete | Security Hardening Required Before Public Launch

## 📋 Table of Contents

1. [Current Status](#current-status)
2. [Phase 7: Security Hardening (CRITICAL)](#phase-7-security-hardening-critical)
3. [Phase 8: Chess Academy](#phase-8-chess-academy)
4. [Phase 9: Platform Enhancements](#phase-9-platform-enhancements)
5. [Timeline Summary](#timeline-summary)

---

## Current Status

| Phase | Status | Description |
|-------|--------|-------------|
| Phases 1-6 | ✅ **COMPLETE** | Sudoku game with AI teaching system |
| Phase 7 | 🔴 **CRITICAL** | Security hardening (BLOCKER for public launch) |
| Phase 8 | 📋 **PLANNED** | Chess Academy implementation |
| Phase 9 | 📅 **FUTURE** | Platform enhancements |

### What's Working
- ✅ Sudoku game with 4 difficulty levels
- ✅ Multi-agent architecture (Router, Sudoku, Chess agents)
- ✅ Interactive AI tutor with step-by-step teaching
- ✅ Voice mode (ElevenLabs TTS)
- ✅ Multi-LLM support (OpenAI, Anthropic, Azure, Ollama)
- ✅ Visual highlights and interactive guidance

### What's Needed
- 🔴 Authentication system (Google SSO)
- 🔴 Rate limiting and cost controls
- 🔴 Input validation and sanitization
- 🔴 Prompt injection protection
- 🔴 Security headers and CORS

---

## Phase 7: Security Hardening (CRITICAL)

> ⚠️ **BLOCKER**: Application MUST NOT be deployed publicly until this phase is complete  
> 📖 **Full Guide**: [docs/SECURITY_AUDIT.md](docs/SECURITY_AUDIT.md)  
> ⏱️ **Timeline**: 2-3 weeks

### 7.1 Authentication & Authorization (Week 1)

#### Task 1: Google SSO Setup
- [ ] 1.1 Install NextAuth.js: `npm install next-auth @auth/core`
- [ ] 1.2 Create auth route at `src/app/api/auth/[...nextauth]/route.ts`
- [ ] 1.3 Configure Google OAuth provider
- [ ] 1.4 Add environment variables (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET)
- [ ] 1.5 Create sign-in page at `src/app/auth/signin/page.tsx`
- [ ] 1.6 Add user profile dropdown in navigation
- [ ] 1.7 Test complete authentication flow

#### Task 2: Route Protection
- [ ] 2.1 Create middleware at `src/middleware.ts`
- [ ] 2.2 Protect `/api/copilotkit/*` routes
- [ ] 2.3 Protect `/api/tts/*` routes
- [ ] 2.4 Add authentication checks to all API endpoints
- [ ] 2.5 Implement session validation
- [ ] 2.6 Test unauthorized access returns 401

#### Task 3: Session Management
- [ ] 3.1 Configure secure session storage (Redis or database)
- [ ] 3.2 Set HTTP-only and secure cookie flags
- [ ] 3.3 Implement 30-minute session timeout
- [ ] 3.4 Add refresh token mechanism
- [ ] 3.5 Implement logout functionality
- [ ] 3.6 Test session persistence across browser restarts

**Success Criteria:**
- ✅ Unauthenticated users cannot access API endpoints
- ✅ Users can sign in with Google
- ✅ Sessions persist correctly
- ✅ Logout works properly

---

### 7.2 Rate Limiting & Cost Controls (Week 1-2)

#### Task 4: Rate Limiting Infrastructure
- [ ] 4.1 Sign up for Upstash Redis (free tier)
- [ ] 4.2 Install dependencies: `npm install @upstash/ratelimit @upstash/redis`
- [ ] 4.3 Create `src/lib/rate-limit.ts`
- [ ] 4.4 Configure LLM rate limit (10 requests/minute per user)
- [ ] 4.5 Configure TTS rate limit (20 requests/minute per user)
- [ ] 4.6 Configure token rate limit (100k tokens/day per user)
- [ ] 4.7 Add Upstash environment variables

#### Task 5: API Rate Limiting
- [ ] 5.1 Update `/api/copilotkit/route.ts` with rate limiting
- [ ] 5.2 Update `/api/tts/route.ts` with rate limiting
- [ ] 5.3 Return 429 status with retry-after header
- [ ] 5.4 Add X-RateLimit-* headers to responses
- [ ] 5.5 Test rate limiting with rapid requests

#### Task 6: Usage Tracking
- [ ] 6.1 Create `src/lib/usage-tracker.ts`
- [ ] 6.2 Track LLM token usage per user/day
- [ ] 6.3 Track TTS requests per user/day
- [ ] 6.4 Implement daily usage limit enforcement
- [ ] 6.5 Create admin usage statistics dashboard
- [ ] 6.6 Set up alerts for high usage (email/Slack)

#### Task 7: Cost Protection
- [ ] 7.1 Set maximum tokens per LLM request (1000 tokens)
- [ ] 7.2 Set maximum TTS text length (500 characters)
- [ ] 7.3 Implement daily budget caps per user
- [ ] 7.4 Add cost estimation before API calls
- [ ] 7.5 Create emergency kill switch for runaway costs

**Success Criteria:**
- ✅ Rate limits enforced correctly
- ✅ 429 errors returned when limits exceeded
- ✅ Usage tracked and logged
- ✅ Alerts fire when thresholds exceeded

---

### 7.3 Input Validation & Sanitization (Week 2)

#### Task 8: Schema Validation
- [ ] 8.1 Install Zod: `npm install zod`
- [ ] 8.2 Create validation schemas for all API inputs
- [ ] 8.3 Add TTS text validation (1-500 characters)
- [ ] 8.4 Add Sudoku grid validation (9x9, values 1-9 or null)
- [ ] 8.5 Return 400 Bad Request for invalid inputs
- [ ] 8.6 Test with malformed requests

#### Task 9: TTS Endpoint Hardening
- [ ] 9.1 Validate text length (1-500 characters)
- [ ] 9.2 Sanitize text (remove special characters, emojis)
- [ ] 9.3 Implement content filter (no profanity/harmful content)
- [ ] 9.4 Add TTS-specific rate limiting
- [ ] 9.5 Log suspicious TTS requests
- [ ] 9.6 Test edge cases (empty, very long, special chars)

#### Task 10: Agent Input Validation
- [ ] 10.1 Add `validate_sudoku_grid()` in `agent/agents/sudoku/tools.py`
- [ ] 10.2 Validate all tool inputs before processing
- [ ] 10.3 Add error handling for malformed data
- [ ] 10.4 Return structured error responses
- [ ] 10.5 Test agent with invalid grids

**Success Criteria:**
- ✅ Invalid inputs rejected with clear errors
- ✅ TTS endpoint validates text properly
- ✅ Agent validates all grid data
- ✅ No crashes from malformed inputs

---

### 7.4 Prompt Injection Protection (Week 2)

#### Task 11: Prompt Firewall
- [ ] 11.1 Create `agent/prompt_security.py`
- [ ] 11.2 Implement injection pattern detection
- [ ] 11.3 Detect role manipulation attempts
- [ ] 11.4 Implement input length limits (< 2000 chars)
- [ ] 11.5 Add suspicious pattern logging
- [ ] 11.6 Test with known jailbreak techniques

#### Task 12: System Prompt Hardening
- [ ] 12.1 Add security rules to agent system prompts
- [ ] 12.2 Instruct agents to never reveal system prompts
- [ ] 12.3 Instruct agents to never output API keys
- [ ] 12.4 Limit agents to game-specific topics only
- [ ] 12.5 Add safe responses for manipulation attempts
- [ ] 12.6 Test prompt injection resistance

#### Task 13: Output Filtering
- [ ] 13.1 Create output filter for agent responses
- [ ] 13.2 Remove any API keys from responses
- [ ] 13.3 Remove system information from responses
- [ ] 13.4 Detect and block role manipulation in outputs
- [ ] 13.5 Log filtered responses for review
- [ ] 13.6 Test with adversarial prompts

**Success Criteria:**
- ✅ Agent rejects prompt injection attempts
- ✅ Agent never reveals system prompt
- ✅ Agent stays on topic
- ✅ No API keys in responses

---

### 7.5 Security Headers & CORS (Week 2-3)

#### Task 14: CORS Configuration
- [ ] 14.1 Update `next.config.ts` with CORS headers
- [ ] 14.2 Restrict Access-Control-Allow-Origin to production domain
- [ ] 14.3 Allow only POST and OPTIONS methods
- [ ] 14.4 Set CORS preflight caching
- [ ] 14.5 Test cross-origin requests

#### Task 15: Security Headers
- [ ] 15.1 Add Content-Security-Policy (CSP)
- [ ] 15.2 Add X-Frame-Options (DENY)
- [ ] 15.3 Add X-Content-Type-Options (nosniff)
- [ ] 15.4 Add Strict-Transport-Security (HSTS)
- [ ] 15.5 Add Referrer-Policy
- [ ] 15.6 Test headers with security scanner

**Success Criteria:**
- ✅ CORS properly restricted
- ✅ All security headers present
- ✅ No XSS vulnerabilities
- ✅ No clickjacking vulnerabilities

---

### 7.6 Error Handling & Logging (Week 3)

#### Task 16: Error Handling
- [ ] 16.1 Implement generic error messages for users
- [ ] 16.2 Log detailed errors server-side only
- [ ] 16.3 Add error tracking (Sentry)
- [ ] 16.4 Create error monitoring dashboard
- [ ] 16.5 Test error responses don't leak information

#### Task 17: Security Logging
- [ ] 17.1 Log all authentication attempts
- [ ] 17.2 Log rate limit violations
- [ ] 17.3 Log prompt injection attempts
- [ ] 17.4 Log suspicious patterns
- [ ] 17.5 Set up log aggregation (CloudWatch/DataDog)

**Success Criteria:**
- ✅ Errors handled gracefully
- ✅ No information leakage
- ✅ Security events logged
- ✅ Monitoring dashboard functional

---

### 7.7 Security Testing & Audit (Week 3)

#### Task 18: Security Testing
- [ ] 18.1 Run OWASP ZAP security scan
- [ ] 18.2 Test SQL injection (N/A - no SQL)
- [ ] 18.3 Test XSS attacks
- [ ] 18.4 Test CSRF attacks
- [ ] 18.5 Test rate limiting bypass attempts
- [ ] 18.6 Test prompt injection attacks

#### Task 19: Penetration Testing
- [ ] 19.1 Attempt authentication bypass
- [ ] 19.2 Attempt API key extraction
- [ ] 19.3 Attempt cost attack (runaway API usage)
- [ ] 19.4 Test session hijacking
- [ ] 19.5 Document all vulnerabilities found
- [ ] 19.6 Fix all critical/high vulnerabilities

#### Task 20: Final Audit
- [ ] 20.1 Review all security measures
- [ ] 20.2 Update documentation with security practices
- [ ] 20.3 Create incident response plan
- [ ] 20.4 Set up monitoring and alerts
- [ ] 20.5 Get security sign-off
- [ ] 20.6 Prepare for public launch

**Success Criteria:**
- ✅ No critical vulnerabilities
- ✅ No high-severity vulnerabilities
- ✅ All security measures tested
- ✅ Documentation complete

---

## Phase 8: Chess Academy

> 📋 **Status**: Planned  
> ⏱️ **Timeline**: 14 weeks  
> 📖 **Dependency**: Security hardening must be complete

### 8.1 Core Chess Game (4 weeks)

#### Task 21: Chess Project Setup
- [ ] 21.1 Create `src/app/chess/page.tsx`
- [ ] 21.2 Create `src/components/chess/` directory
- [ ] 21.3 Create `src/lib/chess/` for game logic
- [ ] 21.4 Install dependencies: `chess.js`, `react-chessboard`
- [ ] 21.5 Add Chess navigation link

#### Task 22: Chess Board & Pieces
- [ ] 22.1 Create `ChessBoard.tsx` component
- [ ] 22.2 Create `ChessSquare.tsx` component
- [ ] 22.3 Create `ChessPiece.tsx` component
- [ ] 22.4 Implement drag-and-drop movement
- [ ] 22.5 Implement click-to-move input
- [ ] 22.6 Add board orientation toggle

#### Task 23: Move Validation
- [ ] 23.1 Create `src/lib/chess/engine.ts`
- [ ] 23.2 Implement legal move highlighting
- [ ] 23.3 Add check detection with highlighting
- [ ] 23.4 Add checkmate/stalemate detection
- [ ] 23.5 Implement castling
- [ ] 23.6 Implement en passant
- [ ] 23.7 Implement pawn promotion

#### Task 24: Game State Management
- [ ] 24.1 Create `src/lib/chess/types.ts`
- [ ] 24.2 Create `ChessGame.tsx` container
- [ ] 24.3 Implement move history (PGN)
- [ ] 24.4 Create `MoveHistory.tsx` component
- [ ] 24.5 Add undo/redo functionality
- [ ] 24.6 Create `GameControls.tsx`

---

### 8.2 AI Opponent (2 weeks)

#### Task 25: Stockfish Integration
- [ ] 25.1 Create `src/lib/chess/stockfish.ts`
- [ ] 25.2 Integrate `stockfish.js` for browser
- [ ] 25.3 Install Python dependencies: `python-chess`, `stockfish`
- [ ] 25.4 Create `agent/agents/chess/engine.py`

#### Task 26: Difficulty Levels
- [ ] 26.1 Implement Beginner mode (depth 1-3)
- [ ] 26.2 Implement Intermediate mode (depth 5-8)
- [ ] 26.3 Implement Advanced mode (depth 10-15)
- [ ] 26.4 Implement Expert mode (depth 20+)
- [ ] 26.5 Add difficulty selector UI

#### Task 27: Position Evaluation
- [ ] 27.1 Create `EvaluationBar.tsx`
- [ ] 27.2 Implement real-time evaluation display
- [ ] 27.3 Add best move suggestions
- [ ] 27.4 Show principal variation (PV) line

---

### 8.3 Teaching System (4 weeks)

#### Task 28: Chess Teaching Agent
- [ ] 28.1 Create `analyze_chess_position()` tool
- [ ] 28.2 Create `get_opening_name()` tool
- [ ] 28.3 Create `explain_tactical_pattern()` tool
- [ ] 28.4 Create `suggest_chess_move()` tool
- [ ] 28.5 Create `validate_chess_move()` tool
- [ ] 28.6 Update Chess agent system prompt

#### Task 29: Frontend Teaching Tools
- [ ] 29.1 Create `startChessLesson()` frontend tool
- [ ] 29.2 Create `updateChessStep()` frontend tool
- [ ] 29.3 Create `highlightSquares()` frontend tool
- [ ] 29.4 Create `showBestMoves()` frontend tool
- [ ] 29.5 Create `loadPosition()` frontend tool
- [ ] 29.6 Create `endChessLesson()` frontend tool

#### Task 30: Visual Highlighting
- [ ] 30.1 Create `HighlightOverlay.tsx`
- [ ] 30.2 Implement square highlighting
- [ ] 30.3 Add arrow annotations
- [ ] 30.4 Add circle annotations
- [ ] 30.5 Show attacked/defended indicators
- [ ] 30.6 Animate move sequences

#### Task 31: "Learn Chess Basics" Lesson
- [ ] 31.1 Step 1: The Chessboard
- [ ] 31.2 Step 2: Pawn Movement
- [ ] 31.3 Step 3: Knight Movement
- [ ] 31.4 Step 4: Bishop Movement
- [ ] 31.5 Step 5: Rook Movement
- [ ] 31.6 Step 6: Queen Movement
- [ ] 31.7 Step 7: King Movement & Castling
- [ ] 31.8 Step 8: Check and Checkmate

#### Task 32: Tactical Puzzles
- [ ] 32.1 Create `agent/agents/chess/tactics.py`
- [ ] 32.2 Implement puzzle database
- [ ] 32.3 Create puzzle UI
- [ ] 32.4 Add solution validation
- [ ] 32.5 Track solve rate

---

### 8.4 Opening Theory (2 weeks)

#### Task 33: Opening Database
- [ ] 33.1 Create opening database file
- [ ] 33.2 Add ECO opening data
- [ ] 33.3 Implement opening name lookup
- [ ] 33.4 Create opening explorer UI

#### Task 34: Opening Lessons
- [ ] 34.1 Italian Opening (12 steps)
- [ ] 34.2 Sicilian Defense (10 steps)
- [ ] 34.3 Queen's Gambit (10 steps)
- [ ] 34.4 French Defense (8 steps)
- [ ] 34.5 Caro-Kann Defense (8 steps)

---

### 8.5 Polish & Testing (2 weeks)

#### Task 35: Game Features
- [ ] 35.1 PGN import functionality
- [ ] 35.2 PGN export functionality
- [ ] 35.3 Game review mode
- [ ] 35.4 Move annotations (!, ?, !!, ??)
- [ ] 35.5 Copy FEN/PGN to clipboard

#### Task 36: UI/UX Polish
- [ ] 36.1 Chess piece theme selector
- [ ] 36.2 Board color theme selector
- [ ] 36.3 Sound effects (move, capture, check)
- [ ] 36.4 Mobile responsiveness
- [ ] 36.5 Keyboard navigation

#### Task 37: Testing
- [ ] 37.1 E2E tests for chess game
- [ ] 37.2 Test teaching flow (basics lesson)
- [ ] 37.3 Test AI opponent (all difficulties)
- [ ] 37.4 Test puzzle solving
- [ ] 37.5 Performance testing

---

## Phase 9: Platform Enhancements

> 📅 **Status**: Future Planning  
> ⏱️ **Timeline**: TBD

### 9.1 User System

#### Task 38: User Accounts
- [ ] 38.1 User profile pages
- [ ] 38.2 Progress tracking across games
- [ ] 38.3 Achievement system
- [ ] 38.4 Leaderboards
- [ ] 38.5 Social features

### 9.2 Advanced Features

#### Task 39: Daily Challenges
- [ ] 39.1 Puzzle of the day (Sudoku)
- [ ] 39.2 Puzzle of the day (Chess)
- [ ] 39.3 Time-based challenges
- [ ] 39.4 Custom puzzle import
- [ ] 39.5 Multiplayer teaching mode

### 9.3 Analytics

#### Task 40: Learning Analytics
- [ ] 40.1 Learning analytics dashboard
- [ ] 40.2 Weakness identification
- [ ] 40.3 Personalized lesson recommendations
- [ ] 40.4 Spaced repetition system
- [ ] 40.5 Progress visualization

---

## Timeline Summary

| Phase | Description | Duration | Status | Priority |
|-------|-------------|----------|--------|----------|
| 1-6 | Sudoku MVP | Completed | ✅ Complete | - |
| **7** | **Security Hardening** | **2-3 weeks** | **🔴 IN PROGRESS** | **P0 - BLOCKER** |
| 7.1-7.3 | Auth + Rate Limiting + Validation | 2 weeks | 🔴 Critical | P0 |
| 7.4-7.5 | Prompt Protection + Headers | 1 week | 🟠 High | P1 |
| 7.6-7.7 | Logging + Testing | 3-4 days | 🟡 Medium | P2 |
| **8** | **Chess Academy** | **14 weeks** | **📋 Planned** | **Major Feature** |
| 8.1 | Chess Core Game | 4 weeks | 📋 Planned | - |
| 8.2 | AI Opponent | 2 weeks | 📋 Planned | - |
| 8.3 | Teaching System | 4 weeks | 📋 Planned | - |
| 8.4 | Opening Theory | 2 weeks | 📋 Planned | - |
| 8.5 | Polish & Testing | 2 weeks | 📋 Planned | - |
| **9** | **Platform Enhancements** | **TBD** | **📅 Future** | - |

---

## Next Steps

### Immediate (This Week)
1. **Start Task 1**: Implement Google SSO authentication
2. **Start Task 4**: Set up rate limiting infrastructure
3. **Complete Tasks 1-7**: Finish authentication and rate limiting

### This Month
1. Complete all Phase 7 security tasks (Tasks 1-20)
2. Conduct thorough security testing
3. Get security sign-off for public launch

### Next Quarter
1. Begin Phase 8: Chess Academy (Tasks 21-37)
2. Implement core chess game
3. Build chess teaching system

---

## Documentation

- **Architecture**: [docs/AGENT_ARCHITECTURE_RECOMMENDATIONS.md](docs/AGENT_ARCHITECTURE_RECOMMENDATIONS.md)
- **Security Guide**: [docs/SECURITY_AUDIT.md](docs/SECURITY_AUDIT.md)
- **Quick Start**: [docs/QUICKSTART.md](docs/QUICKSTART.md)
- **Setup Guide**: [docs/SETUP.md](docs/SETUP.md)
- **AI Teaching**: [docs/AI_TEACHING.md](docs/AI_TEACHING.md)

---

**Last Updated**: February 2, 2026  
**Current Focus**: Phase 7 - Security Hardening (Tasks 1-20)
