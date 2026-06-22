"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, TextInput } from "@/components/ui/field";

type AddressRow = {
  id: string;
  label: string;
  recipient: string;
  phone: string;
  fullAddress: string;
  isDefault: boolean;
};

export function BuyerAddressPanel() {
  const [addresses, setAddresses] = useState<AddressRow[]>([]);
  const [label, setLabel] = useState("Office");
  const [recipient, setRecipient] = useState("Nadia Buyer");
  const [phone, setPhone] = useState("081234567890");
  const [fullAddress, setFullAddress] = useState("Jl. Sudirman No. 7, Jakarta");
  const [message, setMessage] = useState("Address form ready.");

  return (
    <section className="mt-8 grid gap-4">
      <h2 className="text-2xl font-black">Delivery Address</h2>
      <form
        className="grid gap-4 md:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault();
          fetch("/api/buyer/addresses", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              label,
              recipient,
              phone,
              fullAddress,
              isDefault: addresses.length === 0,
            }),
          })
            .then((response) => response.json())
            .then((payload) => {
              if (payload.ok) {
                setAddresses((current) => [payload.data, ...current]);
                setMessage("Address saved.");
              } else {
                setMessage(payload.error);
              }
            })
            .catch(() => setMessage("Address save requires Buyer login."));
        }}
      >
        <Field label="Label">
          <TextInput value={label} onChange={(event) => setLabel(event.target.value)} />
        </Field>
        <Field label="Recipient">
          <TextInput
            value={recipient}
            onChange={(event) => setRecipient(event.target.value)}
          />
        </Field>
        <Field label="Phone">
          <TextInput value={phone} onChange={(event) => setPhone(event.target.value)} />
        </Field>
        <Field label="Full address">
          <TextInput
            value={fullAddress}
            onChange={(event) => setFullAddress(event.target.value)}
          />
        </Field>
        <div className="md:col-span-2">
          <Button icon={<MapPin size={18} />}>Save address</Button>
          <p className="mt-3 text-sm font-semibold text-[var(--market)]">
            {message}
          </p>
        </div>
      </form>
      <div className="grid gap-3">
        {addresses.map((address) => (
          <Card key={address.id} className="p-4">
            <p className="font-black">{address.label}</p>
            <p className="text-sm text-[var(--muted)]">{address.fullAddress}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}
