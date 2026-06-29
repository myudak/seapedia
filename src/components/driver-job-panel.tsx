"use client";

import { useCallback, useEffect, useState } from "react";
import { Bike, RefreshCw, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { OrderStatusBadge } from "@/components/ui/order-status-badge";
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
  activeJob: JobRow | null;
  earnings: number;
  history: Array<{ id: string; earning: number }>;
};

export function DriverJobPanel() {
  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [history, setHistory] = useState<DriverHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const loadJobs = useCallback(() => {
    fetch("/api/driver/jobs")
      .then((response) => response.json())
      .then((payload) => {
        if (payload.ok) {
          setJobs(payload.data);
          setMessage(
            payload.data.length === 0
              ? "No jobs available. Jobs appear after a seller processes an order."
              : null,
          );
        } else {
          setMessage(payload.error);
        }
      })
      .catch(() => setMessage("Job list requires Driver login."))
      .finally(() => setLoading(false));
  }, []);

  const loadHistory = useCallback(() => {
    fetch("/api/driver/history")
      .then((response) => response.json())
      .then((payload) => {
        if (payload.ok) setHistory(payload.data);
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    loadJobs();
    loadHistory();
  }, [loadJobs, loadHistory]);

  function takeJob(job: JobRow) {
    fetch(`/api/driver/jobs/${job.id}/take`, { method: "POST" })
      .then((response) => response.json())
      .then((payload) => {
        if (payload.ok) {
          setJobs((current) => current.filter((item) => item.id !== job.id));
          setMessage("Job taken. Order moved to Sedang Dikirim.");
          loadHistory();
        } else {
          setMessage(payload.error);
        }
      })
      .catch(() => setMessage("Taking a job requires Driver login."));
  }

  function completeJob(job: JobRow) {
    fetch(`/api/driver/jobs/${job.id}/complete`, { method: "POST" })
      .then((response) => response.json())
      .then((payload) => {
        if (payload.ok) {
          setMessage("Delivery completed and earnings recorded.");
          loadHistory();
          loadJobs();
        } else {
          setMessage(payload.error);
        }
      })
      .catch(() => setMessage("Completing a job requires Driver login."));
  }

  return (
    <Card className="grid gap-4 p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl">Available jobs</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Take a delivery to move it into transit. Earn 80% of the delivery fee
            on completion.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setLoading(true);
            loadJobs();
          }}
          className="inline-flex min-h-10 items-center gap-2 rounded-[0.625rem] border border-[var(--line)] bg-white px-3.5 text-sm font-semibold transition hover:border-[var(--ink)]"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {history ? (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-[var(--line)] bg-[var(--soft)]/40 p-4">
          <span className="flex items-center gap-2.5 text-sm font-medium">
            <span className="grid size-9 place-items-center rounded-full bg-white text-[var(--market)]">
              <Wallet size={16} />
            </span>
            Completed earnings
          </span>
          <span className="font-display text-xl text-[var(--market)]">
            {formatRupiah(history.earnings)}
          </span>
        </div>
      ) : null}

      {history?.activeJob ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--market)] bg-[rgba(31,111,106,0.06)] p-4">
          <div>
            <p className="text-xs font-semibold uppercase text-[var(--market)]">Active delivery</p>
            <p className="mt-1 font-semibold">{history.activeJob.order?.storeName ?? "Order in transit"}</p>
          </div>
          <Button type="button" icon={<Bike size={17} />} onClick={() => completeJob(history.activeJob!)}>
            Complete delivery
          </Button>
        </div>
      ) : null}

      {jobs.length === 0 ? (
        <div className="grid place-items-center gap-2 rounded-xl border border-dashed border-[var(--line)] px-4 py-8 text-center">
          <Bike size={24} className="text-[var(--muted)]" />
          <p className="text-sm text-[var(--muted)]">
            {message ?? "No jobs available right now."}
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--line)] bg-[var(--soft)]/40 p-4"
            >
              <div>
                <p className="font-semibold">{job.order?.storeName ?? "Order"}</p>
                <div className="mt-1 flex items-center gap-2">
                  {job.order ? (
                    <OrderStatusBadge status={job.order.status} />
                  ) : null}
                  <span className="text-sm text-[var(--muted)]">
                    {formatRupiah(job.order?.total ?? 0)}
                  </span>
                </div>
              </div>
              <Button
                type="button"
                icon={<Bike size={17} />}
                onClick={() => takeJob(job)}
              >
                Take job
              </Button>
            </div>
          ))}
        </div>
      )}

      {message && jobs.length > 0 ? (
        <p className="text-sm font-semibold text-[var(--market)]">{message}</p>
      ) : null}
    </Card>
  );
}
