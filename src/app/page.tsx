import { ArrowRight, Bike, ShieldCheck, ShoppingBag, Store } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const stats = [
  ["4 roles", "Buyer, Seller, Driver, Admin"],
  ["12% PPN", "Visible in checkout"],
  ["3 delivery", "Instant, Next Day, Regular"],
];

const roles = [
  {
    title: "Buyer / Pembeli",
    text: "Browse products, manage cart, top up wallet, checkout, and track delivery.",
    icon: ShoppingBag,
  },
  {
    title: "Seller / Penjual",
    text: "Create a store, manage products, process orders, and view income.",
    icon: Store,
  },
  {
    title: "Driver / Pengirim",
    text: "Find ready jobs, take deliveries, complete jobs, and track earnings.",
    icon: Bike,
  },
  {
    title: "Admin",
    text: "Monitor marketplace data, manage discounts, and simulate overdue handling.",
    icon: ShieldCheck,
  },
];

export default function Home() {
  return (
    <AppShell>
      <main>
        <section className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <Badge>Marketplace multi-role / Banyak peran</Badge>
            <h1 className="mt-5 max-w-4xl text-5xl font-black leading-none text-[var(--ink)] md:text-7xl">
              SEAPEDIA
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--muted)]">
              A fullstack marketplace where guests browse safely, users choose
              an active role, sellers manage products, buyers checkout with a
              wallet, drivers deliver orders, and admins supervise operations.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button icon={<ArrowRight size={18} />}>Explore catalog</Button>
              <Button variant="secondary">Login demo</Button>
            </div>
            <div className="mt-10 grid max-w-2xl gap-3 sm:grid-cols-3">
              {stats.map(([value, label]) => (
                <Card key={value} className="p-4">
                  <p className="text-2xl font-black text-[var(--market)]">
                    {value}
                  </p>
                  <p className="mt-1 text-sm text-[var(--muted)]">{label}</p>
                </Card>
              ))}
            </div>
          </div>

          <div className="grid gap-4" id="roles">
            {roles.map((role) => {
              const Icon = role.icon;
              return (
                <Card key={role.title} className="p-5">
                  <div className="flex gap-4">
                    <span className="grid size-12 shrink-0 place-items-center rounded-md bg-[var(--ink)] text-white">
                      <Icon size={22} />
                    </span>
                    <div>
                      <h2 className="text-lg font-black">{role.title}</h2>
                      <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                        {role.text}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      </main>
    </AppShell>
  );
}
