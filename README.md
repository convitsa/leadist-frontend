# leadist-frontend

React frontend for [leadi.st](https://leadi.st).

## Stack

- Vite + React + TypeScript
- Tailwind CSS
- React Router v6
- Axios
- Zustand
- TanStack Query v5

## Setup

```bash
cp .env.example .env
npm install
npm run dev
```

Runs at `http://localhost:5173`. Set `VITE_API_URL` to your UserService (default `http://localhost:8000`).

Job status/logs proxy to OutboundService via Vite dev proxy at `/outbound` → `localhost:8001`.

## Build

```bash
npm run build
```
