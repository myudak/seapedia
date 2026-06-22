import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded-sm border border-[var(--line)] bg-white px-2.5 py-1 text-xs font-black uppercase text-[var(--muted)]",
        className,
      )}
      {...props}
    />
  );
}
