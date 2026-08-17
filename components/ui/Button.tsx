"use client";

import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "md" | "lg" | "icon";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-anthracite-900 text-cream-50 hover:bg-anthracite-800 active:bg-anthracite-700",
  secondary:
    "bg-transparent text-anthracite-900 border border-anthracite-900/25 hover:border-anthracite-900/50 hover:bg-anthracite-900/5",
  ghost:
    "bg-cream-50/80 text-anthracite-900 hover:bg-cream-100 border border-transparent",
};

const sizeClasses: Record<ButtonSize, string> = {
  md: "h-11 px-6 text-sm",
  lg: "h-14 px-9 text-base",
  icon: "h-11 w-11 min-w-11 justify-center",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={clsx(
          "inline-flex items-center gap-2 rounded-full font-sans font-medium tracking-wide transition-colors duration-200 ease-out disabled:opacity-40 disabled:pointer-events-none",
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";
