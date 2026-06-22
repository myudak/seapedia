"use client";

import { useState } from "react";
import { Bike } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatRupiah } from "@/lib/seed/public-products";

type JobRow = {
  id: string;
  status: string;
  order?: {
    id: string;
    storeName: string;
    total: number;
    status: string;
  };
};

export function DriverJobPanel() {
  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [message, setMessage] = useState("Jobs appear after seller processing.");

  return (
    <section className="grid gap-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-2xl font-black">Available Jobs</h2>
        <Button
          type="button"
          variant="secondary"
          icon={<Bike size={18} />}
          onClick={() => {
            fetch("/api/driver/jobs")
              .then((response) => response.json())
              .then((payload) => {
                if (payload.ok) {
                  setJobs(payload.data);
                  setMessage("Driver jobs loaded.");
                } else {
                  setMessage(payload.error);
                }
              })
              .catch(() => setMessage("Job list requires Driver login."));
          }}
        >
          Find jobs
        </Button>
      </div>
      <div className="grid gap-3">
        {jobs.map((job) => (
          <Card key={job.id} className="p-4">
            <p className="font-black">{job.order?.storeName ?? "Order"}</p>
            <p className="text-sm text-[var(--muted)]">
              {job.order?.status} - {formatRupiah(job.order?.total ?? 0)}
            </p>
          </Card>
        ))}
      </div>
      <p className="text-sm font-semibold text-[var(--market)]">{message}</p>
    </section>
  );
}
