import { useEffect, useMemo, useRef, useState } from "react";
import { MapPin, Building2 } from "lucide-react";
import { searchDestinations, type HotelDestination } from "@/lib/hotels";
import { cn } from "@/lib/utils";

type Props = {
  label?: string;
  value: HotelDestination | null;
  onChange: (d: HotelDestination) => void;
};

export function DestinationField({ label = "Destination", value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => searchDestinations(query), [query]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const select = (d: HotelDestination) => {
    onChange(d);
    setQuery("");
    setOpen(false);
  };

  return (
    <div ref={boxRef} className="relative min-w-0">
      <div
        className={cn(
          "flex h-12 items-center gap-2 rounded-lg bg-secondary/70 px-3 transition-colors duration-200",
          open ? "bg-secondary ring-2 ring-primary/30" : "hover:bg-secondary",
        )}
      >
        <MapPin className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.9} />
        <div className="min-w-0 flex-1">
          <label className="block text-[9.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {label}
          </label>
          <input
            value={open ? query : value ? value.label : ""}
            placeholder="City, area or hotel"
            onFocus={() => {
              setOpen(true);
              setQuery("");
              setActive(0);
            }}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
              setActive(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setActive((i) => Math.min(i + 1, results.length - 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActive((i) => Math.max(i - 1, 0));
              } else if (e.key === "Enter") {
                const p = results[active];
                if (open && p) {
                  e.preventDefault();
                  select(p);
                }
              } else if (e.key === "Escape") setOpen(false);
            }}
            className="w-full truncate bg-transparent font-display text-[13px] font-semibold leading-tight outline-none placeholder:font-medium placeholder:text-muted-foreground/70"
          />
        </div>
      </div>

      {open ? (
        <div className="absolute left-0 right-0 top-full z-40 mt-1.5 min-w-[260px] overflow-hidden rounded-xl border border-border/70 bg-popover shadow-float">
          {results.length === 0 ? (
            <p className="px-3 py-3 text-[12.5px] text-muted-foreground">
              No stays match “{query}”
            </p>
          ) : (
            <ul className="max-h-72 overflow-y-auto py-1">
              {results.map((d, i) => (
                <li key={d.id}>
                  <button
                    type="button"
                    onMouseEnter={() => setActive(i)}
                    onClick={() => select(d)}
                    className={cn(
                      "flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors",
                      i === active ? "bg-secondary" : "hover:bg-secondary/60",
                    )}
                  >
                    <Building2 className="size-3.5 shrink-0 text-primary" strokeWidth={1.9} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-display text-[12.5px] font-semibold">
                        {d.city}, {d.country}
                      </span>
                      <span className="block truncate text-[11px] text-muted-foreground">
                        {d.area ?? "Popular stays"}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
