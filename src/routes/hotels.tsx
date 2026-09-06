import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  BedDouble,
  CalendarDays,
  Check,
  ChevronDown,
  Globe,
  MapPin,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { HotelResults } from "@/components/aci/HotelResults";
import { HotelSearchForm } from "@/components/aci/HotelSearchForm";
import { cn } from "@/lib/utils";
import {
  bdt,
  destinationById,
  guestLabel,
  hotelTotal,
  nightsBetween,
  validateHotelSearch,
  type Hotel,
  type RoomOption,
} from "@/lib/hotels";
import { prettyDate } from "@/lib/search-params";

const title = "Hotel search results — ACI Air";
const description =
  "Compare handpicked hotels, resorts and apartments worldwide with free cancellation, live room availability and all-in BDT pricing.";

export const Route = createFileRoute("/hotels")({
  validateSearch: validateHotelSearch,
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
  component: HotelSearchPage,
});

function HotelSearchPage() {
  const params = Route.useSearch();
  const dest = destinationById(params.dest);
  const guests = { rooms: params.rooms, adults: params.adults, children: params.children };
  const nights = useMemo(
    () => (params.checkin && params.checkout ? nightsBetween(params.checkin, params.checkout) : 1),
    [params.checkin, params.checkout],
  );

  const [edit, setEdit] = useState(!dest);
  const [loading, setLoading] = useState(true);
  const [picked, setPicked] = useState<{ hotel: Hotel; room: RoomOption } | null>(null);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 550);
    return () => clearTimeout(t);
  }, [params.dest, params.checkin, params.checkout, params.rooms]);

  return (
    <div className="min-h-screen bg-background">
      <header className="glass-bar sticky top-0 z-40 border-b border-border/60">
        <div className="mx-auto flex max-w-[1240px] items-center gap-3 px-3 py-2.5 sm:px-5">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-xl bg-lagoon shadow-soft">
              <BedDouble className="size-4 text-primary-foreground" strokeWidth={2} />
            </span>
            <span className="hidden leading-tight sm:block">
              <span className="block font-display text-[14px] font-semibold">ACI Air</span>
              <span className="block text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
                Hotel search
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
              <Sparkles className="size-3 text-primary" /> All-in pricing
            </span>
          </div>
        </div>
      </header>

      <div className="border-b border-border/60 bg-card">
        <div className="mx-auto max-w-[1240px] px-3 py-3 sm:px-5">
          <h1 className="sr-only">Hotels in {dest ? dest.label : "your destination"}</h1>
          <button
            type="button"
            onClick={() => setEdit((v) => !v)}
            aria-expanded={edit}
            className="group flex w-full items-stretch overflow-hidden rounded-2xl border border-border bg-background text-left shadow-soft transition hover:border-primary/40 hover:shadow-float"
          >
            <span className="flex min-w-0 flex-1 items-center gap-3 px-3 py-2.5 sm:px-4">
              <span className="hidden size-8 shrink-0 place-items-center rounded-xl bg-secondary text-primary sm:grid">
                <MapPin className="size-4" strokeWidth={1.9} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-display text-[14px] font-semibold leading-tight sm:text-[15.5px]">
                  {dest ? dest.label : "Where do you want to stay?"}
                </span>
                <span className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11.5px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <CalendarDays className="size-3.5" />
                    {params.checkin && params.checkout
                      ? `${prettyDate(params.checkin)} — ${prettyDate(params.checkout)} · ${nights} night${nights > 1 ? "s" : ""}`
                      : "Select dates"}
                  </span>
                  <span className="text-border">|</span>
                  <span className="inline-flex items-center gap-1">
                    <Users className="size-3.5" />
                    {guestLabel(guests)}
                  </span>
                </span>
              </span>
            </span>
            <span className="mr-2 flex shrink-0 items-center gap-1.5 self-center rounded-xl bg-forest px-3.5 py-2 text-[12px] font-semibold text-primary-foreground shadow-soft transition group-hover:scale-[1.02] sm:mr-3">
              <span className="hidden sm:inline">{edit ? "Close" : "Modify search"}</span>
              <ChevronDown className={cn("size-3.5 transition-transform", edit && "rotate-180")} />
            </span>
          </button>
        </div>
      </div>

      <main className="mx-auto max-w-[1240px] px-3 py-5 sm:px-5">
        {edit || !dest ? (
          <div className="mb-5 rounded-2xl border border-border/60 bg-card shadow-float">
            <HotelSearchForm
              compact
              {...(dest ? { initialDest: dest.id } : {})}
              {...(params.checkin ? { initialCheckin: params.checkin } : {})}
              {...(params.checkout ? { initialCheckout: params.checkout } : {})}
              initialGuests={guests}
            />
          </div>
        ) : null}

        {dest ? (
          <HotelResults
            dest={dest}
            checkin={params.checkin}
            nights={nights}
            guests={guests}
            loading={loading}
            onSelect={(hotel, room) => setPicked({ hotel, room })}
          />
        ) : (
          <div className="surface-card grid place-items-center gap-2 rounded-2xl p-10 text-center">
            <BedDouble className="size-6 text-primary" />
            <p className="font-display text-[15px] font-semibold">Start a new hotel search</p>
            <p className="text-[12.5px] text-muted-foreground">
              Pick a destination and dates above to compare stays.
            </p>
          </div>
        )}

        <div className="mt-8 grid gap-2 rounded-2xl border border-border/60 bg-secondary/40 p-4 sm:grid-cols-3">
          {[
            { icon: ShieldCheck, t: "Secure payments", s: "3-D Secure & 0% EMI on 12 banks" },
            { icon: Check, t: "Free cancellation", s: "On most rooms until 24h before check-in" },
            { icon: Sparkles, t: "Best price promise", s: "Find it cheaper and we match it" },
          ].map((x) => (
            <div key={x.t} className="flex items-start gap-2.5">
              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-card text-primary shadow-soft">
                <x.icon className="size-4" strokeWidth={1.9} />
              </span>
              <span>
                <span className="block font-display text-[12.5px] font-semibold">{x.t}</span>
                <span className="block text-[11.5px] text-muted-foreground">{x.s}</span>
              </span>
            </div>
          ))}
        </div>
      </main>

      <HotelBookingDrawer
        picked={picked}
        nights={nights}
        rooms={guests.rooms}
        guests={guests}
        checkin={params.checkin}
        checkout={params.checkout}
        onClose={() => setPicked(null)}
      />
    </div>
  );
}

function HotelBookingDrawer({
  picked,
  nights,
  rooms,
  guests,
  checkin,
  checkout,
  onClose,
}: {
  picked: { hotel: Hotel; room: RoomOption } | null;
  nights: number;
  rooms: number;
  guests: { rooms: number; adults: number; children: number };
  checkin: string;
  checkout: string;
  onClose: () => void;
}) {
  const open = picked !== null;
  const priced = picked ? hotelTotal(picked.hotel, nights, rooms, picked.room.perNight) : null;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <>
      <div
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm transition-opacity duration-300",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />
      <aside
        role="dialog"
        aria-label="Booking summary"
        className={cn(
          "fixed right-0 top-0 z-50 flex h-full w-full max-w-[420px] flex-col border-l border-border/60 bg-card shadow-float transition-transform duration-500 ease-out",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        {picked && priced ? (
          <>
            <div className="flex items-start gap-3 border-b border-border/60 p-4">
              <div className="min-w-0 flex-1">
                <p className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Review your stay
                </p>
                <h2 className="mt-0.5 truncate font-display text-[17px] font-bold">
                  {picked.hotel.name}
                </h2>
                <p className="text-[12px] text-muted-foreground">
                  {picked.hotel.area}, {picked.hotel.city}
                </p>
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="grid size-8 shrink-0 place-items-center rounded-full border border-border text-muted-foreground transition hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="rounded-xl border border-border/60 bg-secondary/40 p-3">
                <p className="font-display text-[13px] font-semibold">{picked.room.name}</p>
                <p className="mt-0.5 text-[11.5px] text-muted-foreground">
                  {picked.room.bed} · {picked.room.board}
                </p>
                <div className="mt-2 grid grid-cols-2 gap-2 text-[11.5px]">
                  <span>
                    <span className="block text-muted-foreground">Check in</span>
                    <span className="font-display font-semibold">{prettyDate(checkin)}</span>
                  </span>
                  <span>
                    <span className="block text-muted-foreground">Check out</span>
                    <span className="font-display font-semibold">{prettyDate(checkout)}</span>
                  </span>
                </div>
                <p className="mt-2 text-[11.5px] text-muted-foreground">
                  {nights} night{nights > 1 ? "s" : ""} · {guestLabel(guests)}
                </p>
              </div>

              <div className="mt-4 space-y-2 text-[12.5px]">
                <p className="font-display text-[11.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Price breakdown
                </p>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {bdt(picked.room.perNight)} × {nights} night{nights > 1 ? "s" : ""} × {rooms}{" "}
                    room
                    {rooms > 1 ? "s" : ""}
                  </span>
                  <span className="font-semibold">{bdt(priced.stay)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Taxes & service fees</span>
                  <span className="font-semibold">{bdt(priced.taxes)}</span>
                </div>
                <div className="flex justify-between border-t border-border/60 pt-2">
                  <span className="font-display font-semibold">Total payable</span>
                  <span className="font-display text-[16px] font-bold">{bdt(priced.total)}</span>
                </div>
              </div>

              <ul className="mt-4 space-y-1.5 text-[12px] text-muted-foreground">
                <li className="flex items-center gap-1.5">
                  <Check className="size-3.5 text-primary" />
                  {picked.room.refundable
                    ? "Free cancellation until 24h before check-in"
                    : "Non-refundable rate"}
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="size-3.5 text-primary" /> Instant confirmation voucher by email
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="size-3.5 text-primary" /> Pay in BDT, no hidden currency fees
                </li>
              </ul>
            </div>

            <div className="border-t border-border/60 p-4">
              <button className="w-full rounded-xl bg-forest py-3 font-display text-[14px] font-semibold text-primary-foreground shadow-soft transition-transform hover:scale-[1.01]">
                Continue booking · {bdt(priced.total)}
              </button>
              <p className="mt-2 text-center text-[11px] text-muted-foreground">
                You won’t be charged until the next step
              </p>
            </div>
          </>
        ) : null}
      </aside>
    </>
  );
}
