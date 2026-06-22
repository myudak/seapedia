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

type DriverHistory = {
  earnings: number;
  history: Array<{ id: string; earning: number }>;
};

export function DriverJobPanel() {
  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [history, setHistory] = useState<DriverHistory | null>(null);
  const [message, setMessage] = useState("Jobs appear after seller processing.");

  function takeJob(job: JobRow) {
    fetch(`/api/driver/jobs/${job.id}/take`, { method: "POST" })
      .then((response) => response.json())
      .then((payload) => {
        if (payload.ok) {
          setJobs((current) => current.filter((item) => item.id !== job.id));
          setMessage("Job taken. Order moved to Sedang Dikirim.");
        } else {
          setMessage(payload.error);
        }
      })
      .catch(() => setMessage("Taking a job requires Driver login."));
  }

  function loadHistory() {
    fetch("/api/driver/history")
      .then((response) => response.json())
      .then((payload) => {
        if (payload.ok) {
          setHistory(payload.data);
          setMessage("Driver history loaded.");
        } else {
          setMessage(payload.error);
        }
      })
      .catch(() => setMessage("Driver history requires Driver login."));
  }

  return (
    <section className="grid gap-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-2xl font-black">Available Jobs</h2>
        <div className="flex flex-wrap gap-2">
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
          <Button type="button" variant="ghost" onClick={loadHistory}>
            History
          </Button>
        </div>
      </div>
      <div className="grid gap-3">
        {jobs.map((job) => (
          <Card key={job.id} className="p-4">
            <p className="font-black">{job.order?.storeName ?? "Order"}</p>
            <p className="text-sm text-[var(--muted)]">
              {job.order?.status} - {formatRupiah(job.order?.total ?? 0)}
            </p>
            <Button
              type="button"
              className="mt-3"
              variant="secondary"
              onClick={() => takeJob(job)}
            >
              Take job
            </Button>
          </Card>
        ))}
      </div>
      {history ? (
        <Card className="p-4">
          <p className="text-sm text-[var(--muted)]">Completed earnings</p>
          <p className="text-2xl font-black text-[var(--market)]">
            {formatRupiah(history.earnings)}
          </p>
        </Card>
      ) : null}
      <p className="text-sm font-semibold text-[var(--market)]">{message}</p>
    </section>
  );
}
