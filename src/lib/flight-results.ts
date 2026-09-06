import type { Place } from "./airports";

export type Pax = { adults: number; children: number; infants: number };
export type CabinClass = "Economy" | "Premium Economy" | "Business" | "First";

export const cabinClasses: CabinClass[] = ["Economy", "Premium Economy", "Business", "First"];

const cabinMultiplier: Record<CabinClass, number> = {
  Economy: 1,
  "Premium Economy": 1.55,
  Business: 2.7,
  First: 4.1,
};

export function paxTotal(p: Pax) {
  return p.adults + p.children + p.infants;
}

export function paxLabel(p: Pax) {
  const parts = [`${p.adults} adult${p.adults > 1 ? "s" : ""}`];
  if (p.children) parts.push(`${p.children} child${p.children > 1 ? "ren" : ""}`);
  if (p.infants) parts.push(`${p.infants} infant${p.infants > 1 ? "s" : ""}`);
  return parts.join(" · ");
}

export type FlightResult = {
  id: string;
  airline: string;
  code: string;
  depart: string;
  arrive: string;
  duration: string;
  departMin: number;
  durationMin: number;
  stops: number;
  via?: string | undefined;
  cabin: string;
  fromCode: string;
  toCode: string;
  price: number;
  perAdult: number;
  refundable: boolean;
  baggage: string;
};

const carriers = [
  { airline: "ACI Air", code: "AC" },
  { airline: "Singapore Airlines", code: "SQ" },
  { airline: "Emirates", code: "EK" },
  { airline: "Qatar Airways", code: "QR" },
  { airline: "Thai Airways", code: "TG" },
  { airline: "Malaysia Airlines", code: "MH" },
];

const hubs = ["DXB", "DOH", "KUL", "BKK", "IST"];

function seedFrom(text: string) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function clock(minutes: number) {
  const m = ((minutes % 1440) + 1440) % 1440;
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${String(h).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

export function buildFlightResults(
  from: Place,
  to: Place,
  pax: Pax,
  cabin: CabinClass = "Economy",
): FlightResult[] {
  const rand = seedFrom(`${from.code}-${to.code}-${cabin}`);
  const routeHubs = hubs.filter((h) => !from.codes.includes(h) && !to.codes.includes(h));
  return Array.from({ length: 9 }, (_, i) => {
    const carrier = carriers[Math.floor(rand() * carriers.length)]!;
    const departMin = 300 + Math.floor(rand() * 780);
    const r = rand();
    const stops = r > 0.78 ? 2 : r > 0.45 ? 1 : 0;
    const durationMin = 190 + Math.floor(rand() * 260) + stops * 150;
    const fromCode = from.codes[Math.floor(rand() * from.codes.length)] ?? from.codes[0]!;
    const toCode = to.codes[Math.floor(rand() * to.codes.length)] ?? to.codes[0]!;
    const refundable = rand() > 0.5;
    const base = Math.round(
      (32000 + Math.floor(rand() * 46000) - stops * 6000) * cabinMultiplier[cabin],
    );
    const total =
      base * pax.adults +
      Math.round(base * 0.75) * pax.children +
      Math.round(base * 0.1) * pax.infants;
    return {
      id: `${carrier.code}-${i}`,
      airline: carrier.airline,
      code: `${carrier.code} ${100 + Math.floor(rand() * 800)}`,
      depart: clock(departMin),
      arrive: clock(departMin + durationMin),
      duration: `${Math.floor(durationMin / 60)}h ${durationMin % 60}m`,
      departMin: departMin % 1440,
      durationMin,
      stops,
      via: stops ? routeHubs[Math.floor(rand() * routeHubs.length)] : undefined,
      cabin,
      fromCode,
      toCode,
      price: Math.round(total / 100) * 100,
      perAdult: base,
      refundable,
      baggage: cabin === "Economy" ? (refundable ? "30kg" : "20kg") : "40kg",
    };
  }).sort((a, b) => a.price - b.price);
}
