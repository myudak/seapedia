# Convex Data Model

SEAPEDIA stores marketplace data in Convex. The Next.js route handlers form the HTTP API layer, while Convex is the source-of-truth database contract for users, sessions, stores, products, carts, orders, discounts, delivery jobs, reviews, and admin time simulation.

For persistent local development, run `pnpm dev:local`. Convex stores backend state in `.convex`, generates `convex/_generated`, and serves the API locally while the command remains running. Without Convex environment variables, the app falls back to its in-memory domain services.
