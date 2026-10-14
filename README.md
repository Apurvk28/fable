# Fable — Imagine It. Automate It.

A developer-focused platform for creating, configuring, testing, and running individual AI agents with transparent execution inspection.

## Architecture

Fable is organized as a maintainable modular monolith:

- `frontend/`: React + Vite + Tailwind CSS v3 single-page application using the **Workshop Editorial** design system.
- `backend/`: Node.js + Express REST API with strict `server.js` (root HTTP entrypoint) and `src/app.js` (Express configuration) separation.
- `docs/`: Product Requirements Document (`FABLE_PRD.md`) and Implementation Plan (`implementation-plan.md`).

## Current Status: Phase 1 (Foundation & Design System)

- **Backend:** Express API initialized with credentialed CORS, explicit origin allowlist, custom header protection, and health check route (`GET /health`).
- **Frontend:** Vite + React initialized with Tailwind CSS v3, Workshop Editorial design tokens (paper palette, editorial typography, crisp hairline borders), and reusable UI primitives (`Button`, `Input`, `Card`, `Badge`, `Modal`, `Alert`).
- **Connectivity:** End-to-end communication verified between Vite dev server and Express backend via native `fetch` with credentials.
