import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-md border border-[var(--line)] bg-[var(--surface)] shadow-[0_12px_34px_rgba(17,24,39,0.07)]",
        className,
      )}
      {...props}
    />
  );
}
