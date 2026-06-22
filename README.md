# SEAPEDIA

SEAPEDIA is a fullstack marketplace challenge project for Software Engineering Academy COMPFEST 18. It supports guest browsing, public application reviews, role-aware authentication, seller product management, buyer wallet/cart/checkout, discounts, delivery jobs, admin monitoring, overdue refund/return, and baseline security hardening.

## Stack

- Next.js App Router, TypeScript, Tailwind CSS
- Convex schema/database contract
- Next Route Handlers for `/api/*`
- Zod validation, bcrypt password hashing, httpOnly session cookies
- Vitest unit tests and Playwright smoke tests

## Local Setup

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Optional Convex local workflow:

```bash
pnpm convex:dev
```

## Environment Variables

- `NEXT_PUBLIC_CONVEX_URL`: Convex client URL.
- `CONVEX_DEPLOYMENT`: Convex deployment name.
- `SESSION_SECRET`: random secret with at least 32 characters.

## Demo Accounts

All demo passwords are `seapedia123`.

| Username | Roles | Purpose |
| --- | --- | --- |
| `admin` | Admin | Monitoring, discounts, time simulation, overdue handling |
| `maya` | Buyer, Seller, Driver | Multi-role active-role selection demo |
| `seller` | Seller | Store, products, incoming orders |
| `buyer` | Buyer | Wallet, cart, checkout, order history |
| `driver` | Driver | Find jobs, take jobs, complete delivery |

## Business Rules

- Active role controls authorization. A multi-role user must choose the current role before private actions.
- Single-store checkout: a cart may contain products from only one store.
- Delivery methods: Instant `Rp20.000`, Next Day `Rp12.000`, Regular `Rp8.000`.
- PPN is 12% of subtotal after discount.
- Discount rule: checkout accepts one code, either Voucher or Promo. Voucher is percentage-based with expiry and remaining usage. Promo is amount-based with expiry.
- Driver earning is 80% of delivery fee after completion.
- Overdue SLA: Instant same day, Next Day one day, Regular three days. Admin can simulate time and run auto return/refund.

## Security Notes

- Passwords are hashed with bcrypt.
- Sessions use httpOnly cookies and server-side session records.
- API handlers validate inputs with Zod.
- Public user-generated comments are normalized and HTML-escaped before storage.
- Backend authorization checks the active role and resource ownership; UI route changes alone cannot grant access.
- SQL injection risk is minimized by structured in-memory/Convex-style data access instead of string-built queries.

## API Documentation

- In-app docs: `/docs/api`
- OpenAPI summary: `/openapi.json`

## Demo Flow

1. Browse `/products` as guest and open a product detail page.
2. Submit an application review on the landing page.
3. Login as `maya`, then choose an active role with `/api/auth/role`.
4. As Seller, create/update store and product data.
5. As Buyer, top up wallet, add cart items, preview checkout, and create an order.
6. As Seller, process the order to `Menunggu Pengirim`.
7. As Driver, find the delivery job, take it, and complete it.
8. As Admin, review monitoring, generate discounts, simulate next day, and run overdue refund/return.

## Verification

```bash
pnpm lint
pnpm test
pnpm build
pnpm exec playwright test
```
