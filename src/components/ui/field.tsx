import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type FieldProps = {
  label: string;
  hint?: string;
  children: ReactNode;
};

export function Field({ label, hint, children }: FieldProps) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-[var(--ink)]">
      <span>{label}</span>
      {children}
      {hint ? <span className="text-xs text-[var(--muted)]">{hint}</span> : null}
    </label>
  );
}

export function TextInput({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "min-h-11 rounded-[0.625rem] border border-[var(--line)] bg-white px-3.5 text-sm outline-none transition focus:border-[var(--danger)] focus:ring-4 focus:ring-[rgba(194,90,60,0.14)]",
        className,
      )}
      {...props}
    />
  );
}

export function SelectInput({
  className,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "min-h-11 rounded-[0.625rem] border border-[var(--line)] bg-white px-3.5 text-sm outline-none transition focus:border-[var(--danger)] focus:ring-4 focus:ring-[rgba(194,90,60,0.14)]",
        className,
      )}
      {...props}
    />
  );
}
