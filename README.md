# Vera Health

A rebuilt version of the AI Healthcare Diagnosis System — React frontend, Express + SQLite backend, real authentication, and one connected account instead of scattered `localStorage` per page.

## What's here

```
server/   Express API + SQLite database (better-sqlite3), JWT auth
client/   React (Vite) + Tailwind v4 frontend
```

## Features

- **Real authentication** — bcrypt password hashing, JWT sessions (the old app had a hardcoded email/password object in client JS).
- **AI Health Assistant** — chat with text and voice input/output (Web Speech API), backed by a server-side proxy (Groq → OpenAI fallback chain), with automatic emergency-keyword detection and a safe offline demo mode if no API key is configured. No API key is ever exposed to the browser.
- **Prescription Analyzer** — upload an image, extract text with Tesseract.js OCR in the browser, save to your account.
- **Wellness tracker** — daily health tasks with a live adherence score.
- **Emergency SOS** — confirmation-gated activation, manage real contacts, one-tap `tel:` calling. Clearly labeled as simulated (no real SMS/call dispatch, since there's no telephony backend).
- **Dashboard** — pulls live data from every feature (tasks, prescriptions, contacts) into one "what needs your attention" view, instead of isolated pages.

## Running it locally

### 1. Backend

```bash
cd server
npm install
cp .env.example .env
# optionally add GROQ_KEY or OPENAI_KEY to .env for real AI replies —
# the chat feature works without one, using a clearly-labeled demo fallback
npm run start   # or: node index.js
```
Runs on `http://localhost:4000`.

### 2. Frontend

```bash
cd client
npm install
npm run dev
```
Runs on `http://localhost:5173` and proxies `/api` requests to the backend automatically (see `vite.config.js`).

Open `http://localhost:5173`, sign up with any email/password (min 6 characters), and you're in.

### Production build

```bash
cd client
npm run build   # outputs to client/dist — serve with any static host
```

## Security notes

- **The original project had a live Groq API key hardcoded in `diagnosis.html`.** If that code was ever pushed to a public repo, rotate that key in your Groq console — this rebuild does not use it and never sends provider keys to the browser.
- JWT secret, provider keys, and port are all read from `server/.env` (see `.env.example`). Don't commit `.env`.
- The SQLite file (`server/healthcare.db`) is created on first run and holds all user data — back it up or swap in Postgres/MySQL for anything beyond a demo.

## What's intentionally not built (given the time budget)

Per the "few hours, tight MVP" scope: appointment management, preventive-care engine, medication reminder scheduling/notifications, IoT device simulation, health analytics charts, women's health tracking, and multi-language support were left out. The architecture (shared DB, auth, dashboard aggregation pattern) is built to extend into those without a rewrite — each would follow the same pattern as `tasks` or `sos`: a table in `db.js`, a route file, a page.

## Not medical advice

This application, including its AI assistant, provides informational support only. It does not diagnose, treat, or replace consultation with a licensed healthcare professional.
