"use client";

import { useState } from "react";
import { PackagePlus, Trash2 } from "lucide-react";
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

  function updateStock(product: ProductRow, stock: number) {
    fetch(`/api/seller/products/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stock }),
    })
      .then((response) => response.json())
      .then((payload) => {
        if (payload.ok) {
          setProducts((current) =>
            current.map((item) => (item.id === product.id ? payload.data : item)),
          );
          setMessage("Product updated.");
        } else {
          setMessage(payload.error);
        }
      })
      .catch(() => setMessage("Product update requires Seller login."));
  }

  function deleteProduct(product: ProductRow) {
    fetch(`/api/seller/products/${product.id}`, { method: "DELETE" })
      .then((response) => response.json())
      .then((payload) => {
        if (payload.ok) {
          setProducts((current) =>
            current.filter((item) => item.id !== product.id),
          );
          setMessage("Product deleted.");
        } else {
          setMessage(payload.error);
        }
      })
      .catch(() => setMessage("Product delete requires Seller login."));
  }

  return (
    <Card className="grid gap-4 p-6">
      <div>
        <h2 className="font-display text-xl">Product management</h2>
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
          <div
            key={product.id}
            className="rounded-xl border border-[var(--line)] bg-[var(--soft)]/40 p-4"
          >
            <p className="font-semibold">{product.name}</p>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Rp{product.price.toLocaleString("id-ID")} · stock {product.stock}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => updateStock(product, product.stock + 1)}
              >
                + stock
              </Button>
              <Button
                type="button"
                variant="danger"
                icon={<Trash2 size={16} />}
                onClick={() => deleteProduct(product)}
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
