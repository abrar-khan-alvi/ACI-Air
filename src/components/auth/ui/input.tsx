import * as React from "react";

import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-2 text-sm text-slate-800 shadow-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aci-green-500 focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 hover:bg-white hover:border-slate-300 focus:bg-white aria-[invalid=true]:border-red-500 aria-[invalid=true]:focus-visible:ring-red-500/30 aria-[invalid=true]:bg-red-50/50",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
