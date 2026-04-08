# MathAI — Doubt Solver

Quick local setup and notes

Prerequisites:

- Node.js (18+ recommended)

Setup:

1. Copy `.env.example` to `.env` and set `ANTHROPIC_API_KEY`.
2. Install dependencies:

```bash
npm install
```

3. Start the server:

```bash
npm start
# or for development with auto-reload
npm run dev
```

Open http://localhost:5000 in your browser.

Security:

- Do NOT store API keys in frontend files. Use the `.env` + server proxy instead.
