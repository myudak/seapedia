import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react";
import { AccountMenu } from "@/components/account-menu";
import { HeaderActions } from "@/components/header-actions";
import { SiteFooter } from "@/components/site-footer";
import { publicNavItems } from "@/lib/domain/navigation";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b border-[var(--line)] bg-[var(--background)]/90 backdrop-blur">
        <div className="border-b border-[var(--line)] bg-[var(--ink)] text-white">
          <div className="mx-auto flex min-h-9 max-w-7xl items-center justify-center gap-2 px-4 text-center text-[11px] font-medium tracking-[0.04em] text-white/80 sm:px-6">
            <span>Free delivery over Rp250.000</span>
            <span className="hidden text-white/35 sm:inline">·</span>
            <span className="hidden sm:inline">
              Single-store checkout · PPN 12% shown at checkout
            </span>
          </div>
        </div>

        <div className="mx-auto flex min-h-[4.5rem] max-w-7xl items-center gap-6 px-4 sm:px-6">
          <Link href="/" className="flex shrink-0 items-center gap-3">
            <span className="relative size-10 overflow-hidden rounded-xl border border-[var(--line)] bg-white">
              <Image
                src="/assets/brand/seapedia-mark.png"
                alt=""
                fill
                sizes="40px"
                className="object-cover"
              />
            </span>
            <span className="leading-none">
              <span className="block font-display text-[1.35rem] tracking-[0.04em]">
                SEAPEDIA
              </span>
              <span className="mt-0.5 block text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--muted)]">
                Marketplace
              </span>
            </span>
          </Link>

          <nav className="hidden flex-1 items-center justify-center gap-8 text-sm font-medium text-[var(--muted)] md:flex">
            {publicNavItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="transition hover:text-[var(--ink)]"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-1.5 md:ml-0">
            <Link
              href="/products"
              className="grid size-10 place-items-center rounded-full text-[var(--ink)] transition hover:bg-[var(--soft)]"
              aria-label="Search products"
            >
              <Search size={19} />
            </Link>
            <HeaderActions />
            <AccountMenu />
          </div>
        </div>
      </header>

      <div className="flex-1">{children}</div>

      <SiteFooter />
    </div>
  );
}
