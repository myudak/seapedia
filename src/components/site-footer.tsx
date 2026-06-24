import Image from "next/image";
import Link from "next/link";
import { ShieldCheck, Store, Truck } from "lucide-react";
import { MyudakkMark } from "@/components/brand/myudakk-mark";
import { footerSections } from "@/lib/domain/navigation";

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--line)] bg-[var(--surface)]">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" className="flex items-center gap-3">
              <span className="relative size-10 overflow-hidden rounded-xl border border-[var(--line)] bg-white">
                <Image
                  src="/assets/brand/seapedia-mark.png"
                  alt=""
                  fill
                  sizes="40px"
                  className="object-cover"
                />
              </span>
              <span className="font-display text-xl tracking-[0.04em]">
                SEAPEDIA
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-7 text-[var(--muted)]">
              A multi-role marketplace for buyers, sellers, drivers, and admins.
              One cart checks out from a single store, with PPN 12% and delivery
              shown transparently before you confirm.
            </p>
            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-[var(--muted)]">
              <span className="inline-flex items-center gap-1.5">
                <Store size={15} className="text-[var(--market)]" />
                Single-store checkout
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Truck size={15} className="text-[var(--market)]" />
                SLA delivery
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck size={15} className="text-[var(--market)]" />
                Wallet protected
              </span>
            </div>
          </div>

          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                {section.title}
              </h3>
              <ul className="mt-4 grid gap-2.5">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-[var(--ink)] transition hover:text-[var(--danger)]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-[var(--line)] pt-6 text-xs text-[var(--muted)] sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} SEAPEDIA. All rights reserved.</p>
          <span className="group inline-flex items-center gap-2">
            <span>Crafted by</span>
            <MyudakkMark
              size={18}
              className="transition-transform duration-500 group-hover:-rotate-6"
            />
            <span className="font-semibold text-[var(--ink)]">myudakk</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
