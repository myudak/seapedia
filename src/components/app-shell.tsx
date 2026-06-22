import type { ReactNode } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { publicNavItems } from "@/lib/domain/navigation";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-[var(--line)] bg-[rgba(247,244,238,0.92)] backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-3 font-black">
            <span className="grid size-9 place-items-center rounded-md bg-[var(--market)] text-white">
              S
            </span>
            <span>SEAPEDIA</span>
          </Link>
          <nav className="hidden items-center gap-3 text-sm font-bold text-[var(--muted)] md:flex">
            {publicNavItems.map((item) => (
              <a key={item.href} href={item.href}>
                {item.label}
              </a>
            ))}
          </nav>
          <Badge>Demo ready</Badge>
        </div>
      </header>
      {children}
    </div>
  );
}
