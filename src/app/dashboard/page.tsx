import Link from "next/link";
import { DashboardShell } from "@/components/dashboard-shell";

const dashboards = [
  ["Buyer", "/dashboard/buyer"],
  ["Seller", "/dashboard/seller"],
  ["Driver", "/dashboard/driver"],
  ["Admin", "/dashboard/admin"],
];

export default function DashboardIndexPage() {
  return (
    <DashboardShell
      role="Selected after login"
      title="Dashboard Entry"
      subtitle="Choose the dashboard that matches the active session role. Backend API handlers still enforce the actual active role."
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {dashboards.map(([role, href]) => (
          <Link
            className="rounded-md border border-[var(--line)] bg-white p-4 font-black transition hover:border-[var(--market)]"
            href={href}
            key={role}
          >
            {role}
          </Link>
        ))}
      </div>
    </DashboardShell>
  );
}
