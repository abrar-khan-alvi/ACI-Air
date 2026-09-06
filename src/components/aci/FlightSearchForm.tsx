import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeftRight, CalendarDays, Plane, Plus, Search, X } from "lucide-react";
import { placeByCode, type Place } from "@/lib/airports";
import { cn } from "@/lib/utils";
import type { CabinClass, Pax } from "@/lib/flight-results";
import { encodeLegs, type TripType } from "@/lib/search-params";
import { AirportField } from "./AirportField";
import { PassengerField } from "./PassengerField";

export type Segment = { from: Place | null; to: Place | null; date: string };

const tripTypes: { id: TripType; label: string }[] = [
  { id: "oneway", label: "One way" },
  { id: "round", label: "Round trip" },
  { id: "multi", label: "Multi-city" },
];

export function iso(daysFromNow: number) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().slice(0, 10);
}

export function defaultSegments(): Segment[] {
  return [{ from: placeByCode("DAC") ?? null, to: placeByCode("SIN") ?? null, date: iso(7) }];
}

function DateField({
  label,
  value,
  min,
  onChange,
}: {
  label: string;
  value: string;
  min?: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex h-12 w-full cursor-pointer items-center gap-2 rounded-lg bg-secondary/70 px-3 transition-colors duration-200 hover:bg-secondary">
      <CalendarDays className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.9} />
      <span className="min-w-0 flex-1">
        <span className="block text-[9.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </span>
        <input
          type="date"
          value={value}
          min={min}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent font-display text-[13px] font-semibold leading-tight outline-none"
        />
      </span>
    </label>
  );
}

type Props = {
  initialTrip?: TripType;
  initialSegments?: Segment[];
  initialReturnDate?: string;
  initialPax?: Pax;
  initialCabin?: CabinClass;
  compact?: boolean;
};

export function FlightSearchForm({
  initialTrip = "round",
  initialSegments,
  initialReturnDate,
  initialPax,
  initialCabin = "Economy",
  compact = false,
}: Props) {
  const navigate = useNavigate();
  const [trip, setTrip] = useState<TripType>(initialTrip);
  const [segments, setSegments] = useState<Segment[]>(initialSegments ?? defaultSegments());
  const [returnDate, setReturnDate] = useState(initialReturnDate ?? iso(14));
  const [pax, setPax] = useState<Pax>(initialPax ?? { adults: 1, children: 0, infants: 0 });
  const [cabin, setCabin] = useState<CabinClass>(initialCabin);
  const [error, setError] = useState<string | null>(null);

  const setSeg = (i: number, patch: Partial<Segment>) =>
    setSegments((prev) => prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));

  const addSegment = () =>
    setSegments((prev) => {
      const last = prev[prev.length - 1];
      return [...prev, { from: last?.to ?? null, to: null, date: last?.date ?? iso(10) }];
    });

  const removeSegment = (i: number) => setSegments((prev) => prev.filter((_, idx) => idx !== i));

  const swap = (i: number) =>
    setSegments((prev) => prev.map((s, idx) => (idx === i ? { ...s, from: s.to, to: s.from } : s)));

  const activeSegments = trip === "multi" ? segments : segments.slice(0, 1);

  const submit = () => {
    for (const [i, s] of activeSegments.entries()) {
      if (!s.from || !s.to)
        return setError(`Select departure and destination for flight ${i + 1}.`);
      if (s.from.code === s.to.code)
        return setError(`Flight ${i + 1}: departure and destination must be different.`);
      if (!s.date) return setError(`Pick a date for flight ${i + 1}.`);
    }
    const first = activeSegments[0]!;
    if (trip === "round" && (!returnDate || returnDate < first.date))
      return setError("Return date must be on or after the departure date.");
    setError(null);

    const legs =
      trip === "round"
        ? [
            { from: first.from!, to: first.to!, date: first.date },
            { from: first.to!, to: first.from!, date: returnDate },
          ]
        : activeSegments.map((s) => ({ from: s.from!, to: s.to!, date: s.date }));

    void navigate({
      to: "/search",
      search: {
        trip,
        legs: encodeLegs(legs),
        adults: pax.adults,
        children: pax.children,
        infants: pax.infants,
        cabin,
      },
    });
  };

  return (
    <div className={cn(compact ? "p-3 sm:p-3.5" : "p-4 sm:px-5")}>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="inline-flex rounded-full bg-secondary/80 p-0.5">
          {tripTypes.map((t) => (
            <button
              key={t.id}
              onClick={() => setTrip(t.id)}
              className={cn(
                "rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors duration-200",
                trip === t.id
                  ? "bg-card text-foreground shadow-soft"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        <PassengerField pax={pax} cabin={cabin} onPax={setPax} onCabin={setCabin} />
      </div>

      <div className="flex flex-col gap-2">
        {activeSegments.map((seg, i) => (
          <div key={i} className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div
              className={cn(
                "grid flex-1 grid-cols-1 gap-2 sm:grid-cols-2",
                trip === "round" ? "lg:grid-cols-4" : "lg:grid-cols-3",
              )}
            >
              <div className="relative min-w-0">
                <AirportField
                  label={trip === "multi" ? `Flight ${i + 1} · From` : "From"}
                  icon={Plane}
                  value={seg.from}
                  exclude={seg.to?.isCity ? undefined : seg.to?.code}
                  onChange={(p) => setSeg(i, { from: p })}
                />
                <button
                  type="button"
                  onClick={() => swap(i)}
                  aria-label="Swap airports"
                  className="absolute -right-2 top-9 z-20 hidden size-6 place-items-center rounded-full border border-border bg-card text-primary shadow-soft transition duration-500 hover:rotate-180 lg:grid"
                >
                  <ArrowLeftRight className="size-3" />
                </button>
              </div>
              <AirportField
                label="To"
                value={seg.to}
                exclude={seg.from?.isCity ? undefined : seg.from?.code}
                onChange={(p) => setSeg(i, { to: p })}
              />
              <DateField
                label={trip === "round" ? "Depart" : "Date"}
                value={seg.date}
                min={iso(0)}
                onChange={(v) => setSeg(i, { date: v })}
              />
              {trip === "round" ? (
                <DateField
                  label="Return"
                  value={returnDate}
                  min={seg.date}
                  onChange={setReturnDate}
                />
              ) : null}
            </div>

            {trip === "multi" && activeSegments.length > 1 ? (
              <button
                type="button"
                onClick={() => removeSegment(i)}
                aria-label={`Remove flight ${i + 1}`}
                className="grid h-12 w-full shrink-0 place-items-center rounded-lg border border-border/70 text-muted-foreground transition-colors hover:text-destructive sm:size-12 sm:w-12"
              >
                <X className="size-4" />
              </button>
            ) : null}

            {trip !== "multi" ? (
              <button
                onClick={submit}
                className="flex h-12 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-forest px-8 font-display text-[13.5px] font-semibold text-primary-foreground shadow-soft transition-transform duration-300 hover:scale-[1.02]"
              >
                <Search className="size-4" /> Search
              </button>
            ) : null}
          </div>
        ))}
      </div>

      {trip === "multi" ? (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={addSegment}
            disabled={segments.length >= 5}
            className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-[12px] font-semibold text-foreground transition-colors hover:bg-secondary disabled:opacity-40"
          >
            <Plus className="size-3.5" /> Add another flight
          </button>
          <button
            onClick={submit}
            className="flex h-11 items-center justify-center gap-1.5 rounded-lg bg-forest px-8 font-display text-[13.5px] font-semibold text-primary-foreground shadow-soft transition-transform duration-300 hover:scale-[1.02]"
          >
            <Search className="size-4" /> Search
          </button>
        </div>
      ) : null}

      {error ? <p className="pt-2 text-[12px] font-medium text-destructive">{error}</p> : null}
    </div>
  );
}
