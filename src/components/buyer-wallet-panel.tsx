"use client";

import { useState } from "react";
import { WalletCards } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, TextInput } from "@/components/ui/field";
import { formatRupiah } from "@/lib/seed/public-products";

export function BuyerWalletPanel() {
  const [balance, setBalance] = useState(650000);
  const [amount, setAmount] = useState(100000);
  const [message, setMessage] = useState("Dummy wallet ready.");

  return (
    <section className="grid gap-4">
      <Card className="p-5">
        <p className="text-sm font-bold text-[var(--muted)]">
          Buyer balance / Saldo pembeli
        </p>
        <p className="mt-2 text-3xl font-black text-[var(--market)]">
          {formatRupiah(balance)}
        </p>
      </Card>
      <form
        className="grid gap-4 md:grid-cols-[1fr_auto]"
        onSubmit={(event) => {
          event.preventDefault();
          fetch("/api/buyer/wallet/topup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount }),
          })
            .then((response) => response.json())
            .then((payload) => {
              if (payload.ok) {
                setBalance(payload.data.wallet.balance);
                setMessage("Top-up successful.");
              } else {
                setMessage(payload.error);
              }
            })
            .catch(() => {
              setBalance((current) => current + amount);
              setMessage("Demo top-up applied locally.");
            });
        }}
      >
        <Field label="Top-up amount">
          <TextInput
            type="number"
            value={amount}
            onChange={(event) => setAmount(Number(event.target.value))}
          />
        </Field>
        <Button className="self-end" icon={<WalletCards size={18} />}>
          Top up
        </Button>
      </form>
      <p className="text-sm font-semibold text-[var(--market)]">{message}</p>
    </section>
  );
}
