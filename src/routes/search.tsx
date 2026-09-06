import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Globe,
  MapPin,
  Plane,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { FlightResults } from "@/components/aci/FlightResults";
import { MergedFlightResults } from "@/components/aci/MergedFlightResults";
import { FlightSearchForm, type Segment } from "@/components/aci/FlightSearchForm";
import { cn } from "@/lib/utils";
import { paxLabel } from "@/lib/flight-results";
import {
  decodeLegs,
  encodeLegs,
  legLabelFor,
  paxFromParams,
  prettyDate,
  validateFlightSearch,
} from "@/lib/search-params";

const title = "Flight search results — ACI Air";
const description =
  "Compare live-style fares, filter by stops, airline, departure time and budget, and pick the best flight for your trip with ACI Air.";

export const Route = createFileRoute("/search")({
  validateSearch: validateFlightSearch,
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const params = Route.useSearch();
  const navigate = useNavigate();
  const [edit, setEdit] = useState(false);
  const [loading, setLoading] = useState(true);

  const legs = useMemo(() => decodeLegs(params.legs), [params.legs]);
  const pax = paxFromParams(params);

  const key = `${params.legs}|${params.adults}|${params.children}|${params.infants}|${params.cabin}`;

  useEffect(() => {
    setLoading(true);
    setEdit(false);
    const t = setTimeout(() => setLoading(false), 650);
    return () => clearTimeout(t);
  }, [key]);

  const initialSegments: Segment[] = legs.length
    ? (params.trip === "round" ? legs.slice(0, 1) : legs).map((l) => ({
        from: l.from,
        to: l.to,
        date: l.date,
      }))
    : [];

  const route = legs.length
    ? `${legs[0]!.from.city} → ${legs[0]!.to.city}${params.trip === "round" ? " → " + legs[0]!.from.city : ""}`
    : "Your search";

  const shiftDays = (iso: string, days: number) => {
    const d = new Date(`${iso}T00:00:00`);
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  };
  const todayIso = new Date().toISOString().slice(0, 10);

  const goToDate = (nextDate: string) => {
    if (!legs.length || nextDate < todayIso) return;
    const delta = Math.round(
      (new Date(`${nextDate}T00:00:00`).getTime() -
        new Date(`${legs[0]!.date}T00:00:00`).getTime()) /
        86400000,
    );
    if (!delta) return;
    const shifted = legs.map((l) => ({ from: l.from, to: l.to, date: shiftDays(l.date, delta) }));
    void navigate({ to: "/search", search: { ...params, legs: encodeLegs(shifted) } });
  };

  const dateStrip = legs.length ? [-2, -1, 0, 1, 2].map((o) => shiftDays(legs[0]!.date, o)) : [];

  return (
    <div className="min-h-screen bg-background">
      <header className="glass-bar sticky top-0 z-40 border-b border-border/60">
        <div className="mx-auto flex max-w-[1240px] items-center gap-3 px-3 py-2.5 sm:px-5">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-xl bg-lagoon shadow-soft">
              <Plane className="size-4 text-primary-foreground" strokeWidth={2} />
            </span>
            <span className="hidden leading-tight sm:block">
              <span className="block font-display text-[14px] font-semibold">ACI Air</span>
              <span className="block text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
                Flight search
              </span>
            </span>
          </Link>

          <Link
            to="/"
            className="ml-1 flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-[12px] font-semibold text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" /> Home
          </Link>

          <div className="ml-auto flex items-center gap-2">
            <span className="hidden items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-[11px] font-semibold text-foreground/80 md:flex">
              <Globe className="size-3.5 text-primary" /> BDT · EN
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/70 px-2.5 py-1.5 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              <Sparkles className="size-3 text-primary" /> Live fare compare
            </span>
          </div>
        </div>
      </header>

      <div className="border-b border-border/60 bg-card">
        <div className="mx-auto max-w-[1240px] px-3 py-3 sm:px-5">
          <h1 className="sr-only">{route}</h1>
          <button
            type="button"
            onClick={() => setEdit((v) => !v)}
            aria-expanded={edit}
            className="group flex w-full items-stretch gap-0 overflow-hidden rounded-2xl border border-border bg-background text-left shadow-soft transition hover:border-primary/40 hover:shadow-float"
          >
            <span className="flex min-w-0 flex-1 items-center gap-3 px-3 py-2.5 sm:px-4">
              <span className="hidden size-8 shrink-0 place-items-center rounded-xl bg-secondary text-primary sm:grid">
                <MapPin className="size-4" strokeWidth={1.9} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-display text-[14px] font-semibold leading-tight sm:text-[15.5px]">
                  {route}
                </span>
                <span className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11.5px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <CalendarDays className="size-3.5" />
                    {legs.length ? legs.map((l) => prettyDate(l.date)).join(" · ") : "Select dates"}
                  </span>
                  <span className="text-border">|</span>
                  <span className="inline-flex items-center gap-1">
                    <Users className="size-3.5" />
                    {paxLabel(pax)} · {params.cabin}
                  </span>
                </span>
              </span>
            </span>
            <span className="flex shrink-0 items-center gap-1.5 self-center rounded-xl bg-forest px-3.5 py-2 text-[12px] font-semibold text-primary-foreground shadow-soft transition group-hover:scale-[1.02] mr-2 sm:mr-3">
              <Search className="size-3.5" />
              <span className="hidden sm:inline">{edit ? "Close" : "Modify search"}</span>
              <ChevronDown className={cn("size-3.5 transition-transform", edit && "rotate-180")} />
            </span>
          </button>
        </div>
      </div>

      <main className="mx-auto max-w-[1240px] px-3 py-5 sm:px-5">
        {edit || legs.length === 0 ? (
          <div className="mb-5 rounded-2xl border border-border/60 bg-card shadow-float">
            <FlightSearchForm
              compact
              initialTrip={params.trip}
              {...(initialSegments.length ? { initialSegments } : {})}
              {...(params.trip === "round" && legs[1] ? { initialReturnDate: legs[1].date } : {})}
              initialPax={pax}
              initialCabin={params.cabin}
            />
          </div>
        ) : null}

        {legs.length === 0 ? (
          <></>
        ) : (
          <div className="mb-4 flex items-center gap-1.5 rounded-2xl border border-border/60 bg-card p-1.5 shadow-soft">
            <button
              type="button"
              onClick={() => goToDate(shiftDays(legs[0]!.date, -1))}
              disabled={shiftDays(legs[0]!.date, -1) < todayIso}
              aria-label="Previous day"
              className="grid size-9 shrink-0 place-items-center rounded-xl border border-border text-muted-foreground transition hover:text-foreground disabled:opacity-30"
            >
              <ChevronLeft className="size-4" />
            </button>
            <div className="flex min-w-0 flex-1 gap-1.5 overflow-x-auto">
              {dateStrip.map((d) => {
                const active = d === legs[0]!.date;
                const past = d < todayIso;
                return (
                  <button
                    key={d}
                    type="button"
                    disabled={past}
                    onClick={() => goToDate(d)}
                    className={cn(
                      "flex-1 whitespace-nowrap rounded-xl px-3 py-1.5 text-center transition",
                      active
                        ? "bg-forest text-primary-foreground shadow-soft"
                        : "text-muted-foreground hover:bg-secondary disabled:opacity-30",
                    )}
                  >
                    <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] opacity-80">
                      {new Date(`${d}T00:00:00`).toLocaleDateString("en-GB", { weekday: "short" })}
                    </span>
                    <span className="block font-display text-[12.5px] font-semibold">
                      {prettyDate(d)}
                    </span>
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={() => goToDate(shiftDays(legs[0]!.date, 1))}
              aria-label="Next day"
              className="grid size-9 shrink-0 place-items-center rounded-xl border border-border text-muted-foreground transition hover:text-foreground"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        )}

        {legs.length === 0 ? (
          <div className="surface-card grid place-items-center gap-2 rounded-2xl p-10 text-center">
            <Plane className="size-6 text-primary" />
            <p className="font-display text-[15px] font-semibold">Start a new flight search</p>
            <p className="text-[12.5px] text-muted-foreground">
              Pick your route and dates above to compare fares.
            </p>
          </div>
        ) : legs.length > 1 ? (
          <MergedFlightResults
            legs={legs.map((l, i) => ({
              from: l.from,
              to: l.to,
              dates: prettyDate(l.date),
              label: legLabelFor(params.trip, i),
            }))}
            pax={pax}
            cabin={params.cabin}
            loading={loading}
            sectionId="itineraries"
          />
        ) : (
          <div className="grid gap-7">
            {legs.map((leg, i) => (
              <FlightResults
                key={`${leg.from.code}-${leg.to.code}-${leg.date}-${i}`}
                from={leg.from}
                to={leg.to}
                dates={prettyDate(leg.date)}
                pax={pax}
                cabin={params.cabin}
                loading={loading}
                legLabel={legLabelFor(params.trip, i)}
                sectionId={`leg-${i + 1}`}
              />
            ))}
          </div>
        )}

        <div className="mt-8 grid gap-2 rounded-2xl border border-border/60 bg-secondary/40 p-4 sm:grid-cols-3">
          {[
            { icon: ShieldCheck, t: "Secure payments", s: "3-D Secure & 0% EMI on 12 banks" },
            { icon: Sparkles, t: "Price freeze", s: "Hold this fare for 24 hours" },
            { icon: Plane, t: "24/7 support", s: "Changes and refunds handled by humans" },
          ].map((x) => (
            <div key={x.t} className="flex items-start gap-2.5">
              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-card text-primary shadow-soft">
                <x.icon className="size-4" strokeWidth={1.9} />
              </span>
              <span>
                <span className="block font-display text-[13px] font-semibold">{x.t}</span>
                <span className="block text-[11.5px] text-muted-foreground">{x.s}</span>
              </span>
            </div>
          ))}
        </div>

        <footer className="mt-8 border-t border-border pt-4 text-[11px] text-muted-foreground">
          © 2026 ACI Air. Fares shown are indicative and include taxes.
        </footer>
      </main>
    </div>
  );
}
