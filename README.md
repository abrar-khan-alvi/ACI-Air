# B2B ACI Avionics Frontend

ACI Air's booking front end — flights, hotels, partner portal and admin console.

## Development

Requires Node.js 20+ and [Bun](https://bun.sh) (npm also works).

```sh
bun install
bun run dev
```

The app runs on [http://localhost:3000](http://localhost:3000).

## Scripts

| Script | Purpose |
| --- | --- |
| `bun run dev` | Start the dev server |
| `bun run build` | Production build |
| `bun run start` | Serve the production build |
| `bun run lint` | ESLint |
| `bun run typecheck` | `tsc --noEmit` |
| `bun run format` | Prettier |

## Environment

| Variable | Used by |
| --- | --- |
| `LOVABLE_API_KEY` | Passport scanning server action (`src/lib/passport.actions.ts`). Without it, travellers enter details manually. |

Set it in `.env.local` for local development.

## Structure

```
app/                  App Router routes; each page.tsx exports metadata and
                      renders a client component alongside it
  layout.tsx          Root layout, fonts, providers
  globals.css         Tailwind v4 theme and design tokens
src/components/ui/    shadcn/ui primitives
src/components/aci/   Product components
src/lib/              Domain logic, search-param codecs, server actions
```

Routes: `/`, `/user`, `/search`, `/hotels`, `/booking`, `/admin`,
`/partner/login`, `/partner/signup`, `/partner/dashboard`.

Search state lives in the URL. `src/lib/search-params.ts` and `src/lib/hotels.ts`
parse and validate it; `src/lib/navigation.ts` builds the URLs.

## Built with

- Next.js (App Router) + React
- TypeScript
- Tailwind CSS v4 + shadcn/ui
- TanStack Query
