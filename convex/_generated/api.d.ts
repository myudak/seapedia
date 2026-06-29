/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin from "../admin.js";
import type * as auth from "../auth.js";
import type * as buyer from "../buyer.js";
import type * as catalog from "../catalog.js";
import type * as checkout from "../checkout.js";
import type * as http from "../http.js";
import type * as model_auth from "../model/auth.js";
import type * as model_orders from "../model/orders.js";
import type * as orders from "../orders.js";
import type * as profiles from "../profiles.js";
import type * as seed from "../seed.js";
import type * as seller from "../seller.js";
import type * as validators from "../validators.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  auth: typeof auth;
  buyer: typeof buyer;
  catalog: typeof catalog;
  checkout: typeof checkout;
  http: typeof http;
  "model/auth": typeof model_auth;
  "model/orders": typeof model_orders;
  orders: typeof orders;
  profiles: typeof profiles;
  seed: typeof seed;
  seller: typeof seller;
  validators: typeof validators;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  betterAuth: import("@convex-dev/better-auth/_generated/component.js").ComponentApi<"betterAuth">;
};
