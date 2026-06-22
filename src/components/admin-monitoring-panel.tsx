"use client";

import { useState } from "react";
import { Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type Monitoring = Record<string, number>;

export function AdminMonitoringPanel() {
  const [monitoring, setMonitoring] = useState<Monitoring | null>(null);
  const [message, setMessage] = useState("Monitoring data supports the final demo.");

  return (
    <section className="grid gap-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-2xl font-black">Marketplace Monitoring</h2>
        <Button
          type="button"
          variant="secondary"
          icon={<Activity size={18} />}
          onClick={() => {
            fetch("/api/admin/monitoring")
              .then((response) => response.json())
              .then((payload) => {
                if (payload.ok) {
                  setMonitoring(payload.data);
                  setMessage("Monitoring loaded.");
                } else {
                  setMessage(payload.error);
                }
              })
              .catch(() => setMessage("Monitoring requires Admin login."));
          }}
        >
          Refresh
        </Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {monitoring
          ? Object.entries(monitoring)
              .filter(([key]) => key !== "currentTime")
              .map(([key, value]) => (
                <Card key={key} className="p-4">
                  <p className="text-sm font-bold capitalize text-[var(--muted)]">
                    {key.replace(/([A-Z])/g, " $1")}
                  </p>
                  <p className="mt-2 text-3xl font-black text-[var(--market)]">
                    {value}
                  </p>
                </Card>
              ))
          : null}
      </div>
      <p className="text-sm font-semibold text-[var(--market)]">{message}</p>
    </section>
  );
}
