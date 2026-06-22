"use client";

import { useState } from "react";
import { PackagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, TextInput } from "@/components/ui/field";

type ProductRow = {
  id: string;
  name: string;
  price: number;
  stock: number;
};

export function SellerProductPanel() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [name, setName] = useState("Batik Cable Organizer");
  const [description, setDescription] = useState(
    "Compact organizer for chargers, cables, and desk accessories.",
  );
  const [price, setPrice] = useState(79000);
  const [stock, setStock] = useState(12);
  const [message, setMessage] = useState("Product form ready.");

  return (
    <section className="mt-8 grid gap-4">
      <div>
        <h2 className="text-2xl font-black">Product Management</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          Products belong to the active seller store and later appear in the
          public catalog.
        </p>
      </div>
      <form
        className="grid gap-4 md:grid-cols-4"
        onSubmit={(event) => {
          event.preventDefault();
          fetch("/api/seller/products", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, description, price, stock }),
          })
            .then((response) => response.json())
            .then((payload) => {
              if (payload.ok) {
                setProducts((current) => [payload.data, ...current]);
                setMessage("Product created.");
              } else {
                setMessage(payload.error);
              }
            })
            .catch(() => setMessage("Product creation requires Seller login."));
        }}
      >
        <Field label="Product name">
          <TextInput value={name} onChange={(event) => setName(event.target.value)} />
        </Field>
        <Field label="Description">
          <TextInput
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </Field>
        <Field label="Price">
          <TextInput
            type="number"
            value={price}
            onChange={(event) => setPrice(Number(event.target.value))}
          />
        </Field>
        <Field label="Stock">
          <TextInput
            type="number"
            value={stock}
            onChange={(event) => setStock(Number(event.target.value))}
          />
        </Field>
        <div className="md:col-span-4">
          <Button icon={<PackagePlus size={18} />}>Create product</Button>
          <p className="mt-3 text-sm font-semibold text-[var(--market)]">
            {message}
          </p>
        </div>
      </form>
      <div className="grid gap-3 md:grid-cols-2">
        {products.map((product) => (
          <Card key={product.id} className="p-4">
            <p className="font-black">{product.name}</p>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Rp{product.price.toLocaleString("id-ID")} - stock {product.stock}
            </p>
          </Card>
        ))}
      </div>
    </section>
  );
}
