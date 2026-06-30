"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LayoutDashboard,
  Lock,
  LogIn,
  Receipt,
  ShieldCheck,
  Store,
  UserPlus,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, TextInput } from "@/components/ui/field";
import { authClient } from "@/lib/auth-client";
import { dashboardPath, rolesForSession } from "@/lib/auth-flow";

type AuthPanelProps = {
  mode: "login" | "register";
};

type Profile = {
  user: { username: string; displayName: string; roles: string[] };
  activeRole?: string;
  needsRoleSelection: boolean;
};

const features = [
  {
    icon: Store,
    title: "Single-store checkout",
    body: "One cart, simple and secure.",
  },
  {
    icon: Receipt,
    title: "Transparent PPN",
    body: "PPN 12% shown at checkout.",
  },
  {
    icon: LayoutDashboard,
    title: "Role-based dashboard",
    body: "Tools tailored to your role.",
  },
];

export function AuthPanel({ mode }: AuthPanelProps) {
  const router = useRouter();
  const isLogin = mode === "login";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");

  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roleOptions, setRoleOptions] = useState<string[] | null>(null);

  function proceedAfterAuth(profile: Profile) {
    if (profile.needsRoleSelection) {
      setRoleOptions(rolesForSession(profile));
      return;
    }
    router.push(dashboardPath(profile.activeRole));
    router.refresh();
  }

  async function loadProfile(): Promise<Profile | null> {
    const response = await fetch("/api/profile", { cache: "no-store" });
    const payload = await response.json();
    if (!payload.ok) {
      setError(payload.error ?? "Profile could not be loaded.");
      return null;
    }
    return payload.data as Profile;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);

    try {
      if (!isLogin) {
        const { error: signUpError } = await authClient.signUp.email({
          username,
          name: displayName || username,
          email,
          password,
        });
        if (signUpError) {
          setError(signUpError.message ?? "Registration failed.");
          return;
        }

        const profileResponse = await fetch("/api/profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, displayName: displayName || username }),
        });
        if (!profileResponse.ok) {
          setError("Account created, but marketplace profile setup failed.");
          return;
        }
      } else {
        const { error: signInError } = await authClient.signIn.username({
          username,
          password,
        });
        if (signInError) {
          setError(signInError.message ?? "Invalid username or password.");
          return;
        }
      }

      const profile = await loadProfile();
      if (profile) {
        proceedAfterAuth(profile);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setPending(false);
    }
  }

  async function selectRole(role: string) {
    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      const payload = await response.json();
      if (!payload.ok) {
        setError(payload.error ?? "Role selection failed.");
        return;
      }
      router.push(dashboardPath(role));
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="mx-auto grid max-w-6xl overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-[0_1px_2px_rgba(30,27,23,0.04)] lg:grid-cols-[1.05fr_0.95fr]">
      {/* Brand panel */}
      <div className="relative hidden flex-col justify-between gap-10 overflow-hidden bg-[var(--ink)] p-10 text-white lg:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-90"
          style={{
            background:
              "radial-gradient(120% 90% at 0% 0%, rgba(194,90,60,0.45) 0%, rgba(30,27,23,0) 55%), radial-gradient(120% 90% at 100% 100%, rgba(31,111,106,0.4) 0%, rgba(30,27,23,0) 55%)",
          }}
        />
        <Lighthouse />

        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/80">
            <ShieldCheck size={14} />
            Multi-role marketplace
          </span>
          <h2 className="mt-6 font-display text-4xl leading-[1.05]">
            {isLogin
              ? "Welcome back to SEAPEDIA"
              : "Join SEAPEDIA in one step"}
          </h2>
          <p className="mt-3 max-w-sm text-sm leading-6 text-white/70">
            {isLogin
              ? "Choose your role and continue your marketplace session."
              : "Create one account and unlock Buyer, Seller, and Driver tools."}
          </p>

          <ul className="mt-8 grid gap-4">
            {features.map(({ icon: Icon, title, body }) => (
              <li key={title} className="flex items-start gap-3.5">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-white/15 bg-white/10 text-white">
                  <Icon size={17} />
                </span>
                <span>
                  <span className="block text-sm font-semibold">{title}</span>
                  <span className="mt-0.5 block text-xs leading-5 text-white/65">
                    {body}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative max-w-sm text-xs leading-5 text-white/55">
          SEAPEDIA is a multi-role marketplace for buyers, sellers, drivers, and
          admins. One cart checks out from a single store, with role-based access
          and tools.
        </p>
      </div>

      {/* Form / role-selection panel */}
      <div className="p-8 sm:p-10">
        {roleOptions ? (
          <div>
            <h1 className="font-display text-3xl">Choose your role</h1>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Your account holds more than one role. Pick the role for this
              session — access follows the active role.
            </p>
            <div className="mt-7 grid gap-3">
              {roleOptions.map((role) => (
                <button
                  key={role}
                  type="button"
                  disabled={pending}
                  onClick={() => selectRole(role)}
                  className="flex items-center justify-between rounded-[0.75rem] border border-[var(--line)] bg-white px-5 py-4 text-left transition hover:border-[var(--danger)] hover:bg-[var(--soft)] disabled:opacity-60"
                >
                  <span className="font-semibold">{role}</span>
                  <ArrowRight size={18} className="text-[var(--muted)]" />
                </button>
              ))}
            </div>
            {error ? (
              <p className="mt-4 rounded-[0.625rem] bg-[rgba(194,90,60,0.1)] px-3.5 py-3 text-sm text-[var(--danger)]">
                {error}
              </p>
            ) : null}
          </div>
        ) : (
          <>
            <h1 className="font-display text-3xl">
              {isLogin ? "Login" : "Create account"}
            </h1>
            <p className="mt-2 text-sm text-[var(--muted)]">
              {isLogin ? "Masuk ke akun SEAPEDIA." : "Daftar akun SEAPEDIA baru."}
            </p>

            <form className="mt-7 grid gap-4" onSubmit={handleSubmit}>
              {!isLogin ? (
                <>
                  <Field label="Display name">
                    <TextInput
                      value={displayName}
                      onChange={(event) => setDisplayName(event.target.value)}
                      placeholder="Your name"
                    />
                  </Field>
                  <Field label="Email">
                    <TextInput
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="you@email.com"
                      required
                    />
                  </Field>
                </>
              ) : null}
              <Field label="Username">
                <div className="relative">
                  <UserRound
                    size={17}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]"
                  />
                  <TextInput
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    className="w-full pl-10"
                    required
                  />
                </div>
              </Field>
              <Field label="Password">
                <div className="relative">
                  <Lock
                    size={17}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]"
                  />
                  <TextInput
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full px-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-2.5 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-md text-[var(--muted)] transition hover:bg-[var(--soft)] hover:text-[var(--ink)]"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </Field>
              <Button
                className="mt-1"
                disabled={pending}
                icon={isLogin ? <LogIn size={18} /> : <UserPlus size={18} />}
              >
                {pending
                  ? "Please wait…"
                  : isLogin
                    ? "Login"
                    : "Create account"}
              </Button>
            </form>

            {error ? (
              <p className="mt-4 rounded-[0.625rem] bg-[rgba(194,90,60,0.1)] px-3.5 py-3 text-sm text-[var(--danger)]">
                {error}
              </p>
            ) : null}

            <p className="mt-6 text-sm text-[var(--muted)]">
              {isLogin ? "New to SEAPEDIA? " : "Already have an account? "}
              <Link
                href={isLogin ? "/register" : "/login"}
                className="font-semibold text-[var(--danger)] underline-offset-4 hover:underline"
              >
                {isLogin ? "Create an account" : "Login instead"}
              </Link>
            </p>

          </>
        )}
      </div>
    </section>
  );
}

function Lighthouse() {
  return (
    <svg
      viewBox="0 0 200 240"
      fill="none"
      aria-hidden
      className="pointer-events-none absolute -bottom-2 right-4 h-64 w-52 text-white/20"
    >
      {/* beams */}
      <path d="M96 56 L20 20 M96 56 L20 92" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
      {/* lantern */}
      <rect x="86" y="44" width="28" height="22" rx="3" stroke="currentColor" strokeWidth="2" />
      <path d="M84 42 h32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M88 44 v22 M100 44 v22 M112 44 v22" stroke="currentColor" strokeWidth="1.2" opacity="0.6" />
      {/* tower */}
      <path d="M88 66 L82 170 H118 L112 66" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M85 100 H115 M84 134 H116" stroke="currentColor" strokeWidth="1.4" opacity="0.7" />
      {/* base */}
      <path d="M74 170 H126 L132 196 H68 Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      {/* waves */}
      <path d="M20 210 q12 -10 24 0 t24 0 t24 0 t24 0 t24 0 t24 0" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
      <path d="M30 226 q12 -10 24 0 t24 0 t24 0 t24 0 t24 0" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
    </svg>
  );
}
