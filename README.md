# SEAPEDIA

SEAPEDIA is a full-stack multi-role marketplace built for the Software Engineering Academy COMPFEST 18 challenge. Guests can browse 32 local products and submit reviews. Buyers, sellers, drivers, and admins operate one shared, role-protected order lifecycle.

- Production: [seapedia-gamma.vercel.app](https://seapedia-gamma.vercel.app)
- Repository: [github.com/myudak/seapedia](https://github.com/myudak/seapedia)
- API reference: [seapedia-gamma.vercel.app/docs/api](https://seapedia-gamma.vercel.app/docs/api)

## Stack

- Next.js App Router, React, TypeScript, and Tailwind CSS
- Convex database, validated functions, indexes, and atomic mutations
- Better Auth through `@convex-dev/better-auth`
- Zod validation at HTTP route boundaries
- Vitest, `convex-test`, and Playwright
- First-party generated product photography under `public/assets/products`

## Local Setup

Requirements: Node.js 20+ and pnpm.

```powershell
pnpm install
Copy-Item .env.example .env.local
pnpm exec convex dev
```

On the first run choose `Start without an account (run Convex locally)`. Keep this first terminal running. It generates the local deployment values in `.env.local` and starts Convex at `http://127.0.0.1:3210`.

In a second terminal, configure the backend and seed it once:

```powershell
pnpm exec convex env set SITE_URL http://127.0.0.1:3001
pnpm exec convex env set BETTER_AUTH_SECRET <same-value-as-.env.local>
pnpm exec convex env set SEED_ACCOUNT_PASSWORD <same-value-as-.env.local>
pnpm exec convex run seed:seed
pnpm dev:next
```

Open `http://127.0.0.1:3001`. The seed is idempotent, so rerunning it updates stable records without duplicating marketplace data.

For later sessions, use either the same two-terminal setup (`convex dev` plus `dev:next`) or stop both processes and run this single command:

```powershell
pnpm dev:local
```

Do not run `pnpm dev:local` while another `convex dev` process is active.

## Environment

| Variable | Location | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_CONVEX_URL` | Next.js | Convex client URL |
| `NEXT_PUBLIC_CONVEX_SITE_URL` | Next.js | Convex HTTP/auth URL |
| `NEXT_PUBLIC_SITE_URL` | Next.js | Canonical public origin and SEO URLs |
| `CONVEX_DEPLOYMENT` | CLI | Selected Convex deployment |
| `SITE_URL` | Convex | Origin trusted by Better Auth |
| `BETTER_AUTH_SECRET` | Convex | Better Auth signing secret, at least 32 characters |
| `SEED_ACCOUNT_PASSWORD` | Convex/local shell | Development-only seed password |

Never commit `.env.local`, deployment keys, or production secrets.

## Demo Accounts

The supplied local setup uses `SEED_ACCOUNT_PASSWORD=seapedia123`.

| Username | Roles |
| --- | --- |
| `admin` | Admin |
| `maya` | Buyer, Seller, Driver |
| `seller` | Seller |
| `buyer` | Buyer |
| `driver` | Driver |

`maya` must choose an active role for each new session. Every private Convex function checks identity, active session role, and resource ownership again on the server.

## Level 1-7 Demo

1. As a guest, browse `/products`, open a product, and submit an application review on `/`.
2. Register a Buyer account, or log in as `maya` to demonstrate active-role selection and protected dashboards.
3. Log in as `seller` to edit the seeded store and create, update, or delete a product.
4. Log in as `buyer`, top up the wallet, manage an address, add a product, and checkout with voucher `HEMAT12`.
5. Log in as `seller` and process the new order from `Sedang Dikemas` to `Menunggu Pengirim`.
6. Log in as `driver`, take the job, complete it, and verify the 80% delivery-fee earning.
7. Create another Instant order, then log in as `admin`, advance one day, run overdue handling, and verify the Buyer refund, stock restoration, and `Dikembalikan` timeline.
8. Open `/security` and submit the XSS probe. The payload is displayed as inert text.

The detailed requirement-to-test mapping is in [`docs/testing.md`](docs/testing.md).

## Business Rules

- A cart contains products from one store only. Cross-store additions are rejected until the cart is cleared.
- Checkout is one atomic Convex mutation. Validation failure leaves wallet, stock, voucher usage, order records, and cart unchanged.
- The taxable base is subtotal after discount. PPN is 12% of that amount.
- Delivery fees: Instant `Rp20.000`, Next Day `Rp12.000`, Regular `Rp8.000`.
- One Voucher or Promo may be used per checkout; they cannot be combined. Vouchers are percentage-based with expiry and remaining usage. Promos are fixed-amount with expiry.
- Orders move through `Sedang Dikemas`, `Menunggu Pengirim`, `Sedang Dikirim`, then `Pesanan Selesai` or `Dikembalikan`.
- Driver earnings are 80% of the delivery fee after successful completion.
- SLA: Instant 6 hours, Next Day 1 day, Regular 3 days.
- Overdue handling refunds the paid total, restores stock, excludes the order from seller income, records timeline/ledger entries, and is idempotent.

## Security Notes

- **Injection:** Convex query/index APIs never concatenate query strings. Convex argument validators and Zod HTTP schemas reject malformed values.
- **XSS:** Reviews render through React text nodes. JSON-LD escapes `<`, and tests exercise script-tag and SQL-like payloads.
- **Authentication:** Better Auth owns password hashing and database-backed sessions. Session expiration and rotation use Better Auth defaults; logout revokes/clears the active session.
- **Authorization:** Active roles are stored per Better Auth session. Convex functions re-check the active role and ownership for buyer, seller, driver, and admin operations.
- **Transactions:** Convex mutations provide optimistic concurrency control, preventing double job claims and partial checkout writes.
- **Secrets:** `.env.local` and `.convex` data are ignored. No password, secret, or deployment key is committed.

## Catalog and SEO

- 32 products: 8 each in Fashion, Food, Home, and Gadget
- 12 items per page with search, category filters, and popular/rating/price sorting
- Stable public URLs use `/products/{publicId}`; Convex `_id` values remain internal
- Unique local 1200x1500 WebP assets for each catalog item
- Canonical metadata, Open Graph/Twitter cards, Product/Offer/Breadcrumb JSON-LD
- `/robots.txt`, `/sitemap.xml`, and `/manifest.webmanifest`
- Login, registration, cart, checkout, wishlist, and dashboards are `noindex`

## API

All `/api/*` responses use `{ ok, data, error }`. The interactive reference is at `/docs/api`; the OpenAPI source is [`public/openapi.json`](public/openapi.json). An automated parity test verifies that every concrete route method is documented.

## Verification

```powershell
pnpm lint
pnpm test
pnpm build
pnpm test:e2e
```

`pnpm test:e2e` is local-only: it resets deterministic marketplace data before and after the serial Level 1-7 flow while preserving Better Auth accounts. It requires the seeded local Convex deployment and an existing Playwright browser; it does not install a browser automatically.

Run public, read-only smoke tests against production with:

```powershell
$env:PLAYWRIGHT_BASE_URL='https://seapedia-gamma.vercel.app'
pnpm exec playwright test e2e/seo.spec.ts e2e/responsive.spec.ts
```

## Deployment

Vercel runs `pnpm vercel-build`, which deploys Convex functions before building Next.js. Configure these production variables in Vercel:

- `CONVEX_DEPLOY_KEY`
- `NEXT_PUBLIC_CONVEX_URL`
- `NEXT_PUBLIC_CONVEX_SITE_URL`
- `NEXT_PUBLIC_SITE_URL=https://seapedia-gamma.vercel.app`

Configure `SITE_URL=https://seapedia-gamma.vercel.app`, `BETTER_AUTH_SECRET`, and the seed password separately on the production Convex deployment. Never reuse localhost origins or development secrets in production.
