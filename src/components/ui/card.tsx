import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-lg border border-[var(--line)] bg-[var(--surface)] shadow-[0_18px_60px_rgba(23,33,27,0.08)]",
        className,
      )}
      {...props}
    />
  );
}
