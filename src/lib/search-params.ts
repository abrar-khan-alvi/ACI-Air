import { airports, cityPlace, placeByCode, type Place } from "./airports";
import { cabinClasses, type CabinClass, type Pax } from "./flight-results";

export type TripType = "oneway" | "round" | "multi";

export type FlightSearchParams = {
  trip: TripType;
  legs: string;
  adults: number;
  children: number;
  infants: number;
  cabin: CabinClass;
};

export type ParsedLeg = { from: Place; to: Place; date: string };

export function encodePlace(p: Place): string {
  return p.isCity ? p.codes.join("+") : p.code;
}

export function decodePlace(token: string): Place | null {
  if (!token) return null;
  if (token.includes("+")) {
    const first = token.split("+")[0]!;
    const a = airports.find((x) => x.code === first);
    return a ? cityPlace(a.city, a.country) : null;
  }
  return placeByCode(token) ?? null;
}

export function encodeLegs(legs: { from: Place; to: Place; date: string }[]) {
  return legs.map((l) => `${encodePlace(l.from)}_${encodePlace(l.to)}_${l.date}`).join(",");
}

export function decodeLegs(value: string): ParsedLeg[] {
  return value
    .split(",")
    .map((chunk) => {
      const [f, t, d] = chunk.split("_");
      const from = decodePlace(f ?? "");
      const to = decodePlace(t ?? "");
      if (!from || !to || !d) return null;
      return { from, to, date: d };
    })
    .filter((x): x is ParsedLeg => x !== null);
}

const clampInt = (v: unknown, min: number, max: number, fallback: number) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.round(n)));
};

export function validateFlightSearch(search: Record<string, unknown>): FlightSearchParams {
  const trip = search["trip"];
  const cabin = search["cabin"];
  return {
    trip: trip === "oneway" || trip === "round" || trip === "multi" ? trip : "oneway",
    legs: typeof search["legs"] === "string" ? search["legs"] : "",
    adults: clampInt(search["adults"], 1, 9, 1),
    children: clampInt(search["children"], 0, 8, 0),
    infants: clampInt(search["infants"], 0, 8, 0),
    cabin: cabinClasses.includes(cabin as CabinClass) ? (cabin as CabinClass) : "Economy",
  };
}

export function paxFromParams(p: FlightSearchParams): Pax {
  return { adults: p.adults, children: p.children, infants: p.infants };
}

export function legLabelFor(trip: TripType, index: number) {
  if (trip === "round") return index === 0 ? "Outbound" : "Return";
  if (trip === "multi") return `Flight ${index + 1}`;
  return "One way";
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function prettyDate(d: string) {
  if (!d) return "—";
  const dt = new Date(`${d}T00:00:00`);
  if (Number.isNaN(dt.getTime())) return "—";
  return `${dt.getDate()} ${MONTHS[dt.getMonth()]} ${dt.getFullYear()}`;
}
