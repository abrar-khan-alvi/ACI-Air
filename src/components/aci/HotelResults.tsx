import { useMemo, useState } from "react";
import Image from "next/image";
import {
  BedDouble,
  Check,
  ChevronDown,
  Coffee,
  MapPin,
  Sparkles,
  Star,
  Waves,
  Wifi,
  X,
} from "lucide-react";
import hotel1 from "@/assets/hotel-1.jpg";
import hotel2 from "@/assets/hotel-2.jpg";
import hotel3 from "@/assets/hotel-3.jpg";
import hotel4 from "@/assets/hotel-4.jpg";
import { cn } from "@/lib/utils";
import {
  bdt,
  buildHotels,
  hotelAmenities,
  hotelTotal,
  propertyTypes,
  ratingLabel,
  type Amenity,
  type Guests,
  type Hotel,
  type HotelDestination,
  type PropertyType,
  type RoomOption,
} from "@/lib/hotels";

const images = [hotel1, hotel2, hotel3, hotel4];

type Sort = "recommended" | "price-asc" | "price-desc" | "rating" | "stars";

const sorts: { id: Sort; label: string }[] = [
  { id: "recommended", label: "Recommended" },
  { id: "price-asc", label: "Price: low to high" },
  { id: "price-desc", label: "Price: high to low" },
  { id: "rating", label: "Guest rating" },
  { id: "stars", label: "Star rating" },
];

function Stars({ n }: { n: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: n }, (_, i) => (
        <Star key={i} className="size-3 fill-gold text-gold" />
      ))}
    </span>
  );
}

function RoomRow({
  room,
  nights,
  rooms,
  hotel,
  onSelect,
}: {
  room: RoomOption;
  nights: number;
  rooms: number;
  hotel: Hotel;
  onSelect: (r: RoomOption) => void;
}) {
  const { total } = hotelTotal(hotel, nights, rooms, room.perNight);
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border/70 bg-background p-3 sm:flex-row sm:items-center">
      <div className="min-w-0 flex-1">
        <p className="font-display text-[13px] font-semibold">{room.name}</p>
        <p className="mt-0.5 text-[11.5px] text-muted-foreground">
          {room.bed} · {room.board}
        </p>
        <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px]">
          <span
            className={cn(
              "font-semibold",
              room.refundable ? "text-primary" : "text-muted-foreground",
            )}
          >
            {room.refundable ? "Free cancellation" : "Non-refundable"}
          </span>
          <span className="text-clay">Only {room.left} left</span>
        </p>
      </div>
      <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
        <span className="text-right">
          <span className="block font-display text-[15px] font-bold">{bdt(total)}</span>
          <span className="block text-[10.5px] text-muted-foreground">
            {nights} night{nights > 1 ? "s" : ""} · {rooms} room{rooms > 1 ? "s" : ""} incl. taxes
          </span>
        </span>
        <button
          onClick={() => onSelect(room)}
          className="shrink-0 rounded-lg bg-forest px-4 py-2 font-display text-[12.5px] font-semibold text-primary-foreground shadow-soft transition-transform hover:scale-[1.03]"
        >
          Reserve
        </button>
      </div>
    </div>
  );
}

function HotelCard({
  hotel,
  nights,
  rooms,
  onSelect,
}: {
  hotel: Hotel;
  nights: number;
  rooms: number;
  onSelect: (h: Hotel, r: RoomOption) => void;
}) {
  const [open, setOpen] = useState(false);
  const { total } = hotelTotal(hotel, nights, rooms);
  const save = Math.round((1 - hotel.perNight / hotel.strikePerNight) * 100);

  return (
    <article className="surface-card overflow-hidden rounded-2xl border border-border/60 bg-card shadow-soft transition hover:shadow-float">
      <div className="flex flex-col gap-0 sm:flex-row">
        <div className="relative h-44 shrink-0 sm:h-auto sm:w-56">
          <Image
            src={images[hotel.imageIndex]!}
            alt={`${hotel.name} in ${hotel.city}`}
            fill
            sizes="(max-width: 639px) 100vw, 224px"
            className="size-full object-cover"
          />
          {hotel.badge ? (
            <span className="absolute left-2 top-2 rounded-full bg-card/90 px-2 py-0.5 text-[9.5px] font-semibold uppercase tracking-[0.12em] text-primary backdrop-blur">
              {hotel.badge}
            </span>
          ) : null}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-3 p-3.5 sm:flex-row sm:p-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-display text-[15.5px] font-bold leading-tight">{hotel.name}</h3>
              <Stars n={hotel.stars} />
              <span className="rounded-md bg-secondary px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                {hotel.type}
              </span>
            </div>
            <p className="mt-1 flex items-center gap-1 text-[12px] text-muted-foreground">
              <MapPin className="size-3.5" /> {hotel.area}, {hotel.city} · {hotel.distanceKm} km
              from centre
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {hotel.amenities.slice(0, 4).map((a) => (
                <span
                  key={a}
                  className="inline-flex items-center gap-1 rounded-full bg-secondary/70 px-2 py-0.5 text-[10.5px] font-medium text-foreground/80"
                >
                  {a === "Free WiFi" ? (
                    <Wifi className="size-3 text-primary" />
                  ) : a === "Swimming pool" ? (
                    <Waves className="size-3 text-primary" />
                  ) : a === "Breakfast included" ? (
                    <Coffee className="size-3 text-primary" />
                  ) : (
                    <Sparkles className="size-3 text-primary" />
                  )}
                  {a}
                </span>
              ))}
            </div>
            <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px]">
              {hotel.freeCancellation ? (
                <span className="inline-flex items-center gap-1 font-semibold text-primary">
                  <Check className="size-3.5" /> Free cancellation
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-muted-foreground">
                  <X className="size-3.5" /> Non-refundable rate
                </span>
              )}
              {hotel.breakfast ? (
                <span className="inline-flex items-center gap-1 font-semibold text-primary">
                  <Coffee className="size-3.5" /> Breakfast included
                </span>
              ) : null}
            </p>
          </div>

          <div className="flex shrink-0 items-end justify-between gap-3 border-t border-border/60 pt-3 sm:w-44 sm:flex-col sm:items-end sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0">
            <div className="text-left sm:text-right">
              <span className="inline-flex items-center gap-1.5">
                <span className="rounded-lg bg-forest px-1.5 py-0.5 font-display text-[12px] font-bold text-primary-foreground">
                  {hotel.rating.toFixed(1)}
                </span>
                <span className="text-[11.5px] font-semibold">{ratingLabel(hotel.rating)}</span>
              </span>
              <p className="text-[10.5px] text-muted-foreground">
                {hotel.reviews.toLocaleString()} reviews
              </p>
            </div>
            <div className="text-right">
              {save > 0 ? (
                <p className="text-[11px] text-muted-foreground line-through">
                  {bdt(hotel.strikePerNight)}
                </p>
              ) : null}
              <p className="font-display text-[19px] font-bold leading-none">
                {bdt(hotel.perNight)}
              </p>
              <p className="text-[10.5px] text-muted-foreground">per night</p>
              <p className="mt-0.5 text-[11px] font-semibold text-foreground/80">
                {bdt(total)} total
              </p>
              <button
                onClick={() => setOpen((v) => !v)}
                className="mt-2 inline-flex items-center gap-1 rounded-lg bg-forest px-3.5 py-2 font-display text-[12.5px] font-semibold text-primary-foreground shadow-soft transition-transform hover:scale-[1.03]"
              >
                {open ? "Hide rooms" : "See rooms"}
                <ChevronDown
                  className={cn("size-3.5 transition-transform", open && "rotate-180")}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        className={cn(
          "grid overflow-hidden border-border/60 transition-all duration-500 ease-out",
          open ? "grid-rows-[1fr] border-t opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="min-h-0">
          <div className="grid gap-2 bg-secondary/30 p-3 sm:p-4">
            <p className="flex items-center gap-1.5 font-display text-[12px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              <BedDouble className="size-3.5 text-primary" /> Available rooms
            </p>
            {hotel.rooms.map((r) => (
              <RoomRow
                key={r.id}
                room={r}
                nights={nights}
                rooms={rooms}
                hotel={hotel}
                onSelect={(room) => onSelect(hotel, room)}
              />
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-border/60 py-3 last:border-b-0">
      <p className="mb-2 font-display text-[11.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {title}
      </p>
      {children}
    </div>
  );
}

function Toggle({ on, label, onClick }: { on: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-2 rounded-lg px-1.5 py-1.5 text-left text-[12.5px] transition hover:bg-secondary/60"
    >
      <span
        className={cn(
          "grid size-4 shrink-0 place-items-center rounded-[5px] border transition",
          on ? "border-primary bg-forest text-primary-foreground" : "border-border",
        )}
      >
        {on ? <Check className="size-3" /> : null}
      </span>
      <span className="min-w-0 flex-1 truncate">{label}</span>
    </button>
  );
}

export function HotelResults({
  dest,
  checkin,
  nights,
  guests,
  loading,
  onSelect,
}: {
  dest: HotelDestination;
  checkin: string;
  nights: number;
  guests: Guests;
  loading?: boolean;
  onSelect: (h: Hotel, r: RoomOption) => void;
}) {
  const all = useMemo(() => buildHotels(dest, checkin), [dest, checkin]);
  const maxPrice = useMemo(() => Math.max(...all.map((h) => h.perNight)), [all]);
  const minPrice = useMemo(() => Math.min(...all.map((h) => h.perNight)), [all]);

  const [budget, setBudget] = useState<number | null>(null);
  const [stars, setStars] = useState<number[]>([]);
  const [minRating, setMinRating] = useState(0);
  const [amen, setAmen] = useState<Amenity[]>([]);
  const [types, setTypes] = useState<PropertyType[]>([]);
  const [freeCancel, setFreeCancel] = useState(false);
  const [sort, setSort] = useState<Sort>("recommended");
  const [showFilters, setShowFilters] = useState(false);

  const cap = budget ?? maxPrice;

  const filtered = useMemo(() => {
    const list = all.filter(
      (h) =>
        h.perNight <= cap &&
        (stars.length === 0 || stars.includes(h.stars)) &&
        h.rating >= minRating &&
        (types.length === 0 || types.includes(h.type)) &&
        (!freeCancel || h.freeCancellation) &&
        amen.every((a) => h.amenities.includes(a)),
    );
    const sorted = [...list];
    if (sort === "price-asc") sorted.sort((a, b) => a.perNight - b.perNight);
    else if (sort === "price-desc") sorted.sort((a, b) => b.perNight - a.perNight);
    else if (sort === "rating") sorted.sort((a, b) => b.rating - a.rating);
    else if (sort === "stars") sorted.sort((a, b) => b.stars - a.stars || b.rating - a.rating);
    else
      sorted.sort(
        (a, b) => b.rating * 1000 - b.perNight / 40 - (a.rating * 1000 - a.perNight / 40),
      );
    return sorted;
  }, [all, cap, stars, minRating, types, freeCancel, amen, sort]);

  const reset = () => {
    setBudget(null);
    setStars([]);
    setMinRating(0);
    setAmen([]);
    setTypes([]);
    setFreeCancel(false);
  };

  const filters = (
    <div className="surface-card rounded-2xl border border-border/60 bg-card p-3.5 shadow-soft">
      <div className="flex items-center justify-between">
        <p className="font-display text-[13.5px] font-bold">Filters</p>
        <button
          onClick={reset}
          className="text-[11.5px] font-semibold text-primary hover:underline"
        >
          Reset
        </button>
      </div>

      <Section title={`Budget per night · up to ${bdt(cap)}`}>
        <input
          type="range"
          min={minPrice}
          max={maxPrice}
          step={100}
          value={cap}
          onChange={(e) => setBudget(Number(e.target.value))}
          className="w-full accent-[var(--color-primary)]"
        />
        <div className="flex justify-between text-[10.5px] text-muted-foreground">
          <span>{bdt(minPrice)}</span>
          <span>{bdt(maxPrice)}</span>
        </div>
      </Section>

      <Section title="Star rating">
        <div className="flex flex-wrap gap-1.5">
          {[5, 4, 3].map((s) => (
            <button
              key={s}
              onClick={() =>
                setStars((p) => (p.includes(s) ? p.filter((x) => x !== s) : [...p, s]))
              }
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11.5px] font-semibold transition",
                stars.includes(s)
                  ? "border-primary bg-forest text-primary-foreground"
                  : "border-border hover:bg-secondary",
              )}
            >
              {s}{" "}
              <Star
                className={cn("size-3", stars.includes(s) ? "fill-current" : "fill-gold text-gold")}
              />
            </button>
          ))}
        </div>
      </Section>

      <Section title="Guest rating">
        <div className="flex flex-wrap gap-1.5">
          {[
            { v: 0, l: "Any" },
            { v: 7.5, l: "7.5+" },
            { v: 8.5, l: "8.5+" },
            { v: 9, l: "9+" },
          ].map((o) => (
            <button
              key={o.v}
              onClick={() => setMinRating(o.v)}
              className={cn(
                "rounded-full border px-2.5 py-1 text-[11.5px] font-semibold transition",
                minRating === o.v
                  ? "border-primary bg-forest text-primary-foreground"
                  : "border-border hover:bg-secondary",
              )}
            >
              {o.l}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Property type">
        {propertyTypes.map((t) => (
          <Toggle
            key={t}
            on={types.includes(t)}
            label={t}
            onClick={() => setTypes((p) => (p.includes(t) ? p.filter((x) => x !== t) : [...p, t]))}
          />
        ))}
      </Section>

      <Section title="Policies">
        <Toggle
          on={freeCancel}
          label="Free cancellation"
          onClick={() => setFreeCancel((v) => !v)}
        />
      </Section>

      <Section title="Facilities">
        {hotelAmenities.map((a) => (
          <Toggle
            key={a}
            on={amen.includes(a)}
            label={a}
            onClick={() => setAmen((p) => (p.includes(a) ? p.filter((x) => x !== a) : [...p, a]))}
          />
        ))}
      </Section>
    </div>
  );

  return (
    <div className="grid gap-4 lg:grid-cols-[268px_minmax(0,1fr)]">
      <div className="lg:hidden">
        <button
          onClick={() => setShowFilters((v) => !v)}
          className="flex w-full items-center justify-between rounded-xl border border-border bg-card px-3.5 py-2.5 font-display text-[13px] font-semibold shadow-soft"
        >
          Filters & sorting
          <ChevronDown className={cn("size-4 transition-transform", showFilters && "rotate-180")} />
        </button>
        {showFilters ? <div className="mt-2">{filters}</div> : null}
      </div>
      <aside className="hidden lg:block">
        <div className="sticky top-20">{filters}</div>
      </aside>

      <div className="min-w-0">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-[12.5px] text-muted-foreground">
            <span className="font-display text-[14px] font-bold text-foreground">
              {filtered.length}
            </span>{" "}
            stays in {dest.city} · {nights} night{nights > 1 ? "s" : ""} · {guests.rooms} room
            {guests.rooms > 1 ? "s" : ""}
          </p>
          <div className="no-scrollbar flex gap-1.5 overflow-x-auto rounded-full bg-secondary/70 p-0.5">
            {sorts.map((s) => (
              <button
                key={s.id}
                onClick={() => setSort(s.id)}
                className={cn(
                  "whitespace-nowrap rounded-full px-3 py-1.5 text-[11.5px] font-semibold transition",
                  sort === s.id
                    ? "bg-card shadow-soft"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid gap-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-40 animate-pulse rounded-2xl bg-secondary/60" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="surface-card grid place-items-center gap-2 rounded-2xl p-10 text-center">
            <BedDouble className="size-6 text-primary" />
            <p className="font-display text-[15px] font-semibold">No stays match these filters</p>
            <button
              onClick={reset}
              className="text-[12.5px] font-semibold text-primary hover:underline"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid gap-3">
            {filtered.map((h) => (
              <HotelCard
                key={h.id}
                hotel={h}
                nights={nights}
                rooms={guests.rooms}
                onSelect={onSelect}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
