"use client";

import { useState } from "react";
import { CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function AdminTimePanel() {
  const [currentTime, setCurrentTime] = useState<number | null>(null);
  const [message, setMessage] = useState("Simulate next day for overdue orders.");

  return (
    <Card className="grid gap-4 p-6">
      <div>
        <h2 className="font-display text-xl">Time machine</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Advance the clock to trigger overdue auto return/refund for the demo.
        </p>
      </div>
      <div className="rounded-xl border border-[var(--line)] bg-[var(--soft)]/40 p-4">
        <p className="text-sm text-[var(--muted)]">Current system time</p>
        <p className="mt-1 font-semibold">
          {currentTime ? new Date(currentTime).toLocaleString() : "Not simulated yet"}
        </p>
      </div>
      <Button
        type="button"
        icon={<CalendarClock size={18} />}
        onClick={() => {
          fetch("/api/admin/time", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ days: 1 }),
          })
            .then((response) => response.json())
            .then((payload) => {
              if (payload.ok) {
                setCurrentTime(payload.data.currentTime);
                setMessage("Advanced by one day.");
              } else {
                setMessage(payload.error);
              }
            })
            .catch(() => setMessage("Time simulation requires Admin login."));
        }}
      >
        Simulate next day
      </Button>
      <p className="text-sm font-semibold text-[var(--market)]">{message}</p>
    </Card>
  );
}
