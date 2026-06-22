# Convex Data Model

SEAPEDIA stores marketplace data in Convex. The Next.js route handlers form the HTTP API layer, while Convex is the source-of-truth database contract for users, sessions, stores, products, carts, orders, discounts, delivery jobs, reviews, and admin time simulation.

For local demos without a linked Convex deployment, the app uses seeded demo data through the same domain services. A real deployment should run `pnpm convex dev` and configure the variables from `.env.example`.
