# Coding Agent Guidelines

This document provides guidance for AI coding assistants working in this repository.

## Project Overview

This is a **Next.js App Router** SSR application. Key facts:

- **Package manager**: Bun (`bun.lock` is the lockfile). Always use `bun install`, `bun run dev`, etc.
- **Framework**: Next.js App Router (file-based routing in `app/`)
- **Language**: TypeScript (strict mode — see `tsconfig.json`)
- **Styling**: Tailwind CSS v4 (configured via `@tailwindcss/postcss`)
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
app/                 # Next.js layouts, pages, metadata, and error boundaries
├── layout.tsx
├── page.tsx
├── search/page.tsx
├── booking/page.tsx
├── hotels/page.tsx
└── user/page.tsx
src/
├── components/
│   ├── aci/        # Application-specific business components
│   └── ui/         # Reusable UI primitives (shadcn/ui pattern)
├── hooks/          # Custom React hooks
├── lib/            # Utilities, server functions, data helpers
├── routes/         # Interactive full-page view components used by app/ routes
│   ├── index.tsx
│   ├── search.tsx
│   ├── booking.tsx
│   ├── hotels.tsx
│   └── user.tsx
└── styles.css      # Global Tailwind CSS
```
