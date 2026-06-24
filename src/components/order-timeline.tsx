import {
  Bike,
  Check,
  Package,
  PackageCheck,
  RotateCcw,
  Truck,
} from "lucide-react";

export type TimelineEntry = {
  status: string;
  note?: string;
  createdAt: number;
};

type OrderTimelineProps = {
  status: string;
  history?: TimelineEntry[];
};

const STEPS = [
  { status: "Sedang Dikemas", label: "Packed", icon: Package },
  { status: "Menunggu Pengirim", label: "Awaiting driver", icon: Truck },
  { status: "Sedang Dikirim", label: "Out for delivery", icon: Bike },
  { status: "Pesanan Selesai", label: "Completed", icon: PackageCheck },
] as const;

function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Presentational order status stepper. Reads real timestamps from the order's
 * status history when available; otherwise infers progress from the current
 * status. Renders the terminal `Dikembalikan` (returned) branch in red.
 */
export function OrderTimeline({ status, history = [] }: OrderTimelineProps) {
  const stampFor = (entryStatus: string) =>
    history.find((entry) => entry.status === entryStatus)?.createdAt;

  const isReturned = status === "Dikembalikan";
  const currentIndex = STEPS.findIndex((step) => step.status === status);

  return (
    <ol className="grid gap-0">
      {STEPS.map((step, index) => {
        const stamp = stampFor(step.status);
        const reached =
          stamp !== undefined || (currentIndex >= 0 && index <= currentIndex);
        const isCurrent = !isReturned && index === currentIndex;
        const isLast = index === STEPS.length - 1 && !isReturned;
        const Icon = step.icon;

        return (
          <li key={step.status} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={`grid size-8 shrink-0 place-items-center rounded-full border transition ${
                  reached
                    ? "border-[var(--market)] bg-[var(--market)] text-white"
                    : "border-[var(--line)] bg-white text-[var(--muted)]"
                } ${isCurrent ? "ring-4 ring-[rgba(31,111,106,0.16)]" : ""}`}
              >
                {reached && !isCurrent ? (
                  <Check size={15} />
                ) : (
                  <Icon size={15} />
                )}
              </span>
              {!isLast ? (
                <span
                  className={`min-h-6 w-px flex-1 ${
                    reached ? "bg-[var(--market)]" : "bg-[var(--line)]"
                  }`}
                />
              ) : null}
            </div>
            <div className={`pb-5 ${isLast ? "pb-0" : ""}`}>
              <p
                className={`text-sm font-semibold ${
                  reached ? "text-[var(--ink)]" : "text-[var(--muted)]"
                }`}
              >
                {step.label}
                {isCurrent ? (
                  <span className="ml-2 rounded-full bg-[rgba(31,111,106,0.12)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--market)]">
                    Current
                  </span>
                ) : null}
              </p>
              <p className="text-xs text-[var(--muted)]">
                {step.status}
                {stamp ? ` · ${formatTime(stamp)}` : ""}
              </p>
            </div>
          </li>
        );
      })}

      {isReturned ? (
        <li className="flex gap-3">
          <span className="grid size-8 shrink-0 place-items-center rounded-full border border-[var(--danger)] bg-[var(--danger)] text-white">
            <RotateCcw size={15} />
          </span>
          <div>
            <p className="text-sm font-semibold text-[var(--danger)]">
              Returned / refunded
            </p>
            <p className="text-xs text-[var(--muted)]">
              Dikembalikan
              {stampFor("Dikembalikan")
                ? ` · ${formatTime(stampFor("Dikembalikan")!)}`
                : ""}
            </p>
          </div>
        </li>
      ) : null}
    </ol>
  );
}
