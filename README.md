# ACI Avionics — B2B Travel Portal

A B2B travel booking portal for flights and hotels, built with TanStack Start (SSR), TypeScript, React, and Tailwind CSS.

## Tech Stack

- [TanStack Start](https://tanstack.com/start) — SSR framework
- [TanStack Router](https://tanstack.com/router) — type-safe file-based routing
- [TanStack Query](https://tanstack.com/query) — data fetching and caching
- [React 19](https://react.dev)
- [TypeScript](https://www.typescriptlang.org)
- [Tailwind CSS v4](https://tailwindcss.com)
- [Radix UI](https://www.radix-ui.com) — accessible UI primitives (shadcn/ui pattern)
- [Vite](https://vite.dev) — build tool
- [Bun](https://bun.sh) — package manager

## Development

Requires [Bun](https://bun.sh). Install it first if you haven't:

```sh
curl -fsSL https://bun.sh/install | bash
```

Then:

```sh
git clone <this-repository-url>
cd <repository-name>
bun install
bun run dev
```

The development server starts at **http://localhost:8080**.

## Available Scripts

| Command           | Description                  |
| ----------------- | ---------------------------- |
| `bun run dev`     | Start the development server |
| `bun run build`   | Build for production         |
| `bun run preview` | Preview the production build |
| `bun run lint`    | Run ESLint                   |
| `bun run format`  | Format code with Prettier    |

## Environment Variables

| Variable     | Required | Description                                                                  |
| ------------ | -------- | ---------------------------------------------------------------------------- |
| `AI_API_KEY` | Optional | API key for the AI-powered passport OCR scanning feature in the booking flow |

Create a `.env` file at the project root to set these locally:

```sh
AI_API_KEY=your_key_here
```
