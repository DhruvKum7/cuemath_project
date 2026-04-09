# ∑ MathAI — Doubt Solver

<div align="center">

![MathAI Banner](https://img.shields.io/badge/MathAI-Doubt%20Solver-6358ff?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0id2hpdGUiIGQ9Ik03IDVoMnYySDd6bTAgNGgydjJIN3ptMCA0aDJ2Mkg3em00LThoMnYyaC0yem0wIDRoMnYyaC0yem0wIDRoMnYyaC0yem00LThoMnYyaC0yem0wIDRoMnYyaC0yem0wIDRoMnYyaC0yeiIvPjwvc3ZnPg==)

**AI-powered step-by-step math doubt solver for students (Grades 6–12)**

[![Node.js](https://img.shields.io/badge/Node.js-18+-68a063?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![Claude API](https://img.shields.io/badge/Claude-API-9d94ff?style=flat-square)](https://console.anthropic.com)
[![Express](https://img.shields.io/badge/Express-4.x-lightgrey?style=flat-square&logo=express)](https://expressjs.com)
[![License](https://img.shields.io/badge/License-MIT-00ff88?style=flat-square)](LICENSE)
[![Made for](https://img.shields.io/badge/Made%20for-EdTech-ffb800?style=flat-square)](https://cuemath.com)

<br/>

[🚀 Live Demo](https://your-demo-link.netlify.app) &nbsp;·&nbsp; [📖 3D README](https://your-readme-link.netlify.app) &nbsp;·&nbsp; [🐛 Report Bug](https://github.com/yourusername/mathai-doubt-solver/issues)

</div>

---

## 📸 Preview

```
┌─────────────────────────────────────────────────────┐
│  ∑  MathAI — Doubt Solver              0 solved     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌─ Your doubt ──────────────────────────────────┐  │
│  │  Solve 2x² + 5x - 3 = 0                      │  │
│  │                                               │  │
│  │  [Algebra] [Calculus] [Geometry]   [Solve →] │  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
│  ┌─ Solution ─────────────────────────────────── ┐  │
│  │  ① Identify the equation                      │  │
│  │     This is a quadratic: ax²+bx+c=0           │  │
│  │     2x² + 5x - 3 = 0                          │  │
│  │                                               │  │
│  │  ② Apply the quadratic formula                │  │
│  │     x = (-b ± √(b²-4ac)) / 2a                │  │
│  │                                               │  │
│  │  ✓ Final Answer:  x = 0.5  or  x = -3        │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

---

## ✨ What it does

| Feature | Description |
|---|---|
| 🧮 **Step-by-step solver** | Type any math problem — algebra, calculus, geometry — get a structured solution |
| 🤖 **Claude AI powered** | Uses Anthropic's Claude API to explain *why*, not just give answers |
| 📊 **Progress tracking** | Tracks topics solved, shows weak areas, keeps doubt history |
| 🔒 **Secure by design** | API key lives on server only — never exposed in the browser |
| ⚡ **Instant feedback** | Animated loading states, disabled buttons, smooth UX throughout |

---

## 🛠 Tech Stack

```
Frontend        →  Vanilla HTML + CSS + JS  (zero dependencies)
Backend         →  Node.js + Express        (proxy server)
AI              →  Anthropic Claude API     (claude-3-5-haiku)
Styling         →  Custom CSS variables     (dark theme)
Deployment      →  Netlify / Railway        (one-click)
```

---

## ⚙️ Setup — Step by Step

### Prerequisites
- **Node.js 18+** — [download here](https://nodejs.org)
- **Anthropic API Key** — [get one here](https://console.anthropic.com) (free tier available)
- **Git** — [download here](https://git-scm.com)

Check you have them:
```bash
node -v    # should print v18.x.x or higher
npm -v     # should print 9.x.x or higher
```

---

### Step 1 — Clone the repo

```bash
git clone https://github.com/yourusername/mathai-doubt-solver
cd mathai-doubt-solver
```

---

### Step 2 — Set up your API key

```bash
# Copy the template
cp .env.example .env
```

Open `.env` and add your key:

```env
ANTHROPIC_API_KEY=sk-ant-your-key-here
PORT=5000
```

> ⚠️ **Never commit `.env` to Git.** It's already in `.gitignore` — keep it that way.

---

### Step 3 — Install dependencies

```bash
npm install
```

This installs: `express`, `@anthropic-ai/sdk`, `dotenv`, `nodemon` (dev only).

---

### Step 4 — Start the server

```bash
# Production
npm start

# Development (auto-reloads on file changes)
npm run dev
```

---

### Step 5 — Open in browser

```
http://localhost:5000
```

You should see:

```
✓  MathAI server running on http://localhost:5000
✓  Anthropic API key loaded
✓  Static files served from /public
```

---

## 📁 Project Structure

```
mathai-doubt-solver/
 ├── server.js          ← Express server + API proxy (start here)
 ├── .env               ← Your API key (NEVER commit this)
 ├── .env.example       ← Safe template for collaborators
 ├── .gitignore         ← Excludes .env and node_modules
 ├── package.json
 ├── public/
 │    └── index.html    ← Frontend UI (served by Express)
 └── node_modules/      ← Auto-generated, don't touch
```

---

## 🧱 How it works

```
Browser (index.html)
      │
      │  POST /api/solve  { question, topic }
      ▼
Express Server (server.js)
      │
      │  calls Anthropic API with your key (server-side only)
      ▼
Claude AI
      │
      │  returns JSON { steps[], answer, tip }
      ▼
Express Server
      │
      │  forwards response to browser
      ▼
Browser renders step-by-step solution
```

> The browser **never** touches the Anthropic API directly. All calls are proxied through the server. This keeps your API key safe.

---

## 🪲 Difficulties I faced — and how I solved them

### 🚫 Problem 1: `Failed to fetch` — CORS blocked browser API calls
The Anthropic API rejects direct calls from browsers. I kept hitting CORS errors no matter what headers I added.

**Fix:** Built a Node.js/Express proxy. The browser calls `/api/solve` on localhost, the server calls Anthropic server-side where CORS doesn't apply.

---

### 🔑 Problem 2: API key exposed in frontend
My first version had the key hardcoded in `index.html`. Anyone could open DevTools → Network tab and see it — instantly draining API credits.

**Fix:** Moved the key to `.env`, added `.env` to `.gitignore`, and routed all API calls through `server.js`. The key never leaves the server.

---

### 🧩 Problem 3: Claude returning JSON wrapped in markdown fences
Even with a strict system prompt saying "return only JSON", Claude sometimes replied with ` ```json ... ``` ` — which broke `JSON.parse()` and crashed the app.

**Fix:**
```js
const clean = raw.replace(/```json|```/g, '').trim();
const parsed = JSON.parse(clean);
```
Also rewrote the system prompt to be more explicit: *"No markdown. No backticks. Raw JSON only."*

---

### ⚡ Problem 4: UI looked frozen during API call
The API takes 2–3 seconds to respond. With no loading state, the button looked broken and users clicked it multiple times — sending duplicate requests.

**Fix:** Added animated loading dots, disabled the Solve button during fetch, and cleared the solution area immediately so users knew something was happening.

---

## 🔐 Security Checklist

```
✗  Never hardcode ANTHROPIC_API_KEY in any frontend file
✗  Never commit .env to Git
✓  All API calls go through server.js — browser never calls Anthropic
✓  Use .env.example with dummy values for collaborators
✓  .gitignore excludes .env and node_modules by default
```

---

## 🚀 Deploy to Netlify (free)

This project needs a server, so use [Railway](https://railway.app) or [Render](https://render.com) for full deployment:

```bash
# Railway (recommended — free tier)
railway login
railway init
railway up
```

Set `ANTHROPIC_API_KEY` in Railway's environment variables dashboard.

---

## 📄 License

MIT — use it, fork it, build on it.

---

<div align="center">

**Built for learning. Shipped for real.**

`// mathai · anthropic claude api · mit license`

</div>
