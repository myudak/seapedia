"use client";

import { useState } from "react";
import { WalletCards } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, TextInput } from "@/components/ui/field";
import { formatRupiah } from "@/lib/seed/public-products";

type WalletTransactionRow = {
  id: string;
  type: string;
  amount: number;
  note: string;
  createdAt: number;
};

export function BuyerWalletPanel() {
  const [balance, setBalance] = useState(650000);
  const [amount, setAmount] = useState(100000);
  const [message, setMessage] = useState("Wallet ready.");
  const [transactions, setTransactions] = useState<WalletTransactionRow[]>([]);

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
                setTransactions((current) => [
                  payload.data.transaction,
                  ...current,
                ]);
                setMessage("Top-up successful.");
              } else {
                setMessage(payload.error);
              }
            })
            .catch(() => {
              setBalance((current) => current + amount);
              setTransactions((current) => [
                {
                  id: crypto.randomUUID(),
                  type: "topup",
                  amount,
                  note: "Local wallet top-up",
                  createdAt: Date.now(),
                },
                ...current,
              ]);
              setMessage("Top-up applied locally.");
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
      <div className="grid gap-2">
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            className="flex items-center justify-between rounded-md border border-[var(--line)] bg-white px-3 py-2 text-sm"
          >
            <span className="font-bold capitalize">{transaction.type}</span>
            <span className="text-[var(--muted)]">
              {formatRupiah(transaction.amount)}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
