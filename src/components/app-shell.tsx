import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { LayoutDashboard, Search, ShoppingCart, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { publicNavItems } from "@/lib/domain/navigation";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-[var(--line)] bg-white/95 backdrop-blur">
        <div className="bg-[var(--ink)] text-white">
          <div className="mx-auto flex min-h-9 max-w-7xl items-center justify-between gap-3 px-4 text-xs font-bold sm:px-6">
            <span>SEA Week Deals live now</span>
            <span className="hidden text-white/70 sm:inline">
              Voucher HEMAT12 • Promo ONGKIR8K
            </span>
          </div>
        </div>

        <div className="mx-auto flex min-h-20 max-w-7xl items-center gap-4 px-4 sm:px-6">
          <Link href="/" className="flex shrink-0 items-center gap-3 font-black">
            <span className="relative size-11 overflow-hidden rounded-md border border-[var(--line)] bg-white">
              <Image
                src="/assets/brand/seapedia-mark.png"
                alt=""
                fill
                sizes="44px"
                className="object-cover"
              />
            </span>
            <span className="leading-none">
              <span className="block text-lg tracking-[0.08em]">SEAPEDIA</span>
              <span className="block text-[10px] font-black uppercase text-[var(--muted)]">
                Marketplace operations
              </span>
            </span>
          </Link>

          <div className="hidden min-h-12 flex-1 items-center gap-3 border border-[var(--line)] bg-[var(--soft)] px-4 lg:flex">
            <Search size={18} className="text-[var(--muted)]" />
            <span className="text-sm font-semibold text-[var(--muted)]">
              Search products, stores, or orders
            </span>
          </div>

          <nav className="hidden items-center gap-4 text-sm font-black text-[var(--muted)] md:flex">
            {publicNavItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="hover:text-[var(--danger)]"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <Link
              href="/dashboard"
              className="hidden size-11 place-items-center border border-[var(--line)] bg-white text-[var(--ink)] hover:border-[var(--danger)] md:grid"
              aria-label="Open dashboard"
            >
              <LayoutDashboard size={18} />
            </Link>
            <Link
              href="/products"
              className="grid size-11 place-items-center border border-[var(--line)] bg-white text-[var(--ink)] hover:border-[var(--danger)]"
              aria-label="Open cart"
            >
              <ShoppingCart size={18} />
            </Link>
            <Link
              href="/login"
              className="inline-flex size-11 items-center justify-center gap-2 bg-[var(--danger)] text-sm font-black text-white hover:bg-[#c91f1f] sm:w-auto sm:px-4"
            >
              <UserRound size={17} />
              <span className="hidden sm:inline">Login</span>
            </Link>
            <span className="hidden sm:block">
              <Badge>Ready</Badge>
            </span>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
