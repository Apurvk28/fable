# Fable — Imagine It. Automate It.

A developer-focused platform for creating, configuring, testing, and running autonomous AI agents with transparent execution inspection, deterministic tool sandboxes, and immutable audit logs.

---

## 1. Overview

Fable provides a complete environment where developers and creators can design purpose-built AI agents with tailored system instructions, model selections, temperature controls, and strictly allowlisted local tools. It features a transparent execution engine that surfaces internal model-tool interaction loops, tool invocation arguments, execution durations, token usage telemetry, and full execution history snapshots.

---

## 2. Implemented Features

- **Workshop Editorial Design System**: Editorial typography, paper color palettes, crisp hairline borders, responsive navigation, accessible modal dialogs, and smooth micro-interactions.
- **Session Authentication & Security**:
  - Secure, HttpOnly, SameSite session cookies for JWT management.
  - Per-session HMAC-SHA256 signed CSRF protection on all mutating HTTP requests.
  - Rate limiting on authentication routes (brute-force defense).
  - Explicit CORS origin allowlisting and credentialed cross-origin support.
  - Strict multi-tenant data isolation and ownership enforcement on all agents and execution records.
- **Agent Lifecycle & Configuration**:
  - Full CRUD operations: Create, read, update, delete, duplicate, and inspect agents.
  - Dynamic model catalog verification against provider endpoints.
  - AI-assisted prompt configuration: natural language agent blueprint generator.
- **Sandboxed Built-in Tool Registry**:
  - Deterministic tools: `calculator`, `text_processor`, `datetime`.
  - Strict input validation, zero external network side-effects, and timeout guards.
- **Autonomous Multi-Turn Execution Engine**:
  - ReAct model-tool loop: LLM reasoning -> Tool execution -> LLM synthesis.
  - Execution guards: hard limits on maximum loop iterations (turns) and per-step timeouts.
  - Two execution modes: Single-turn Task Execution and Multi-turn Interactive Chat.
  - Immutable execution snapshots: agents and their system configurations are frozen at execution time to preserve reproducible audit trails.
- **Execution History & Inspection**:
  - Searchable, filterable execution logs by status, agent, and mode.
  - Complete execution detail inspector displaying prompts, final outputs, structured tool traces, latency, and token metrics.
- **Production Readiness & Accessibility (Phase 9)**:
  - Route-level code splitting via `React.lazy()` and `Suspense` with an editorial loading fallback, keeping the initial JS bundle well under 250 KB gzip.
  - Screen reader accessibility: `aria-live="polite"` execution status announcements and complete keyboard focus trap & restoration for modals.
  - Respects `prefers-reduced-motion: reduce` across animations and transitions.
  - Deterministic offline test suite (`npm test`) decoupled from external AI providers.

---

## 3. Technology Stack & High-Level Architecture

Fable is architected as a modular monolith adhering to clean separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React + Vite)                  │
│       Workshop Editorial UI • SPA Router • Tailwind CSS     │
└──────────────────────────────▲──────────────────────────────┘
                               │ HTTPS / JSON / Cookies
┌──────────────────────────────▼──────────────────────────────┐
│                    Backend (Node.js + Express)              │
│ ┌────────────────┐ ┌──────────────────┐ ┌─────────────────┐ │
│ │ Auth & Security│ │ Agent Management │ │ Execution Engine│ │
│ │ JWT / CSRF     │ │ CRUD / Blueprint │ │ ReAct Loop      │ │
│ └────────────────┘ └──────────────────┘ └────────▲────────┘ │
└──────────────────────────────┬───────────────────┼──────────┘
                               │                   │
               ┌───────────────▼────────┐  ┌───────▼──────────┐
               │    MongoDB Database    │  │  AI Provider API │
               │ Agents, Users, Records │  │  (Groq Cloud SDK)│
               └────────────────────────┘  └──────────────────┘
```

### Component Roles

1. **Frontend (`frontend/`)**: React 18 single-page application built with Vite and Tailwind CSS. Manages user sessions, agent editing forms, AI configuration generators, the interactive playground, execution traces, and screen-reader accessibility.
2. **Backend (`backend/`)**: Modular Express REST API separating HTTP server lifecycle (`server.js`) from Express middleware setup (`src/app.js`). Handles authentication, input sanitization, rate-limiting, and error handling.
3. **Database (`MongoDB`)**: Persists users, hashed credentials, agents, and immutable execution records.
4. **AI Service (`Groq SDK`)**: Server-side LLM provider integration. Isolated on the backend; API keys are never exposed to the client or stored in the database.
5. **Tool Registry (`backend/src/tools/`)**: Sandboxed repository of deterministic tools with strict argument validation and execution limits.
6. **Execution Engine (`backend/src/services/agentRunner.js`)**: Orchestrates the multi-turn autonomous agent execution loop, coordinates LLM inference and tool dispatch, captures structured execution traces, and records immutable history snapshots.

---

## 4. Prerequisites

- **Node.js**: `v18.0.0` or higher (tested on Node v20+).
- **npm**: `v9.0.0` or higher.
- **MongoDB**: Local or hosted MongoDB instance `v6.0+` (e.g. `mongodb://127.0.0.1:27017/fable`).
- **Groq API Key (Optional for unit tests / Required for live AI execution)**: Obtain from [Groq Console](https://console.groq.com).

---

## 5. Local Installation & Development Setup

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd fable
```

### Step 2: Configure Environment Variables

#### Backend Configuration
Copy the provided backend environment template:
```bash
cp backend/.env.example backend/.env
```
Edit `backend/.env` with your local settings:
```env
PORT=5001
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://127.0.0.1:27017/fable
JWT_SECRET=replace_with_a_long_random_jwt_secret_at_least_32_chars
CSRF_SECRET=replace_with_a_long_random_csrf_secret_at_least_32_chars
GROQ_API_KEY=gsk_your_groq_api_key_here
COOKIE_CROSS_SITE=false
```

#### Frontend Configuration
Copy the frontend environment template:
```bash
cp frontend/.env.example frontend/.env
```
Default frontend configuration:
```env
VITE_API_URL=http://localhost:5001
```

### Step 3: Install Dependencies
```bash
# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### Step 4: Run the Development Servers
Open two terminal windows:

**Terminal 1 (Backend API):**
```bash
cd backend
npm run dev
```
Backend starts on `http://localhost:5001`. Verify via `curl http://localhost:5001/health`.

**Terminal 2 (Frontend Client):**
```bash
cd frontend
npm run dev
```
Frontend starts on `http://localhost:5173`.

---

## 6. Automated Testing

Fable implements a two-tier test strategy ensuring complete test isolation:

### Default Offline Unit Test Suite (Zero External Dependencies)
Runs self-contained, deterministic unit tests for built-in tools and timeout guards without connecting to external AI services or databases:
```bash
cd backend
npm test
```
*Coverage*: 46 tool execution assertions, tool error handling, division by zero, invalid dates, regex extraction, and tool timeout execution boundaries.

### Integration & End-to-End Test Suite (Requires MongoDB & Groq Key)
Runs integration suites testing live model consistency, execution engine loops, execution APIs, execution history filtering, and the complete 8-step end-to-end user journey:
```bash
cd backend
npm run test:integration
```

### All Tests
```bash
cd backend
npm run test:all
```

---

## 7. API Reference

All protected routes require an active HttpOnly session cookie. State-mutating routes (`POST`, `PATCH`, `DELETE`) require a valid HMAC-signed CSRF token provided via the `x-csrf-token` header.

### Health Check
- `GET /health` — Returns server health status, environment, and timestamp.

### Authentication (`/api/v1/auth`)
- `GET /csrf-token` — Issues a fresh CSRF token and sets the CSRF cookie.
- `POST /register` — Register a new account (`username`, `email`, `password`).
- `POST /login` — Log in and receive HttpOnly session cookie.
- `POST /logout` — Invalidate session and clear authentication cookies.
- `GET /me` — Retrieve currently authenticated user profile.

### Agents (`/api/v1/agents`)
- `GET /` — List all agents owned by the authenticated user.
- `GET /models` — Retrieve available and verified LLM models.
- `GET /:id` — Get agent details by ID.
- `POST /` — Create a new agent (`name`, `description`, `systemPrompt`, `model`, `temperature`, `tools`).
- `PATCH /:id` — Update an existing agent configuration.
- `DELETE /:id` — Delete an agent.
- `POST /:id/duplicate` — Duplicate an agent configuration.
- `POST /generate-config` — AI-assisted configuration generator from natural language prompts.
- `POST /:id/run` — Execute a standalone task using the agent.
- `POST /:id/chat` — Send a message in an interactive chat session with conversation history.
- `GET /:id/executions` — List recent executions for a specific agent.

### Execution History (`/api/v1/executions`)
- `GET /` — List execution history with pagination (`page`, `limit`), filtering (`status`, `agentId`), and search (`query`).
- `GET /:id` — Retrieve full execution record by ID including frozen agent snapshot and tool traces.

---

## 8. Built-in Tools & Safety Boundaries

Fable provides three sandboxed, deterministic tools:

1. **`calculator`**:
   - Evaluates arithmetic and mathematical expressions (`+`, `-`, `*`, `/`, `%`, `^`, parentheses).
   - *Safety Boundary*: Sanitizes inputs strictly against allowed characters, guards against division by zero, evaluates safely without using `eval()`.
2. **`text_processor`**:
   - Operations: `count_words`, `count_characters`, `extract_keywords`, `summarize_simple`.
   - *Safety Boundary*: CPU-bounded string processing with length limits; no disk, shell, or network access.
3. **`datetime`**:
   - Operations: `current_time`, `date_diff`, `format_date`.
   - *Safety Boundary*: UTC-normalized, validates ISO date formats, rejects malformed inputs.

---

## 9. Security Architecture

- **Session Security**: Authentication tokens are stored exclusively in `HttpOnly`, `SameSite` cookies with configurable cross-site security (`COOKIE_CROSS_SITE`), preventing XSS token theft.
- **CSRF Defense**: Double-submit HMAC-SHA256 tokens validated on all state-changing endpoints (`POST`, `PATCH`, `DELETE`).
- **Authorization & Multi-Tenancy**: Every database lookup for agents and executions enforces ownership scoping (`user: req.user._id`), preventing IDOR and horizontal privilege escalation.
- **Provider Key Isolation**: Groq API keys reside exclusively in backend server memory. The client never receives or stores provider credentials.
- **Execution Limits**: ReAct execution engine imposes strict upper bounds on turns (max 5 iterations) and timeouts per step (10 seconds) to prevent infinite loops and runaway costs.

---

## 10. Frontend Build & Performance Verification

To verify production bundle build and chunk distribution:
```bash
cd frontend
npm run build
```
Production build highlights:
- **Route-level code splitting**: Major route components (`LandingPage`, `AgentList`, `AgentPlayground`, `ExecutionsList`, `ExecutionDetail`, `Login`, `Register`) are loaded lazily on demand.
- **Compressed main bundle**: Initial entry bundle is **~226 kB** uncompressed and **~71 kB gzip**, well below the PRD target of 250 kB gzip.
- **Zero Vite chunk warnings**: No chunk exceeds the 500 kB budget.

---

## 11. Deployment Readiness & Operator Considerations

> **NOTE:** Fable is fully prepared and verified for production deployment, but is currently kept undeployed in local development mode.

When deploying to a production host (e.g. Render, Railway, Vercel, AWS):
1. **Environment Variables**: Configure all required environment variables in the host dashboard with production secrets (never commit `.env`).
2. **Cookie Domain & SameSite**:
   - If hosting frontend and backend on the same top-level domain (e.g., `app.example.com` and `api.example.com`), configure `COOKIE_CROSS_SITE=false` and `SameSite=Lax`.
   - If hosting on different domains (e.g., frontend on Vercel and backend on Render), set `COOKIE_CROSS_SITE=true` (`SameSite=None`, `Secure=true`).
3. **Database**: Provide a high-availability MongoDB connection string (`MONGODB_URI`).
4. **CORS Allowlist**: Set `CLIENT_URL` to the exact production frontend origin.
5. **Process Management**: Backend exposes `npm start` (`node server.js`) and a health check route at `GET /health` for container orchestration and uptime monitoring.

---

## 12. License

MIT License. Designed and crafted as a portfolio-ready demonstration of GenAI agent architecture and full-stack engineering.
