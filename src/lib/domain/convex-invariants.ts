export function canClaimDeliveryJob(input: {
  jobStatus: "available" | "taken" | "completed";
  driverId?: string;
  orderStatus: string;
}) {
  return input.jobStatus === "available" && !input.driverId && input.orderStatus === "Menunggu Pengirim";
}

export function isOrderRefundable(input: {
  status: string;
  dueAt: number;
  refundedAt?: number;
}, currentTime: number) {
  return !input.refundedAt &&
    input.status !== "Pesanan Selesai" &&
    input.status !== "Dikembalikan" &&
    input.dueAt < currentTime;
}
