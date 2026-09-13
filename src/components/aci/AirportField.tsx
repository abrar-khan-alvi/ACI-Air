"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Building2, MapPin, Plane } from "lucide-react";
import { searchPlaces, type Place } from "@/lib/airports";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  icon?: typeof Plane;
  value: Place | null;
  exclude?: string | undefined;
  placeholder?: string | undefined;
  compact?: boolean;
  panel?: boolean;
  onChange: (p: Place) => void;
};

export function placeLabel(p: Place) {
  return p.isCity ? `${p.city} (All airports)` : `${p.city} (${p.code})`;
}

export function AirportField({
  label,
  icon: Icon = MapPin,
  value,
  exclude,
  placeholder,
  panel = false,
  onChange,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => searchPlaces(query, exclude), [query, exclude]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const select = (p: Place) => {
    onChange(p);
    setQuery("");
    setOpen(false);
  };

  return (
    <div ref={boxRef} className="relative min-w-0">
      <div
        className={cn(
          "flex items-center gap-2 px-3 transition-colors duration-200",
          panel ? "h-16 bg-card" : "h-12 rounded-lg bg-secondary/70",
          open
            ? panel
              ? "bg-secondary/45 ring-2 ring-inset ring-clay/35"
              : "bg-secondary ring-2 ring-primary/30"
            : panel
              ? "hover:bg-secondary/35"
              : "hover:bg-secondary",
        )}
      >
        <Icon className={cn("size-4 shrink-0", panel ? "text-clay" : "text-muted-foreground")} strokeWidth={1.9} />
        <div className="min-w-0 flex-1">
          <label className={cn("block font-semibold text-muted-foreground", panel ? "text-[10px]" : "text-[9.5px] uppercase tracking-[0.14em]")}>
            {label}
          </label>
          <input
            value={open ? query : value ? placeLabel(value) : ""}
            placeholder={placeholder ?? "City or airport"}
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
                const pick = results[active];
                if (open && pick) {
                  e.preventDefault();
                  select(pick);
                }
              } else if (e.key === "Escape") {
                setOpen(false);
              }
            }}
            className={cn(
              "w-full truncate bg-transparent font-display font-semibold leading-tight text-foreground outline-none placeholder:font-medium placeholder:text-muted-foreground/70",
              panel ? "mt-0.5 text-[14px]" : "text-[13px]",
            )}
          />
        </div>
      </div>

      {open ? (
        <div className="absolute left-0 right-0 top-full z-40 mt-1.5 min-w-[260px] overflow-hidden rounded-xl border border-border/70 bg-popover shadow-float">
          {results.length === 0 ? (
            <p className="px-3 py-3 text-[12.5px] text-muted-foreground">No airports match “{query}”</p>
          ) : (
            <ul className="max-h-72 overflow-y-auto py-1">
              {results.map((p, i) => (
                <li key={`${p.code}-${p.isCity ? "city" : "ap"}`}>
                  <button
                    type="button"
                    onMouseEnter={() => setActive(i)}
                    onClick={() => select(p)}
                    className={cn(
                      "flex w-full items-center gap-2.5 py-2 pr-3 text-left transition-colors",
                      p.isCity ? "pl-3" : "pl-6",
                      i === active ? "bg-secondary" : "hover:bg-secondary/60",
                    )}
                  >
                    {p.isCity ? (
                      <Building2 className="size-3.5 shrink-0 text-foreground" strokeWidth={1.9} />
                    ) : (
                      <Plane className="size-3.5 shrink-0 text-primary" strokeWidth={1.9} />
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-display text-[12.5px] font-semibold">
                        {p.isCity ? `${p.city}, ${p.country} — all airports` : p.name}
                      </span>
                      <span className="block truncate text-[11px] text-muted-foreground">
                        {p.isCity ? p.codes.join(" · ") : `${p.city}, ${p.country}`}
                      </span>
                    </span>
                    {!p.isCity ? (
                      <span className="shrink-0 rounded-md bg-secondary px-1.5 py-0.5 text-[10.5px] font-semibold tracking-wide text-muted-foreground">
                        {p.code}
                      </span>
                    ) : null}
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
