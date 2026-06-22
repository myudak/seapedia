# SEAPEDIA

SEAPEDIA is a fullstack marketplace challenge project for Software Engineering Academy COMPFEST 18. It supports public browsing, public application reviews, role-aware authentication, seller tools, buyer checkout, discounts, driver delivery jobs, admin monitoring, overdue handling, and security documentation.

## Stack

- Next.js App Router with TypeScript
- Tailwind CSS
- Convex data model and functions
- Next Route Handlers for documented HTTP APIs
- Zod validation
- Vitest and Playwright tests

## Local Setup

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

For a real Convex deployment, configure `NEXT_PUBLIC_CONVEX_URL` and `CONVEX_DEPLOYMENT`, then run:

```bash
pnpm convex:dev
```

## Environment Variables

- `NEXT_PUBLIC_CONVEX_URL`: Convex client URL.
- `CONVEX_DEPLOYMENT`: Convex deployment name.
- `SESSION_SECRET`: random secret with at least 32 characters.

## Project Notes

The Git history is intentionally incremental. The assignment asks for step-by-step commits, so this repository keeps setup, features, tests, fixes, refactors, and docs as separate commits.
