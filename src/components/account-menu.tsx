"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, LogOut, UserRound } from "lucide-react";
import { authClient } from "@/lib/auth-client";

type Profile = {
  user: { username: string; displayName: string; roles: string[] };
  activeRole?: string;
  needsRoleSelection: boolean;
};

export function AccountMenu() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;
    fetch("/api/profile")
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        if (mounted) {
          setProfile(payload?.ok ? payload.data : null);
          setLoaded(true);
        }
      })
      .catch(() => {
        if (mounted) setLoaded(true);
      });
    return () => {
      mounted = false;
    };
  }, []);

  function logout() {
    authClient
      .signOut()
      .then(() => {
        setProfile(null);
        router.push("/");
        router.refresh();
      })
      .catch(() => undefined);
  }

  // Logged out (or still loading) — show the Login action.
  if (!loaded || !profile) {
    return (
      <Link
        href="/login"
        className="ml-1 inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-[var(--danger)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--danger-strong)]"
      >
        <UserRound size={16} />
        <span className="hidden sm:inline">Login</span>
      </Link>
    );
  }

  const activeRole = profile.activeRole ?? "Select role";

  return (
    <div className="ml-1 flex items-center gap-1.5">
      <Link
        href="/dashboard"
        className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[var(--line)] bg-white px-3 text-sm font-medium text-[var(--ink)] transition hover:border-[var(--ink)]"
      >
        <LayoutDashboard size={16} className="text-[var(--muted)]" />
        <span className="hidden max-w-[8rem] truncate sm:inline">
          {profile.user.displayName || profile.user.username}
        </span>
        <span className="rounded-full bg-[var(--soft)] px-2 py-0.5 text-[11px] font-semibold text-[var(--market)]">
          {activeRole}
        </span>
      </Link>
      <button
        type="button"
        onClick={logout}
        className="grid size-10 place-items-center rounded-full text-[var(--ink)] transition hover:bg-[var(--soft)]"
        aria-label="Log out"
        title="Log out"
      >
        <LogOut size={18} />
      </button>
    </div>
  );
}
