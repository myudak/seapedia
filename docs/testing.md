# Submission Test Matrix

This matrix maps the COMPFEST 18 final demo checklist to automated evidence and the shortest manual verification route. Stateful Playwright tests run only against local Convex.

## Guest, Review, and Authentication

| Requirement | Automated evidence | Manual route |
| --- | --- | --- |
| Guest browses catalog and detail | `e2e/seapedia.spec.ts`, catalog Convex tests | `/products`, then any product |
| Review can be submitted without checkout | Level 1-7 Playwright scenario | `/#reviews` |
| Review content renders safely | Convex XSS test and Level 1-7 browser probe | `/security` |
| Register, login, and logout | Auth Playwright suite | `/register`, `/login` |
| Multi-role user selects active role | Auth flow unit and `maya` Playwright scenario | Login as `maya` |
| Private dashboards enforce role | Convex role tests and Level 1-7 workflow | `/dashboard/*` |

## Seller

| Requirement | Automated evidence | Manual route |
| --- | --- | --- |
| Unique store create/update | Convex ownership/uniqueness test | `/dashboard/seller` |
| Product create/update/delete | Convex seller mutation test | `/dashboard/seller` |
| Cross-seller mutation rejected | Convex ownership test | API returns 403-style error envelope |
| Seller products enter public catalog | Convex stable-ID catalog test | `/products` |
| Process order to `Menunggu Pengirim` | Convex lifecycle test and Level 1-7 Playwright | `/dashboard/seller` |

## Buyer

| Requirement | Automated evidence | Manual route |
| --- | --- | --- |
| Top-up and wallet ledger | Convex buyer test and Level 1-7 Playwright | `/dashboard/buyer` |
| Address management | Convex buyer test | `/dashboard/buyer` |
| Cart add/update/remove | Convex buyer test | `/cart` |
| Single-store rule | Convex cart test and commerce contract test | Add products from different stores |
| Delivery and voucher checkout | Atomic checkout test and Level 1-7 Playwright | `/checkout` |
| Subtotal, discount, delivery, PPN 12%, total | Atomic checkout preview assertions | `/checkout` |
| Insufficient balance and stock are safe | Rollback and commerce contract tests | Checkout error envelope |
| Order history, detail, and timeline | Level 1-7 completed-order scenario | `/dashboard/buyer` |

## Driver

| Requirement | Automated evidence | Manual route |
| --- | --- | --- |
| Only processed jobs are visible | Convex lifecycle test | `/dashboard/driver` |
| Driver takes and completes a job | Convex lifecycle test and Level 1-7 Playwright | `/dashboard/driver` |
| Double claim is rejected | Convex race invariant | Attempt same job with second driver |
| History and 80% earnings | Convex earnings assertion and Playwright | `/dashboard/driver` |

## Admin, Overdue, and Security

| Requirement | Automated evidence | Manual route |
| --- | --- | --- |
| Monitor users/stores/products/orders/discounts/jobs/overdue | Convex admin authorization test and Playwright | `/dashboard/admin` |
| Generate/list Voucher and Promo | Convex admin test | `/dashboard/admin` |
| Simulate next day | Level 1-7 Playwright | Admin time machine |
| Auto refund/return | Convex overdue test and Level 1-7 Playwright | Admin overdue panel |
| Refund, restock, income exclusion are idempotent | Convex overdue test and invariant tests | Run overdue handling twice |
| SQL-like input is inert | Convex catalog hostile-search test | Search for `' OR 1=1 --` |
| XSS payload is inert | Convex rendering test and browser probe | `/security` |
| Backend role and ownership checks | Convex role/ownership/admin tests | Call private APIs under wrong role |

## Quality and Delivery

| Requirement | Evidence |
| --- | --- |
| Responsive public UI | `e2e/responsive.spec.ts` |
| SEO and production crawl surface | SEO Vitest and `e2e/seo.spec.ts` |
| API documentation completeness | `test/openapi.test.ts` |
| Repeatable demo data | `testing:resetForE2E` plus idempotent seed invariants |
| Lint, unit/integration, build | GitHub Actions quality workflow |
| Deployment | `https://seapedia-gamma.vercel.app` |
