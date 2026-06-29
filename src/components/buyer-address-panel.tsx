"use client";

import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, TextInput } from "@/components/ui/field";
import { MapPicker, type AddressValue } from "@/components/location/map-picker";

type AddressRow = {
  id: string;
  label: string;
  recipient: string;
  phone: string;
  fullAddress: string;
  lat?: number;
  lng?: number;
  isDefault: boolean;
};

export function BuyerAddressPanel() {
  const [addresses, setAddresses] = useState<AddressRow[]>([]);
  const [label, setLabel] = useState("Office");
  const [recipient, setRecipient] = useState("Nadia Buyer");
  const [phone, setPhone] = useState("081234567890");
  const [address, setAddress] = useState<AddressValue>({
    fullAddress: "Jl. Sudirman No. 7, Jakarta",
  });
  const [message, setMessage] = useState("Loading addresses...");

  useEffect(() => {
    fetch("/api/buyer/addresses")
      .then((response) => response.json())
      .then((payload) => {
        if (!payload.ok) throw new Error(payload.error);
        setAddresses(payload.data);
        setMessage(`${payload.data.length} addresses loaded.`);
      })
      .catch(() => setMessage("Buyer addresses are unavailable."));
  }, []);

  return (
    <Card className="grid gap-4 p-6">
      <h2 className="font-display text-xl">Delivery address</h2>
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
              fullAddress: address.fullAddress,
              lat: address.lat,
              lng: address.lng,
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
        <div className="md:col-span-2">
          <MapPicker value={address} onChange={setAddress} />
        </div>
        <div className="md:col-span-2">
          <Button icon={<MapPin size={18} />}>Save address</Button>
          <p className="mt-3 text-sm font-semibold text-[var(--market)]">
            {message}
          </p>
        </div>
      </form>
      <div className="grid gap-3">
        {addresses.map((address) => (
          <div
            key={address.id}
            className="rounded-xl border border-[var(--line)] bg-[var(--soft)]/40 p-4"
          >
            <div className="flex items-center gap-2">
              <p className="font-semibold">{address.label}</p>
              {address.isDefault ? (
                <span className="rounded-full bg-[rgba(31,111,106,0.12)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--market)]">
                  Default
                </span>
              ) : null}
            </div>
            <p className="text-sm text-[var(--muted)]">{address.fullAddress}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
