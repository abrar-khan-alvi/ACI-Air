import { useEffect } from "react";
import { useNavigate } from "@/components/navigation";
import {
  ArrowRight,
  Ban,
  Briefcase,
  CalendarClock,
  Check,
  Clock,
  CreditCard,
  Luggage,
  Plane,
  ShieldCheck,
  Sparkles,
  Utensils,
  X,
} from "lucide-react";
import type { Place } from "@/lib/airports";
import { paxLabel, paxTotal, type Pax } from "@/lib/flight-results";
import {
  fareBreakdown,
  fareRulesFor,
  flightFacts,
  mealFor,
  money,
  type Fare,
} from "@/lib/fare-details";
import { cn } from "@/lib/utils";

export type ItineraryLeg = { fare: Fare; from: Place; to: Place; dates: string; label: string };

type Props = {
  itinerary: ItineraryLeg[] | null;
  open: boolean;
  onClose: () => void;
  pax: Pax;
  cabin: string;
};

export function BookingDrawer({ itinerary, open, onClose, pax, cabin }: Props) {
  const navigate = useNavigate();
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  const legs = itinerary ?? [];
  const first = legs[0];
  const last = legs[legs.length - 1];
  const total = legs.reduce((t, l) => t + l.fare.price, 0);
  const listTotal = legs.reduce((t, l) => t + flightFacts(l.fare).listPrice, 0);
  const saving = listTotal - total;
  const seatsLeft = legs.length ? Math.min(...legs.map((l) => flightFacts(l.fare).seatsLeft)) : 0;
  const rules = first ? fareRulesFor(first.fare) : null;

  const startBooking = () => {
    if (!legs.length) return;
    const ref = `aci-booking-${Date.now().toString(36)}`;
    try {
      sessionStorage.setItem(ref, JSON.stringify({ legs, pax, cabin }));
    } catch {
      /* storage unavailable */
    }
    onClose();
    void navigate({ to: "/booking", search: { ref } });
  };

  return (
    <div
      className={cn("fixed inset-0 z-[60]", open ? "pointer-events-auto" : "pointer-events-none")}
      aria-hidden={!open}
    >
      <button
        aria-label="Close booking panel"
        onClick={onClose}
        tabIndex={open ? 0 : -1}
        className={cn(
          "absolute inset-0 bg-primary-deep/40 backdrop-blur-[2px] transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0",
        )}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Booking details"
        className={cn(
          "absolute right-0 top-0 flex h-full w-full max-w-[440px] flex-col border-l border-border bg-background shadow-float transition-transform duration-500 [transition-timing-function:var(--ease-silk)]",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        {first && last && rules ? (
          <>
            <header className="relative shrink-0 overflow-hidden bg-forest px-5 py-4 text-primary-foreground">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] opacity-80">
                    {legs.length > 1 ? `${legs.length} flights · one booking` : "Review booking"}
                  </p>
                  <h2 className="mt-1 truncate font-display text-[19px] font-bold leading-tight">
                    {legs.map((l) => l.from.city).join(" → ")} → {last.to.city}
                  </h2>
                  <p className="mt-0.5 text-[11.5px] opacity-85">
                    {legs.map((l) => l.dates).join(" · ")} · {paxLabel(pax)} · {cabin}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  aria-label="Close"
                  className="grid size-8 shrink-0 place-items-center rounded-full bg-primary-foreground/15 transition hover:bg-primary-foreground/25"
                >
                  <X className="size-4" />
                </button>
              </div>
              <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary-foreground/15 px-2.5 py-1 text-[10.5px] font-semibold">
                <Sparkles className="size-3" /> Fare held for 20 minutes
              </span>
            </header>

            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-5">
              {legs.map((l, i) => {
                const fare = l.fare;
                const facts = flightFacts(fare);
                return (
                  <section key={`${fare.id}-${i}`} className="surface-card p-4">
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10.5px] font-semibold text-primary">
                        {l.label}
                      </span>
                      <span className="text-[11px] text-muted-foreground">{l.dates}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <span className="grid size-10 place-items-center rounded-xl bg-lagoon font-display text-[12px] font-bold text-primary-foreground">
                          {fare.airline
                            .split(" ")
                            .map((w) => w[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                        </span>
                        <span>
                          <span className="block font-display text-[13.5px] font-semibold">
                            {fare.airline}
                          </span>
                          <span className="block text-[11px] text-muted-foreground">
                            {fare.code} · {facts.aircraft}
                          </span>
                        </span>
                      </div>
                      <span className="rounded-full bg-secondary px-2.5 py-1 text-[10.5px] font-semibold text-muted-foreground">
                        {fare.cabin}
                      </span>
                    </div>

                    <div className="mt-4 flex items-center gap-3">
                      <div className="text-left">
                        <p className="font-display text-[20px] font-bold leading-none">
                          {fare.depart}
                        </p>
                        <p className="mt-1 text-[11px] font-semibold text-muted-foreground">
                          {fare.fromCode} · T{facts.terminalFrom}
                        </p>
                      </div>
                      <div className="flex-1">
                        <div className="relative h-px w-full bg-border">
                          <Plane className="absolute left-1/2 top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rotate-90 bg-card text-primary" />
                        </div>
                        <p className="mt-1.5 text-center text-[10.5px] font-semibold text-muted-foreground">
                          {fare.duration} ·{" "}
                          {fare.stops === 0
                            ? "Non-stop"
                            : `${fare.stops} stop${fare.stops > 1 ? "s" : ""}${fare.via ? " · " + fare.via : ""}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-display text-[20px] font-bold leading-none">
                          {fare.arrive}
                        </p>
                        <p className="mt-1 text-[11px] font-semibold text-muted-foreground">
                          {fare.toCode} · T{facts.terminalTo}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {[
                        { icon: Luggage, t: `${fare.baggage} checked` },
                        { icon: Briefcase, t: "7kg cabin" },
                        { icon: Utensils, t: mealFor(fare.cabin).split(",")[0] },
                        { icon: Clock, t: `${facts.onTime}% on-time` },
                      ].map((c) => (
                        <span
                          key={c.t}
                          className="flex items-center gap-1 rounded-full bg-secondary/70 px-2.5 py-1 text-[10.5px] font-medium text-muted-foreground"
                        >
                          <c.icon className="size-3" /> {c.t}
                        </span>
                      ))}
                    </div>
                  </section>
                );
              })}

              <section className="surface-card p-4">
                <h3 className="font-display text-[13px] font-semibold">Price details</h3>
                {legs.map((l, i) => (
                  <div key={`pd-${i}`} className="mt-3">
                    {legs.length > 1 ? (
                      <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        {l.label} · {l.fare.fromCode} → {l.fare.toCode}
                      </p>
                    ) : null}
                    <ul className="space-y-2">
                      {fareBreakdown(l.fare, pax).map((r) => (
                        <li
                          key={r.label}
                          className="flex items-center justify-between gap-3 text-[12px]"
                        >
                          <span className="text-muted-foreground">{r.label}</span>
                          <span className="font-semibold">{money(r.value)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                <div className="mt-3 flex items-center justify-between gap-3 border-t border-border/70 pt-2 text-[12px]">
                  <span className="text-muted-foreground">You save</span>
                  <span className="font-semibold text-primary">
                    -{money(saving)} ({Math.round((saving / listTotal) * 100)}%)
                  </span>
                </div>
              </section>

              <section className="surface-card p-4">
                <h3 className="font-display text-[13px] font-semibold">Fare rules</h3>
                <div className="mt-3 grid gap-2.5">
                  {[
                    { icon: first.fare.refundable ? ShieldCheck : Ban, ...rules.refund },
                    { icon: CalendarClock, ...rules.change },
                    { icon: Briefcase, ...rules.carryOn },
                    { icon: Luggage, ...rules.checked },
                  ].map((r) => (
                    <div
                      key={r.label}
                      className="flex items-start gap-2.5 rounded-xl bg-secondary/40 p-2.5"
                    >
                      <r.icon className="mt-0.5 size-3.5 shrink-0 text-primary" />
                      <span>
                        <span className="block text-[12px] font-semibold">{r.label}</span>
                        <span className="block text-[11px] leading-relaxed text-muted-foreground">
                          {r.detail}
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-2xl border border-border/60 bg-secondary/40 p-4">
                <h3 className="font-display text-[13px] font-semibold">What happens next</h3>
                <ol className="mt-2.5 space-y-1.5">
                  {[
                    "Enter traveller details",
                    "Add seats, bags & meals",
                    "Secure payment & instant e-ticket",
                  ].map((s, i) => (
                    <li
                      key={s}
                      className="flex items-center gap-2 text-[11.5px] text-muted-foreground"
                    >
                      <span className="grid size-[18px] place-items-center rounded-full bg-card text-[10px] font-bold text-primary">
                        {i + 1}
                      </span>
                      {s}
                    </li>
                  ))}
                </ol>
              </section>
            </div>

            <footer className="shrink-0 border-t border-border bg-card px-5 py-4">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    Total for {paxTotal(pax)} passenger{paxTotal(pax) > 1 ? "s" : ""}
                    {legs.length > 1 ? ` · ${legs.length} flights` : ""}
                  </p>
                  <p className="font-display text-[24px] font-bold leading-none">{money(total)}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground line-through">
                    {money(listTotal)}
                  </p>
                </div>
                <span className="flex items-center gap-1 rounded-full bg-gold/20 px-2.5 py-1 text-[10.5px] font-semibold text-gold-foreground">
                  <Check className="size-3" /> {seatsLeft} seats left
                </span>
              </div>
              <button
                type="button"
                onClick={startBooking}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-forest px-5 py-3 font-display text-[14px] font-semibold text-primary-foreground shadow-soft transition-all duration-300 hover:shadow-float active:scale-[0.99]"
              >
                <CreditCard className="size-4" /> Continue booking
                <ArrowRight className="size-4" />
              </button>
              <p className="mt-2 text-center text-[10.5px] text-muted-foreground">
                Free cancellation within 24h · 3-D Secure checkout
              </p>
            </footer>
          </>
        ) : null}
      </aside>
    </div>
  );
}
