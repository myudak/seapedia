import bcrypt from "bcryptjs";
import { createHash, randomUUID } from "crypto";
import { nanoid } from "nanoid";
import type { AuthProfile, PublicUser, Role, Session, User } from "./types";
import { SESSION_TTL_MS } from "./types";

type AppState = {
  users: User[];
  sessions: Session[];
};

declare global {
  // eslint-disable-next-line no-var
  var __seapediaState: AppState | undefined;
}

function now() {
  return Date.now();
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function seedUser(
  username: string,
  displayName: string,
  email: string,
  roles: Role[],
): User {
  return {
    id: randomUUID(),
    username,
    displayName,
    email,
    passwordHash: bcrypt.hashSync("seapedia123", 10),
    roles,
    createdAt: now(),
  };
}

function createInitialState(): AppState {
  return {
    users: [
      seedUser("admin", "Admin Raya", "admin@seapedia.test", ["Admin"]),
      seedUser("maya", "Maya Multirole", "maya@seapedia.test", [
        "Buyer",
        "Seller",
        "Driver",
      ]),
      seedUser("seller", "Bima Seller", "seller@seapedia.test", ["Seller"]),
      seedUser("buyer", "Nadia Buyer", "buyer@seapedia.test", ["Buyer"]),
      seedUser("driver", "Rafi Driver", "driver@seapedia.test", ["Driver"]),
    ],
    sessions: [],
  };
}

export function getState() {
  if (!globalThis.__seapediaState) {
    globalThis.__seapediaState = createInitialState();
  }

  return globalThis.__seapediaState;
}

function publicUser(user: User): PublicUser {
  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    email: user.email,
    roles: user.roles,
  };
}

export async function registerUser(input: {
  username: string;
  displayName: string;
  email: string;
  password: string;
  roles: Role[];
}) {
  const state = getState();
  const username = input.username.trim().toLowerCase();

  if (state.users.some((user) => user.username === username)) {
    throw new Error("Username is already used.");
  }

  const user: User = {
    id: randomUUID(),
    username,
    displayName: input.displayName.trim(),
    email: input.email.trim().toLowerCase(),
    passwordHash: await bcrypt.hash(input.password, 10),
    roles: input.roles,
    createdAt: now(),
  };

  state.users.push(user);
  return publicUser(user);
}

export async function loginUser(username: string, password: string) {
  const state = getState();
  const user = state.users.find(
    (item) => item.username === username.trim().toLowerCase(),
  );

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new Error("Invalid username or password.");
  }

  const token = nanoid(48);
  const session: Session = {
    id: randomUUID(),
    userId: user.id,
    tokenHash: hashToken(token),
    activeRole:
      user.roles.length === 1 || user.roles.includes("Admin")
        ? user.roles[0]
        : undefined,
    expiresAt: now() + SESSION_TTL_MS,
    createdAt: now(),
  };

  state.sessions.push(session);
  return { token, profile: profileFor(user, session) };
}

export function chooseActiveRole(token: string | undefined | null, role: Role) {
  if (!token) {
    throw new Error("Authentication required.");
  }

  const state = getState();
  const session = state.sessions.find(
    (item) =>
      item.tokenHash === hashToken(token) &&
      !item.revokedAt &&
      item.expiresAt > now(),
  );

  if (!session) {
    throw new Error("Session is no longer valid.");
  }

  const user = state.users.find((item) => item.id === session.userId);

  if (!user || !user.roles.includes(role)) {
    throw new Error("Role is not owned by this user.");
  }

  if (role === "Admin" && !user.roles.includes("Admin")) {
    throw new Error("Admin role is not available.");
  }

  session.activeRole = role;
  return profileFor(user, session);
}

export function profileFor(user: User, session: Session): AuthProfile {
  return {
    user: publicUser(user),
    activeRole: session.activeRole,
    needsRoleSelection:
      user.roles.length > 1 &&
      !user.roles.includes("Admin") &&
      session.activeRole === undefined,
  };
}

export function getProfileFromToken(token?: string | null) {
  if (!token) {
    return null;
  }

  const state = getState();
  const tokenHash = hashToken(token);
  const session = state.sessions.find(
    (item) =>
      item.tokenHash === tokenHash &&
      !item.revokedAt &&
      item.expiresAt > now(),
  );

  if (!session) {
    return null;
  }

  const user = state.users.find((item) => item.id === session.userId);
  return user ? profileFor(user, session) : null;
}

export function logoutToken(token?: string | null) {
  if (!token) {
    return;
  }

  const state = getState();
  const session = state.sessions.find((item) => item.tokenHash === hashToken(token));

  if (session && !session.revokedAt) {
    session.revokedAt = now();
  }
}
