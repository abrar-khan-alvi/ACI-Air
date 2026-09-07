import { useState } from "react";
import { useNavigate } from "@/components/navigation";
import { CalendarDays, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { destinationById, nightsBetween, type Guests, type HotelDestination } from "@/lib/hotels";
import { DestinationField } from "./DestinationField";
import { GuestField } from "./GuestField";

function iso(daysFromNow: number) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().slice(0, 10);
}

function DateField({
  label,
  value,
  min,
  hint,
  onChange,
}: {
  label: string;
  value: string;
  min?: string;
  hint?: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex h-12 w-full cursor-pointer items-center gap-2 rounded-lg bg-secondary/70 px-3 transition-colors duration-200 hover:bg-secondary">
      <CalendarDays className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.9} />
      <span className="min-w-0 flex-1">
        <span className="block text-[9.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {label}
          {hint ? (
            <span className="ml-1 normal-case tracking-normal text-primary">{hint}</span>
          ) : null}
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
  initialDest?: string;
  initialCheckin?: string;
  initialCheckout?: string;
  initialGuests?: Guests;
  compact?: boolean;
};

export function HotelSearchForm({
  initialDest,
  initialCheckin,
  initialCheckout,
  initialGuests,
  compact = false,
}: Props) {
  const navigate = useNavigate();
  const [dest, setDest] = useState<HotelDestination | null>(
    destinationById(initialDest ?? "bangkok") ?? destinationById("bangkok"),
  );
  const [checkin, setCheckin] = useState(initialCheckin || iso(7));
  const [checkout, setCheckout] = useState(initialCheckout || iso(11));
  const [guests, setGuests] = useState<Guests>(
    initialGuests ?? { rooms: 1, adults: 2, children: 0 },
  );
  const [error, setError] = useState<string | null>(null);

  const nights = nightsBetween(checkin, checkout);

  const submit = () => {
    if (!dest) return setError("Choose a destination to search stays.");
    if (!checkin || !checkout) return setError("Pick check-in and check-out dates.");
    if (checkout <= checkin) return setError("Check-out must be after check-in.");
    setError(null);
    void navigate({
      to: "/hotels",
      search: {
        dest: dest.id,
        checkin,
        checkout,
        rooms: guests.rooms,
        adults: guests.adults,
        children: guests.children,
      },
    });
  };

  return (
    <div className={cn(compact ? "p-3 sm:p-3.5" : "p-4 sm:px-5")}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <DestinationField value={dest} onChange={setDest} />
          <DateField
            label="Check in"
            value={checkin}
            min={iso(0)}
            onChange={(v) => {
              setCheckin(v);
              if (checkout <= v) {
                const d = new Date(`${v}T00:00:00`);
                d.setDate(d.getDate() + 1);
                setCheckout(d.toISOString().slice(0, 10));
              }
            }}
          />
          <DateField
            label="Check out"
            hint={`${nights} night${nights > 1 ? "s" : ""}`}
            value={checkout}
            min={checkin}
            onChange={setCheckout}
          />
          <GuestField guests={guests} onChange={setGuests} />
        </div>
        <button
          onClick={submit}
          className="flex h-12 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-forest px-8 font-display text-[13.5px] font-semibold text-primary-foreground shadow-soft transition-transform duration-300 hover:scale-[1.02]"
        >
          <Search className="size-4" /> Search
        </button>
      </div>
      {error ? <p className="pt-2 text-[12px] font-medium text-destructive">{error}</p> : null}
    </div>
  );
}
