type OrderStatusBadgeProps = {
  status: string;
};

const tones: Record<string, string> = {
  "Sedang Dikemas": "bg-[rgba(184,134,46,0.14)] text-[#8a6d1f]",
  "Menunggu Pengirim": "bg-[var(--soft)] text-[var(--ink)]",
  "Sedang Dikirim": "bg-[rgba(31,111,106,0.12)] text-[var(--market)]",
  "Pesanan Selesai": "bg-[rgba(31,111,106,0.18)] text-[var(--market)]",
  Dikembalikan: "bg-[rgba(194,90,60,0.12)] text-[var(--danger)]",
};

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const tone = tones[status] ?? "bg-[var(--soft)] text-[var(--muted)]";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${tone}`}
    >
      <span className="size-1.5 rounded-full bg-current opacity-70" />
      {status}
    </span>
  );
}
