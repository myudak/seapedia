import { httpRouter } from "convex/server";
import { authComponent, createAuth } from "./auth";

const http = httpRouter();

// Registers Better Auth's HTTP routes (sign-up/in/out, get-session, …).
authComponent.registerRoutes(http, createAuth);

export default http;
