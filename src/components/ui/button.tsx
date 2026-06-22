import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: ReactNode;
  variant?: ButtonVariant;
};

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--market)] text-white shadow-[0_10px_24px_rgba(13,107,87,0.20)] hover:bg-[#095744]",
  secondary:
    "border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] hover:border-[var(--market)]",
  ghost: "text-[var(--muted)] hover:bg-black/5 hover:text-[var(--ink)]",
  danger: "bg-[var(--coral)] text-white hover:bg-[#c9472b]",
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
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-55",
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
