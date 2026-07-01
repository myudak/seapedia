import betterAuthTest from "@convex-dev/better-auth/test";
import { convexTest } from "convex-test";
import schema from "./schema";

const modules = import.meta.glob("./**/*.ts");

export function createConvexTest() {
  const testBackend = convexTest({
    schema,
    modules,
    transactionLimits: true,
  });
  betterAuthTest.register(testBackend);
  return testBackend;
}

export function testIdentity(
  subject: string,
  sessionId = `session-${subject}`,
) {
  return {
    subject,
    issuer: "https://seapedia.test",
    tokenIdentifier: `test|${subject}`,
    email: `${subject}@seapedia.test`,
    sessionId,
  };
}
