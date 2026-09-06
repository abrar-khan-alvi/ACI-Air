import { ArrowUpRight } from "lucide-react";

export function SectionHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: string;
}) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <div>
        <h2 className="font-display text-base font-bold sm:text-[17px]">{title}</h2>
        {subtitle ? <p className="mt-0.5 text-[12px] text-muted-foreground">{subtitle}</p> : null}
      </div>
      {action ? (
        <button className="hidden shrink-0 items-center gap-1 text-[12px] font-semibold text-primary transition hover:gap-1.5 sm:flex">
          {action} <ArrowUpRight className="size-3.5" />
        </button>
      ) : null}
    </div>
  );
}
