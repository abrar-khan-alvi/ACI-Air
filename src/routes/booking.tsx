import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";

import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Briefcase,
  Check,
  Camera,
  Loader2,
  Plus,
  Trash2,
  ScanLine,
  TriangleAlert,
  CreditCard,
  Headphones,
  Lock,
  Luggage,
  Mail,
  Phone,
  Plane,
  ShieldCheck,
  Sparkles,
  Ticket,
  Utensils,
} from "lucide-react";
import type { ItineraryLeg } from "@/components/aci/BookingDrawer";
import { paxLabel, type Pax } from "@/lib/flight-results";
import { fareBreakdown, flightFacts, mealFor, money } from "@/lib/fare-details";
import { scanPassportLocally } from "@/lib/passport-ocr";
import { cn } from "@/lib/utils";

const title = "Complete your booking — ACI Air";
const description =
  "Add traveller details, choose seats, baggage and meals, then confirm your ACI Air flight booking with secure checkout.";

export const Route = createFileRoute("/booking")({
  validateSearch: (s: Record<string, unknown>) => ({
    ref: typeof s["ref"] === "string" ? s["ref"] : "",
  }),
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
  component: BookingPage,
});

type Draft = { legs: ItineraryLeg[]; pax: Pax; cabin: string };

type TravellerType = "Adult" | "Child" | "Infant";

type Traveller = {
  type: TravellerType;
  first: string;
  last: string;
  dob: string;
  passport: string;
  nationality: string;
  expiry: string;
  scan: string;
};

const MAX_TRAVELLERS = 9;

const blankTraveller = (type: TravellerType): Traveller => ({
  type,
  first: "",
  last: "",
  dob: "",
  passport: "",
  nationality: "",
  expiry: "",
  scan: "",
});

const extras = [
  {
    id: "bag",
    icon: Luggage,
    name: "Extra checked bag",
    desc: "+10 kg allowance per passenger",
    price: 3200,
  },
  {
    id: "seat",
    icon: Ticket,
    name: "Preferred seat",
    desc: "Window or aisle, extra legroom rows",
    price: 1800,
  },
  {
    id: "meal",
    icon: Utensils,
    name: "Premium meal",
    desc: "Chef-curated hot meal & dessert",
    price: 1200,
  },
  {
    id: "flex",
    icon: ShieldCheck,
    name: "Flex protection",
    desc: "Free one-time date change",
    price: 2400,
  },
];

const steps = ["Travellers", "Extras", "Review & pay"];

function BookingPage() {
  const { ref } = Route.useSearch();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [ready, setReady] = useState(false);
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<string[]>([]);
  const [contact, setContact] = useState({ email: "", phone: "" });
  const [travellers, setTravellers] = useState<Traveller[]>([]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    try {
      const raw = ref ? sessionStorage.getItem(ref) : null;
      if (raw) {
        const parsed = JSON.parse(raw) as Draft;
        setDraft(parsed);
        const types: TravellerType[] = [
          ...Array.from({ length: parsed.pax.adults }, () => "Adult" as const),
          ...Array.from({ length: parsed.pax.children }, () => "Child" as const),
          ...Array.from({ length: parsed.pax.infants }, () => "Infant" as const),
        ].slice(0, MAX_TRAVELLERS);
        setTravellers((types.length ? types : ["Adult" as const]).map(blankTraveller));
      }
    } catch {
      /* ignore */
    }
    setReady(true);
  }, [ref]);

  const legs = draft?.legs ?? [];
  const pax = draft?.pax ?? { adults: 1, children: 0, infants: 0 };
  const travellerCount = Math.max(travellers.length, 1);
  const flightTotal = legs.reduce((t, l) => t + l.fare.price, 0);
  const listTotal = legs.reduce((t, l) => t + flightFacts(l.fare).listPrice, 0);
  const extrasTotal = useMemo(
    () =>
      picked.reduce(
        (t, id) => t + (extras.find((e) => e.id === id)?.price ?? 0) * travellerCount,
        0,
      ),
    [picked, travellerCount],
  );
  const grandTotal = flightTotal + extrasTotal;
  const pnr = legs.length ? flightFacts(legs[0]!.fare).pnrHint : "ACI00000";

  const canContinue =
    step !== 0 ||
    (contact.email.includes("@") &&
      contact.phone.length > 5 &&
      travellers.every((t) => t.first && t.last));

  if (ready && !legs.length) {
    return (
      <div className="grid min-h-screen place-items-center bg-background px-6">
        <div className="surface-card grid max-w-md place-items-center gap-2 p-10 text-center">
          <Plane className="size-6 text-primary" />
          <h1 className="font-display text-[17px] font-semibold">Booking session expired</h1>
          <p className="text-[12.5px] text-muted-foreground">
            Please search again and pick a flight to continue booking.
          </p>
          <Link
            to="/search"
            search={{
              trip: "oneway",
              legs: "",
              adults: 1,
              children: 0,
              infants: 0,
              cabin: "Economy" as const,
            }}
            className="mt-2 rounded-xl bg-forest px-4 py-2.5 text-[13px] font-semibold text-primary-foreground"
          >
            Back to flight search
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="glass-bar sticky top-0 z-40 border-b border-border/60">
        <div className="mx-auto flex max-w-[1180px] items-center gap-3 px-3 py-2.5 sm:px-5">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-xl bg-lagoon shadow-soft">
              <Plane className="size-4 text-primary-foreground" strokeWidth={2} />
            </span>
            <span className="hidden leading-tight sm:block">
              <span className="block font-display text-[14px] font-semibold">ACI Air</span>
              <span className="block text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
                Secure booking
              </span>
            </span>
          </Link>
          <button
            type="button"
            onClick={() => (step ? setStep(step - 1) : window.history.back())}
            className="ml-1 flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-[12px] font-semibold text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" /> Back
          </button>
          <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/70 px-2.5 py-1.5 text-[10.5px] font-semibold text-muted-foreground">
            <Lock className="size-3 text-primary" /> 256-bit secure
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-[1180px] px-3 py-6 sm:px-5">
        <h1 className="font-display text-[22px] font-bold leading-tight sm:text-[26px]">
          {done ? "Booking confirmed" : "Complete your booking"}
        </h1>
        <p className="mt-1 text-[12.5px] text-muted-foreground">
          {legs.map((l) => `${l.fare.fromCode} → ${l.fare.toCode}`).join("  ·  ")} · {paxLabel(pax)}{" "}
          · {draft?.cabin}
        </p>

        {!done ? (
          <ol className="mt-5 flex items-center gap-2">
            {steps.map((s, i) => (
              <li key={s} className="flex flex-1 items-center gap-2">
                <span
                  className={cn(
                    "grid size-7 shrink-0 place-items-center rounded-full text-[11px] font-bold transition",
                    i <= step
                      ? "bg-forest text-primary-foreground"
                      : "bg-secondary text-muted-foreground",
                  )}
                >
                  {i < step ? <Check className="size-3.5" /> : i + 1}
                </span>
                <span
                  className={cn(
                    "truncate text-[12px] font-semibold",
                    i === step ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {s}
                </span>
                {i < steps.length - 1 ? (
                  <span className="hidden h-px flex-1 bg-border sm:block" />
                ) : null}
              </li>
            ))}
          </ol>
        ) : null}

        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-4">
            {done ? (
              <section className="surface-card p-6 text-center">
                <span className="mx-auto grid size-14 place-items-center rounded-full bg-forest text-primary-foreground">
                  <BadgeCheck className="size-7" />
                </span>
                <h2 className="mt-3 font-display text-[19px] font-bold">
                  You&apos;re all set, safe travels!
                </h2>
                <p className="mt-1 text-[12.5px] text-muted-foreground">
                  E-tickets and the itinerary have been sent to {contact.email || "your email"}.
                </p>
                <p className="mt-4 inline-flex items-center gap-2 rounded-xl bg-secondary px-4 py-2 font-display text-[15px] font-bold">
                  <Ticket className="size-4 text-primary" /> Booking ref · {pnr}
                </p>
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  <Link
                    to="/user"
                    className="rounded-xl bg-forest px-4 py-2.5 text-[13px] font-semibold text-primary-foreground"
                  >
                    View my trips
                  </Link>
                  <Link
                    to="/"
                    className="rounded-xl border border-border px-4 py-2.5 text-[13px] font-semibold"
                  >
                    Back to home
                  </Link>
                </div>
              </section>
            ) : step === 0 ? (
              <>
                <section className="surface-card p-4 sm:p-5">
                  <h2 className="font-display text-[15px] font-semibold">Contact details</h2>
                  <p className="mt-0.5 text-[11.5px] text-muted-foreground">
                    Tickets, check-in reminders and any changes go here.
                  </p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <Field
                      icon={Mail}
                      label="Email address"
                      type="email"
                      placeholder="you@example.com"
                      value={contact.email}
                      onChange={(v) => setContact((c) => ({ ...c, email: v }))}
                    />
                    <Field
                      icon={Phone}
                      label="Mobile number"
                      placeholder="+880 1XXX XXXXXX"
                      value={contact.phone}
                      onChange={(v) => setContact((c) => ({ ...c, phone: v }))}
                    />
                  </div>
                </section>

                {travellers.map((t, i) => (
                  <TravellerCard
                    key={i}
                    index={i}
                    traveller={t}
                    canRemove={travellers.length > 1}
                    onRemove={() => setTravellers((list) => list.filter((_, j) => j !== i))}
                    onChange={(patch) =>
                      setTravellers((list) =>
                        list.map((x, j) => (j === i ? { ...x, ...patch } : x)),
                      )
                    }
                  />
                ))}

                <section className="rounded-2xl border border-dashed border-border bg-secondary/30 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-[12px] text-muted-foreground">
                      <span className="font-semibold text-foreground">
                        {travellers.length} of {MAX_TRAVELLERS} travellers
                      </span>{" "}
                      · up to {MAX_TRAVELLERS} passengers per booking
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {(["Adult", "Child", "Infant"] as TravellerType[]).map((type) => (
                        <button
                          key={type}
                          type="button"
                          disabled={travellers.length >= MAX_TRAVELLERS}
                          onClick={() => setTravellers((list) => [...list, blankTraveller(type)])}
                          className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 text-[12px] font-semibold transition hover:border-primary/50 hover:shadow-soft disabled:opacity-40"
                        >
                          <Plus className="size-3.5 text-primary" /> {type}
                        </button>
                      ))}
                    </div>
                  </div>
                </section>
              </>
            ) : step === 1 ? (
              <section className="surface-card p-4 sm:p-5">
                <h2 className="font-display text-[15px] font-semibold">Make the trip yours</h2>
                <p className="mt-0.5 text-[11.5px] text-muted-foreground">
                  Priced per passenger · {travellerCount} traveller{travellerCount > 1 ? "s" : ""}
                </p>
                <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                  {extras.map((e) => {
                    const on = picked.includes(e.id);
                    return (
                      <button
                        key={e.id}
                        type="button"
                        onClick={() =>
                          setPicked((p) => (on ? p.filter((x) => x !== e.id) : [...p, e.id]))
                        }
                        className={cn(
                          "flex items-start gap-3 rounded-2xl border p-3.5 text-left transition-all duration-300",
                          on
                            ? "border-primary bg-primary/5 shadow-float"
                            : "border-border bg-card hover:-translate-y-0.5 hover:shadow-soft",
                        )}
                      >
                        <span
                          className={cn(
                            "grid size-9 shrink-0 place-items-center rounded-xl",
                            on ? "bg-forest text-primary-foreground" : "bg-secondary text-primary",
                          )}
                        >
                          <e.icon className="size-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block font-display text-[13.5px] font-semibold">
                            {e.name}
                          </span>
                          <span className="block text-[11.5px] text-muted-foreground">
                            {e.desc}
                          </span>
                          <span className="mt-1.5 block text-[12px] font-semibold text-primary">
                            {money(e.price)} / person
                          </span>
                        </span>
                        <span
                          className={cn(
                            "grid size-5 shrink-0 place-items-center rounded-full border",
                            on
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border",
                          )}
                        >
                          {on ? <Check className="size-3" /> : null}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>
            ) : (
              <>
                <section className="surface-card p-4 sm:p-5">
                  <h2 className="font-display text-[15px] font-semibold">Review your itinerary</h2>
                  <div className="mt-3 space-y-3">
                    {legs.map((l, i) => {
                      const facts = flightFacts(l.fare);
                      return (
                        <div
                          key={i}
                          className="rounded-2xl border border-border/70 bg-secondary/30 p-3.5"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10.5px] font-semibold text-primary">
                              {l.label}
                            </span>
                            <span className="text-[11px] text-muted-foreground">{l.dates}</span>
                          </div>
                          <div className="mt-3 flex items-center gap-3">
                            <div>
                              <p className="font-display text-[18px] font-bold leading-none">
                                {l.fare.depart}
                              </p>
                              <p className="mt-1 text-[11px] text-muted-foreground">
                                {l.fare.fromCode} · T{facts.terminalFrom}
                              </p>
                            </div>
                            <div className="flex-1">
                              <div className="relative h-px bg-border">
                                <Plane className="absolute left-1/2 top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rotate-90 bg-card text-primary" />
                              </div>
                              <p className="mt-1.5 text-center text-[10.5px] font-semibold text-muted-foreground">
                                {l.fare.duration} ·{" "}
                                {l.fare.stops === 0 ? "Non-stop" : `${l.fare.stops} stop`}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-display text-[18px] font-bold leading-none">
                                {l.fare.arrive}
                              </p>
                              <p className="mt-1 text-[11px] text-muted-foreground">
                                {l.fare.toCode} · T{facts.terminalTo}
                              </p>
                            </div>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {[
                              { icon: Luggage, t: `${l.fare.baggage} checked` },
                              { icon: Briefcase, t: "7kg cabin" },
                              { icon: Utensils, t: mealFor(l.fare.cabin).split(",")[0]! },
                            ].map((c) => (
                              <span
                                key={c.t}
                                className="flex items-center gap-1 rounded-full bg-card px-2.5 py-1 text-[10.5px] font-medium text-muted-foreground"
                              >
                                <c.icon className="size-3" /> {c.t}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>

                <section className="surface-card p-4 sm:p-5">
                  <h2 className="font-display text-[15px] font-semibold">Payment method</h2>
                  <div className="mt-3 grid gap-2.5 sm:grid-cols-3">
                    {["Card / 3-D Secure", "bKash · Nagad", "0% EMI · 12 banks"].map((m, i) => (
                      <div
                        key={m}
                        className={cn(
                          "rounded-2xl border p-3.5 text-[12.5px] font-semibold",
                          i === 0
                            ? "border-primary bg-primary/5"
                            : "border-border bg-card text-muted-foreground",
                        )}
                      >
                        <CreditCard className="mb-2 size-4 text-primary" />
                        {m}
                      </div>
                    ))}
                  </div>
                  <p className="mt-3 text-[11px] text-muted-foreground">
                    This is a demo checkout — no payment is taken and no card details are stored.
                  </p>
                </section>
              </>
            )}
          </div>

          <aside className="lg:sticky lg:top-[74px] lg:self-start">
            <div className="surface-card overflow-hidden">
              <div className="bg-forest px-4 py-3 text-primary-foreground">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] opacity-80">
                  Price summary
                </p>
                <p className="mt-1 font-display text-[24px] font-bold leading-none">
                  {money(grandTotal)}
                </p>
                <p className="mt-1 text-[11px] opacity-85">
                  {travellerCount} passenger{travellerCount > 1 ? "s" : ""} · all taxes included
                </p>
              </div>
              <div className="space-y-2 px-4 py-4">
                {legs.map((l, i) => (
                  <div key={i}>
                    {legs.length > 1 ? (
                      <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        {l.label}
                      </p>
                    ) : null}
                    {fareBreakdown(l.fare, pax).map((r) => (
                      <div
                        key={r.label}
                        className="flex items-center justify-between gap-3 py-0.5 text-[12px]"
                      >
                        <span className="text-muted-foreground">{r.label}</span>
                        <span className="font-semibold">{money(r.value)}</span>
                      </div>
                    ))}
                  </div>
                ))}
                {picked.map((id) => {
                  const e = extras.find((x) => x.id === id)!;
                  return (
                    <div key={id} className="flex items-center justify-between gap-3 text-[12px]">
                      <span className="text-muted-foreground">{e.name}</span>
                      <span className="font-semibold">{money(e.price * travellerCount)}</span>
                    </div>
                  );
                })}
                <div className="flex items-center justify-between gap-3 border-t border-border/70 pt-2 text-[12px]">
                  <span className="text-muted-foreground">You save</span>
                  <span className="font-semibold text-primary">
                    -{money(Math.max(listTotal - flightTotal, 0))}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3 border-t border-border/70 pt-2">
                  <span className="text-[12.5px] font-semibold">Total payable</span>
                  <span className="font-display text-[17px] font-bold">{money(grandTotal)}</span>
                </div>
              </div>
              {!done ? (
                <div className="border-t border-border bg-card px-4 py-4">
                  <button
                    type="button"
                    disabled={!canContinue}
                    onClick={() => (step < 2 ? setStep(step + 1) : setDone(true))}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-forest px-5 py-3 font-display text-[14px] font-semibold text-primary-foreground shadow-soft transition-all duration-300 hover:shadow-float active:scale-[0.99] disabled:opacity-40"
                  >
                    {step < 2 ? "Continue" : "Confirm & pay"}
                    <ArrowRight className="size-4" />
                  </button>
                  <p className="mt-2 text-center text-[10.5px] text-muted-foreground">
                    Free cancellation within 24h · instant e-ticket
                  </p>
                </div>
              ) : null}
            </div>

            <div className="mt-3 grid gap-2 rounded-2xl border border-border/60 bg-secondary/40 p-3.5">
              {[
                { icon: Sparkles, t: "Fare held for 20 minutes" },
                { icon: ShieldCheck, t: "IATA accredited · 3-D Secure" },
                { icon: Headphones, t: "24/7 human support" },
              ].map((x) => (
                <p
                  key={x.t}
                  className="flex items-center gap-2 text-[11.5px] text-muted-foreground"
                >
                  <x.icon className="size-3.5 text-primary" /> {x.t}
                </p>
              ))}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  icon: Icon,
  type = "text",
  placeholder = "",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  icon?: React.ElementType;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </span>
      <span className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2.5 transition focus-within:border-primary/60">
        {Icon ? <Icon className="size-3.5 shrink-0 text-muted-foreground" /> : null}
        <input
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent text-[13px] outline-none placeholder:text-muted-foreground/70"
        />
      </span>
    </label>
  );
}

async function fileToDataUrl(file: File, max = 1400): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not process that image.");
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", 0.86);
}

function TravellerCard({
  index,
  traveller,
  canRemove,
  onRemove,
  onChange,
}: {
  index: number;
  traveller: Traveller;
  canRemove: boolean;
  onRemove: () => void;
  onChange: (patch: Partial<Traveller>) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [filled, setFilled] = useState(false);
  const [lowConfidence, setLowConfidence] = useState(false);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setError("");
    setLowConfidence(false);
    setBusy(true);
    try {
      const image = await fileToDataUrl(file);
      onChange({ scan: image });
      const result = await scanPassportLocally(image);
      onChange({
        ...(result.first ? { first: result.first.trim().toUpperCase() } : {}),
        ...(result.last ? { last: result.last.trim().toUpperCase() } : {}),
        ...(result.dob ? { dob: result.dob } : {}),
        ...(result.passport ? { passport: result.passport } : {}),
        ...(result.nationality ? { nationality: result.nationality } : {}),
        ...(result.expiry ? { expiry: result.expiry } : {}),
      });
      setFilled(true);
      // Surface low-confidence warning without exposing raw MRZ data
      const r = result as typeof result & { _lowConfidence?: boolean };
      if (r._lowConfidence) setLowConfidence(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Scan failed — please type the details.");
    } finally {
      setBusy(false);
    }
  };

  const complete = Boolean(traveller.first && traveller.last);

  return (
    <section className="surface-card overflow-hidden">
      <div className="flex items-center justify-between gap-2 border-b border-border/60 bg-secondary/30 px-4 py-3 sm:px-5">
        <h2 className="flex items-center gap-2 font-display text-[15px] font-semibold">
          <span
            className={cn(
              "grid size-6 place-items-center rounded-full text-[10.5px] font-bold",
              complete ? "bg-forest text-primary-foreground" : "bg-card text-muted-foreground",
            )}
          >
            {complete ? <Check className="size-3" /> : index + 1}
          </span>
          Traveller {index + 1}
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10.5px] font-semibold text-primary">
            {traveller.type}
          </span>
        </h2>
        {canRemove ? (
          <button
            type="button"
            onClick={onRemove}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11.5px] font-semibold text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="size-3.5" /> Remove
          </button>
        ) : (
          <span className="text-[11px] text-muted-foreground">As printed on passport</span>
        )}
      </div>

      <div className="p-4 sm:p-5">
        <div className="flex flex-col gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-3.5 sm:flex-row sm:items-center">
          <span className="relative grid h-14 w-20 shrink-0 place-items-center overflow-hidden rounded-xl border border-border bg-card">
            {traveller.scan ? (
              <img src={traveller.scan} alt="" className="h-full w-full object-cover" />
            ) : (
              <Camera className="size-4 text-muted-foreground" />
            )}
            {busy ? (
              <span className="absolute inset-0 grid place-items-center bg-background/70">
                <Loader2 className="size-4 animate-spin text-primary" />
              </span>
            ) : null}
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-display text-[13.5px] font-semibold">
              Scan passport &amp; auto-fill
            </p>
            <p className="mt-0.5 text-[11.5px] text-muted-foreground">
              {busy
                ? "Scanning passport locally…"
                : error
                  ? error
                  : filled
                    ? "Details filled in — please check and edit if needed."
                    : "Upload a clear photo of the passport data page. You can always type manually."}
            </p>
          </div>
          <label
            className={cn(
              "flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-forest px-3.5 py-2.5 text-[12.5px] font-semibold text-primary-foreground shadow-soft transition hover:shadow-float",
              busy && "pointer-events-none opacity-60",
            )}
          >
            {busy ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <ScanLine className="size-3.5" />
            )}
            {traveller.scan ? "Rescan" : "Upload passport"}
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => {
                void handleFile(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </label>
        </div>

        {error ? (
          <p className="mt-2 flex items-center gap-1.5 text-[11.5px] font-medium text-destructive">
            <TriangleAlert className="size-3.5" /> {error}
          </p>
        ) : null}
        {lowConfidence && !error ? (
          <p className="mt-2 flex items-center gap-1.5 rounded-xl border border-amber-400/40 bg-amber-400/10 px-3 py-2 text-[11.5px] font-medium text-amber-700 dark:text-amber-400">
            <TriangleAlert className="size-3.5 shrink-0" />
            Some fields may be mis-read — please verify all details before continuing.
          </p>
        ) : null}

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {(
            [
              ["first", "Given name", "text", "e.g. Ayesha"],
              ["last", "Surname", "text", "e.g. Rahman"],
              ["dob", "Date of birth", "date", ""],
              ["passport", "Passport number", "text", "e.g. BX0123456"],
              ["nationality", "Nationality", "text", "e.g. Bangladeshi"],
              ["expiry", "Passport expiry", "date", ""],
            ] as const
          ).map(([k, label, type, ph]) => (
            <Field
              key={k}
              label={label}
              type={type}
              placeholder={ph}
              value={traveller[k]}
              onChange={(v) => onChange({ [k]: v } as Partial<Traveller>)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
