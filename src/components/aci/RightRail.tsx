import { Plane, Clock3, Gift, ChevronRight, Hotel, Signal } from "lucide-react";

const trips = [
  {
    route: "DAC → SIN",
    airline: "ACI Air 402",
    date: "24 Aug · 09:40",
    gate: "Gate 7B",
    countdown: "in 7d",
  },
  {
    route: "SIN → BKK",
    airline: "ACI Air 118",
    date: "28 Aug · 14:15",
    gate: "Gate C3",
    countdown: "in 11d",
  },
];

const bookings = [
  { icon: Hotel, title: "Parkroyal Collection", meta: "Singapore · 4 nights", amount: "৳ 61,400" },
  { icon: Plane, title: "DAC → DXB return", meta: "Booked 12 Aug · Confirmed", amount: "৳ 78,900" },
  { icon: Signal, title: "Thailand eSIM 10GB", meta: "Activated 09 Aug", amount: "৳ 1,250" },
];

export function RightRail() {
  return (
    <div className="grid min-w-0 auto-rows-min content-start items-start gap-3 sm:grid-cols-2 xl:grid-cols-1">
      <section className="surface-card p-3.5">
        <div className="flex items-center justify-between pb-2">
          <h2 className="font-display text-[13px] font-semibold">Upcoming trips</h2>
          <Clock3 className="size-3.5 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          {trips.map((t) => (
            <div key={t.route} className="rounded-lg border border-border/70 bg-secondary/50 p-2.5">
              <div className="flex items-center justify-between">
                <p className="font-display text-[13px] font-semibold">{t.route}</p>
                <span className="rounded-full bg-forest px-2 py-0.5 text-[9px] font-semibold text-primary-foreground">
                  {t.countdown}
                </span>
              </div>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {t.airline} · {t.date}
              </p>
              <div className="mt-2 flex items-center gap-1.5 border-t border-dashed border-border pt-2 text-[11px]">
                <Plane className="size-3 text-teal" />
                <span className="text-muted-foreground">{t.gate}</span>
                <button className="ml-auto flex items-center font-semibold text-primary">
                  Boarding pass <ChevronRight className="size-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="surface-card p-3.5">
        <h2 className="font-display text-[13px] font-semibold">Recent bookings</h2>
        <div className="mt-2.5 space-y-2.5">
          {bookings.map((b) => (
            <div key={b.title} className="flex items-center gap-2.5">
              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-secondary text-primary">
                <b.icon className="size-3.5" strokeWidth={1.8} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[12px] font-semibold">{b.title}</span>
                <span className="block truncate text-[10px] text-muted-foreground">{b.meta}</span>
              </span>
              <span className="font-display text-[11px] font-semibold">{b.amount}</span>
            </div>
          ))}
        </div>
        <button className="mt-3 w-full rounded-lg border border-border py-1.5 text-[11px] font-semibold text-foreground/80 transition hover:border-primary/40 hover:text-primary">
          View booking history
        </button>
      </section>

      <section className="relative overflow-hidden rounded-xl bg-forest p-3.5 text-primary-foreground shadow-card sm:col-span-2 xl:col-span-1">
        <div className="absolute -bottom-10 -right-8 size-28 rounded-full bg-primary-foreground/10" />
        <div className="relative flex items-center gap-1.5">
          <Gift className="size-3.5 text-gold" />
          <h2 className="font-display text-[13px] font-semibold">Rewards</h2>
        </div>
        <p className="relative mt-2 font-display text-2xl font-bold">8,420</p>
        <p className="relative text-[11px] text-primary-foreground/70">Green Miles available</p>
        <div className="relative mt-2.5 h-1 w-full overflow-hidden rounded-full bg-primary-foreground/20">
          <div className="h-full w-[84%] rounded-full bg-sun" />
        </div>
        <p className="relative mt-1.5 text-[10px] text-primary-foreground/60">
          1,580 miles to Platinum
        </p>
        <button className="relative mt-3 w-full rounded-lg bg-primary-foreground/15 py-1.5 text-[11px] font-semibold backdrop-blur transition hover:bg-primary-foreground/25">
          Redeem miles
        </button>
      </section>
    </div>
  );
}
