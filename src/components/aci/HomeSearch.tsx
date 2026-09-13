"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { withSearch } from "@/lib/navigation";
import {
  ArrowLeftRight,
  BedDouble,
  CalendarDays,
  ChevronDown,
  Gift,
  Hotel,
  MapPin,
  Package,
  Palmtree,
  Plane,
  Search,
  Settings2,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { placeByCode, type Place } from "@/lib/airports";
import type { CabinClass, Pax } from "@/lib/flight-results";
import { destinationById, nightsBetween, type Guests, type HotelDestination } from "@/lib/hotels";
import { encodeLegs, type TripType } from "@/lib/search-params";
import { cn } from "@/lib/utils";
import { AirportField } from "./AirportField";
import { DestinationField } from "./DestinationField";
import { GuestField } from "./GuestField";
import { PassengerField } from "./PassengerField";

type SearchTab = "flights" | "hotels" | "packages" | "holidays";

const tabs = [
  { id: "flights", label: "Flights", icon: Plane },
  { id: "hotels", label: "Hotels", icon: Hotel },
  { id: "packages", label: "Packages", icon: Package },
  { id: "holidays", label: "Holidays", icon: Palmtree },
] as const;

function iso(daysFromNow: number) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().slice(0, 10);
}

function DateBox({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const parsed = value ? new Date(`${value}T00:00:00`) : null;
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const formatted = parsed
    ? `${String(parsed.getDate()).padStart(2, "0")} ${months[parsed.getMonth()]} ${parsed.getFullYear()}`
    : "Choose date";
  const weekday = parsed ? weekdays[parsed.getDay()] : "";

  return (
    <label className="relative flex min-h-16 cursor-pointer items-center gap-2 px-3 transition-colors hover:bg-secondary/35">
      <CalendarDays className="size-4 shrink-0 text-clay" strokeWidth={2} />
      <span className="min-w-0">
        <span className="block text-[10px] font-semibold text-muted-foreground">{label}</span>
        <span className="mt-0.5 block truncate font-display text-[14px] font-semibold text-foreground">{formatted}</span>
        <span className="block text-[10px] text-muted-foreground">{weekday}</span>
      </span>
      <input
        type="date"
        value={value}
        min={iso(0)}
        onChange={(event) => onChange(event.target.value)}
        className="absolute inset-0 cursor-pointer opacity-0"
        aria-label={label}
      />
    </label>
  );
}

function SelectBox({
  icon: Icon,
  label,
  value,
  options,
  onChange,
}: {
  icon: typeof Plane;
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="relative flex min-h-16 cursor-pointer items-center gap-2 px-3 transition-colors hover:bg-secondary/35">
      <Icon className="size-4 shrink-0 text-clay" strokeWidth={2} />
      <span className="min-w-0 flex-1">
        <span className="block text-[10px] font-semibold text-muted-foreground">{label}</span>
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="mt-0.5 w-full bg-transparent font-display text-[14px] font-semibold text-foreground outline-none"
        >
          {options.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </span>
    </label>
  );
}

export function HomeSearch() {
  const router = useRouter();
  const [tab, setTab] = useState<SearchTab>("flights");
  const [trip, setTrip] = useState<TripType>("oneway");
  const [from, setFrom] = useState<Place | null>(placeByCode("DAC") ?? null);
  const [to, setTo] = useState<Place | null>(null);
  const [depart, setDepart] = useState(iso(7));
  const [returnDate, setReturnDate] = useState(iso(14));
  const [pax, setPax] = useState<Pax>({ adults: 1, children: 0, infants: 0 });
  const [cabin, setCabin] = useState<CabinClass>("Economy");
  const [error, setError] = useState<string | null>(null);
  const [hotelDest, setHotelDest] = useState<HotelDestination | null>(destinationById("bangkok"));
  const [checkin, setCheckin] = useState(iso(7));
  const [checkout, setCheckout] = useState(iso(11));
  const [guests, setGuests] = useState<Guests>({ rooms: 1, adults: 2, children: 0 });
  const [packageDest, setPackageDest] = useState<HotelDestination | null>(destinationById("dubai"));
  const [packageDate, setPackageDate] = useState(iso(21));
  const [packageLength, setPackageLength] = useState("4 nights");
  const [packagePeople, setPackagePeople] = useState("2 travellers");
  const [holidayDest, setHolidayDest] = useState<HotelDestination | null>(destinationById("male"));
  const [holidayDate, setHolidayDate] = useState(iso(28));
  const [holidayTheme, setHolidayTheme] = useState("Beach escape");
  const [holidayPeople, setHolidayPeople] = useState("Family of 4");

  const hotelNights = nightsBetween(checkin, checkout);

  const submit = () => {
    if (!from || !to) {
      setError("Select where you are flying from and your destination.");
      return;
    }
    if (from.code === to.code) {
      setError("Departure and destination must be different.");
      return;
    }
    const legs =
      trip === "round"
        ? [
            { from, to, date: depart },
            { from: to, to: from, date: returnDate },
          ]
        : [{ from, to, date: depart }];
    router.push(
      withSearch("/search", {
        trip,
        legs: encodeLegs(legs),
        adults: pax.adults,
        children: pax.children,
        infants: pax.infants,
        cabin,
        channel: "b2c",
      }),
    );
  };

  const swap = () => {
    setFrom(to);
    setTo(from);
  };

  const submitHotels = () => {
    if (!hotelDest) return setError("Choose where you want to stay.");
    if (checkout <= checkin) return setError("Check-out must be after check-in.");
    setError(null);
    router.push(
      withSearch("/hotels", {
        dest: hotelDest.id,
        checkin,
        checkout,
        rooms: guests.rooms,
        adults: guests.adults,
        children: guests.children,
      }),
    );
  };

  return (
    <div className="overflow-visible rounded-lg border border-border bg-card text-foreground shadow-float">
      <div className="no-scrollbar flex overflow-x-auto border-b border-border bg-secondary/30 px-2 sm:px-5">
        {tabs.map((item) => (
          <Button
            key={item.id}
            type="button"
            variant="ghost"
            onClick={() => setTab(item.id)}
            className={cn(
               "relative h-12 min-w-24 rounded-none px-4 text-[12px] font-semibold hover:bg-transparent",
              tab === item.id
                ? "text-clay after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:bg-clay"
                : "text-foreground/80",
            )}
          >
            <item.icon className="size-4" /> {item.label}
          </Button>
        ))}
      </div>

      {tab === "flights" ? (
        <>
          <div className={cn("relative grid gap-px bg-border p-px mx-3 mt-3 rounded-lg overflow-visible lg:mx-5", trip === "round" ? "lg:grid-cols-[1.25fr_1.25fr_.72fr_.72fr_1fr_auto]" : "lg:grid-cols-[1.3fr_1.3fr_.8fr_1fr_auto]")}>
            <div className="relative min-w-0 overflow-visible rounded-t-lg bg-card lg:rounded-l-lg lg:rounded-tr-none">
              <AirportField panel label="From" icon={Plane} value={from} exclude={to?.code} onChange={setFrom} />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={swap}
                aria-label="Swap airports"
                className="absolute -right-3.5 top-[18px] z-20 hidden size-7 rounded-full border-border bg-card text-primary shadow-soft lg:inline-flex"
              >
                <ArrowLeftRight className="size-3.5" />
              </Button>
            </div>
            <div className="min-w-0 bg-card">
              <AirportField panel label="To" icon={Plane} value={to} exclude={from?.code} placeholder="Where are you going?" onChange={setTo} />
            </div>
            <div className="min-w-0 bg-card">
              <DateBox label="Departure" value={depart} onChange={setDepart} />
            </div>
            {trip === "round" ? (
              <div className="min-w-0 bg-card">
                <DateBox label="Return" value={returnDate} onChange={setReturnDate} />
              </div>
            ) : null}
            <div className="flex min-h-16 items-center bg-card px-3">
              <Users className="mr-2 size-4 shrink-0 text-clay" />
              <div className="min-w-0">
                <p className="text-[10px] font-semibold text-muted-foreground">Travellers & class</p>
                <PassengerField panel pax={pax} cabin={cabin} onPax={setPax} onCabin={setCabin} />
              </div>
            </div>
            <Button
              type="button"
              onClick={submit}
              className="h-16 rounded-b-lg bg-clay px-7 text-[13px] font-bold text-primary-foreground shadow-none hover:bg-clay/90 lg:rounded-l-none lg:rounded-r-lg"
            >
              <Search className="size-4" /> Search flights
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3 text-[10px] font-semibold text-foreground/80 sm:px-5">
            {(["oneway", "round", "multi"] as const).map((mode) => (
              <Button
                key={mode}
                type="button"
                variant="ghost"
                onClick={() => setTrip(mode)}
                className={cn("h-auto gap-1.5 p-0 text-[10px] hover:bg-transparent", trip === mode ? "text-clay" : "text-foreground/75")}
              >
                <span className={cn("size-3 rounded-full border", trip === mode ? "border-clay bg-clay shadow-[inset_0_0_0_2px_var(--card)]" : "border-muted-foreground/60")} />
                {mode === "oneway" ? "One way" : mode === "round" ? "Round trip" : "Multi-city"}
              </Button>
            ))}
            <Button type="button" variant="ghost" className="h-auto p-0 text-[10px] hover:bg-transparent">
              <Plane className="size-3.5 text-primary" /> Direct flights
            </Button>
            <Button type="button" variant="ghost" className="h-auto p-0 text-[10px] hover:bg-transparent">
              <CalendarDays className="size-3.5 text-primary" /> Flexible dates
            </Button>
            <Button type="button" variant="ghost" className="h-auto p-0 text-[10px] hover:bg-transparent">
              <MapPin className="size-3.5 text-primary" /> Nearby airports
            </Button>
            <Button type="button" variant="ghost" className="h-auto p-0 text-[10px] hover:bg-transparent sm:ml-auto">
              <Settings2 className="size-3.5 text-primary" /> More filters <ChevronDown className="size-3" />
            </Button>
          </div>
          {error ? <p className="px-5 pb-3 text-[11px] font-medium text-destructive">{error}</p> : null}
        </>
      ) : tab === "hotels" ? (
        <>
          <div className="relative mx-3 mt-3 grid gap-px overflow-visible rounded-lg bg-border p-px lg:mx-5 lg:grid-cols-[1.3fr_.78fr_.78fr_1fr_auto]">
            <div className="min-w-0 overflow-visible rounded-t-lg bg-card lg:rounded-l-lg lg:rounded-tr-none">
              <div className="min-h-16 px-0 py-2 [&>div>div]:h-12 [&>div>div]:rounded-none [&>div>div]:bg-transparent [&>div>div]:px-3">
                <DestinationField label="Destination" value={hotelDest} onChange={setHotelDest} />
              </div>
            </div>
            <div className="min-w-0 bg-card">
              <DateBox
                label="Check in"
                value={checkin}
                onChange={(value) => {
                  setCheckin(value);
                  if (checkout <= value) {
                    const d = new Date(`${value}T00:00:00`);
                    d.setDate(d.getDate() + 1);
                    setCheckout(d.toISOString().slice(0, 10));
                  }
                }}
              />
            </div>
            <div className="min-w-0 bg-card">
              <DateBox label="Check out" value={checkout} onChange={setCheckout} />
            </div>
            <div className="flex min-h-16 items-center bg-card px-0">
              <div className="w-full [&>div>button]:h-16 [&>div>button]:rounded-none [&>div>button]:bg-transparent [&>div>button]:px-3 [&>div>button_svg]:text-clay">
                <GuestField guests={guests} onChange={setGuests} />
              </div>
            </div>
            <Button
              type="button"
              onClick={submitHotels}
              className="h-16 rounded-b-lg bg-clay px-7 text-[13px] font-bold text-primary-foreground shadow-none hover:bg-clay/90 lg:rounded-l-none lg:rounded-r-lg"
            >
              <Search className="size-4" /> Search hotels
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3 text-[10px] font-semibold text-foreground/80 sm:px-5">
            <Button type="button" variant="ghost" className="h-auto p-0 text-[10px] text-clay hover:bg-transparent">
              <span className="size-3 rounded-full border border-clay bg-clay shadow-[inset_0_0_0_2px_var(--card)]" />
              Hotel stays
            </Button>
            <Button type="button" variant="ghost" className="h-auto p-0 text-[10px] hover:bg-transparent">
              <BedDouble className="size-3.5 text-primary" /> Free cancellation
            </Button>
            <Button type="button" variant="ghost" className="h-auto p-0 text-[10px] hover:bg-transparent">
              <CalendarDays className="size-3.5 text-primary" /> {hotelNights} night{hotelNights > 1 ? "s" : ""}
            </Button>
            <Button type="button" variant="ghost" className="h-auto p-0 text-[10px] hover:bg-transparent">
              <MapPin className="size-3.5 text-primary" /> Popular areas
            </Button>
            <Button type="button" variant="ghost" className="h-auto p-0 text-[10px] hover:bg-transparent sm:ml-auto">
              <Settings2 className="size-3.5 text-primary" /> More filters <ChevronDown className="size-3" />
            </Button>
          </div>
          {error ? <p className="px-5 pb-3 text-[11px] font-medium text-destructive">{error}</p> : null}
        </>
      ) : (
        <>
          <div className="relative mx-3 mt-3 grid gap-px overflow-visible rounded-lg bg-border p-px lg:mx-5 lg:grid-cols-[1.35fr_.9fr_.9fr_1fr_auto]">
            <div className="min-w-0 overflow-visible rounded-t-lg bg-card lg:rounded-l-lg lg:rounded-tr-none">
              <div className="min-h-16 px-0 py-2 [&>div>div]:h-12 [&>div>div]:rounded-none [&>div>div]:bg-transparent [&>div>div]:px-3">
                <DestinationField
                  label={tab === "packages" ? "Package destination" : "Holiday destination"}
                  value={tab === "packages" ? packageDest : holidayDest}
                  onChange={tab === "packages" ? setPackageDest : setHolidayDest}
                />
              </div>
            </div>
            <div className="min-w-0 bg-card">
              <DateBox
                label={tab === "packages" ? "Departure" : "Start date"}
                value={tab === "packages" ? packageDate : holidayDate}
                onChange={tab === "packages" ? setPackageDate : setHolidayDate}
              />
            </div>
            <div className="min-w-0 bg-card">
              <SelectBox
                icon={CalendarDays}
                label="Duration"
                value={tab === "packages" ? packageLength : holidayTheme}
                options={tab === "packages" ? ["3 nights", "4 nights", "5 nights", "7 nights"] : ["Beach escape", "Family holiday", "Honeymoon", "City break"]}
                onChange={tab === "packages" ? setPackageLength : setHolidayTheme}
              />
            </div>
            <div className="min-w-0 bg-card">
              <SelectBox
                icon={Users}
                label="Travellers"
                value={tab === "packages" ? packagePeople : holidayPeople}
                options={tab === "packages" ? ["1 traveller", "2 travellers", "3 travellers", "4 travellers"] : ["Couple", "Family of 4", "Friends group", "Solo traveller"]}
                onChange={tab === "packages" ? setPackagePeople : setHolidayPeople}
              />
            </div>
            <Button
              type="button"
              onClick={() => setError(`${tab === "packages" ? "Packages" : "Holidays"} search will be available soon.`)}
              className="h-16 rounded-b-lg bg-clay px-7 text-[13px] font-bold text-primary-foreground shadow-none hover:bg-clay/90 lg:rounded-l-none lg:rounded-r-lg"
            >
              <Search className="size-4" /> Search {tab}
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3 text-[10px] font-semibold text-foreground/80 sm:px-5">
            <Button type="button" variant="ghost" className="h-auto p-0 text-[10px] text-clay hover:bg-transparent">
              <span className="size-3 rounded-full border border-clay bg-clay shadow-[inset_0_0_0_2px_var(--card)]" />
              {tab === "packages" ? "Flight + hotel" : "Curated trip"}
            </Button>
            <Button type="button" variant="ghost" className="h-auto p-0 text-[10px] hover:bg-transparent">
              <Gift className="size-3.5 text-primary" /> Best value
            </Button>
            <Button type="button" variant="ghost" className="h-auto p-0 text-[10px] hover:bg-transparent">
              <CalendarDays className="size-3.5 text-primary" /> Flexible dates
            </Button>
            <Button type="button" variant="ghost" className="h-auto p-0 text-[10px] hover:bg-transparent">
              <MapPin className="size-3.5 text-primary" /> Guided options
            </Button>
            <Button type="button" variant="ghost" className="h-auto p-0 text-[10px] hover:bg-transparent sm:ml-auto">
              <Settings2 className="size-3.5 text-primary" /> More filters <ChevronDown className="size-3" />
            </Button>
          </div>
          {error ? <p className="px-5 pb-3 text-[11px] font-medium text-destructive">{error}</p> : null}
        </>
      )}
    </div>
  );
}
