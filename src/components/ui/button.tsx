import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: ReactNode;
  variant?: ButtonVariant;
};

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--danger)] text-white shadow-[0_1px_2px_rgba(30,27,23,0.12)] hover:bg-[var(--danger-strong)] hover:shadow-[0_8px_20px_rgba(194,90,60,0.22)]",
  secondary:
    "border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] hover:border-[var(--danger)] hover:text-[var(--danger)]",
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
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-[0.625rem] px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-55",
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
