# SEAPEDIA

> Crafted by **myudakk** — fullstack build for the Software Engineering Academy COMPFEST 18.

SEAPEDIA is a fullstack marketplace challenge project for Software Engineering Academy COMPFEST 18. It supports guest browsing, public application reviews, role-aware authentication, seller product management, buyer wallet/cart/checkout, discounts, delivery jobs, admin monitoring, overdue refund/return, and baseline security hardening.

It is built as a **marketplace operations simulator**: money moves through a wallet ledger, stock changes, order status advances through a state machine, the active role changes what you can do, and the admin can fast-forward time to trigger overdue refunds — all surfaced visually. The dashboard overview is a command center with a revenue chart, "needs attention" queue, and inventory alerts; orders render a visual status timeline; the wallet shows a colored financial ledger; and `/security` demonstrates the authorization and XSS controls live.

## Stack

- Next.js App Router, TypeScript, Tailwind CSS
- Convex schema/database contract
- Next Route Handlers for `/api/*`
- Zod validation, bcrypt password hashing, httpOnly session cookies
- Vitest unit tests and Playwright smoke tests
- Generated first-party storefront assets under `public/assets/*`

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

## Seed Accounts

All seeded account passwords are `seapedia123`.

| Username | Roles | Purpose |
| --- | --- | --- |
| `admin` | Admin | Monitoring, discounts, time simulation, overdue handling |
| `maya` | Buyer, Seller, Driver | Multi-role active-role selection |
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

## Storefront Assets

- Brand mark: `public/assets/brand/seapedia-mark.png`.
- Homepage hero banner: `public/assets/brand/marketplace-hero.png`.
- Seeded catalog product photos: `public/assets/products/*.png`.
- Generated assets intentionally avoid embedded product text, fake logos, and watermarks. Product names, prices, labels, stock, ratings, and store names are rendered by the app UI for reliable display.
- The catalog seed now uses local asset URLs and merchandising metadata for category, rating, sold count, discount labels, and featured products.

## Security Notes

- Passwords are hashed with bcrypt.
- Sessions use httpOnly cookies and server-side session records.
- API handlers validate inputs with Zod.
- Public user-generated comments are normalized and HTML-escaped before storage.
- Backend authorization checks the active role and resource ownership; UI route changes alone cannot grant access.
- SQL injection risk is minimized by structured in-memory/Convex-style data access instead of string-built queries.

## Backend modes (in-memory vs Convex + Better Auth)

SEAPEDIA runs in two modes:

- **Memory mode (default).** With no Convex env configured, the app uses the in-memory domain store
  (`src/lib/domain/state.ts`) seeded with demo data. Everything runs with zero setup — ideal for local
  demos — but data resets on restart. Auth uses bcrypt + httpOnly session cookies.
- **Convex mode (real, persistent backend).** When `NEXT_PUBLIC_CONVEX_URL` is set, the app enables
  **Convex** (DB) + **Better Auth** (`@convex-dev/better-auth`) for authentication. Data persists across
  restarts and deploys.

### Convex activation

1. `npx convex dev` — logs into Convex, creates a deployment, generates `convex/_generated/`, and pushes
   the schema + functions (including the Better Auth component from `convex/convex.config.ts`).
2. Copy the printed `NEXT_PUBLIC_CONVEX_URL` (and the `.convex.site` URL as `NEXT_PUBLIC_CONVEX_SITE_URL`)
   into `.env.local`; set `SITE_URL` and `BETTER_AUTH_SECRET` in the Convex deployment env.
3. Seed FK-free data: `npx convex run seed:seed` (app reviews, a voucher `HEMAT12`, a promo `ONGKIR8K`,
   system time). Demo accounts are created via the Better Auth sign-up flow.
4. `pnpm dev` and verify auth/persistence.

**What's wired vs. what to finish live.** The Convex schema (`convex/schema.ts`), the Better Auth
integration (`convex/auth.ts`, `convex/http.ts`, `convex/convex.config.ts`, `src/lib/auth-*.ts`,
`src/app/convex-client-provider.tsx`, `src/app/api/auth/[...all]/route.ts`), the multi-role/active-role
layer (`convex/profiles.ts` — `getProfile`/`setActiveRole`/`setRoles`), and the seed are in place and
gated by env so memory mode is unaffected. Porting the remaining **domain data** operations
(cart/checkout/orders/etc.) into Convex queries/mutations and pointing the route handlers at them is the
final live-integration step — intentionally done against a running `convex dev` so each function is
verified rather than shipped blind. The route layer and its URLs are unchanged, so that swap is localized
to the domain service layer.

## Dashboards

- `/dashboard` — command-center overview: revenue-over-time chart (current vs previous 7 days), live metric tiles, a "needs attention" queue (awaiting seller / awaiting driver / overdue), inventory alerts, and per-role workspace shortcuts.
- `/dashboard/buyer` — wallet with a colored financial ledger (top-up / checkout / refund), addresses, single-store cart, checkout summary, and order history with a visual status timeline and itemized totals.
- `/dashboard/seller` — store profile, product management, and incoming orders with the status timeline + process action.
- `/dashboard/driver` — available jobs, take/complete, and completed earnings.
- `/dashboard/admin` — monitoring, discount management, the time machine, overdue refund, and a link to the security checklist.

## API Documentation

- In-app docs: `/docs/api`
- OpenAPI summary: `/openapi.json`
- Security checklist (live XSS probe + authorization controls): `/security`

## Seed Flow

1. Browse `/products` as guest and open a product detail page.
2. Submit an application review on the landing page.
3. Login as `maya`, then choose an active role with `/api/auth/role`.
4. As Seller, create/update store and product data.
5. As Buyer, top up wallet, add cart items, preview checkout, and create an order.
6. As Seller, process the order to `Menunggu Pengirim`.
7. As Driver, find the delivery job, take it, and complete it.
8. As Admin, open `/dashboard` to see the revenue chart and "needs attention" queue, then on `/dashboard/admin` review monitoring, generate discounts, simulate next day, and run overdue refund/return — the refund appears back in the buyer wallet ledger.
9. Open `/security` and submit a `<script>` payload through the review probe to confirm it is stored and rendered as inert, escaped text.

## Verification

```bash
pnpm lint
pnpm test
pnpm build
```

Manual browser QA was run against `http://127.0.0.1:3000` without forcing Playwright browser installation, covering:

- `/`
- `/products`
- `/products/prd-coral-tote`
- `/login`
- `/dashboard`
- `/dashboard/admin`
- `/security`

Desktop `1366x900` and mobile `390x844` viewport checks confirmed no app error text, no visible broken images, no console errors, and no horizontal overflow on the redesigned storefront pages.

Optional E2E command if Playwright browsers are installed locally:

```bash
pnpm exec playwright test
```
