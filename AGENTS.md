# Coding Agent Guidelines

This document provides guidance for AI coding assistants working in this repository.

## Project Overview

This is a **TanStack Start** SSR application (not Next.js). Key facts:

- **Package manager**: Bun (`bun.lock` is the lockfile). Always use `bun install`, `bun run dev`, etc.
- **Framework**: TanStack Start + TanStack Router (file-based routing in `src/routes/`)
- **Language**: TypeScript (strict mode — see `tsconfig.json`)
- **Styling**: Tailwind CSS v4 (configured via `@tailwindcss/vite` plugin)
- **UI library**: Radix UI primitives wrapped in shadcn/ui-style components (`src/components/ui/`)
- **Business components**: `src/components/aci/` — do not rename or restructure these without strong reason

## Git Rules

- Do **not** force-push, rebase, amend, or squash commits that are already pushed — this rewrites history.
- Keep the main branch in a working state at all times.

## Coding Rules

- Do not change business logic, UI layout, or component structure without explicit instruction.
- Do not upgrade dependencies without explicit instruction.
- Do not rename files or symbols without explicit instruction.
- Prefer fixing import errors and type errors over restructuring code.
- Always run `bun x tsc --noEmit` after TypeScript changes to verify no new type errors.

## Project Structure

```
src/
├── components/
│   ├── aci/        # Application-specific business components
│   └── ui/         # Reusable UI primitives (shadcn/ui pattern)
├── hooks/          # Custom React hooks
├── lib/            # Utilities, server functions, data helpers
├── routes/         # TanStack Router file-based routes
│   ├── __root.tsx  # Root layout, error boundary, metadata
│   ├── index.tsx   # Homepage
│   ├── search.tsx  # Flight search results
│   ├── booking.tsx # Flight booking flow
│   ├── hotels.tsx  # Hotel search and results
│   └── user.tsx    # User profile
├── router.tsx      # TanStack Router + QueryClient setup
├── server.ts       # SSR server entry (wraps TanStack Start server)
├── start.ts        # TanStack Start instance + middleware
└── styles.css      # Global Tailwind CSS
```
