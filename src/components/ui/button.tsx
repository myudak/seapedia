import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: ReactNode;
  variant?: ButtonVariant;
};

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--danger)] text-white shadow-[0_12px_30px_rgba(229,37,37,0.20)] hover:bg-[#c91f1f]",
  secondary:
    "border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] hover:border-[var(--danger)]",
  ghost: "text-[var(--muted)] hover:bg-black/5 hover:text-[var(--ink)]",
  danger: "bg-[var(--ink)] text-white hover:bg-black",
};

export function Button({
  className,
  icon,
  children,
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-55",
        variants[variant],
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
