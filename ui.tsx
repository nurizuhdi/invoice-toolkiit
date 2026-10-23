"use client";
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-lg text-sm font-medium transition disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        default: "bg-toolkiit text-white hover:bg-toolkiit-dark",
        outline: "border border-slate-300 bg-white hover:bg-slate-50",
        ghost: "hover:bg-slate-100",
        danger: "text-red-600 hover:bg-red-50",
      },
      size: { default: "h-10 px-4", sm: "h-8 px-3 text-xs", lg: "h-14 px-8 text-lg" },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, ...p }, ref) => (
  <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...p} />
));
Button.displayName = "Button";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...p }, ref) => (
  <input ref={ref} className={cn("h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-toolkiit focus:ring-2 focus:ring-toolkiit-light", className)} {...p} />
));
Input.displayName = "Input";

export const Textarea = (p: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea {...p} className={cn("w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-toolkiit focus:ring-2 focus:ring-toolkiit-light", p.className)} />
);

export const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="block space-y-1"><span className="text-xs font-medium text-slate-600">{label}</span>{children}</label>
);

export const Card = ({ title, children }: { title?: string; children: React.ReactNode }) => (
  <section className="rounded-2xl border bg-white p-4 shadow-sm sm:p-6">
    {title && <h2 className="mb-4 text-lg font-semibold">{title}</h2>}
    {children}
  </section>
);

export function Modal({ open, onClose, children, wide }: { open: boolean; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className={cn("max-h-[90vh] w-full overflow-auto rounded-2xl bg-white p-6 shadow-xl", wide ? "max-w-2xl" : "max-w-md")} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}
