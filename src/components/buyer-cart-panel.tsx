"use client";

import { useMemo, useState } from "react";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, SelectInput, TextInput } from "@/components/ui/field";
import { formatRupiah, publicProducts } from "@/lib/seed/public-products";

type CartRow = {
  id: string;
  productName: string;
  price: number;
  quantity: number;
  lineTotal: number;
};

export function BuyerCartPanel() {
  const [productId, setProductId] = useState(publicProducts[0]?.id ?? "");
  const [quantity, setQuantity] = useState(1);
  const [items, setItems] = useState<CartRow[]>([]);
  const [message, setMessage] = useState("Single-store checkout rule appears here.");
  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.lineTotal, 0),
    [items],
  );

  return (
    <section className="mt-8 grid gap-4">
      <h2 className="text-2xl font-black">Cart</h2>
      <p className="text-sm leading-6 text-[var(--muted)]">
        One cart may only contain products from one store. This backend rule is
        enforced in the next fix commit.
      </p>
      <form
        className="grid gap-4 md:grid-cols-[1fr_160px_auto]"
        onSubmit={(event) => {
          event.preventDefault();
          fetch("/api/buyer/cart/items", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId, quantity }),
          })
            .then((response) => response.json())
            .then((payload) => {
              if (payload.ok) {
                setItems(payload.data.items);
                setMessage("Cart updated.");
              } else {
                setMessage(payload.error);
              }
            })
            .catch(() => setMessage("Cart update requires Buyer login."));
        }}
      >
        <Field label="Product">
          <SelectInput
            value={productId}
            onChange={(event) => setProductId(event.target.value)}
          >
            {publicProducts.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </SelectInput>
        </Field>
        <Field label="Qty">
          <TextInput
            type="number"
            value={quantity}
            onChange={(event) => setQuantity(Number(event.target.value))}
          />
        </Field>
        <Button className="self-end" icon={<ShoppingCart size={18} />}>
          Add
        </Button>
      </form>
      <div className="grid gap-3">
        {items.map((item) => (
          <Card key={item.id} className="p-4">
            <p className="font-black">{item.productName}</p>
            <p className="text-sm text-[var(--muted)]">
              {item.quantity} x {formatRupiah(item.price)}
            </p>
          </Card>
        ))}
      </div>
      <p className="font-black">Subtotal: {formatRupiah(subtotal)}</p>
      <p className="text-sm font-semibold text-[var(--market)]">{message}</p>
    </section>
  );
}
