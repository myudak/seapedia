"use client";

import { useState } from "react";
import { ReceiptText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, SelectInput } from "@/components/ui/field";
import { TextInput } from "@/components/ui/field";
import { formatRupiah } from "@/lib/seed/public-products";

type Summary = {
  subtotal: number;
  discount: number;
  deliveryFee: number;
  ppn: number;
  total: number;
};

export function BuyerCheckoutPanel() {
  const [deliveryMethod, setDeliveryMethod] = useState("Regular");
  const [discountCode, setDiscountCode] = useState("HEMAT12");
  const [summary, setSummary] = useState<Summary | null>(null);
  const [message, setMessage] = useState("Cart summary calculates PPN 12%.");

  return (
    <section className="mt-8 grid gap-4" id="checkout">
      <h2 className="text-2xl font-black">Checkout Summary</h2>
      <form
        className="grid gap-4 md:grid-cols-[1fr_1fr_auto]"
        onSubmit={(event) => {
          event.preventDefault();
          fetch("/api/buyer/checkout/summary", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ deliveryMethod, discountCode }),
          })
            .then((response) => response.json())
            .then((payload) => {
              if (payload.ok) {
                setSummary(payload.data.summary);
                setMessage("Checkout summary ready.");
              } else {
                setMessage(payload.error);
              }
            })
            .catch(() => setMessage("Checkout preview requires Buyer login."));
        }}
      >
        <Field label="Delivery method">
          <SelectInput
            value={deliveryMethod}
            onChange={(event) => setDeliveryMethod(event.target.value)}
          >
            <option>Instant</option>
            <option>Next Day</option>
            <option>Regular</option>
          </SelectInput>
        </Field>
        <Field label="Discount code">
          <TextInput
            value={discountCode}
            onChange={(event) => setDiscountCode(event.target.value)}
          />
        </Field>
        <Button className="self-end" icon={<ReceiptText size={18} />}>
          Preview
        </Button>
      </form>
      {summary ? (
        <Card className="grid gap-2 p-4 text-sm">
          <p>Subtotal: {formatRupiah(summary.subtotal)}</p>
          <p>Discount: {formatRupiah(summary.discount)}</p>
          <p>Delivery fee: {formatRupiah(summary.deliveryFee)}</p>
          <p>PPN 12%: {formatRupiah(summary.ppn)}</p>
          <p className="text-xl font-black text-[var(--market)]">
            Total: {formatRupiah(summary.total)}
          </p>
        </Card>
      ) : null}
      <Button
        type="button"
        variant="secondary"
        onClick={() => {
          fetch("/api/buyer/checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ deliveryMethod, discountCode }),
          })
            .then((response) => response.json())
            .then((payload) => {
              setMessage(payload.ok ? "Order created." : payload.error);
            })
            .catch(() => setMessage("Checkout requires Buyer login."));
        }}
      >
        Confirm checkout
      </Button>
      <p className="text-sm font-semibold text-[var(--market)]">{message}</p>
    </section>
  );
}
