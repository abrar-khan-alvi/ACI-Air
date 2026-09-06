import { useEffect, useRef, useState } from "react";
import { Users, ChevronDown, Minus, Plus } from "lucide-react";
import { guestLabel, type Guests } from "@/lib/hotels";
import { cn } from "@/lib/utils";

const rows: { key: keyof Guests; label: string; hint: string; min: number; max: number }[] = [
  { key: "rooms", label: "Rooms", hint: "Max 6 rooms", min: 1, max: 6 },
  { key: "adults", label: "Adults", hint: "18+ years", min: 1, max: 12 },
  { key: "children", label: "Children", hint: "0–17 years", min: 0, max: 8 },
];

export function GuestField({
  guests,
  onChange,
}: {
  guests: Guests;
  onChange: (g: Guests) => void;
}) {
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

  const set = (key: keyof Guests, delta: number) => {
    const row = rows.find((r) => r.key === key)!;
    const next: Guests = {
      ...guests,
      [key]: Math.max(row.min, Math.min(row.max, guests[key] + delta)),
    };
    if (next.adults < next.rooms) next.adults = next.rooms;
    onChange(next);
  };

  return (
    <div ref={boxRef} className="relative min-w-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex h-12 w-full items-center gap-2 rounded-lg bg-secondary/70 px-3 text-left transition-colors duration-200",
          open ? "bg-secondary ring-2 ring-primary/30" : "hover:bg-secondary",
        )}
      >
        <Users className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.9} />
        <span className="min-w-0 flex-1">
          <span className="block text-[9.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Rooms & guests
          </span>
          <span className="block truncate font-display text-[13px] font-semibold leading-tight">
            {guestLabel(guests)}
          </span>
        </span>
        <ChevronDown
          className={cn(
            "size-3.5 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open ? (
        <div className="absolute right-0 top-full z-40 mt-1.5 w-[260px] rounded-xl border border-border/70 bg-popover p-2 shadow-float">
          {rows.map((r) => (
            <div
              key={r.key}
              className="flex items-center justify-between rounded-lg px-2 py-2 hover:bg-secondary/50"
            >
              <span>
                <span className="block font-display text-[12.5px] font-semibold">{r.label}</span>
                <span className="block text-[10.5px] text-muted-foreground">{r.hint}</span>
              </span>
              <span className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label={`Remove ${r.label}`}
                  onClick={() => set(r.key, -1)}
                  disabled={guests[r.key] <= r.min}
                  className="grid size-7 place-items-center rounded-full border border-border text-foreground transition hover:border-primary/50 disabled:opacity-30"
                >
                  <Minus className="size-3" />
                </button>
                <span className="w-5 text-center font-display text-[13px] font-semibold">
                  {guests[r.key]}
                </span>
                <button
                  type="button"
                  aria-label={`Add ${r.label}`}
                  onClick={() => set(r.key, 1)}
                  disabled={guests[r.key] >= r.max}
                  className="grid size-7 place-items-center rounded-full border border-border text-foreground transition hover:border-primary/50 disabled:opacity-30"
                >
                  <Plus className="size-3" />
                </button>
              </span>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="mt-1 w-full rounded-lg bg-forest py-2 font-display text-[12.5px] font-semibold text-primary-foreground"
          >
            Done
          </button>
        </div>
      ) : null}
    </div>
  );
}
