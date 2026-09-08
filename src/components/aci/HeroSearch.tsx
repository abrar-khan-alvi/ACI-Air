import { useState } from "react";
import Image from "next/image";
import {
  Plane,
  Hotel,
  Signal,
  ShieldCheck,
  CalendarDays,
  Users,
  Search,
  MapPin,
  CalendarSync,
  Clock,
  CreditCard,
} from "lucide-react";
import heroImg from "@/assets/hero-flight.jpg";
import { cn } from "@/lib/utils";
import { FlightSearchForm } from "./FlightSearchForm";
import { HotelSearchForm } from "./HotelSearchForm";

const tabs = [
  { id: "flights", label: "Flights", icon: Plane },
  { id: "hotels", label: "Hotels", icon: Hotel },
  { id: "esim", label: "eSIM", icon: Signal },
  { id: "insurance", label: "Insurance", icon: ShieldCheck },
] as const;

type TabId = (typeof tabs)[number]["id"];

type FieldProps = { icon: typeof Plane; label: string; value: string; hint?: string };

function Field({ icon: Icon, label, value, hint }: FieldProps) {
  return (
    <button className="group flex h-12 w-full items-center gap-2 rounded-lg bg-secondary/70 px-3 text-left transition-colors duration-200 hover:bg-secondary">
      <Icon className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.9} />
      <span className="min-w-0">
        <span className="block text-[9.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </span>
        <span className="block truncate font-display text-[13px] font-semibold leading-tight">
          {value}
        </span>
      </span>
      {hint ? <span className="sr-only">{hint}</span> : null}
    </button>
  );
}

const fields: Record<Exclude<TabId, "flights" | "hotels">, FieldProps[]> = {
  esim: [
    { icon: MapPin, label: "Destination", value: "Thailand", hint: "5G coverage" },
    { icon: Signal, label: "Data", value: "10 GB", hint: "Unlimited social" },
    { icon: CalendarDays, label: "Validity", value: "15 Days", hint: "Instant" },
    { icon: Users, label: "Lines", value: "1 eSIM", hint: "QR delivery" },
  ],
  insurance: [
    { icon: MapPin, label: "Region", value: "Schengen", hint: "Visa compliant" },
    { icon: CalendarDays, label: "Trip dates", value: "24 Aug — 12 Sep", hint: "19 days" },
    { icon: ShieldCheck, label: "Coverage", value: "€50,000", hint: "Medical" },
    { icon: Users, label: "Travellers", value: "2 Adults", hint: "Age 25–40" },
  ],
};

export function HeroSearch() {
  const [tab, setTab] = useState<TabId>("flights");

  return (
    <section className="pb-4">
      <div className="relative flex min-h-[240px] flex-col overflow-visible rounded-2xl shadow-card sm:min-h-[270px]">
        <Image
          src={heroImg}
          alt="Aircraft wing above emerald islands and turquoise lagoons"
          fill
          priority
          sizes="(max-width: 1360px) 100vw, 1360px"
          className="absolute inset-0 size-full rounded-2xl object-cover"
        />
        <div className="absolute inset-0 rounded-2xl bg-hero-overlay" />

        <div className="relative flex flex-1 flex-col px-4 pt-5 pb-0 sm:px-9 sm:pt-7">
          <div className="pb-4 sm:pb-5">
            <h1 className="max-w-2xl font-display text-[1.75rem] font-bold leading-[1.1] tracking-tight text-primary-foreground sm:text-[2.5rem]">
              Global travel all in one place
            </h1>
            <p className="mt-2 text-[13.5px] text-primary-foreground/85">
              Book flights, hotels, eSIM and travel insurance with ACI Air.
            </p>
          </div>

          <div className="relative -mb-10 w-full rounded-2xl border border-border/60 bg-card shadow-float sm:-mb-12">
            <div className="no-scrollbar flex gap-5 overflow-x-auto border-b border-border/70 px-4 sm:px-5">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={cn(
                    "relative flex items-center gap-1.5 whitespace-nowrap py-3 text-[13px] font-semibold transition-colors duration-200",
                    tab === t.id
                      ? "text-foreground after:absolute after:inset-x-0 after:-bottom-px after:h-[3px] after:rounded-full after:bg-primary"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <t.icon className="size-3.5" strokeWidth={2} />
                  {t.label}
                </button>
              ))}
            </div>

            {tab === "flights" ? (
              <FlightSearchForm initialTrip="oneway" />
            ) : tab === "hotels" ? (
              <HotelSearchForm />
            ) : (
              <div className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:px-5">
                <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  {fields[tab].map((f) => (
                    <Field key={f.label} {...f} />
                  ))}
                </div>
                <button className="flex h-12 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-forest px-8 font-display text-[13.5px] font-semibold text-primary-foreground shadow-soft transition-transform duration-300 hover:scale-[1.02]">
                  <Search className="size-4" /> Search
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-12 flex flex-wrap items-center justify-center gap-3 px-1 text-[11.5px] text-muted-foreground sm:mt-14">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary/60 px-3 py-1.5 backdrop-blur-sm">
          <CalendarSync className="size-3.5 text-primary" strokeWidth={2} />
          Free date changes on Flex fares
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary/60 px-3 py-1.5 backdrop-blur-sm">
          <Clock className="size-3.5 text-primary" strokeWidth={2} />
          Price freeze for 24 hours
        </span>
        <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-secondary/60 px-3 py-1.5 backdrop-blur-sm">
          <CreditCard className="size-3.5 text-primary" strokeWidth={2} />
          0% EMI on 12 banks
        </span>
      </div>
    </section>
  );
}
