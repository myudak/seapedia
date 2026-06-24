"use client";

import { useState } from "react";
import { TicketPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, TextInput } from "@/components/ui/field";

type DiscountRow = {
  id: string;
  code: string;
  expiresAt: number;
  percentOff?: number;
  amountOff?: number;
  remainingUsage?: number;
};

export function AdminDiscountPanel() {
  const [vouchers, setVouchers] = useState<DiscountRow[]>([]);
  const [promos, setPromos] = useState<DiscountRow[]>([]);
  const [code, setCode] = useState("FLASH20");
  const [message, setMessage] = useState("Generate Voucher or Promo resources.");

  function createVoucher() {
    fetch("/api/admin/vouchers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code,
        percentOff: 20,
        remainingUsage: 5,
        expiresAt: Date.now() + 7 * 86_400_000,
      }),
    })
      .then((response) => response.json())
      .then((payload) => {
        if (payload.ok) {
          setVouchers((current) => [payload.data, ...current]);
          setMessage("Voucher generated.");
        } else {
          setMessage(payload.error);
        }
      })
      .catch(() => setMessage("Voucher generation requires Admin login."));
  }

  function createPromo() {
    fetch("/api/admin/promos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code,
        amountOff: 15000,
        expiresAt: Date.now() + 7 * 86_400_000,
      }),
    })
      .then((response) => response.json())
      .then((payload) => {
        if (payload.ok) {
          setPromos((current) => [payload.data, ...current]);
          setMessage("Promo generated.");
        } else {
          setMessage(payload.error);
        }
      })
      .catch(() => setMessage("Promo generation requires Admin login."));
  }

  return (
    <Card className="grid gap-4 p-6">
      <div>
        <h2 className="font-display text-xl">Discount management</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Generate a percentage Voucher or a fixed-amount Promo for checkout.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-[1fr_auto_auto]">
        <Field label="Code">
          <TextInput value={code} onChange={(event) => setCode(event.target.value)} />
        </Field>
        <Button
          type="button"
          className="self-end"
          icon={<TicketPlus size={18} />}
          onClick={createVoucher}
        >
          Voucher
        </Button>
        <Button
          type="button"
          className="self-end"
          variant="secondary"
          onClick={createPromo}
        >
          Promo
        </Button>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-[var(--line)] bg-[var(--soft)]/40 p-4">
          <h3 className="font-semibold">Vouchers</h3>
          {vouchers.length === 0 ? (
            <p className="mt-2 text-sm text-[var(--muted)]">None yet.</p>
          ) : (
            vouchers.map((voucher) => (
              <p key={voucher.id} className="mt-2 text-sm text-[var(--muted)]">
                <span className="font-semibold text-[var(--ink)]">
                  {voucher.code}
                </span>{" "}
                · {voucher.percentOff}% · {voucher.remainingUsage} left
              </p>
            ))
          )}
        </div>
        <div className="rounded-xl border border-[var(--line)] bg-[var(--soft)]/40 p-4">
          <h3 className="font-semibold">Promos</h3>
          {promos.length === 0 ? (
            <p className="mt-2 text-sm text-[var(--muted)]">None yet.</p>
          ) : (
            promos.map((promo) => (
              <p key={promo.id} className="mt-2 text-sm text-[var(--muted)]">
                <span className="font-semibold text-[var(--ink)]">
                  {promo.code}
                </span>{" "}
                · Rp{promo.amountOff?.toLocaleString("id-ID")}
              </p>
            ))
          )}
        </div>
      </div>
      <p className="text-sm font-semibold text-[var(--market)]">{message}</p>
    </Card>
  );
}
