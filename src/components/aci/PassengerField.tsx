import { useEffect, useRef, useState } from "react";
import { Users, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { cabinClasses, paxLabel, paxTotal, type CabinClass, type Pax } from "@/lib/flight-results";

type Props = {
  pax: Pax;
  cabin: CabinClass;
  onPax: (p: Pax) => void;
  onCabin: (c: CabinClass) => void;
};

const rows: { key: keyof Pax; label: string; hint: string; min: number }[] = [
  { key: "adults", label: "Adults", hint: "12+ years", min: 1 },
  { key: "children", label: "Children", hint: "2–11 years", min: 0 },
  { key: "infants", label: "Infants", hint: "Under 2, on lap", min: 0 },
];

export function PassengerField({ pax, cabin, onPax, onCabin }: Props) {
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const total = paxTotal(pax);
  const set = (key: keyof Pax, delta: number) => {
    const row = rows.find((r) => r.key === key)!;
    const next = { ...pax, [key]: Math.max(row.min, Math.min(9, pax[key] + delta)) };
    if (next.infants > next.adults) next.infants = next.adults;
    if (next.adults + next.children > 9) return;
    onPax(next);
  };

  return (
    <div ref={boxRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-1.5 rounded-full bg-secondary/80 px-3 py-1.5 text-[12px] font-semibold transition-colors",
          open ? "ring-2 ring-primary/30" : "hover:bg-secondary",
        )}
      >
        <Users className="size-3.5 text-muted-foreground" />
        {total} {total > 1 ? "travellers" : "traveller"} · {cabin}
        <ChevronDown
          className={cn(
            "size-3.5 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open ? (
        <div className="absolute left-0 top-[calc(100%+6px)] z-40 w-[290px] rounded-xl border border-border bg-card p-3 shadow-float">
          {rows.map((r) => (
            <div key={r.key} className="flex items-center justify-between py-1.5">
              <span>
                <span className="block text-[13px] font-semibold">{r.label}</span>
                <span className="block text-[11px] text-muted-foreground">{r.hint}</span>
              </span>
              <span className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label={`Remove ${r.label}`}
                  onClick={() => set(r.key, -1)}
                  disabled={pax[r.key] <= r.min}
                  className="grid size-7 place-items-center rounded-full border border-border text-foreground disabled:opacity-35"
                >
                  −
                </button>
                <span className="w-5 text-center text-[13px] font-semibold">{pax[r.key]}</span>
                <button
                  type="button"
                  aria-label={`Add ${r.label}`}
                  onClick={() => set(r.key, 1)}
                  disabled={
                    (r.key === "infants" && pax.infants >= pax.adults) ||
                    (r.key !== "infants" && pax.adults + pax.children >= 9)
                  }
                  className="grid size-7 place-items-center rounded-full border border-border text-foreground disabled:opacity-35"
                >
                  +
                </button>
              </span>
            </div>
          ))}

          <div className="mt-2 border-t border-border pt-2">
            <p className="mb-1 text-[9.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Cabin class
            </p>
            <div className="grid grid-cols-2 gap-1">
              {cabinClasses.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => onCabin(c)}
                  className={cn(
                    "flex items-center justify-between rounded-lg px-2.5 py-1.5 text-[12px] font-medium transition-colors",
                    cabin === c
                      ? "bg-secondary font-semibold text-foreground"
                      : "text-muted-foreground hover:bg-secondary/60",
                  )}
                >
                  {c}
                  {cabin === c ? <Check className="size-3 text-primary" /> : null}
                </button>
              ))}
            </div>
          </div>

          <p className="mt-2 text-[11px] text-muted-foreground">{paxLabel(pax)}</p>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="mt-2 w-full rounded-lg bg-forest py-2 font-display text-[12.5px] font-semibold text-primary-foreground"
          >
            Done
          </button>
        </div>
      ) : null}
    </div>
  );
}
