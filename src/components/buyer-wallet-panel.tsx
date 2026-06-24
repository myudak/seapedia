"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  RotateCcw,
  WalletCards,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, TextInput } from "@/components/ui/field";
import { formatRupiah } from "@/lib/seed/public-products";

type WalletTransactionRow = {
  id: string;
  type: "topup" | "checkout" | "refund";
  amount: number;
  note: string;
  createdAt: number;
};

const ledgerMeta: Record<
  WalletTransactionRow["type"],
  { label: string; icon: typeof ArrowUpRight; tone: string }
> = {
  topup: {
    label: "Top-up",
    icon: ArrowDownLeft,
    tone: "text-[var(--market)]",
  },
  checkout: {
    label: "Checkout",
    icon: ArrowUpRight,
    tone: "text-[var(--danger)]",
  },
  refund: {
    label: "Refund",
    icon: RotateCcw,
    tone: "text-[var(--market)]",
  },
};

function formatRelative(timestamp: number) {
  const diff = Date.now() - timestamp;
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export function BuyerWalletPanel() {
  const [balance, setBalance] = useState<number | null>(null);
  const [amount, setAmount] = useState(100000);
  const [message, setMessage] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<WalletTransactionRow[]>([]);

  const loadWallet = useCallback(() => {
    fetch("/api/buyer/wallet")
      .then((response) => response.json())
      .then((payload) => {
        if (payload.ok) {
          setBalance(payload.data.wallet.balance);
          setTransactions(payload.data.transactions ?? []);
          setMessage(null);
        } else {
          setMessage(payload.error);
        }
      })
      .catch(() => setMessage("Wallet requires Buyer login."));
  }, []);

  useEffect(() => {
    loadWallet();
  }, [loadWallet]);

  function topUp(event: React.FormEvent) {
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
          setTransactions((current) => [payload.data.transaction, ...current]);
          setMessage("Top-up successful.");
        } else {
          setMessage(payload.error);
        }
      })
      .catch(() => setMessage("Top-up requires Buyer login."));
  }

  return (
    <section className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-[1fr_1.2fr] md:items-stretch">
        <Card className="flex flex-col justify-between gap-4 bg-[var(--ink)] p-6 text-white">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-white/70">
              Wallet balance / Saldo
            </p>
            <WalletCards size={20} className="text-white/70" />
          </div>
          <p className="font-display text-4xl tracking-tight">
            {balance === null ? "—" : formatRupiah(balance)}
          </p>
          <p className="text-xs text-white/55">
            Checkout debits this balance; overdue orders are auto-refunded here.
          </p>
        </Card>

        <Card className="p-6">
          <h3 className="font-display text-lg">Top up wallet</h3>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Add balance to cover checkout, delivery, and PPN.
          </p>
          <form
            className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end"
            onSubmit={topUp}
          >
            <Field label="Top-up amount (Rp)">
              <TextInput
                type="number"
                min={1}
                value={amount}
                onChange={(event) => setAmount(Number(event.target.value))}
              />
            </Field>
            <Button icon={<WalletCards size={18} />}>Top up</Button>
          </form>
          <div className="mt-3 flex flex-wrap gap-2">
            {[50000, 100000, 250000].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setAmount(preset)}
                className="rounded-full border border-[var(--line)] px-3 py-1 text-xs font-semibold transition hover:border-[var(--ink)]"
              >
                {formatRupiah(preset)}
              </button>
            ))}
          </div>
          {message ? (
            <p className="mt-3 text-sm font-semibold text-[var(--market)]">
              {message}
            </p>
          ) : null}
        </Card>
      </div>

      {/* Ledger */}
      <Card className="p-6">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-display text-lg">Financial ledger</h3>
          <span className="text-xs text-[var(--muted)]">
            {transactions.length} entr{transactions.length === 1 ? "y" : "ies"}
          </span>
        </div>
        {transactions.length === 0 ? (
          <p className="mt-4 text-sm text-[var(--muted)]">
            No transactions yet. Top up or checkout to record ledger entries.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-[var(--line)]">
            {transactions.map((transaction) => {
              const meta = ledgerMeta[transaction.type];
              const Icon = meta.icon;
              const positive = transaction.amount >= 0;
              return (
                <li
                  key={transaction.id}
                  className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <span className="flex items-center gap-3">
                    <span
                      className={`grid size-9 place-items-center rounded-full bg-[var(--soft)] ${meta.tone}`}
                    >
                      <Icon size={16} />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold">
                        {meta.label}
                      </span>
                      <span className="block text-xs text-[var(--muted)]">
                        {transaction.note} · {formatRelative(transaction.createdAt)}
                      </span>
                    </span>
                  </span>
                  <span className={`text-sm font-semibold ${meta.tone}`}>
                    {positive ? "+ " : "− "}
                    {formatRupiah(Math.abs(transaction.amount))}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </section>
  );
}
