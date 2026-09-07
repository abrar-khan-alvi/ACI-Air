# ACI Avionics — B2B Travel Portal

A B2B travel booking portal for flights and hotels, built with Next.js App Router, TypeScript, React, and Tailwind CSS.

## Tech Stack

- [Next.js](https://nextjs.org) — App Router, server rendering, and route architecture
- [React 19](https://react.dev)
- [TypeScript](https://www.typescriptlang.org)
- [Tailwind CSS v4](https://tailwindcss.com)
- [Radix UI](https://www.radix-ui.com) — accessible UI primitives (shadcn/ui pattern)
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

The development server starts at **http://localhost:3000**.

## Available Scripts

| Command             | Description                  |
| ------------------- | ---------------------------- |
| `bun run dev`       | Start the development server |
| `bun run build`     | Build for production         |
| `bun run start`     | Start the production build   |
| `bun run test`      | Run the Vitest suite         |
| `bun run typecheck` | Run TypeScript checks        |
| `bun run lint`      | Run ESLint                   |
| `bun run format`    | Format code with Prettier    |

Passport OCR runs locally in the browser; passport images are not uploaded by the application.

## Demo authentication

Use the built-in partner account to preview the protected dashboard:

- Email: `test@mail.com`
- Password: `123456`

For deployed environments, set `AUTH_SECRET`, `DEMO_AUTH_EMAIL`, and
`DEMO_AUTH_PASSWORD`. The demo session is stored in a signed, HTTP-only cookie and
expires after eight hours.
