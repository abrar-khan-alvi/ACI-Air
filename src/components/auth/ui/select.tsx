import * as React from "react";

import { cn } from "@/lib/utils";

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <select
        className={cn(
          "flex h-12 w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-2 text-sm text-slate-800 shadow-sm ring-offset-background placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aci-green-500 focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 hover:bg-white hover:border-slate-300 focus:bg-white aria-[invalid=true]:border-red-500 aria-[invalid=true]:focus-visible:ring-red-500/30 aria-[invalid=true]:bg-red-50/50 appearance-none",
          className,
        )}
        ref={ref}
        {...props}
      >
        {children}
      </select>
    );
  },
);
Select.displayName = "Select";

export { Select };
