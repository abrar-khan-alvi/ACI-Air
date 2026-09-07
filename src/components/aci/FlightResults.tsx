import { useMemo, useState } from "react";
import {
  ArrowRight,
  Ban,
  Briefcase,
  CalendarClock,
  Check,
  ChevronDown,
  CircleAlert,
  Clock,
  Filter,
  Info,
  Loader2,
  Luggage,
  MapPin,
  Plane,
  Receipt,
  RotateCcw,
  ShieldCheck,
  Utensils,
  Wallet,
  X,
} from "lucide-react";
import type { Place } from "@/lib/airports";
import { buildFlightResults, paxTotal, type CabinClass, type Pax } from "@/lib/flight-results";
import { cn } from "@/lib/utils";
import {
  fareBreakdown,
  fareRulesFor,
  flightFacts,
  mealFor,
  money,
  type Fare,
} from "@/lib/fare-details";
import { BookingDrawer } from "./BookingDrawer";

type Props = {
  from: Place;
  to: Place;
  dates: string;
  pax: Pax;
  cabin: CabinClass;
  loading: boolean;
  legLabel?: string;
  sectionId?: string;
  onClose?: (() => void) | undefined;
};

type Sort = "cheapest" | "fastest" | "earliest";
type StopFilter = "any" | 0 | 1 | 2;

const timeSlots = [
  { id: "early", label: "00–06", from: 0, to: 360 },
  { id: "morning", label: "06–12", from: 360, to: 720 },
  { id: "afternoon", label: "12–18", from: 720, to: 1080 },
  { id: "evening", label: "18–24", from: 1080, to: 1440 },
] as const;

const sorts: { id: Sort; label: string }[] = [
  { id: "cheapest", label: "Cheapest" },
  { id: "fastest", label: "Fastest" },
  { id: "earliest", label: "Earliest" },
];

function AirlineLogo({ airline }: { airline: string }) {
  const initials = airline
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary to-teal font-display text-[13px] font-bold text-primary-foreground shadow-soft">
      {initials}
    </span>
  );
}

export function FlightResults({
  from,
  to,
  dates,
  pax,
  cabin,
  loading,
  legLabel,
  sectionId,
  onClose,
}: Props) {
  const all = useMemo(() => buildFlightResults(from, to, pax, cabin), [from, to, pax, cabin]);

  const minPrice = all[0]?.price ?? 0;
  const maxPrice = all.reduce((m, f) => Math.max(m, f.price), 0);

  const [sort, setSort] = useState<Sort>("cheapest");
  const [stops, setStops] = useState<StopFilter>("any");
  const [airlines, setAirlines] = useState<string[]>([]);
  const [slots, setSlots] = useState<string[]>([]);
  const [refundOnly, setRefundOnly] = useState(false);
  const [budget, setBudget] = useState(maxPrice);
  const [openMobile, setOpenMobile] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [detailTab, setDetailTab] = useState<"breakdown" | "rules">("breakdown");
  const [selected, setSelected] = useState<string | null>(null);
  const [booking, setBooking] = useState<Fare | null>(null);

  const airlineList = useMemo(() => {
    const map = new Map<string, number>();
    for (const f of all) map.set(f.airline, Math.min(map.get(f.airline) ?? Infinity, f.price));
    return [...map.entries()].sort((a, b) => a[1] - b[1]);
  }, [all]);

  const filtered = useMemo(() => {
    const out = all.filter((f) => {
      if (stops !== "any" && f.stops !== stops) return false;
      if (airlines.length && !airlines.includes(f.airline)) return false;
      if (refundOnly && !f.refundable) return false;
      if (f.price > budget) return false;
      if (slots.length) {
        const hit = timeSlots.some(
          (s) => slots.includes(s.id) && f.departMin >= s.from && f.departMin < s.to,
        );
        if (!hit) return false;
      }
      return true;
    });
    return out.sort((a, b) =>
      sort === "cheapest"
        ? a.price - b.price
        : sort === "fastest"
          ? a.durationMin - b.durationMin
          : a.departMin - b.departMin,
    );
  }, [all, stops, airlines, refundOnly, budget, slots, sort]);

  const activeCount =
    (stops !== "any" ? 1 : 0) +
    airlines.length +
    slots.length +
    (refundOnly ? 1 : 0) +
    (budget < maxPrice ? 1 : 0);

  const reset = () => {
    setStops("any");
    setAirlines([]);
    setSlots([]);
    setRefundOnly(false);
    setBudget(maxPrice);
  };

  const toggle = (list: string[], v: string, set: (x: string[]) => void) =>
    set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  const totalPax = paxTotal(pax);

  const filters = (
    <div className="grid gap-4">
      <div>
        <p className="mb-1.5 text-[9.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Stops
        </p>
        <div className="flex flex-wrap gap-1.5">
          {(
            [
              ["any", "Any"],
              [0, "Non-stop"],
              [1, "1 stop"],
              [2, "2+ stops"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={String(id)}
              onClick={() => setStops(id as StopFilter)}
              className={cn(
                "rounded-full border px-2.5 py-1 text-[11.5px] font-semibold transition-colors",
                stops === id
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-1.5 text-[9.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Departure time
        </p>
        <div className="flex flex-wrap gap-1.5">
          {timeSlots.map((s) => (
            <button
              key={s.id}
              onClick={() => toggle(slots, s.id, setSlots)}
              className={cn(
                "rounded-full border px-2.5 py-1 text-[11.5px] font-semibold transition-colors",
                slots.includes(s.id)
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <p className="text-[9.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Max price
          </p>
          <span className="font-display text-[12px] font-semibold">{money(budget)}</span>
        </div>
        <input
          type="range"
          min={minPrice}
          max={maxPrice}
          step={500}
          value={budget}
          onChange={(e) => setBudget(Number(e.target.value))}
          className="w-full accent-[var(--color-primary)]"
          aria-label="Maximum price"
        />
        <div className="flex justify-between text-[10.5px] text-muted-foreground">
          <span>{money(minPrice)}</span>
          <span>{money(maxPrice)}</span>
        </div>
      </div>

      <div>
        <p className="mb-1.5 text-[9.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Airlines
        </p>
        <div className="grid gap-1">
          {airlineList.map(([name, price]) => (
            <label
              key={name}
              className="flex cursor-pointer items-center gap-2 rounded-lg px-1 py-1 hover:bg-secondary/60"
            >
              <input
                type="checkbox"
                checked={airlines.includes(name)}
                onChange={() => toggle(airlines, name, setAirlines)}
                className="size-3.5 accent-[var(--color-primary)]"
              />
              <span className="flex-1 truncate text-[12.5px]">{name}</span>
              <span className="text-[11px] text-muted-foreground">{money(price)}</span>
            </label>
          ))}
        </div>
      </div>

      <label className="flex cursor-pointer items-center gap-2">
        <input
          type="checkbox"
          checked={refundOnly}
          onChange={(e) => setRefundOnly(e.target.checked)}
          className="size-3.5 accent-[var(--color-primary)]"
        />
        <span className="text-[12.5px]">Refundable fares only</span>
      </label>

      <button
        onClick={reset}
        className="flex items-center justify-center gap-1.5 rounded-lg border border-border py-2 text-[12px] font-semibold text-muted-foreground transition-colors hover:text-foreground"
      >
        <RotateCcw className="size-3.5" /> Reset filters
      </button>
    </div>
  );

  return (
    <section id={sectionId} className="scroll-mt-20">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <p className="text-[12px] font-medium text-muted-foreground">
          Showing <span className="font-semibold text-foreground">{filtered.length}</span> of{" "}
          {all.length} fares
        </p>
        {onClose ? (
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-[12px] font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="size-3.5" /> Clear search
          </button>
        ) : null}
      </div>

      <div className="mt-3 grid gap-4 lg:grid-cols-[236px_minmax(0,1fr)] lg:items-start">
        <aside className="surface-card sticky top-[68px] hidden rounded-xl p-3.5 lg:block">
          <p className="mb-3 flex items-center gap-1.5 font-display text-[13px] font-semibold">
            <Filter className="size-3.5 text-primary" /> Filters
            {activeCount ? (
              <span className="rounded-full bg-primary/10 px-1.5 text-[10.5px] font-semibold text-primary">
                {activeCount}
              </span>
            ) : null}
          </p>
          {filters}
        </aside>

        <div className="min-w-0">
          <div className="mb-2 flex items-center gap-2">
            <button
              onClick={() => setOpenMobile((v) => !v)}
              className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-[12px] font-semibold lg:hidden"
            >
              <Filter className="size-3.5" /> Filters{activeCount ? ` (${activeCount})` : ""}
            </button>
            <div className="inline-flex rounded-full bg-secondary/80 p-0.5">
              {sorts.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSort(s.id)}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors",
                    sort === s.id
                      ? "bg-card text-foreground shadow-soft"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {openMobile ? (
            <div className="surface-card mb-3 rounded-xl p-3.5 lg:hidden">{filters}</div>
          ) : null}

          {loading ? (
            <div className="grid gap-3">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-[214px] animate-pulse rounded-2xl border border-border/60 bg-secondary/50"
                />
              ))}
              <p className="flex items-center gap-2 text-[12px] text-muted-foreground">
                <Loader2 className="size-3.5 animate-spin" /> Searching live fares…
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="surface-card grid place-items-center gap-2 rounded-xl p-8 text-center">
              <p className="font-display text-[14px] font-semibold">No fares match these filters</p>
              <p className="text-[12px] text-muted-foreground">
                Try widening your price range or clearing stops.
              </p>
              <button
                onClick={reset}
                className="mt-1 rounded-lg bg-forest px-4 py-2 text-[12.5px] font-semibold text-primary-foreground"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <div className="grid gap-3">
              {filtered.map((f, i) => {
                const best = i === 0 && sort === "cheapest";
                const isOpen = expanded === f.id;
                const isSelected = selected === f.id;
                const facts = flightFacts(f);
                return (
                  <article
                    key={f.id}
                    className={cn(
                      "surface-card group relative overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-float hover:ring-1 hover:ring-primary/25",
                      best && !isSelected && "ring-1 ring-primary/30",
                      isSelected && "ring-2 ring-primary shadow-float -translate-y-0.5",
                    )}
                  >
                    {isSelected ? (
                      <span className="absolute inset-y-0 left-0 w-1 bg-forest" aria-hidden />
                    ) : null}
                    {best ? (
                      <span className="absolute right-0 top-0 rounded-bl-xl bg-forest px-3 py-1 font-display text-[10px] font-semibold uppercase tracking-[0.12em] text-primary-foreground">
                        Best value
                      </span>
                    ) : null}

                    <div className="grid gap-5 p-4 md:grid-cols-[minmax(0,1fr)_248px] md:gap-0 md:p-0">
                      <div className="min-w-0 md:p-5">
                        <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-3">
                            <AirlineLogo airline={f.airline} />
                            <span className="min-w-0">
                              <span className="block truncate font-display text-[15px] font-semibold">
                                {f.airline}
                              </span>
                              <span className="block truncate text-[12px] text-muted-foreground">
                                {f.code} · {f.cabin} · {facts.aircraft}
                              </span>
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="flex items-center gap-1 rounded-full bg-secondary/70 px-2 py-1 text-[10.5px] font-semibold text-muted-foreground">
                              <Clock className="size-3" /> {facts.onTime}% on-time
                            </span>
                            <span className="flex items-center gap-1 rounded-full bg-clay/15 px-2 py-1 text-[10.5px] font-semibold text-foreground/80">
                              <CircleAlert className="size-3" /> {facts.seatsLeft} seats left
                            </span>
                          </div>
                        </div>

                        <div className="mt-4 grid items-center gap-3 rounded-xl bg-secondary/35 p-3 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:gap-5 sm:p-4">
                          <div className="sm:text-left">
                            <p className="font-display text-[24px] font-semibold leading-none tracking-tight">
                              {f.depart}
                            </p>
                            <p className="mt-1.5 text-[12px] font-semibold">
                              {f.fromCode} · {from.city}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              Terminal {facts.terminalFrom} · {dates}
                            </p>
                          </div>

                          <div className="flex min-w-0 flex-1 flex-col">
                            <p className="mb-1 text-center text-[11px] font-semibold text-muted-foreground">
                              {f.duration} ·{" "}
                              {f.stops === 0
                                ? "Non-stop"
                                : `${f.stops} stop${f.stops > 1 ? "s" : ""}`}
                            </p>
                            <div className="relative flex items-center">
                              <span className="size-2 rounded-full bg-primary" />
                              {f.stops === 0 ? (
                                <span className="h-px flex-1 bg-gradient-to-r from-primary/50 via-primary/25 to-primary/50" />
                              ) : (
                                <>
                                  <span className="h-px flex-1 border-t border-dashed border-primary/50" />
                                  <span className="grid size-5 shrink-0 place-items-center rounded-full bg-card text-primary ring-1 ring-primary/25">
                                    <MapPin className="size-2.5" strokeWidth={2.2} />
                                  </span>
                                  {f.stops > 1 ? (
                                    <>
                                      <span className="h-px flex-1 border-t border-dashed border-primary/50" />
                                      <span className="grid size-5 shrink-0 place-items-center rounded-full bg-card text-primary ring-1 ring-primary/25">
                                        <MapPin className="size-2.5" strokeWidth={2.2} />
                                      </span>
                                    </>
                                  ) : null}
                                  <span className="h-px flex-1 border-t border-dashed border-primary/50" />
                                </>
                              )}
                              <span className="size-2 rounded-full bg-primary" />
                              <Plane
                                className="absolute left-1/2 size-4 -translate-x-1/2 bg-secondary/0 px-0.5 text-primary"
                                strokeWidth={1.8}
                              />
                            </div>
                            <p className="mt-1 text-center text-[11px] font-medium text-muted-foreground">
                              {f.via ? `via ${f.via}` : "Direct flight"}
                            </p>
                          </div>

                          <div className="sm:text-right">
                            <p className="font-display text-[24px] font-semibold leading-none tracking-tight">
                              {f.arrive}
                            </p>
                            <p className="mt-1.5 text-[12px] font-semibold">
                              {f.toCode} · {to.city}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              Terminal {facts.terminalTo} · same day
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <span className="flex items-center gap-1 rounded-full bg-secondary/80 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                            <Briefcase className="size-3" /> {f.baggage} checked
                          </span>
                          <span className="flex items-center gap-1 rounded-full bg-secondary/80 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                            <Luggage className="size-3" /> 7kg cabin
                          </span>
                          <span
                            className={cn(
                              "flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium",
                              f.refundable
                                ? "bg-primary/10 text-primary"
                                : "bg-secondary/80 text-muted-foreground",
                            )}
                          >
                            {f.refundable ? (
                              <ShieldCheck className="size-3" />
                            ) : (
                              <Ban className="size-3" />
                            )}
                            {f.refundable ? "Refundable" : "Saver fare"}
                          </span>
                          <span className="flex items-center gap-1 rounded-full bg-secondary/80 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                            <Utensils className="size-3" /> Meals included
                          </span>
                          {f.refundable ? (
                            <span className="flex items-center gap-1 rounded-full bg-gold/15 px-2.5 py-1 text-[11px] font-medium text-gold-foreground">
                              <CalendarClock className="size-3" /> Changes allowed
                            </span>
                          ) : null}
                        </div>
                      </div>

                      <div
                        className={cn(
                          "flex items-end justify-between gap-4 border-t border-border/70 pt-4 md:flex-col md:items-stretch md:justify-center md:gap-3 md:border-l md:border-t-0 md:bg-secondary/25 md:p-5",
                          best ? "md:pt-9" : "md:pt-5",
                        )}
                      >
                        <div className="text-left md:text-right">
                          <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                            Total fare
                          </p>
                          <p className="font-display text-[26px] font-bold leading-none tracking-tight text-foreground">
                            {money(f.price)}
                          </p>
                          <p className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[12px] font-semibold md:justify-end">
                            <span className="text-muted-foreground line-through">
                              {money(facts.listPrice)}
                            </span>
                            <span className="rounded-full bg-clay/15 px-2 py-0.5 text-[10.5px] font-semibold text-foreground/80">
                              Save {money(facts.saving)} ({facts.discountPct}%)
                            </span>
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {totalPax} passenger{totalPax > 1 ? "s" : ""} · incl. taxes
                          </p>
                        </div>
                        <div className="flex w-auto flex-col gap-2 md:w-full">
                          <button
                            onClick={() => {
                              setSelected(f.id);
                              setBooking(f);
                            }}
                            aria-haspopup="dialog"
                            className={cn(
                              "flex items-center justify-center gap-1.5 rounded-xl px-5 py-2.5 font-display text-[13px] font-semibold shadow-soft transition-all duration-300 hover:shadow-float active:scale-[0.98]",
                              isSelected
                                ? "bg-primary/10 text-primary ring-1 ring-primary"
                                : "bg-forest text-primary-foreground",
                            )}
                          >
                            {isSelected ? <Check className="size-3.5" /> : null}
                            Book Now
                            <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
                          </button>
                          <button
                            onClick={() => {
                              setDetailTab("breakdown");
                              setExpanded(isOpen ? null : f.id);
                            }}
                            aria-expanded={isOpen}
                            className={cn(
                              "flex items-center justify-center gap-1.5 rounded-xl border px-4 py-2 text-[12px] font-semibold transition-colors",
                              isOpen
                                ? "border-primary bg-primary/5 text-primary"
                                : "border-border bg-card text-muted-foreground hover:text-foreground",
                            )}
                          >
                            <Receipt className="size-3.5" /> {isOpen ? "Hide details" : "Details"}
                          </button>
                          <p className="hidden text-center text-[10.5px] text-muted-foreground md:block">
                            Free cancellation within 24h
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-border/70 px-4 md:px-5">
                      <div className="flex items-center gap-1 py-2">
                        <button
                          onClick={() => {
                            if (isOpen && detailTab === "rules") setDetailTab("breakdown");
                            else setExpanded(isOpen ? null : f.id);
                          }}
                          className={cn(
                            "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-semibold transition-colors",
                            isOpen && detailTab === "breakdown"
                              ? "bg-primary/10 text-primary"
                              : "text-muted-foreground hover:text-foreground",
                          )}
                        >
                          <Receipt className="size-3.5" /> Price breakdown
                        </button>
                        <button
                          onClick={() => {
                            if (isOpen && detailTab === "breakdown") setDetailTab("rules");
                            else {
                              setDetailTab("rules");
                              setExpanded(f.id);
                            }
                          }}
                          className={cn(
                            "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-semibold transition-colors",
                            isOpen && detailTab === "rules"
                              ? "bg-primary/10 text-primary"
                              : "text-muted-foreground hover:text-foreground",
                          )}
                        >
                          <CircleAlert className="size-3.5" /> Fare rules
                        </button>
                      </div>
                      <div
                        className={cn(
                          "grid transition-[grid-template-rows,opacity] duration-300 ease-out",
                          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                        )}
                      >
                        <div className="overflow-hidden">
                          {detailTab === "breakdown" ? (
                            <div className="grid gap-4 pb-4 md:grid-cols-2">
                              <div className="rounded-xl bg-secondary/60 p-3.5">
                                <p className="mb-2 text-[9.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                                  Price details
                                </p>
                                <div className="grid gap-1.5">
                                  {fareBreakdown(f, pax).map((r) => (
                                    <div
                                      key={r.label}
                                      className="flex items-baseline justify-between gap-3 text-[12.5px]"
                                    >
                                      <span className="text-muted-foreground">{r.label}</span>
                                      <span className="font-medium">{money(r.value)}</span>
                                    </div>
                                  ))}
                                  <div className="mt-1 flex items-baseline justify-between gap-3 border-t border-border/70 pt-2">
                                    <span className="text-[12.5px] font-semibold">
                                      Total payable
                                    </span>
                                    <span className="font-display text-[15px] font-bold">
                                      {money(f.price)}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="grid content-start gap-2.5">
                                <div className="flex items-start gap-2.5 rounded-xl bg-secondary/60 p-3">
                                  <Briefcase className="mt-0.5 size-4 shrink-0 text-primary" />
                                  <span className="text-[12.5px]">
                                    <span className="block font-semibold">Baggage</span>
                                    <span className="text-muted-foreground">
                                      Check-in {f.baggage} · Cabin 7kg · per passenger
                                    </span>
                                  </span>
                                </div>
                                <div className="flex items-start gap-2.5 rounded-xl bg-secondary/60 p-3">
                                  <Utensils className="mt-0.5 size-4 shrink-0 text-primary" />
                                  <span className="text-[12.5px]">
                                    <span className="block font-semibold">Meals</span>
                                    <span className="text-muted-foreground">
                                      {mealFor(f.cabin)}
                                    </span>
                                  </span>
                                </div>
                                <div className="flex items-start gap-2.5 rounded-xl bg-secondary/60 p-3">
                                  <Info className="mt-0.5 size-4 shrink-0 text-primary" />
                                  <span className="text-[12.5px]">
                                    <span className="block font-semibold">Booking class</span>
                                    <span className="text-muted-foreground">
                                      {f.cabin} · {f.code}
                                    </span>
                                  </span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="rounded-xl bg-secondary/60 p-3.5 pb-4">
                              <div className="mb-3 flex items-center gap-2">
                                <CircleAlert className="size-4 text-primary" />
                                <p className="text-[9.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                                  Fare rules
                                </p>
                              </div>
                              <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                                {(() => {
                                  const rules = fareRulesFor(f);
                                  return [
                                    { icon: f.refundable ? Wallet : Ban, ...rules.refund },
                                    { icon: CalendarClock, ...rules.change },
                                    { icon: Luggage, ...rules.carryOn },
                                    { icon: Briefcase, ...rules.checked },
                                    { icon: Plane, ...rules.noShow },
                                  ].map((r) => (
                                    <div
                                      key={r.label}
                                      className="flex items-start gap-2.5 rounded-lg bg-card/60 p-2.5"
                                    >
                                      <r.icon
                                        className="mt-0.5 size-4 shrink-0 text-primary"
                                        strokeWidth={1.9}
                                      />
                                      <span className="text-[12px]">
                                        <span className="block font-semibold">{r.label}</span>
                                        <span className="text-muted-foreground">{r.detail}</span>
                                      </span>
                                    </div>
                                  ));
                                })()}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <BookingDrawer
        itinerary={
          booking ? [{ fare: booking, from, to, dates, label: legLabel ?? "Review booking" }] : null
        }
        open={booking !== null}
        onClose={() => setBooking(null)}
        pax={pax}
        cabin={cabin}
      />
    </section>
  );
}
