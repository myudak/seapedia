"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, TextInput } from "@/components/ui/field";

export function SellerStorePanel() {
  const [name, setName] = useState("Pasar Pagi Studio");
  const [description, setDescription] = useState(
    "Curated Indonesian goods for everyday marketplace needs.",
  );
  const [message, setMessage] = useState("Store profile ready.");

  return (
    <section className="grid gap-4">
      <div>
        <h2 className="text-2xl font-black">Store Profile</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          Store names must be unique. Sellers may only manage their own store.
        </p>
      </div>
      <form
        className="grid gap-4 md:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault();
          fetch("/api/seller/store", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, description }),
          })
            .then((response) => response.json())
            .then((payload) => {
              setMessage(payload.ok ? "Store saved." : payload.error);
            })
            .catch(() => setMessage("Store update requires Seller login."));
        }}
      >
        <Field label="Store name / Nama toko">
          <TextInput value={name} onChange={(event) => setName(event.target.value)} />
        </Field>
        <Field label="Description / Deskripsi">
          <TextInput
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </Field>
        <div className="md:col-span-2">
          <Button icon={<Save size={18} />}>Save store</Button>
          <p className="mt-3 text-sm font-semibold text-[var(--market)]">
            {message}
          </p>
        </div>
      </form>
    </section>
  );
}
