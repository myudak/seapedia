import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-[var(--line)] bg-[rgba(247,244,238,0.92)] backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <a href="/" className="flex items-center gap-3 font-black">
            <span className="grid size-9 place-items-center rounded-md bg-[var(--market)] text-white">
              S
            </span>
            <span>SEAPEDIA</span>
          </a>
          <nav className="hidden items-center gap-3 text-sm font-bold text-[var(--muted)] md:flex">
            <a href="#catalog">Catalog</a>
            <a href="#roles">Roles</a>
            <a href="#checkout">Checkout</a>
            <a href="#admin">Admin</a>
          </nav>
          <Badge>Demo ready</Badge>
        </div>
      </header>
      {children}
    </div>
  );
}
